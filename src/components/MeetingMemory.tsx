import { useState } from 'react';
import { Search, Calendar, Tag, Trash2, Star } from 'lucide-react';
import { type Meeting } from '../lib/supabase';

type Props = {
  meetings: Meeting[];
  onSelectMeeting: (id: string) => void;
  onDeleteMeeting: (id: string) => void;
  onToggleBookmark: (id: string, isBookmarked: boolean) => void;
};

export function MeetingMemory({ meetings, onSelectMeeting, onDeleteMeeting, onToggleBookmark }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);

  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBookmark = !showBookmarkedOnly || meeting.is_bookmarked;
    return matchesSearch && matchesBookmark;
  });

  const completedMeetings = filteredMeetings.filter(m => m.status === 'completed');
  const bookmarkedCount = meetings.filter(m => m.is_bookmarked).length;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Meeting Memory</h2>
        <button
          onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            showBookmarkedOnly
              ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-400'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Star className={`w-4 h-4 ${showBookmarkedOnly ? 'fill-yellow-500 text-yellow-500' : ''}`} />
          Bookmarked ({bookmarkedCount})
        </button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search past meetings..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {completedMeetings.length > 0 ? (
          completedMeetings.map((meeting) => (
            <div
              key={meeting.id}
              className="group border border-gray-200 rounded-lg p-4 hover:bg-gray-50 hover:border-blue-300 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <button
                  onClick={() => onSelectMeeting(meeting.id)}
                  className="flex-1 text-left"
                >
                  <div className="flex items-start gap-2 mb-2">
                    <h3 className="font-semibold text-gray-800 flex-1">{meeting.title}</h3>
                    {meeting.is_bookmarked && (
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(meeting.start_time).toLocaleDateString()}
                    </div>
                    {meeting.end_time && (
                      <div className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {Math.round((new Date(meeting.end_time).getTime() - new Date(meeting.start_time).getTime()) / 60000)} min
                      </div>
                    )}
                  </div>
                </button>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleBookmark(meeting.id, !meeting.is_bookmarked);
                    }}
                    className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                    title={meeting.is_bookmarked ? 'Remove bookmark' : 'Add bookmark'}
                  >
                    <Star className={`w-4 h-4 ${meeting.is_bookmarked ? 'fill-yellow-400' : ''}`} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete "${meeting.title}"? This cannot be undone.`)) {
                        onDeleteMeeting(meeting.id);
                      }
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete meeting"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-8">
            {searchQuery || showBookmarkedOnly ? 'No meetings found' : 'No completed meetings yet'}
          </p>
        )}
      </div>
    </div>
  );
}
