import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { supabase, type ActionItem } from '../lib/supabase';

type Props = {
  userId: string;
};

export function SmartReminders({ userId }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [allActionItems, setAllActionItems] = useState<ActionItem[]>([]);
  const [participantMap, setParticipantMap] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    loadAllActionItems();
  }, [userId]);

  const loadAllActionItems = async () => {
    const { data: meetings } = await supabase
      .from('meetings')
      .select('id')
      .eq('owner_id', userId);

    if (!meetings) return;

    const meetingIds = meetings.map(m => m.id);

    const { data: actions } = await supabase
      .from('action_items')
      .select('*')
      .in('meeting_id', meetingIds)
      .not('due_date', 'is', null);

    const { data: participants } = await supabase
      .from('participants')
      .select('id, name')
      .in('meeting_id', meetingIds);

    if (actions) {
      setAllActionItems(actions);
    }

    if (participants) {
      const map = new Map<string, string>();
      participants.forEach(p => map.set(p.id, p.name));
      setParticipantMap(map);
    }
  };

  const scheduledItems = allActionItems.filter(item => !item.completed && item.due_date);

  const getParticipantName = (participantId?: string | null) => {
    if (!participantId) return 'Unassigned';
    return participantMap.get(participantId) || 'Removed Participant';
  };

  const getGMT8Date = (date?: Date): Date => {
    const d = date || new Date();
    const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    return new Date(utc + (8 * 3600000));
  };

  const calendarData = useMemo(() => {
    const gmt8Now = getGMT8Date(currentDate);
    const year = gmt8Now.getFullYear();
    const month = gmt8Now.getMonth();

    const firstDay = new Date(Date.UTC(year, month, 1) + (8 * 3600000));
    const lastDay = new Date(Date.UTC(year, month + 1, 0) + (8 * 3600000));
    const daysInMonth = lastDay.getUTCDate();
    const startingDayOfWeek = firstDay.getUTCDay();

    const days: Array<{ date: number | null; items: ActionItem[] }> = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: null, items: [] });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const checkDate = new Date(Date.UTC(year, month, day) + (8 * 3600000));
      const dateStr = checkDate.toISOString().split('T')[0];

      const dayItems = scheduledItems.filter(item => {
        const itemDate = new Date(item.due_date!);
        const itemGMT8 = getGMT8Date(itemDate);
        const itemDateStr = itemGMT8.toISOString().split('T')[0];
        return itemDateStr === dateStr;
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
    const today = getGMT8Date();
    const gmt8Current = getGMT8Date(currentDate);
    return day === today.getUTCDate() &&
           gmt8Current.getUTCMonth() === today.getUTCMonth() &&
           gmt8Current.getUTCFullYear() === today.getUTCFullYear();
  };

  const isPast = (day: number | null) => {
    if (!day) return false;
    const today = getGMT8Date();
    today.setUTCHours(0, 0, 0, 0);
    const gmt8Current = getGMT8Date(currentDate);
    const checkDate = new Date(Date.UTC(gmt8Current.getUTCFullYear(), gmt8Current.getUTCMonth(), day) + (8 * 3600000));
    checkDate.setUTCHours(0, 0, 0, 0);
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
