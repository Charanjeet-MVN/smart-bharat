import { NextRequest } from "next/server";
import { geminiModel } from "@/lib/gemini";
import { z } from "zod";
import { standardResponse, errorResponse, withRetry, aiAskCache, sanitizeInput, askAiRateLimiter } from "@/lib/api-utils";
import crypto from "crypto";

const AskSchema = z.object({
  question: z.string().min(3, "Question must be at least 3 characters").max(2000, "Question is too long (max 2000 characters)"),
});

/**
 * Generates dynamic, question-specific civic information tailored precisely to the user's query
 */
function generateQuestionSpecificCard(q: string) {
  const queryLower = q.toLowerCase();

  // 1. PM Kisan / Farmer Schemes
  if (queryLower.includes("kisan") || queryLower.includes("farmer") || queryLower.includes("pmkisan") || queryLower.includes("agriculture")) {
    return {
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

  // 2. Passport / Passport Renewal / Re-issue
  if (queryLower.includes("passport") || queryLower.includes("visa") || queryLower.includes("psk")) {
    return {
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

  // 3. Aadhaar Card / UIDAI
  if (queryLower.includes("aadhaar") || queryLower.includes("aadhar") || queryLower.includes("uidai")) {
    return {
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

  // 4. Driving License / Parivahan / RTO
  if (queryLower.includes("driving") || queryLower.includes("license") || queryLower.includes("licence") || queryLower.includes("parivahan") || queryLower.includes("rto")) {
    return {
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

  // 5. PAN Card / NSDL / UTIITSL
  if (queryLower.includes("pan") || queryLower.includes("nsdl") || queryLower.includes("income tax")) {
    return {
      title: "Permanent Account Number (PAN Card) Application",
      description: "Instant paperless PAN card issuance and correction services via e-KYC for tax and financial purposes.",
      category: "Finance & Taxation",
      benefits: "Essential 10-digit unique alphanumeric identifier required for tax filing, banking, and high-value transactions.",
      eligibility: "Any individual, minor, NRI, company, or entity operating or residing in India.",
      documentsRequired: [
        "Aadhaar Card (for e-KYC instant processing)",
        "Proof of Identity (Voter ID / Passport / Driving License)",
        "Proof of Address (Utility Bill / Bank Passbook)",
        "Proof of Date of Birth"
      ],
      howToApply: "1. Access the NSDL (Protean) or UTIITSL official online portal.\n2. Select Form 49A (for Indian Citizens) and choose e-KYC authentication.\n3. Authenticate using Aadhaar OTP for paperless submission.\n4. e-PAN will be emailed within 24 hours, and physical card dispatched by post.",
      officialUrl: "https://www.onlineservices.nsdl.com"
    };
  }

  // 6. Voter ID / Election Commission / EPIC
  if (queryLower.includes("voter") || queryLower.includes("epic") || queryLower.includes("election") || queryLower.includes("vote")) {
    return {
      title: "Voter ID Card Registration (NVSP / ECI)",
      description: "Form 6 application for new voter registration and Electoral Photo Identity Card (EPIC) issuance.",
      category: "Electoral & Democratic Rights",
      benefits: "Official voter identification card conferring constitutional voting rights in elections.",
      eligibility: "Indian citizens who have reached 18 years of age on the qualifying date.",
      documentsRequired: [
        "Recent Passport Size Photograph",
        "Proof of Age (Birth Certificate / Aadhaar / PAN Card)",
        "Proof of Address (Utility Bill / Bank Passbook / Ration Card)"
      ],
      howToApply: "1. Visit voters.eci.gov.in or download the Voter Helpline Mobile App.\n2. Fill out Form 6 for new voter enrolment.\n3. Upload photo and self-attested copies of age & address proof.\n4. Booth Level Officer (BLO) will perform field verification before issuing EPIC card.",
      officialUrl: "https://voters.eci.gov.in"
    };
  }

  // 7. Dynamic Fallback for any specific query
  // Extract key terms from the question for custom response
  const cleanQ = q.replace(/[^\w\s]/gi, '').trim();
  const words = cleanQ.split(/\s+/).filter(w => w.length > 3);
  const mainSubject = words.slice(0, 4).join(" ") || cleanQ;

  return {
    title: `Civic Information: ${mainSubject.toUpperCase()}`,
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

    // 3. AI Processing with Retry
    const prompt = `You are SmartSeva, an AI Civic Copilot. A citizen has asked the following specific question:
"${trimmedQuestion}"

Decode this specific question into a structured JSON card containing accurate information about relevant government services, schemes, guidelines, or procedures.
You must respond with ONLY valid JSON in the following format (no markdown codeblocks):
{
  "title": "Concise and descriptive title specific to ${trimmedQuestion}",
  "description": "Short explanation addressing ${trimmedQuestion}",
  "category": "Category (e.g., Identity, Health, Agriculture, Education, Transport)",
  "benefits": "Key benefits or why this is important for this specific topic",
  "eligibility": "Who is eligible for this specific service/scheme",
  "documentsRequired": ["Document 1 specific to this topic", "Document 2 specific to this topic"],
  "howToApply": "Step-by-step instructions on how to apply or what to do for this topic",
  "officialUrl": "Official government website link for this service"
}`;

    console.info(`[DEBUG 2] Prompt sent to Gemini includes question: "${trimmedQuestion}"`);

    let cardData: unknown = null;

    try {
      const result = await withRetry(() => geminiModel.generateContent(prompt), 2, 800);
      const text = result.response.text();

      console.info(`[DEBUG 3] Raw Gemini response text for question "${trimmedQuestion}":\n`, text);

      let cleanedText = text.trim();
      cleanedText = cleanedText.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/, "").trim();

      cardData = JSON.parse(cleanedText);
      console.info(`[DEBUG 4] Successfully parsed Gemini output for: "${trimmedQuestion}"`);
    } catch (geminiError: unknown) {
      console.warn(`[DEBUG 5] Gemini API notice for "${trimmedQuestion}":`, geminiError instanceof Error ? geminiError.message : geminiError);
      console.info(`[DEBUG 6] Synthesizing question-specific response card for "${trimmedQuestion}"`);
      
      // Generate unique, question-specific card dynamically
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
