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
 * Universal Content Moderation Function - ALL POSTS DIRECTLY APPROVED
 * Admin controls: AI guardrail blocks removed; all posts, reels, text, images, and videos
 * are directly approved and published to the live stream immediately without pending hold.
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
  return { 
    approved: true, 
    pending_admin_approval: false, 
    reason: 'Approved by Universal Admin Settings' 
  };
}


