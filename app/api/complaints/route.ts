import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { geminiModel } from "@/lib/gemini";
import crypto from "crypto";

export async function GET() {
  try {
    const { data: complaints, error } = await supabase
      .from("complaints")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(complaints ?? []);
  } catch (error: unknown) {
    console.error("Fetch complaints error:", error);
    return NextResponse.json(
      { error: "Failed to fetch complaints. Please check your database configuration." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { description, address, forceCreate } = body;

    if (!description || typeof description !== "string" || description.trim().length === 0) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 });
    }
    if (description.trim().length > 5000) {
      return NextResponse.json({ error: "Description is too long (max 5000 characters)" }, { status: 400 });
    }

    const trimmedDesc = description.trim();
    const trimmedAddr = typeof address === "string" ? address.trim() : "";

    // Duplicate Check Logic
    if (!forceCreate) {
      const { data: recentComplaints } = await supabase
        .from("complaints")
        .select("id, title, description, address")
        .order("created_at", { ascending: false })
        .limit(20);

      if (recentComplaints && recentComplaints.length > 0) {
        try {
          const dupPrompt = `You are a civic issue duplicate detector.
A citizen is reporting a new issue:
Description: "${trimmedDesc}"
Address: "${trimmedAddr || 'Not specified'}"

Here are recent complaints reported in the system:
${JSON.stringify(recentComplaints)}

Are any of these recent complaints highly likely to be the exact same issue at the same location as the new report? 
Ignore minor differences in phrasing, but ensure the core issue and location match.

Respond with ONLY valid JSON (no markdown):
{
  "isDuplicate": true or false,
  "duplicateId": "if true, the ID of the matched complaint, else null",
  "duplicateTitle": "if true, the title of the matched complaint, else null"
}`;

          const dupResult = await geminiModel.generateContent(dupPrompt);
          let dupText = dupResult.response.text().trim();
          dupText = dupText.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/, "").trim();

          const dupData = JSON.parse(dupText);
          if (dupData.isDuplicate && dupData.duplicateId) {
            return NextResponse.json({
              isDuplicate: true,
              duplicate: {
                id: dupData.duplicateId,
                title: dupData.duplicateTitle
              }
            }, { status: 409 });
          }
        } catch (e) {
          // Duplicate detection is best-effort — continue if it fails
          console.warn("Duplicate detection failed, continuing with creation:", e);
        }
      }
    }

    // AI Classification
    const prompt = `You are an AI Civic Assistant. A citizen has reported a civic issue:
Issue description: "${trimmedDesc}"

Your task is to ignore any conversational filler words and focus purely on extracting the core facts to categorize the complaint.

Please extract the following details and respond with ONLY valid JSON (no markdown, no backticks, no wrap):
{
  "title": "A concise, factual title for the complaint (e.g., Pothole on Main Road)",
  "category": "One of: Infrastructure, Sanitation, Water Supply, Electricity, Roads, Public Property, Environment, Other",
  "department": "Specific Government Department responsible (e.g., Water Board, Public Works Department)",
  "priority": "One of: LOW, MEDIUM, HIGH, URGENT (assess severity based on public hazard)",
  "description": "A clear, formal summary of the issue without any filler words."
}`;

    const result = await geminiModel.generateContent(prompt);
    const text = result.response.text();

    let cleanedText = text.trim();
    cleanedText = cleanedText.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/, "").trim();

    let draft;
    try {
      draft = JSON.parse(cleanedText);
    } catch {
      draft = {
        title: "Civic Issue Report",
        description: trimmedDesc,
        category: "Other",
        department: "Municipal Corporation",
        priority: "MEDIUM"
      };
    }

    const trackingId = `COMP-${Math.floor(100000 + Math.random() * 900000)}`;
    const complaintId = crypto.randomUUID();

    const complaintData = {
      id: complaintId,
      user_id: "anonymous",
      tracking_id: trackingId,
      title: draft.title,
      description: draft.description,
      category: draft.category,
      department: draft.department,
      status: "SUBMITTED",
      priority: draft.priority,
      address: trimmedAddr || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error: insertError } = await supabase
      .from("complaints")
      .insert(complaintData)
      .select();

    if (insertError) throw insertError;

    return NextResponse.json({ success: true, complaint: data?.[0] ?? complaintData });
  } catch (error: unknown) {
    console.error("Post complaint error:", error);
    return NextResponse.json(
      { error: "Failed to submit complaint. Please try again later." },
      { status: 500 }
    );
  }
}
