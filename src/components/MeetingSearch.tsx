import { useState } from 'react';
import { Search, MessageSquare, Calendar, ChevronRight } from 'lucide-react';
import { type Meeting, type Transcript } from '../lib/supabase';

type SearchResult = {
  meeting: Meeting;
  transcript: Transcript;
  relevanceScore: number;
};

type Props = {
  meetings: Meeting[];
  onSelectMeeting: (meetingId: string, transcriptId: string) => void;
  onSearch: (query: string) => Promise<SearchResult[]>;
};

export function MeetingSearch({ meetings, onSelectMeeting, onSearch }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await onSearch(searchQuery.trim());
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;

    const regex = new RegExp(`(${query.split(' ').filter(Boolean).join('|')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (regex.test(part)) {
        return (
          <mark key={index} className="bg-yellow-200 text-gray-900 px-1 rounded">
            {part}
          </mark>
        );
      }
      return part;
    });
  };

  const getContextSnippet = (content: string, query: string, maxLength: number = 150) => {
    const lowerContent = content.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const queryWords = lowerQuery.split(' ').filter(Boolean);

    let bestIndex = -1;
    for (const word of queryWords) {
      const index = lowerContent.indexOf(word);
      if (index !== -1) {
        bestIndex = index;
        break;
      }
    }

    if (bestIndex === -1) {
      return content.substring(0, maxLength) + '...';
    }

    const start = Math.max(0, bestIndex - 50);
    const end = Math.min(content.length, bestIndex + maxLength);
    const snippet = content.substring(start, end);

    return (start > 0 ? '...' : '') + snippet + (end < content.length ? '...' : '');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Search Meetings</h2>
        <p className="text-sm text-gray-600">Ask a question and find where it was discussed</p>
      </div>

      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Ask a question or search for topics..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={!searchQuery.trim() || isSearching}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>

      {searchResults.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-600">
            Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
          </p>
          {searchResults.map((result, index) => (
            <button
              key={`${result.meeting.id}-${result.transcript.id}-${index}`}
              onClick={() => onSelectMeeting(result.meeting.id, result.transcript.id)}
              className="w-full text-left border-2 border-gray-200 rounded-lg p-4 hover:bg-blue-50 hover:border-blue-400 transition-all group"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">{result.meeting.title}</h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(result.meeting.start_time).toLocaleDateString()}
                    </div>
                    {result.meeting.end_time && (
                      <div>
                        {new Date(result.meeting.start_time).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {highlightText(
                    getContextSnippet(result.transcript.content, searchQuery),
                    searchQuery
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(result.transcript.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {searchQuery && !isSearching && searchResults.length === 0 && (
        <div className="text-center py-8">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No results found for "{searchQuery}"</p>
          <p className="text-sm text-gray-400 mt-1">Try different keywords or phrases</p>
        </div>
      )}

      {!searchQuery && (
        <div className="text-center py-8">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Search across all your meeting transcripts</p>
          <p className="text-sm text-gray-400 mt-1">Find discussions, decisions, and action items</p>
        </div>
      )}
    </div>
  );
}
