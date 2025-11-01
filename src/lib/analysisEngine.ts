export type Emotion = 'calm' | 'tense' | 'enthusiastic' | 'neutral';
export type SentimentType = 'conflict' | 'agreement' | 'neutral';

const conflictKeywords = [
  'disagree', 'wrong', 'no way', 'but', 'however', 'issue', 'problem',
  'concern', 'worried', 'against', 'oppose', 'cannot accept', 'not good',
  'bad idea', 'mistake', 'incorrect', 'actually', 'don\'t think so', 'not sure',
  'unacceptable', 'reject', 'objection', 'challenge', 'difficulty', 'obstacle',
  'blocker', 'risk', 'drawback', 'flaw', 'error', 'misunderstanding'
];

const agreementKeywords = [
  'agree', 'yes', 'exactly', 'right', 'correct', 'perfect', 'good idea',
  'let\'s do it', 'sounds good', 'i like', 'great', 'excellent', 'approve',
  'support', 'absolutely', 'definitely', 'makes sense', 'yep', 'yeah', 'sure',
  'of course', 'totally', 'certainly', 'precisely', 'indeed', 'sounds great',
  'that works', 'aligned', 'concur', 'let\'s proceed', 'agreed'
];

const actionItemKeywords = [
  'i will', 'i\'ll', 'let me', 'i can', 'i\'ll handle', 'i\'ll take care',
  'i\'ll do', 'we should', 'we need to', 'follow up', 'next steps',
  'action item', 'to do', 'deadline', 'by', 'before', 'i volunteer', 'assign',
  'task', 'owner', 'responsible', 'on it', 'i\'ve got this', 'will do',
  'need to check', 'let\'s ensure', 'we must', 'plan is', 'timeline', 'due date',
  'by end of', 'EOD', 'ASAP'
];

const decisionKeywords = [
  'decided', 'decision', 'we\'ll go with', 'let\'s use', 'agreed to',
  'final decision', 'conclusion', 'settled on', 'choosing', 'selected',
  'finalized', 'confirmed', 'resolved', 'the choice is', 'option selected',
  'chosen', 'determined', 'select', 'choose', 'opt for', 'picked', 'move forward with'
];

const tensionKeywords = [
  'frustrated', 'angry', 'upset', 'annoyed', 'irritated', 'stress',
  'pressure', 'urgent', 'critical', 'emergency', 'must', 'immediately',
  'fuck', 'shut up', 'bitch', 'disappointed', 'unhappy', 'dismayed',
  'agitated', 'mad', 'severe', 'high priority', 'bottleneck', 'at risk',
  'warning', 'disaster', 'failing', 'shit', 'damn', 'hell', 'stupid',
  'idiot', 'terrible', 'awful', 'horrible', 'useless', 'nonsense'
];

const enthusiasmKeywords = [
  'excited', 'amazing', 'awesome', 'fantastic', 'love it', 'brilliant',
  'incredible', 'excellent', 'outstanding', 'wonderful', 'perfect', 'love',
  'love this', 'superb', 'terrific', 'phenomenal', 'fabulous', 'stellar',
  'great work', 'well done', 'thrilled', 'delighted', 'can\'t wait', 'looking forward'
];

export function detectEmotion(text: string): Emotion {
  const lowerText = text.toLowerCase();

  const tensionCount = tensionKeywords.filter(kw => lowerText.includes(kw)).length;
  const enthusiasmCount = enthusiasmKeywords.filter(kw => lowerText.includes(kw)).length;

  if (tensionCount >= 2) return 'tense';
  if (enthusiasmCount >= 1) return 'enthusiastic';
  if (tensionCount === 1) return 'tense';

  const hasExclamation = text.includes('!');
  const hasMultipleCaps = (text.match(/[A-Z]/g) || []).length > text.length * 0.3;
  const hasQuestionMark = text.includes('?');

  if (hasMultipleCaps) return 'tense';
  if (hasExclamation && enthusiasmCount > 0) return 'enthusiastic';
  if (hasExclamation) return 'enthusiastic';

  if (hasQuestionMark) return 'neutral';

  return 'calm';
}

export function detectSentiment(text: string): SentimentType | null {
  const lowerText = text.toLowerCase();

  const conflictCount = conflictKeywords.filter(kw => lowerText.includes(kw)).length;
  const agreementCount = agreementKeywords.filter(kw => lowerText.includes(kw)).length;

  if (conflictCount > agreementCount && conflictCount >= 1) return 'conflict';
  if (agreementCount > conflictCount && agreementCount >= 1) return 'agreement';

  return null;
}

export function extractActionItems(text: string): string | null {
  const lowerText = text.toLowerCase();

  const hasActionKeyword = actionItemKeywords.some(kw => lowerText.includes(kw));

  if (hasActionKeyword) {
    return text;
  }

  return null;
}

export function extractDecision(text: string): string | null {
  const lowerText = text.toLowerCase();

  const hasDecisionKeyword = decisionKeywords.some(kw => lowerText.includes(kw));

  if (hasDecisionKeyword) {
    return text;
  }

  return null;
}

export function extractDueDate(text: string): Date | null {
  const lowerText = text.toLowerCase();

  const todayMatch = lowerText.match(/today|tonight/i);
  if (todayMatch) {
    return new Date();
  }

  const tomorrowMatch = lowerText.match(/tomorrow/i);
  if (tomorrowMatch) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }

  const daysMatch = lowerText.match(/in (\d+) days?/i);
  if (daysMatch) {
    const days = parseInt(daysMatch[1]);
    const future = new Date();
    future.setDate(future.getDate() + days);
    return future;
  }

  const weekMatch = lowerText.match(/next (monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
  if (weekMatch) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const targetDay = days.indexOf(weekMatch[1].toLowerCase());
    const today = new Date();
    const currentDay = today.getDay();
    const daysUntil = (targetDay + 7 - currentDay) % 7 || 7;
    const nextDate = new Date();
    nextDate.setDate(today.getDate() + daysUntil);
    return nextDate;
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

export type KeyPointType = 'decision' | 'question' | 'important' | 'agreement';

const keyPointPatterns = {
  decision: [
    /(?:we(?:'ll| will| should)|let's|decided to|going to|planning to) (.*?)(?:\.|$)/i,
    /(?:final decision|conclusion|agreed to|settled on) (.*?)(?:\.|$)/i,
    /(?:we're choosing|selected|picking|opting for) (.*?)(?:\.|$)/i
  ],
  question: [
    /(?:what|how|why|when|where|who|should we|can we|could we) (.*?\?)/i,
    /(?:do you think|any thoughts on|wondering if) (.*?)(?:\?|\.)/i
  ],
  important: [
    /(?:critical|crucial|important|urgent|priority|key point) (.*?)(?:\.|$)/i,
    /(?:must|essential|vital|imperative) (.*?)(?:\.|$)/i,
    /(?:note that|remember|keep in mind) (.*?)(?:\.|$)/i
  ],
  agreement: [
    /(?:agreed|exactly|absolutely|definitely|makes sense|good idea) (.*?)(?:\.|$)/i,
    /(?:i like|sounds good|perfect|approved|support) (.*?)(?:\.|$)/i
  ]
};

export function detectKeyPoints(text: string): Array<{ type: KeyPointType; text: string; snippet: string }> {
  const keyPoints: Array<{ type: KeyPointType; text: string; snippet: string }> = [];

  for (const [type, patterns] of Object.entries(keyPointPatterns)) {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        keyPoints.push({
          type: type as KeyPointType,
          text: text,
          snippet: match[1]?.trim() || text.substring(0, 100)
        });
        break;
      }
    }
  }

  return keyPoints;
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
