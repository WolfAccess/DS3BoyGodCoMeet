import { CheckSquare, Square, Calendar, User } from 'lucide-react';
import { supabase, type ActionItem } from '../lib/supabase';
import { useState } from 'react';

type Props = {
  actionItems: ActionItem[];
  participants: Array<{ id: string; name: string }>;
  onUpdate: () => void;
};

export function ActionItemsList({ actionItems, participants, onUpdate }: Props) {
  const [updating, setUpdating] = useState<string | null>(null);

  const toggleComplete = async (item: ActionItem) => {
    setUpdating(item.id);
    try {
      const { error } = await supabase
        .from('action_items')
        .update({ completed: !item.completed })
        .eq('id', item.id);

      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error updating action item:', error);
    } finally {
      setUpdating(null);
    }
  };

  const getParticipantName = (participantId?: string | null) => {
    if (!participantId) return 'Unassigned';
    const participant = participants.find(p => p.id === participantId);
    return participant?.name || 'Removed Participant';
  };

  const sortedItems = [...actionItems].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.due_date && b.due_date) {
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    }
    return 0;
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Action Items ({actionItems.length})</h2>

      <div className={`space-y-3 ${sortedItems.length > 10 ? 'max-h-[500px] overflow-y-auto pr-2' : ''}`}>
        {sortedItems.length > 0 ? (
          sortedItems.map((item) => (
            <div
              key={item.id}
              className={`border rounded-lg p-4 transition-all ${
                item.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300 hover:border-blue-400'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleComplete(item)}
                  disabled={updating === item.id}
                  className="mt-1 focus:outline-none hover:scale-110 transition-transform disabled:opacity-50"
                >
                  {item.completed ? (
                    <CheckSquare className="w-5 h-5 text-green-500" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                <div className="flex-1">
                  <p
                    className={`text-sm ${
                      item.completed ? 'text-gray-500 line-through' : 'text-gray-800'
                    }`}
                  >
                    {item.content}
                  </p>

                  <div className="flex items-center gap-4 mt-2">
                    {item.participant_id && (
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <User className="w-3 h-3" />
                        <span>{getParticipantName(item.participant_id)}</span>
                      </div>
                    )}

                    {item.due_date && (
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(item.due_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-8">No action items yet. They'll be auto-extracted from the conversation.</p>
        )}
      </div>
    </div>
  );
}
