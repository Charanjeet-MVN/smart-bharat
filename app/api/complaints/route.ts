import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { geminiModel } from "@/lib/gemini";
import crypto from "crypto";
import { z } from "zod";
import { standardResponse, errorResponse, withRetry } from "@/lib/api-utils";

const CreateComplaintSchema = z.object({
  description: z.string().min(10, "Description must be at least 10 characters long").max(5000, "Description is too long (max 5000 characters)"),
  address: z.string().optional(),
  forceCreate: z.boolean().optional().default(false),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination parameters
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "50")));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Build optimized query
    let query = supabase
      .from("complaints")
      .select("id, tracking_id, title, category, department, priority, status, address, created_at, updated_at", { count: 'exact' });

    // Filtering
    const department = searchParams.get("department");
    if (department && department !== "All") query = query.eq("department", department);

    const status = searchParams.get("status");
    if (status && status !== "All") query = query.eq("status", status);

    const priority = searchParams.get("priority");
    if (priority && priority !== "All") query = query.eq("priority", priority);

    const startDate = searchParams.get("startDate");
    if (startDate) query = query.gte("created_at", startDate);

    const endDate = searchParams.get("endDate");
    if (endDate) query = query.lte("created_at", endDate);

    // Sorting
    const sortBy = searchParams.get("sortBy") || "newest";
    switch (sortBy) {
      case "oldest":
        query = query.order("created_at", { ascending: true });
        break;
      case "priority":
        // Fallback for priority if direct sorting isn't supported gracefully in DB
        query = query.order("priority", { ascending: false }).order("created_at", { ascending: false });
        break;
      case "newest":
      default:
        query = query.order("created_at", { ascending: false });
        break;
    }

    query = query.range(from, to);

    const { data: complaints, error, count } = await query;

    if (error) {
      console.error("Supabase GET complaints error:", error);
      return errorResponse("Database query failed.", 500);
    }

    const response = standardResponse(complaints ?? [], {
      pagination: { total: count || 0, page, limit }
    });

    // Add lightweight cache headers for Edge/CDN caching
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=59');
    
    return response;
  } catch (error: unknown) {
    console.error("Fetch complaints error:", error);
    return errorResponse("Failed to fetch complaints. Please try again.", 500);
  }
}

export async function POST(request: NextRequest) {
  console.info("[API] POST /api/complaints initiated");
  try {
    const body = await request.json();
    
    // 1. Zod Validation
    const parseResult = CreateComplaintSchema.safeParse(body);
    if (!parseResult.success) {
      return errorResponse(parseResult.error.issues[0].message, 400);
    }
    
    const { description, address, forceCreate } = parseResult.data;
    const trimmedDesc = description.trim();
    const trimmedAddr = address ? address.trim() : "";

    // 2. Duplicate Check Logic (Optimized to select only required fields)
    if (!forceCreate) {
      const { data: recentComplaints } = await supabase
        .from("complaints")
        .select("id, title, description") // removed heavy fields
        .order("created_at", { ascending: false })
        .limit(10);

      if (recentComplaints && recentComplaints.length > 0) {
        try {
          const dupPrompt = `You are a civic issue duplicate detector.
A citizen is reporting a new issue:
Description: "${trimmedDesc}"
Address: "${trimmedAddr || 'Not specified'}"

Here are recent complaints reported:
${JSON.stringify(recentComplaints)}

Respond with ONLY valid JSON:
{
  "isDuplicate": true or false,
  "duplicateId": "if true, the ID of the matched complaint, else null",
  "duplicateTitle": "if true, the title of the matched complaint, else null"
}`;

          // Add retry wrapper
          const dupResult = await withRetry(() => geminiModel.generateContent(dupPrompt), 2, 500);
          
          let dupText = dupResult.response.text().trim();
          dupText = dupText.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/, "").trim();

          const dupData = JSON.parse(dupText);
          if (dupData.isDuplicate && dupData.duplicateId) {
            console.info(`[API] Duplicate detected: ${dupData.duplicateId}`);
            return NextResponse.json({
              success: false,
              isDuplicate: true,
              duplicate: {
                id: dupData.duplicateId,
                title: dupData.duplicateTitle
              }
            }, { status: 409 });
          }
        } catch (e) {
          console.warn("[API] Duplicate detection failed, continuing:", e);
        }
      }
    }

    // 3. AI Classification
    const prompt = `You are an AI Civic Assistant. A citizen has reported a civic issue:
Issue description: "${trimmedDesc}"

Extract details and respond with ONLY valid JSON (no markdown):
{
  "title": "Concise factual title (e.g., Pothole on Main Road)",
  "category": "One of: Infrastructure, Sanitation, Water Supply, Electricity, Roads, Public Property, Environment, Other",
  "department": "Specific Government Department (e.g., Water Board)",
  "priority": "One of: LOW, MEDIUM, HIGH, URGENT",
  "description": "Clear summary without filler words."
}`;

    // Add retry wrapper for main AI extraction
    const result = await withRetry(() => geminiModel.generateContent(prompt), 3, 1000);
    const text = result.response.text();

    let cleanedText = text.trim();
    cleanedText = cleanedText.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/, "").trim();

    let draft;
    try {
      draft = JSON.parse(cleanedText);
    } catch {
      console.warn("[API] Failed to parse AI classification JSON, using fallback.");
      draft = {
        title: "Civic Issue Report",
        description: trimmedDesc,
        category: "Other",
        department: "Municipal Corporation",
        priority: "MEDIUM"
      };
    }

    // 4. Create record
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
      .select("id, tracking_id, title, category, department, priority, status, created_at");

    if (insertError) {
      console.error("[API] Supabase Insert Error:", insertError);
      return errorResponse("Failed to save complaint in database.", 500);
    }

    console.info(`[API] Complaint ${trackingId} created successfully.`);
    return standardResponse(data?.[0] ?? complaintData, { status: 201 });
  } catch (error: unknown) {
    console.error("[API] Post complaint unexpected error:", error);
    return errorResponse("Failed to submit complaint. Please try again later.", 500);
  }
}
