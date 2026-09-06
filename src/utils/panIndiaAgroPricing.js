// ══════════════════════════════════════════════════════════════════════════════
// PAN-INDIA 28-STATES AGRO-PRICING ENGINE & PINCODE/GPS RESOLVER
// Base Baseline: Uttar Pradesh (Central/Purvanchal) = 1.0x (₹1,300/Bigha Tractor)
// ══════════════════════════════════════════════════════════════════════════════

export const PAN_INDIA_REGIONS = [
  // ──────────────── NORTH INDIA ────────────────
  {
    id: 'up_west_ncr',
    state: 'Uttar Pradesh',
    stateHi: 'उत्तर प्रदेश',
    regionNameEn: 'Western UP & NCR Belt',
    regionNameHi: 'पश्चिमी यूपी व एनसीआर बेल्ट',
    zoneGroup: 'North India',
    multiplier: 1.10,
    tag: 'High Mechanization (1.10x)',
    crops: 'Sugarcane, Wheat, Potato, Mustard',
    sampleDistricts: ['Meerut', 'Ghaziabad', 'Noida', 'Muzaffarnagar', 'Saharanpur', 'Bulandshahr', 'Aligarh', 'Mathura', 'Agra', 'Baghpat', 'Hapur', 'Shamli', 'ABES Ghaziabad'],
    pincodePrefixes: ['201', '250', '251', '247', '202', '203', '282', '283', '245'],
    center: { lat: 28.7041, lng: 77.5025 }
  },
  {
    id: 'up_central_purvanchal',
    state: 'Uttar Pradesh',
    stateHi: 'उत्तर प्रदेश',
    regionNameEn: 'Central & Purvanchal Plains',
    regionNameHi: 'मध्य व पूर्वांचल मैदान (आधार 1.0x)',
    zoneGroup: 'North India',
    multiplier: 1.00,
    tag: 'National Baseline (1.0x / ₹1300)',
    crops: 'Paddy, Wheat, Mango, Pulses, Vegetables',
    sampleDistricts: ['Lucknow', 'Varanasi', 'Gorakhpur', 'Ayodhya', 'Prayagraj', 'Kanpur', 'Malihabad', 'Barabanki', 'Sitapur', 'Raebareli', 'Azamgarh', 'Jaunpur', 'Phoenix Palassio Lucknow'],
    pincodePrefixes: ['226', '221', '273', '224', '211', '208', '225', '261', '229', '276'],
    center: { lat: 26.8467, lng: 80.9462 }
  },
  {
    id: 'up_bundelkhand',
    state: 'Uttar Pradesh',
    stateHi: 'उत्तर प्रदेश',
    regionNameEn: 'Bundelkhand UP Zone',
    regionNameHi: 'बुंदेलखंड यूपी राहत क्षेत्र',
    zoneGroup: 'North India',
    multiplier: 0.88,
    tag: 'Relief Subsidy (0.88x)',
    crops: 'Gram, Lentils, Mustard, Sesame, Rainfed Millets',
    sampleDistricts: ['Jhansi', 'Banda', 'Mahoba', 'Hamirpur', 'Lalitpur', 'Jalaun', 'Chitrakoot'],
    pincodePrefixes: ['284', '210', '285'],
    center: { lat: 25.4484, lng: 78.5685 }
  },
  {
    id: 'punjab_malwa',
    state: 'Punjab',
    stateHi: 'पंजाब',
    regionNameEn: 'Central Granary & Malwa Belt',
    regionNameHi: 'केंद्रीय अन्न भंडार व मालवा बेल्ट',
    zoneGroup: 'North India',
    multiplier: 1.18,
    tag: 'Heavy Turbo Fleet (1.18x)',
    crops: 'Wheat, Paddy, Cotton, Kinnow, Maize',
    sampleDistricts: ['Ludhiana', 'Bhatinda', 'Patiala', 'Sangrur', 'Moga', 'Firozpur', 'Faridkot', 'Barnala', 'Mansa', 'Ludhiana Mandi'],
    pincodePrefixes: ['141', '151', '147', '148', '142', '152'],
    center: { lat: 30.9010, lng: 75.8573 }
  },
  {
    id: 'punjab_majha_doaba',
    state: 'Punjab',
    stateHi: 'पंजाब',
    regionNameEn: 'Majha & Doaba Agri Belt',
    regionNameHi: 'मांझा व दोआबा कृषि क्षेत्र',
    zoneGroup: 'North India',
    multiplier: 1.15,
    tag: 'High Intensive (1.15x)',
    crops: 'Basmati Rice, Potato, Sugarcane, Wheat',
    sampleDistricts: ['Amritsar', 'Jalandhar', 'Gurdaspur', 'Hoshiarpur', 'Kapurthala', 'Pathankot', 'Tarn Taran'],
    pincodePrefixes: ['143', '144', '146', '145'],
    center: { lat: 31.6340, lng: 74.8723 }
  },
  {
    id: 'haryana_gt_road',
    state: 'Haryana',
    stateHi: 'हरियाणा',
    regionNameEn: 'GT Road & NCR Granary Belt',
    regionNameHi: 'जीटी रोड व एनसीआर अन्न बेल्ट',
    zoneGroup: 'North India',
    multiplier: 1.16,
    tag: 'Turbo Laser Fleet (1.16x)',
    crops: 'Basmati, Wheat, Sugarcane, Mustard',
    sampleDistricts: ['Karnal', 'Kurukshetra', 'Ambala', 'Panipat', 'Sonipat', 'Yamunanagar', 'Rohtak', 'Karnal Rice Research'],
    pincodePrefixes: ['132', '136', '133', '131', '135', '124'],
    center: { lat: 29.6857, lng: 76.9905 }
  },
  {
    id: 'haryana_south_dry',
    state: 'Haryana',
    stateHi: 'हरियाणा',
    regionNameEn: 'South Haryana Arid Zone',
    regionNameHi: 'दक्षिण हरियाणा शुष्क क्षेत्र',
    zoneGroup: 'North India',
    multiplier: 0.95,
    tag: 'Dryland Farming (0.95x)',
    crops: 'Mustard, Bajra, Guar, Pulses',
    sampleDistricts: ['Hisar', 'Bhiwani', 'Sirsa', 'Mahendragarh', 'Rewari', 'Jhajjar', 'Nuh', 'Charkhi Dadri'],
    pincodePrefixes: ['125', '127', '123'],
    center: { lat: 29.1492, lng: 75.7217 }
  },
  {
    id: 'himachal_horticulture',
    state: 'Himachal Pradesh',
    stateHi: 'हिमाचल प्रदेश',
    regionNameEn: 'Apple & Horticulture Terraced Belts',
    regionNameHi: 'सेब व बागवानी सीढ़ीदार बेल्ट',
    zoneGroup: 'North India',
    multiplier: 1.30,
    tag: 'Mountain Terraced (1.30x)',
    crops: 'Apple, Cherry, Plum, Off-season Vegetables, Maize',
    sampleDistricts: ['Shimla', 'Kullu', 'Mandi', 'Solan', 'Kangra', 'Chamba', 'Kinnaur', 'Sirmaur', 'Shimla Apple Valley'],
    pincodePrefixes: ['171', '175', '173', '176', '177'],
    center: { lat: 31.1048, lng: 77.1734 }
  },
  {
    id: 'uttarakhand_terai',
    state: 'Uttarakhand',
    stateHi: 'उत्तराखंड',
    regionNameEn: 'Terai Plains & Basmati Belt',
    regionNameHi: 'तराई मैदान व बासमती बेल्ट',
    zoneGroup: 'North India',
    multiplier: 1.05,
    tag: 'High Productivity (1.05x)',
    crops: 'Sugarcane, Wheat, Basmati Rice, Mango, Poplar',
    sampleDistricts: ['Udham Singh Nagar', 'Haridwar', 'Dehradun Plains', 'Kashipur', 'Rudrapur', 'Roorkee', 'Dehradun Basmati Belt'],
    pincodePrefixes: ['263', '249', '248'],
    center: { lat: 28.9800, lng: 79.4000 }
  },
  {
    id: 'uttarakhand_hills',
    state: 'Uttarakhand',
    stateHi: 'उत्तराखंड',
    regionNameEn: 'Garhwal & Kumaon Hill Belts',
    regionNameHi: 'गढ़वाल व कुमाऊं पर्वतीय बेल्ट',
    zoneGroup: 'North India',
    multiplier: 1.25,
    tag: 'Hill Slope Farming (1.25x)',
    crops: 'Millets (Mandua), Pulses, Ginger, Organic Fruits',
    sampleDistricts: ['Nainital', 'Almora', 'Pauri Garhwal', 'Tehri Garhwal', 'Pithoragarh', 'Chamoli'],
    pincodePrefixes: ['263', '246', '249', '262'],
    center: { lat: 30.0668, lng: 79.0193 }
  },
  {
    id: 'jk_ladakh',
    state: 'Jammu & Kashmir / Ladakh',
    stateHi: 'जम्मू और कश्मीर / लद्दाख',
    regionNameEn: 'Valley Saffron & Horticulture',
    regionNameHi: 'घाटी केसर व बागवानी क्षेत्र',
    zoneGroup: 'North India',
    multiplier: 1.32,
    tag: 'High Altitude Premium (1.32x)',
    crops: 'Saffron, Apple, Walnut, Almond, Rice, Barley',
    sampleDistricts: ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Pulwama', 'Kathua', 'Udhampur', 'Leh', 'Kargil', 'Pampore Saffron Field'],
    pincodePrefixes: ['190', '180', '192', '193', '184', '194'],
    center: { lat: 34.0837, lng: 74.7973 }
  },
  {
    id: 'rajasthan_east_plains',
    state: 'Rajasthan',
    stateHi: 'राजस्थान',
    regionNameEn: 'Eastern Plains & Canal Belt',
    regionNameHi: 'पूर्वी मैदान व नहर बेल्ट',
    zoneGroup: 'North India',
    multiplier: 1.02,
    tag: 'Canal Irrigated (1.02x)',
    crops: 'Mustard, Wheat, Soybean, Coriander, Garlic, Gram',
    sampleDistricts: ['Jaipur', 'Alwar', 'Bharatpur', 'Kota', 'Ganganagar', 'Hanumangarh', 'Tonk', 'Sawai Madhopur', 'Chittorgarh', 'Kota Mandi'],
    pincodePrefixes: ['302', '301', '321', '324', '335', '304'],
    center: { lat: 26.9124, lng: 75.7873 }
  },
  {
    id: 'rajasthan_west_thar',
    state: 'Rajasthan',
    stateHi: 'राजस्थान',
    regionNameEn: 'Western Thar Arid Zone',
    regionNameHi: 'पश्चिमी थार शुष्क क्षेत्र',
    zoneGroup: 'North India',
    multiplier: 0.85,
    tag: 'Desert Relief Rate (0.85x)',
    crops: 'Bajra, Guar, Moth Bean, Cumin, Isabgol',
    sampleDistricts: ['Jodhpur', 'Bikaner', 'Barmer', 'Jaisalmer', 'Nagaur', 'Pali', 'Jalore', 'Churu'],
    pincodePrefixes: ['342', '334', '344', '345', '341', '306', '331'],
    center: { lat: 26.2389, lng: 73.0243 }
  },

  // ──────────────── WEST INDIA ────────────────
  {
    id: 'mh_sugar_belt',
    state: 'Maharashtra',
    stateHi: 'महाराष्ट्र',
    regionNameEn: 'Western Maharashtra Sugar Belt',
    regionNameHi: 'पश्चिम महाराष्ट्र गन्ना बेल्ट',
    zoneGroup: 'West India',
    multiplier: 1.25,
    tag: 'Heavy Cash Crop (1.25x)',
    crops: 'Sugarcane, Grapes, Pomegranate, Onion, Vegetables',
    sampleDistricts: ['Pune', 'Kolhapur', 'Sangli', 'Satara', 'Solapur', 'Ahmednagar', 'Nashik', 'Baramati Mandi', 'Kothrud Pune', 'Nashik Onion Belt'],
    pincodePrefixes: ['411', '416', '415', '413', '414', '422'],
    center: { lat: 18.5204, lng: 73.8567 }
  },
  {
    id: 'mh_vidarbha_cotton',
    state: 'Maharashtra',
    stateHi: 'महाराष्ट्र',
    regionNameEn: 'Vidarbha Cotton & Soybean Belt',
    regionNameHi: 'विदर्भ कपास व सोयाबीन बेल्ट',
    zoneGroup: 'West India',
    multiplier: 0.95,
    tag: 'Rainfed Cotton (0.95x)',
    crops: 'Cotton, Soybean, Oranges, Tur (Pigeon pea), Gram',
    sampleDistricts: ['Nagpur', 'Amravati', 'Yavatmal', 'Akola', 'Chandrapur', 'Wardha', 'Buldhana', 'Nagpur Orange Mandi'],
    pincodePrefixes: ['440', '444', '445', '442', '443'],
    center: { lat: 21.1458, lng: 79.0882 }
  },
  {
    id: 'mh_marathwada',
    state: 'Maharashtra',
    stateHi: 'महाराष्ट्र',
    regionNameEn: 'Marathwada Pulses & Soybean Zone',
    regionNameHi: 'मराठवाड़ा दलहन व सोयाबीन क्षेत्र',
    zoneGroup: 'West India',
    multiplier: 0.90,
    tag: 'Dryland Relief (0.90x)',
    crops: 'Soybean, Cotton, Jowar, Bajra, Pulses',
    sampleDistricts: ['Chhatrapati Sambhaji Nagar (Aurangabad)', 'Nanded', 'Latur', 'Jalna', 'Parbhani', 'Beed', 'Osmanabad', 'Latur Pulses Hub'],
    pincodePrefixes: ['431', '413'],
    center: { lat: 19.8762, lng: 75.3433 }
  },
  {
    id: 'mh_konkan_coastal',
    state: 'Maharashtra',
    stateHi: 'महाराष्ट्र',
    regionNameEn: 'Konkan Coastal & Mango Orchards',
    regionNameHi: 'कोंकण तटीय व हापुस आम बाग',
    zoneGroup: 'West India',
    multiplier: 1.15,
    tag: 'Coastal Orchard (1.15x)',
    crops: 'Alphonso Mango, Cashew, Paddy, Coconut, Areca nut',
    sampleDistricts: ['Ratnagiri', 'Sindhudurg', 'Raigad', 'Thane Rural', 'Palghar', 'Devgad Mango Farms'],
    pincodePrefixes: ['415', '416', '402', '401'],
    center: { lat: 16.9902, lng: 73.3120 }
  },
  {
    id: 'gujarat_saurashtra',
    state: 'Gujarat',
    stateHi: 'गुजरात',
    regionNameEn: 'Saurashtra Groundnut & Cotton',
    regionNameHi: 'सौराष्ट्र मूंगफली व कपास बेल्ट',
    zoneGroup: 'West India',
    multiplier: 1.14,
    tag: 'Commercial Cash Belt (1.14x)',
    crops: 'Groundnut, Cotton, Sesame, Cumin, Onion',
    sampleDistricts: ['Rajkot', 'Junagadh', 'Amreli', 'Bhavnagar', 'Jamnagar', 'Surendranagar', 'Morbi', 'Gondal Mandi'],
    pincodePrefixes: ['360', '362', '365', '364', '361', '363'],
    center: { lat: 22.3039, lng: 70.8022 }
  },
  {
    id: 'gujarat_central_south',
    state: 'Gujarat',
    stateHi: 'गुजरात',
    regionNameEn: 'Central & South Gujarat Dairy/Sugar',
    regionNameHi: 'मध्य व दक्षिण गुजरात डेयरी/गन्ना बेल्ट',
    zoneGroup: 'West India',
    multiplier: 1.10,
    tag: 'High Dairy & Tech (1.10x)',
    crops: 'Tobacco, Banana, Sugarcane, Paddy, Vegetables',
    sampleDistricts: ['Ahmedabad Rural', 'Vadodara', 'Surat Rural', 'Anand', 'Kheda', 'Bharuch', 'Navsari', 'Valsad', 'Anand Dairy Hub'],
    pincodePrefixes: ['380', '390', '395', '388', '387', '392', '396'],
    center: { lat: 22.5645, lng: 72.9289 }
  },
  {
    id: 'gujarat_kutch',
    state: 'Gujarat',
    stateHi: 'गुजरात',
    regionNameEn: 'Kutch Arid & Horticulture Zone',
    regionNameHi: 'कच्छ शुष्क व बागवानी क्षेत्र',
    zoneGroup: 'West India',
    multiplier: 0.88,
    tag: 'Arid Zone (0.88x)',
    crops: 'Dates, Dragon Fruit, Castor, Cotton, Pomegranate',
    sampleDistricts: ['Bhuj', 'Gandhidham', 'Mandvi', 'Anjar', 'Nakhatrana', 'Rapar'],
    pincodePrefixes: ['370'],
    center: { lat: 23.2420, lng: 69.6669 }
  },
  {
    id: 'goa_coastal',
    state: 'Goa',
    stateHi: 'गोवा',
    regionNameEn: 'Coastal Cashew & Paddy Zone',
    regionNameHi: 'तटीय काजू व धान क्षेत्र',
    zoneGroup: 'West India',
    multiplier: 1.10,
    tag: 'Coastal Eco-Agro (1.10x)',
    crops: 'Cashew, Coconut, Paddy, Areca nut, Spices',
    sampleDistricts: ['North Goa', 'South Goa', 'Ponda', 'Mapusa', 'Margao', 'Bicholim'],
    pincodePrefixes: ['403'],
    center: { lat: 15.2993, lng: 74.1240 }
  },

  // ──────────────── CENTRAL INDIA ────────────────
  {
    id: 'mp_malwa_plateau',
    state: 'Madhya Pradesh',
    stateHi: 'मध्य प्रदेश',
    regionNameEn: 'Malwa Wheat & Soybean Plateau',
    regionNameHi: 'मालवा गेहूं व सोयाबीन पठार',
    zoneGroup: 'Central India',
    multiplier: 1.02,
    tag: 'High Mechanization (1.02x)',
    crops: 'Sharbati Wheat, Soybean, Garlic, Onion, Gram',
    sampleDistricts: ['Indore', 'Ujjain', 'Dewas', 'Dhar', 'Ratlam', 'Mandsaur', 'Neemuch', 'Sehore', 'Indore Mandi'],
    pincodePrefixes: ['452', '456', '455', '454', '457', '458', '466'],
    center: { lat: 22.7196, lng: 75.8577 }
  },
  {
    id: 'mp_narmada_valley',
    state: 'Madhya Pradesh',
    stateHi: 'मध्य प्रदेश',
    regionNameEn: 'Narmada Valley Rich Basins',
    regionNameHi: 'नर्मदा घाटी समृद्ध कछार',
    zoneGroup: 'Central India',
    multiplier: 1.08,
    tag: 'Double-Crop Basin (1.08x)',
    crops: 'Paddy, Wheat, Sugarcane, Pulses, Banana',
    sampleDistricts: ['Hoshangabad (Narmadapuram)', 'Jabalpur', 'Narsinghpur', 'Harda', 'Khargone', 'Khandwa', 'Hoshangabad Wheat Hub'],
    pincodePrefixes: ['461', '482', '487', '461', '451', '450'],
    center: { lat: 22.7519, lng: 77.7289 }
  },
  {
    id: 'mp_bundelkhand_chambal',
    state: 'Madhya Pradesh',
    stateHi: 'मध्य प्रदेश',
    regionNameEn: 'Bundelkhand & Chambal MP',
    regionNameHi: 'बुंदेलखंड व चंबल एमपी',
    zoneGroup: 'Central India',
    multiplier: 0.88,
    tag: 'Rainfed Relief (0.88x)',
    crops: 'Mustard, Gram, Lentils, Wheat, Millets',
    sampleDistricts: ['Gwalior', 'Morena', 'Bhind', 'Sagar', 'Chhatarpur', 'Tikamgarh', 'Damoh', 'Rewa', 'Satna', 'Morena Mustard Yard'],
    pincodePrefixes: ['474', '476', '477', '470', '471', '472', '486', '485'],
    center: { lat: 26.2183, lng: 78.1828 }
  },
  {
    id: 'chhattisgarh_rice_bowl',
    state: 'Chhattisgarh',
    stateHi: 'छत्तीसगढ़',
    regionNameEn: 'Chhattisgarh Rice Bowl Delta',
    regionNameHi: 'छत्तीसगढ़ धान कटोरा मैदान',
    zoneGroup: 'Central India',
    multiplier: 0.95,
    tag: 'Rice Bowl Mechanization (0.95x)',
    crops: 'Paddy, Maize, Kodo-Kutki, Pulses, Vegetables',
    sampleDistricts: ['Raipur', 'Durg', 'Bilaspur', 'Rajnandgaon', 'Dhamtari', 'Mahasamund', 'Janjgir-Champa', 'Raipur Mandi'],
    pincodePrefixes: ['492', '491', '495', '493', '495'],
    center: { lat: 21.2514, lng: 81.6296 }
  },
  {
    id: 'chhattisgarh_bastar',
    state: 'Chhattisgarh',
    stateHi: 'छत्तीसगढ़',
    regionNameEn: 'Bastar Tribal & Forest Agro Belt',
    regionNameHi: 'बस्तर जनजातीय व वन कृषि क्षेत्र',
    zoneGroup: 'Central India',
    multiplier: 0.85,
    tag: 'Subsidized Relief (0.85x)',
    crops: 'Minor Millets, Tuber Crops, Organic Paddy, Spices',
    sampleDistricts: ['Jagdalpur', 'Bastar', 'Kanker', 'Dantewada', 'Sukma', 'Kondagaon'],
    pincodePrefixes: ['494'],
    center: { lat: 19.0740, lng: 82.0080 }
  },

  // ──────────────── EAST INDIA ────────────────
  {
    id: 'bihar_north_gangetic',
    state: 'Bihar',
    stateHi: 'बिहार',
    regionNameEn: 'North Bihar Gangetic & Maize Belt',
    regionNameHi: 'उत्तर बिहार गंगा व मक्का बेल्ट',
    zoneGroup: 'East India',
    multiplier: 0.92,
    tag: 'Maize & Makhana Hub (0.92x)',
    crops: 'Maize, Makhana (Foxnut), Paddy, Wheat, Litchi',
    sampleDistricts: ['Muzaffarpur', 'Darbhanga', 'Samastipur', 'Begusarai', 'Purnia', 'Katihar', 'Saharsa', 'Champaran', 'Muzaffarpur Litchi Farms'],
    pincodePrefixes: ['842', '846', '848', '851', '854', '852', '845'],
    center: { lat: 26.1209, lng: 85.3647 }
  },
  {
    id: 'bihar_south',
    state: 'Bihar',
    stateHi: 'बिहार',
    regionNameEn: 'South Bihar Magadh & Rohtas Granary',
    regionNameHi: 'दक्षिण बिहार मगध व रोहतास क्षेत्र',
    zoneGroup: 'East India',
    multiplier: 0.90,
    tag: 'Canal Paddy Belt (0.90x)',
    crops: 'Paddy, Wheat, Pulses, Potato, Vegetables',
    sampleDistricts: ['Patna', 'Gaya', 'Rohtas (Sasaram)', 'Bhojpur (Ara)', 'Nalanda', 'Aurangabad', 'Buxar', 'Patna Ganga Diara'],
    pincodePrefixes: ['800', '823', '821', '802', '803', '824'],
    center: { lat: 25.5941, lng: 85.1376 }
  },
  {
    id: 'jharkhand_plateau',
    state: 'Jharkhand',
    stateHi: 'झारखंड',
    regionNameEn: 'Chota Nagpur Plateau & Tribal Agriculture',
    regionNameHi: 'छोटा नागपुर पठार व कृषि क्षेत्र',
    zoneGroup: 'East India',
    multiplier: 0.88,
    tag: 'Terraced Smallholder (0.88x)',
    crops: 'Paddy, Vegetables, Mustard, Niger, Pulses',
    sampleDistricts: ['Ranchi', 'Jamshedpur Rural', 'Dhanbad Rural', 'Hazaribagh', 'Bokaro', 'Deoghar', 'Dumka', 'Giridih', 'Ranchi Mandi'],
    pincodePrefixes: ['834', '831', '826', '825', '827', '814', '815'],
    center: { lat: 23.3441, lng: 85.3096 }
  },
  {
    id: 'wb_gangetic_plains',
    state: 'West Bengal',
    stateHi: 'पश्चिम बंगाल',
    regionNameEn: 'Gangetic Paddy, Jute & Potato Plains',
    regionNameHi: 'गंगा मैदान धान, जूट व आलू बेल्ट',
    zoneGroup: 'East India',
    multiplier: 1.05,
    tag: 'Triple-Cropping Hub (1.05x)',
    crops: 'Boro Paddy, Aman Paddy, Jute, Potato, Mustard, Betel',
    sampleDistricts: ['Burdwan (Purba/Paschim Bardhaman)', 'Hooghly', 'Nadia', 'Murshidabad', 'North 24 Parganas', 'South 24 Parganas', 'Medinipur', 'Burdwan Rice Mandi'],
    pincodePrefixes: ['713', '712', '741', '742', '743', '721'],
    center: { lat: 23.2324, lng: 87.8615 }
  },
  {
    id: 'wb_north_tea',
    state: 'West Bengal',
    stateHi: 'पश्चिम बंगाल',
    regionNameEn: 'North Bengal Dooars & Tea/Horticulture',
    regionNameHi: 'उत्तर बंगाल डुअर्स व चाय/बागवानी',
    zoneGroup: 'East India',
    multiplier: 1.12,
    tag: 'Plantation & Hill (1.12x)',
    crops: 'Tea, Pineapple, Ginger, Cardamom, Paddy, Maize',
    sampleDistricts: ['Siliguri', 'Darjeeling', 'Jalpaiguri', 'Alipurduar', 'Cooch Behar', 'Malda', 'Siliguri Tea Hub'],
    pincodePrefixes: ['734', '735', '736', '732'],
    center: { lat: 26.7271, lng: 88.3953 }
  },
  {
    id: 'odisha_coastal_delta',
    state: 'Odisha',
    stateHi: 'ओडिशा',
    regionNameEn: 'Mahanadi Coastal Delta & Paddy Zone',
    regionNameHi: 'महानदी तटीय डेल्टा व धान क्षेत्र',
    zoneGroup: 'East India',
    multiplier: 0.95,
    tag: 'Coastal Delta (0.95x)',
    crops: 'Paddy, Pulses, Coconut, Groundnut, Betel Vine',
    sampleDistricts: ['Cuttack', 'Bhubaneswar Rural', 'Puri', 'Balasore', 'Bhadrak', 'Ganjam', 'Jagatsinghpur', 'Cuttack Delta Mandi'],
    pincodePrefixes: ['753', '751', '752', '756', '760', '754'],
    center: { lat: 20.4625, lng: 85.8828 }
  },
  {
    id: 'odisha_western_inland',
    state: 'Odisha',
    stateHi: 'ओडिशा',
    regionNameEn: 'Western Odisha Rice & Cotton Belt',
    regionNameHi: 'पश्चिम ओडिशा धान व कपास बेल्ट',
    zoneGroup: 'East India',
    multiplier: 0.88,
    tag: 'Inland Irrigated (0.88x)',
    crops: 'Paddy, Cotton, Vegetables, Pulses, Millets',
    sampleDistricts: ['Sambalpur', 'Bargarh', 'Bolangir', 'Kalahandi', 'Koraput', 'Rayagada', 'Bargarh Rice Hub'],
    pincodePrefixes: ['768', '767', '766', '764', '765'],
    center: { lat: 21.4669, lng: 83.9812 }
  },

  // ──────────────── SOUTH INDIA ────────────────
  {
    id: 'ap_coastal_delta',
    state: 'Andhra Pradesh',
    stateHi: 'आंध्र प्रदेश',
    regionNameEn: 'Godavari & Krishna Delta Rice Bowl',
    regionNameHi: 'गोदावरी व कृष्णा डेल्टा अन्न भंडार',
    zoneGroup: 'South India',
    multiplier: 1.15,
    tag: 'High Yield Delta (1.15x)',
    crops: 'Paddy, Sugarcane, Chilli, Tobacco, Aquaculture, Oil Palm',
    sampleDistricts: ['Vijayawada', 'Guntur', 'East Godavari (Kakinada)', 'West Godavari (Eluru)', 'Krishna', 'Visakhapatnam Rural', 'Guntur Chilli Yard'],
    pincodePrefixes: ['520', '522', '533', '534', '521', '530'],
    center: { lat: 16.5062, lng: 80.6480 }
  },
  {
    id: 'ap_rayalaseema',
    state: 'Andhra Pradesh',
    stateHi: 'आंध्र प्रदेश',
    regionNameEn: 'Rayalaseema Dryland & Horticulture',
    regionNameHi: 'रायलसीमा शुष्क व बागवानी क्षेत्र',
    zoneGroup: 'South India',
    multiplier: 0.92,
    tag: 'Dryland Farming (0.92x)',
    crops: 'Groundnut, Cotton, Banana, Mango, Sweet Orange, Pomegranate',
    sampleDistricts: ['Kurnool', 'Anantapur', 'Kadapa (YSR)', 'Chittoor', 'Tirupati Rural', 'Anantapur Groundnut Belt'],
    pincodePrefixes: ['518', '515', '516', '517'],
    center: { lat: 14.6819, lng: 77.6006 }
  },
  {
    id: 'telangana_deccan',
    state: 'Telangana',
    stateHi: 'तेलंगाना',
    regionNameEn: 'Deccan Cotton, Paddy & Chilli Belt',
    regionNameHi: 'दक्कन कपास, धान व मिर्च बेल्ट',
    zoneGroup: 'South India',
    multiplier: 1.10,
    tag: 'Commercial Mechanized (1.10x)',
    crops: 'Cotton, Paddy, Red Chilli, Maize, Turmeric, Soybean',
    sampleDistricts: ['Warangal', 'Karimnagar', 'Khammam', 'Nalgonda', 'Mahabubnagar', 'Suryapet', 'Rangareddy', 'Warangal Cotton Hub'],
    pincodePrefixes: ['506', '505', '507', '508', '509', '501'],
    center: { lat: 17.9689, lng: 79.5941 }
  },
  {
    id: 'telangana_north',
    state: 'Telangana',
    stateHi: 'तेलंगाना',
    regionNameEn: 'North Telangana Agro & Coal Belt',
    regionNameHi: 'उत्तर तेलंगाना कृषि क्षेत्र',
    zoneGroup: 'South India',
    multiplier: 0.98,
    tag: 'Standard Normal (0.98x)',
    crops: 'Turmeric, Soybean, Paddy, Maize, Cotton',
    sampleDistricts: ['Nizamabad', 'Adilabad', 'Mancherial', 'Nirmal', 'Jagityal', 'Nizamabad Turmeric Market'],
    pincodePrefixes: ['503', '504'],
    center: { lat: 18.6725, lng: 78.0941 }
  },
  {
    id: 'karnataka_deccan',
    state: 'Karnataka',
    stateHi: 'कर्नाटक',
    regionNameEn: 'Deccan Plateau Millets & Cotton',
    regionNameHi: 'दक्कन पठार बाजरा व कपास बेल्ट',
    zoneGroup: 'South India',
    multiplier: 1.08,
    tag: 'Tractor Mechanized (1.08x)',
    crops: 'Ragi (Finger Millet), Jowar, Cotton, Groundnut, Maize, Pulses',
    sampleDistricts: ['Bengaluru Rural', 'Mysuru', 'Mandya', 'Tumakuru', 'Hubballi-Dharwad', 'Belagavi', 'Ballari', 'Davangere', 'Mysuru Silk Belt'],
    pincodePrefixes: ['562', '570', '571', '572', '580', '590', '583', '577'],
    center: { lat: 12.9716, lng: 77.5946 }
  },
  {
    id: 'karnataka_malnad_spices',
    state: 'Karnataka',
    stateHi: 'कर्नाटक',
    regionNameEn: 'Malnad Coffee, Areca & Spices',
    regionNameHi: 'मलेनाडू कॉफी, सुपारी व मसाला क्षेत्र',
    zoneGroup: 'South India',
    multiplier: 1.22,
    tag: 'Plantation High-Value (1.22x)',
    crops: 'Coffee, Black Pepper, Cardamom, Areca nut, Ginger, Vanilla',
    sampleDistricts: ['Chikkamagaluru', 'Kodagu (Coorg)', 'Hassan', 'Shivamogga', 'Uttara Kannada', 'Coorg Coffee Estates'],
    pincodePrefixes: ['577', '571', '573', '581'],
    center: { lat: 13.3161, lng: 75.7720 }
  },
  {
    id: 'karnataka_coastal_canara',
    state: 'Karnataka',
    stateHi: 'कर्नाटक',
    regionNameEn: 'Coastal Canara & Coconut Belt',
    regionNameHi: 'तटीय कनारा व नारियल बेल्ट',
    zoneGroup: 'South India',
    multiplier: 1.12,
    tag: 'Coastal Horticulture (1.12x)',
    crops: 'Paddy, Coconut, Cashew, Casuarina, Vegetables',
    sampleDistricts: ['Mangaluru (Dakshina Kannada)', 'Udupi', 'Kundapura', 'Bantwal', 'Puttur'],
    pincodePrefixes: ['575', '576'],
    center: { lat: 12.9141, lng: 74.8560 }
  },
  {
    id: 'tn_cauvery_delta',
    state: 'Tamil Nadu',
    stateHi: 'तमिलनाडु',
    regionNameEn: 'Cauvery Delta Granary & Sugarcane',
    regionNameHi: 'कावेरी डेल्टा अन्न भंडार व गन्ना',
    zoneGroup: 'South India',
    multiplier: 1.12,
    tag: 'Intensive Paddy Delta (1.12x)',
    crops: 'Samba Paddy, Kuruvai Paddy, Sugarcane, Banana, Coconut, Turmeric',
    sampleDistricts: ['Thanjavur', 'Tiruchirappalli', 'Tiruvarur', 'Nagapattinam', 'Cuddalore', 'Mayiladuthurai', 'Thanjavur Granary Hub'],
    pincodePrefixes: ['613', '620', '610', '611', '607'],
    center: { lat: 10.7870, lng: 79.1378 }
  },
  {
    id: 'tn_kongu_south',
    state: 'Tamil Nadu',
    stateHi: 'तमिलनाडु',
    regionNameEn: 'Kongu Agro-Tech & Southern Belts',
    regionNameHi: 'कोंगु एग्रो-टेक व दक्षिणी बेल्ट',
    zoneGroup: 'South India',
    multiplier: 0.95,
    tag: 'Micro-Irrigation Hub (0.95x)',
    crops: 'Cotton, Turmeric, Tapioca, Groundnut, Millets, Poultry Agro',
    sampleDistricts: ['Coimbatore', 'Erode', 'Salem', 'Tiruppur', 'Madurai', 'Dindigul', 'Theni', 'Tirunelveli', 'Coimbatore East', 'Erode Turmeric Hub'],
    pincodePrefixes: ['641', '638', '636', '625', '624', '627'],
    center: { lat: 11.0168, lng: 76.9558 }
  },
  {
    id: 'kerala_highland_spices',
    state: 'Kerala',
    stateHi: 'केरल',
    regionNameEn: 'Highland Spices, Rubber & Plantations',
    regionNameHi: 'पहाड़ी मसाले, रबर व बागान',
    zoneGroup: 'South India',
    multiplier: 1.35,
    tag: 'High Value Plantation (1.35x)',
    crops: 'Natural Rubber, Cardamom, Black Pepper, Tea, Coffee, Nutmeg',
    sampleDistricts: ['Kottayam', 'Idukki', 'Wayanad', 'Pathanamthitta', 'Ernakulam Rural', 'Kottayam Rubber Belt', 'Munnar Tea Hills'],
    pincodePrefixes: ['686', '685', '673', '689', '682'],
    center: { lat: 9.5916, lng: 76.5222 }
  },
  {
    id: 'kerala_coastal_paddy',
    state: 'Kerala',
    stateHi: 'केरल',
    regionNameEn: 'Coastal Coconut, Paddy & Tapioca',
    regionNameHi: 'तटीय नारियल, धान व टैपिओका',
    zoneGroup: 'South India',
    multiplier: 1.15,
    tag: 'Coastal Eco Belt (1.15x)',
    crops: 'Pokkali Rice, Coconut, Tapioca, Banana (Nendran), Spices',
    sampleDistricts: ['Palakkad (Paddy Gap)', 'Alappuzha (Kuttanad)', 'Thrissur', 'Kozhikode', 'Kannur', 'Kollam', 'Thiruvananthapuram Rural', 'Kuttanad Below-Sea Farming'],
    pincodePrefixes: ['678', '688', '680', '673', '670', '691', '695'],
    center: { lat: 10.8505, lng: 76.2711 }
  },

  // ──────────────── NORTH-EAST INDIA & UTS ────────────────
  {
    id: 'assam_brahmaputra',
    state: 'Assam',
    stateHi: 'असम',
    regionNameEn: 'Brahmaputra Valley Paddy & Tea Gardens',
    regionNameHi: 'ब्रह्मपुत्र घाटी धान व चाय बागान',
    zoneGroup: 'North-East & UTs',
    multiplier: 1.05,
    tag: 'Tea & Riverine Plains (1.05x)',
    crops: 'Assam Tea, Ahu/Sali Paddy, Jute, Mustard, Areca nut, Bamboo',
    sampleDistricts: ['Guwahati (Kamrup)', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Sonitpur (Tezpur)', 'Tinsukia', 'Barpeta', 'Guwahati', 'Jorhat Tea Research'],
    pincodePrefixes: ['781', '786', '785', '782', '784', '783'],
    center: { lat: 26.1445, lng: 91.7362 }
  },
  {
    id: 'ne_hilly_organic',
    state: 'Meghalaya, Tripura, Manipur, Nagaland, Mizoram, Arunachal Pradesh, Sikkim',
    stateHi: 'पूर्वोत्तर पर्वतीय जैविक राज्य',
    regionNameEn: 'North-East Hilly & Organic Terraced Zone',
    regionNameHi: 'पूर्वोत्तर पर्वतीय व जैविक सीढ़ीदार क्षेत्र',
    zoneGroup: 'North-East & UTs',
    multiplier: 1.28,
    tag: '100% Organic Terraced (1.28x)',
    crops: 'Large Cardamom, Lakadong Turmeric, Ginger, Kiwi, King Chilli, Organic Pineapple, Orange',
    sampleDistricts: ['Shillong (Meghalaya)', 'Agartala (Tripura)', 'Imphal (Manipur)', 'Kohima (Nagaland)', 'Aizawl (Mizoram)', 'Itanagar (Arunachal)', 'Gangtok (Sikkim)'],
    pincodePrefixes: ['793', '799', '795', '797', '796', '791', '737'],
    center: { lat: 25.5788, lng: 91.8933 }
  },
  {
    id: 'uts_delhi_puducherry_chandigarh',
    state: 'Union Territories (Delhi NCR, Chandigarh, Puducherry, DNH)',
    stateHi: 'केंद्र शासित प्रदेश',
    regionNameEn: 'Union Territories & Urban Peri-Agro',
    regionNameHi: 'केंद्र शासित प्रदेश व शहरी परि-कृषि',
    zoneGroup: 'North-East & UTs',
    multiplier: 1.12,
    tag: 'Peri-Urban Premium (1.12x)',
    crops: 'Hydroponics, Floriculture, High-Tech Vegetables, Dairy',
    sampleDistricts: ['Delhi NCR Peri-Agro', 'Chandigarh Rural', 'Puducherry Farms', 'Dadra and Nagar Haveli', 'Daman and Diu', 'Andaman & Nicobar', 'Lakshadweep'],
    pincodePrefixes: ['110', '160', '605', '396', '744', '682'],
    center: { lat: 28.6139, lng: 77.2090 }
  }
];

// ══════════════════════════════════════════════════════════════════════════════
// POPULAR SEARCHABLE AGRO HUBS, DISTRICTS & LANDMARKS ACROSS ALL 28 STATES
// ══════════════════════════════════════════════════════════════════════════════
export const SEARCHABLE_AGRO_HUBS = [
  // UP & NCR
  { name: 'ABES Engineering College / Crossing Republik, Ghaziabad', city: 'Ghaziabad', state: 'Uttar Pradesh', pincode: '201009', lat: 28.6366, lng: 77.4475, regionId: 'up_west_ncr' },
  { name: 'Phoenix Palassio Mall / Amar Shaheed Path, Lucknow', city: 'Lucknow', state: 'Uttar Pradesh', pincode: '226010', lat: 26.8041, lng: 80.9984, regionId: 'up_central_purvanchal' },
  { name: 'Malihabad Mango Belt (मलिहाबाद)', city: 'Lucknow', state: 'Uttar Pradesh', pincode: '226102', lat: 26.9168, lng: 80.7075, regionId: 'up_central_purvanchal' },
  { name: 'Meerut Sugar Mandi (मेरठ मंडी)', city: 'Meerut', state: 'Uttar Pradesh', pincode: '250002', lat: 28.9845, lng: 77.7064, regionId: 'up_west_ncr' },
  { name: 'Muzaffarnagar Jaggery Hub (गुड़ मंडी)', city: 'Muzaffarnagar', state: 'Uttar Pradesh', pincode: '251001', lat: 29.4727, lng: 77.7085, regionId: 'up_west_ncr' },
  { name: 'Varanasi Gangetic Khet (वाराणसी)', city: 'Varanasi', state: 'Uttar Pradesh', pincode: '221001', lat: 25.3176, lng: 82.9739, regionId: 'up_central_purvanchal' },
  { name: 'Gorakhpur Terai Farms (गोरखपुर)', city: 'Gorakhpur', state: 'Uttar Pradesh', pincode: '273001', lat: 26.7606, lng: 83.3732, regionId: 'up_central_purvanchal' },
  { name: 'Jhansi Bundelkhand Mandi (झांसी)', city: 'Jhansi', state: 'Uttar Pradesh', pincode: '284001', lat: 25.4484, lng: 78.5685, regionId: 'up_bundelkhand' },
  { name: 'Agra Potato Hub (आगरा आलू मंडी)', city: 'Agra', state: 'Uttar Pradesh', pincode: '282001', lat: 27.1767, lng: 78.0081, regionId: 'up_west_ncr' },
  { name: 'Kanpur Rural Farmlands (कानपुर)', city: 'Kanpur', state: 'Uttar Pradesh', pincode: '208001', lat: 26.4499, lng: 80.3319, regionId: 'up_central_purvanchal' },
  { name: 'Ayodhya Saryu Basin (अयोध्या)', city: 'Ayodhya', state: 'Uttar Pradesh', pincode: '224123', lat: 26.7922, lng: 82.1998, regionId: 'up_central_purvanchal' },

  // Punjab & Haryana
  { name: 'Ludhiana Grain Mandi (लुधियाना)', city: 'Ludhiana', state: 'Punjab', pincode: '141001', lat: 30.9010, lng: 75.8573, regionId: 'punjab_malwa' },
  { name: 'Bhatinda Cotton Yard (बठिंडा)', city: 'Bhatinda', state: 'Punjab', pincode: '151001', lat: 30.2110, lng: 74.9455, regionId: 'punjab_malwa' },
  { name: 'Amritsar Basmati Farms (अमृतसर)', city: 'Amritsar', state: 'Punjab', pincode: '143001', lat: 31.6340, lng: 74.8723, regionId: 'punjab_majha_doaba' },
  { name: 'Karnal Rice Research & Mandi (करनाल)', city: 'Karnal', state: 'Haryana', pincode: '132001', lat: 29.6857, lng: 76.9905, regionId: 'haryana_gt_road' },
  { name: 'Hisar Agricultural University (हिसार)', city: 'Hisar', state: 'Haryana', pincode: '125001', lat: 29.1492, lng: 75.7217, regionId: 'haryana_south_dry' },
  { name: 'Sirsa Cotton & Wheat Mandi (सिरसा)', city: 'Sirsa', state: 'Haryana', pincode: '125055', lat: 29.5349, lng: 75.0298, regionId: 'haryana_south_dry' },

  // Himachal & Uttarakhand & J&K
  { name: 'Shimla Apple Valley (शिमला सेब बेल्ट)', city: 'Shimla', state: 'Himachal Pradesh', pincode: '171001', lat: 31.1048, lng: 77.1734, regionId: 'himachal_horticulture' },
  { name: 'Kullu Apple & Fruit Orchards (कुल्लू)', city: 'Kullu', state: 'Himachal Pradesh', pincode: '175101', lat: 31.9579, lng: 77.1095, regionId: 'himachal_horticulture' },
  { name: 'Dehradun Basmati Belt (देहरादून)', city: 'Dehradun', state: 'Uttarakhand', pincode: '248001', lat: 30.3165, lng: 78.0322, regionId: 'uttarakhand_terai' },
  { name: 'Rudrapur / Udham Singh Nagar Terai', city: 'Rudrapur', state: 'Uttarakhand', pincode: '263153', lat: 28.9800, lng: 79.4000, regionId: 'uttarakhand_terai' },
  { name: 'Pampore Saffron Fields / Srinagar (श्रीनगर)', city: 'Srinagar', state: 'Jammu & Kashmir / Ladakh', pincode: '190001', lat: 34.0837, lng: 74.7973, regionId: 'jk_ladakh' },

  // Rajasthan
  { name: 'Kota Mandi & Soybean Yard (कोटा)', city: 'Kota', state: 'Rajasthan', pincode: '324001', lat: 25.2138, lng: 75.8648, regionId: 'rajasthan_east_plains' },
  { name: 'Jaipur Rural Mandi (जयपुर)', city: 'Jaipur', state: 'Rajasthan', pincode: '302001', lat: 26.9124, lng: 75.7873, regionId: 'rajasthan_east_plains' },
  { name: 'Sri Ganganagar Canal Granary (श्रीगंगानगर)', city: 'Sri Ganganagar', state: 'Rajasthan', pincode: '335001', lat: 29.9094, lng: 73.8799, regionId: 'rajasthan_east_plains' },
  { name: 'Jodhpur Cumin & Isabgol Yard (जोधपुर)', city: 'Jodhpur', state: 'Rajasthan', pincode: '342001', lat: 26.2389, lng: 73.0243, regionId: 'rajasthan_west_thar' },

  // Maharashtra & Gujarat & Goa
  { name: 'Kothrud / Baramati Agro Hub, Pune (पुणे)', city: 'Pune', state: 'Maharashtra', pincode: '411038', lat: 18.5074, lng: 73.8077, regionId: 'mh_sugar_belt' },
  { name: 'Baramati Sugar & Grape Hub (बारामती)', city: 'Pune', state: 'Maharashtra', pincode: '413102', lat: 18.1517, lng: 74.5772, regionId: 'mh_sugar_belt' },
  { name: 'Nashik Lasalgaon Onion Yard (नासिक लासलगाव)', city: 'Nashik', state: 'Maharashtra', pincode: '422001', lat: 19.9975, lng: 73.7898, regionId: 'mh_sugar_belt' },
  { name: 'Kolhapur Sugarcane Capital (कोल्हापूर)', city: 'Kolhapur', state: 'Maharashtra', pincode: '416001', lat: 16.7050, lng: 74.2433, regionId: 'mh_sugar_belt' },
  { name: 'Nagpur Orange & Cotton Market (नागपुर)', city: 'Nagpur', state: 'Maharashtra', pincode: '440001', lat: 21.1458, lng: 79.0882, regionId: 'mh_vidarbha_cotton' },
  { name: 'Latur Pulse & Soybean Exchange (लातूर)', city: 'Latur', state: 'Maharashtra', pincode: '413512', lat: 18.4088, lng: 76.5604, regionId: 'mh_marathwada' },
  { name: 'Ratnagiri Devgad Alphonso Farms (रत्नागिरी)', city: 'Ratnagiri', state: 'Maharashtra', pincode: '415612', lat: 16.9902, lng: 73.3120, regionId: 'mh_konkan_coastal' },
  { name: 'Rajkot / Gondal Groundnut Yard (राजकोट)', city: 'Rajkot', state: 'Gujarat', pincode: '360001', lat: 22.3039, lng: 70.8022, regionId: 'gujarat_saurashtra' },
  { name: 'Anand Dairy Capital (आणंद अमूल)', city: 'Anand', state: 'Gujarat', pincode: '388001', lat: 22.5645, lng: 72.9289, regionId: 'gujarat_central_south' },
  { name: 'Surat / Navsari Sugar & Banana Belt (सूरत)', city: 'Surat', state: 'Gujarat', pincode: '395001', lat: 21.1702, lng: 72.8311, regionId: 'gujarat_central_south' },
  { name: 'Ponda / North Goa Cashew Plantation (गोवा)', city: 'Panaji', state: 'Goa', pincode: '403001', lat: 15.4909, lng: 73.8278, regionId: 'goa_coastal' },

  // MP & Chhattisgarh
  { name: 'Indore Mandi & Sharbati Wheat Belt (इंदौर)', city: 'Indore', state: 'Madhya Pradesh', pincode: '452001', lat: 22.7196, lng: 75.8577, regionId: 'mp_malwa_plateau' },
  { name: 'Ujjain Soybean & Wheat Exchange (उज्जैन)', city: 'Ujjain', state: 'Madhya Pradesh', pincode: '456001', lat: 23.1765, lng: 75.7885, regionId: 'mp_malwa_plateau' },
  { name: 'Hoshangabad Narmada Basin (होशंगाबाद)', city: 'Narmadapuram', state: 'Madhya Pradesh', pincode: '461001', lat: 22.7519, lng: 77.7289, regionId: 'mp_narmada_valley' },
  { name: 'Morena Mustard Hub (मुरैना सरसों मंडी)', city: 'Morena', state: 'Madhya Pradesh', pincode: '476001', lat: 26.4950, lng: 77.9940, regionId: 'mp_bundelkhand_chambal' },
  { name: 'Raipur Rice Bowl Mandi (रायपुर)', city: 'Raipur', state: 'Chhattisgarh', pincode: '492001', lat: 21.2514, lng: 81.6296, regionId: 'chhattisgarh_rice_bowl' },
  { name: 'Durg / Bhilai Farm Belt (दुर्ग)', city: 'Durg', state: 'Chhattisgarh', pincode: '491001', lat: 21.1904, lng: 81.2849, regionId: 'chhattisgarh_rice_bowl' },

  // Bihar & Jharkhand & WB & Odisha
  { name: 'Patna Ganga Diara & Mandi (पटना)', city: 'Patna', state: 'Bihar', pincode: '800001', lat: 25.5941, lng: 85.1376, regionId: 'bihar_south' },
  { name: 'Muzaffarpur Litchi & Maize Belt (मुजफ्फरपुर)', city: 'Muzaffarpur', state: 'Bihar', pincode: '842001', lat: 26.1209, lng: 85.3647, regionId: 'bihar_north_gangetic' },
  { name: 'Purnia Maize & Jute Exchange (पूर्णिया)', city: 'Purnia', state: 'Bihar', pincode: '854301', lat: 25.7771, lng: 87.4753, regionId: 'bihar_north_gangetic' },
  { name: 'Ranchi Vegetable Plateau Mandi (रांची)', city: 'Ranchi', state: 'Jharkhand', pincode: '834001', lat: 23.3441, lng: 85.3096, regionId: 'jharkhand_plateau' },
  { name: 'Burdwan Rice Bowl of Bengal (बर्धमान)', city: 'Bardhaman', state: 'West Bengal', pincode: '713101', lat: 23.2324, lng: 87.8615, regionId: 'wb_gangetic_plains' },
  { name: 'Hooghly Potato & Jute Basin (हुगली)', city: 'Hooghly', state: 'West Bengal', pincode: '712101', lat: 22.9039, lng: 88.3968, regionId: 'wb_gangetic_plains' },
  { name: 'Siliguri Tea Hub & Dooars (सिलीगुड़ी)', city: 'Siliguri', state: 'West Bengal', pincode: '734001', lat: 26.7271, lng: 88.3953, regionId: 'wb_north_tea' },
  { name: 'Cuttack / Bhubaneswar Mahanadi Delta (कटक)', city: 'Cuttack', state: 'Odisha', pincode: '753001', lat: 20.4625, lng: 85.8828, regionId: 'odisha_coastal_delta' },
  { name: 'Bargarh Rice Bowl of Odisha (बरगढ़)', city: 'Bargarh', state: 'Odisha', pincode: '768028', lat: 21.3333, lng: 83.6167, regionId: 'odisha_western_inland' },

  // South India
  { name: 'Guntur Chilli Yard (गुंटूर मिर्ची यार्ड)', city: 'Guntur', state: 'Andhra Pradesh', pincode: '522001', lat: 16.3067, lng: 80.4365, regionId: 'ap_coastal_delta' },
  { name: 'Vijayawada Krishna Delta (विजयवाड़ा)', city: 'Vijayawada', state: 'Andhra Pradesh', pincode: '520001', lat: 16.5062, lng: 80.6480, regionId: 'ap_coastal_delta' },
  { name: 'Anantapur Groundnut Yard (अनंतपुर)', city: 'Anantapur', state: 'Andhra Pradesh', pincode: '515001', lat: 14.6819, lng: 77.6006, regionId: 'ap_rayalaseema' },
  { name: 'Warangal Cotton Market (वारंगल)', city: 'Warangal', state: 'Telangana', pincode: '506002', lat: 17.9689, lng: 79.5941, regionId: 'telangana_deccan' },
  { name: 'Nizamabad Turmeric Market (निजामाबाद)', city: 'Nizamabad', state: 'Telangana', pincode: '503001', lat: 18.6725, lng: 78.0941, regionId: 'telangana_north' },
  { name: 'Mysuru Silk & Sugarcane Belt (मैसूरु)', city: 'Mysuru', state: 'Karnataka', pincode: '570001', lat: 12.2958, lng: 76.6394, regionId: 'karnataka_deccan' },
  { name: 'Coorg / Madikeri Coffee Estates (कूर्ग)', city: 'Madikeri', state: 'Karnataka', pincode: '571201', lat: 12.4244, lng: 75.7382, regionId: 'karnataka_malnad_spices' },
  { name: 'Coimbatore East / Kongu Agro Belt (कोयंबटूर)', city: 'Coimbatore', state: 'Tamil Nadu', pincode: '641001', lat: 11.0168, lng: 76.9558, regionId: 'tn_kongu_south' },
  { name: 'Thanjavur Cauvery Paddy Granary (तंजावुर)', city: 'Thanjavur', state: 'Tamil Nadu', pincode: '613001', lat: 10.7870, lng: 79.1378, regionId: 'tn_cauvery_delta' },
  { name: 'Erode Turmeric & Textile Hub (इरोड)', city: 'Erode', state: 'Tamil Nadu', pincode: '638001', lat: 11.3410, lng: 77.7172, regionId: 'tn_kongu_south' },
  { name: 'Kottayam Rubber & Spice Hub (कोट्टायम)', city: 'Kottayam', state: 'Kerala', pincode: '686001', lat: 9.5916, lng: 76.5222, regionId: 'kerala_highland_spices' },
  { name: 'Palakkad Paddy Gap (पालक्काड़)', city: 'Palakkad', state: 'Kerala', pincode: '678001', lat: 10.7867, lng: 76.6548, regionId: 'kerala_coastal_paddy' },

  // North-East & UTs
  { name: 'Guwahati / Brahmaputra Agro Hub (गुवाहाटी)', city: 'Guwahati', state: 'Assam', pincode: '781001', lat: 26.1445, lng: 91.7362, regionId: 'assam_brahmaputra' },
  { name: 'Jorhat Tea Research & Plantations (जोरहाट)', city: 'Jorhat', state: 'Assam', pincode: '785001', lat: 26.7509, lng: 94.2037, regionId: 'assam_brahmaputra' },
  { name: 'Shillong Organic Agro Belt (शिलांग)', city: 'Shillong', state: 'Meghalaya', pincode: '793001', lat: 25.5788, lng: 91.8933, regionId: 'ne_hilly_organic' },
  { name: 'Agartala / Tripura Rubber & Tea (अगरतला)', city: 'Agartala', state: 'Tripura', pincode: '799001', lat: 23.8315, lng: 91.2868, regionId: 'ne_hilly_organic' },
  { name: 'Gangtok Organic Spices (गंगटोक)', city: 'Gangtok', state: 'Sikkim', pincode: '737101', lat: 27.3389, lng: 88.6065, regionId: 'ne_hilly_organic' },
  { name: 'Puducherry Coastal Agro (पुदुच्चेरी)', city: 'Puducherry', state: 'Puducherry', pincode: '605001', lat: 11.9416, lng: 79.8083, regionId: 'uts_delhi_puducherry_chandigarh' },
  { name: 'Chandigarh Agri Peri-Belt (चंडीगढ़)', city: 'Chandigarh', state: 'Chandigarh', pincode: '160017', lat: 30.7333, lng: 76.7794, regionId: 'uts_delhi_puducherry_chandigarh' },
  { name: 'Delhi NCR Green Belt / Alipur (दिल्ली)', city: 'New Delhi', state: 'Delhi', pincode: '110001', lat: 28.6139, lng: 77.2090, regionId: 'uts_delhi_puducherry_chandigarh' }
];

// Helper: Haversine distance in km
function haversineDist(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * DYNAMIC UNIVERSAL LOCATION RESOLVER (GPS COORDS, PINCODE OR SEARCH STRING)
 * ══════════════════════════════════════════════════════════════════════════════
 */
export function resolveLocationToAgroZone(queryOrCoords) {
  // Case 1: GPS Coordinates Object { lat, lng }
  if (typeof queryOrCoords === 'object' && queryOrCoords !== null && 'lat' in queryOrCoords && 'lng' in queryOrCoords) {
    const lat = Number(queryOrCoords.lat);
    const lng = Number(queryOrCoords.lng);

    // Find closest region by centroid distance
    let closestRegion = PAN_INDIA_REGIONS[1]; // default UP central
    let minDistance = Infinity;

    for (const reg of PAN_INDIA_REGIONS) {
      const dist = haversineDist(lat, lng, reg.center.lat, reg.center.lng);
      if (dist < minDistance) {
        minDistance = dist;
        closestRegion = reg;
      }
    }

    // Find closest named hub within that region if possible
    let closestHub = SEARCHABLE_AGRO_HUBS.find(h => h.regionId === closestRegion.id) || {
      name: `${closestRegion.state} Farm Coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      city: closestRegion.sampleDistricts[0] || closestRegion.state,
      state: closestRegion.state,
      pincode: closestRegion.pincodePrefixes[0] + '001',
      lat,
      lng
    };

    return {
      region: closestRegion,
      matchedHub: closestHub,
      state: closestRegion.state,
      district: closestHub.city || closestRegion.sampleDistricts[0],
      address: queryOrCoords.address || closestHub.name,
      lat,
      lng,
      multiplier: closestRegion.multiplier,
      tag: closestRegion.tag,
      zoneGroup: closestRegion.zoneGroup,
      crops: closestRegion.crops,
      isAutoDetected: true
    };
  }

  // Case 2: String query (Search term, Pincode, Landmark, District, State)
  const q = String(queryOrCoords || '').trim().toLowerCase();
  if (!q) {
    const defaultReg = PAN_INDIA_REGIONS[1]; // UP Central
    return {
      region: defaultReg,
      matchedHub: SEARCHABLE_AGRO_HUBS[2], // Malihabad
      state: defaultReg.state,
      district: 'Lucknow',
      address: 'Malihabad Mango Belt, Lucknow, Uttar Pradesh',
      lat: defaultReg.center.lat,
      lng: defaultReg.center.lng,
      multiplier: defaultReg.multiplier,
      tag: defaultReg.tag,
      zoneGroup: defaultReg.zoneGroup,
      crops: defaultReg.crops,
      isAutoDetected: false
    };
  }

  // 2a. Check if 6-digit or 3-digit Pincode
  const pinMatch = q.match(/\b([1-9][0-9]{2,5})\b/);
  if (pinMatch) {
    const pin = pinMatch[1];
    const prefix3 = pin.substring(0, 3);
    const prefix2 = pin.substring(0, 2);

    // Exact hub matching by pincode
    const exactHub = SEARCHABLE_AGRO_HUBS.find(h => h.pincode === pin);
    if (exactHub) {
      const reg = PAN_INDIA_REGIONS.find(r => r.id === exactHub.regionId) || PAN_INDIA_REGIONS[0];
      return {
        region: reg,
        matchedHub: exactHub,
        state: reg.state,
        district: exactHub.city,
        address: `${exactHub.name} (PIN ${pin})`,
        lat: exactHub.lat,
        lng: exactHub.lng,
        multiplier: reg.multiplier,
        tag: reg.tag,
        zoneGroup: reg.zoneGroup,
        crops: reg.crops,
        isAutoDetected: false
      };
    }

    // Match by 3-digit pincode prefix
    const regByPin = PAN_INDIA_REGIONS.find(r => 
      r.pincodePrefixes.includes(prefix3) || r.pincodePrefixes.some(p => p.startsWith(prefix2))
    );

    if (regByPin) {
      return {
        region: regByPin,
        matchedHub: {
          name: `Postal Area PIN ${pin} (${regByPin.state})`,
          city: regByPin.sampleDistricts[0],
          state: regByPin.state,
          pincode: pin,
          lat: regByPin.center.lat,
          lng: regByPin.center.lng
        },
        state: regByPin.state,
        district: regByPin.sampleDistricts[0],
        address: `Postal Area PIN ${pin}, ${regByPin.state}`,
        lat: regByPin.center.lat,
        lng: regByPin.center.lng,
        multiplier: regByPin.multiplier,
        tag: regByPin.tag,
        zoneGroup: regByPin.zoneGroup,
        crops: regByPin.crops,
        isAutoDetected: false
      };
    }
  }

  // 2b. Check Searchable Agro Hubs by Name / Landmark / City / Keyword
  const hubMatch = SEARCHABLE_AGRO_HUBS.find(h => 
    h.name.toLowerCase().includes(q) || 
    h.city.toLowerCase().includes(q) || 
    q.includes(h.city.toLowerCase()) ||
    q.includes(h.name.toLowerCase().split(' ')[0])
  );

  if (hubMatch) {
    const reg = PAN_INDIA_REGIONS.find(r => r.id === hubMatch.regionId) || PAN_INDIA_REGIONS[0];
    return {
      region: reg,
      matchedHub: hubMatch,
      state: hubMatch.state,
      district: hubMatch.city,
      address: hubMatch.name,
      lat: hubMatch.lat,
      lng: hubMatch.lng,
      multiplier: reg.multiplier,
      tag: reg.tag,
      zoneGroup: reg.zoneGroup,
      crops: reg.crops,
      isAutoDetected: false
    };
  }

  // 2c. Check Region Sample Districts
  for (const reg of PAN_INDIA_REGIONS) {
    const matchedDistrict = reg.sampleDistricts.find(d => 
      d.toLowerCase().includes(q) || q.includes(d.toLowerCase())
    );
    if (matchedDistrict) {
      return {
        region: reg,
        matchedHub: {
          name: `${matchedDistrict}, ${reg.state}`,
          city: matchedDistrict,
          state: reg.state,
          pincode: reg.pincodePrefixes[0] + '001',
          lat: reg.center.lat,
          lng: reg.center.lng
        },
        state: reg.state,
        district: matchedDistrict,
        address: `${matchedDistrict}, ${reg.state}`,
        lat: reg.center.lat,
        lng: reg.center.lng,
        multiplier: reg.multiplier,
        tag: reg.tag,
        zoneGroup: reg.zoneGroup,
        crops: reg.crops,
        isAutoDetected: false
      };
    }
  }

  // 2d. Check by State Name
  const regByState = PAN_INDIA_REGIONS.find(r => 
    r.state.toLowerCase().includes(q) || q.includes(r.state.toLowerCase())
  );
  if (regByState) {
    return {
      region: regByState,
      matchedHub: {
        name: `${regByState.state} Central Region`,
        city: regByState.sampleDistricts[0],
        state: regByState.state,
        pincode: regByState.pincodePrefixes[0] + '001',
        lat: regByState.center.lat,
        lng: regByState.center.lng
      },
      state: regByState.state,
      district: regByState.sampleDistricts[0],
      address: `${regByState.state} Central Zone`,
      lat: regByState.center.lat,
      lng: regByState.center.lng,
      multiplier: regByState.multiplier,
      tag: regByState.tag,
      zoneGroup: regByState.zoneGroup,
      crops: regByState.crops,
      isAutoDetected: false
    };
  }

  // 2e. Default fallback to UP Central Baseline (1.0x)
  const defaultReg = PAN_INDIA_REGIONS[1];
  return {
    region: defaultReg,
    matchedHub: SEARCHABLE_AGRO_HUBS[2],
    state: defaultReg.state,
    district: 'Lucknow',
    address: `${queryOrCoords} (Resolved to ${defaultReg.regionNameEn})`,
    lat: defaultReg.center.lat,
    lng: defaultReg.center.lng,
    multiplier: defaultReg.multiplier,
    tag: defaultReg.tag,
    zoneGroup: defaultReg.zoneGroup,
    crops: defaultReg.crops,
    isAutoDetected: false
  };
}
