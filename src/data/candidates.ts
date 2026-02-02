import { Candidate, Constituency } from "@/types/election";

// Mock candidate data for key 2026 election battles
// Data structured according to Election Commission of Nepal format

export const mockCandidates: Record<string, Candidate[]> = {
  // Jhapa-5: KP Sharma Oli vs Balen Shah
  "jhapa-5": [
    {
      id: "oli-jhapa5",
      name: "KP Sharma Oli",
      party: "Communist Party of Nepal (Unified Marxist-Leninist)",
      partyShort: "CPN-UML",
      partyColor: "#DC2626",
      age: 73,
      education: "Bachelor's in Political Science",
      manifesto_summary: [
        "Economic prosperity through industrial development",
        "Strengthening national sovereignty",
        "Infrastructure development in Terai region",
        "Employment generation for youth",
      ],
      social_media_links: {
        facebook: "https://facebook.com/kaboraoli",
        twitter: "https://twitter.com/kaboraoli",
        website: "https://kpsharmaoli.com.np",
      },
      isIncumbent: true,
      previousPosition: "Former Prime Minister (3 terms)",
    },
    {
      id: "balen-jhapa5",
      name: "Balen Shah",
      party: "Rastriya Swatantra Party",
      partyShort: "RSP",
      partyColor: "#F59E0B",
      age: 37,
      education: "Bachelor's in Civil Engineering",
      manifesto_summary: [
        "Youth-led governance transformation",
        "Anti-corruption and transparency",
        "Modern urban development model",
        "Technology-driven public services",
      ],
      social_media_links: {
        facebook: "https://facebook.com/baikibalenshah",
        twitter: "https://twitter.com/baikibalenshah",
        instagram: "https://instagram.com/baikibalenshah",
        youtube: "https://youtube.com/@balenshah",
      },
      previousPosition: "Mayor of Kathmandu Metropolitan City",
    },
  ],

  // Sarlahi-4: Gagan Thapa vs Amresh Kumar Singh
  "sarlahi-4": [
    {
      id: "gagan-sarlahi4",
      name: "Gagan Kumar Thapa",
      party: "Nepali Congress",
      partyShort: "NC",
      partyColor: "#2563EB",
      age: 48,
      education: "Master's in Public Administration",
      manifesto_summary: [
        "Universal healthcare access",
        "Federal governance strengthening",
        "Agricultural modernization",
        "Social justice and inclusion",
      ],
      social_media_links: {
        facebook: "https://facebook.com/gagaboranthapa",
        twitter: "https://twitter.com/thaborapagagan",
      },
      isIncumbent: true,
      previousPosition: "Health Minister, General Secretary NC",
    },
    {
      id: "amresh-sarlahi4",
      name: "Amresh Kumar Singh",
      party: "Rastriya Swatantra Party",
      partyShort: "RSP",
      partyColor: "#F59E0B",
      age: 45,
      education: "MBA, Tribhuvan University",
      manifesto_summary: [
        "Madhesh rights and representation",
        "Cross-border trade facilitation",
        "Education quality improvement",
        "Road connectivity to all wards",
      ],
      social_media_links: {
        facebook: "https://facebook.com/amreshkumarsingh",
      },
    },
  ],

  // Kathmandu-3: Kulman Ghising
  "kathmandu-3": [
    {
      id: "kulman-ktm3",
      name: "Kulman Ghising",
      party: "Ujyalo Nepal",
      partyShort: "UN",
      partyColor: "#FBBF24",
      age: 54,
      education: "Master's in Electrical Engineering",
      manifesto_summary: [
        "Energy independence through hydropower",
        "Ending load-shedding permanently",
        "Clean energy transition",
        "Technical education promotion",
      ],
      social_media_links: {
        facebook: "https://facebook.com/kulmanghising",
        twitter: "https://twitter.com/kulmanghising",
      },
      previousPosition: "Managing Director, Nepal Electricity Authority",
    },
    {
      id: "prakash-ktm3",
      name: "Prakash Man Singh",
      party: "Nepali Congress",
      partyShort: "NC",
      partyColor: "#2563EB",
      age: 67,
      education: "Bachelor's in Commerce",
      manifesto_summary: [
        "Democratic values preservation",
        "Economic liberalization",
        "Tourism promotion",
        "Senior citizen welfare",
      ],
      social_media_links: {
        facebook: "https://facebook.com/prakashmansingh",
      },
      isIncumbent: true,
      previousPosition: "Deputy Prime Minister, Home Minister",
    },
  ],

  // Chitwan-2: Rabi Lamichhane
  "chitwan-2": [
    {
      id: "rabi-chitwan2",
      name: "Rabi Lamichhane",
      party: "Rastriya Swatantra Party",
      partyShort: "RSP",
      partyColor: "#F59E0B",
      age: 54,
      education: "Bachelor's in Journalism",
      manifesto_summary: [
        "Anti-corruption crusade",
        "Justice system reform",
        "Media freedom protection",
        "Youth empowerment programs",
      ],
      social_media_links: {
        facebook: "https://facebook.com/raborabilamichhane",
        twitter: "https://twitter.com/raborabilamichhane",
        youtube: "https://youtube.com/@rabilamichhane",
      },
      previousPosition: "Home Minister, RSP Chairman",
    },
    {
      id: "bishnu-chitwan2",
      name: "Bishnu Prasad Paudel",
      party: "Communist Party of Nepal (Unified Marxist-Leninist)",
      partyShort: "CPN-UML",
      partyColor: "#DC2626",
      age: 65,
      education: "Master's in Economics",
      manifesto_summary: [
        "Industrial corridor development",
        "Agricultural price support",
        "Infrastructure modernization",
        "Social security expansion",
      ],
      social_media_links: {
        facebook: "https://facebook.com/bishnupaudel",
      },
      isIncumbent: true,
      previousPosition: "Finance Minister, Deputy PM",
    },
  ],

  // Morang-1: Major urban constituency
  "morang-1": [
    {
      id: "bhim-morang1",
      name: "Bhim Rawal",
      party: "Communist Party of Nepal (Unified Marxist-Leninist)",
      partyShort: "CPN-UML",
      partyColor: "#DC2626",
      age: 69,
      education: "Master's in Political Science",
      manifesto_summary: [
        "Industrial zone expansion",
        "Employment for local youth",
        "Healthcare infrastructure",
        "Education quality improvement",
      ],
      social_media_links: {
        facebook: "https://facebook.com/bhimrawal",
      },
      previousPosition: "Deputy Prime Minister",
    },
  ],

  // Lalitpur-2
  "lalitpur-2": [
    {
      id: "chiri-lalitpur2",
      name: "Chiribabu Maharjan",
      party: "Nepali Congress",
      partyShort: "NC",
      partyColor: "#2563EB",
      age: 58,
      education: "Bachelor's in Law",
      manifesto_summary: [
        "Heritage preservation",
        "Urban planning reform",
        "Green city initiative",
        "Local business support",
      ],
      social_media_links: {
        facebook: "https://facebook.com/chiribabu",
      },
      previousPosition: "Mayor of Lalitpur Metropolitan City",
    },
  ],

  // Kaski-2: Tourism hub
  "kaski-2": [
    {
      id: "rabindra-kaski2",
      name: "Rabindra Adhikari",
      party: "Communist Party of Nepal (Unified Marxist-Leninist)",
      partyShort: "CPN-UML",
      partyColor: "#DC2626",
      age: 52,
      education: "Master's in Business Administration",
      manifesto_summary: [
        "Tourism infrastructure development",
        "Adventure tourism promotion",
        "Airport connectivity",
        "Hospitality training centers",
      ],
      social_media_links: {
        facebook: "https://facebook.com/rabindraadhikari",
      },
    },
  ],

  // Rupandehi-3: Industrial district
  "rupandehi-3": [
    {
      id: "shankar-rupandehi3",
      name: "Shankar Pokharel",
      party: "Communist Party of Nepal (Unified Marxist-Leninist)",
      partyShort: "CPN-UML",
      partyColor: "#DC2626",
      age: 61,
      education: "PhD in Economics",
      manifesto_summary: [
        "Special Economic Zone development",
        "Cross-border trade facilitation",
        "Industrial pollution control",
        "Workers' rights protection",
      ],
      social_media_links: {
        facebook: "https://facebook.com/shankarpokharel",
      },
      previousPosition: "Chief Minister, Lumbini Province",
    },
  ],
};

// Generate constituencies with candidates
export const generateConstituencies = (districtId: string, count: number): Constituency[] => {
  const constituencies: Constituency[] = [];

  for (let i = 1; i <= count; i++) {
    const constituencyId = `${districtId}-${i}`;
    constituencies.push({
      id: constituencyId,
      number: i,
      name: `Constituency ${i}`,
      districtId: districtId,
      registeredVoters: Math.floor(Math.random() * 50000) + 30000,
      candidates: mockCandidates[constituencyId] || generateMockCandidates(constituencyId),
    });
  }

  return constituencies;
};

// Generate mock candidates for constituencies without specific data
const generateMockCandidates = (constituencyId: string): Candidate[] => {
  const parties = [
    { party: "Nepali Congress", short: "NC", color: "#2563EB" },
    { party: "CPN-UML", short: "CPN-UML", color: "#DC2626" },
    { party: "Rastriya Swatantra Party", short: "RSP", color: "#F59E0B" },
    { party: "CPN (Maoist Centre)", short: "CPN-MC", color: "#7C3AED" },
  ];

  return parties.slice(0, 3).map((p, index) => ({
    id: `${constituencyId}-candidate-${index}`,
    name: `Candidate ${index + 1}`,
    party: p.party,
    partyShort: p.short,
    partyColor: p.color,
    age: 45 + Math.floor(Math.random() * 20),
    education: "Bachelor's Degree",
    manifesto_summary: [
      "Development and progress",
      "Good governance",
      "Employment generation",
    ],
    social_media_links: {},
  }));
};

export const getCandidatesByConstituency = (constituencyId: string): Candidate[] => {
  return mockCandidates[constituencyId] || generateMockCandidates(constituencyId);
};

export const searchCandidates = (query: string): Candidate[] => {
  const lowercaseQuery = query.toLowerCase();
  const results: Candidate[] = [];

  Object.values(mockCandidates).forEach((candidates) => {
    candidates.forEach((candidate) => {
      if (
        candidate.name.toLowerCase().includes(lowercaseQuery) ||
        candidate.party.toLowerCase().includes(lowercaseQuery) ||
        candidate.partyShort.toLowerCase().includes(lowercaseQuery)
      ) {
        results.push(candidate);
      }
    });
  });

  return results;
};
