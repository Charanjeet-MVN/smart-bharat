# Smart Bharat — AI Powered Civic Companion

<div align="center">
  <img src="./public/logo.png" alt="Smart Bharat Logo" width="120" />
  
  <h1>Smart Bharat</h1>
  <p><strong>AI-Powered Civic Companion for Citizens of India</strong></p>

  ![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)
  ![Gemini AI](https://img.shields.io/badge/Google_Gemini-AI-4285F4?logo=google)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)
  ![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)

</div>

---

## 🇮🇳 Overview

Smart Bharat is an **AI-powered civic platform** that acts as an intelligent copilot for Indian citizens. Instead of navigating complex government portals, citizens simply tell the AI what they need, and it guides them step-by-step through the entire journey.

### Why Smart Bharat?

- 🤖 **AI Copilot** — Conversational AI guides citizens through complex government journeys
- 📋 **Scheme Finder** — Personalized government scheme recommendations based on profile
- 🚨 **Issue Reporter** — Upload images, AI analyzes and generates professional complaints
- 📄 **Document AI** — Upload government PDFs, AI summarizes and extracts action items
- 🌐 **Multilingual** — Support for English, Hindi, and major Indian languages
- 📊 **Complaint Tracker** — Real-time tracking with status updates

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Smart Bharat Platform                 │
├──────────────┬──────────────────┬───────────────────────┤
│   Frontend   │     Backend      │       AI Layer        │
│   Next.js 15 │  Server Actions  │   Google Gemini Pro   │
│   React 19   │  Route Handlers  │   Vision API          │
│   Tailwind   │  Prisma ORM      │   Embeddings          │
│   shadcn/ui  │  PostgreSQL      │   Context Memory      │
│   Framer     │  Clerk Auth      │   Intent Detection    │
└──────────────┴──────────────────┴───────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Google Gemini API Key
- Clerk Account

### Setup

```bash
# Clone the repository
git clone https://github.com/your-org/smart-bharat.git
cd smart-bharat

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# Fill in your credentials in .env.local

# Setup database
npx prisma generate
npx prisma migrate dev --name init

# Seed database with government schemes
npm run seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔧 Environment Variables

```bash
# Database
DATABASE_URL="postgresql://..."

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."

# Google AI
GOOGLE_GEMINI_API_KEY="..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 📁 Folder Structure

```
smart-bharat/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (sign-in, sign-up)
│   ├── (dashboard)/       # Protected dashboard layout
│   ├── api/               # API Route handlers
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── landing/           # Landing page sections
│   ├── dashboard/         # Dashboard components
│   ├── assistant/         # AI chat interface
│   ├── complaints/        # Complaint management
│   ├── schemes/           # Scheme components
│   └── shared/            # Shared components
├── lib/
│   ├── prisma.ts          # Prisma client singleton
│   ├── gemini.ts          # Gemini AI configuration
│   └── utils.ts           # Utilities
├── actions/               # Server Actions
├── hooks/                 # Custom React hooks
├── store/                 # Zustand state stores
├── types/                 # TypeScript type definitions
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── migrations/        # DB migrations
│   └── seed.ts            # Seed data
└── public/                # Static assets
```

---

## 🤖 AI Features

| Feature | Description |
|---------|-------------|
| **Intent Detection** | AI understands what citizen wants to achieve |
| **Guided Journeys** | Step-by-step guidance for complex processes |
| **Scheme Matching** | ML-based scheme eligibility matching |
| **Image Analysis** | Vision AI for civic issue categorization |
| **Doc Summarization** | PDF understanding and action extraction |
| **Multilingual** | Translation across 10+ Indian languages |
| **Context Memory** | Maintains conversation context across sessions |

---

## 📊 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS + shadcn/ui |
| Animation | Framer Motion |
| AI | Google Gemini 1.5 Pro |
| Database | PostgreSQL 16 |
| ORM | Prisma 5 |
| Authentication | Clerk |
| State Management | Zustand |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Icons | Lucide React |
| Deployment | Vercel |

---

## 🔒 Security

- Clerk authentication with JWT validation
- Server-side input validation with Zod
- SQL injection protection via Prisma ORM
- XSS protection via React
- Environment variable isolation
- Rate limiting on AI endpoints
- CSRF protection

---

## 🚢 Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel deploy --prod

# Set environment variables in Vercel Dashboard
# Then run migrations
npx prisma migrate deploy
```

---

## 🗺️ Roadmap

- [ ] Voice input support (WebSpeech API)
- [ ] WhatsApp bot integration
- [ ] RTI filing assistant
- [ ] Court date tracker
- [ ] Tax filing helper
- [ ] Aadhaar-based auto-fill
- [ ] District-level complaint analytics
- [ ] Mobile app (React Native)

---

## 📄 License

MIT License — See [LICENSE](./LICENSE)

---

## 🏆 Built for DEVENGERS PromptWars 2026

*Making government interactions faster, simpler, smarter, and more transparent.*
