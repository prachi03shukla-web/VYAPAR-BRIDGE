// Universal B2B AI Safety & Content Moderation Guardrail for Vyapar Bridge
// Automatically detects non-B2B explicit content, nudity/sensual attire, abusive audio/text, and routes to Admin Review Queue

import { getAdminSettingsFromFirestore } from './firebaseDataSync';

export interface ModerationResult {
  approved: boolean;
  reason?: string;
  userNotice?: string;
  pending_admin_approval?: boolean;
  category?: 'b2b_compliance' | 'abusive_language' | 'adult_content' | 'spam_scam';
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

// B2B Forbidden & Non-Commercial Pattern Lists
const ABUSIVE_PATTERNS = [
  /\b(gaali|chutiya|bhenchod|madarchod|harami|bhosdike|laude|randi|porn|nude|naked|bikini|sensual|boobs|cleavage|lingerie|underwear|bra|sex|xxx|dating|hookup|escort|gambling|satta|matka|casino|dance reel|glamour)\b/i,
  /\b(hate speech|kill yourself|terrorist|scam 100%|free money hack|free crypto|onlyfans|item song|hot video)\b/i
];

const NON_B2B_SELFIE_PATTERNS = [
  /\b(my selfie|personal photo|cute pic|feeling cute|dating profile|looking for gf|looking for bf|tinder|shadi rishta|single boy|single girl)\b/i,
  /\b(instagram model|follow for follow|f4f|like4like|subscribe to my personal|lip sync|romantic status)\b/i
];

/**
 * Universal Content Moderation Function
 * Evaluates text and media metadata for B2B trade compliance.
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

  const combinedText = `${title} ${content} ${description} ${hashtags}`.trim();

  // 3. Whitelist IT Services, Software Solutions, App/Web Development & B2B Branding Logos
  const B2B_TECH_PATTERNS = /\b(software|it service|technology|app development|web development|crm|erp|billing|branding|vyapar bridge|vyaparbridge|logo|digital marketing|agency|tech solution|b2b tool|accounting|software company|code|developer)\b/i;
  if (B2B_TECH_PATTERNS.test(combinedText)) {
    return { approved: true, reason: 'Approved (B2B IT & Software Solution Whitelist)' };
  }

  // 4. Check for Abusive / Adult / Explicit Nudity Patterns
  for (const pattern of ABUSIVE_PATTERNS) {
    if (pattern.test(combinedText)) {
      return {
        approved: false,
        pending_admin_approval: true,
        reason: '⛔ AI Guardrail Flag: Potential non-B2B explicit material or flagged audio/description detected.',
        userNotice: '⚠️ Apki reel ko hamare AI guardrail ne flag kiya hai. Admin review ke baad 24 ghante ke andar approved hone par yeh aapki profile aur feed par dikhne lagegi.',
        category: 'adult_content'
      };
    }
  }

  // 4. Check for Casual Selfies / Non-B2B Casual Social Posts
  for (const pattern of NON_B2B_SELFIE_PATTERNS) {
    if (pattern.test(combinedText)) {
      return {
        approved: false,
        pending_admin_approval: true,
        reason: '⛔ AI Guardrail: Personal selfies, lip sync reels or non-commercial posts flagged.',
        userNotice: '⚠️ Apki reel ko hamare AI guardrail ne detect kiya hai. Vyapar Bridge kewal commercial B2B trade network hai. Admin review ke baad hi approve hogi.',
        category: 'b2b_compliance'
      };
    }
  }

  // 5. Try Server AI Check if available
  try {
    const res = await fetch('/api/ai/moderate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: combinedText, mediaType, mediaUrl })
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.approved === false) {
        return {
          approved: false,
          pending_admin_approval: true,
          reason: data.reason || '⛔ AI Safety Guardrail: Content flagged by automated B2B compliance filter.',
          userNotice: '⚠️ Apki reel ko hamare AI guardrail ne detect kiya hai. Admin review ke baad 24 ghante ke andar approved hone par yeh aapki profile par dikhne lagegi.',
          category: 'b2b_compliance'
        };
      }
    }
  } catch (apiErr) {
    // Fallback: client rules pass
  }

  return { approved: true, reason: 'Approved' };
}
