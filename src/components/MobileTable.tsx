import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronRight, Trash2 } from 'lucide-react';

interface Column {
  key: string;
  label: string;
  width?: string;
  mobile?: boolean; // Show on mobile
  essential?: boolean; // Always show
  render?: (value: any, row: any) => React.ReactNode;
}

interface MobileTableProps {
  data: any[];
  columns: Column[];
  onRowClick?: (row: any) => void;
  loading?: boolean;
  emptyMessage?: string;
  cardTitle?: (row: any) => React.ReactNode;
  cardSubtitle?: (row: any) => React.ReactNode;
  cardActions?: (row: any) => React.ReactNode;
  // Optional selection controls
  selectedIds?: Set<string>;
  getRowId?: (row: any) => string;
  onToggleSelect?: (row: any) => void;
  onToggleSelectAll?: () => void;
  isAllSelected?: boolean;
}

export function MobileTable({
  data,
  columns,
  onRowClick,
  loading,
  emptyMessage = "No data available",
  cardTitle,
  cardSubtitle,
  cardActions,
  selectedIds,
  getRowId,
  onToggleSelect,
  onToggleSelectAll,
  isAllSelected
}: MobileTableProps) {
  // Mobile card layout
  const MobileCard = ({ row, index }: { row: any; index: number }) => (
    <Card 
      key={index} 
      className={`mobile-optimized-card ${onRowClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={() => onRowClick?.(row)}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Card Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {cardTitle ? (
                <h3 className="font-medium truncate">{cardTitle(row)}</h3>
              ) : (
                <h3 className="font-medium truncate">
                  {columns.find(col => col.essential)?.render?.(row[columns.find(col => col.essential)?.key || ''], row) || 
                   row[columns.find(col => col.essential)?.key || '']}
                </h3>
              )}
              
              {cardSubtitle && (
                <p className="text-sm text-muted-foreground mt-1 truncate">
                  {cardSubtitle(row)}
                </p>
              )}
            </div>
            
            {/* Right-side controls */}
            <div className="flex items-center gap-2">
              {typeof onToggleSelect === 'function' && (
                <Checkbox
                  checked={selectedIds?.has(getRowId ? getRowId(row) : row.id)}
                  onClick={(e) => e.stopPropagation()}
                  onCheckedChange={() => onToggleSelect?.(row)}
                  aria-label="Select row"
                />
              )}
              {onRowClick && (
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
              )}
            </div>
          </div>

          {/* Mobile-friendly data display */}
          <div className="grid grid-cols-1 gap-2">
            {columns
              .filter(col => col.mobile !== false && col.key !== (columns.find(c => c.essential)?.key))
              .slice(0, 3) // Limit to 3 additional fields on mobile
              .map((column) => (
                <div key={column.key} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{column.label}:</span>
                  <div className="text-sm font-medium">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </div>
                </div>
              ))}
          </div>

          {/* Card Actions */}
          {cardActions && (
            <div className="flex gap-2 pt-2 border-t">
              {cardActions(row)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Desktop scrollable table
  const DesktopTable = () => (
    <div className="hidden md:block">
      <ScrollArea className="w-full">
        <div className="min-w-full">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                {typeof onToggleSelectAll === 'function' && (
                  <th className="p-3 w-10">
                    <Checkbox
                      checked={!!isAllSelected}
                      onCheckedChange={() => onToggleSelectAll?.()}
                      aria-label="Select all"
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="text-left p-3 font-medium text-muted-foreground"
                    style={{ width: column.width }}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr
                  key={index}
                  className={`border-b border-border hover:bg-muted/50 transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => onRowClick?.(row)}
                >
                  {typeof onToggleSelect === 'function' && (
                    <td className="p-3 w-10" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds?.has(getRowId ? getRowId(row) : row.id)}
                        onCheckedChange={() => onToggleSelect?.(row)}
                        aria-label="Select row"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={column.key} className="p-3">
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Horizontal scroll indicator */}
        <div className="table-scroll-indicator opacity-50 text-xs text-center p-2 text-muted-foreground">
          ← Scroll horizontally to see more →
        </div>
      </ScrollArea>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="block md:hidden space-y-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-5/6"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="hidden md:block">
          <div className="animate-pulse space-y-3">
            <div className="h-8 bg-muted rounded"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="mobile-table-container">
      {/* Mobile Card Layout */}
      <div className="block md:hidden space-y-3">
        {data.map((row, index) => (
          <MobileCard key={index} row={row} index={index} />
        ))}
      </div>

      {/* Desktop Table Layout */}
      <DesktopTable />
    </div>
  );
}

// Specialized table for user management
interface UserTableProps {
  users: any[];
  onUserClick: (user: any) => void;
  onUserDelete?: (user: any) => void;
  loading?: boolean;
  formatRoleName: (role: string) => string;
  getRoleBadgeColor: (role: string) => string;
  formatDate: (date: string) => string;
  // Selection controls
  selectedIds?: Set<string>;
  getRowId?: (row: any) => string;
  onToggleSelect?: (row: any) => void;
  onToggleSelectAll?: () => void;
  isAllSelected?: boolean;
}

export function UserMobileTable({
  users,
  onUserClick,
  onUserDelete,
  loading,
  formatRoleName,
  getRoleBadgeColor,
  formatDate,
  selectedIds,
  getRowId,
  onToggleSelect,
  onToggleSelectAll,
  isAllSelected
}: UserTableProps) {
  const columns: Column[] = [
    {
      key: 'name',
      label: 'User',
      essential: true,
      render: (_, user) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-medium">
              {user.first_name?.[0]}{user.last_name?.[0]}
            </span>
          </div>
          <div>
            <div className="font-medium">
              {user.first_name && user.last_name
                ? `${user.first_name} ${user.last_name}`
                : 'No Name Set'
              }
            </div>
            {user.phone && (
              <div className="text-sm text-muted-foreground">
                {user.phone}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'email',
      label: 'Email',
      width: '25%',
      render: (email) => (
        <span className="truncate block">{email}</span>
      )
    },
    {
      key: 'role',
      label: 'Role',
      width: '15%',
      render: (role) => (
        <Badge className={getRoleBadgeColor(role)}>
          {formatRoleName(role)}
        </Badge>
      )
    },
    {
      key: 'user_created_at',
      label: 'Joined',
      width: '15%',
      mobile: false, // Hide on mobile to save space
      render: (date) => formatDate(date)
    },
    {
      key: 'actions',
      label: '',
      width: '10%',
      mobile: false, // Use cardActions on mobile; hide column
      render: (_value, user) => (
        onUserDelete ? (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              onUserDelete(user);
            }}
            className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            aria-label={`Delete ${user.first_name || ''} ${user.last_name || ''}`.trim()}
            title="Delete user"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ) : null
      )
    }
  ];

  return (
    <MobileTable
      data={users}
      columns={columns}
      onRowClick={onUserClick}
      loading={loading}
      emptyMessage="No users found"
      cardTitle={(user) => 
        user.first_name && user.last_name
          ? `${user.first_name} ${user.last_name}`
          : 'No Name Set'
      }
      cardSubtitle={(user) => user.email}
      cardActions={(user) => (
        <div className="flex items-center gap-2">
          <Badge className={getRoleBadgeColor(user.role)} variant="secondary">
            {formatRoleName(user.role)}
          </Badge>
          {onUserDelete && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onUserDelete(user);
              }}
              className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}
      selectedIds={selectedIds}
      getRowId={getRowId}
      onToggleSelect={onToggleSelect}
      onToggleSelectAll={onToggleSelectAll}
      isAllSelected={isAllSelected}
    />
  );
}