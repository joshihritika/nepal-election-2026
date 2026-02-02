// Nepal's 77 Districts organized by 7 Provinces
// Data structured according to Election Commission of Nepal

export interface DistrictInfo {
  id: string;
  name: string;
  nameNepali: string;
  provinceId: string;
  constituencies: number;
  headquarters: string;
}

export interface ProvinceInfo {
  id: string;
  name: string;
  nameNepali: string;
  capital: string;
  color: string;
}

export const provinces: ProvinceInfo[] = [
  { id: "p1", name: "Koshi", nameNepali: "कोशी", capital: "Biratnagar", color: "#3B82F6" },
  { id: "p2", name: "Madhesh", nameNepali: "मधेश", capital: "Janakpur", color: "#10B981" },
  { id: "p3", name: "Bagmati", nameNepali: "बागमती", capital: "Hetauda", color: "#8B5CF6" },
  { id: "p4", name: "Gandaki", nameNepali: "गण्डकी", capital: "Pokhara", color: "#F59E0B" },
  { id: "p5", name: "Lumbini", nameNepali: "लुम्बिनी", capital: "Butwal", color: "#EF4444" },
  { id: "p6", name: "Karnali", nameNepali: "कर्णाली", capital: "Birendranagar", color: "#06B6D4" },
  { id: "p7", name: "Sudurpashchim", nameNepali: "सुदूरपश्चिम", capital: "Godawari", color: "#EC4899" },
];

export const districts: DistrictInfo[] = [
  // Province 1 - Koshi (14 districts)
  { id: "taplejung", name: "Taplejung", nameNepali: "ताप्लेजुङ", provinceId: "p1", constituencies: 1, headquarters: "Phungling" },
  { id: "panchthar", name: "Panchthar", nameNepali: "पाँचथर", provinceId: "p1", constituencies: 2, headquarters: "Phidim" },
  { id: "ilam", name: "Ilam", nameNepali: "इलाम", provinceId: "p1", constituencies: 2, headquarters: "Ilam" },
  { id: "jhapa", name: "Jhapa", nameNepali: "झापा", provinceId: "p1", constituencies: 5, headquarters: "Chandragadhi" },
  { id: "morang", name: "Morang", nameNepali: "मोरङ", provinceId: "p1", constituencies: 6, headquarters: "Biratnagar" },
  { id: "sunsari", name: "Sunsari", nameNepali: "सुनसरी", provinceId: "p1", constituencies: 5, headquarters: "Inaruwa" },
  { id: "dhankuta", name: "Dhankuta", nameNepali: "धनकुटा", provinceId: "p1", constituencies: 1, headquarters: "Dhankuta" },
  { id: "terhathum", name: "Terhathum", nameNepali: "तेह्रथुम", provinceId: "p1", constituencies: 1, headquarters: "Myanglung" },
  { id: "sankhuwasabha", name: "Sankhuwasabha", nameNepali: "संखुवासभा", provinceId: "p1", constituencies: 1, headquarters: "Khandbari" },
  { id: "bhojpur", name: "Bhojpur", nameNepali: "भोजपुर", provinceId: "p1", constituencies: 2, headquarters: "Bhojpur" },
  { id: "solukhumbu", name: "Solukhumbu", nameNepali: "सोलुखुम्बु", provinceId: "p1", constituencies: 1, headquarters: "Salleri" },
  { id: "okhaldhunga", name: "Okhaldhunga", nameNepali: "ओखलढुङ्गा", provinceId: "p1", constituencies: 1, headquarters: "Okhaldhunga" },
  { id: "khotang", name: "Khotang", nameNepali: "खोटाङ", provinceId: "p1", constituencies: 2, headquarters: "Diktel" },
  { id: "udayapur", name: "Udayapur", nameNepali: "उदयपुर", provinceId: "p1", constituencies: 2, headquarters: "Gaighat" },

  // Province 2 - Madhesh (8 districts)
  { id: "saptari", name: "Saptari", nameNepali: "सप्तरी", provinceId: "p2", constituencies: 4, headquarters: "Rajbiraj" },
  { id: "siraha", name: "Siraha", nameNepali: "सिराहा", provinceId: "p2", constituencies: 4, headquarters: "Siraha" },
  { id: "dhanusha", name: "Dhanusha", nameNepali: "धनुषा", provinceId: "p2", constituencies: 4, headquarters: "Janakpur" },
  { id: "mahottari", name: "Mahottari", nameNepali: "महोत्तरी", provinceId: "p2", constituencies: 4, headquarters: "Jaleshwar" },
  { id: "sarlahi", name: "Sarlahi", nameNepali: "सर्लाही", provinceId: "p2", constituencies: 4, headquarters: "Malangwa" },
  { id: "rautahat", name: "Rautahat", nameNepali: "रौतहट", provinceId: "p2", constituencies: 4, headquarters: "Gaur" },
  { id: "bara", name: "Bara", nameNepali: "बारा", provinceId: "p2", constituencies: 4, headquarters: "Kalaiya" },
  { id: "parsa", name: "Parsa", nameNepali: "पर्सा", provinceId: "p2", constituencies: 4, headquarters: "Birgunj" },

  // Province 3 - Bagmati (13 districts)
  { id: "dolakha", name: "Dolakha", nameNepali: "दोलखा", provinceId: "p3", constituencies: 2, headquarters: "Charikot" },
  { id: "sindhupalchok", name: "Sindhupalchok", nameNepali: "सिन्धुपाल्चोक", provinceId: "p3", constituencies: 3, headquarters: "Chautara" },
  { id: "rasuwa", name: "Rasuwa", nameNepali: "रसुवा", provinceId: "p3", constituencies: 1, headquarters: "Dhunche" },
  { id: "dhading", name: "Dhading", nameNepali: "धादिङ", provinceId: "p3", constituencies: 3, headquarters: "Dhading Besi" },
  { id: "nuwakot", name: "Nuwakot", nameNepali: "नुवाकोट", provinceId: "p3", constituencies: 2, headquarters: "Bidur" },
  { id: "kathmandu", name: "Kathmandu", nameNepali: "काठमाडौं", provinceId: "p3", constituencies: 10, headquarters: "Kathmandu" },
  { id: "bhaktapur", name: "Bhaktapur", nameNepali: "भक्तपुर", provinceId: "p3", constituencies: 2, headquarters: "Bhaktapur" },
  { id: "lalitpur", name: "Lalitpur", nameNepali: "ललितपुर", provinceId: "p3", constituencies: 3, headquarters: "Lalitpur" },
  { id: "kavrepalanchok", name: "Kavrepalanchok", nameNepali: "काभ्रेपलाञ्चोक", provinceId: "p3", constituencies: 3, headquarters: "Dhulikhel" },
  { id: "ramechhap", name: "Ramechhap", nameNepali: "रामेछाप", provinceId: "p3", constituencies: 2, headquarters: "Manthali" },
  { id: "sindhuli", name: "Sindhuli", nameNepali: "सिन्धुली", provinceId: "p3", constituencies: 2, headquarters: "Sindhuli" },
  { id: "makwanpur", name: "Makwanpur", nameNepali: "मकवानपुर", provinceId: "p3", constituencies: 3, headquarters: "Hetauda" },
  { id: "chitwan", name: "Chitwan", nameNepali: "चितवन", provinceId: "p3", constituencies: 4, headquarters: "Bharatpur" },

  // Province 4 - Gandaki (11 districts)
  { id: "gorkha", name: "Gorkha", nameNepali: "गोरखा", provinceId: "p4", constituencies: 2, headquarters: "Gorkha" },
  { id: "lamjung", name: "Lamjung", nameNepali: "लमजुङ", provinceId: "p4", constituencies: 1, headquarters: "Besisahar" },
  { id: "tanahu", name: "Tanahu", nameNepali: "तनहुँ", provinceId: "p4", constituencies: 2, headquarters: "Damauli" },
  { id: "syangja", name: "Syangja", nameNepali: "स्याङ्जा", provinceId: "p4", constituencies: 2, headquarters: "Putalibazar" },
  { id: "kaski", name: "Kaski", nameNepali: "कास्की", provinceId: "p4", constituencies: 3, headquarters: "Pokhara" },
  { id: "manang", name: "Manang", nameNepali: "मनाङ", provinceId: "p4", constituencies: 1, headquarters: "Chame" },
  { id: "mustang", name: "Mustang", nameNepali: "मुस्ताङ", provinceId: "p4", constituencies: 1, headquarters: "Jomsom" },
  { id: "myagdi", name: "Myagdi", nameNepali: "म्याग्दी", provinceId: "p4", constituencies: 1, headquarters: "Beni" },
  { id: "parbat", name: "Parbat", nameNepali: "पर्वत", provinceId: "p4", constituencies: 1, headquarters: "Kusma" },
  { id: "baglung", name: "Baglung", nameNepali: "बाग्लुङ", provinceId: "p4", constituencies: 2, headquarters: "Baglung" },
  { id: "nawalpur", name: "Nawalpur", nameNepali: "नवलपुर", provinceId: "p4", constituencies: 2, headquarters: "Kawasoti" },

  // Province 5 - Lumbini (12 districts)
  { id: "rukum-east", name: "Rukum East", nameNepali: "रुकुम पूर्व", provinceId: "p5", constituencies: 1, headquarters: "Rukumkot" },
  { id: "rolpa", name: "Rolpa", nameNepali: "रोल्पा", provinceId: "p5", constituencies: 2, headquarters: "Liwang" },
  { id: "pyuthan", name: "Pyuthan", nameNepali: "प्युठान", provinceId: "p5", constituencies: 2, headquarters: "Pyuthan" },
  { id: "gulmi", name: "Gulmi", nameNepali: "गुल्मी", provinceId: "p5", constituencies: 2, headquarters: "Tamghas" },
  { id: "arghakhanchi", name: "Arghakhanchi", nameNepali: "अर्घाखाँची", provinceId: "p5", constituencies: 1, headquarters: "Sandhikharka" },
  { id: "palpa", name: "Palpa", nameNepali: "पाल्पा", provinceId: "p5", constituencies: 2, headquarters: "Tansen" },
  { id: "rupandehi", name: "Rupandehi", nameNepali: "रुपन्देही", provinceId: "p5", constituencies: 5, headquarters: "Siddharthanagar" },
  { id: "kapilvastu", name: "Kapilvastu", nameNepali: "कपिलवस्तु", provinceId: "p5", constituencies: 3, headquarters: "Kapilvastu" },
  { id: "nawalparasi-west", name: "Nawalparasi West", nameNepali: "नवलपरासी पश्चिम", provinceId: "p5", constituencies: 2, headquarters: "Bardaghat" },
  { id: "dang", name: "Dang", nameNepali: "दाङ", provinceId: "p5", constituencies: 3, headquarters: "Ghorahi" },
  { id: "banke", name: "Banke", nameNepali: "बाँके", provinceId: "p5", constituencies: 3, headquarters: "Nepalgunj" },
  { id: "bardiya", name: "Bardiya", nameNepali: "बर्दिया", provinceId: "p5", constituencies: 2, headquarters: "Gulariya" },

  // Province 6 - Karnali (10 districts)
  { id: "dolpa", name: "Dolpa", nameNepali: "डोल्पा", provinceId: "p6", constituencies: 1, headquarters: "Dunai" },
  { id: "mugu", name: "Mugu", nameNepali: "मुगु", provinceId: "p6", constituencies: 1, headquarters: "Gamgadhi" },
  { id: "humla", name: "Humla", nameNepali: "हुम्ला", provinceId: "p6", constituencies: 1, headquarters: "Simikot" },
  { id: "jumla", name: "Jumla", nameNepali: "जुम्ला", provinceId: "p6", constituencies: 1, headquarters: "Jumla" },
  { id: "kalikot", name: "Kalikot", nameNepali: "कालिकोट", provinceId: "p6", constituencies: 1, headquarters: "Manma" },
  { id: "dailekh", name: "Dailekh", nameNepali: "दैलेख", provinceId: "p6", constituencies: 2, headquarters: "Dailekh" },
  { id: "jajarkot", name: "Jajarkot", nameNepali: "जाजरकोट", provinceId: "p6", constituencies: 1, headquarters: "Khalanga" },
  { id: "rukum-west", name: "Rukum West", nameNepali: "रुकुम पश्चिम", provinceId: "p6", constituencies: 1, headquarters: "Musikot" },
  { id: "salyan", name: "Salyan", nameNepali: "सल्यान", provinceId: "p6", constituencies: 2, headquarters: "Salyan" },
  { id: "surkhet", name: "Surkhet", nameNepali: "सुर्खेत", provinceId: "p6", constituencies: 2, headquarters: "Birendranagar" },

  // Province 7 - Sudurpashchim (9 districts)
  { id: "bajura", name: "Bajura", nameNepali: "बाजुरा", provinceId: "p7", constituencies: 1, headquarters: "Martadi" },
  { id: "bajhang", name: "Bajhang", nameNepali: "बझाङ", provinceId: "p7", constituencies: 2, headquarters: "Chainpur" },
  { id: "darchula", name: "Darchula", nameNepali: "दार्चुला", provinceId: "p7", constituencies: 1, headquarters: "Darchula" },
  { id: "baitadi", name: "Baitadi", nameNepali: "बैतडी", provinceId: "p7", constituencies: 2, headquarters: "Dasharathchand" },
  { id: "dadeldhura", name: "Dadeldhura", nameNepali: "डडेल्धुरा", provinceId: "p7", constituencies: 1, headquarters: "Amargadhi" },
  { id: "doti", name: "Doti", nameNepali: "डोटी", provinceId: "p7", constituencies: 2, headquarters: "Silgadhi" },
  { id: "achham", name: "Achham", nameNepali: "अछाम", provinceId: "p7", constituencies: 2, headquarters: "Mangalsen" },
  { id: "kailali", name: "Kailali", nameNepali: "कैलाली", provinceId: "p7", constituencies: 4, headquarters: "Dhangadhi" },
  { id: "kanchanpur", name: "Kanchanpur", nameNepali: "कञ्चनपुर", provinceId: "p7", constituencies: 2, headquarters: "Mahendranagar" },
];

export const getDistrictById = (id: string): DistrictInfo | undefined => {
  return districts.find((d) => d.id === id);
};

export const getDistrictsByProvince = (provinceId: string): DistrictInfo[] => {
  return districts.filter((d) => d.provinceId === provinceId);
};

export const getProvinceById = (id: string): ProvinceInfo | undefined => {
  return provinces.find((p) => p.id === id);
};

export const getTotalConstituencies = (): number => {
  return districts.reduce((sum, d) => sum + d.constituencies, 0);
};
