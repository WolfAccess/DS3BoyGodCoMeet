<<<<<<< HEAD
# CoMeet - Intelligent Meeting Analysis Platform

<div align="center">

**Meet. Analyze. Summarize.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-blue)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-2.57-green)](https://supabase.com/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple)](https://vitejs.dev/)

</div>

A comprehensive meeting management platform that automatically extracts insights, tracks emotions, detects conflicts, and generates actionable summaries.

---

## ✨ Features

- 🔐 **User Authentication** - Secure sign-up and login
- 📝 **Live Transcription** - Real-time meeting transcription with speaker identification
- 😊 **Emotion Detection** - Automatically detects emotions (calm, tense, enthusiastic, neutral)
- ⚖️ **Conflict & Agreement Tracking** - Identifies moments of conflict and agreement
- 🎯 **Key Point Extraction** - Extracts important points, decisions, and questions
- ✅ **Action Item Detection** - Automatically tracks action items with due dates
- 📊 **Speaker Balance Analysis** - Tracks speaking time distribution
- 🔍 **Smart Search** - Full-text search across all meeting transcripts
- 📌 **Meeting Management** - Bookmarks, invitations, and reminders
- 📊 **Analytics** - Emotion heatmaps, talk balance meters, and decision trackers

---

## 🛠️ Tech Stack

**Frontend:** React 18.3, TypeScript 5.5, Vite 5.4, Tailwind CSS 3.4, Lucide React  
**Backend:** Supabase (PostgreSQL, Auth, Edge Functions, RLS)  
**Tools:** ESLint, PostCSS, TypeScript ESLint

---

## 📋 Prerequisites

- Node.js (v18+)
- npm or yarn
- Supabase account ([sign up here](https://supabase.com))

---

## 🚀 Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create project at [Supabase Dashboard](https://app.supabase.com)
2. Get credentials from **Settings** → **API** (Project URL & anon key)

### 3. Configure Environment

Create `.env` file:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Set Up Database

1. Supabase Dashboard → **SQL Editor**
2. Copy contents from `supabase/migrations/00_COMPLETE_SETUP.sql`
3. Paste and **Run**

### 5. Deploy Edge Function

1. Supabase Dashboard → **Edge Functions**
2. Create function: `analyze-transcript`
3. Copy contents from `supabase/functions/analyze-transcript/index.ts`
4. **Deploy**

### 6. Run the App

```bash
npm run dev
```

Open `http://localhost:5173` and sign up!

> 💡 For detailed setup, see [QUICK_START.md](./QUICK_START.md)

---

## 📖 Usage

**Creating a Meeting:** Click "Start New Meeting", enter title, and create.

**Recording:** Start recording, add participants, select speaker, add transcripts, stop when done.

**Analytics:** View real-time updates for emotions, talk balance, key points, action items, and conflicts/agreements.

**Searching:** Use search bar to find keywords across meetings, click to jump to specific moments.

---

## 📁 Project Structure

```
src/
├── components/      # React components (13 components)
├── lib/             # Utilities and API clients
└── App.tsx          # Main application

supabase/
├── functions/       # Edge Functions (analyze-transcript)
└── migrations/      # Database migrations
```

**Key Components:** MeetingRecorder, LiveTranscript, EmotionHeatmap, TalkBalanceMeter, ConflictAgreementTracker, KeyDecisions, ActionItemsList, MeetingMemory, MeetingSearch

---

## 🗄️ Database Schema

**Core Tables:** `meetings`, `participants`, `transcripts`, `action_items`, `key_points`, `meeting_analytics`, `meeting_invites`, `profiles`

**Security:** Row Level Security (RLS) enabled on all tables. Users can only access their own meetings.

---

## 🔌 API Reference

```typescript
// Authentication
supabase.auth.signUp({ email, password })
supabase.auth.signInWithPassword({ email, password })
supabase.auth.signOut()

// Database
supabase.from('meetings').select('*')
supabase.from('transcripts').insert({ meeting_id, participant_id, content, emotion })

// Analysis
const analysis = await analyzeTranscript(text): Promise<AnalysisResponse>

interface AnalysisResponse {
  emotion: 'calm' | 'tense' | 'enthusiastic' | 'neutral'
  sentiment: 'conflict' | 'agreement' | 'neutral' | null
  keyPoints: KeyPoint[]
  actionItem: string | null
  decision: string | null
}
```

---

## 📜 Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run typecheck  # Check TypeScript types
```

---

## 🔧 Troubleshooting

**Missing environment variables**
- Ensure `.env` exists with correct variable names (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- Restart dev server after creating `.env`

**Failed to analyze transcript**
- Verify Edge Function `analyze-transcript` is deployed
- Check Supabase URL is complete (ends with `.supabase.co`)

**Database errors**
- Run `00_COMPLETE_SETUP.sql` in Supabase SQL Editor
- Check tables exist in Supabase Dashboard → Table Editor

**Authentication errors**
- Verify Supabase project is active
- Check `.env` credentials are correct

**Blank screen**
- Open browser DevTools (F12) → Console for errors
- Check Network tab for failed requests
- Verify environment variables are loaded

For detailed help, see [SETUP.md](./SETUP.md)

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

**Guidelines:** Follow TypeScript best practices, use meaningful names, add comments for complex logic, test thoroughly.

---

<div align="center">

**Built with ❤️ using React, TypeScript, and Supabase**

</div>
=======
DS3BoyGodCoMeet
>>>>>>> 5215121828cb897c79d791f39a9fc9a3187d4ea7
