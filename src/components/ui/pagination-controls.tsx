import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  pageSizeOptions?: number[];
}

export function PaginationControls({
  page,
  totalPages,
  pageSize,
  totalItems,
  startIndex,
  endIndex,
  onPageChange,
  onPageSizeChange,
  canGoNext,
  canGoPrevious,
  pageSizeOptions = [10, 20, 50, 100],
}: PaginationControlsProps) {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);
      
      if (page > 3) {
        pages.push('...');
      }
      
      // Show pages around current
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (page < totalPages - 2) {
        pages.push('...');
      }
      
      // Show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">
      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
        <span className="font-medium">{endIndex}</span> of{' '}
        <span className="font-medium">{totalItems}</span> results
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* First page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={!canGoPrevious}
          className="hidden sm:flex"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={!canGoPrevious}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="ml-2 hidden sm:inline">Previous</span>
        </Button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((pageNum, index) => (
            pageNum === '...' ? (
              <span key={`ellipsis-${index}`} className="px-2">...</span>
            ) : (
              <Button
                key={pageNum}
                variant={page === pageNum ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(pageNum as number)}
                className="min-w-[2.5rem]"
              >
                {pageNum}
              </Button>
            )
          ))}
        </div>

        {/* Next page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={!canGoNext}
        >
          <span className="mr-2 hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={!canGoNext}
          className="hidden sm:flex"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Page size selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground hidden sm:inline">
          Rows per page:
        </span>
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => onPageSizeChange(Number(value))}
        >
          <SelectTrigger className="w-[70px] h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
