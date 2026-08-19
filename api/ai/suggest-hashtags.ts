import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title = '', content = '' } = req.body || {};
  if (!title && !content) {
    return res.status(200).json({ hashtags: '#vyaparbridge #tiles #sanitaryware #morbi #ceramic #b2b' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `As an expert B2B Marketing Algorithm for Vyapar Bridge (The Digital Network for Indian B2B Wholesale Industry), analyze this post and generate 6-10 trending, high-conversion hashtags.

Post Title: "${title || 'Untitled'}"
Post Description: "${content || 'No description provided'}"

ALGORITHM GUIDELINES:
1. Include industry-standard tags (e.g., #vyaparbridge, #morbitiles).
2. Use professional B2B tags related to construction, architecture, interior design, and real estate.
3. Focus on industry keywords like #ceramicexports, #sanitaryware, #bathrooms, #floortiles, #walltiles.
4. Keep tags clean and lowercase.
5. Return ONLY the hashtags separated by a single space.
6. Do not include any explanation or extra text.

Example Output: #vyaparbridge #morbitiles #ceramicexports #sanitaryware #floortiles #architecturaldesign #interiordesign #constructionindia`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const aiText = response.text || '';
      if (aiText) {
        const hashtags = aiText
          .trim()
          .replace(/[,.]/g, '')
          .split(/\s+/)
          .filter((tag: string) => tag.startsWith('#'))
          .join(' ');

        if (hashtags) {
          return res.status(200).json({ hashtags });
        }
      }
    } catch (err: any) {
      console.warn('Vercel Gemini Hashtag API error:', err);
    }
  }

  // Fallback B2B Hashtags Generator if Gemini API key not present in Vercel environment
  const combined = `${title} ${content}`.toLowerCase();
  const tags = new Set<string>(['#vyaparbridge']);

  if (/tile|gvt|pgvt|slab|vitrified|porcelain|ceramic|marble|granite/i.test(combined)) {
    tags.add('#morbitiles');
    tags.add('#ceramictiles');
    tags.add('#vitrifiedtiles');
    tags.add('#floortiles');
    tags.add('#walltiles');
  }
  if (/bath|sanitary|toilet|basin|commode|faucet|tap|shower/i.test(combined)) {
    tags.add('#sanitaryware');
    tags.add('#bathroomdesign');
    tags.add('#modernbathrooms');
  }
  if (/factory|wholesale|manufacturer|bulk|export|container/i.test(combined)) {
    tags.add('#b2bwholesale');
    tags.add('#factorydirect');
    tags.add('#ceramicexports');
    tags.add('#indianmanufacturing');
  }
  if (/design|interior|architect|decor|home/i.test(combined)) {
    tags.add('#interiordesign');
    tags.add('#architecturedesign');
    tags.add('#luxuryinteriors');
  }

  tags.add('#b2bnetwork');
  tags.add('#india');
  tags.add('#morbi');

  return res.status(200).json({ hashtags: Array.from(tags).slice(0, 10).join(' ') });
}
