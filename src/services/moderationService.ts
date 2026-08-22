// Universal B2B AI Safety & Content Moderation Guardrail for Vyapar Bridge
// Specifically allows: All business promotions, Vyapar/B2B adverts, buyer-seller text, human characters/spokespersons talking business, and background music.
// Strictly blocks: Nudity/Pornography and Abusive language / Gaali-galoch in posts, titles, descriptions, hashtags, or comments.

import { getAdminSettingsFromFirestore } from './firebaseDataSync';

export interface ModerationResult {
  approved: boolean;
  reason?: string;
  userNotice?: string;
  pending_admin_approval?: boolean;
  category?: 'abusive_language' | 'adult_content';
}

const GUARDRAIL_CACHE_KEY = 'VyaparBridge_ai_guardrail_active';

// Check if Guardrail is currently enabled
export async function isGuardrailActive(): Promise<boolean> {
  try {
    const cached = localStorage.getItem(GUARDRAIL_CACHE_KEY);
    if (cached !== null) {
      const isCachedActive = cached !== 'false';
      getAdminSettingsFromFirestore().then(settings => {
        if (settings && typeof settings.aiGuardrailActive === 'boolean') {
          localStorage.setItem(GUARDRAIL_CACHE_KEY, String(settings.aiGuardrailActive));
        }
      }).catch(() => {});
      return isCachedActive;
    }

    const settings = await getAdminSettingsFromFirestore();
    if (settings && typeof settings.aiGuardrailActive === 'boolean') {
      localStorage.setItem(GUARDRAIL_CACHE_KEY, String(settings.aiGuardrailActive));
      return settings.aiGuardrailActive;
    }
  } catch (err) {
    console.warn('Guardrail state fetch note:', err);
  }
  return true; // Default to active for safety
}

// 1. Abusive / Profane Language (Gali Galoch / Offensive Slurs)
const ABUSIVE_PATTERNS = [
  /\b(gaali|chutiya|chutiye|bhenchod|behenchod|bhosad|bhosdike|bhosadi|madarchod|harami|laude|lodu|randi|rande|bastard|fuck|fucker|asshole|bitch|slut|whore|kamina|kamine|suar|harramkhor|kutte)\b/i,
  /\b(hate speech|terrorist|kill yourself)\b/i
];

// 2. Adult / Pornography / Nudity / Explicit Content
const EXPLICIT_PATTERNS = [
  /\b(porn|porno|pornography|nude|naked|nudity|sex|xxx|boobs|cleavage|lingerie|underwear|bra|vagina|penis|dick|pussy|nangi|nanga|sex tape|onlyfans)\b/i
];

/**
 * Universal Content Moderation Function
 * Fast, lightweight check specifically for abusive text (gaali-galoch) and explicit adult nudity.
 * Freely allows all business, adverts, commerce text, characters/spokespersons, and background music.
 */
export async function moderateContentUniversally(params: {
  title?: string;
  content?: string;
  description?: string;
  hashtags?: string;
  mediaType?: string;
  mediaUrl?: string;
  userId?: string | number;
  userRole?: string;
}): Promise<ModerationResult> {
  const { title = '', content = '', description = '', hashtags = '', userRole, userId } = params;

  // 1. Whitelist Master Admin & Super Admins
  const isMasterAdmin = String(userId) === '1' || String(userId) === 'master_admin' || String(userId) === '5503' || userRole === 'admin';
  if (isMasterAdmin) {
    return { approved: true, reason: 'Approved (Admin Whitelist)' };
  }

  // 2. Check if Guardrail is toggled ON
  const active = await isGuardrailActive();
  if (!active) {
    return { approved: true, reason: 'Guardrails Disabled by Administrator' };
  }

  // Only check user-provided text content (do not check media URLs or internal asset paths)
  const combinedUserText = `${title} ${content} ${description} ${hashtags}`.trim();
  if (!combinedUserText) {
    return { approved: true, reason: 'Approved' };
  }

  // 3. Check for Abusive Language / Gali Galoch
  for (const pattern of ABUSIVE_PATTERNS) {
    if (pattern.test(combinedUserText)) {
      return {
        approved: false,
        pending_admin_approval: true,
        reason: '⛔ Gaali-Galoch / Abusive Language Blocked: Inappropriate or offensive language detected.',
        userNotice: '⚠️ Gaali-galoch ya abusive bhasha prohibited hai. Kripya shisht bhasha ka prayog karein.',
        category: 'abusive_language'
      };
    }
  }

  // 4. Check for Adult / Pornographic / Explicit Nudity Patterns
  for (const pattern of EXPLICIT_PATTERNS) {
    if (pattern.test(combinedUserText)) {
      return {
        approved: false,
        pending_admin_approval: true,
        reason: '⛔ Adult Content / Nudity Blocked: Explicit or pornographic content detected.',
        userNotice: '🚫 Pornography ya nude content Vyapar Bridge par strictly prohibited hai.',
        category: 'adult_content'
      };
    }
  }

  // All business advertisements, Vyapar promotions, B2B/B2C reels, music, and character presentations are 100% APPROVED!
  return { approved: true, reason: 'Approved' };
}


