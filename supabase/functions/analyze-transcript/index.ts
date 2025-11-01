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
  type: 'decision' | 'action' | 'question' | 'important' | 'agreement' | 'concern';
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
  
  const tensionWords = /\b(frustrated|angry|upset|annoyed|irritated|stress|pressure|urgent|critical|emergency|must|immediately)\b/gi;
  const enthusiasmWords = /\b(excited|amazing|awesome|fantastic|love it|brilliant|incredible|excellent|outstanding|wonderful|perfect)\b/gi;
  
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
      /(?:we(?:'ll| will| should)|let's|decided to|going to|planning to)\s+(.{10,100}?)(?:\.|$)/i,
      /(?:final decision|conclusion|agreed to|settled on)\s+(.{10,100}?)(?:\.|$)/i,
      /(?:we're choosing|selected|picking|opting for)\s+(.{10,100}?)(?:\.|$)/i
    ],
    action: [
      /(?:i(?:'ll| will)|someone needs to|we need to|action item)\s+(.{10,100}?)(?:\.|$)/i,
      /(?:follow up|next steps?|to do|deadline)\s+(.{10,100}?)(?:\.|$)/i,
      /(?:i'll handle|take care of|work on|responsible for)\s+(.{10,100}?)(?:\.|$)/i
    ],
    question: [
      /(?:what|how|why|when|where|who|should we|can we|could we)\s+(.{10,100}?\?)/i,
      /(?:do you think|any thoughts on|wondering if)\s+(.{10,100}?)(?:\?|\.)/i
    ],
    important: [
      /(?:critical|crucial|important|urgent|priority|key point)\s+(.{10,100}?)(?:\.|$)/i,
      /(?:must|essential|vital|imperative)\s+(.{10,100}?)(?:\.|$)/i,
      /(?:note that|remember|keep in mind)\s+(.{10,100}?)(?:\.|$)/i
    ],
    agreement: [
      /(?:agreed|exactly|absolutely|definitely|makes sense|good idea)(?:\s+(.{10,100}?))?(?:\.|$)/i,
      /(?:i like|sounds good|perfect|approved|support)(?:\s+(.{10,100}?))?(?:\.|$)/i
    ],
    concern: [
      /(?:concerned about|worried about|issue with|problem with)\s+(.{10,100}?)(?:\.|$)/i,
      /(?:risk|challenge|obstacle|blocker)\s+(.{10,100}?)(?:\.|$)/i
    ]
  };
  
  for (const [type, regexList] of Object.entries(patterns)) {
    for (const regex of regexList) {
      const match = text.match(regex);
      if (match) {
        keyPoints.push({
          type: type as KeyPoint['type'],
          text: text,
          snippet: match[1]?.trim() || text.substring(0, 100)
        });
        break;
      }
    }
  }
  
  return keyPoints;
}

function extractActionItem(text: string): string | null {
  const lowerText = text.toLowerCase();
  const actionWords = /\b(i will|i'll|let me|i can|i'll handle|i'll take care|i'll do|we should|we need to|follow up|next steps|action item|to do|deadline|by|before)\b/i;
  
  return actionWords.test(lowerText) ? text : null;
}

function extractDecision(text: string): string | null {
  const lowerText = text.toLowerCase();
  const decisionWords = /\b(decided|decision|we'll go with|let's use|agreed to|final decision|conclusion|settled on|choosing|selected)\b/i;
  
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