import { Bell, Calendar, X } from 'lucide-react';
import { useState } from 'react';
import { type ActionItem } from '../lib/supabase';

type Props = {
  actionItems: ActionItem[];
  participants: Array<{ id: string; name: string }>;
};

export function SmartReminders({ actionItems, participants }: Props) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const upcomingItems = actionItems
    .filter(item => !item.completed && item.due_date)
    .filter(item => !dismissed.has(item.id))
    .sort((a, b) => {
      if (!a.due_date || !b.due_date) return 0;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });

  const getTimeUntil = (dueDate: string): { text: string; urgent: boolean } => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffMs = due.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMs < 0) {
      return { text: 'Overdue', urgent: true };
    } else if (diffHours < 1) {
      return { text: 'Due within an hour', urgent: true };
    } else if (diffHours < 24) {
      return { text: `Due in ${diffHours} hours`, urgent: true };
    } else if (diffDays === 1) {
      return { text: 'Due tomorrow', urgent: false };
    } else if (diffDays < 7) {
      return { text: `Due in ${diffDays} days`, urgent: false };
    } else {
      return { text: due.toLocaleDateString(), urgent: false };
    }
  };

  const getParticipantName = (participantId?: string) => {
    if (!participantId) return 'Unassigned';
    const participant = participants.find(p => p.id === participantId);
    return participant?.name || 'Unknown';
  };

  const handleDismiss = (itemId: string) => {
    setDismissed(prev => new Set([...prev, itemId]));
  };

  if (upcomingItems.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-5 h-5" />
        <h2 className="text-xl font-semibold">Smart Reminders</h2>
      </div>

      <div className="space-y-3">
        {upcomingItems.slice(0, 3).map((item) => {
          const timeInfo = getTimeUntil(item.due_date!);
          return (
            <div
              key={item.id}
              className={`${
                timeInfo.urgent ? 'bg-red-500/30 border-red-300' : 'bg-white/20 border-white/30'
              } border rounded-lg p-4 backdrop-blur-sm`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="font-medium mb-2">{item.content}</p>
                  <div className="flex items-center gap-4 text-sm opacity-90">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{timeInfo.text}</span>
                    </div>
                    <span>{getParticipantName(item.participant_id)}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDismiss(item.id)}
                  className="hover:bg-white/20 rounded p-1 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {upcomingItems.length > 3 && (
        <p className="text-sm mt-3 opacity-80">
          +{upcomingItems.length - 3} more upcoming tasks
        </p>
      )}
    </div>
  );
}
