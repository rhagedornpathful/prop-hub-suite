import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, CalendarIcon, Save, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface SearchFilters {
  query: string;
  dateFrom?: Date;
  dateTo?: Date;
  participants?: string[];
  labels?: string[];
  hasAttachments?: boolean;
  importance?: string;
}

interface AdvancedSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSearch: (filters: SearchFilters) => void;
}

export const AdvancedSearchDialog = ({ open, onOpenChange, onSearch }: AdvancedSearchDialogProps) => {
  const [filters, setFilters] = useState<SearchFilters>({ query: '' });
  const [savedSearches, setSavedSearches] = useState<Array<{ name: string; filters: SearchFilters }>>([]);

  const handleSearch = () => {
    onSearch(filters);
    onOpenChange(false);
  };

  const saveSearch = () => {
    const name = prompt('Enter name for this search:');
    if (name) {
      setSavedSearches([...savedSearches, { name, filters }]);
    }
  };

  const loadSearch = (savedFilters: SearchFilters) => {
    setFilters(savedFilters);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Advanced Search</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Search Query</Label>
            <Input
              placeholder="Search messages..."
              value={filters.query}
              onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>From Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !filters.dateFrom && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateFrom ? format(filters.dateFrom, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={filters.dateFrom} onSelect={(date) => setFilters({ ...filters, dateFrom: date })} />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>To Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !filters.dateTo && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateTo ? format(filters.dateTo, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={filters.dateTo} onSelect={(date) => setFilters({ ...filters, dateTo: date })} />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <Label>Importance</Label>
            <Select value={filters.importance} onValueChange={(value) => setFilters({ ...filters, importance: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="hasAttachments"
              checked={filters.hasAttachments || false}
              onChange={(e) => setFilters({ ...filters, hasAttachments: e.target.checked })}
              className="rounded"
            />
            <Label htmlFor="hasAttachments">Has Attachments</Label>
          </div>

          {savedSearches.length > 0 && (
            <div>
              <Label>Saved Searches</Label>
              <div className="space-y-2 mt-2">
                {savedSearches.map((saved, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">{saved.name}</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => loadSearch(saved.filters)}>Load</Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSavedSearches(savedSearches.filter((_, i) => i !== idx))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={saveSearch}>
              <Save className="h-4 w-4 mr-2" />
              Save Search
            </Button>
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
