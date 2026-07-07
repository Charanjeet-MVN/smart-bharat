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
    const { description, address } = await request.json();
    if (!description || description.trim().length === 0) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 });
    }

    const prompt = `You are a helpful civic assistant. A citizen has reported a civic issue:
Issue description: "${description}"
Address/Location: "${address || 'Not specified'}"

Draft a formal complaint based on this report.
You must respond with ONLY valid JSON in the following format (no markdown, no backticks, no wrap):
{
  "title": "A short, professional title for the complaint (e.g., Pothole on Main Road)",
  "description": "A formal, structured description of the issue (2-3 sentences)",
  "category": "One of: Infrastructure, Sanitation, Water Supply, Electricity, Roads, Public Property, Environment, Other",
  "department": "Municipal Corporation / Department name responsible for this issue",
  "priority": "One of: LOW, MEDIUM, HIGH, URGENT"
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
