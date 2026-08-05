import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

const apiKey = process.env.OPENROUTER_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.NVIDIA_API_KEY || "";
if (!apiKey) {
  console.warn("WARNING: Neither OPENROUTER_API_KEY, GOOGLE_GEMINI_API_KEY nor GEMINI_API_KEY is defined in environment variables. Using placeholder for build phase.");
}

const isOpenRouterKey = Boolean(apiKey && (apiKey.startsWith("sk-or-v1-") || apiKey.startsWith("sk-") || process.env.OPENROUTER_API_KEY));

const nativeGenAI = !isOpenRouterKey && apiKey ? new GoogleGenerativeAI(apiKey) : null;

const nativeModel = nativeGenAI?.getGenerativeModel({
  model: 'gemini-3.6-flash',
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
  generationConfig: {
    maxOutputTokens: 2048,
  },
});

const nativeVisionModel = nativeGenAI?.getGenerativeModel({
  model: 'gemini-3.6-flash',
  generationConfig: {
    maxOutputTokens: 1024,
  },
});

async function callOpenRouter(messages: Array<{ role: string; content: unknown }>, maxTokens = 2048) {
  if (!apiKey) {
    throw new Error("No valid AI API Key configured.");
  }

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://smartbharat.gov.in",
      "X-Title": "Smart Bharat"
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages,
      max_tokens: maxTokens,
      temperature: 0.7
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`OpenRouter API call failed (HTTP ${res.status}): ${errorText}`);
  }

  const data = await res.json();
  const textContent = data.choices?.[0]?.message?.content || "";

  return {
    response: {
      text: () => textContent
    }
  };
}

export const geminiModel = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async generateContent(promptInput: any) {
    if (isOpenRouterKey || !nativeModel) {
      let promptText = "";
      if (typeof promptInput === "string") {
        promptText = promptInput;
      } else if (Array.isArray(promptInput)) {
        promptText = promptInput.map(p => (typeof p === "string" ? p : p?.text || "")).join("\n");
      }
      return callOpenRouter([{ role: "user", content: promptText }], 2048);
    }
    return nativeModel.generateContent(promptInput);
  },

  startChat(options: { history?: Array<{ role: string; parts: Array<{ text: string }> }> }) {
    if (isOpenRouterKey || !nativeModel) {
      const historyMessages = (options.history || []).map(h => ({
        role: h.role === "model" ? "assistant" : "user",
        content: h.parts?.map(p => p.text).join("\n") || ""
      }));

      return {
        async sendMessage(message: string) {
          const messages = [
            ...historyMessages,
            { role: "user", content: message }
          ];
          return callOpenRouter(messages, 2048);
        }
      };
    }
    return nativeModel.startChat(options);
  }
};

export const geminiVisionModel = {
  async generateContent(parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>) {
    if (isOpenRouterKey || !nativeVisionModel) {
      let promptText = "";
      let imageObj: { mimeType: string; data: string } | null = null;

      for (const p of parts) {
        if (p.text) promptText += p.text + "\n";
        if (p.inlineData) imageObj = p.inlineData;
      }

      const contentPayload: unknown[] = [{ type: "text", text: promptText }];
      if (imageObj) {
        contentPayload.push({
          type: "image_url",
          image_url: {
            url: `data:${imageObj.mimeType};base64,${imageObj.data}`
          }
        });
      }

      return callOpenRouter([{ role: "user", content: contentPayload }], 1024);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return nativeVisionModel.generateContent(parts as any);
  }
};

export const CIVIC_SYSTEM_PROMPT = `You are SmartSeva, an AI Civic Copilot built for Smart Bharat - the official AI-powered citizen services platform of India.

Your role is to assist Indian citizens with:
1. Government services navigation (passport, Aadhaar, driving license, etc.)
2. Finding eligible government schemes and subsidies
3. Filing and tracking civic complaints
4. Understanding government documents and notices
5. Providing information about rights and entitlements

IMPORTANT GUIDELINES:
- Always be helpful, empathetic, and patient
- Use simple language that common citizens can understand
- When a citizen mentions a service need, guide them step-by-step
- Always ask clarifying questions to better assist
- Provide accurate information about government processes
- When uncertain, direct citizens to official government portals
- Support multiple languages - respond in the same language the citizen uses
- Be proactive - suggest related services the citizen might benefit from
- Structure responses with clear steps when explaining processes

RESPONSE FORMAT:
- Use clear headings and bullet points
- Highlight important information
- Always end with a helpful next action
- Keep responses concise but complete

Remember: You are representing the government of India. Be professional, accurate, and genuinely helpful.`;

export async function generateCivicResponse(
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }>,
  userProfile?: {
    state?: string
    district?: string
    category?: string
    income?: string
    occupation?: string
  }
) {
  const contextualPrompt = userProfile
    ? `User Profile Context:\n- State: ${userProfile.state || 'Not specified'}\n- District: ${userProfile.district || 'Not specified'}\n- Category: ${userProfile.category || 'Not specified'}\n- Income Range: ${userProfile.income || 'Not specified'}\n- Occupation: ${userProfile.occupation || 'Not specified'}\n\n`
    : ''

  const fullSystemPrompt = CIVIC_SYSTEM_PROMPT + '\n\n' + contextualPrompt

  const chat = geminiModel.startChat({
    history: [
      {
        role: 'user',
        parts: [{ text: fullSystemPrompt }],
      },
      {
        role: 'model',
        parts: [{ text: 'I understand my role as SmartSeva, the AI Civic Copilot for Smart Bharat. I\'m ready to assist Indian citizens with government services, schemes, complaints, and document assistance. How can I help you today?' }],
      },
      ...conversationHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
    ],
  })

  const result = await chat.sendMessage(userMessage)
  return result.response.text()
}

export async function analyzeComplaintImage(
  imageBase64: string,
  mimeType: string,
  location?: string
) {
  const prompt = `You are analyzing a civic issue image for the Smart Bharat complaint system.

Analyze this image and provide a JSON response with:
{
  "issueType": "brief type of issue (e.g., Garbage Dump, Pothole, Broken Streetlight)",
  "category": "one of: Infrastructure, Sanitation, Water Supply, Electricity, Roads, Public Property, Environment, Other",
  "severity": "one of: LOW, MEDIUM, HIGH, URGENT",
  "department": "responsible government department",
  "description": "professional complaint description (2-3 sentences)",
  "title": "concise complaint title",
  "recommendedAction": "what action should be taken",
  "estimatedResolutionDays": number
}

${location ? `Location context: ${location}` : ''}

Respond ONLY with valid JSON, no markdown or extra text.`

  const result = await geminiVisionModel.generateContent([
    { text: prompt },
    {
      inlineData: {
        mimeType,
        data: imageBase64,
      },
    },
  ])

  const text = result.response.text()
  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned)
  } catch {
    return {
      issueType: 'Civic Issue',
      category: 'Other',
      severity: 'MEDIUM',
      department: 'Municipal Corporation',
      description: 'A civic issue has been identified that requires attention from the relevant authorities.',
      title: 'Civic Issue Report',
      recommendedAction: 'Immediate inspection and resolution required',
      estimatedResolutionDays: 7,
    }
  }
}

export async function findMatchingSchemes(profile: {
  age?: number
  gender?: string
  state?: string
  category?: string
  income?: string
  occupation?: string
  education?: string
  isDisabled?: boolean
  isFarmer?: boolean
  isStudent?: boolean
  isSenior?: boolean
}) {
  const prompt = `Based on the following citizen profile, list the most relevant Indian government schemes and subsidies they are eligible for.

Profile:
- Age: ${profile.age || 'Not specified'}
- Gender: ${profile.gender || 'Not specified'}  
- State: ${profile.state || 'Not specified'}
- Category: ${profile.category || 'General'}
- Annual Income: ${profile.income || 'Not specified'}
- Occupation: ${profile.occupation || 'Not specified'}
- Education: ${profile.education || 'Not specified'}
- Has Disability: ${profile.isDisabled ? 'Yes' : 'No'}
- Farmer: ${profile.isFarmer ? 'Yes' : 'No'}
- Student: ${profile.isStudent ? 'Yes' : 'No'}
- Senior Citizen: ${profile.isSenior ? 'Yes' : 'No'}

Provide a JSON array of matching schemes:
[
  {
    "name": "scheme name",
    "ministry": "ministry/department",
    "benefit": "key benefit in one line",
    "eligibility": "why this person is eligible",
    "howToApply": "brief application process",
    "relevanceScore": 0-100,
    "tags": ["tag1", "tag2"]
  }
]

Include only schemes where this person is genuinely eligible. Return up to 10 schemes ordered by relevance. Respond ONLY with valid JSON.`

  const result = await geminiModel.generateContent(prompt)
  const text = result.response.text()

  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return []
  }
}

export async function summarizeGovernmentDocument(
  documentText: string,
  documentName: string
) {
  const prompt = `You are analyzing an official Indian government document for a citizen.

Document: "${documentName}"
Content: ${documentText.substring(0, 4000)}

Provide a JSON response with:
{
  "summary": "plain-language summary (3-4 sentences a common person can understand)",
  "keyPoints": ["key point 1", "key point 2", "key point 3"],
  "deadlines": [
    {"date": "date string", "description": "what is due"}
  ],
  "requiredActions": [
    {"action": "what to do", "priority": "HIGH/MEDIUM/LOW", "deadline": "when if applicable"}
  ],
  "difficultTerms": [
    {"term": "jargon term", "explanation": "simple explanation"}
  ],
  "documentType": "type of document",
  "issuingAuthority": "who issued this"
}

Respond ONLY with valid JSON.`

  const result = await geminiModel.generateContent(prompt)
  const text = result.response.text()

  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return {
      summary: 'Document analysis complete. Please review the full document for details.',
      keyPoints: [],
      deadlines: [],
      requiredActions: [],
      difficultTerms: [],
      documentType: 'Government Document',
      issuingAuthority: 'Government of India',
    }
  }
}

export async function searchSchemes(query: string) {
  const prompt = `You are an expert search engine for Indian Government Schemes and subsidies.
A citizen has searched for: "${query}"

Return a list of real, currently active Indian government schemes that match this query.
If no schemes match or the query is irrelevant, return an empty array [].

CRITICAL INSTRUCTION:
Return ONLY a valid JSON array of up to 8 most relevant schemes. Each scheme must exactly match this shape:
{
  "name": "Scheme Name",
  "ministry": "Responsible Ministry/Department",
  "category": "Category (e.g. Agriculture, Health, Housing, Education, Finance)",
  "description": "Clear factual summary of the scheme (2-3 sentences)",
  "benefits": "Key financial or material benefits in one line",
  "eligibility": "Specific eligibility criteria for Indian citizens",
  "documents": "Comma-separated list of required documents (e.g. Aadhaar card, Bank account details)",
  "websiteUrl": "Exact official government portal URL for this specific scheme"
}

Do not invent fake schemes. Do not wrap the JSON in Markdown formatting (no \`\`\`json). Return the raw JSON array ONLY.`;

  const result = await geminiModel.generateContent(prompt);
  const text = result.response.text();
  
  try {
    let cleaned = text.trim();
    cleaned = cleaned.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/, "").trim();
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) {
      return parsed.slice(0, 8); // Ensure max 8 items
    }
    return [];
  } catch (err) {
    console.error("[searchSchemes] JSON parse error:", err);
    return [];
  }
}
