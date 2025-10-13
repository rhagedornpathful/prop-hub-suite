import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface AdvancedFiltersProps {
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  associationFilter: string;
  onAssociationChange: (value: string) => void;
  fileSizeFilter: { min?: number; max?: number };
  onFileSizeChange: (value: { min?: number; max?: number }) => void;
  fileTypeFilter: string;
  onFileTypeChange: (value: string) => void;
  categories: Array<{ value: string; label: string }>;
}

export function AdvancedFilters({
  categoryFilter,
  onCategoryChange,
  associationFilter,
  onAssociationChange,
  fileSizeFilter,
  onFileSizeChange,
  fileTypeFilter,
  onFileTypeChange,
  categories,
}: AdvancedFiltersProps) {
  const activeFiltersCount = [
    categoryFilter !== "all",
    associationFilter !== "all",
    fileTypeFilter !== "all",
    fileSizeFilter.min !== undefined || fileSizeFilter.max !== undefined,
  ].filter(Boolean).length;

  const clearFilters = () => {
    onCategoryChange("all");
    onAssociationChange("all");
    onFileTypeChange("all");
    onFileSizeChange({});
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Advanced Filters</h4>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8"
              >
                <X className="w-4 h-4 mr-1" />
                Clear all
              </Button>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <Label>Category</Label>
              <Select value={categoryFilter} onValueChange={onCategoryChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Association</Label>
              <Select value={associationFilter} onValueChange={onAssociationChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Documents</SelectItem>
                  <SelectItem value="with-property">With Property</SelectItem>
                  <SelectItem value="with-owner">With Owner</SelectItem>
                  <SelectItem value="with-tenant">With Tenant</SelectItem>
                  <SelectItem value="unassociated">Unassociated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>File Type</Label>
              <Select value={fileTypeFilter} onValueChange={onFileTypeChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="image">Images</SelectItem>
                  <SelectItem value="pdf">PDFs</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                  <SelectItem value="document">Documents</SelectItem>
                  <SelectItem value="archive">Archives</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>File Size (MB)</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="number"
                  placeholder="Min"
                  value={fileSizeFilter.min || ""}
                  onChange={(e) =>
                    onFileSizeChange({
                      ...fileSizeFilter,
                      min: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={fileSizeFilter.max || ""}
                  onChange={(e) =>
                    onFileSizeChange({
                      ...fileSizeFilter,
                      max: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
