import { Lightbulb } from 'lucide-react';
import { type KeyPoint } from '../lib/supabase';

type Props = {
  keyPoints: KeyPoint[];
};

export function KeyDecisions({ keyPoints }: Props) {
  const decisionPoints = keyPoints.filter(kp => kp.type === 'decision');

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-yellow-500" />
        <h2 className="text-xl font-semibold text-gray-800">Key Decisions ({decisionPoints.length})</h2>
      </div>

      <div className={`space-y-3 ${decisionPoints.length > 8 ? 'max-h-[500px] overflow-y-auto pr-2' : ''}`}>
        {decisionPoints.length > 0 ? (
          decisionPoints.map((decision) => (
            <div key={decision.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-semibold text-yellow-700">{decision.speaker_name}</span>
                <span className="text-xs text-yellow-600">
                  {new Date(decision.created_at).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm text-gray-800 font-medium">{decision.text}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-8">No key decisions detected yet.</p>
        )}
      </div>
    </div>
  );
}
