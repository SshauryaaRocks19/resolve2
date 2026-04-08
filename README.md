<div align="center">

# reSOLVE

**Learn deeply. Score naturally.**

An AI-powered education assistant that builds conceptual mastery — not content overload.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4?logo=google)](https://ai.google.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://mongodb.com)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?logo=clerk)](https://clerk.com)

</div>

---

## The Problem

Most students resort to **shallow learning** instead of conceptual understanding. Present solutions focus on content coverage rather than depth of understanding — flooding students with material without ensuring they truly grasp the fundamentals.

**reSOLVE fixes this.** We don't teach content. We build understanding — so exams become a natural side-effect of deep learning, not the goal themselves.

## Philosophy

| Principle | What It Means |
|---|---|
| **Depth Over Volume** | Focuses on conceptual mastery instead of flooding students with content |
| **Active Diagnosis** | Replaces passive watching with data-driven analysis to target learning gaps |
| **Concepts Over Cramming** | Shifts focus from rote memorization to building strong intuitive foundations |
| **Empowered Independence** | We don't build platform addiction — we build foundational strength students need to eventually succeed without us |

## How It Works — The Learning Loop

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   DIAGNOSE   │────▶│    REVISE    │────▶│    CURATE    │
│              │     │              │     │              │
│ AI-generated │     │ Targeted     │     │ Gold-standard│
│ precision    │     │ revision     │     │ first-       │
│ tests reveal │     │ plans close  │     │ principle    │
│ concept gaps │     │ those gaps   │     │ resources    │
└──────┬───────┘     └──────────────┘     └──────┬───────┘
       │                                         │
       └─────────── REPEAT ◀─────────────────────┘
```

Tests reveal gaps → Gaps drive revision → Revision uses curated resources → Repeat.

## Key Features

### * Precision Testing
AI-generated assessments that adapt to your weaknesses. Every wrong answer is diagnosed — questions aren't random, they target historically common conceptual misunderstandings.

### * Gold Standard Curation
Powered by Google Search grounding — automatically filters and maps the most intuitive, high-quality resources from Khan Academy, MIT OCW, 3Blue1Brown, and more.

### * Live Progress Tracking
Real-time score trends, concept strength radar charts, and weakness analysis — all stored persistently so you can see exactly how your understanding evolves.

### * Timed Tests with Buzzer Alerts
Configurable time limits (5–30 min or unlimited), countdown display with color-coded urgency, and Web Audio API buzzer warnings at 50%, 25%, and 10% remaining.

### * Math Rendering
Full LaTeX support via KaTeX for inline (`$...$`) and display (`$$...$$`) math — fractions, integrals, Greek letters, and more render beautifully in questions and explanations.

### * Adaptive Learning
The more you use reSOLVE, the smarter it gets. Your concept mastery data feeds back into test generation, creating increasingly targeted assessments.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│                     Next.js 16 (App Router)                 │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │ Landing  │  │  Tests   │  │Resources │  │  Progress  │  │
│  │  Page    │  │  Flow    │  │  Page    │  │  Section   │  │
│  └──────────┘  └────┬─────┘  └────┬─────┘  └─────┬──────┘  │
│                     │             │               │         │
├─────────────────────┼─────────────┼───────────────┼─────────┤
│                 API ROUTES (Server-side)                     │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │/api/     │  │/api/     │  │/api/     │  │/api/       │  │
│  │generator │  │evaluator │  │curator   │  │progress    │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └─────┬──────┘  │
│       │             │             │               │         │
├───────┼─────────────┼─────────────┼───────────────┼─────────┤
│       ▼             ▼             ▼               ▼         │
│  ┌─────────────────────┐   ┌───────────────────────────┐    │
│  │   Google Gemini     │   │      MongoDB Atlas        │    │
│  │   2.5 Flash         │   │  ┌─────────────────────┐  │    │
│  │                     │   │  │  TestResult          │  │    │
│  │  • Test generation  │   │  │  ConceptMastery      │  │    │
│  │  • Resource curation│   │  └─────────────────────┘  │    │
│  │  • Google Search    │   │                           │    │
│  └─────────────────────┘   └───────────────────────────┘    │
│                                                             │
│  ┌─────────────────────┐                                    │
│  │   Clerk Auth        │                                    │
│  │   User management   │                                    │
│  └─────────────────────┘                                    │
└─────────────────────────────────────────────────────────────┘
```

## Project Structure

```
resolve2/
├── front-end/                    # Next.js application
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── layout.tsx            # Root layout (Clerk, themes)
│   │   ├── tests/
│   │   │   ├── page.tsx          # Test configuration (topic, questions, timer)
│   │   │   ├── take/page.tsx     # Test-taking interface with timer
│   │   │   └── results/page.tsx  # Results & weakness analysis
│   │   ├── resources/page.tsx    # AI-curated resource discovery
│   │   ├── revise/               # Revision tools
│   │   ├── prioritization/       # Study schedule optimization
│   │   └── api/
│   │       ├── generator/        # Gemini → generates diagnostic tests
│   │       ├── evaluator/        # Processes wrong answers → concept mastery
│   │       ├── curator/          # Gemini + Google Search → curated resources
│   │       └── progress/         # MongoDB CRUD for test results
│   ├── components/
│   │   ├── StudyHero.tsx         # Landing page hero section
│   │   ├── ProgressSection.tsx   # Charts, insights, progress tracking
│   │   ├── MathText.tsx          # KaTeX LaTeX renderer
│   │   ├── navbar.tsx            # Navigation with Clerk auth
│   │   ├── FloatingMenu.tsx      # Quick-access floating menu
│   │   └── Dither.jsx            # Animated background effect
│   └── lib/
│       ├── mongodb.ts            # MongoDB connection (cached for serverless)
│       ├── models.ts             # Mongoose schemas (TestResult, ConceptMastery)
│       └── questions.ts          # TypeScript types for test data
├── backend/                      # Express.js backend (legacy)
└── Resolve_amd/main.py           # Python AI engine
```

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript |
| **AI** | Google Gemini 2.5 Flash |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Auth** | Clerk |
| **Styling** | Tailwind CSS, Framer Motion |
| **Math** | KaTeX |
| **Charts** | Recharts |
| **Package Manager** | Bun |

## API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/generator` | POST | Generates adaptive diagnostic tests using Gemini |
| `/api/evaluator` | POST | Processes wrong answers, updates concept mastery in MongoDB |
| `/api/curator` | POST | Curates learning resources via Gemini + Google Search grounding |
| `/api/progress` | GET | Fetches test history and concept mastery for a user |
| `/api/progress` | POST | Saves test results to MongoDB |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 18+ or [Bun](https://bun.sh)
- [MongoDB Atlas](https://mongodb.com/atlas) account
- [Google AI Studio](https://aistudio.google.com) API key
- [Clerk](https://clerk.com) account

### Installation

```bash
# Clone the repository
git clone https://github.com/SshauryaaRocks19/resolve2.git
cd resolve2/front-end

# Install dependencies
bun install

# Configure environment
cp .env.example .env.local
```

### Environment Variables

```env
GEMINI_API_KEY=your_gemini_api_key
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/resolve2
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### Run

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Data Models

### TestResult
Stores each completed test — score, total questions, topic, and identified weaknesses.

### ConceptMastery
Tracks per-concept weakness over time. Each wrong answer increments the `error_weight` for that micro-concept, which feeds back into future test generation for targeted assessment.

---

<div align="center">

**reSOLVE** — Because understanding is the shortcut.

Built with ❤️

</div>
