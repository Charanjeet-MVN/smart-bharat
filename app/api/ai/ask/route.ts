import { NextRequest, NextResponse } from "next/server";
import { geminiModel } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json();
    if (!question || question.trim().length === 0) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    const prompt = `You are SmartSeva, an AI Civic Copilot. A citizen has asked the following question:
"${question}"

Decode this question into a structured JSON card containing information about relevant government services, schemes, guidelines, or procedures.
You must respond with ONLY valid JSON in the following format (no markdown, no backticks, no wrap):
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

    const result = await geminiModel.generateContent(prompt);
    const text = result.response.text();

    console.log("Raw Gemini Response Text:", text);

    // Make the JSON parsing defensive
    // Strip markdown code fences (```json and ```) using regex
    let cleanedText = text.trim();
    cleanedText = cleanedText.replace(/^```json\s*/i, "");
    cleanedText = cleanedText.replace(/^```\s*/, "");
    cleanedText = cleanedText.replace(/\s*```$/, "");
    cleanedText = cleanedText.trim();

    try {
      const cardData = JSON.parse(cleanedText);
      return NextResponse.json(cardData);
    } catch (parseError: any) {
      console.error("JSON parsing error on Gemini output:", parseError);
      console.error("Failed text content:", cleanedText);
      return NextResponse.json(
        { 
          error: "Failed to parse Gemini output as JSON", 
          details: parseError.message, 
          rawText: text 
        }, 
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Ask API raw error:", error);
    return NextResponse.json(
      { error: "Failed to decode question", details: error.message }, 
      { status: 500 }
    );
  }
}
