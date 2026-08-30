export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const rawUrl = String(req.query?.url || '').trim();
  if (!rawUrl) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    let cleanUrl = rawUrl.replace(/^https?:\/\/(?:m|web|touch|mbasic)\.facebook\.com/i, 'https://www.facebook.com');
    const isReelUrl = cleanUrl.includes('/reel/') || cleanUrl.includes('/share/r/') || rawUrl.includes('/reel/') || rawUrl.includes('/share/r/');

    // 1. Direct regex numeric ID match
    const directNumMatch = cleanUrl.match(/(?:facebook\.com\/(?:reel|reels|videos|share\/r|share\/v)\/|watch\/?\?(?:.*&)?v=|(?:story_fbid|fbid)=)([0-9]+)/i);
    let directVid = directNumMatch?.[1] || null;

    // 2. Fetch server-side with follow redirects for shortened share tokens (/share/r/..., /share/v/..., fb.watch/...)
    let finalUrl = cleanUrl;
    let html = '';
    let extractedThumbnail = '';
    let extractedTitle = '';

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const response = await fetch(cleanUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8'
        },
        redirect: 'follow',
        signal: controller.signal
      });
      clearTimeout(timeout);

      finalUrl = response.url || cleanUrl;
      html = await response.text();

      const imgMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
                       html.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i);
      if (imgMatch && imgMatch[1]) {
        extractedThumbnail = imgMatch[1].replace(/&amp;/g, '&');
      }

      const titleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i) ||
                         html.match(/"title":"([^"\n]+)"/);
      if (titleMatch && titleMatch[1]) {
        extractedTitle = titleMatch[1];
      }
    } catch (e) {}

    // Extract video ID from redirected URL or HTML
    const finalMatch = finalUrl.match(/(?:facebook\.com\/(?:reel|reels|videos|share\/r|share\/v)\/|watch\/?\?(?:.*&)?v=|(?:story_fbid|fbid)=)([0-9]+)/i);
    const bodyVidMatch = html.match(/"video_id":"(\d+)"/) || 
                         html.match(/"videoId":"(\d+)"/) || 
                         html.match(/<link\s+rel=["']canonical["']\s+href=["'][^"']*\/(?:reel|videos)\/(\d+)/i) ||
                         html.match(/content=["']https:\/\/www\.facebook\.com\/watch\/\?v=(\d+)["']/i) ||
                         html.match(/"fbid":"(\d+)"/);

    const vid = finalMatch?.[1] || bodyVidMatch?.[1] || directVid;
    let resolvedUrl = vid ? `https://www.facebook.com/watch/?v=${vid}` : finalUrl;
    if (isReelUrl && vid) {
      resolvedUrl = `https://www.facebook.com/reel/${vid}/`;
    }

    const embedUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(resolvedUrl)}&show_text=0&autoplay=1&mute=1&allowfullscreen=true`;

    return res.json({
      originalUrl: rawUrl,
      resolvedUrl: resolvedUrl,
      videoId: vid || null,
      thumbnailUrl: extractedThumbnail || null,
      title: extractedTitle || null,
      isReel: isReelUrl,
      aspectRatio: isReelUrl ? '9:16' : '16:9',
      embedUrl: embedUrl
    });
  } catch (err: any) {
    return res.json({
      originalUrl: rawUrl,
      resolvedUrl: rawUrl,
      aspectRatio: '9:16',
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(rawUrl)}&show_text=0&autoplay=1&mute=1&allowfullscreen=true`
    });
  }
}
