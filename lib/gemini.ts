import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("CRITICAL: Neither GOOGLE_GEMINI_API_KEY nor GEMINI_API_KEY is defined in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);

export const geminiModel = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
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
    temperature: 0.7,
    topP: 0.9,
    topK: 40,
    maxOutputTokens: 2048,
  },
})

export const geminiVisionModel = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    temperature: 0.4,
    topP: 0.9,
    maxOutputTokens: 1024,
  },
})

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

Remember: You are representing the government of India. Be professional, accurate, and genuinely helpful.`

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
    return JSON.parse(text)
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
