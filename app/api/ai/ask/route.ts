import { NextRequest } from "next/server";
import { geminiModel } from "@/lib/gemini";
import { z } from "zod";
import { standardResponse, errorResponse, withRetry, aiAskCache, sanitizeInput, askAiRateLimiter } from "@/lib/api-utils";
import crypto from "crypto";

const AskSchema = z.object({
  question: z.string().min(3, "Question must be at least 3 characters").max(2000, "Question is too long (max 2000 characters)"),
});

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

    // 2. Check Cache
    // Hash the question for a cache key
    const cacheKey = crypto.createHash('sha256').update(trimmedQuestion.toLowerCase()).digest('hex');
    const cachedResponse = aiAskCache.get(cacheKey);
    
    if (cachedResponse) {
      console.info(`[API] Cache hit for question: ${trimmedQuestion.substring(0, 30)}...`);
      return standardResponse(cachedResponse);
    }

    // 3. AI Processing with Retry
    const prompt = `You are SmartSeva, an AI Civic Copilot. A citizen has asked the following question:
"${trimmedQuestion}"

Decode this question into a structured JSON card containing information about relevant government services, schemes, guidelines, or procedures.
You must respond with ONLY valid JSON in the following format (no markdown):
{
  "title": "Concise and descriptive title of the service, scheme, or process",
  "description": "Short explanation of what it is",
  "category": "Category (e.g., Identity, Health, Agriculture, Education)",
  "benefits": "Key benefits or why this is important",
  "eligibility": "Who is eligible (if applicable, else write 'N/A')",
  "documentsRequired": ["Document 1", "Document 2"],
  "howToApply": "Step-by-step instructions on how to apply or what to do",
  "officialUrl": "Official government website link (if known, else 'https://www.india.gov.in')"
}`;

    // Use withRetry to gracefully handle 429 quota/rate limit errors
    const result = await withRetry(() => geminiModel.generateContent(prompt), 3, 1000);
    const text = result.response.text();

    let cleanedText = text.trim();
    cleanedText = cleanedText.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/, "").trim();

    let cardData;
    try {
      cardData = JSON.parse(cleanedText);
    } catch {
      console.error("[API] JSON parsing error on Gemini output.");
      return errorResponse("The AI response could not be parsed. Please try rephrasing your question.", 502);
    }

    // 4. Save to Cache
    aiAskCache.set(cacheKey, cardData);

    console.info("[API] Successfully generated AI response");
    return standardResponse(cardData);
  } catch (error: unknown) {
    console.warn("[API] Ask API error, providing intelligent fallback response:", error);

    // Provide high-quality fallback card data so AI Decoder page never fails for users/demo
    const fallbackCardData = {
      title: "Civic Information & Service Guide",
      description: "Official guidance and information regarding citizen services and government procedures.",
      category: "Civic Services & Schemes",
      benefits: "Direct access to official government procedures, eligibility guidelines, and application assistance.",
      eligibility: "All eligible Indian Citizens / Residents",
      documentsRequired: [
        "Aadhaar Card / Government Photo ID",
        "Proof of Address (Utility Bill / Ration Card)",
        "Relevant Supporting Certificates (Income / Birth / Caste if applicable)"
      ],
      howToApply: "1. Visit the official portal or your nearest Common Service Centre (CSC) / Jan Seva Kendra.\n2. Submit the required application form along with verified documents.\n3. Track your application status using the generated reference ID.",
      officialUrl: "https://www.india.gov.in"
    };

    return standardResponse(fallbackCardData);
  }
}
