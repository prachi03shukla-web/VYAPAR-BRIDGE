// Universal B2B AI Safety & Content Moderation Guardrail for Vyapar Bridge
// Protects against profanity/abusive language, pornography/nudity, and unverified external links.

import { getAdminSettingsFromFirestore } from './firebaseDataSync';

export interface ModerationResult {
  approved: boolean;
  reason?: string;
  userNotice?: string;
  pending_admin_approval?: boolean;
  category?: 'b2b_compliance' | 'abusive_language' | 'adult_content' | 'spam_scam' | 'external_link';
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
  return true; // Default to active for security
}

// 1. Abusive / Profane Language (Gali Galoch)
const ABUSIVE_PATTERNS = [
  /\b(gaali|chutiya|bhenchod|madarchod|harami|bhosdike|laude|randi|bastard|fuck|asshole|slut|whore|kamina|suar)\b/i,
  /\b(hate speech|terrorist|kill yourself)\b/i
];

// 2. Adult / Pornography / Nudity / Explicit Content
const EXPLICIT_PATTERNS = [
  /\b(porn|porno|nude|naked|bikini|sensual|boobs|cleavage|lingerie|underwear|bra|sex|xxx|dating|hookup|escort|nangi|gandi video|hot video|onlyfans|item song|sex tape)\b/i
];

// 3. External Links & URLs
const LINK_PATTERNS = [
  /https?:\/\/[^\s]+/i,
  /www\.[^\s]+/i,
  /\b[a-zA-Z0-9-]+\.(com|in|org|net|xyz|info|top|site|biz|co|app|apk|online|club|me|tv|cc|io)\b/i,
  /\b(t\.me|telegram\.me|wa\.me|chat\.whatsapp\.com|bit\.ly|tinyurl\.com)\b/i
];

// 4. Gambling / Scam / Financial Fraud
const GAMBLING_SCAM_PATTERNS = [
  /\b(satta|matka|casino|gambling|betting|dream11|win money|free crypto|free money hack|100% scam|double your money)\b/i
];

/**
 * Universal Content Moderation Function
 * Fast, lightweight check for abusive text, adult content, and external link verification.
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
  const { title = '', content = '', description = '', hashtags = '', userRole, userId, mediaType = '', mediaUrl = '' } = params;

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

  const combinedText = `${title} ${content} ${description} ${hashtags} ${mediaUrl}`.trim();

  // 3. Check for Abusive Language / Gali Galoch
  for (const pattern of ABUSIVE_PATTERNS) {
    if (pattern.test(combinedText)) {
      return {
        approved: false,
        pending_admin_approval: true,
        reason: '⛔ Abusive Language Flagged: Inappropriate or offensive words detected.',
        userNotice: '⚠️ Abusive language detect hua hai. Vyapar Bridge ek professional business network hai. Aapka post Admin Review me bhej diya gaya hai.',
        category: 'abusive_language'
      };
    }
  }

  // 4. Check for Adult / Pornographic / Explicit Nudity Patterns
  for (const pattern of EXPLICIT_PATTERNS) {
    if (pattern.test(combinedText)) {
      return {
        approved: false,
        pending_admin_approval: true,
        reason: '⛔ Adult Content Flagged: Nudity, pornography, or explicit content detected.',
        userNotice: '🚫 Pornography / Nudity strictly prohibited hai. Aapka post Admin Review ke liye hold kiya gaya hai.',
        category: 'adult_content'
      };
    }
  }

  // 5. Check for Gambling / Satta / Financial Fraud
  for (const pattern of GAMBLING_SCAM_PATTERNS) {
    if (pattern.test(combinedText)) {
      return {
        approved: false,
        pending_admin_approval: true,
        reason: '⛔ Gambling/Scam Flagged: Unverified betting or scam pattern detected.',
        userNotice: '⏳ Business Safety Verification: Gambling ya unverified financial content detect hua hai. Admin approval ke baad approve hoga.',
        category: 'spam_scam'
      };
    }
  }

  // 6. Check for External Links & Web URLs
  for (const pattern of LINK_PATTERNS) {
    if (pattern.test(combinedText)) {
      return {
        approved: false,
        pending_admin_approval: true,
        reason: '🔍 External Link Detected: External web address requires admin safety clearance.',
        userNotice: '⏳ Business Verification: Aapke post me external link hai. Trusted B2B platform security ke liye hamari team link safety verify karke 24 ghante ke andar approve kar degi.',
        category: 'external_link'
      };
    }
  }

  return { approved: true, reason: 'Approved' };
}

