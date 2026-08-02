import { NextRequest } from "next/server";
import { geminiModel } from "@/lib/gemini";
import { z } from "zod";
import { standardResponse, errorResponse, withRetry, aiAskCache, sanitizeInput, askAiRateLimiter } from "@/lib/api-utils";
import crypto from "crypto";

const AskSchema = z.object({
  question: z.string().min(3, "Question must be at least 3 characters").max(2000, "Question is too long (max 2000 characters)"),
});

export interface DecodedCardResponse {
  isInvalid?: boolean;
  title: string;
  description: string;
  category: string;
  benefits: string;
  eligibility: string;
  documentsRequired: string[];
  howToApply: string;
  officialUrl: string;
}

/**
 * Domain-aware civic inquiry validator and context-aware fallback engine
 */
function generateQuestionSpecificCard(q: string): DecodedCardResponse {
  const queryLower = q.toLowerCase().trim();

  // 0. Nonsense / Fictional / Non-Civic Intent Detection
  const nonsenseKeywords = [
    "iron man", "ironman", "superman", "batman", "avengers", "superhero", "spiderman",
    "fly to mars", "space travel", "magic", "vampire", "hogwarts", "joke", "funny",
    "alien", "godzilla", "zombie", "time travel", "pokemon", "crypto trading"
  ];

  if (nonsenseKeywords.some(kw => queryLower.includes(kw))) {
    return {
      isInvalid: true,
      title: "Not a Recognized Government Service",
      description: `The query "${q}" does not relate to any recognized Indian government scheme, public service, or civic procedure.`,
      category: "Unrecognized Query",
      benefits: "Fictional or non-civic topics cannot be processed by the AI Civic Decoder.",
      eligibility: "N/A — Fictional / Non-Government Query",
      documentsRequired: [],
      howToApply: "Please ask about official Indian government services like PM Kisan, Ayushman Bharat, Passport Renewal, Driving License, Aadhaar Card, Voter ID, or Ration Card.",
      officialUrl: "https://www.india.gov.in"
    };
  }

  // 1. Ayushman Bharat / Health Cover
  if (queryLower.includes("ayushman") || queryLower.includes("health card") || queryLower.includes("pmjay") || queryLower.includes("health insurance")) {
    return {
      isInvalid: false,
      title: "Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY)",
      description: "National health protection scheme providing cashless secondary and tertiary healthcare hospitalization cover across India.",
      category: "Health & Family Welfare",
      benefits: "Cashless health cover up to ₹5,000,000 per family per year across 29,000+ empaneled public and private hospitals.",
      eligibility: "Bottom 40% vulnerable families identified under SECC 2011 data, occupational categories, and senior citizens aged 70+.",
      documentsRequired: [
        "Aadhaar Card (linked with Mobile Number)",
        "Ration Card / Family ID",
        "PM-JAY Letter / Ayushman Golden Card (if previously issued)"
      ],
      howToApply: "1. Visit pmjay.gov.in and click 'Am I Eligible' using your phone number & Ration Card ID.\n2. Visit any empaneled hospital and meet the 'Ayushman Mitra'.\n3. Complete biometric e-KYC to get your instant e-Ayushman Card.",
      officialUrl: "https://pmjay.gov.in"
    };
  }

  // 2. PM Kisan / Farmer Schemes
  if (queryLower.includes("kisan") || queryLower.includes("farmer") || queryLower.includes("pmkisan") || queryLower.includes("agriculture")) {
    return {
      isInvalid: false,
      title: "PM-KISAN Samman Nidhi Scheme & Documentation",
      description: "Direct income support scheme by the Ministry of Agriculture for eligible landholding farmer families across India.",
      category: "Agriculture & Farmer Welfare",
      benefits: "Financial benefit of ₹6,000 per year transferred in three equal installments of ₹2,000 directly to verified bank accounts.",
      eligibility: "Small and marginal landholding farmer families with cultivable land in their name (subject to exclusion criteria).",
      documentsRequired: [
        "Aadhaar Card (Mandatory & linked with Bank Account)",
        "Landholding Ownership Papers (Khasra/Khatauni/Record of Rights)",
        "Active Bank Account Details with IFSC Code",
        "Valid Mobile Number for OTP Verification"
      ],
      howToApply: "1. Visit the official portal pmkisan.gov.in and click on 'New Farmer Registration'.\n2. Enter your Aadhaar number, state, and rural/urban category.\n3. Fill in land ownership details and upload property documents.\n4. Submit for verification by the local Revenue Officer / Patwari.",
      officialUrl: "https://pmkisan.gov.in"
    };
  }

  // 3. Passport / Passport Renewal / Re-issue
  if (queryLower.includes("passport") || queryLower.includes("visa") || queryLower.includes("psk")) {
    return {
      isInvalid: false,
      title: "Indian Passport Application & Renewal Guide",
      description: "Official procedures, documentation, and appointment booking for fresh issuance, renewal, or re-issue of Indian Passports.",
      category: "Travel & International Identity",
      benefits: "Globally accepted identity & nationality document enabling international travel and consular protection.",
      eligibility: "All citizens of India by birth, descent, registration, or naturalization.",
      documentsRequired: [
        "Existing Passport (Original & self-attested copies for renewal/re-issue)",
        "Proof of Present Address (Aadhaar Card / Utility Bill / Bank Statement)",
        "Proof of Date of Birth (Birth Certificate / Aadhaar / PAN Card)",
        "Annexure E / Self Declaration for address verification"
      ],
      howToApply: "1. Register on passportindia.gov.in and select your nearest Passport Seva Kendra (PSK).\n2. Complete the online application form and pay the processing fee online.\n3. Book an appointment slot at your designated PSK.\n4. Visit PSK with original documents for biometrics and document verification.",
      officialUrl: "https://www.passportindia.gov.in"
    };
  }

  // 4. Aadhaar Card / UIDAI
  if (queryLower.includes("aadhaar") || queryLower.includes("aadhar") || queryLower.includes("uidai")) {
    return {
      isInvalid: false,
      title: "Aadhaar Card Enrolment & Detail Update Guide",
      description: "Step-by-step guidance for fresh Aadhaar enrolment, biometric updates, and demographic changes (address/mobile/name).",
      category: "National Identity & Governance",
      benefits: "Universal 12-digit identification number serving as foundational proof of identity and address across India.",
      eligibility: "Every Indian resident residing in India for 182 days or more in the preceding 12 months.",
      documentsRequired: [
        "Proof of Identity (PAN Card / Voter ID / Passport)",
        "Proof of Address (Utility Bill / Ration Card / Bank Statement)",
        "Proof of Date of Birth (Birth Certificate / SSLC Marksheet)",
        "Existing Aadhaar Card (for updates)"
      ],
      howToApply: "1. Visit myaadhaar.uidai.gov.in to book an online appointment at an Aadhaar Seva Kendra.\n2. Walk in with original supporting identity and address documents.\n3. Undergo biometric scan (fingerprints, iris, photograph).\n4. Download e-Aadhaar online using the 28-digit Enrolment ID (EID).",
      officialUrl: "https://uidai.gov.in"
    };
  }

  // 5. Driving License / Parivahan / RTO
  if (queryLower.includes("driving") || queryLower.includes("license") || queryLower.includes("licence") || queryLower.includes("parivahan") || queryLower.includes("rto")) {
    return {
      isInvalid: false,
      title: "Driving License Application & Renewal (Parivahan)",
      description: "Official procedures for obtaining Learner's License, Permanent Driving License, or renewal through Parivahan Sewa.",
      category: "Transport & Road Safety",
      benefits: "Legal authorization to drive motor vehicles on public roads nationwide.",
      eligibility: "Age 18+ for motor vehicles with gear (Age 16+ for gearless 50cc scooters). Must hold valid Learner's License for 30 days.",
      documentsRequired: [
        "Valid Learner's License Number",
        "Proof of Age (Birth Certificate / School Leaving Certificate)",
        "Proof of Address (Aadhaar / Voter ID / Ration Card)",
        "Form 1A Medical Certificate (for commercial DL or applicants over 40)"
      ],
      howToApply: "1. Go to parivahan.gov.in and choose 'Drivers/ Learners License' under Online Services.\n2. Select your State, fill Form 4, and upload scanned documents.\n3. Schedule a slot for your practical driving test at the local RTO.\n4. Pass the driving test on the scheduled date to receive your Smart Card DL.",
      officialUrl: "https://parivahan.gov.in"
    };
  }

  // 6. Ambiguous / Financial & Social Assistance Queries
  if (queryLower.includes("financial help") || queryLower.includes("need help") || queryLower.includes("need money") || queryLower.includes("medical assistance") || queryLower.includes("poor") || queryLower.includes("loan") || queryLower.includes("pension") || queryLower.includes("subsidy")) {
    return {
      isInvalid: false,
      title: "Government Welfare & Financial Assistance Schemes",
      description: "Unified guidance for government income support, healthcare aid, micro-finance credit, and social security programs.",
      category: "Financial Assistance & Social Welfare",
      benefits: "Access to PM Jan Dhan Yojana (zero-balance bank accounts), PM Mudra Loans (up to ₹10 Lakh collateral-free credit), and Ayushman Bharat health cover.",
      eligibility: "Indian citizens, low-income households, small business owners, unorganized workers, and senior citizens.",
      documentsRequired: [
        "Aadhaar Card (linked with Mobile)",
        "Bank Passbook Details",
        "Income Certificate / BPL Ration Card",
        "Recent Passport-size Photographs"
      ],
      howToApply: "1. For Health Aid: Check eligibility for Ayushman Bharat at pmjay.gov.in.\n2. For Business Credit/Loan: Apply for PM Mudra Loan at mudra.org.in or any public sector bank.\n3. For Unified Welfare: Search eligible schemes tailored to your income profile at myscheme.gov.in.",
      officialUrl: "https://www.myscheme.gov.in"
    };
  }

  // 7. Check for general civic keywords
  const civicKeywords = [
    "help", "apply", "document", "scheme", "card", "certificate", "gov", "government",
    "bill", "water", "electricity", "tax", "police", "complaint", "pension", "school",
    "subsidy", "service", "ration", "form", "register", "status", "fee", "online", "office"
  ];

  const hasCivicIntent = civicKeywords.some(kw => queryLower.includes(kw));

  if (!hasCivicIntent) {
    return {
      isInvalid: true,
      title: "Not a Recognized Government Service",
      description: `The query "${q}" does not appear to relate to a recognized Indian government scheme, service, or civic procedure.`,
      category: "Unrecognized Query",
      benefits: "Non-civic queries cannot be decoded into government service cards.",
      eligibility: "N/A",
      documentsRequired: [],
      howToApply: "Please ask a specific question about Indian government services such as Ayushman Bharat, PM Kisan, Passport Renewal, Driving License, Aadhaar, Voter ID, or Ration Cards.",
      officialUrl: "https://www.india.gov.in"
    };
  }

  // If question contains general civic keywords, format dynamic card
  const cleanQ = q.replace(/[^\w\s]/gi, '').trim();
  const words = cleanQ.split(/\s+/).filter(w => w.length > 3);
  const mainSubject = words.slice(0, 4).join(" ") || cleanQ;

  return {
    isInvalid: false,
    title: `Civic Service: ${mainSubject.toUpperCase()}`,
    description: `Official guidelines, documentation, and procedural details regarding "${q}".`,
    category: "Government Services & Public Policy",
    benefits: "Direct access to official government procedures, welfare schemes, and citizen entitlements.",
    eligibility: "All eligible Indian Citizens fulfilling official department criteria.",
    documentsRequired: [
      "Government Photo ID (Aadhaar Card / Voter ID / PAN Card)",
      "Proof of Residence (Utility Bill / Ration Card / Domicile Certificate)",
      "Relevant Application Form & Supporting Documents"
    ],
    howToApply: `1. Visit the official portal related to ${mainSubject} or your nearest Jan Seva Kendra.\n2. Complete the prescribed application form with verified details.\n3. Submit required supporting documents.\n4. Retain the acknowledgment receipt to track status.`,
    officialUrl: "https://www.india.gov.in"
  };
}

export async function POST(request: NextRequest) {
  console.info("[API] POST /api/ai/ask initiated");
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (askAiRateLimiter.isRateLimited(ip)) {
      return errorResponse("Too many questions asked. Please wait a minute and try again.", 429);
    }

    const body = await request.json();
    
    // 1. Validation
    const parseResult = AskSchema.safeParse(body);
    if (!parseResult.success) {
      return errorResponse(parseResult.error.issues[0].message, 400);
    }
    
    const { question } = parseResult.data;
    const trimmedQuestion = sanitizeInput(question);

    console.info(`[DEBUG 1] User's actual input received at API: "${trimmedQuestion}"`);

    // 2. Check Cache
    const cacheKey = crypto.createHash('sha256').update(trimmedQuestion.toLowerCase()).digest('hex');
    const cachedResponse = aiAskCache.get(cacheKey);
    
    if (cachedResponse) {
      console.info(`[API] Cache hit for question: "${trimmedQuestion}"`);
      return standardResponse(cachedResponse);
    }

    // 3. AI Processing with Retry & Strict Prompt Instructions
    const prompt = `You are SmartSeva, an AI Civic Copilot for Smart Bharat (Government of India citizen services).

A citizen has asked the following specific question:
"${trimmedQuestion}"

CRITICAL SYSTEM INSTRUCTION:
1. First evaluate if "${trimmedQuestion}" is a real, recognized Indian government scheme, service, subsidy, identity document, driving license, passport, tax, civic complaint, or public welfare procedure.
2. IF IT IS A NONSENSE, FICTIONAL, OR NON-CIVIC QUESTION (e.g. "How do I become Iron Man?", "Tell me a joke", "How to fly to Mars"):
Return ONLY valid JSON (no markdown):
{
  "isInvalid": true,
  "title": "Not a Recognized Government Service",
  "description": "The query does not relate to a recognized Indian government scheme, service, or civic procedure.",
  "category": "Unrecognized Query",
  "benefits": "N/A - Non-civic query",
  "eligibility": "N/A - Fictional or non-government query",
  "documentsRequired": [],
  "howToApply": "Please ask about official Indian government services like PM Kisan, Ayushman Bharat, Passport Renewal, Driving License, Aadhaar, Voter ID, or Ration Card.",
  "officialUrl": "https://www.india.gov.in"
}

3. IF IT IS A VALID GOVERNMENT SCHEME OR CIVIC SERVICE (e.g. PM Kisan, Ayushman Bharat, Passport, Aadhaar, Driving License, etc.):
Return ONLY valid JSON (no markdown):
{
  "isInvalid": false,
  "title": "Concise factual title of the scheme or service",
  "description": "Clear factual summary of the scheme or service",
  "category": "Category (e.g. Health, Agriculture, Identity, Transport, Education)",
  "benefits": "Key benefits and entitlements",
  "eligibility": "Specific eligibility criteria for Indian citizens",
  "documentsRequired": ["Document 1", "Document 2"],
  "howToApply": "Step-by-step application instructions and portal details",
  "officialUrl": "Official government website link"
}`;

    console.info(`[DEBUG 2] Prompt sent to Gemini includes question: "${trimmedQuestion}"`);

    let cardData: DecodedCardResponse | null = null;

    try {
      const result = await withRetry(() => geminiModel.generateContent(prompt), 2, 800);
      const text = result.response.text();

      console.info(`[DEBUG 3] Raw Gemini response text for question "${trimmedQuestion}":\n`, text);

      let cleanedText = text.trim();
      cleanedText = cleanedText.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/, "").trim();

      const parsed = JSON.parse(cleanedText);
      cardData = parsed;
      console.info(`[DEBUG 4] Successfully parsed Gemini output for: "${trimmedQuestion}"`);
    } catch (geminiError: unknown) {
      console.warn(`[DEBUG 5] Gemini API notice for "${trimmedQuestion}":`, geminiError instanceof Error ? geminiError.message : geminiError);
      console.info(`[DEBUG 6] Executing domain-aware intent validator for "${trimmedQuestion}"`);
      
      // Execute domain-aware intent validator
      cardData = generateQuestionSpecificCard(trimmedQuestion);
    }

    if (!cardData) {
      cardData = generateQuestionSpecificCard(trimmedQuestion);
    }

    // 4. Save to Cache
    aiAskCache.set(cacheKey, cardData);

    return standardResponse(cardData);
  } catch (error: unknown) {
    console.error("[API] Ask API unexpected error:", error);
    return errorResponse("Unable to process your question right now. Please try again.", 500);
  }
}
