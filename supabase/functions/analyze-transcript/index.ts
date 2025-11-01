import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AnalysisRequest {
  text: string;
}

interface KeyPoint {
  type: 'decision' | 'question' | 'important' | 'agreement';
  text: string;
  snippet: string;
}

interface AnalysisResponse {
  emotion: 'calm' | 'tense' | 'enthusiastic' | 'neutral';
  sentiment: 'conflict' | 'agreement' | 'neutral' | null;
  keyPoints: KeyPoint[];
  actionItem: string | null;
  decision: string | null;
}

function analyzeEmotion(text: string): 'calm' | 'tense' | 'enthusiastic' | 'neutral' {
  const lowerText = text.toLowerCase();
  
const tensionWords = /\b(frustrated|angry|upset|annoyed|irritated|stress|pressure|urgent|critical|emergency|must|immediately|fuck|shut up|bitch|disappointed|unhappy|dismayed|agitated|mad|severe|high priority|bottleneck|at risk|warning|disaster|failing|shit|damn|hell|stupid|idiot|terrible|awful|horrible|useless|nonsense)\b/gi;

const enthusiasmWords = /\b(excited|amazing|awesome|fantastic|love it|brilliant|incredible|excellent|outstanding|wonderful|perfect|love|love this|superb|terrific|phenomenal|fabulous|stellar|great work|well done|thrilled|delighted|can't wait|looking forward)\b/gi;
  
  const tensionMatches = (lowerText.match(tensionWords) || []).length;
  const enthusiasmMatches = (lowerText.match(enthusiasmWords) || []).length;
  
  if (tensionMatches >= 2) return 'tense';
  if (enthusiasmMatches >= 1) return 'enthusiastic';
  if (tensionMatches === 1) return 'tense';
  
  const hasExclamation = text.includes('!');
  const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
  
  if (capsRatio > 0.3) return 'tense';
  if (hasExclamation && enthusiasmMatches > 0) return 'enthusiastic';
  if (hasExclamation) return 'enthusiastic';
  
  return text.includes('?') ? 'neutral' : 'calm';
}

function analyzeSentiment(text: string): 'conflict' | 'agreement' | 'neutral' | null {
  const lowerText = text.toLowerCase();
  
  const conflictWords = /\b(disagree|wrong|no way|however|issue|problem|concern|worried|against|oppose|cannot accept|not good|bad idea|mistake|incorrect)\b/gi;
  const agreementWords = /\b(agree|yes|exactly|right|correct|perfect|good idea|let's do it|sounds good|i like|great|excellent|approve|support|absolutely|definitely|makes sense)\b/gi;
  
  const conflictCount = (lowerText.match(conflictWords) || []).length;
  const agreementCount = (lowerText.match(agreementWords) || []).length;
  
  if (conflictCount > agreementCount && conflictCount >= 1) return 'conflict';
  if (agreementCount > conflictCount && agreementCount >= 1) return 'agreement';
  
  return null;
}

function extractKeyPoints(text: string): KeyPoint[] {
  const keyPoints: KeyPoint[] = [];
  const lowerText = text.toLowerCase();

  const patterns = {
  decision: [
    /\b(we(?:'ll| will| decided| should| plan to| agreed to| are going to))\b/i,
    /\b(let's|lets|i(?:'ll| will)|we(?:'re| are) choosing|opt(?:ed|ing) for)\b/i,
    /\b(decided|decision (is|was)|final decision|we're set on|we'll move forward with)\b/i,
    /\b(going ahead with|settled on|confirmed|concluded)\b/i
  ],

  question: [
    // Question words at start or mid-sentence
    /\b(what|how|why|when|where|who|which)\b.*\?/i,
    /\b(should|can|could|would|will|do|does|did|may|might)\b.*\?/i,
    /\b(any thoughts on|do you think|wondering if|can we|should we|how about)\b/i,
    /(?:^|\s)([A-Z][a-z]+,? )?(could|can|would|should|may|might)\b/i,
    /\?$/  // fallback: any question mark
  ],

  important: [
    /\b(important|urgent|critical|crucial|priority|key|significant)\b/i,
    /\b(must|essential|vital|imperative|mandatory|required)\b/i,
    /\b(note that|remember to|keep in mind|don't forget|take note)\b/i,
    /\b(really|very|extremely|highly|super)\s+(important|critical)\b/i
  ],

  agreement: [
    /\b(agreed|agree|absolutely|definitely|exactly|makes sense|good idea)\b/i,
    /\b(yes|yeah|yep|sure|right|correct|true|sounds good|ok|okay|fine)\b/i,
    /\b(i like that|i support|approved|perfect|i'm in|count me in|love it)\b/i,
    /\b(let's do it|go ahead|that's fine|works for me)\b/i
  ],

  disagreement: [
    /\b(i disagree|not sure|don't think|i doubt|maybe not|hmm|not really)\b/i,
    /\b(i'd prefer|i suggest|i propose|i'm not convinced|i have concerns)\b/i,
    /\b(but|however|although|on the other hand)\b/i
  ]
};

  for (const [type, regexList] of Object.entries(patterns)) {
    for (const regex of regexList) {
      if (regex.test(text)) {
        const snippet = text.length > 80 ? text.substring(0, 80) + '...' : text;
        keyPoints.push({
          type: type as KeyPoint['type'],
          text: text,
          snippet: snippet
        });
        break;
      }
    }
  }

  return keyPoints;
}

function extractActionItem(text: string): string | null {
  const lowerText = text.toLowerCase();
  const actionWords = /\b(i will|i'll|let me|i can|i'll handle|i'll take care|i'll do|we should|we need to|i need to|follow up|next steps?|action item|to do|deadline|by tomorrow|by today|i'll make|i'll send|i'll create|i'll update)\b/i;

  return actionWords.test(lowerText) ? text : null;
}

function extractDecision(text: string): string | null {
  const lowerText = text.toLowerCase();
  const decisionWords = /\b(decided|decision|decide to|we'll go with|let's use|let's do|let's go|agreed to|final decision|conclusion|settled on|choosing|selected|we will|we'll|we should|going to|planning to)\b/i;

  return decisionWords.test(lowerText) ? text : null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { text }: AnalysisRequest = await req.json();

    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const analysis: AnalysisResponse = {
      emotion: analyzeEmotion(text),
      sentiment: analyzeSentiment(text),
      keyPoints: extractKeyPoints(text),
      actionItem: extractActionItem(text),
      decision: extractDecision(text)
    };

    return new Response(
      JSON.stringify(analysis),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Analysis error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to analyze text' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});