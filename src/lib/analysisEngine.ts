export type Emotion = 'calm' | 'tense' | 'enthusiastic' | 'neutral';
export type SentimentType = 'conflict' | 'agreement' | 'neutral';

const conflictKeywords = [
  'disagree', 'wrong', 'no way', 'but', 'however', 'issue', 'problem',
  'concern', 'worried', 'against', 'oppose', 'cannot accept', 'not good',
  'bad idea', 'mistake', 'incorrect'
];

const agreementKeywords = [
  'agree', 'yes', 'exactly', 'right', 'correct', 'perfect', 'good idea',
  'let\'s do it', 'sounds good', 'i like', 'great', 'excellent', 'approve',
  'support', 'absolutely', 'definitely', 'makes sense'
];

const actionItemKeywords = [
  'i will', 'i\'ll', 'let me', 'i can', 'i\'ll handle', 'i\'ll take care',
  'i\'ll do', 'we should', 'we need to', 'follow up', 'next steps',
  'action item', 'to do', 'deadline', 'by', 'before'
];

const decisionKeywords = [
  'decided', 'decision', 'we\'ll go with', 'let\'s use', 'agreed to',
  'final decision', 'conclusion', 'settled on', 'choosing', 'selected'
];

const tensionKeywords = [
  'frustrated', 'angry', 'upset', 'annoyed', 'irritated', 'stress',
  'pressure', 'urgent', 'critical', 'emergency', 'must', 'immediately'
];

const enthusiasmKeywords = [
  'excited', 'amazing', 'awesome', 'fantastic', 'love it', 'brilliant',
  'incredible', 'excellent', 'outstanding', 'wonderful', 'perfect'
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

  if (hasMultipleCaps) return 'tense';
  if (hasExclamation && enthusiasmCount > 0) return 'enthusiastic';

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

export type KeyPointType = 'decision' | 'action' | 'question' | 'important' | 'agreement' | 'concern';

const keyPointPatterns = {
  decision: [
    /(?:we(?:'ll| will| should)|let's|decided to|going to|planning to) (.*?)(?:\.|$)/i,
    /(?:final decision|conclusion|agreed to|settled on) (.*?)(?:\.|$)/i,
    /(?:we're choosing|selected|picking|opting for) (.*?)(?:\.|$)/i
  ],
  action: [
    /(?:i(?:'ll| will)|someone needs to|we need to|action item) (.*?)(?:\.|$)/i,
    /(?:follow up|next steps?|to do|deadline|by|before) (.*?)(?:\.|$)/i,
    /(?:i'll handle|take care of|work on|responsible for) (.*?)(?:\.|$)/i
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
  ],
  concern: [
    /(?:concerned about|worried about|issue with|problem with) (.*?)(?:\.|$)/i,
    /(?:risk|challenge|obstacle|blocker) (.*?)(?:\.|$)/i
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
    decision: 'bg-purple-100 text-purple-800 border-purple-300',
    action: 'bg-blue-100 text-blue-800 border-blue-300',
    question: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    important: 'bg-red-100 text-red-800 border-red-300',
    agreement: 'bg-green-100 text-green-800 border-green-300',
    concern: 'bg-orange-100 text-orange-800 border-orange-300'
  };
  return colors[type];
}

export function getKeyPointIcon(type: KeyPointType): string {
  const icons: Record<KeyPointType, string> = {
    decision: '✓',
    action: '→',
    question: '?',
    important: '!',
    agreement: '👍',
    concern: '⚠'
  };
  return icons[type];
}
