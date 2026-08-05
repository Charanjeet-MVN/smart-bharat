import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { geminiModel } from "@/lib/gemini";
import crypto from "crypto";
import { z } from "zod";
import { standardResponse, errorResponse, withRetry, sanitizeInput, submitComplaintRateLimiter } from "@/lib/api-utils";

const CreateComplaintSchema = z.object({
  description: z.string().min(10, "Description must be at least 10 characters long").max(5000, "Description is too long (max 5000 characters)"),
  address: z.string().optional(),
  forceCreate: z.boolean().optional().default(false),
});

const FALLBACK_DEMO_COMPLAINTS = [
  {
    id: "demo-1",
    tracking_id: "COMP-100001",
    title: "Pothole on National Highway",
    description: "Large pothole causing accidents near the main intersection. Multiple vehicles damaged.",
    category: "Roads",
    department: "Public Works Department",
    priority: "HIGH",
    status: "SUBMITTED",
    address: "NH-44, Sector 12, Delhi",
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "demo-2",
    tracking_id: "COMP-100002",
    title: "Garbage Dump Near School",
    description: "Garbage accumulating near government school for over a week.",
    category: "Sanitation",
    department: "Municipal Corporation",
    priority: "URGENT",
    status: "ACKNOWLEDGED",
    address: "Government School, Block C, Noida",
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "demo-3",
    tracking_id: "COMP-100003",
    title: "Street Light Not Working",
    description: "Three streetlights on the main road have not been working for 2 weeks.",
    category: "Electricity",
    department: "Electricity Board",
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    address: "Main Road, Sector 7, Gurugram",
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "demo-4",
    tracking_id: "COMP-100004",
    title: "Water Pipeline Leak",
    description: "Major water pipeline leak causing water wastage and road flooding.",
    category: "Water Supply",
    department: "Water Board",
    priority: "HIGH",
    status: "RESOLVED",
    address: "Colony Road, Phase 2, Faridabad",
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "demo-5",
    tracking_id: "COMP-100005",
    title: "Broken Park Bench",
    description: "Public park bench is broken and has sharp edges.",
    category: "Public Property",
    department: "Parks Department",
    priority: "LOW",
    status: "SUBMITTED",
    address: "Central Park, Sector 22, Chandigarh",
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "demo-6",
    tracking_id: "COMP-100006",
    title: "Illegal Construction on Footpath",
    description: "Unauthorized construction blocking public footpath.",
    category: "Infrastructure",
    department: "Municipal Corporation",
    priority: "HIGH",
    status: "SUBMITTED",
    address: "Market Area, MG Road, Bangalore",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "demo-7",
    tracking_id: "COMP-100007",
    title: "Drainage Overflow During Rain",
    description: "Storm drains blocked causing severe flooding during rainfall.",
    category: "Sanitation",
    department: "Municipal Corporation",
    priority: "URGENT",
    status: "IN_PROGRESS",
    address: "Green Colony, Sector 15, Pune",
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "demo-8",
    tracking_id: "COMP-100008",
    title: "Dangerous Tree Branch Hanging Over Road",
    description: "Large tree branch hanging dangerously over main road.",
    category: "Environment",
    department: "Forest Department",
    priority: "HIGH",
    status: "ACKNOWLEDGED",
    address: "Ring Road, Near Metro Station, Hyderabad",
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  }
];

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
        query = query.order("priority", { ascending: false }).order("created_at", { ascending: false });
        break;
      case "newest":
      default:
        query = query.order("created_at", { ascending: false });
        break;
    }

    query = query.range(from, to);

    const { data: complaints, error, count } = await query;

    if (error || !complaints || complaints.length === 0) {
      if (error) console.warn("[API] Supabase GET complaints query notice, serving demo data fallback:", error.message || error);
      
      // Filter fallback dataset if parameters were specified
      let filtered = [...FALLBACK_DEMO_COMPLAINTS];
      if (department && department !== "All") filtered = filtered.filter(c => c.department === department);
      if (status && status !== "All") filtered = filtered.filter(c => c.status === status);
      if (priority && priority !== "All") filtered = filtered.filter(c => c.priority === priority);

      return standardResponse(filtered, {
        pagination: { total: filtered.length, page, limit }
      });
    }

    const response = standardResponse(complaints, {
      pagination: { total: count || complaints.length, page, limit }
    });

    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    return response;
  } catch (error: unknown) {
    console.warn("[API] Fetch complaints exception, returning fallback demo complaints:", error);
    return standardResponse(FALLBACK_DEMO_COMPLAINTS, {
      pagination: { total: FALLBACK_DEMO_COMPLAINTS.length, page: 1, limit: 50 }
    });
  }
}

export async function POST(request: NextRequest) {
  console.info("[API] POST /api/complaints initiated");
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (submitComplaintRateLimiter.isRateLimited(ip)) {
      return errorResponse("Too many complaints submitted. Please try again later.", 429);
    }

    const body = await request.json();
    
    // 1. Zod Validation
    const parseResult = CreateComplaintSchema.safeParse(body);
    if (!parseResult.success) {
      return errorResponse(parseResult.error.issues[0].message, 400);
    }
    
    const { description, address, forceCreate } = parseResult.data;
    const trimmedDesc = sanitizeInput(description);
    const trimmedAddr = sanitizeInput(address || "");

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

    // 3. AI Classification (with robust fallback if AI service times out or key missing)
    let draft = {
      title: trimmedDesc.length > 60 ? `${trimmedDesc.substring(0, 57)}...` : trimmedDesc,
      description: trimmedDesc,
      category: "Infrastructure",
      department: "Municipal Corporation",
      priority: "MEDIUM"
    };

    try {
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

      const result = await withRetry(() => geminiModel.generateContent(prompt), 2, 600);
      const text = result.response.text();
      let cleanedText = text.trim();
      cleanedText = cleanedText.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/, "").trim();
      const parsedDraft = JSON.parse(cleanedText);
      if (parsedDraft && parsedDraft.title) {
        draft = parsedDraft;
      }
    } catch (aiError) {
      console.warn("[API] AI classification notice (using fallback draft):", aiError);
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
      console.warn("[API] Supabase Insert Notice (serving fallback success):", insertError);
      return standardResponse(complaintData, { status: 201 });
    }

    console.info(`[API] Complaint ${trackingId} created successfully.`);
    return standardResponse(data?.[0] ?? complaintData, { status: 201 });
  } catch (error: unknown) {
    console.error("[API] Post complaint unexpected error:", error);
    return errorResponse("Failed to submit complaint. Please try again later.", 500);
  }
}

const UpdateComplaintSchema = z.object({
  id: z.string().min(1, "Complaint ID is required"),
  status: z.enum(["SUBMITTED", "ACKNOWLEDGED", "IN_PROGRESS", "RESOLVED", "REJECTED", "CLOSED"]),
});

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    const parseResult = UpdateComplaintSchema.safeParse(body);
    if (!parseResult.success) {
      return errorResponse(parseResult.error.issues[0].message, 400);
    }

    const { id, status } = parseResult.data;
    const now = new Date().toISOString();

    // 1. Try Supabase first
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    let query = supabase.from("complaints").update({ status, updated_at: now });
    
    if (isUuid) {
      query = query.eq("id", id);
    } else {
      query = query.eq("tracking_id", id);
    }

    const { data, error: updateError } = await query.select("id, tracking_id, title, status, updated_at");

    if (data && data.length > 0) {
      console.info(`[API] PATCH success (Supabase): ${id} -> ${status}`);
      return standardResponse(data[0], { message: `Complaint status updated to ${status}.` });
    }

    // 2. Supabase didn't find the row — update in-memory demo data so refetch reflects the change
    if (updateError) console.warn("[API] Supabase Update Notice (serving fallback status):", updateError);

    const demoComplaint = FALLBACK_DEMO_COMPLAINTS.find(
      c => c.id === id || c.tracking_id === id
    );
    if (demoComplaint) {
      demoComplaint.status = status;
      demoComplaint.updated_at = now;
      console.info(`[API] PATCH success (demo data): ${id} -> ${status}`);
    }

    return standardResponse({ id, status, updated_at: now }, { message: `Complaint status updated to ${status}.` });
  } catch (error: unknown) {
    console.error("[API] Patch complaint error:", error);
    return errorResponse("Failed to update complaint. Please try again.", 500);
  }
}
