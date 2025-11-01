import { AlertCircle, CheckCircle2 } from 'lucide-react';

type Moment = {
  time: string;
  content: string;
};

type Props = {
  conflicts: Moment[];
  agreements: Moment[];
};

export function ConflictAgreementTracker({ conflicts, agreements }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Conflict & Agreement Detection</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h3 className="font-semibold text-gray-700">Conflicts ({conflicts.length})</h3>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {conflicts.length > 0 ? (
              conflicts.map((conflict, idx) => (
                <div key={idx} className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-xs text-red-600 mb-1">
                    {new Date(conflict.time).toLocaleTimeString()}
                  </p>
                  <p className="text-sm text-red-900">{conflict.content}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center py-8">No conflicts detected</p>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold text-gray-700">Agreements ({agreements.length})</h3>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {agreements.length > 0 ? (
              agreements.map((agreement, idx) => (
                <div key={idx} className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs text-green-600 mb-1">
                    {new Date(agreement.time).toLocaleTimeString()}
                  </p>
                  <p className="text-sm text-green-900">{agreement.content}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center py-8">No agreements detected</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
