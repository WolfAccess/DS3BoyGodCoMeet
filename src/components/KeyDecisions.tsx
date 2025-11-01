import { Lightbulb } from 'lucide-react';

type Decision = {
  time: string;
  decision: string;
};

type Props = {
  decisions: Decision[];
};

export function KeyDecisions({ decisions }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-yellow-500" />
        <h2 className="text-xl font-semibold text-gray-800">Key Decisions</h2>
      </div>

      <div className="space-y-3">
        {decisions.length > 0 ? (
          decisions.map((decision, idx) => (
            <div key={idx} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-xs text-yellow-600 mb-2">
                {new Date(decision.time).toLocaleTimeString()}
              </p>
              <p className="text-sm text-gray-800 font-medium">{decision.decision}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-8">No key decisions detected yet.</p>
        )}
      </div>
    </div>
  );
}
