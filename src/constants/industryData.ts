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
    id: 'karigar_technicians',
    name: 'Karigar, Plumbers, Electricians & Skilled Experts',
    shortName: 'Karigar & Technicians (कारीगर व मिस्त्री)',
    hindiName: 'कारीगर, प्लंबर, इलेक्ट्रीशियन, मैकेनिक व कुशल मिस्त्री',
    icon: '🛠️',
    badge: 'Skilled Karigar & Service Hub',
    color: 'from-amber-500 via-orange-600 to-yellow-600',
    description: 'Expert plumbers, electricians, tile mistri, civil thekedar, carpenters, painters, AC mechanics & skilled workers',
    subcategories: [
      { id: 'all_karigar', name: 'All Karigar & Technicians (सभी कारीगर व मिस्त्री)', hindiName: 'सभी कारीगर व सर्विस एक्सपर्ट्स', description: 'Complete skilled tradesmen, plumbers, electricians, mistri and repair experts', tags: ['karigar', 'mistri', 'plumber', 'electrician', 'technician', 'mechanic', 'carpenter', 'painter', 'welder', 'fabricator'] },
      { id: 'plumbers_sanitary_mistri', name: 'Plumbers & Sanitary Fitting Experts (प्लंबर व फिटिंग मिस्त्री)', hindiName: 'प्लंबर, पाइपलाइन व सेनेटरी फिटिंग', description: 'CPVC/PVC pipeline fitting, bathroom bathware, leakage repair, water tank installation', tags: ['plumber', 'pipe fitting', 'sanitary mistri', 'bathroom fitting', 'water tank', 'leakage'] },
      { id: 'electricians_wiremen', name: 'Electricians & Wiring Experts (इलेक्ट्रीशियन व वायरिंग)', hindiName: 'इलेक्ट्रीशियन, हाउस वायरिंग व पैनल', description: 'House wiring, MCB distribution, inverter installation, light fitting, industrial cabling', tags: ['electrician', 'wiring', 'wireman', 'inverter', 'light fitting', 'mcb', 'cable'] },
      { id: 'tile_marble_mistri', name: 'Tile, Marble & Granite Masons (टाइल्स व मार्बल मिस्त्री)', hindiName: 'टाइल्स, मार्बल व ग्रेनाइट ठेकेदार/मिस्त्री', description: 'Vitrified slab laying, chemical pasting, floor polishing, bathroom wall tiles installation', tags: ['tile mistri', 'marble mason', 'granite fitting', 'tile thekedar', 'flooring mason', 'polishing'] },
      { id: 'carpenters_woodwork', name: 'Carpenters & Modular Wood Experts (बढ़ई व लकड़ी कारीगर)', hindiName: 'बढ़ई, मॉड्यूलर किचन व फर्नीचर कारीगर', description: 'Modular kitchen woodwork, door & window frames, sofa repair, ply board work', tags: ['carpenter', 'badhai', 'woodwork', 'furniture maker', 'modular kitchen', 'plywood'] },
      { id: 'painters_polishers', name: 'Painters & Wall Putty Contractors (पेंटर व पुट्टी कारीगर)', hindiName: 'पेंटर, पुट्टी व टेक्सचर कारीगर', description: 'Interior/exterior house painting, POP design, texture art, waterproof coating', tags: ['painter', 'putty', 'wall painting', 'pop design', 'texture', 'waterproofing'] },
      { id: 'ac_appliance_repair', name: 'AC, Fridge & Appliance Technicians (AC व फ्रिज मैकेनिक)', hindiName: 'AC, फ्रिज, RO व होम एप्लायंस मैकेनिक', description: 'AC gas charging & service, refrigerator repair, washing machine, RO water purifier service', tags: ['ac repair', 'ac mechanic', 'fridge repair', 'ro service', 'washing machine mechanic', 'technician'] },
      { id: 'welders_fabricators', name: 'Welders & Iron Shed Fabricators (वेल्डर व फैब्रिकेटर)', hindiName: 'वेल्डर, गेट, ग्रिल व शेड फैब्रिकेशन', description: 'Iron gates, railings, industrial tin sheds, stainless steel fabrication, welding', tags: ['welder', 'fabricator', 'iron gate', 'railing', 'shed', 'steel fabrication'] },
      { id: 'cctv_security_technicians', name: 'CCTV, Network & Security Setup (CCTV व सिक्योरिटी)', hindiName: 'CCTV कैमरा, बायोमेट्रिक व वाईफाई सेटअप', description: 'IP & HD camera installation, biometric attendance, Wi-Fi networking, intercom setup', tags: ['cctv technician', 'camera install', 'biometric', 'networking', 'wifi setup', 'intercom'] }
    ]
  },
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
      { id: 'interior_design_renovation', name: 'Interior Designers & Renovation Contractors', hindiName: 'इंटीरियर डिजाइनर व रिनोवेशन कॉन्ट्रैक्टर', description: 'Turnkey interior design, commercial showroom setup, renovation', tags: ['interior designer', 'renovation', 'home decor', 'architect'] },
    ]
  },
  {
    id: 'medical_healthcare_doctors',
    name: 'Doctors, Clinics, Hospitals & Healthcare',
    shortName: 'Doctors & Healthcare',
    hindiName: 'डॉक्टर, क्लीनिक, अस्पताल व स्वास्थ्य सेवाएं',
    icon: '🏥',
    badge: 'Healthcare Hub',
    color: 'from-emerald-600 to-teal-700',
    description: 'Specialist doctors, multi-speciality clinics, hospitals, pharmacies, diagnostic labs & surgical equipment',
    subcategories: [
      { id: 'all_healthcare', name: 'All Healthcare & Doctors', hindiName: 'सभी डॉक्टर व अस्पताल', description: 'Complete medical consultants, clinics, and hospital services', tags: ['doctor', 'clinic', 'hospital', 'healthcare', 'medical'] },
      { id: 'doctors_specialists', name: 'Doctors & Specialist Clinics', hindiName: 'स्पेशलिस्ट डॉक्टर व ओपीडी क्लीनिक', description: 'MBBS/MD doctors, dentists, orthopedic, pediatricians, skin & eye care', tags: ['doctor', 'physician', 'dentist', 'clinic', 'opd', 'specialist'] },
      { id: 'pharmacy_chemists', name: 'Pharmacy, Chemists & Surgical Goods', hindiName: 'दवा दुकान, केमिस्ट व सर्जिकल सामान', description: 'Allopathic, ayurvedic medicines, surgical supplies, wellness equipment', tags: ['pharmacy', 'chemist', 'medicine', 'surgical', 'medical store'] },
      { id: 'diagnostic_pathology', name: 'Diagnostic Labs & Pathology Centers', hindiName: 'पैथोलॉजी व डायग्नोस्टिक सेंटर', description: 'Blood tests, digital X-Ray, ultrasound, pathology diagnostics', tags: ['pathology', 'diagnostic', 'blood test', 'lab', 'xray'] },
    ]
  },
  {
    id: 'hospitality_hotels_guest_houses',
    name: 'Hotels, Resorts, Guest Houses & Food',
    shortName: 'Hotels & Guest Houses',
    hindiName: 'होटल, गेस्ट हाउस, रिसॉर्ट व खानपान',
    icon: '🏨',
    badge: 'Hospitality Hub',
    color: 'from-rose-600 to-amber-700',
    description: 'Hotels, luxury resorts, budget guest houses, restaurants, cafes, catering services & banquet lawns',
    subcategories: [
      { id: 'all_hospitality', name: 'All Hotels & Hospitality', hindiName: 'सभी होटल व गेस्ट हाउस', description: 'Complete stay, food and event venues', tags: ['hotel', 'resort', 'guest house', 'restaurant', 'banquet'] },
      { id: 'hotels_guest_houses', name: 'Hotels, Resorts & Guest Houses', hindiName: 'होटल, रिसॉर्ट व गेस्ट हाउस', description: 'AC/Non-AC room stays, business hotels, highway motels, tourist resorts', tags: ['hotel', 'guest house', 'resort', 'stay', 'rooms', 'motel'] },
      { id: 'restaurants_catering', name: 'Restaurants, Cafes & Catering Services', hindiName: 'रेस्टोरेंट, ढाबा, कैफे व कैटरर्स', description: 'Family restaurants, fast food cafes, wedding catering, tiffin services', tags: ['restaurant', 'cafe', 'catering', 'food', 'dhaba', 'caterer'] },
      { id: 'banquet_marriage_lawns', name: 'Banquet Halls & Marriage Lawns', hindiName: 'बैंक्वेट हॉल व मैरिज लॉन', description: 'Wedding venues, AC party halls, corporate event spaces', tags: ['banquet hall', 'marriage lawn', 'party hall', 'event venue'] },
    ]
  },
  {
    id: 'garages_auto_services',
    name: 'Automobile Garages, Mechanics & Services',
    shortName: 'Garages & Mechanics',
    hindiName: 'ऑटोमोबाइल गैरेज, मैकेनिक व कार सर्विस',
    icon: '🔧',
    badge: 'Auto Service Hub',
    color: 'from-indigo-600 to-cyan-700',
    description: 'Multi-brand car garages, two-wheeler workshops, commercial truck repair, denting-painting & detailing',
    subcategories: [
      { id: 'all_garages', name: 'All Garages & Mechanics', hindiName: 'सभी गैरेज व मैकेनिक', description: 'Complete auto repair, body shop and maintenance services', tags: ['garage', 'mechanic', 'car service', 'bike repair', 'auto workshop'] },
      { id: 'car_garages_service', name: 'Multi-brand Car Garages & Service Centers', hindiName: 'मल्टी-ब्रांड कार गैरेज व सर्विस', description: 'Engine diagnostics, periodical oil service, suspension, brake overhaul', tags: ['car garage', 'car service', 'car mechanic', 'engine repair'] },
      { id: 'car_wash_detailing', name: 'Car Wash, Detailing & Wheel Alignment', hindiName: 'कार वॉश, डिटेलिंग व व्हीकल अलाइनमेंट', description: 'Ceramic coating, foam wash, dry cleaning, 3D laser wheel alignment', tags: ['car wash', 'detailing', 'wheel alignment', 'coating', 'cleaning'] },
      { id: 'truck_commercial_workshop', name: 'Truck & Heavy Fleet Repair Workshops', hindiName: 'ट्रक, बस व कमर्शियल वर्कशॉप', description: 'Heavy vehicle diesel engine repair, chassis work, hydraulic lift service', tags: ['truck repair', 'commercial workshop', 'diesel mechanic', 'heavy vehicle'] },
      { id: 'two_wheeler_mechanics', name: 'Bike & Scooter Repair Garages', hindiName: 'बाइक व स्कूटी रिपेयरिंग वर्कशॉप', description: 'Two-wheeler tuning, electrical repair, clutch plates, tyre puncture', tags: ['bike mechanic', 'scooter repair', 'two wheeler garage', 'puncture'] },
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
  },
  {
    id: 'photography_media_studios',
    name: 'Photography, Video Production & Studio Services',
    shortName: 'Photography & Studio',
    hindiName: 'फोटोग्राफी, वीडियो शूटिंग व स्टूडियो सेवाएं',
    icon: '📸',
    badge: 'Photography & Studio Hub',
    color: 'from-violet-600 to-fuchsia-700',
    description: 'Commercial product photography, industrial video shoots, drone surveys, camera & studio equipment, video editing & album printing',
    subcategories: [
      { id: 'all_photography', name: 'All Photography & Video Services', hindiName: 'सभी फोटोग्राफी व वीडियो सेवाएं', description: 'Complete commercial product shoots, industrial videos and studio work', tags: ['photography', 'photographer', 'video', 'shoot', 'studio', 'camera', 'photo'] },
      { id: 'product_catalog_photography', name: 'Commercial Product & Catalog Photography', hindiName: 'प्रोडक्ट व कैटलॉग फोटोग्राफी', description: 'Tiles, machinery, shoes, garments, jewelry, e-commerce catalog shoots', tags: ['product photography', 'catalog shoot', 'ecommerce photography', 'tiles photography', 'model shoot', 'photoshoot'] },
      { id: 'industrial_drone_videography', name: 'Industrial, Factory & Drone Videography', hindiName: 'इंडस्ट्रियल, फैक्ट्री व ड्रोन शूट', description: 'Factory walk-through videos, site construction videos, aerial 4K drone shoots', tags: ['industrial video', 'factory shoot', 'drone shoot', 'drone survey', 'site video', 'videography'] },
      { id: 'cameras_lenses_studio_equipment', name: 'Cameras, Lenses, Lighting & Studio Equipment', hindiName: 'कैमरा, लेंस, लाइट व स्टूडियो उपकरण', description: 'DSLRs, mirrorless cameras, cinema lenses, softbox studio lights, gimbals, tripods', tags: ['camera', 'lens', 'studio light', 'softbox', 'gimbal', 'tripod', 'dslr', 'lighting'] },
      { id: 'video_editing_album_printing', name: 'Video Editing, Album Printing & Framing', hindiName: 'वीडियो एडिटिंग, एल्बम प्रिंटिंग व फ्रेमिंग', description: '4K video editing, photobook album printing, LED walls, digital framing, color grading', tags: ['video editing', 'album printing', 'photobook', 'led wall', 'color grading', 'framing', 'album'] },
    ]
  }
];

// Helper to find industry and subcategory by text or id (supports both (searchText) and (industryId, subcategoryId, targetText))
export function matchIndustryOrSubcategory(
  arg1: string,
  arg2?: string,
  arg3?: string
): { industry?: IndustryHub; subcategory?: SubCategory } | boolean | null {
  // If called as matchIndustryOrSubcategory(industryId, subcategoryId, targetText)
  if (arg2 !== undefined && arg3 !== undefined) {
    const industryId = arg1;
    const subcategoryId = arg2;
    const targetText = (arg3 || '').toLowerCase();

    if (industryId === 'all') return true;

    const ind = ALL_INDUSTRIES.find(i => i.id === industryId);
    if (!ind) return true;

    if (subcategoryId === 'all') {
      const indNameMatch = ind.name.toLowerCase();
      const indShortMatch = ind.shortName.toLowerCase();
      if (targetText.includes(indNameMatch) || targetText.includes(indShortMatch) || targetText.includes(ind.id.toLowerCase())) {
        return true;
      }
      return ind.subcategories.some(s => 
        targetText.includes(s.name.toLowerCase()) || 
        targetText.includes(s.id.toLowerCase()) || 
        s.tags.some(t => targetText.includes(t.toLowerCase()))
      );
    }

    const sub = ind.subcategories.find(s => s.id === subcategoryId);
    if (!sub) return true;

    return targetText.includes(sub.name.toLowerCase()) || 
           targetText.includes(sub.id.toLowerCase()) || 
           sub.tags.some(t => targetText.includes(t.toLowerCase()));
  }

  // If called as matchIndustryOrSubcategory(searchText)
  if (!arg1) return null;
  const q = arg1.toLowerCase();

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
  // Karigar, Plumbers, Electricians & Skilled Tradesmen
  'Plumbers & Sanitary Fitting Experts (प्लंबर व फिटिंग मिस्त्री)',
  'Electricians & Wiring Experts (इलेक्ट्रीशियन व वायरिंग)',
  'Tile, Marble & Granite Masons (टाइल्स व मार्बल मिस्त्री)',
  'Carpenters & Modular Wood Experts (बढ़ई व लकड़ी कारीगर)',
  'Painters & Wall Putty Contractors (पेंटर व पुट्टी कारीगर)',
  'AC, Fridge & Appliance Technicians (AC व फ्रिज मैकेनिक)',
  'Welders & Iron Shed Fabricators (वेल्डर व फैब्रिकेटर)',
  'CCTV, Network & Security Setup (CCTV व सिक्योरिटी)',

  // Builders & Civil Contractors
  'Builders & Civil Contractors (बिल्डर, ठेकेदार व कंस्ट्रक्शन)',
  'Commercial Buildings, Malls & Shops',
  'Residential Apartments, Villas & Plots',
  'Civil Infrastructure, Roads & Structural Works',
  'Interior Designers, Plumbers & Electricians',

  // Medical, Healthcare & Doctors
  'Doctors, Clinics & Hospitals (डॉक्टर, क्लीनिक व अस्पताल)',
  'Pharmacy, Chemists & Surgical Equipment (दवा दुकान व सर्जिकल)',
  'Diagnostic Labs & Pathology Centers (पैथोलॉजी व डायग्नोस्टिक)',

  // Hospitality, Hotels & Guest Houses
  'Hotels, Resorts & Guest Houses (होटल, गेस्ट हाउस व रिसॉर्ट)',
  'Restaurants, Cafes & Catering Services (रेस्टोरेंट व कैटरिंग)',
  'Banquet Halls & Marriage Lawns (मैरिज लॉन व बैंक्वेट हॉल)',

  // Automobile Workshop, Garages & Services
  'Automobile Garages, Mechanics & Car Service (गैरेज, मैकेनिक व सर्विस सेंटर)',
  'Car Wash, Detailing & Wheel Alignment (कार वॉश व अलाइनमेंट)',
  'Truck & Commercial Fleet Repair Workshop (ट्रक रिपेयरिंग वर्कशॉप)',

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
  'Agro Seeds & Bio Fertilizers',

  // Photography, Video & Studio Services
  'Commercial Product & Catalog Photography (प्रोडक्ट व कैटलॉग फोटो)',
  'Industrial, Factory & Drone Videography (फैक्ट्री व ड्रोन शूट)',
  'Cameras, Lenses, Lighting & Studio Equipment (कैमरा व स्टूडियो सामान)',
  'Video Editing, Album Printing & Framing (वीडियो एडिटिंग व एल्बम)',

  // General & Service Traders
  'Other Business / Custom Trade Category (अन्य कोई भी व्यापार)'
];
