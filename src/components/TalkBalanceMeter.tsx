import { useMemo } from 'react';
import { Users } from 'lucide-react';

type Participant = {
  id: string;
  name: string;
  speak_time_seconds: number;
};

type Props = {
  participants: Participant[];
};

const colors = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-orange-500',
  'bg-teal-500',
  'bg-indigo-500'
];

export function TalkBalanceMeter({ participants }: Props) {
  const analysis = useMemo(() => {
    const total = participants.reduce((sum, p) => sum + p.speak_time_seconds, 0);

    return participants.map((p, idx) => ({
      ...p,
      percentage: total > 0 ? (p.speak_time_seconds / total) * 100 : 0,
      color: colors[idx % colors.length],
      minutes: Math.floor(p.speak_time_seconds / 60),
      seconds: p.speak_time_seconds % 60
    }));
  }, [participants]);

  const feedback = useMemo(() => {
    const suggestions: string[] = [];

    analysis.forEach(p => {
      if (p.percentage < 5 && p.percentage > 0) {
        suggestions.push(`Try to invite ${p.name}'s input — they spoke only ${p.percentage.toFixed(1)}% of the time.`);
      } else if (p.percentage > 50) {
        suggestions.push(`${p.name} dominated the conversation at ${p.percentage.toFixed(1)}% — consider balancing participation.`);
      }
    });

    return suggestions;
  }, [analysis]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-gray-600" />
        <h2 className="text-xl font-semibold text-gray-800">Talk Balance Meter</h2>
      </div>

      <div className="mb-6">
        <div className="flex h-8 rounded-lg overflow-hidden bg-gray-200">
          {analysis.map((p) => (
            <div
              key={p.id}
              className={`${p.color} transition-all hover:opacity-80`}
              style={{ width: `${p.percentage}%` }}
              title={`${p.name}: ${p.percentage.toFixed(1)}%`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {analysis.map((p) => (
          <div key={p.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className={`w-3 h-3 rounded-full ${p.color}`} />
              <span className="font-medium text-gray-700">{p.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {p.minutes}m {p.seconds}s
              </span>
              <span className="text-sm font-semibold text-gray-700 w-12 text-right">
                {p.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {feedback.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Balance Feedback</h3>
          <ul className="space-y-1">
            {feedback.map((item, idx) => (
              <li key={idx} className="text-sm text-blue-800">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {participants.length === 0 && (
        <p className="text-gray-500 text-center py-8">No participants yet. Add speakers to track talk balance.</p>
      )}
    </div>
  );
}
