import { useMemo } from 'react';

type EmotionPoint = {
  time: string;
  emotion: 'calm' | 'tense' | 'enthusiastic' | 'neutral';
};

type Props = {
  timeline: EmotionPoint[];
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

export function EmotionHeatmap({ timeline }: Props) {
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

  const totalPoints = timeline.length;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Emotion Heatmap</h2>

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
        {Object.entries(emotionCounts).map(([emotion, count]) => {
          const percentage = totalPoints > 0 ? ((count / totalPoints) * 100).toFixed(1) : 0;
          return (
            <div key={emotion} className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded ${emotionColors[emotion as keyof typeof emotionColors]}`} />
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{emotionLabels[emotion as keyof typeof emotionLabels]}</span>
                  <span className="text-gray-500">{percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${emotionColors[emotion as keyof typeof emotionColors]}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
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
