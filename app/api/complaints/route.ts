import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { geminiModel } from "@/lib/gemini";
import crypto from "crypto";

export async function GET() {
  try {
    const { data: complaints, error } = await supabase
      .from("complaints")
      .select("*")
      .order("createdAt", { ascending: false });

    if (error) {
      console.warn("Error fetching with camelCase, trying snake_case...", error);
      const { data: complaintsSnake, error: errorSnake } = await supabase
        .from("complaints")
        .select("*")
        .order("created_at", { ascending: false });

      if (errorSnake) throw errorSnake;
      return NextResponse.json(complaintsSnake);
    }

    return NextResponse.json(complaints);
  } catch (error) {
    console.error("Fetch complaints error:", error);
    return NextResponse.json({ error: "Failed to fetch complaints" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { description, address, forceCreate } = await request.json();
    if (!description || description.trim().length === 0) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 });
    }

    // Duplicate Check Logic
    if (!forceCreate) {
      // Fetch recent complaints to check against
      const { data: recentComplaints } = await supabase
        .from("complaints")
        .select("id, title, description, address")
        .order("createdAt", { ascending: false })
        .limit(20);

      // Try snake_case if camelCase fails (common Supabase quirk in this project)
      let complaintsToCheck = recentComplaints;
      if (!complaintsToCheck) {
        const { data: recentComplaintsSnake } = await supabase
          .from("complaints")
          .select("id, title, description, address")
          .order("created_at", { ascending: false })
          .limit(20);
        complaintsToCheck = recentComplaintsSnake;
      }

      if (complaintsToCheck && complaintsToCheck.length > 0) {
        const dupPrompt = `You are a civic issue duplicate detector.
A citizen is reporting a new issue:
Description: "${description}"
Address: "${address || 'Not specified'}"

Here are recent complaints reported in the system:
${JSON.stringify(complaintsToCheck)}

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
        
        try {
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
          console.error("Duplicate detection parse error:", e);
        }
      }
    }

    const prompt = `You are an AI Civic Assistant. A citizen has reported a civic issue:
Issue description: "${description}"

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
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.substring(7);
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.substring(3);
    }
    if (cleanedText.endsWith("```")) {
      cleanedText = cleanedText.substring(0, cleanedText.length - 3);
    }
    cleanedText = cleanedText.trim();

    let draft;
    try {
      draft = JSON.parse(cleanedText);
    } catch {
      draft = {
        title: "Civic Issue Report",
        description: description,
        category: "Other",
        department: "Municipal Corporation",
        priority: "MEDIUM"
      };
    }

    const dummyUser = {
      id: "dummy-user-id",
      clerkId: "dummy-clerk-id",
      email: "dummy@example.com",
      name: "Anonymous Citizen"
    };

    const { error: userError } = await supabase
      .from("users")
      .upsert(dummyUser, { onConflict: "id" });
      
    if (userError) {
      console.warn("Failed to upsert dummy user, the table might have different columns or not exist:", userError);
    }

    const trackingId = `COMP-${Math.floor(100000 + Math.random() * 900000)}`;
    const complaintId = crypto.randomUUID();

    const complaintData = {
      id: complaintId,
      userId: dummyUser.id,
      trackingId,
      title: draft.title,
      description: draft.description,
      category: draft.category,
      department: draft.department,
      status: "SUBMITTED",
      priority: draft.priority,
      address: address || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const { data, error: insertError } = await supabase
      .from("complaints")
      .insert(complaintData)
      .select();

    if (insertError) {
      console.error("Primary insert failed, trying snake_case fallback...", insertError);
      
      const snakeCaseData = {
        id: complaintId,
        user_id: dummyUser.id,
        tracking_id: trackingId,
        title: draft.title,
        description: draft.description,
        category: draft.category,
        department: draft.department,
        status: "SUBMITTED",
        priority: draft.priority,
        address: address || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: dataSnake, error: insertErrorSnake } = await supabase
        .from("complaints")
        .insert(snakeCaseData)
        .select();

      if (insertErrorSnake) {
        throw insertErrorSnake;
      }
      return NextResponse.json({ success: true, complaint: dataSnake[0] });
    }

    return NextResponse.json({ success: true, complaint: data[0] });
  } catch (error) {
    console.error("Post complaint error:", error);
    return NextResponse.json({ error: "Failed to submit complaint" }, { status: 500 });
  }
}
