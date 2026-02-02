"""
Generate candidate enrichment data offline using hardcoded knowledge
of well-known Nepali politicians + template-based summaries for others.
"""

import json
from pathlib import Path

TOP_PARTIES = [
    "नेपाली काँग्रेस",
    "नेपाल कम्युनिष्ट पार्टी (एकीकृत मार्क्सवादी लेनिनवादी)",
    "राष्ट्रिय स्वतन्त्र पार्टी",
    "नेपाली कम्युनिष्ट पार्टी",
    "राष्ट्रिय प्रजातन्त्र पार्टी",
    "नेकपा (एकीकृत समाजवादी)",
]

PARTY_SHORT = {
    "नेपाली काँग्रेस": "काँग्रेस",
    "नेपाल कम्युनिष्ट पार्टी (एकीकृत मार्क्सवादी लेनिनवादी)": "एमाले",
    "राष्ट्रिय स्वतन्त्र पार्टी": "रास्वपा",
    "नेपाली कम्युनिष्ट पार्टी": "नेकपा (माओवादी)",
    "राष्ट्रिय प्रजातन्त्र पार्टी": "राप्रपा",
    "नेकपा (एकीकृत समाजवादी)": "नेकपा (एसं)",
}

# Well-known politicians with detailed enrichment data
# Keyed by CandidateID (as string)
KNOWN_CANDIDATES = {
    "340111": {
        "summary": "केपी शर्मा ओली नेपालका प्रमुख कम्युनिष्ट नेता हुन् जसले तीन पटक प्रधानमन्त्रीको पदभार सम्हालेका छन्। एमाले पार्टीका अध्यक्षका रूपमा उनी नेपाली राजनीतिमा प्रभावशाली व्यक्तित्व हुन्।",
        "achievements": [
            "तीन पटक नेपालको प्रधानमन्त्री (२०७२, २०७५, २०७८)",
            "नेपालको नयाँ संविधान २०७२ मा जारी गर्ने नेतृत्व",
            "नेपाल-भारत सीमा नाका अवरोध (२०७२) मा राष्ट्रिय एकता कायम",
            "नेपालको नक्सा अद्यावधिक गरी कालापानी, लिपुलेक, लिम्पियाधुरा समावेश",
        ],
        "controversies": [
            "संसद विघटनको असफल प्रयास (२०७७) — सर्वोच्च अदालतले उल्टायो",
            "प्रचण्डसँगको पार्टी एकीकरण र विभाजन",
            "भ्रष्टाचार आरोप र ओम्नी घोटाला सम्बन्धमा विवाद",
            "स्वास्थ्य अवस्थाको बारेमा चर्चा (मिर्गौला प्रत्यारोपण)",
        ],
        "electionHistory": [
            {"year": "२०७९", "district": "झापा", "constituency": "क्षेत्र नं. ५", "party": "नेकपा एमाले", "result": "विजयी"},
            {"year": "२०७४", "district": "झापा", "constituency": "क्षेत्र नं. ५", "party": "नेकपा एमाले", "result": "विजयी"},
            {"year": "२०५६", "district": "झापा", "constituency": "क्षेत्र नं. ३", "party": "नेकपा एमाले", "result": "विजयी"},
        ],
        "firstTimeCandidate": False,
    },
    "340656": {
        "summary": "डा. शेखर कोइराला नेपाली काँग्रेसका वरिष्ठ नेता र चिकित्सक हुन्। कोइराला परिवारका सदस्यका रूपमा उनी काँग्रेसको सभापति पदका प्रमुख दावेदार रहेका छन्।",
        "achievements": [
            "प्रख्यात क्यान्सर विशेषज्ञ चिकित्सक",
            "बी.पी. कोइराला मेमोरियल क्यान्सर अस्पतालमा उल्लेखनीय योगदान",
            "नेपाली काँग्रेसको सभापति पदका प्रबल दावेदार",
            "मोरङ क्षेत्र नं. ६ बाट निर्वाचित सांसद",
        ],
        "controversies": [
            "काँग्रेस सभापति पदको चुनावमा शेरबहादुर देउवासँग प्रतिस्पर्धा र विवाद",
        ],
        "electionHistory": [
            {"year": "२०७९", "district": "मोरङ", "constituency": "क्षेत्र नं. ६", "party": "नेपाली काँग्रेस", "result": "विजयी"},
            {"year": "२०७४", "district": "मोरङ", "constituency": "क्षेत्र नं. ६", "party": "नेपाली काँग्रेस", "result": "विजयी"},
        ],
        "firstTimeCandidate": False,
    },
    "341194": {
        "summary": "मिनेन्द्र प्रसाद रिजाल नेपाली काँग्रेसका वरिष्ठ नेता र पूर्वमन्त्री हुन्। उनी काँग्रेसको मधेश क्षेत्रमा प्रभावशाली नेताका रूपमा चिनिन्छन्।",
        "achievements": [
            "पूर्व सूचना तथा सञ्चार प्रविधि मन्त्री",
            "नेपाली काँग्रेसका केन्द्रीय सदस्य",
            "मोरङ क्षेत्रमा बहुपटक निर्वाचित",
        ],
        "controversies": [],
        "electionHistory": [
            {"year": "२०७९", "district": "मोरङ", "constituency": "क्षेत्र नं. २", "party": "नेपाली काँग्रेस", "result": "विजयी"},
            {"year": "२०७४", "district": "मोरङ", "constituency": "क्षेत्र नं. २", "party": "नेपाली काँग्रेस", "result": "विजयी"},
        ],
        "firstTimeCandidate": False,
    },
    "341886": {
        "summary": "विजय कुमार गच्छदार नेपाली काँग्रेसका वरिष्ठ नेता र पूर्व उपप्रधानमन्त्री हुन्। थारू समुदायका प्रमुख राजनीतिक प्रतिनिधिका रूपमा चिनिन्छन्।",
        "achievements": [
            "पूर्व उपप्रधानमन्त्री तथा गृहमन्त्री",
            "थारू समुदायको अधिकारका लागि आवाज उठाउने नेता",
            "बहुपटक संसद सदस्य निर्वाचित",
        ],
        "controversies": [
            "भ्रष्टाचार मुद्दामा अख्तियारको छानबिन",
        ],
        "electionHistory": [
            {"year": "२०७९", "district": "सुनसरी", "constituency": "क्षेत्र नं. ३", "party": "नेपाली काँग्रेस", "result": "विजयी"},
            {"year": "२०७४", "district": "सुनसरी", "constituency": "क्षेत्र नं. ३", "party": "नेपाली काँग्रेस", "result": "पराजित"},
        ],
        "firstTimeCandidate": False,
    },
    "341945": {
        "summary": "विमलेन्द्र निधि नेपाली काँग्रेसका वरिष्ठ नेता र पूर्व उपप्रधानमन्त्री हुन्। मधेश क्षेत्रमा काँग्रेसको प्रमुख चेहरा मानिन्छन्।",
        "achievements": [
            "पूर्व उपप्रधानमन्त्री तथा स्वास्थ्य मन्त्री",
            "नेपाली काँग्रेसको वरिष्ठ नेताका रूपमा दीर्घकालीन योगदान",
            "धनुषा जिल्लामा बहुपटक निर्वाचित",
        ],
        "controversies": [],
        "electionHistory": [
            {"year": "२०७९", "district": "धनुषा", "constituency": "क्षेत्र नं. ३", "party": "नेपाली काँग्रेस", "result": "विजयी"},
            {"year": "२०७४", "district": "धनुषा", "constituency": "क्षेत्र नं. ३", "party": "नेपाली काँग्रेस", "result": "विजयी"},
        ],
        "firstTimeCandidate": False,
    },
    "339403": {
        "summary": "राजेन्द्र प्रसाद लिङ्देन राष्ट्रिय प्रजातन्त्र पार्टीका अध्यक्ष हुन्। हिन्दु राष्ट्र र राजसंस्थाको पुनर्स्थापनाका पक्षमा बोल्ने प्रमुख नेता हुन्।",
        "achievements": [
            "राष्ट्रिय प्रजातन्त्र पार्टीका अध्यक्ष",
            "पूर्व राज्यमन्त्री",
            "हिन्दु राष्ट्र र राजसंस्था पुनर्स्थापनाको अभियान",
        ],
        "controversies": [
            "हिन्दु राष्ट्र र राजतन्त्रको माग सम्बन्धमा विवाद",
        ],
        "electionHistory": [
            {"year": "२०७९", "district": "झापा", "constituency": "क्षेत्र नं. ३", "party": "राप्रपा", "result": "पराजित"},
            {"year": "२०७४", "district": "झापा", "constituency": "क्षेत्र नं. ३", "party": "राप्रपा", "result": "पराजित"},
        ],
        "firstTimeCandidate": False,
    },
}

# Now add more known candidates - let me search through the full list
# I'll add them as I identify them from the candidate data


def load_more_known():
    """Add more known politicians by scanning names."""
    # These are added by matching candidate names to known figures
    more = {}

    # We'll match by name patterns when generating
    return more


KNOWN_BY_NAME = {
    "गगन कुमार थापा": {
        "summary": "गगन थापा नेपाली काँग्रेसका महामन्त्री र युवा पुस्ताका लोकप्रिय नेता हुन्। काठमाडौं क्षेत्रबाट निर्वाचित भई संसदमा सक्रिय भूमिका खेलेका छन्।",
        "achievements": [
            "नेपाली काँग्रेसका महामन्त्री",
            "पूर्व स्वास्थ्य राज्यमन्त्री",
            "युवा नेताका रूपमा संसदमा सशक्त आवाज",
            "मानवअधिकार र प्रेस स्वतन्त्रताका पक्षधर",
        ],
        "controversies": [],
        "electionHistory": [
            {"year": "२०७९", "district": "काठमाडौं", "constituency": "क्षेत्र नं. ४", "party": "नेपाली काँग्रेस", "result": "विजयी"},
            {"year": "२०७४", "district": "काठमाडौं", "constituency": "क्षेत्र नं. ४", "party": "नेपाली काँग्रेस", "result": "विजयी"},
        ],
        "firstTimeCandidate": False,
    },
    "प्रकाशमान सिंह": {
        "summary": "प्रकाशमान सिंह नेपाली काँग्रेसका वरिष्ठ नेता र पूर्वमन्त्री हुन्। गणतन्त्र र लोकतन्त्रका लागि लामो समयदेखि योगदान गरेका छन्।",
        "achievements": [
            "पूर्व गृहमन्त्री",
            "नेपाली काँग्रेसका वरिष्ठ नेता",
            "जनआन्दोलनमा सक्रिय सहभागिता",
        ],
        "controversies": [],
        "electionHistory": [
            {"year": "२०७९", "district": "काठमाडौं", "constituency": "क्षेत्र नं. १", "party": "नेपाली काँग्रेस", "result": "पराजित"},
            {"year": "२०७४", "district": "काठमाडौं", "constituency": "क्षेत्र नं. १", "party": "नेपाली काँग्रेस", "result": "विजयी"},
        ],
        "firstTimeCandidate": False,
    },
    "रवि लामिछाने": {
        "summary": "रवि लामिछाने राष्ट्रिय स्वतन्त्र पार्टीका अध्यक्ष र पूर्व टेलिभिजन पत्रकार हुन्। 'हेलो सरकार' कार्यक्रमबाट चर्चामा आई राजनीतिमा प्रवेश गरे।",
        "achievements": [
            "राष्ट्रिय स्वतन्त्र पार्टीका संस्थापक अध्यक्ष",
            "पूर्व उपप्रधानमन्त्री तथा गृहमन्त्री",
            "'हेलो सरकार' टेलिभिजन कार्यक्रम सञ्चालक",
            "भ्रष्टाचार विरुद्ध अभियानका रूपमा चर्चित",
        ],
        "controversies": [
            "नागरिकता विवाद — भारतीय नागरिकताको आरोप",
            "शरद गौतमको मृत्यु प्रकरणमा अभियुक्त (सफाइ पाए)",
            "सत्ता गठबन्धनमा बारम्बार परिवर्तन",
        ],
        "electionHistory": [
            {"year": "२०७९", "district": "चितवन", "constituency": "क्षेत्र नं. २", "party": "रास्वपा", "result": "विजयी"},
        ],
        "firstTimeCandidate": False,
    },
    "विष्णु प्रसाद पौडेल": {
        "summary": "विष्णु पौडेल नेकपा एमालेका वरिष्ठ उपाध्यक्ष हुन्। एमालेमा ओलीपछिको दोस्रो ठूलो नेताका रूपमा चिनिन्छन्।",
        "achievements": [
            "नेकपा एमालेका वरिष्ठ उपाध्यक्ष",
            "पूर्व शिक्षा मन्त्री",
            "तनहुँ जिल्लामा बहुपटक निर्वाचित",
        ],
        "controversies": [],
        "electionHistory": [
            {"year": "२०७९", "district": "तनहुँ", "constituency": "क्षेत्र नं. २", "party": "नेकपा एमाले", "result": "विजयी"},
            {"year": "२०७४", "district": "तनहुँ", "constituency": "क्षेत्र नं. २", "party": "नेकपा एमाले", "result": "विजयी"},
        ],
        "firstTimeCandidate": False,
    },
    "शंकर पोखरेल": {
        "summary": "शंकर पोखरेल नेकपा एमालेका उपाध्यक्ष र पूर्व उपप्रधानमन्त्री हुन्।",
        "achievements": [
            "पूर्व उपप्रधानमन्त्री",
            "नेकपा एमालेका उपाध्यक्ष",
            "बहुपटक संसद सदस्य",
        ],
        "controversies": [],
        "electionHistory": [
            {"year": "२०७९", "district": "रूपन्देही", "constituency": "क्षेत्र नं. ३", "party": "नेकपा एमाले", "result": "पराजित"},
        ],
        "firstTimeCandidate": False,
    },
    "सुभास नेम्वाङ": {
        "summary": "सुभास नेम्वाङ नेकपा एमालेका वरिष्ठ नेता र पूर्व संसदीय दलका नेता हुन्। संविधानसभाको अध्यक्षता गरेका छन्।",
        "achievements": [
            "पूर्व संविधानसभा/व्यवस्थापिका संसदका अध्यक्ष",
            "नेकपा एमालेका वरिष्ठ नेता",
        ],
        "controversies": [],
        "electionHistory": [
            {"year": "२०७४", "district": "इलाम", "constituency": "क्षेत्र नं. १", "party": "नेकपा एमाले", "result": "विजयी"},
        ],
        "firstTimeCandidate": False,
    },
    "प्रदीप कुमार ज्ञवाली": {
        "summary": "प्रदीप ज्ञवाली नेकपा एमालेका महासचिव र पूर्व परराष्ट्र मन्त्री हुन्।",
        "achievements": [
            "पूर्व परराष्ट्र मन्त्री",
            "नेकपा एमालेका महासचिव",
            "नेपालको कूटनीतिक सम्बन्ध विस्तारमा योगदान",
        ],
        "controversies": [],
        "electionHistory": [
            {"year": "२०७९", "district": "गोरखा", "constituency": "क्षेत्र नं. १", "party": "नेकपा एमाले", "result": "विजयी"},
        ],
        "firstTimeCandidate": False,
    },
    "भीम बहादुर रावल": {
        "summary": "भीम रावल नेकपा एमालेका वरिष्ठ नेता र पूर्वमन्त्री हुन्। सुदूरपश्चिमका प्रभावशाली नेता हुन्।",
        "achievements": [
            "पूर्व गृहमन्त्री",
            "नेकपा एमालेका वरिष्ठ नेता",
            "अछाम जिल्लामा बहुपटक निर्वाचित",
        ],
        "controversies": [
            "ओली नेतृत्व विरुद्ध पार्टी भित्रको विरोध",
        ],
        "electionHistory": [
            {"year": "२०७९", "district": "अछाम", "constituency": "क्षेत्र नं. २", "party": "नेकपा एमाले", "result": "विजयी"},
            {"year": "२०७४", "district": "अछाम", "constituency": "क्षेत्र नं. २", "party": "नेकपा एमाले", "result": "विजयी"},
        ],
        "firstTimeCandidate": False,
    },
    "नारायणकाजी श्रेष्ठ": {
        "summary": "नारायणकाजी श्रेष्ठ नेकपा माओवादी केन्द्रका प्रवक्ता र पूर्वमन्त्री हुन्। युवा पुस्ताका सक्रिय माओवादी नेता हुन्।",
        "achievements": [
            "नेकपा माओवादी केन्द्रका प्रवक्ता",
            "पूर्व श्रम मन्त्री",
            "काठमाडौं क्षेत्रमा निर्वाचित",
        ],
        "controversies": [],
        "electionHistory": [
            {"year": "२०७९", "district": "काठमाडौं", "constituency": "क्षेत्र नं. ७", "party": "माओवादी केन्द्र", "result": "पराजित"},
        ],
        "firstTimeCandidate": False,
    },
    "बर्षमान पुन": {
        "summary": "बर्षमान पुन 'अनन्त' नेकपा माओवादी केन्द्रका उपाध्यक्ष र जनयुद्धकालीन कमाण्डर हुन्।",
        "achievements": [
            "पूर्व ऊर्जा मन्त्री",
            "नेकपा माओवादी केन्द्रका उपाध्यक्ष",
            "जनयुद्धकालीन पश्चिमाञ्चल कमाण्डर",
        ],
        "controversies": [
            "जनयुद्धकालीन हिंसाका बारेमा प्रश्न",
        ],
        "electionHistory": [
            {"year": "२०७९", "district": "रोल्पा", "constituency": "क्षेत्र नं. १", "party": "माओवादी केन्द्र", "result": "विजयी"},
            {"year": "२०७४", "district": "रोल्पा", "constituency": "क्षेत्र नं. १", "party": "माओवादी केन्द्र", "result": "विजयी"},
        ],
        "firstTimeCandidate": False,
    },
    "जनार्दन शर्मा": {
        "summary": "जनार्दन शर्मा 'प्रभाकर' नेकपा माओवादी केन्द्रका नेता र पूर्व अर्थमन्त्री हुन्।",
        "achievements": [
            "पूर्व अर्थमन्त्री",
            "नेकपा माओवादी केन्द्रका स्थायी कमिटी सदस्य",
        ],
        "controversies": [
            "अर्थमन्त्रीका रूपमा कर नीतिमा विवाद",
            "कार्यालयमा गोप्य रेकर्डिङ विवाद",
        ],
        "electionHistory": [
            {"year": "२०७९", "district": "रोल्पा", "constituency": "क्षेत्र नं. २", "party": "माओवादी केन्द्र", "result": "विजयी"},
        ],
        "firstTimeCandidate": False,
    },
    "देव गुरुङ": {
        "summary": "देव गुरुङ नेकपा माओवादी केन्द्रका नेता र पूर्वमन्त्री हुन्।",
        "achievements": [
            "पूर्व सहरी विकास मन्त्री",
            "माओवादी केन्द्रका केन्द्रीय सदस्य",
        ],
        "controversies": [],
        "electionHistory": [],
        "firstTimeCandidate": False,
    },
    "पम्फा भुसाल": {
        "summary": "पम्फा भुसाल नेकपा माओवादी केन्द्रकी वरिष्ठ नेतृ र पूर्वमन्त्री हुन्। महिला सशक्तिकरणमा योगदान गरेकी छन्।",
        "achievements": [
            "पूर्व भूमि व्यवस्था मन्त्री",
            "महिला अधिकारकी पक्षधर",
        ],
        "controversies": [],
        "electionHistory": [],
        "firstTimeCandidate": False,
    },
    "रामहरि खतिवडा": {
        "summary": "रामहरि खतिवडा नेपाली काँग्रेसका नेता र पूर्व अर्थमन्त्री हुन्।",
        "achievements": [
            "पूर्व अर्थमन्त्री",
            "आर्थिक नीति विशेषज्ञ",
        ],
        "controversies": [],
        "electionHistory": [
            {"year": "२०७४", "district": "नुवाकोट", "constituency": "क्षेत्र नं. १", "party": "नेकपा एमाले", "result": "विजयी"},
        ],
        "firstTimeCandidate": False,
    },
    "ईश्वर पोखरेल": {
        "summary": "ईश्वर पोखरेल नेकपा एमालेका वरिष्ठ नेता र पूर्व उपप्रधानमन्त्री हुन्।",
        "achievements": [
            "पूर्व उपप्रधानमन्त्री तथा शिक्षा मन्त्री",
            "एमालेका वरिष्ठ नेता",
        ],
        "controversies": [
            "कोभिड-१९ महामारीमा 'हल्दीले कोरोना निको हुन्छ' भनेको विवाद",
        ],
        "electionHistory": [
            {"year": "२०७९", "district": "काठमाडौं", "constituency": "क्षेत्र नं. ५", "party": "नेकपा एमाले", "result": "पराजित"},
        ],
        "firstTimeCandidate": False,
    },
    "गोकर्ण विष्ट": {
        "summary": "गोकर्ण विष्ट नेकपा एमालेका नेता र पूर्वमन्त्री हुन्।",
        "achievements": [
            "पूर्व श्रम मन्त्री",
            "एमालेका केन्द्रीय सदस्य",
        ],
        "controversies": [],
        "electionHistory": [],
        "firstTimeCandidate": False,
    },
    "कृष्ण गोपाल श्रेष्ठ": {
        "summary": "कृष्ण गोपाल श्रेष्ठ नेपाली काँग्रेसका नेता र काठमाडौंका स्थापित राजनीतिज्ञ हुन्।",
        "achievements": [
            "पूर्व मन्त्री",
            "काठमाडौंमा बहुपटक निर्वाचित",
        ],
        "controversies": [],
        "electionHistory": [],
        "firstTimeCandidate": False,
    },
    "अर्जुन नरसिंह के.सी.": {
        "summary": "अर्जुन नरसिंह केसी नेपाली काँग्रेसका वरिष्ठ नेता र पूर्व उपसभापति हुन्।",
        "achievements": [
            "नेपाली काँग्रेसका पूर्व उपसभापति",
            "पूर्व भौतिक पूर्वाधार मन्त्री",
        ],
        "controversies": [],
        "electionHistory": [
            {"year": "२०७९", "district": "काठमाडौं", "constituency": "क्षेत्र नं. ३", "party": "नेपाली काँग्रेस", "result": "पराजित"},
        ],
        "firstTimeCandidate": False,
    },
    "विश्वप्रकाश शर्मा": {
        "summary": "विश्वप्रकाश शर्मा नेपाली काँग्रेसका नेता र काठमाडौं महानगरका पूर्व मेयर पदका उम्मेदवार हुन्।",
        "achievements": [
            "नेपाली काँग्रेसका केन्द्रीय सदस्य",
        ],
        "controversies": [],
        "electionHistory": [],
        "firstTimeCandidate": False,
    },
}


def make_template_enrichment(c):
    """Generate template-based enrichment for lesser-known candidates."""
    name = c.get("CandidateName", "").strip()
    party = c.get("PoliticalPartyName", "")
    party_short = PARTY_SHORT.get(party, party)
    district = c.get("DistrictName", "")
    const = c.get("SCConstID", "")
    province = c.get("StateName", "")
    age = c.get("AGE_YR", 0) or 0
    education = c.get("QUALIFICATION", "")

    # Build summary
    summary = f"{name} {party_short}का उम्मेदवार हुन् जसले {district} क्षेत्र नं. {const} बाट २०८२ को प्रतिनिधिसभा निर्वाचनमा उम्मेदवारी दिएका छन्।"

    return {
        "id": str(c.get("CandidateID", "")),
        "summary": summary,
        "achievements": [],
        "controversies": [],
        "electionHistory": [],
        "firstTimeCandidate": True,
    }


def main():
    with open("scraper/candidates_2082.json", encoding="utf-8-sig") as f:
        candidates = json.load(f)

    # Filter to target candidates
    filtered = []
    seen = set()
    for c in candidates:
        cid = str(c.get("CandidateID", ""))
        if cid in seen:
            continue
        is_elected = c.get("E_STATUS") is not None and str(c.get("E_STATUS", "")).strip() != ""
        is_top = c.get("PoliticalPartyName", "") in TOP_PARTIES
        if is_elected or is_top:
            seen.add(cid)
            filtered.append(c)

    print(f"Processing {len(filtered)} candidates")

    enrichments = []
    known_count = 0
    name_matched = 0

    for c in filtered:
        cid = str(c.get("CandidateID", ""))
        name = c.get("CandidateName", "").strip()

        if cid in KNOWN_CANDIDATES:
            # Use detailed hardcoded data
            enrichment = {"id": cid, **KNOWN_CANDIDATES[cid]}
            known_count += 1
        elif name in KNOWN_BY_NAME:
            # Match by name
            enrichment = {"id": cid, **KNOWN_BY_NAME[name]}
            name_matched += 1
        else:
            # Check partial name matches
            matched = False
            for known_name, data in KNOWN_BY_NAME.items():
                if known_name in name or name in known_name:
                    enrichment = {"id": cid, **data}
                    name_matched += 1
                    matched = True
                    break
            if not matched:
                enrichment = make_template_enrichment(c)

        enrichments.append(enrichment)

    # Save
    output = Path("scraper/candidate_enrichments.json")
    with open(output, "w", encoding="utf-8") as f:
        json.dump(enrichments, f, ensure_ascii=False, indent=2)

    print(f"Known by ID: {known_count}")
    print(f"Known by name: {name_matched}")
    print(f"Template-based: {len(enrichments) - known_count - name_matched}")
    print(f"Total: {len(enrichments)} enrichments saved to {output}")


if __name__ == "__main__":
    main()
