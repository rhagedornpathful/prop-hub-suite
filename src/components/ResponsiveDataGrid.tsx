import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  ChevronRight, 
  MoreHorizontal, 
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface GridColumn {
  key: string;
  label: string;
  shortLabel?: string; // Abbreviated label for mobile
  width?: string;
  sortable?: boolean;
  searchable?: boolean;
  mobileHidden?: boolean; // Hide completely on mobile
  mobileSecondary?: boolean; // Show in secondary position on mobile
  render?: (value: any, row: any, isMobile: boolean) => React.ReactNode;
}

interface GridAction {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: any) => void;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  mobileHidden?: boolean;
}

interface ResponsiveDataGridProps {
  data: any[];
  columns: GridColumn[];
  actions?: GridAction[];
  searchable?: boolean;
  filterable?: boolean;
  loading?: boolean;
  title?: string;
  subtitle?: string;
  emptyMessage?: string;
  itemsPerPage?: number;
  onRowClick?: (row: any) => void;
  primaryKey?: string;
}

export function ResponsiveDataGrid({
  data,
  columns,
  actions = [],
  searchable = true,
  filterable = false,
  loading = false,
  title,
  subtitle,
  emptyMessage = "No data available",
  itemsPerPage = 10,
  onRowClick,
  primaryKey = 'id'
}: ResponsiveDataGridProps) {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and search data
  const filteredData = data.filter(row => {
    if (!searchTerm) return true;
    
    const searchableColumns = columns.filter(col => col.searchable !== false);
    return searchableColumns.some(col => {
      const value = row[col.key];
      return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  // Sort data
  const sortedData = sortColumn ? [...filteredData].sort((a, b) => {
    const aVal = a[sortColumn];
    const bVal = b[sortColumn];
    
    if (aVal === bVal) return 0;
    
    const comparison = aVal > bVal ? 1 : -1;
    return sortDirection === 'asc' ? comparison : -comparison;
  }) : filteredData;

  // Paginate data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const MobileCard = ({ row, index }: { row: any; index: number }) => {
    const primaryColumn = columns.find(col => !col.mobileHidden && !col.mobileSecondary);
    const secondaryColumns = columns.filter(col => col.mobileSecondary && !col.mobileHidden);
    const visibleActions = actions.filter(action => !action.mobileHidden);

    return (
      <Card 
        key={row[primaryKey] || index}
        className={`mobile-card ${onRowClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''}`}
        onClick={() => onRowClick?.(row)}
      >
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Primary content */}
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0 space-y-1">
                {primaryColumn && (
                  <h3 className="font-medium text-base leading-tight">
                    {primaryColumn.render 
                      ? primaryColumn.render(row[primaryColumn.key], row, true)
                      : row[primaryColumn.key]
                    }
                  </h3>
                )}
                
                {/* Show first secondary column as subtitle */}
                {secondaryColumns[0] && (
                  <p className="text-sm text-muted-foreground truncate">
                    {secondaryColumns[0].render 
                      ? secondaryColumns[0].render(row[secondaryColumns[0].key], row, true)
                      : row[secondaryColumns[0].key]
                    }
                  </p>
                )}
              </div>
              
              {(onRowClick || visibleActions.length > 0) && (
                <div className="flex items-center gap-1 ml-2">
                  {visibleActions.slice(0, 2).map((action, actionIndex) => (
                    <Button
                      key={actionIndex}
                      variant={action.variant || 'ghost'}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        action.onClick(row);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      {action.icon}
                    </Button>
                  ))}
                  {onRowClick && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                </div>
              )}
            </div>

            {/* Additional data in compact format */}
            {secondaryColumns.slice(1, 3).length > 0 && (
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                {secondaryColumns.slice(1, 3).map((column) => (
                  <div key={column.key} className="flex flex-col">
                    <span className="text-muted-foreground text-xs">
                      {column.shortLabel || column.label}
                    </span>
                    <span className="font-medium truncate">
                      {column.render 
                        ? column.render(row[column.key], row, true)
                        : row[column.key]
                      }
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Show remaining actions if any */}
            {visibleActions.length > 2 && (
              <div className="flex gap-2 pt-2 border-t">
                {visibleActions.slice(2).map((action, actionIndex) => (
                  <Button
                    key={actionIndex}
                    variant={action.variant || 'outline'}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      action.onClick(row);
                    }}
                    className="flex-1"
                  >
                    {action.icon && <span className="mr-1">{action.icon}</span>}
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const DesktopTable = () => (
    <div className="rounded-lg border overflow-hidden">
      <ScrollArea className="w-full">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              {columns.filter(col => !col.mobileHidden).map((column) => (
                <th
                  key={column.key}
                  className={`text-left p-3 font-medium text-sm ${
                    column.sortable !== false ? 'cursor-pointer hover:bg-muted/70' : ''
                  }`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {sortColumn === column.key && (
                      <span className="text-xs">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {actions.length > 0 && (
                <th className="text-right p-3 font-medium text-sm w-24">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => (
              <tr
                key={row[primaryKey] || index}
                className={`border-b hover:bg-muted/30 transition-colors ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.filter(col => !col.mobileHidden).map((column) => (
                  <td key={column.key} className="p-3 text-sm">
                    {column.render 
                      ? column.render(row[column.key], row, false)
                      : row[column.key]
                    }
                  </td>
                ))}
                {actions.length > 0 && (
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {actions.slice(0, 2).map((action, actionIndex) => (
                        <Button
                          key={actionIndex}
                          variant={action.variant || 'ghost'}
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            action.onClick(row);
                          }}
                          className="h-8 w-8 p-0"
                          title={action.label}
                        >
                          {action.icon}
                        </Button>
                      ))}
                      {actions.length > 2 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollArea>
      
      {/* Scroll indicator */}
      <div className="desktop-scroll-hint text-xs text-center p-2 text-muted-foreground border-t">
        Scroll horizontally to see more columns
      </div>
    </div>
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isMobile ? (
              // Mobile loading skeleton
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="animate-pulse space-y-3">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="h-3 bg-muted rounded"></div>
                          <div className="h-3 bg-muted rounded"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              // Desktop loading skeleton
              <div className="space-y-3">
                <div className="h-8 bg-muted rounded"></div>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-muted rounded"></div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {(title || subtitle || searchable) && (
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              {title && <CardTitle>{title}</CardTitle>}
              {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            
            {searchable && (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            )}
          </div>
        </CardHeader>
      )}
      
      <CardContent>
        {sortedData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">{emptyMessage}</p>
          </div>
        ) : (
          <>
            {/* Mobile view */}
            <div className="block md:hidden space-y-3">
              {paginatedData.map((row, index) => (
                <MobileCard key={row[primaryKey] || index} row={row} index={index} />
              ))}
            </div>

            {/* Desktop view */}
            <div className="hidden md:block">
              <DesktopTable />
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedData.length)} of {sortedData.length}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}