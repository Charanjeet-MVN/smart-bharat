import { NextRequest, NextResponse } from "next/server";
import { geminiModel } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json();
    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }
    if (question.trim().length > 2000) {
      return NextResponse.json({ error: "Question is too long (max 2000 characters)" }, { status: 400 });
    }

    const prompt = `You are SmartSeva, an AI Civic Copilot. A citizen has asked the following question:
"${question.trim()}"

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

    let cleanedText = text.trim();
    cleanedText = cleanedText.replace(/^```json\s*/i, "");
    cleanedText = cleanedText.replace(/^```\s*/, "");
    cleanedText = cleanedText.replace(/\s*```$/, "");
    cleanedText = cleanedText.trim();

    try {
      const cardData = JSON.parse(cleanedText);
      return NextResponse.json(cardData);
    } catch {
      console.error("JSON parsing error on Gemini output. Raw:", text);
      return NextResponse.json(
        { error: "The AI response could not be parsed. Please try rephrasing your question." },
        { status: 502 }
      );
    }
  } catch (error: unknown) {
    console.error("Ask API error:", error);

    // Provide specific user-facing error messages
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("429") || message.includes("quota") || message.includes("rate")) {
      return NextResponse.json(
        { error: "The AI service is currently busy. Please wait a moment and try again." },
        { status: 429 }
      );
    }
    if (message.includes("API key") || message.includes("401") || message.includes("403")) {
      return NextResponse.json(
        { error: "AI service configuration error. Please contact the administrator." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Unable to process your question right now. Please try again." },
      { status: 500 }
    );
  }
}
