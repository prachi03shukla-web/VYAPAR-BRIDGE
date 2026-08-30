export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const rawUrl = (req.query?.url as string) || '';
  if (!rawUrl) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    let cleanUrl = rawUrl.replace(/^https?:\/\/(?:m|web|touch|mbasic)\.facebook\.com/i, 'https://www.facebook.com');

    // 1. Direct regex numeric ID match
    const directNumMatch = cleanUrl.match(/(?:facebook\.com\/(?:reel|reels|videos|share\/r|share\/v)\/|watch\/?\?(?:.*&)?v=|(?:story_fbid|fbid)=)([0-9]+)/i);
    if (directNumMatch && directNumMatch[1]) {
      const vid = directNumMatch[1];
      const resolvedUrl = `https://www.facebook.com/watch/?v=${vid}`;
      return res.json({
        resolvedUrl,
        videoId: vid,
        canonicalUrl: resolvedUrl,
        aspectRatio: '9:16',
        embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(resolvedUrl)}&show_text=false&autoplay=1&mute=1&allowfullscreen=true`
      });
    }

    // 2. Fetch server-side to resolve shortened share redirects
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(cleanUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      redirect: 'follow',
      signal: controller.signal
    });
    clearTimeout(timeout);

    const finalUrl = response.url || cleanUrl;
    const finalMatch = finalUrl.match(/(?:facebook\.com\/(?:reel|reels|videos|share\/r|share\/v)\/|watch\/?\?(?:.*&)?v=|(?:story_fbid|fbid)=)([0-9]+)/i);
    
    if (finalMatch && finalMatch[1]) {
      const vid = finalMatch[1];
      const resolvedUrl = `https://www.facebook.com/watch/?v=${vid}`;
      return res.json({
        resolvedUrl,
        videoId: vid,
        canonicalUrl: resolvedUrl,
        aspectRatio: '9:16',
        embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(resolvedUrl)}&show_text=false&autoplay=1&mute=1&allowfullscreen=true`
      });
    }

    // 3. Check HTML body for video_id
    const html = await response.text();
    const bodyVidMatch = html.match(/"video_id":"(\d+)"/) || html.match(/"videoId":"(\d+)"/) || html.match(/content="https:\/\/www\.facebook\.com\/watch\/\?v=(\d+)"/);
    if (bodyVidMatch && bodyVidMatch[1]) {
      const vid = bodyVidMatch[1];
      const resolvedUrl = `https://www.facebook.com/watch/?v=${vid}`;
      return res.json({
        resolvedUrl,
        videoId: vid,
        canonicalUrl: resolvedUrl,
        aspectRatio: '9:16',
        embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(resolvedUrl)}&show_text=false&autoplay=1&mute=1&allowfullscreen=true`
      });
    }

    const fallbackWatchUrl = cleanUrl.includes('/reel/') 
      ? cleanUrl.replace('/reel/', '/watch/?v=').replace(/\/$/, '')
      : cleanUrl;

    return res.json({
      resolvedUrl: fallbackWatchUrl,
      aspectRatio: '9:16',
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(fallbackWatchUrl)}&show_text=false&autoplay=1&mute=1&allowfullscreen=true`
    });
  } catch (err: any) {
    return res.json({
      resolvedUrl: rawUrl,
      aspectRatio: '9:16',
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(rawUrl)}&show_text=false&autoplay=1&mute=1&allowfullscreen=true`
    });
  }
}
