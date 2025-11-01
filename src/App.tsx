import { useState, useEffect } from 'react';
import { supabase, type Meeting, type Participant, type Transcript, type ActionItem, type MeetingAnalytics, type KeyPoint, type MeetingInvite } from './lib/supabase';
import {
  detectEmotion,
  detectSentiment,
  extractActionItems,
  extractDecision,
  extractDueDate,
  detectKeyPoints
} from './lib/analysisEngine';
import { MeetingRecorder } from './components/MeetingRecorder';
import { EmotionHeatmap } from './components/EmotionHeatmap';
import { TalkBalanceMeter } from './components/TalkBalanceMeter';
import { ConflictAgreementTracker } from './components/ConflictAgreementTracker';
import { ActionItemsList } from './components/ActionItemsList';
import { KeyDecisions } from './components/KeyDecisions';
import { TranscriptView } from './components/TranscriptView';
import { MeetingMemory } from './components/MeetingMemory';
import { SmartReminders } from './components/SmartReminders';
import { AuthForm } from './components/AuthForm';
import { LiveTranscript } from './components/LiveTranscript';
import { KeyPointsPanel } from './components/KeyPointsPanel';
import { MeetingSearch } from './components/MeetingSearch';
import { MessageSquare, Plus, LogOut } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentMeeting, setCurrentMeeting] = useState<Meeting | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [analytics, setAnalytics] = useState<MeetingAnalytics | null>(null);
  const [allMeetings, setAllMeetings] = useState<Meeting[]>([]);
  const [invites, setInvites] = useState<MeetingInvite[]>([]);
  const [keyPoints, setKeyPoints] = useState<KeyPoint[]>([]);
  const [currentSpeaker, setCurrentSpeaker] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [speakStartTimes, setSpeakStartTimes] = useState<Map<string, number>>(new Map());
  const [showNewMeetingDialog, setShowNewMeetingDialog] = useState(false);
  const [newMeetingTitle, setNewMeetingTitle] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');

  useEffect(() => {
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadMeetings();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    setLoading(false);
    if (user) {
      loadMeetings();
    }
  };

  const loadMeetings = async () => {
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading meetings:', error);
    } else {
      setAllMeetings(data || []);
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
  };

  const handleSignUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) throw error;

    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        email,
        full_name: fullName
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCurrentMeeting(null);
    setParticipants([]);
    setTranscripts([]);
    setActionItems([]);
    setAnalytics(null);
    setKeyPoints([]);
    setAllMeetings([]);
  };

  const createNewMeeting = async () => {
    if (!newMeetingTitle.trim() || !user) return;

    const { data, error } = await supabase
      .from('meetings')
      .insert({
        title: newMeetingTitle.trim(),
        owner_id: user.id,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating meeting:', error);
    } else {
      setCurrentMeeting(data);
      setNewMeetingTitle('');
      setShowNewMeetingDialog(false);
      loadMeetings();

      const { error: analyticsError } = await supabase
        .from('meeting_analytics')
        .insert({ meeting_id: data.id });

      if (analyticsError) {
        console.error('Error creating analytics:', analyticsError);
      }
    }
  };

  const loadMeetingData = async (meetingId: string) => {
    const [participantsRes, transcriptsRes, actionItemsRes, analyticsRes, meetingRes, invitesRes, keyPointsRes] = await Promise.all([
      supabase.from('participants').select('*').eq('meeting_id', meetingId),
      supabase.from('transcripts').select('*').eq('meeting_id', meetingId).order('timestamp', { ascending: true }),
      supabase.from('action_items').select('*').eq('meeting_id', meetingId),
      supabase.from('meeting_analytics').select('*').eq('meeting_id', meetingId).maybeSingle(),
      supabase.from('meetings').select('*').eq('id', meetingId).single(),
      supabase.from('meeting_invites').select('*').eq('meeting_id', meetingId),
      supabase.from('key_points').select('*').eq('meeting_id', meetingId)
    ]);

    if (participantsRes.data) setParticipants(participantsRes.data);
    if (transcriptsRes.data) setTranscripts(transcriptsRes.data);
    if (actionItemsRes.data) setActionItems(actionItemsRes.data);
    if (analyticsRes.data) setAnalytics(analyticsRes.data);
    if (meetingRes.data) setCurrentMeeting(meetingRes.data);
    if (invitesRes.data) setInvites(invitesRes.data);
    if (keyPointsRes.data) setKeyPoints(keyPointsRes.data);
  };

  const addParticipant = async (name: string) => {
    if (!currentMeeting) return;

    const { data, error } = await supabase
      .from('participants')
      .insert({
        meeting_id: currentMeeting.id,
        name
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding participant:', error);
    } else {
      setParticipants([...participants, data]);
    }
  };

  const removeParticipant = async (participantId: string) => {
    if (!currentMeeting) return;

    if (currentSpeaker === participantId) {
      setCurrentSpeaker(null);
    }

    const { error } = await supabase
      .from('participants')
      .delete()
      .eq('id', participantId);

    if (error) {
      console.error('Error removing participant:', error);
    } else {
      setParticipants(participants.filter(p => p.id !== participantId));
    }
  };

  const startRecording = () => {
    setIsRecording(true);
  };

  const stopRecording = async () => {
    setIsRecording(false);
    setCurrentSpeaker(null);

    if (currentMeeting && currentSpeaker) {
      const speakTime = speakStartTimes.get(currentSpeaker);
      if (speakTime) {
        const duration = Math.floor((Date.now() - speakTime) / 1000);
        await updateParticipantSpeakTime(currentSpeaker, duration);
      }
    }

    if (currentMeeting) {
      await supabase
        .from('meetings')
        .update({ end_time: new Date().toISOString(), status: 'completed' })
        .eq('id', currentMeeting.id);

      loadMeetings();
    }
  };

  const selectSpeaker = async (participantId: string) => {
    if (currentSpeaker) {
      const speakTime = speakStartTimes.get(currentSpeaker);
      if (speakTime) {
        const duration = Math.floor((Date.now() - speakTime) / 1000);
        await updateParticipantSpeakTime(currentSpeaker, duration);
      }
    }

    setCurrentSpeaker(participantId);
    setSpeakStartTimes(new Map(speakStartTimes.set(participantId, Date.now())));
  };

  const updateParticipantSpeakTime = async (participantId: string, additionalSeconds: number) => {
    const participant = participants.find(p => p.id === participantId);
    if (!participant) return;

    const newSpeakTime = participant.speak_time_seconds + additionalSeconds;

    const { error } = await supabase
      .from('participants')
      .update({ speak_time_seconds: newSpeakTime })
      .eq('id', participantId);

    if (!error) {
      setParticipants(participants.map(p =>
        p.id === participantId ? { ...p, speak_time_seconds: newSpeakTime } : p
      ));
    }
  };

  const addTranscript = async (participantId: string, text: string) => {
    if (!currentMeeting) return;

    const emotion = detectEmotion(text);
    const sentiment = detectSentiment(text);

    const { data, error } = await supabase
      .from('transcripts')
      .insert({
        meeting_id: currentMeeting.id,
        participant_id: participantId,
        content: text,
        emotion,
        sentiment_type: sentiment
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding transcript:', error);
      return;
    }

    setTranscripts([...transcripts, data]);

    const keyPoints = detectKeyPoints(text);
    if (keyPoints.length > 0) {
      const participant = participants.find(p => p.id === participantId);
      const speakerName = participant?.name || 'Unknown';

      const keyPointsToInsert = keyPoints.map(kp => ({
        meeting_id: currentMeeting.id,
        transcript_id: data.id,
        type: kp.type,
        text: kp.text,
        snippet: kp.snippet,
        speaker_name: speakerName
      }));

      const { data: insertedKeyPoints } = await supabase
        .from('key_points')
        .insert(keyPointsToInsert)
        .select();

      if (insertedKeyPoints) {
        setKeyPoints([...keyPoints, ...insertedKeyPoints]);
      }
    }

    const actionItemText = extractActionItems(text);
    if (actionItemText) {
      const dueDate = extractDueDate(text);
      await supabase.from('action_items').insert({
        meeting_id: currentMeeting.id,
        participant_id: participantId,
        content: actionItemText,
        due_date: dueDate?.toISOString()
      });

      const { data: items } = await supabase
        .from('action_items')
        .select('*')
        .eq('meeting_id', currentMeeting.id);
      if (items) setActionItems(items);
    }

    const decision = extractDecision(text);

    const updatedAnalytics = {
      emotion_timeline: [
        ...(analytics?.emotion_timeline || []),
        { time: data.timestamp, emotion }
      ],
      conflict_moments: sentiment === 'conflict'
        ? [...(analytics?.conflict_moments || []), { time: data.timestamp, content: text }]
        : (analytics?.conflict_moments || []),
      agreement_moments: sentiment === 'agreement'
        ? [...(analytics?.agreement_moments || []), { time: data.timestamp, content: text }]
        : (analytics?.agreement_moments || []),
      key_decisions: decision
        ? [...(analytics?.key_decisions || []), { time: data.timestamp, decision }]
        : (analytics?.key_decisions || [])
    };

    await supabase
      .from('meeting_analytics')
      .update(updatedAnalytics)
      .eq('meeting_id', currentMeeting.id);

    const { data: analyticsData } = await supabase
      .from('meeting_analytics')
      .select('*')
      .eq('meeting_id', currentMeeting.id)
      .maybeSingle();

    if (analyticsData) setAnalytics(analyticsData);
  };

  const refreshActionItems = async () => {
    if (!currentMeeting) return;

    const { data } = await supabase
      .from('action_items')
      .select('*')
      .eq('meeting_id', currentMeeting.id);

    if (data) setActionItems(data);
  };

  const deleteMeeting = async (meetingId: string) => {
    const { error } = await supabase
      .from('meetings')
      .delete()
      .eq('id', meetingId);

    if (error) {
      console.error('Error deleting meeting:', error);
    } else {
      setAllMeetings(allMeetings.filter(m => m.id !== meetingId));
    }
  };

  const toggleMeetingBookmark = async (meetingId: string, isBookmarked: boolean) => {
    const { error } = await supabase
      .from('meetings')
      .update({ is_bookmarked: isBookmarked })
      .eq('id', meetingId);

    if (error) {
      console.error('Error updating bookmark:', error);
    } else {
      setAllMeetings(allMeetings.map(m =>
        m.id === meetingId ? { ...m, is_bookmarked: isBookmarked } : m
      ));
    }
  };

  const inviteToMeeting = async (email: string) => {
    if (!currentMeeting) return;

    const { data, error } = await supabase
      .from('meeting_invites')
      .insert({
        meeting_id: currentMeeting.id,
        email: email.toLowerCase()
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending invite:', error);
    } else {
      setInvites([...invites, data]);
    }
  };

  const removeInvite = async (inviteId: string) => {
    const { error } = await supabase
      .from('meeting_invites')
      .delete()
      .eq('id', inviteId);

    if (error) {
      console.error('Error removing invite:', error);
    } else {
      setInvites(invites.filter(i => i.id !== inviteId));
    }
  };

  const searchMeetings = async (query: string) => {
    if (!user) return [];

    const { data: allTranscripts, error } = await supabase
      .from('transcripts')
      .select(`
        *,
        meetings!inner(*)
      `)
      .eq('meetings.owner_id', user.id)
      .ilike('content', `%${query}%`)
      .order('timestamp', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error searching transcripts:', error);
      return [];
    }

    const results = allTranscripts.map((transcript: any) => ({
      meeting: transcript.meetings,
      transcript: {
        id: transcript.id,
        meeting_id: transcript.meeting_id,
        participant_id: transcript.participant_id,
        content: transcript.content,
        timestamp: transcript.timestamp,
        emotion: transcript.emotion,
        sentiment_type: transcript.sentiment_type,
        created_at: transcript.created_at
      },
      relevanceScore: calculateRelevance(transcript.content, query)
    }));

    results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return results;
  };

  const calculateRelevance = (content: string, query: string): number => {
    const lowerContent = content.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const queryWords = lowerQuery.split(' ').filter(Boolean);

    let score = 0;

    if (lowerContent.includes(lowerQuery)) {
      score += 10;
    }

    queryWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowerContent.match(regex);
      if (matches) {
        score += matches.length;
      }
    });

    return score;
  };

  const handleSearchSelect = async (meetingId: string, transcriptId: string) => {
    await loadMeetingData(meetingId);

    setTimeout(() => {
      const element = document.getElementById(`transcript-${transcriptId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('ring-4', 'ring-yellow-400');
        setTimeout(() => {
          element.classList.remove('ring-4', 'ring-yellow-400');
        }, 3000);
      }
    }, 500);
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-xl text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onSignIn={handleSignIn} onSignUp={handleSignUp} />;
  }

  if (!currentMeeting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <MessageSquare className="w-12 h-12 text-blue-600" />
              <h1 className="text-5xl font-bold text-gray-900">TalkLess</h1>
            </div>
            <p className="text-xl text-gray-600">AI-Powered Meeting Analysis & Summarization</p>
          </div>

          {!showNewMeetingDialog ? (
            <div className="text-center">
              <button
                onClick={() => setShowNewMeetingDialog(true)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg"
              >
                <Plus className="w-6 h-6" />
                Start New Meeting
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">New Meeting</h2>
              <input
                type="text"
                value={newMeetingTitle}
                onChange={(e) => setNewMeetingTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createNewMeeting()}
                placeholder="Enter meeting title..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={createNewMeeting}
                  disabled={!newMeetingTitle.trim()}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowNewMeetingDialog(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {allMeetings.length > 0 && (
            <>
              <div className="mt-12">
                <MeetingSearch
                  meetings={allMeetings}
                  onSelectMeeting={handleSearchSelect}
                  onSearch={searchMeetings}
                />
              </div>

              <div className="mt-6">
                <MeetingMemory
                  meetings={allMeetings}
                  onSelectMeeting={loadMeetingData}
                  onDeleteMeeting={deleteMeeting}
                  onToggleBookmark={toggleMeetingBookmark}
                />
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{currentMeeting.title}</h1>
            <p className="text-gray-600">
              Started at {new Date(currentMeeting.start_time).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setCurrentMeeting(null);
                setParticipants([]);
                setTranscripts([]);
                setActionItems([]);
                setAnalytics(null);
                setKeyPoints([]);
                setCurrentSpeaker(null);
                setIsRecording(false);
              }}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
            >
              Back to Home
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-3">
            <MeetingRecorder
              isRecording={isRecording}
              onStart={startRecording}
              onStop={stopRecording}
              participants={participants}
              currentSpeaker={currentSpeaker}
              onAddParticipant={addParticipant}
              onRemoveParticipant={removeParticipant}
              onSelectSpeaker={selectSpeaker}
              onAddTranscript={addTranscript}
              invites={invites}
              onInvite={inviteToMeeting}
              onRemoveInvite={removeInvite}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <LiveTranscript
            transcripts={transcripts.map(t => ({
              ...t,
              text: t.content
            }))}
            participants={participants}
            interimText={interimTranscript}
            currentSpeaker={currentSpeaker}
          />
          <KeyPointsPanel
            keyPoints={keyPoints}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ConflictAgreementTracker
            conflicts={analytics?.conflict_moments || []}
            agreements={analytics?.agreement_moments || []}
          />
          <KeyDecisions decisions={analytics?.key_decisions || []} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <EmotionHeatmap timeline={analytics?.emotion_timeline || []} />
          <TalkBalanceMeter participants={participants} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-3">
            <SmartReminders actionItems={actionItems} participants={participants} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TranscriptView transcripts={transcripts} participants={participants} />
          <ActionItemsList
            actionItems={actionItems}
            participants={participants}
            onUpdate={refreshActionItems}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
