import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Calendar,
  User,
  MessageSquare,
  Clock
} from 'lucide-react';
import { useMessageSearch } from '@/hooks/queries/useEnterpriseMessaging';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchFilters {
  query: string;
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
  messageType: 'all' | 'text' | 'image' | 'file';
  sender: string;
  conversationId?: string;
}

interface AdvancedMessageSearchProps {
  onResultSelect: (result: any) => void;
  conversationId?: string;
  className?: string;
}

export const AdvancedMessageSearch: React.FC<AdvancedMessageSearchProps> = ({
  onResultSelect,
  conversationId,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    dateRange: 'all',
    messageType: 'all',
    sender: '',
    conversationId
  });
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const searchRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(filters.query, 300);
  const messageSearch = useMessageSearch();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => searchRef.current?.focus(), 100);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      performSearch();
    } else {
      setResults([]);
    }
  }, [debouncedQuery, filters.conversationId]);

  const performSearch = async () => {
    if (!debouncedQuery.trim()) return;

    setIsSearching(true);
    try {
      const searchResults = await messageSearch.mutateAsync({
        query: debouncedQuery,
        conversationId: filters.conversationId,
        limit: 20
      });
      setResults(searchResults);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (result: any) => {
    onResultSelect(result);
    setIsOpen(false);
    setFilters(prev => ({ ...prev, query: '' }));
    setResults([]);
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div className={className}>
      {/* Search Trigger */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          ref={searchRef}
          placeholder="Search messages... (Ctrl+K)"
          value={filters.query}
          onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-4"
        />
        
        {filters.query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => {
              setFilters(prev => ({ ...prev, query: '' }));
              setResults([]);
            }}
          >
            ×
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (filters.query.length >= 2 || results.length > 0) && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-hidden">
          <CardContent className="p-0">
            {/* Advanced Filters */}
            <div className="p-3 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Search Options</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-3 w-3" />
                </Button>
              </div>
              
              {showFilters && (
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={filters.dateRange}
                    onValueChange={(value) => setFilters(prev => ({ 
                      ...prev, 
                      dateRange: value as any 
                    }))}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This week</SelectItem>
                      <SelectItem value="month">This month</SelectItem>
                      <SelectItem value="year">This year</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.messageType}
                    onValueChange={(value) => setFilters(prev => ({ 
                      ...prev, 
                      messageType: value as any 
                    }))}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Message type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="text">Text only</SelectItem>
                      <SelectItem value="image">Images</SelectItem>
                      <SelectItem value="file">Files</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Search Results */}
            <div className="max-h-80 overflow-y-auto">
              {isSearching ? (
                <div className="p-4 text-center text-muted-foreground">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Searching...
                </div>
              ) : results.length > 0 ? (
                <div className="divide-y divide-border">
                  {results.map((result, index) => (
                    <button
                      key={`${result.message_id}-${index}`}
                      className="w-full text-left p-3 hover:bg-accent transition-colors"
                      onClick={() => handleResultClick(result)}
                    >
                      <div className="flex items-start gap-3">
                        <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm line-clamp-2 mb-1">
                            {highlightMatch(result.content, filters.query)}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(result.created_at)}</span>
                            <Badge variant="secondary" className="text-xs h-4">
                              Score: {(result.rank * 100).toFixed(0)}%
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : filters.query.length >= 2 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No messages found matching "{filters.query}"
                </div>
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  Type at least 2 characters to search
                </div>
              )}
            </div>

            {/* Search Tips */}
            {results.length === 0 && !isSearching && (
              <div className="p-3 border-t border-border bg-muted/30">
                <div className="text-xs text-muted-foreground">
                  <div className="font-medium mb-1">Search Tips:</div>
                  <div>• Use quotes for exact phrases: "exact phrase"</div>
                  <div>• Use @ to find mentions: @username</div>
                  <div>• Press Ctrl+K to open search anywhere</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};