# CoMeet - Intelligent Meeting Analysis Platform

<div align="center">

**Meet. Analyze. Summarize.**

A comprehensive meeting management and analysis platform that automatically extracts insights, tracks emotions, detects conflicts and agreements, and generates actionable summaries from your meetings.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-blue)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-2.57-green)](https://supabase.com/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-cyan)](https://tailwindcss.com/)

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Components Overview](#-components-overview)
- [Database Schema](#-database-schema)
- [Usage Guide](#-usage-guide)
- [API Reference](#-api-reference)
- [Scripts](#-scripts)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🎯 Core Features

- **🔐 User Authentication** - Secure sign-up and login using Supabase Auth
- **📝 Live Transcription** - Real-time meeting transcription with speaker identification
- **🎙️ Meeting Recording** - Start, pause, and stop meeting recordings
- **👥 Participant Management** - Add and manage meeting participants with speaking time tracking

### 🤖 AI-Powered Analysis

- **😊 Emotion Detection** - Automatically detects emotions (calm, tense, enthusiastic, neutral) from transcripts
- **⚖️ Conflict & Agreement Tracking** - Identifies moments of conflict and agreement in conversations
- **🎯 Key Point Extraction** - Automatically extracts important points, decisions, questions, and agreements
- **✅ Action Item Detection** - Automatically identifies and tracks action items with due dates
- **📊 Speaker Balance Analysis** - Tracks speaking time distribution and provides feedback on participation balance
- **🔍 Smart Search** - Full-text search across all meeting transcripts with relevance scoring

### 📈 Analytics & Insights

- **📊 Emotion Heatmap** - Visual timeline of emotions throughout the meeting
- **⚖️ Talk Balance Meter** - Visual representation of speaking time distribution
- **📝 Key Decisions Tracker** - Highlights and tracks important decisions made during meetings
- **💡 Key Points Panel** - Organized display of all extracted key points by type

### 🗂️ Meeting Management

- **📌 Meeting Bookmarks** - Save important meetings for quick access
- **🔍 Meeting Search** - Search across all your meetings by content
- **📚 Meeting Memory** - Browse and manage all past meetings
- **👥 Meeting Invitations** - Invite team members to meetings via email
- **🔔 Smart Reminders** - Get reminders for upcoming action items and deadlines

### 🎨 User Experience

- **💻 Modern UI** - Beautiful, responsive design built with Tailwind CSS
- **⚡ Real-time Updates** - Live updates as transcripts are added
- **📱 Responsive Design** - Works seamlessly on desktop and mobile devices
- **🎨 Intuitive Interface** - Clean and user-friendly interface for easy navigation

---

## 🛠️ Tech Stack

### Frontend

- **React 18.3** - UI library
- **TypeScript 5.5** - Type-safe JavaScript
- **Vite 5.4** - Fast build tool and dev server
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Lucide React** - Icon library

### Backend & Database

- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication
  - Row Level Security (RLS)
  - Edge Functions
  - Real-time subscriptions

### Development Tools

- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **TypeScript ESLint** - TypeScript-specific linting

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn** package manager
- **Supabase Account** (free tier works - sign up at [supabase.com](https://supabase.com))

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd DS3BoyGodCoMeet
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [Supabase Dashboard](https://app.supabase.com)
2. Get your project credentials from **Settings** → **API**:
   - Project URL
   - anon/public key

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Set Up Database

1. In Supabase Dashboard, go to **SQL Editor**
2. Open `supabase/migrations/00_COMPLETE_SETUP.sql`
3. Copy the entire contents and paste into SQL Editor
4. Click **Run** and wait for success message

### 6. Deploy Edge Function

1. In Supabase Dashboard, go to **Edge Functions**
2. Create a new function named: `analyze-transcript`
3. Copy contents from `supabase/functions/analyze-transcript/index.ts`
4. Paste into the function editor and **Deploy**

---

## 🏃 Quick Start

After completing installation:

```bash
# Start development server
npm run dev
```

Open your browser to `http://localhost:5173` and:

1. **Sign up** with your email and password
2. **Create a new meeting**
3. **Add participants**
4. **Start recording** and add transcripts
5. **Watch the magic happen!** ✨

> 💡 **Tip**: For detailed setup instructions, see [QUICK_START.md](./QUICK_START.md)

---

## 📁 Project Structure

```
DS3BoyGodCoMeet/
├── public/                    # Static assets
│   └── Deans Cup Banner.png
├── src/
│   ├── components/           # React components
│   │   ├── ActionItemsList.tsx
│   │   ├── AuthForm.tsx
│   │   ├── ConflictAgreementTracker.tsx
│   │   ├── EmotionHeatmap.tsx
│   │   ├── KeyDecisions.tsx
│   │   ├── KeyPointsPanel.tsx
│   │   ├── LiveTranscript.tsx
│   │   ├── MeetingMemory.tsx
│   │   ├── MeetingRecorder.tsx
│   │   ├── MeetingSearch.tsx
│   │   ├── SmartReminders.tsx
│   │   ├── TalkBalanceMeter.tsx
│   │   └── TranscriptView.tsx
│   ├── lib/                  # Utilities and API clients
│   │   ├── analysisApi.ts    # Analysis API integration
│   │   ├── analysisEngine.ts # Analysis logic
│   │   └── supabase.ts       # Supabase client & types
│   ├── App.tsx               # Main application component
│   ├── main.tsx              # Application entry point
│   └── index.css             # Global styles
├── supabase/
│   ├── functions/            # Edge Functions
│   │   └── analyze-transcript/
│   │       └── index.ts      # Transcript analysis function
│   └── migrations/           # Database migrations
│       ├── 00_COMPLETE_SETUP.sql  # Complete setup (recommended)
│       └── [other migrations]
├── .env                      # Environment variables (create this)
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

---

## 🧩 Components Overview

### Core Components

| Component | Description |
|-----------|-------------|
| **MeetingRecorder** | Main recording interface with participant management |
| **LiveTranscript** | Real-time transcript display with speaker identification |
| **TranscriptView** | Full transcript viewer with timestamps |
| **KeyPointsPanel** | Displays extracted key points by type |

### Analytics Components

| Component | Description |
|-----------|-------------|
| **EmotionHeatmap** | Visual timeline of emotions throughout meeting |
| **TalkBalanceMeter** | Speaking time distribution visualization |
| **ConflictAgreementTracker** | Tracks and displays conflict/agreement moments |
| **KeyDecisions** | Highlights important decisions made |

### Management Components

| Component | Description |
|-----------|-------------|
| **MeetingMemory** | Browse and manage all meetings |
| **MeetingSearch** | Search meetings by content |
| **ActionItemsList** | Track and manage action items |
| **SmartReminders** | Upcoming action item reminders |
| **AuthForm** | User authentication interface |

---

## 🗄️ Database Schema

### Core Tables

- **`meetings`** - Meeting information and metadata
- **`participants`** - Meeting participants with speaking time tracking
- **`transcripts`** - Meeting transcripts with emotion and sentiment
- **`action_items`** - Tracked action items with due dates
- **`key_points`** - Extracted key points from transcripts
- **`meeting_analytics`** - Aggregated analytics data
- **`meeting_invites`** - Meeting invitations
- **`profiles`** - User profile information

### Security

- **Row Level Security (RLS)** enabled on all tables
- Users can only access their own meetings
- Secure authentication via Supabase Auth

---

## 📖 Usage Guide

### Creating a Meeting

1. Click **"Start New Meeting"**
2. Enter meeting title
3. Click **"Create"**

### Recording a Meeting

1. Click **"Start Recording"**
2. Add participants using the **"+"** button
3. Select a speaker to assign transcripts
4. Add transcripts manually or via integration
5. Click **"Stop Recording"** when done

### Viewing Analytics

Analytics update in real-time as you add transcripts:

- **Emotion Heatmap** - See emotional trends
- **Talk Balance** - View participation distribution
- **Key Points** - Review extracted insights
- **Action Items** - Track tasks and deadlines
- **Conflicts & Agreements** - Identify key moments

### Searching Meetings

1. Use the search bar in the meeting list
2. Type keywords or phrases
3. Results show matching transcripts with context
4. Click to jump to specific moments

---

## 🔌 API Reference

### Supabase Client

The app uses Supabase for:

- **Authentication**: `supabase.auth`
- **Database**: `supabase.from(table)`
- **Edge Functions**: `fetch(`${SUPABASE_URL}/functions/v1/function-name`)`

### Analysis API

```typescript
// Analyze transcript text
const analysis = await analyzeTranscript(text: string): Promise<AnalysisResponse>

// Response includes:
interface AnalysisResponse {
  emotion: 'calm' | 'tense' | 'enthusiastic' | 'neutral'
  sentiment: 'conflict' | 'agreement' | 'neutral' | null
  keyPoints: KeyPoint[]
  actionItem: string | null
  decision: string | null
}
```

### Database Operations

```typescript
// Create meeting
await supabase.from('meetings').insert({ title, owner_id, status })

// Add transcript
await supabase.from('transcripts').insert({ meeting_id, participant_id, content, emotion })

// Get meetings
await supabase.from('meetings').select('*').eq('owner_id', userId)
```

---

## 📜 Scripts

```bash
# Development
npm run dev          # Start development server

# Build
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run typecheck    # Check TypeScript types
```

---

## 🔧 Troubleshooting

### Common Issues

#### ❌ "Missing environment variables"
- Ensure `.env` file exists in root directory
- Check variable names match exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart dev server after creating `.env`

#### ❌ "Failed to analyze transcript"
- Verify Edge Function `analyze-transcript` is deployed
- Check Edge Function is public (or anon key has access)
- Ensure Supabase URL is complete (ends with `.supabase.co`)

#### ❌ Database errors
- Run `00_COMPLETE_SETUP.sql` in Supabase SQL Editor
- Check tables exist in Supabase Dashboard → Table Editor
- Verify RLS policies are configured correctly

#### ❌ Authentication errors
- Verify Supabase project is active
- Check `.env` credentials are correct
- Ensure email confirmation is disabled (or check email)

#### ❌ Blank screen on load
- Open browser DevTools (F12) → Console
- Check for JavaScript errors
- Verify environment variables are loaded
- Check Network tab for failed requests

### Getting Help

1. Check browser console for errors
2. Verify Supabase dashboard shows no errors
3. Review [SETUP.md](./SETUP.md) for detailed troubleshooting
4. Check Supabase logs in dashboard

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use meaningful component and variable names
- Add comments for complex logic
- Test changes thoroughly before submitting
- Update documentation as needed

---

## 📄 License

This project is part of the DS3BoyGodCoMeet project. All rights reserved.

---

## 🙏 Acknowledgments

- **Supabase** - Backend infrastructure
- **React Team** - UI framework
- **Vite Team** - Build tooling
- **Tailwind CSS** - Styling framework

---

## 📞 Support

For issues, questions, or suggestions:

- Open an issue on the repository
- Check existing documentation
- Review Supabase documentation

---

<div align="center">

**Built with ❤️ using React, TypeScript, and Supabase**

Made for efficient meeting management and intelligent analysis

</div>
