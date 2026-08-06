import { NextRequest, NextResponse } from "next/server";
import { geminiModel } from "@/lib/gemini";
import { z } from "zod";
import { standardResponse, errorResponse, withRetry, aiAskCache, sanitizeInput, askAiRateLimiter, simpleHash } from "@/lib/api-utils";

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

export async function POST(request: NextRequest) {
  console.info("\n==========================================");
  console.info("[STAGE 1: USER INPUT]");
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (askAiRateLimiter.isRateLimited(ip)) {
      console.warn("[STAGE 1: RATE LIMIT] Rate limited by IP token bucket");
      return errorResponse("Too many questions asked. Please wait a minute and try again.", 429);
    }

    const body = await request.json();
    
    // 1. Validation
    const parseResult = AskSchema.safeParse(body);
    if (!parseResult.success) {
      console.warn("[STAGE 1: VALIDATION FAILED]", parseResult.error.issues[0].message);
      return errorResponse(parseResult.error.issues[0].message, 400);
    }
    
    const { question } = parseResult.data;
    const trimmedQuestion = sanitizeInput(question);

    console.info(`-> Question Received: "${trimmedQuestion}"`);

    // 2. Check Cache
    const cacheKey = simpleHash(trimmedQuestion.toLowerCase());
    const cachedResponse = aiAskCache.get(cacheKey);
    
    if (cachedResponse) {
      console.info(`[STAGE 2: CACHE] Cache hit for question: "${trimmedQuestion}"`);
      return standardResponse(cachedResponse);
    }

    // 3. Prompt Construction
    console.info("[STAGE 2: PROMPT CONSTRUCTION]");
    const prompt = `You are SmartSeva, an AI Civic Copilot for Smart Bharat (Government of India citizen services).

A citizen has asked the following query:
"${trimmedQuestion}"

CRITICAL INSTRUCTION:
1. First evaluate if "${trimmedQuestion}" is a real, recognized Indian government scheme, service, subsidy, identity document, driving license, passport, tax, civic complaint, or public welfare procedure.

2. IF IT IS A NONSENSE, FICTIONAL, OR NON-CIVIC QUESTION (e.g. "How do I become Iron Man?", "Tell me a joke", "How to fly to Mars"):
You must respond with ONLY valid JSON (no markdown):
{
  "isInvalid": true,
  "title": "Not a Recognized Government Service",
  "description": "The query does not relate to any recognized Indian government scheme, service, or civic procedure.",
  "category": "Unrecognized Query",
  "benefits": "N/A - Non-civic query",
  "eligibility": "N/A - Fictional or non-government query",
  "documentsRequired": [],
  "howToApply": "Please ask about official Indian government services like PM Kisan, Ayushman Bharat, Passport Renewal, Driving License, Aadhaar, Voter ID, or Ration Card.",
  "officialUrl": "https://www.india.gov.in"
}

3. IF IT IS A VALID GOVERNMENT SCHEME OR CIVIC SERVICE (e.g. PM Kisan, Ayushman Bharat, Passport, Aadhaar, Driving License, etc.):
You must respond with ONLY valid JSON (no markdown):
{
  "isInvalid": false,
  "title": "Concise factual title of the scheme or service",
  "description": "Clear factual summary of the scheme or service",
  "category": "Category (e.g. Health, Agriculture, Identity, Transport, Education)",
  "benefits": "Key benefits and entitlements",
  "eligibility": "Specific eligibility criteria for Indian citizens",
  "documentsRequired": ["Document 1", "Document 2"],
  "howToApply": "Step-by-step application instructions and portal details",
  "officialUrl": "Exact official government portal URL for this specific scheme (e.g. https://pmkisan.gov.in, https://pmjay.gov.in, https://passportindia.gov.in)"
}`;

    console.info(`-> Prompt Built for Gemini`);

    // 4. Gemini API Call Execution
    console.info("[STAGE 3: GEMINI API CALL]");
    let rawText = "";

    try {
      const result = await withRetry(() => geminiModel.generateContent(prompt), 3, 500);
      rawText = result.response.text();
      console.info(`[STAGE 4: RAW GEMINI RESPONSE]\n${rawText}\n`);
    } catch (geminiError: unknown) {
      const errorMsg = geminiError instanceof Error ? geminiError.message : String(geminiError);
      console.warn("[STAGE 4: GEMINI CALL FAILED]");
      console.warn(`Reason Fallback Executed: Gemini API error -> ${errorMsg}`);

      // Honest Error Response — Never fabricate fake scheme data when AI fails
      let status: number;
      let userError: string;

      if (/429|quota|resource_exhausted/i.test(errorMsg)) {
        status = 429;
        userError = "AI service is temporarily unavailable due to API rate limits (HTTP 429 / Quota). Please try again later.";
      } else if (/404|not found|is not found for api version|deprecated/i.test(errorMsg)) {
        status = 502;
        userError = "The AI model is currently unavailable or has been deprecated. Please contact support.";
      } else {
        status = 503;
        userError = "AI service is temporarily unavailable. Please try again in a few moments.";
      }

      return NextResponse.json({
        success: false,
        error: userError,
        fallbackReason: errorMsg
      }, { status });
    }

    // 5. JSON Parser
    console.info("[STAGE 5: JSON PARSER]");
    let cleanedText = rawText.trim();
    cleanedText = cleanedText.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/, "").trim();

    let parsedCard: DecodedCardResponse;
    try {
      parsedCard = JSON.parse(cleanedText);
      console.info("-> Parsed JSON Object:", JSON.stringify(parsedCard, null, 2));
    } catch (parseError: unknown) {
      console.error("[STAGE 5 FAILED] JSON parse error:", parseError);
      return NextResponse.json({
        success: false,
        error: "Failed to parse AI response. Please try rephrasing your question.",
        fallbackReason: "JSON parse error"
      }, { status: 502 });
    }

    // 6. Save to Cache if valid response from Gemini
    aiAskCache.set(cacheKey, parsedCard);

    console.info("[STAGE 6: FINAL RESPONSE SENT TO UI]");
    return standardResponse(parsedCard);
  } catch (error: unknown) {
    console.error("[API] Ask API unexpected error:", error);
    return errorResponse("Unable to process your question right now. Please try again.", 500);
  }
}
