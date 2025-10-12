import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ArrowUpDown } from "lucide-react";
import type { SortField, SortOrder } from "@/utils/propertyOwnerHelpers";

interface OwnerFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  showArchived: boolean;
  onShowArchivedChange: (value: boolean) => void;
  sortField: SortField;
  onSortFieldChange: (value: SortField) => void;
  sortOrder: SortOrder;
  onSortOrderChange: (value: SortOrder) => void;
}

export const OwnerFilters = ({
  searchTerm,
  onSearchChange,
  showArchived,
  onShowArchivedChange,
  sortField,
  onSortFieldChange,
  sortOrder,
  onSortOrderChange
}: OwnerFiltersProps) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, company, or email..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Label htmlFor="show-archived" className="text-sm whitespace-nowrap">
              Show archived
            </Label>
            <Switch 
              id="show-archived" 
              checked={showArchived} 
              onCheckedChange={onShowArchivedChange} 
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Select value={sortField} onValueChange={(value) => onSortFieldChange(value as SortField)}>
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4" />
                <SelectValue placeholder="Sort by..." />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="property_count">Property Count</SelectItem>
              <SelectItem value="created_at">Date Added</SelectItem>
              <SelectItem value="email">Email</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-32">
          <Select value={sortOrder} onValueChange={(value) => onSortOrderChange(value as SortOrder)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
