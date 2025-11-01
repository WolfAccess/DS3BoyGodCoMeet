import { useState, useEffect, useRef } from 'react';
import { Mic, Square, UserPlus, Play, MicOff, AlertCircle, X, Mail, UserCheck, UserX, Clock } from 'lucide-react';
import { type MeetingInvite } from '../lib/supabase';

type Participant = {
  id: string;
  name: string;
  speak_time_seconds: number;
};

type Props = {
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
  participants: Participant[];
  currentSpeaker: string | null;
  onAddParticipant: (name: string) => void;
  onRemoveParticipant: (id: string) => void;
  onSelectSpeaker: (id: string) => void;
  onAddTranscript: (participantId: string, text: string) => void;
  invites: MeetingInvite[];
  onInvite: (email: string) => void;
  onRemoveInvite: (id: string) => void;
};

export function MeetingRecorder({
  isRecording,
  onStart,
  onStop,
  participants,
  currentSpeaker,
  onAddParticipant,
  onRemoveParticipant,
  onSelectSpeaker,
  onAddTranscript,
  invites,
  onInvite,
  onRemoveInvite
}: Props) {
  const [newParticipantName, setNewParticipantName] = useState('');
  const [transcriptInput, setTranscriptInput] = useState('');
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [useMicrophone, setUseMicrophone] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState('');

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript + ' ';
          }
        }

        if (final && currentSpeaker) {
          onAddTranscript(currentSpeaker, final.trim());
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setMicError('Microphone access denied. Please enable microphone permissions.');
        } else if (event.error === 'no-speech') {
          setMicError('No speech detected. Please speak into your microphone.');
        } else {
          setMicError(`Speech recognition error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        if (isRecording && useMicrophone && currentSpeaker) {
          try {
            recognitionRef.current?.start();
          } catch (error) {
            console.error('Error restarting recognition:', error);
          }
        } else {
          setIsListening(false);
        }
      };
    } else {
      setMicError('Speech recognition not supported in this browser. Please use Chrome or Edge.');
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error('Error stopping recognition:', error);
        }
      }
    };
  }, []);

  useEffect(() => {
    if (isRecording && useMicrophone && currentSpeaker && recognitionRef.current) {
      try {
        setMicError(null);
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting recognition:', error);
      }
    } else if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
        setInterimTranscript('');
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
  }, [isRecording, useMicrophone, currentSpeaker]);

  const handleAddParticipant = () => {
    if (newParticipantName.trim()) {
      onAddParticipant(newParticipantName.trim());
      setNewParticipantName('');
      setShowAddParticipant(false);
    }
  };

  const handleAddTranscript = () => {
    if (currentSpeaker && transcriptInput.trim()) {
      onAddTranscript(currentSpeaker, transcriptInput.trim());
      setTranscriptInput('');
    }
  };

  const handleSendInvite = () => {
    if (inviteEmail.trim()) {
      onInvite(inviteEmail.trim());
      setInviteEmail('');
      setShowInviteDialog(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <UserCheck className="w-4 h-4 text-green-600" />;
      case 'declined':
        return <UserX className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Meeting Recorder</h2>

        <button
          onClick={isRecording ? onStop : onStart}
          disabled={participants.length === 0}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isRecording ? (
            <>
              <Square className="w-5 h-5" />
              Stop Recording
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Start Recording
            </>
          )}
        </button>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-700">Participants</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowInviteDialog(!showInviteDialog)}
              className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700"
            >
              <Mail className="w-4 h-4" />
              Invite
            </button>
            <button
              onClick={() => setShowAddParticipant(!showAddParticipant)}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            >
              <UserPlus className="w-4 h-4" />
              Add Participant
            </button>
          </div>
        </div>

        {showInviteDialog && (
          <div className="mb-4 p-4 border-2 border-green-200 rounded-lg bg-green-50">
            <div className="flex gap-2 mb-3">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendInvite()}
                placeholder="Enter email address"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={handleSendInvite}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Send
              </button>
            </div>
            {invites.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-600 font-medium mb-2">Invited ({invites.length})</p>
                {invites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between bg-white px-3 py-2 rounded border border-gray-200"
                  >
                    <div className="flex items-center gap-2">
                      {getStatusIcon(invite.status)}
                      <span className="text-sm text-gray-700">{invite.email}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        invite.status === 'accepted' ? 'bg-green-100 text-green-700' :
                        invite.status === 'declined' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {invite.status}
                      </span>
                    </div>
                    <button
                      onClick={() => onRemoveInvite(invite.id)}
                      className="text-red-500 hover:text-red-700"
                      title="Remove invite"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {showAddParticipant && (
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              value={newParticipantName}
              onChange={(e) => setNewParticipantName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddParticipant()}
              placeholder="Enter participant name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddParticipant}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Add
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {participants.map((p) => (
            <div
              key={p.id}
              className={`group relative px-4 py-2 rounded-lg font-medium transition-all ${
                currentSpeaker === p.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <button
                onClick={() => onSelectSpeaker(p.id)}
                className="pr-1"
              >
                {p.name}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveParticipant(p.id);
                }}
                disabled={isRecording}
                className={`ml-2 opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-not-allowed disabled:opacity-30 ${
                  currentSpeaker === p.id ? 'text-white hover:text-red-200' : 'text-red-500 hover:text-red-700'
                }`}
                title={isRecording ? 'Cannot remove during recording' : 'Remove participant'}
              >
                <X className="w-4 h-4 inline" />
              </button>
            </div>
          ))}
        </div>

        {participants.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-4">Add participants to start recording</p>
        )}
      </div>

      {isRecording && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {isListening && useMicrophone ? (
                <Mic className="w-5 h-5 text-red-500 animate-pulse" />
              ) : (
                <MicOff className="w-5 h-5 text-gray-400" />
              )}
              <span className="text-sm font-medium text-gray-700">
                {isListening && useMicrophone ? 'Listening...' : 'Recording in progress'}
              </span>
            </div>

            <button
              onClick={() => setUseMicrophone(!useMicrophone)}
              className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                useMicrophone
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {useMicrophone ? (
                <>
                  <Mic className="w-4 h-4" />
                  Microphone On
                </>
              ) : (
                <>
                  <MicOff className="w-4 h-4" />
                  Microphone Off
                </>
              )}
            </button>
          </div>

          {micError && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-800 font-medium">{micError}</p>
                <p className="text-xs text-yellow-700 mt-1">
                  Switch to manual input using the toggle above.
                </p>
              </div>
            </div>
          )}

          {!useMicrophone && (
            <div className="flex gap-2">
              <textarea
                value={transcriptInput}
                onChange={(e) => setTranscriptInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddTranscript();
                  }
                }}
                placeholder={
                  currentSpeaker
                    ? 'Type what was said and press Enter...'
                    : 'Select a speaker first'
                }
                disabled={!currentSpeaker}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
                rows={3}
              />
            </div>
          )}

          {currentSpeaker && (
            <p className="text-xs text-gray-500">
              Speaking as: <span className="font-semibold">{participants.find(p => p.id === currentSpeaker)?.name}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
