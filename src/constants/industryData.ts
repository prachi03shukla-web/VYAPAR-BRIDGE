export interface SubCategory {
  id: string;
  name: string;
  hindiName: string;
  description: string;
  tags: string[];
}

export interface IndustryHub {
  id: string;
  name: string;
  shortName: string;
  hindiName: string;
  icon: string;
  badge: string;
  color: string;
  description: string;
  subcategories: SubCategory[];
}

export const ALL_INDUSTRIES: IndustryHub[] = [
  {
    id: 'builders_contractors',
    name: 'Builders, Civil Contractors & Real Estate',
    shortName: 'Builders & Contractors',
    hindiName: 'बिल्डर, सिविल ठेकेदार व रियल एस्टेट',
    icon: '🏗️',
    badge: 'Real Estate & Build Hub',
    color: 'from-amber-600 to-orange-700',
    description: 'Residential apartments, commercial complexes, civil contractors, structural construction & plot projects',
    subcategories: [
      { id: 'all_builders', name: 'All Builders & Contractors', hindiName: 'सभी बिल्डर व ठेकेदार', description: 'Complete building, civil contracting & real estate', tags: ['builder', 'contractor', 'construction', 'real estate', 'building'] },
      { id: 'commercial_buildings', name: 'Commercial Complexes, Malls & Shops', hindiName: 'कमर्शियल मॉल, दुकानें व ऑफिस', description: 'Commercial shops, office spaces, shopping complexes, warehouse construction', tags: ['commercial building', 'shops', 'office', 'mall', 'warehouse'] },
      { id: 'residential_villas_flats', name: 'Apartments, Houses, Villas & Plots', hindiName: 'अपार्टमेंट, फ्लैट्स, विला व प्लॉट्स', description: '2BHK/3BHK flats, luxury villas, gated society residential plots', tags: ['flats', 'apartment', 'villa', 'plot', 'house construction'] },
      { id: 'civil_infra_contracting', name: 'Civil Contracting & Structural Works', hindiName: 'सिविल कॉन्ट्रैक्टिंग व स्ट्रक्चरल कार्य', description: 'RCC frame structures, road work, earthmoving, piling, shuttering', tags: ['civil contractor', 'rcc', 'shuttering', 'infrastructure', 'piling'] },
    ]
  },
  {
    id: 'software_it_electronics',
    name: 'Software, IT, Computers & Mobiles',
    shortName: 'IT, Software & Mobiles',
    hindiName: 'सॉफ्टवेयर, आईटी, कंप्यूटर व मोबाइल व्यापार',
    icon: '💻',
    badge: 'Tech & Digital Hub',
    color: 'from-blue-600 to-indigo-600',
    description: 'SaaS, billing/POS software, mobile app & web development, computers, mobile shops, electronics & gadgets',
    subcategories: [
      { id: 'all_it_tech', name: 'All IT, Software & Electronics', hindiName: 'सभी आईटी, कंप्यूटर व मोबाइल', description: 'Complete software, computers, mobiles and digital services', tags: ['software', 'it', 'computer', 'mobile', 'electronics'] },
      { id: 'billing_pos_erp', name: 'GST Billing, POS & ERP Software', hindiName: 'जीएसटी बिलिंग व ईआरपी सॉफ्टवेयर', description: 'Retail POS, inventory ERP, accounting software', tags: ['billing', 'pos', 'erp', 'accounting', 'gst software'] },
      { id: 'app_web_development', name: 'Websites, Mobile Apps & SaaS Code', hindiName: 'वेबसाइट, मोबाइल ऐप व सॉफ्टवेयर डेवलपमेंट', description: 'Android/iOS apps, E-commerce portals, custom web design', tags: ['app development', 'website', 'web design', 'mobile app', 'saas'] },
      { id: 'computers_laptops_hardware', name: 'Computers, Laptops & IT Hardware', hindiName: 'कंप्यूटर, लैपटॉप व आईटी हार्डवेयर', description: 'Desktop PCs, laptops, servers, printers, computer assembly & parts', tags: ['computer', 'laptop', 'desktop', 'printer', 'pc assembly', 'hardware'] },
      { id: 'mobiles_gadgets_accessories', name: 'Mobile Phones, Accessories & Repair', hindiName: 'मोबाइल, एक्सेसरीज व रिपेयरिंग', description: 'Smartphones, mobile accessories, chargers, ear-buds, mobile repair tools', tags: ['mobile', 'smartphone', 'mobile accessories', 'gadgets', 'repair'] },
      { id: 'electronics_tv_appliances', name: 'Consumer Electronics & Appliances', hindiName: 'इलेक्ट्रॉनिक्स, टीवी व होम एप्लायंसेज', description: 'LED TVs, ACs, refrigerators, washing machines, soundbars', tags: ['electronics', 'led tv', 'ac', 'appliances', 'home electronics'] },
      { id: 'digital_marketing_seo', name: 'Digital Marketing & IT Infrastructure', hindiName: 'डिजिटल मार्केटिंग व आईटी इंफ्रा', description: 'SEO, Google ads, WhatsApp marketing, cloud hosting, CCTV', tags: ['digital marketing', 'seo', 'cctv', 'hosting', 'cloud'] },
    ]
  },
  {
    id: 'automobiles_logistics',
    name: 'Automobiles, Vehicles & Transport Fleet',
    shortName: 'Auto & Transporters',
    hindiName: 'ऑटोमोबाइल, वाहन व ट्रांसपोर्ट लॉजिस्टिक्स',
    icon: '🚗',
    badge: 'Automobile & Logistics Hub',
    color: 'from-cyan-600 to-blue-700',
    description: 'Commercial trucks, preowned cars, two-wheelers, EV electric vehicles, transport fleets & cargo logistics',
    subcategories: [
      { id: 'all_auto_logistics', name: 'All Automobiles & Transporters', hindiName: 'सभी वाहन व ट्रांसपोर्ट', description: 'Trucks, cars, bikes, EVs, transporters and freight', tags: ['auto', 'vehicle', 'truck', 'transport', 'logistics'] },
      { id: 'truck_logistics_fleet', name: 'Truck Transporters & Logistics Services', hindiName: 'ट्रक ट्रांसपोर्ट व माल ढुलाई', description: 'All India truck fleets, cargo carriers, container trailers, freight forwarders', tags: ['transport', 'logistics', 'truck', 'freight', 'cargo', 'carrier'] },
      { id: 'commercial_trucks', name: 'Commercial Trucks & Heavy Loader Vehicles', hindiName: 'कमर्शियल ट्रक, डंपर व लोडर', description: 'Tata, Leyland, Mahindra trucks, dumpers, cargo loaders', tags: ['truck', 'commercial vehicle', 'dumper', 'tempo', 'pickup'] },
      { id: 'passenger_cars', name: 'Cars, SUVs & Preowned Vehicle Dealers', hindiName: 'कार, एसयूवी व सेकेंड हैंड गाड़ियां', description: 'New cars, preowned verified cars, SUV showrooms', tags: ['car', 'suv', 'preowned car', 'second hand car', 'used car'] },
      { id: 'two_wheelers_ev', name: 'Bikes, Scooters & EV Electric Vehicles', hindiName: 'बाइक, स्कूटी व इलेक्ट्रिक व्हीकल', description: 'Electric scooters, motorcycles, EV battery bikes', tags: ['bike', 'scooter', 'ev', 'electric vehicle', 'two wheeler'] },
      { id: 'auto_spare_parts', name: 'Auto Spares, Tyres & Lubricants', hindiName: 'ऑटो स्पेयर पार्ट्स व टायर', description: 'Engine oil, tyres, batteries, brake pads, filters', tags: ['tyre', 'spare parts', 'lubricant', 'engine oil', 'battery'] },
    ]
  },
  {
    id: 'plastics_leather_hardware',
    name: 'Plastics, Polymers, Leather & Hardware',
    shortName: 'Plastics, Leather & Hardware',
    hindiName: 'प्लास्टिक, लेदर, हार्डवेयर व मशीनरी',
    icon: '⚙️',
    badge: 'Industrial & Material Hub',
    color: 'from-purple-600 to-amber-700',
    description: 'Polymer granules, injection molding, leather shoes, jackets, power tools, machinery & steel',
    subcategories: [
      { id: 'polymer_raw_material', name: 'PP, HDPE, LLDPE Granules & Masterbatch', hindiName: 'प्लास्टिक दाना व मास्टरबैच', description: 'Polymer granules, color masterbatches, resins', tags: ['granule', 'hdpe', 'pp', 'masterbatch', 'plastic raw material'] },
      { id: 'injection_molding_containers', name: 'Injection Molding & Plastic Containers', hindiName: 'इंजेक्सन मोल्डिंग व प्लास्टिक डिब्बे', description: 'Plastic crates, buckets, bottles, caps, custom molds', tags: ['injection molding', 'crate', 'container', 'bottle', 'plastic box'] },
      { id: 'shoes_footwear_wholesale', name: 'Formal Shoes, Boots & Slippers', hindiName: 'फॉर्मल लेदर जूते व चप्पल', description: 'Kanpur/Agra leather shoes, sneakers, slippers', tags: ['shoes', 'footwear', 'leather shoe', 'boot', 'slipper'] },
      { id: 'leather_accessories_jackets', name: 'Leather Jackets, Wallets, Bags & Belts', hindiName: 'लेदर जैकेट, वॉलेट व बैग', description: 'Pure leather jackets, laptop bags, wallets, belts', tags: ['jacket', 'wallet', 'bag', 'belt', 'leather accessory'] },
      { id: 'power_tools_hardware', name: 'Power Tools, Hardware & Industrial Machinery', hindiName: 'पावर टूल्स, हार्डवेयर व सीएनसी मशीनें', description: 'Drills, grinders, CNC lathe machines, motors, pumps', tags: ['power tools', 'hardware', 'machinery', 'cnc', 'lathe'] },
    ]
  },
  {
    id: 'tiles_sanitary',
    name: 'Tiles, Ceramics & Sanitaryware',
    shortName: 'Tiles & Bath',
    hindiName: 'टाइल्स, सेनेटरी व बाथवेयर उद्योग',
    icon: '🧱',
    badge: 'Ceramic Hub',
    color: 'from-amber-500 to-orange-600',
    description: 'Vitrified tiles, ceramic slabs, faucets, bath fittings, granite, marble & adhesives',
    subcategories: [
      { id: 'all_tiles', name: 'All Tiles & Sanitary', hindiName: 'सभी उत्पाद', description: 'Complete ceramic and bath products', tags: ['tiles', 'sanitary', 'ceramic', 'bathware'] },
      { id: 'vitrified_tiles', name: 'Vitrified Tiles (GVT/PGVT)', hindiName: 'विट्रिफाइड टाइल्स', description: 'Double charge, PGVT, GVT, nano polished tiles', tags: ['vitrified', 'gvt', 'pgvt', 'double charge', 'slab'] },
      { id: 'ceramic_wall_floor', name: 'Ceramic & Wall Tiles', hindiName: 'सिरेमिक व वॉल टाइल्स', description: 'Digital wall tiles, subway tiles, elevation ceramic', tags: ['ceramic', 'wall tiles', 'elevation', 'kitchen tiles'] },
      { id: 'sanitaryware_ewc', name: 'Sanitaryware & EWCs', hindiName: 'सेनेटरीवेयर व कमोड', description: 'Wall hung EWCs, one piece, basins, urinals', tags: ['sanitary', 'sanitaryware', 'ewc', 'commode', 'basin', 'washbasin'] },
      { id: 'bathware_cp', name: 'Bathware & CP Fittings', hindiName: 'बाथ फिटिंग्स व नल', description: 'Brass faucets, overhead showers, diverters, bath sets', tags: ['bathware', 'faucets', 'taps', 'shower', 'cp fittings', 'diverter'] },
      { id: 'granite_marble', name: 'Granite, Marble & Slabs', hindiName: 'ग्रेनाइट, मार्बल व स्लैब', description: 'Natural granite, Italian marble, quartz countertops', tags: ['granite', 'marble', 'stone', 'quartz', 'countertop'] },
    ]
  },
  {
    id: 'textile_garments',
    name: 'Textile, Garments & Fashion',
    shortName: 'Textile & Fashion',
    hindiName: 'टेक्सटाइल, गारमेंट्स व फैशन उद्योग',
    icon: '👗',
    badge: 'Apparel Hub',
    color: 'from-pink-500 to-rose-600',
    description: "Men's wear, women ethnic fashion, cotton fabrics, yarns, kidswear & garment mills",
    subcategories: [
      { id: 'all_textile', name: 'All Textile & Garments', hindiName: 'सभी परिधान', description: 'Complete garments, fabrics and knitwear', tags: ['textile', 'clothing', 'garment', 'fashion', 'fabric'] },
      { id: 'mens_wear', name: "Men's Wear & Suiting", hindiName: 'मेंस वियर व शूटिंग', description: 'Formal shirts, trousers, denim jeans, blazers, t-shirts', tags: ['mens wear', 'shirt', 'trouser', 'jeans', 't-shirt', 'suit', 'blazer'] },
      { id: 'womens_fashion', name: "Women's Ethnic & Fashion", hindiName: 'महिला परिधान व साड़ियां', description: 'Sarees, kurtis, lehengas, western dresses, dupattas', tags: ['saree', 'kurti', 'lehenga', 'suit', 'women fashion', 'dress', 'ethnic'] },
      { id: 'cotton_fabrics_yarn', name: 'Fabrics, Yarns & Denim', hindiName: 'फैब्रिक, धागे व डेनिम रोल', description: 'Grey fabric, woven rolls, cotton yarn, printed fabric', tags: ['fabric', 'yarn', 'cotton', 'denim', 'cloth roll', 'weaving'] },
    ]
  },
  {
    id: 'grocery_fmcg',
    name: 'Grocery, FMCG & Food Trade',
    shortName: 'Grocery & FMCG',
    hindiName: 'किराना, FMCG व खाद्य व्यापार',
    icon: '🌾',
    badge: 'Mandi & FMCG',
    color: 'from-emerald-500 to-teal-600',
    description: 'Grains, pulses, spices, edible oils, dry fruits, packaged foods & supermart wholesale',
    subcategories: [
      { id: 'all_grocery', name: 'All Grocery & FMCG', hindiName: 'सभी किराना उत्पाद', description: 'Complete staple, food and household trade', tags: ['grocery', 'fmcg', 'kirana', 'food', 'wholesale'] },
      { id: 'staples_grains', name: 'Grains, Rice & Pulses (दाल/चावल)', hindiName: 'अनाज, दाल व चावल', description: 'Basmati rice, wheat, pulses, chana, atta, maida, suji', tags: ['rice', 'wheat', 'dal', 'pulse', 'atta', 'grain', 'chana', 'flour'] },
      { id: 'spices_dryfruits', name: 'Spices & Dry Fruits (मसाले/मेवे)', hindiName: 'मसाले व ड्राई फ्रूट्स', description: 'Cardamom, clove, turmeric, almonds, cashews, raisins', tags: ['spice', 'dry fruits', 'masala', 'kaju', 'badam', 'haldi', 'mirch'] },
    ]
  }
];

// Helper to find industry and subcategory by text or id
export function matchIndustryOrSubcategory(searchText: string): { industry?: IndustryHub; subcategory?: SubCategory } | null {
  if (!searchText) return null;
  const q = searchText.toLowerCase();

  for (const ind of ALL_INDUSTRIES) {
    if (ind.name.toLowerCase().includes(q) || ind.shortName.toLowerCase().includes(q) || ind.id.toLowerCase().includes(q)) {
      return { industry: ind };
    }
    for (const sub of ind.subcategories) {
      if (sub.name.toLowerCase().includes(q) || sub.id.toLowerCase().includes(q) || sub.tags.some(t => q.includes(t) || t.includes(q))) {
        return { industry: ind, subcategory: sub };
      }
    }
  }
  return null;
}

// Flat list of all available categories for dropdowns & selectors
export const ALL_CATEGORY_OPTIONS: string[] = [
  // Builders & Civil Contractors
  'Builders & Civil Contractors (बिल्डर, ठेकेदार व कंस्ट्रक्शन)',
  'Commercial Buildings, Malls & Shops',
  'Residential Apartments, Villas & Plots',
  'Civil Infrastructure, Roads & Structural Works',

  // IT, Software, Computers & Mobiles
  'GST Billing, POS & ERP Software',
  'Websites, Mobile Apps & SaaS Code',
  'Computers, Laptops & IT Hardware',
  'Mobile Phones, Accessories & Repair',
  'Consumer Electronics & Appliances',
  'Digital Marketing & IT Infrastructure',
  
  // Automobiles & Transporters
  'Truck Transporters & Logistics Services',
  'Commercial Trucks & Heavy Loader Vehicles',
  'Cars, SUVs & Preowned Vehicle Dealers',
  'Bikes, Scooters & EV Electric Vehicles',
  'Auto Spares, Tyres & Lubricants',
  
  // Plastics, Polymers, Leather & Hardware
  'PP, HDPE, LLDPE Granules & Masterbatch',
  'Injection Molding & Plastic Containers',
  'Formal Shoes, Boots & Slippers',
  'Leather Jackets, Wallets, Bags & Belts',
  'Power Tools, Hardware & Industrial Machinery',
  'PVC/CPVC Pipes & Fittings',
  'TMT Steel, Sariya & Cement Bags',
  
  // Tiles & Sanitary
  'Vitrified Tiles (GVT/PGVT)',
  'Ceramic & Wall Tiles',
  'Sanitaryware & EWCs',
  'Bathware & CP Fittings',
  'Granite, Marble & Slabs',
  'Tile Adhesives & Grouts',
  
  // Textile & Garments
  "Men's Wear & Suiting",
  "Women's Ethnic & Fashion",
  'Fabrics, Yarns & Denim',
  
  // Grocery & FMCG
  'Grains, Rice & Pulses (दाल/चावल)',
  'Spices & Dry Fruits (मसाले/मेवे)',
  'Edible Oils & Desi Ghee (तेल/घी)',
  'Corrugated Boxes & Cartons',
  'Agro Seeds & Bio Fertilizers'
];
