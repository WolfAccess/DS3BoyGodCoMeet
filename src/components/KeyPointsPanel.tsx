import { useMemo } from 'react';
import { getKeyPointColor, getKeyPointIcon, type KeyPointType } from '../lib/analysisEngine';
import { type KeyPoint } from '../lib/supabase';
import { Lightbulb } from 'lucide-react';

type Props = {
  keyPoints: KeyPoint[];
};

export function KeyPointsPanel({ keyPoints }: Props) {

  const groupedKeyPoints = useMemo(() => {
    const grouped: Record<KeyPointType, KeyPoint[]> = {
      decision: [],
      question: [],
      important: [],
      agreement: []
    };

    keyPoints.forEach(kp => {
      if (kp.type in grouped) {
        grouped[kp.type].push(kp);
      }
    });

    return grouped;
  }, [keyPoints]);

  const keyPointCounts = useMemo(() => {
    return Object.entries(groupedKeyPoints).map(([type, points]) => ({
      type: type as KeyPointType,
      count: points.length
    }));
  }, [groupedKeyPoints]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <Lightbulb className="w-6 h-6 text-yellow-500" />
        <h2 className="text-2xl font-bold text-gray-800">Key Points Detected</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {keyPointCounts.map(({ type, count }) => (
          <div
            key={type}
            className={`p-3 rounded-lg border-2 ${getKeyPointColor(type)}`}
          >
            <div className="text-2xl font-bold mb-1">{count}</div>
            <div className="text-sm font-semibold flex items-center gap-1">
              <span>{getKeyPointIcon(type)}</span>
              <span>{type}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {Object.entries(groupedKeyPoints).map(([type, points]) => {
          if (points.length === 0) return null;

          return (
            <div key={type} className="border-l-4 pl-4" style={{ borderColor: getKeyPointColor(type as KeyPointType).split(' ')[2].replace('border-', '#') }}>
              <h3 className={`font-semibold text-lg mb-2 flex items-center gap-2 ${getKeyPointColor(type as KeyPointType).split(' ')[1]}`}>
                <span>{getKeyPointIcon(type as KeyPointType)}</span>
                <span>{type.toUpperCase()} ({points.length})</span>
              </h3>
              <div className="space-y-2">
                {points.map((kp, idx) => (
                  <div
                    key={kp.id}
                    className={`p-3 rounded-lg ${getKeyPointColor(type as KeyPointType)}`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-semibold text-sm">{kp.speaker_name}</span>
                      <span className="text-xs opacity-75">
                        {new Date(kp.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{kp.snippet}</p>
                    <p className="text-xs mt-1 opacity-75 italic">{kp.text}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {keyPoints.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg">No key points detected yet</p>
          <p className="text-sm mt-2">Key points will appear here as you speak</p>
        </div>
      )}
    </div>
  );
}
