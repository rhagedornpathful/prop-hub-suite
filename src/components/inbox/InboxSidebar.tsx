import React, { useState } from 'react';
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
  ChevronRight,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FolderManager } from './FolderManager';
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
  const [selectedCustomFolder, setSelectedCustomFolder] = useState<string | null>(null);
  const isAdminUser = isAdmin();
  const isPropertyManagerUser = isPropertyManager();

  const primaryFilters = [
    { 
      id: 'inbox', 
      label: 'Inbox', 
      icon: Inbox, 
      count: unreadCount,
      color: 'text-primary'
    },
    { 
      id: 'starred', 
      label: 'Starred', 
      icon: Star,
      color: 'text-warning'
    },
    { 
      id: 'sent', 
      label: 'Sent', 
      icon: Send,
      color: 'text-success'
    },
    { 
      id: 'drafts', 
      label: 'Drafts', 
      icon: Tag,
      color: 'text-muted-foreground',
      badge: 'Draft'
    },
    { 
      id: 'archived', 
      label: 'Archived', 
      icon: Archive,
      color: 'text-muted-foreground'
    }
  ];

  const businessFilters = [
    { 
      id: 'maintenance', 
      label: 'Maintenance', 
      icon: Wrench,
      color: 'text-orange-500'
    },
    { 
      id: 'tenants', 
      label: 'Tenants', 
      icon: Users,
      color: 'text-purple-500'
    },
    { 
      id: 'properties', 
      label: 'Properties', 
      icon: Building,
      color: 'text-info'
    }
  ];

  const FilterButton = ({ filter, showLabel = true }: { filter: any; showLabel?: boolean }) => {
    const Icon = filter.icon;
    const isSelected = selectedFilter === filter.id;
    
    return (
      <Button
        variant={isSelected ? "default" : "ghost"}
        size="sm"
        className={`w-full justify-start h-8 ${collapsed ? 'px-2' : 'px-3'} ${
          isSelected ? 'bg-primary/90 text-primary-foreground' : 'hover:bg-muted/50'
        }`}
        onClick={() => {
          onFilterChange(filter.id);
          setSelectedCustomFolder(null);
        }}
      >
        <Icon className={`h-4 w-4 ${isSelected ? 'text-primary-foreground' : filter.color} ${collapsed ? '' : 'mr-3'}`} />
        {showLabel && !collapsed && (
          <>
            <span className="flex-1 text-left truncate text-sm">{filter.label}</span>
            {filter.count > 0 && (
              <Badge variant="secondary" className="ml-2 h-4 text-xs">
                {filter.count}
              </Badge>
            )}
          </>
        )}
      </Button>
    );
  };

  return (
    <div className="h-full flex flex-col bg-card/50 backdrop-blur-sm">
      {/* Header */}
      <div className="h-14 px-3 flex items-center justify-between border-b border-border/50">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Messages</h2>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="h-8 w-8 p-0 hover:bg-muted/50"
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
          className={`w-full bg-primary hover:bg-primary/90 ${collapsed ? 'px-2' : ''}`}
          size={collapsed ? "sm" : "default"}
        >
          <Plus className={`h-4 w-4 ${collapsed ? '' : 'mr-2'}`} />
          {!collapsed && 'Compose'}
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 space-y-4">
        {/* Primary Filters */}
        <div className="space-y-1">
          {!collapsed && (
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-2 py-1">
              Main
            </h3>
          )}
          {primaryFilters.map(filter => (
            <FilterButton key={filter.id} filter={filter} />
          ))}
        </div>

        <Separator className="my-3 bg-border/50" />

        {/* Business Categories */}
        <div className="space-y-1">
          {!collapsed && (
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-2 py-1">
              Categories
            </h3>
          )}
          {businessFilters.map(filter => (
            <FilterButton key={filter.id} filter={filter} />
          ))}
        </div>

        <Separator className="my-3 bg-border/50" />

        {/* Custom Folders */}
        <FolderManager
          collapsed={collapsed}
          selectedFolder={selectedCustomFolder}
          onFolderSelect={(folderId) => {
            setSelectedCustomFolder(folderId);
            onFilterChange(`folder:${folderId}`);
          }}
        />
      </div>

      {/* Settings */}
      <div className="p-3 border-t border-border/50">
        <Button
          variant="ghost"
          size="sm"
          className={`w-full justify-start h-8 ${collapsed ? 'px-2' : 'px-3'} hover:bg-muted/50`}
        >
          <Settings className={`h-4 w-4 text-muted-foreground ${collapsed ? '' : 'mr-3'}`} />
          {!collapsed && <span className="text-sm">Settings</span>}
        </Button>
      </div>
    </div>
  );
};