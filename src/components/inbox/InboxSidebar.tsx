import React from 'react';
import { 
  Inbox, 
  Star, 
  Send, 
  Archive, 
  Trash2, 
  Tag, 
  Settings, 
  Plus,
  Building,
  Users,
  Wrench,
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useUserRole } from '@/hooks/useUserRole';

interface InboxSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  onCompose: () => void;
  unreadCount: number;
}

export const InboxSidebar: React.FC<InboxSidebarProps> = ({
  collapsed,
  onToggleCollapse,
  selectedFilter,
  onFilterChange,
  onCompose,
  unreadCount
}) => {
  const { isAdmin, isPropertyManager } = useUserRole();
  const isAdminUser = isAdmin();
  const isPropertyManagerUser = isPropertyManager();

  const primaryFilters = [
    { 
      id: 'inbox', 
      label: 'Inbox', 
      icon: Inbox, 
      count: unreadCount,
      color: 'text-blue-600'
    },
    { 
      id: 'starred', 
      label: 'Starred', 
      icon: Star,
      color: 'text-yellow-500'
    },
    { 
      id: 'sent', 
      label: 'Sent', 
      icon: Send,
      color: 'text-green-600'
    },
    { 
      id: 'drafts', 
      label: 'Drafts', 
      icon: Tag,
      color: 'text-gray-600'
    },
    { 
      id: 'archived', 
      label: 'Archived', 
      icon: Archive,
      color: 'text-gray-500'
    }
  ];

  const businessFilters = [
    { 
      id: 'properties', 
      label: 'Property Related', 
      icon: Building,
      color: 'text-indigo-600'
    },
    { 
      id: 'maintenance', 
      label: 'Maintenance', 
      icon: Wrench,
      color: 'text-orange-600'
    },
    { 
      id: 'tenants', 
      label: 'Tenant Messages', 
      icon: Users,
      color: 'text-purple-600'
    },
    { 
      id: 'urgent', 
      label: 'Urgent', 
      icon: AlertTriangle,
      color: 'text-red-600'
    }
  ];

  const FilterButton = ({ filter, showLabel = true }: { filter: any; showLabel?: boolean }) => {
    const Icon = filter.icon;
    const isSelected = selectedFilter === filter.id;
    
    return (
      <Button
        variant={isSelected ? "default" : "ghost"}
        size="sm"
        className={`w-full justify-start h-9 ${collapsed ? 'px-2' : 'px-3'} ${
          isSelected ? '' : 'hover:bg-muted'
        }`}
        onClick={() => onFilterChange(filter.id)}
      >
        <Icon className={`h-4 w-4 ${filter.color} ${collapsed ? '' : 'mr-3'}`} />
        {showLabel && !collapsed && (
          <>
            <span className="flex-1 text-left truncate">{filter.label}</span>
            {filter.count > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 text-xs">
                {filter.count}
              </Badge>
            )}
          </>
        )}
      </Button>
    );
  };

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="h-14 px-3 flex items-center justify-between border-b border-border">
        {!collapsed && (
          <h2 className="font-semibold text-foreground">Messages</h2>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="h-8 w-8 p-0"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Compose Button */}
      <div className="p-3">
        <Button 
          onClick={onCompose} 
          className={`w-full ${collapsed ? 'px-2' : ''}`}
          size={collapsed ? "sm" : "default"}
        >
          <Plus className={`h-4 w-4 ${collapsed ? '' : 'mr-2'}`} />
          {!collapsed && 'Compose'}
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 space-y-1">
        {/* Primary Filters */}
        <div className="space-y-1">
          {primaryFilters.map(filter => (
            <FilterButton key={filter.id} filter={filter} />
          ))}
        </div>

        <Separator className="my-3" />

        {/* Business Categories */}
        <div className="space-y-1">
          {!collapsed && (
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">
              Business
            </h3>
          )}
          {businessFilters.map(filter => (
            <FilterButton key={filter.id} filter={filter} />
          ))}
        </div>

        {/* Admin/Manager Only */}
        {(isAdminUser || isPropertyManagerUser) && (
          <>
            <Separator className="my-3" />
            <div className="space-y-1">
              {!collapsed && (
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">
                  Management
                </h3>
              )}
              <FilterButton 
                filter={{
                  id: 'all-users',
                  label: 'All User Messages',
                  icon: Users,
                  color: 'text-slate-600'
                }}
              />
              <FilterButton 
                filter={{
                  id: 'system',
                  label: 'System Messages',
                  icon: Settings,
                  color: 'text-slate-500'
                }}
              />
            </div>
          </>
        )}
      </div>

      {/* Settings */}
      <div className="p-3 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          className={`w-full justify-start h-9 ${collapsed ? 'px-2' : 'px-3'}`}
        >
          <Settings className={`h-4 w-4 text-gray-600 ${collapsed ? '' : 'mr-3'}`} />
          {!collapsed && 'Settings'}
        </Button>
      </div>
    </div>
  );
};