export interface User {
  id: string
  clerkId: string
  email: string
  name?: string
  phone?: string
  avatar?: string
  language: string
  createdAt: Date
  updatedAt: Date
  profile?: Profile
}

export interface Profile {
  id: string
  userId: string
  age?: number
  gender?: string
  state?: string
  district?: string
  pincode?: string
  category?: string
  income?: string
  occupation?: string
  education?: string
  isDisabled: boolean
  isFarmer: boolean
  isStudent: boolean
  isSenior: boolean
  isWoman: boolean
}

export interface Conversation {
  id: string
  userId: string
  title?: string
  context?: string
  intent?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  messages?: Message[]
}

export interface Message {
  id: string
  conversationId: string
  role: 'user' | 'assistant'
  content: string
  imageUrl?: string
  metadata?: string
  createdAt: Date
}

export interface Complaint {
  id: string
  userId: string
  trackingId: string
  title: string
  description: string
  category: string
  subCategory?: string
  department: string
  status: ComplaintStatus
  priority: ComplaintPriority
  imageUrl?: string
  address?: string
  state?: string
  district?: string
  pincode?: string
  latitude?: number
  longitude?: number
  aiAnalysis?: string
  resolvedAt?: Date
  createdAt: Date
  updatedAt: Date
  updates?: ComplaintUpdate[]
}

export type ComplaintStatus = 'SUBMITTED' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED' | 'CLOSED'
export type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface ComplaintUpdate {
  id: string
  complaintId: string
  status: string
  comment: string
  updatedBy: string
  createdAt: Date
}

export interface GovernmentScheme {
  id: string
  name: string
  nameHi?: string
  ministry: string
  category: string
  description: string
  benefits: string
  eligibility: string
  documents: string
  howToApply: string
  deadline?: Date
  websiteUrl?: string
  helplineNo?: string
  isActive: boolean
  targetGender?: string
  targetAge?: string
  targetState?: string
  incomeLimit?: number
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Document {
  id: string
  userId: string
  name: string
  type: string
  url: string
  size: number
  summary?: string
  keyPoints?: string
  deadlines?: string
  actions?: string
  aiAnalyzed: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: string
  isRead: boolean
  link?: string
  createdAt: Date
}

export interface AIComplaintAnalysis {
  issueType: string
  category: string
  severity: string
  department: string
  description: string
  title: string
  recommendedAction: string
  estimatedResolutionDays: number
}

export interface AISchemeMatch {
  name: string
  ministry: string
  benefit: string
  eligibility: string
  howToApply: string
  relevanceScore: number
  tags: string[]
}

export interface AIDocumentSummary {
  summary: string
  keyPoints: string[]
  deadlines: Array<{ date: string; description: string }>
  requiredActions: Array<{ action: string; priority: string; deadline?: string }>
  difficultTerms: Array<{ term: string; explanation: string }>
  documentType: string
  issuingAuthority: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  imageUrl?: string
}

export interface DashboardStats {
  totalComplaints: number
  resolvedComplaints: number
  pendingComplaints: number
  savedSchemes: number
  conversations: number
  documents: number
}
