import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useMemo } from 'react';
import { type ActionItem } from '../lib/supabase';

type Props = {
  actionItems: ActionItem[];
  participants: Array<{ id: string; name: string }>;
};

export function SmartReminders({ actionItems, participants }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const scheduledItems = actionItems.filter(item => !item.completed && item.due_date);

  const getParticipantName = (participantId?: string) => {
    if (!participantId) return 'Unassigned';
    const participant = participants.find(p => p.id === participantId);
    return participant?.name || 'Unknown';
  };

  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Array<{ date: number | null; items: ActionItem[] }> = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: null, items: [] });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = new Date(year, month, day).toISOString().split('T')[0];
      const dayItems = scheduledItems.filter(item => {
        const itemDate = new Date(item.due_date!).toISOString().split('T')[0];
        return itemDate === dateStr;
      });
      days.push({ date: day, items: dayItems });
    }

    return days;
  }, [currentDate, scheduledItems]);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    return day === today.getDate() &&
           currentDate.getMonth() === today.getMonth() &&
           currentDate.getFullYear() === today.getFullYear();
  };

  const isPast = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return checkDate < today;
  };

  if (scheduledItems.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Action Calendar</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="text-lg font-semibold text-gray-800 min-w-[180px] text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </div>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-sm font-semibold text-gray-600 pb-2">
            {day}
          </div>
        ))}

        {calendarData.map((day, index) => (
          <div
            key={index}
            className={`min-h-[100px] border rounded-lg p-2 ${
              day.date === null
                ? 'bg-gray-50'
                : isPast(day.date)
                ? 'bg-gray-100'
                : isToday(day.date)
                ? 'bg-blue-50 border-blue-300 border-2'
                : 'bg-white hover:bg-gray-50'
            } transition-colors`}
          >
            {day.date && (
              <>
                <div className={`text-sm font-semibold mb-1 ${
                  isToday(day.date) ? 'text-blue-600' : isPast(day.date) ? 'text-gray-400' : 'text-gray-700'
                }`}>
                  {day.date}
                </div>
                <div className="space-y-1">
                  {day.items.map(item => (
                    <div
                      key={item.id}
                      className="bg-blue-500 text-white text-xs p-1.5 rounded truncate"
                      title={`${item.content} - ${getParticipantName(item.participant_id)}`}
                    >
                      <div className="font-medium truncate">{item.content}</div>
                      <div className="text-[10px] opacity-80 truncate">
                        {getParticipantName(item.participant_id)}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-50 border-2 border-blue-300 rounded"></div>
          <span>Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span>Scheduled Action</span>
        </div>
      </div>
    </div>
  );
}
