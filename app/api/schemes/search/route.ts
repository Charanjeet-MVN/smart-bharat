import { NextRequest, NextResponse } from "next/server";
import { searchSchemes } from "@/lib/gemini";
import { z } from "zod";
import { standardResponse, errorResponse, withRetry, schemesSearchCache, sanitizeInput, schemesSearchRateLimiter } from "@/lib/api-utils";
import crypto from "crypto";

const SearchSchema = z.object({
  query: z.string().min(2, "Search query must be at least 2 characters").max(200, "Search query is too long"),
});

export async function POST(request: NextRequest) {
  console.info("\n==========================================");
  console.info("[SCHEMES SEARCH API INITIATED]");
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (schemesSearchRateLimiter.isRateLimited(ip)) {
      console.warn("[SCHEMES SEARCH] Rate limited by IP token bucket");
      return errorResponse("Too many searches. Please wait a minute and try again.", 429);
    }

    const body = await request.json();
    
    // 1. Validation
    const parseResult = SearchSchema.safeParse(body);
    if (!parseResult.success) {
      console.warn("[SCHEMES SEARCH] Zod validation failed:", parseResult.error.issues[0].message);
      return errorResponse(parseResult.error.issues[0].message, 400);
    }
    
    const { query } = parseResult.data;
    const trimmedQuery = sanitizeInput(query);

    console.info(`-> Search Query Received: "${trimmedQuery}"`);

    // 2. Check Cache
    const cacheKey = crypto.createHash('sha256').update(trimmedQuery.toLowerCase()).digest('hex');
    const cachedResponse = schemesSearchCache.get(cacheKey);
    
    if (cachedResponse) {
      console.info(`[SCHEMES SEARCH] Cache hit for query: "${trimmedQuery}"`);
      return standardResponse(cachedResponse);
    }

    // 3. AI Processing with Retry
    console.info("[SCHEMES SEARCH] Calling searchSchemes AI function...");
    let schemesResult: unknown[] = [];

    try {
      schemesResult = await withRetry(() => searchSchemes(trimmedQuery), 3, 500);
      console.info(`[SCHEMES SEARCH] AI returned ${schemesResult.length} schemes.`);
    } catch (geminiError: unknown) {
      const errorMsg = geminiError instanceof Error ? geminiError.message : String(geminiError);
      console.warn(`[SCHEMES SEARCH] AI CALL FAILED: -> ${errorMsg}`);

      let status: number;
      let userError: string;

      if (/429|quota|resource_exhausted/i.test(errorMsg)) {
        status = 429;
        userError = "AI search is temporarily unavailable due to API rate limits (HTTP 429 / Quota). Please try again later.";
      } else if (/404|not found|is not found for api version|deprecated/i.test(errorMsg)) {
        status = 502;
        userError = "The AI model is currently unavailable or has been deprecated. Please contact support.";
      } else {
        status = 503;
        userError = "AI search is temporarily unavailable. Please try again in a few moments.";
      }

      return NextResponse.json({
        success: false,
        error: userError,
        fallbackReason: errorMsg
      }, { status });
    }

    // 4. Save to Cache if valid response from AI
    schemesSearchCache.set(cacheKey, schemesResult);

    console.info("[SCHEMES SEARCH] FINAL RESPONSE SENT TO UI");
    return standardResponse(schemesResult);
  } catch (error: unknown) {
    console.error("[SCHEMES SEARCH] Unexpected error:", error);
    return errorResponse("Unable to process your search right now. Please try again.", 500);
  }
}
