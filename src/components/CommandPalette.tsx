import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import {
  Home,
  Building,
  Users,
  FileText,
  DollarSign,
  Wrench,
  MessageCircle,
  FolderOpen,
  BarChart3,
  Settings,
  Calendar,
  Plus,
  Eye,
  Search,
  Clock
} from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddProperty?: () => void;
  onAddTenant?: () => void;
  onScheduleMaintenance?: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  description?: string;
  icon: React.ComponentType<any>;
  action: () => void;
  section: string;
  keywords?: string[];
}

export function CommandPalette({ 
  isOpen, 
  onOpenChange, 
  onAddProperty,
  onAddTenant,
  onScheduleMaintenance
}: CommandPaletteProps) {
  const navigate = useNavigate();
  const [recentItems, setRecentItems] = useState<string[]>([]);

  // Load recent items from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('command-palette-recent');
    if (stored) {
      try {
        setRecentItems(JSON.parse(stored));
      } catch (e) {
        // Ignore parsing errors
      }
    }
  }, []);

  const addToRecent = (itemId: string) => {
    const updated = [itemId, ...recentItems.filter(id => id !== itemId)].slice(0, 5);
    setRecentItems(updated);
    localStorage.setItem('command-palette-recent', JSON.stringify(updated));
  };

  const commands: CommandItem[] = useMemo(() => [
    // Navigation
    {
      id: 'nav-home',
      title: 'Dashboard',
      description: 'Go to main dashboard',
      icon: Home,
      action: () => {
        navigate('/');
        addToRecent('nav-home');
        onOpenChange(false);
      },
      section: 'Navigation',
      keywords: ['dashboard', 'home', 'overview']
    },
    {
      id: 'nav-properties',
      title: 'Properties',
      description: 'Manage your properties',
      icon: Building,
      action: () => {
        navigate('/properties');
        addToRecent('nav-properties');
        onOpenChange(false);
      },
      section: 'Navigation',
      keywords: ['properties', 'buildings', 'real estate']
    },
    {
      id: 'nav-tenants',
      title: 'Tenants',
      description: 'Manage tenants and residents',
      icon: Users,
      action: () => {
        navigate('/tenants');
        addToRecent('nav-tenants');
        onOpenChange(false);
      },
      section: 'Navigation',
      keywords: ['tenants', 'residents', 'people']
    },
    {
      id: 'nav-house-watching',
      title: 'House Watching',
      description: 'Property monitoring services',
      icon: Eye,
      action: () => {
        navigate('/house-watching');
        addToRecent('nav-house-watching');
        onOpenChange(false);
      },
      section: 'Navigation',
      keywords: ['house watching', 'monitoring', 'security']
    },
    {
      id: 'nav-finances',
      title: 'Finances',
      description: 'Payments and financial reports',
      icon: DollarSign,
      action: () => {
        navigate('/finances');
        addToRecent('nav-finances');
        onOpenChange(false);
      },
      section: 'Navigation',
      keywords: ['finances', 'money', 'payments', 'revenue']
    },
    {
      id: 'nav-maintenance',
      title: 'Maintenance',
      description: 'Work orders and repairs',
      icon: Wrench,
      action: () => {
        navigate('/maintenance');
        addToRecent('nav-maintenance');
        onOpenChange(false);
      },
      section: 'Navigation',
      keywords: ['maintenance', 'repairs', 'work orders']
    },
    {
      id: 'nav-messages',
      title: 'Messages',
      description: 'Communication center',
      icon: MessageCircle,
      action: () => {
        navigate('/messages');
        addToRecent('nav-messages');
        onOpenChange(false);
      },
      section: 'Navigation',
      keywords: ['messages', 'communication', 'chat']
    },
    {
      id: 'nav-documents',
      title: 'Documents',
      description: 'File management',
      icon: FolderOpen,
      action: () => {
        navigate('/documents');
        addToRecent('nav-documents');
        onOpenChange(false);
      },
      section: 'Navigation',
      keywords: ['documents', 'files', 'storage']
    },
    {
      id: 'nav-settings',
      title: 'Settings',  
      description: 'Application settings',
      icon: Settings,
      action: () => {
        navigate('/settings');
        addToRecent('nav-settings');
        onOpenChange(false);
      },
      section: 'Navigation',
      keywords: ['settings', 'configuration', 'preferences']
    },

    // Quick Actions
    ...(onAddProperty ? [{
      id: 'action-add-property',
      title: 'Add Property',
      description: 'Add a new property to your portfolio',
      icon: Plus,
      action: () => {
        onAddProperty();
        addToRecent('action-add-property');
        onOpenChange(false);
      },
      section: 'Quick Actions',
      keywords: ['add', 'property', 'new', 'create']
    }] : []),
    ...(onAddTenant ? [{
      id: 'action-add-tenant',
      title: 'Add Tenant',
      description: 'Add a new tenant',
      icon: Users,
      action: () => {
        onAddTenant();
        addToRecent('action-add-tenant');
        onOpenChange(false);
      },
      section: 'Quick Actions',
      keywords: ['add', 'tenant', 'new', 'resident']
    }] : []),
    ...(onScheduleMaintenance ? [{
      id: 'action-schedule-maintenance',
      title: 'Schedule Maintenance',
      description: 'Schedule a maintenance task',
      icon: Calendar,
      action: () => {
        onScheduleMaintenance();
        addToRecent('action-schedule-maintenance');
        onOpenChange(false);
      },
      section: 'Quick Actions',
      keywords: ['schedule', 'maintenance', 'repair', 'work order']
    }] : [])
  ], [navigate, onOpenChange, onAddProperty, onAddTenant, onScheduleMaintenance]);

  const recentCommands = commands.filter(cmd => recentItems.includes(cmd.id));
  const navigationCommands = commands.filter(cmd => cmd.section === 'Navigation');
  const actionCommands = commands.filter(cmd => cmd.section === 'Quick Actions');

  return (
    <CommandDialog open={isOpen} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        {recentCommands.length > 0 && (
          <CommandGroup heading="Recent">
            {recentCommands.map((command) => (
              <CommandItem key={command.id} onSelect={command.action}>
                <command.icon className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span>{command.title}</span>
                  {command.description && (
                    <span className="text-xs text-muted-foreground">{command.description}</span>
                  )}
                </div>
                <Clock className="ml-auto h-3 w-3 text-muted-foreground" />
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandGroup heading="Navigation">
          {navigationCommands.map((command) => (
            <CommandItem key={command.id} onSelect={command.action}>
              <command.icon className="mr-2 h-4 w-4" />
              <div className="flex flex-col">
                <span>{command.title}</span>
                {command.description && (
                  <span className="text-xs text-muted-foreground">{command.description}</span>
                )}
              </div>
            </CommandItem>
          ))}
        </CommandGroup>

        {actionCommands.length > 0 && (
          <CommandGroup heading="Quick Actions">
            {actionCommands.map((command) => (
              <CommandItem key={command.id} onSelect={command.action}>
                <command.icon className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span>{command.title}</span>
                  {command.description && (
                    <span className="text-xs text-muted-foreground">{command.description}</span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}