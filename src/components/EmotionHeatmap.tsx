import { useMemo, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { EmotionWordCounts } from '../lib/analysisEngine';

type EmotionPoint = {
  time: string;
  emotion: 'calm' | 'tense' | 'enthusiastic' | 'neutral';
};

type Props = {
  timeline: EmotionPoint[];
  meetingId?: string;
};

const emotionColors = {
  calm: 'bg-green-500',
  tense: 'bg-red-500',
  enthusiastic: 'bg-blue-500',
  neutral: 'bg-gray-400'
};

const emotionLabels = {
  calm: 'Calm',
  tense: 'Tense',
  enthusiastic: 'Enthusiastic',
  neutral: 'Neutral'
};

export function EmotionHeatmap({ timeline, meetingId }: Props) {
  const [currentMeetingWords, setCurrentMeetingWords] = useState<EmotionWordCounts | null>(null);
  const [allMeetingsAverage, setAllMeetingsAverage] = useState<Record<string, number> | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadAllMeetingsAverage();
    if (meetingId) {
      loadCurrentMeetingWords();
    }
  }, [meetingId]);

  const loadCurrentMeetingWords = async () => {
    if (!meetingId) return;

    try {
      const { data, error } = await supabase
        .from('meeting_analytics')
        .select('emotion_word_counts')
        .eq('meeting_id', meetingId)
        .maybeSingle();

      if (error) {
        console.error('Error loading current meeting words:', error);
        return;
      }

      if (data?.emotion_word_counts) {
        setCurrentMeetingWords(data.emotion_word_counts as EmotionWordCounts);
      }
    } catch (error) {
      console.error('Error loading meeting words:', error);
    }
  };

  const loadAllMeetingsAverage = async () => {
    try {
      const { data, error } = await supabase
        .from('meeting_analytics')
        .select('emotion_word_counts');

      if (error) {
        console.error('Error loading emotion averages:', error);
        return;
      }

      if (!data || data.length === 0) {
        setAllMeetingsAverage(null);
        return;
      }

      const totalCounts = {
        calm: 0,
        tense: 0,
        enthusiastic: 0,
        neutral: 0
      };

      let meetingCount = 0;

      data.forEach((analytics: any) => {
        const emotionCounts = analytics.emotion_word_counts as EmotionWordCounts;
        if (emotionCounts) {
          totalCounts.calm += emotionCounts.calm?.count || 0;
          totalCounts.tense += emotionCounts.tense?.count || 0;
          totalCounts.enthusiastic += emotionCounts.enthusiastic?.count || 0;
          totalCounts.neutral += emotionCounts.neutral?.count || 0;
          meetingCount++;
        }
      });

      if (meetingCount > 0) {
        const averages = {
          calm: totalCounts.calm / meetingCount,
          tense: totalCounts.tense / meetingCount,
          enthusiastic: totalCounts.enthusiastic / meetingCount,
          neutral: totalCounts.neutral / meetingCount
        };
        setAllMeetingsAverage(averages);
      }
    } catch (error) {
      console.error('Error loading averages:', error);
    }
  };

  const emotionCounts = useMemo(() => {
    const counts = {
      calm: 0,
      tense: 0,
      enthusiastic: 0,
      neutral: 0
    };

    timeline.forEach(point => {
      counts[point.emotion]++;
    });

    return counts;
  }, [timeline]);

  const displayCounts = allMeetingsAverage || emotionCounts;
  const totalPoints = allMeetingsAverage
    ? Object.values(allMeetingsAverage).reduce((sum, count) => sum + count, 0)
    : timeline.length;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Emotion Heatmap</h2>
        {allMeetingsAverage && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            Average across all meetings
          </span>
        )}
      </div>

      <div className="mb-6">
        <div className="flex h-12 rounded-lg overflow-hidden">
          {timeline.map((point, idx) => {
            const width = `${(1 / totalPoints) * 100}%`;
            return (
              <div
                key={idx}
                className={`${emotionColors[point.emotion]} transition-all hover:opacity-80`}
                style={{ width }}
                title={`${new Date(point.time).toLocaleTimeString()} - ${emotionLabels[point.emotion]}`}
              />
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {Object.entries(displayCounts).map(([emotion, count]) => {
          const percentage = totalPoints > 0 ? ((count / totalPoints) * 100).toFixed(1) : 0;
          const displayCount = allMeetingsAverage ? count.toFixed(1) : count;
          return (
            <div key={emotion} className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded ${emotionColors[emotion as keyof typeof emotionColors]}`} />
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">{emotionLabels[emotion as keyof typeof emotionLabels]}</span>
                    {allMeetingsAverage && (
                      <span className="text-xs text-gray-400">avg: {displayCount}</span>
                    )}
                    {currentMeetingWords && currentMeetingWords[emotion as keyof EmotionWordCounts]?.words.length > 0 && (
                      <button
                        onClick={() => setExpandedCategory(expandedCategory === emotion ? null : emotion)}
                        className="text-xs text-blue-600 hover:text-blue-700 underline"
                      >
                        {expandedCategory === emotion ? 'hide' : 'show'} words
                      </button>
                    )}
                  </div>
                  <span className="text-gray-500">{percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${emotionColors[emotion as keyof typeof emotionColors]}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                {expandedCategory === emotion && currentMeetingWords && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                    <div className="flex flex-wrap gap-1">
                      {currentMeetingWords[emotion as keyof EmotionWordCounts].words.map((word, idx) => (
                        <span key={idx} className="px-2 py-1 bg-white border border-gray-200 rounded">
                          {word}
                        </span>
                      ))}
                    </div>
                    <div className="mt-1 text-gray-500">
                      Total: {currentMeetingWords[emotion as keyof EmotionWordCounts].count} words
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {timeline.length === 0 && (
        <p className="text-gray-500 text-center py-8">No emotion data yet. Start recording to see the heatmap.</p>
      )}
    </div>
  );
}
