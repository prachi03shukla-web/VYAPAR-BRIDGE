// B2B AI Assistant & Intelligence Service for Vyapar Bridge
// Universal Multi-Industry Support with Real-time Learning Algorithm

export async function suggestHashtagsWithAI(title?: string, content?: string): Promise<string> {
  const cleanTitle = (title || '').trim();
  const cleanContent = (content || '').trim();

  // 1. Try calling the backend API if available
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch('/api/ai/suggest-hashtags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: cleanTitle, content: cleanContent }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (data && typeof data.hashtags === 'string' && data.hashtags.trim().length > 0) {
          saveLearnedTagsToLocalAlgorithm(data.hashtags);
          return data.hashtags.trim();
        }
      }
    }
  } catch (apiErr) {
    // Graceful fallback to client-side Universal Multi-Industry AI Tag Engine
  }

  // 2. Client-Side Universal B2B Multi-Industry AI Tag Engine
  const fullText = `${cleanTitle} ${cleanContent}`;
  const text = fullText.toLowerCase();
  const generatedTags = new Set<string>();

  // Primary Brand Tag
  generatedTags.add('#VyaparBridge');

  // A. Extract Dimension & Size Specs (e.g., 600x1200, 1200x2400, 2x4, 800x1600, 300x600, 12x18, 110mm, 2inch)
  const sizeMatches = fullText.match(/\b(\d{2,4}\s*x\s*\d{2,4}|\d+\s*x\s*\d+\s*(?:ft|inch|cm|mm)?|\d+\s*mm|\d+\s*inch|\d+\s*ft|\d+\s*kg)\b/gi);
  if (sizeMatches) {
    sizeMatches.forEach(sz => {
      const cleanSz = sz.replace(/\s+/g, '').toUpperCase();
      generatedTags.add(`#Size${cleanSz}`);
    });
  }

  // B. Extract Company / Brand Name Keywords
  const knownBrands = ['kajaria', 'somany', 'sunheart', 'varmora', 'simpolo', 'orientbell', 'jaquar', 'hindware', 'cera', 'supreme', 'finolex', 'tata', 'asianpaints', 'berger', 'pidilite', 'havells', 'anchor', 'polycab', 'astral', 'ashirvad'];
  knownBrands.forEach(b => {
    if (text.includes(b)) {
      generatedTags.add(`#${b.charAt(0).toUpperCase() + b.slice(1)}`);
    }
  });

  // Extract Capitalized Company/Brand Names from Title (e.g. "M/s Somany Ceramics" or "Apex Traders")
  const titleWords = cleanTitle.split(/\s+/);
  titleWords.forEach(w => {
    if (/^[A-Z][a-zA-Z0-9]{2,}$/.test(w) && !['With', 'From', 'This', 'That', 'Best', 'Good', 'Only', 'Your', 'Need', 'Free', 'Sale', 'Post', 'Item', 'Tiles', 'Pipes', 'Saree', 'Steel'].includes(w)) {
      generatedTags.add(`#${w}`);
    }
  });

  // C. Extract Material & Finish Specs
  if (/\bgvt\b/i.test(text)) generatedTags.add('#GVT');
  if (/\bpgvt\b/i.test(text)) generatedTags.add('#PGVT');
  if (/full\s*body/i.test(text)) generatedTags.add('#FullBodyVitrified');
  if (/vitrified/i.test(text)) generatedTags.add('#VitrifiedTiles');
  if (/porcelain/i.test(text)) generatedTags.add('#PorcelainSlabs');
  if (/high\s*gloss|glossy/i.test(text)) generatedTags.add('#HighGlossFinish');
  if (/matt\b|satin/i.test(text)) generatedTags.add('#MattFinish');
  if (/carving/i.test(text)) generatedTags.add('#CarvingTiles');
  if (/sanitary|faucet|basin/i.test(text)) generatedTags.add('#SanitarywareWholesale');
  if (/pvc|hdpe|upvc/i.test(text)) generatedTags.add('#PVCPipesAndFittings');
  if (/plywood|laminate/i.test(text)) generatedTags.add('#PlywoodAndLaminates');
  if (/leather|footwear/i.test(text)) generatedTags.add('#LeatherFootwear');
  if (/saree|fabric|textile/i.test(text)) generatedTags.add('#TextilesWholesale');
  if (/catalogue|brochure|pdf/i.test(text)) generatedTags.add('#ProductCataloguePDF');

  // D. Multi-Industry Category Mapping
  if (/car\b|bike|scooter|vehicle|auto\b|ev\b|suv|sedan/i.test(text)) {
    generatedTags.add('#AutomobileDealers');
    generatedTags.add('#VehicleShowroom');
  }
  if (/transport|logistics|cargo|freight|truck|dumper/i.test(text)) {
    generatedTags.add('#LogisticsServices');
    generatedTags.add('#IndianTransporters');
  }
  if (/plastic|polymer|pvc|moulding/i.test(text)) {
    generatedTags.add('#PlasticsIndustry');
    generatedTags.add('#PolymersAndPlastics');
  }
  if (/software|app|website|saas|billing/i.test(text)) {
    generatedTags.add('#SoftwareSolutions');
    generatedTags.add('#TechIndia');
  }
  if (/hardware|tool|machinery|pump|bearing/i.test(text)) {
    generatedTags.add('#HardwareTools');
    generatedTags.add('#IndustrialMachinery');
  }

  // Include Real-time Learned Tags from previous posts/searches
  const learned = getLearnedTagsFromLocalAlgorithm();
  learned.forEach(t => {
    if (generatedTags.size < 12 && text.includes(t.replace('#', '').toLowerCase())) {
      generatedTags.add(t);
    }
  });

  // Default Universal Fallbacks
  if (generatedTags.size < 5) {
    generatedTags.add('#B2BWholesale');
    generatedTags.add('#IndiaBusiness');
    generatedTags.add('#CommercialHub');
    generatedTags.add('#FactoryDirect');
  }

  const finalTagsStr = Array.from(generatedTags).slice(0, 12).join(' ');
  saveLearnedTagsToLocalAlgorithm(finalTagsStr);
  return finalTagsStr;
}

function getLearnedTagsFromLocalAlgorithm(): string[] {
  try {
    const raw = localStorage.getItem('VyaparBridge_learned_ai_tags');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLearnedTagsToLocalAlgorithm(tagsStr: string) {
  try {
    const existing = new Set<string>(getLearnedTagsFromLocalAlgorithm());
    const newTags = tagsStr.split(/\s+/).filter(t => t.startsWith('#'));
    newTags.forEach(t => existing.add(t));
    localStorage.setItem('VyaparBridge_learned_ai_tags', JSON.stringify(Array.from(existing).slice(-100)));
  } catch (e) {}
}

