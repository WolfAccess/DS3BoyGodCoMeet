import { MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';
import { type Transcript } from '../lib/supabase';

type Props = {
  transcripts: Transcript[];
  participants: Array<{ id: string; name: string }>;
};

const emotionStyles = {
  calm: 'bg-green-50 border-green-200',
  tense: 'bg-red-50 border-red-200',
  enthusiastic: 'bg-blue-50 border-blue-200',
  neutral: 'bg-gray-50 border-gray-200'
};

export function TranscriptView({ transcripts, participants }: Props) {
  const getParticipantName = (participantId: string) => {
    const participant = participants.find(p => p.id === participantId);
    return participant?.name || 'Unknown';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-gray-600" />
        <h2 className="text-xl font-semibold text-gray-800">Live Transcript</h2>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {transcripts.length > 0 ? (
          transcripts.map((transcript) => (
            <div
              id={`transcript-${transcript.id}`}
              key={transcript.id}
              className={`border rounded-lg p-3 transition-all ${emotionStyles[transcript.emotion]}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800 text-sm">
                    {getParticipantName(transcript.participant_id)}
                  </span>
                  {transcript.sentiment_type === 'conflict' && (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  {transcript.sentiment_type === 'agreement' && (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(transcript.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm text-gray-700">{transcript.content}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-8">No transcript entries yet. Start recording to see live transcription.</p>
        )}
      </div>
    </div>
  );
}
