import { useEffect, useRef } from 'react';
import { detectKeyPoints, getKeyPointColor, getKeyPointIcon, type KeyPointType } from '../lib/analysisEngine';

type Transcript = {
  id: string;
  participant_id: string;
  text: string;
  timestamp: string;
  emotion?: string;
};

type Participant = {
  id: string;
  name: string;
};

type Props = {
  transcripts: Transcript[];
  participants: Participant[];
  interimText?: string;
  currentSpeaker?: string | null;
};

export function LiveTranscript({ transcripts, participants, interimText, currentSpeaker }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcripts, interimText]);

  const getParticipantName = (participantId: string) => {
    return participants.find(p => p.id === participantId)?.name || 'Unknown';
  };

  const renderTranscriptWithKeyPoints = (transcript: Transcript) => {
    const keyPoints = detectKeyPoints(transcript.text);
    const hasKeyPoints = keyPoints.length > 0;

    return (
      <div
        key={transcript.id}
        className={`mb-3 p-3 rounded-lg ${hasKeyPoints ? 'bg-gradient-to-r from-blue-50 to-white border-l-4 border-blue-400' : 'bg-gray-50'}`}
      >
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900">
              {getParticipantName(transcript.participant_id)}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(transcript.timestamp).toLocaleTimeString()}
            </span>
          </div>
          {hasKeyPoints && (
            <div className="flex gap-1">
              {keyPoints.map((kp, idx) => (
                <span
                  key={idx}
                  className={`px-2 py-1 rounded text-xs font-semibold border ${getKeyPointColor(kp.type)}`}
                >
                  {getKeyPointIcon(kp.type)} {kp.type.toUpperCase()}
                </span>
              ))}
            </div>
          )}
        </div>
        <p className={`text-gray-800 ${hasKeyPoints ? 'font-medium' : ''}`}>
          {transcript.text}
        </p>
        {hasKeyPoints && (
          <div className="mt-2 pt-2 border-t border-blue-200">
            {keyPoints.map((kp, idx) => (
              <div key={idx} className="text-sm text-blue-900 mt-1">
                <span className="font-semibold">{kp.type}:</span> {kp.snippet}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Live Transcript</h2>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Recording</span>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="space-y-2 max-h-[600px] overflow-y-auto pr-2"
        style={{ scrollBehavior: 'smooth' }}
      >
        {transcripts.length === 0 && !interimText && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No transcripts yet</p>
            <p className="text-sm mt-2">Start speaking to see the live transcript</p>
          </div>
        )}

        {transcripts.map(transcript => renderTranscriptWithKeyPoints(transcript))}

        {interimText && currentSpeaker && (
          <div className="mb-3 p-3 rounded-lg bg-blue-50 border-2 border-blue-300 border-dashed">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-blue-900">
                {getParticipantName(currentSpeaker)}
              </span>
              <span className="text-xs text-blue-600 animate-pulse">Speaking...</span>
            </div>
            <p className="text-blue-800 italic">{interimText}</p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-2">
          <div className="text-xs">
            <span className="font-semibold">Key Point Types:</span>
          </div>
          {(['decision', 'action', 'question', 'important', 'agreement', 'concern'] as KeyPointType[]).map(type => (
            <span
              key={type}
              className={`px-2 py-1 rounded text-xs font-semibold border ${getKeyPointColor(type)}`}
            >
              {getKeyPointIcon(type)} {type}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
