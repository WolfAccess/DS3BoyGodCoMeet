export type Emotion = 'calm' | 'tense' | 'enthusiastic' | 'neutral';
export type SentimentType = 'conflict' | 'agreement' | 'neutral';
export type KeyPointType = 'decision' | 'question' | 'important' | 'agreement';

export interface KeyPoint {
  type: KeyPointType;
  text: string;
  snippet: string;
}

export interface AnalysisResponse {
  emotion: Emotion;
  sentiment: SentimentType | null;
  keyPoints: KeyPoint[];
  actionItem: string | null;
  decision: string | null;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export async function analyzeTranscript(text: string): Promise<AnalysisResponse> {
  console.log('analyzeTranscript called with text:', text);
  const apiUrl = `${SUPABASE_URL}/functions/v1/analyze-transcript`;
  console.log('API URL:', apiUrl);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text })
    });

    console.log('API response status:', response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error('Analysis API error response:', error);
      throw new Error(`Analysis failed: ${response.status} - ${error}`);
    }

    const result = await response.json();
    console.log('API analysis result:', result);
    return result;
  } catch (error) {
    console.error('Exception in analyzeTranscript:', error);
    throw error;
  }
}

export function getKeyPointColor(type: KeyPointType): string {
  const colors: Record<KeyPointType, string> = {
    decision: 'bg-blue-100 text-blue-800 border-blue-300',
    question: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    important: 'bg-red-100 text-red-800 border-red-300',
    agreement: 'bg-green-100 text-green-800 border-green-300'
  };
  return colors[type];
}

export function getKeyPointIcon(type: KeyPointType): string {
  const icons: Record<KeyPointType, string> = {
    decision: '✓',
    question: '?',
    important: '!',
    agreement: '👍'
  };
  return icons[type];
}

function getGMT8Date(): Date {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (8 * 3600000));
}

export function extractDueDate(text: string): Date | null {
  const lowerText = text.toLowerCase();

  const todayMatch = lowerText.match(/today|tonight/i);
  if (todayMatch) {
    return getGMT8Date();
  }

  const tomorrowMatch = lowerText.match(/tomorrow/i);
  if (tomorrowMatch) {
    const tomorrow = getGMT8Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }

  const daysMatch = lowerText.match(/in (\d+) days?/i);
  if (daysMatch) {
    const days = parseInt(daysMatch[1]);
    const future = getGMT8Date();
    future.setDate(future.getDate() + days);
    return future;
  }

  const weekMatch = lowerText.match(/next (monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
  if (weekMatch) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const targetDay = days.indexOf(weekMatch[1].toLowerCase());
    const today = getGMT8Date();
    const currentDay = today.getDay();
    const daysUntil = (targetDay + 7 - currentDay) % 7 || 7;
    const nextDate = getGMT8Date();
    nextDate.setDate(today.getDate() + daysUntil);
    return nextDate;
  }

  const dateMatch = text.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);
  if (dateMatch) {
    const month = parseInt(dateMatch[1]) - 1;
    const day = parseInt(dateMatch[2]);
    const year = dateMatch[3] ? (dateMatch[3].length === 2 ? 2000 + parseInt(dateMatch[3]) : parseInt(dateMatch[3])) : getGMT8Date().getFullYear();

    const utc = Date.UTC(year, month, day, 0, 0, 0);
    return new Date(utc + (8 * 3600000));
  }

  return null;
}

export function calculateSpeakerBalance(participants: Array<{ name: string; speak_time_seconds: number }>): Record<string, number> {
  const total = participants.reduce((sum, p) => sum + p.speak_time_seconds, 0);

  if (total === 0) return {};

  return participants.reduce((acc, p) => {
    acc[p.name] = (p.speak_time_seconds / total) * 100;
    return acc;
  }, {} as Record<string, number>);
}

export function getSpeakerBalanceFeedback(balance: Record<string, number>): string[] {
  const feedback: string[] = [];

  Object.entries(balance).forEach(([name, percentage]) => {
    if (percentage < 5) {
      feedback.push(`Try to invite ${name}'s input — they spoke only ${percentage.toFixed(1)}% of the time.`);
    } else if (percentage > 50) {
      feedback.push(`${name} dominated the conversation at ${percentage.toFixed(1)}% — consider balancing participation.`);
    }
  });

  return feedback;
}
