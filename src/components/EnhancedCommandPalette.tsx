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
  Clock,
  Calculator,
  Palette,
  HelpCircle,
  Moon,
  Sun
} from "lucide-react";
import { useProperties } from '@/hooks/queries/useProperties';
import { useTenants } from '@/hooks/queries/useTenants';
import { useMaintenanceRequests } from '@/hooks/queries/useMaintenanceRequests';
import { useTheme } from 'next-themes';

interface EnhancedCommandPaletteProps {
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
  shortcut?: string;
}

export function EnhancedCommandPalette({ 
  isOpen, 
  onOpenChange, 
  onAddProperty,
  onAddTenant,
  onScheduleMaintenance
}: EnhancedCommandPaletteProps) {
  const navigate = useNavigate();
  const { setTheme, theme } = useTheme();
  const [recentItems, setRecentItems] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');

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
    const updated = [itemId, ...recentItems.filter(id => id !== itemId)].slice(0, 8);
    setRecentItems(updated);
    localStorage.setItem('command-palette-recent', JSON.stringify(updated));
  };

  // Data for search
  const { data: propertiesData } = useProperties();
  const { data: tenants = [] } = useTenants();
  const { data: maintenanceRequests = [] } = useMaintenanceRequests();
  
  const properties = Array.isArray(propertiesData) ? propertiesData : propertiesData?.properties || [];

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
      keywords: ['dashboard', 'home', 'overview'],
      shortcut: 'G D'
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
      keywords: ['properties', 'buildings', 'real estate'],
      shortcut: 'G P'
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
      keywords: ['tenants', 'residents', 'people'],
      shortcut: 'G T'
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
      keywords: ['maintenance', 'repairs', 'work orders'],
      shortcut: 'G M'
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
      keywords: ['finances', 'money', 'payments', 'revenue'],
      shortcut: 'G F'
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
      keywords: ['messages', 'communication', 'chat'],
      shortcut: 'G S'
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
      keywords: ['add', 'property', 'new', 'create'],
      shortcut: 'A P'
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
      keywords: ['add', 'tenant', 'new', 'resident'],
      shortcut: 'A T'
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
      keywords: ['schedule', 'maintenance', 'repair', 'work order'],
      shortcut: 'A M'
    }] : []),

    // Theme Actions
    {
      id: 'theme-toggle',
      title: theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      description: 'Toggle between light and dark themes',
      icon: theme === 'dark' ? Sun : Moon,
      action: () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
        addToRecent('theme-toggle');
        onOpenChange(false);
      },
      section: 'Settings',
      keywords: ['theme', 'dark', 'light', 'mode'],
      shortcut: 'T'
    },

    // Calculator
    {
      id: 'calculator',
      title: 'Calculator',
      description: 'Open calculator for quick calculations',
      icon: Calculator,
      action: () => {
        // Basic calculator simulation
        const calculation = prompt('Enter calculation (e.g., 1500 * 12):');
        if (calculation) {
          try {
            const result = Function(`"use strict"; return (${calculation})`)();
            alert(`Result: ${result}`);
          } catch (e) {
            alert('Invalid calculation');
          }
        }
        addToRecent('calculator');
        onOpenChange(false);
      },
      section: 'Tools',
      keywords: ['calculator', 'math', 'calculate', 'numbers'],
      shortcut: 'C'
    },

    // Help
    {
      id: 'help',
      title: 'Help & Support',
      description: 'Get help and view documentation',
      icon: HelpCircle,
      action: () => {
        alert('Help & Support - Coming soon!');
        addToRecent('help');
        onOpenChange(false);
      },
      section: 'Support',
      keywords: ['help', 'support', 'documentation', 'guide'],
      shortcut: '?'
    }
  ], [navigate, onOpenChange, onAddProperty, onAddTenant, onScheduleMaintenance, theme, setTheme]);

  // Dynamic search results for properties, tenants, maintenance
  const searchResults = useMemo(() => {
    if (!inputValue || inputValue.length < 2) return [];

    const results: CommandItem[] = [];
    const searchLower = inputValue.toLowerCase();

    // Search properties
    properties.forEach((property) => {
      const searchableText = [
        property.address,
        property.city,
        property.state,
        property.property_type
      ].filter(Boolean).join(' ').toLowerCase();

      if (searchableText.includes(searchLower)) {
        results.push({
          id: `search-property-${property.id}`,
          title: property.address || 'Unknown Address',
          description: `${property.city}, ${property.state} • ${property.property_type}`,
          icon: Building,
          action: () => {
            navigate(`/property/${property.id}`);
            onOpenChange(false);
          },
          section: 'Search Results',
          keywords: []
        });
      }
    });

    // Search tenants
    tenants.forEach((tenant) => {
      const searchableText = [
        tenant.first_name,
        tenant.last_name,
        tenant.email
      ].filter(Boolean).join(' ').toLowerCase();

      if (searchableText.includes(searchLower)) {
        results.push({
          id: `search-tenant-${tenant.id}`,
          title: `${tenant.first_name} ${tenant.last_name}`,
          description: tenant.email || 'Tenant',
          icon: Users,
          action: () => {
            navigate(`/tenants?highlight=${tenant.id}`);
            onOpenChange(false);
          },
          section: 'Search Results',
          keywords: []
        });
      }
    });

    // Search maintenance requests
    maintenanceRequests.forEach((request) => {
      const searchableText = [
        request.title,
        request.description,
        request.category
      ].filter(Boolean).join(' ').toLowerCase();

      if (searchableText.includes(searchLower)) {
        results.push({
          id: `search-maintenance-${request.id}`,
          title: request.title || 'Maintenance Request',
          description: `${request.category} • ${request.priority} priority`,
          icon: Wrench,
          action: () => {
            navigate(`/maintenance?highlight=${request.id}`);
            onOpenChange(false);
          },
          section: 'Search Results',
          keywords: []
        });
      }
    });

    return results.slice(0, 5);
  }, [inputValue, properties, tenants, maintenanceRequests, navigate, onOpenChange]);

  const recentCommands = commands.filter(cmd => recentItems.includes(cmd.id));
  const navigationCommands = commands.filter(cmd => cmd.section === 'Navigation');
  const actionCommands = commands.filter(cmd => cmd.section === 'Quick Actions');
  const settingsCommands = commands.filter(cmd => cmd.section === 'Settings');
  const toolCommands = commands.filter(cmd => cmd.section === 'Tools');
  const supportCommands = commands.filter(cmd => cmd.section === 'Support');

  return (
    <CommandDialog open={isOpen} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Type a command, search, or use shortcuts..." 
        value={inputValue}
        onValueChange={setInputValue}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        {searchResults.length > 0 && (
          <CommandGroup heading="Search Results">
            {searchResults.map((command) => (
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
        
        {recentCommands.length > 0 && !inputValue && (
          <CommandGroup heading="Recent">
            {recentCommands.map((command) => (
              <CommandItem key={command.id} onSelect={command.action}>
                <command.icon className="mr-2 h-4 w-4" />
                <div className="flex flex-col flex-1">
                  <span>{command.title}</span>
                  {command.description && (
                    <span className="text-xs text-muted-foreground">{command.description}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  {command.shortcut && (
                    <CommandShortcut>{command.shortcut}</CommandShortcut>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandGroup heading="Navigation">
          {navigationCommands.map((command) => (
            <CommandItem key={command.id} onSelect={command.action}>
              <command.icon className="mr-2 h-4 w-4" />
              <div className="flex flex-col flex-1">
                <span>{command.title}</span>
                {command.description && (
                  <span className="text-xs text-muted-foreground">{command.description}</span>
                )}
              </div>
              {command.shortcut && (
                <CommandShortcut>{command.shortcut}</CommandShortcut>
              )}
            </CommandItem>
          ))}
        </CommandGroup>

        {actionCommands.length > 0 && (
          <CommandGroup heading="Quick Actions">
            {actionCommands.map((command) => (
              <CommandItem key={command.id} onSelect={command.action}>
                <command.icon className="mr-2 h-4 w-4" />
                <div className="flex flex-col flex-1">
                  <span>{command.title}</span>
                  {command.description && (
                    <span className="text-xs text-muted-foreground">{command.description}</span>
                  )}
                </div>
                {command.shortcut && (
                  <CommandShortcut>{command.shortcut}</CommandShortcut>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {!inputValue && (
          <>
            <CommandGroup heading="Settings">
              {settingsCommands.map((command) => (
                <CommandItem key={command.id} onSelect={command.action}>
                  <command.icon className="mr-2 h-4 w-4" />
                  <div className="flex flex-col flex-1">
                    <span>{command.title}</span>
                    {command.description && (
                      <span className="text-xs text-muted-foreground">{command.description}</span>
                    )}
                  </div>
                  {command.shortcut && (
                    <CommandShortcut>{command.shortcut}</CommandShortcut>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandGroup heading="Tools">
              {toolCommands.map((command) => (
                <CommandItem key={command.id} onSelect={command.action}>
                  <command.icon className="mr-2 h-4 w-4" />
                  <div className="flex flex-col flex-1">
                    <span>{command.title}</span>
                    {command.description && (
                      <span className="text-xs text-muted-foreground">{command.description}</span>
                    )}
                  </div>
                  {command.shortcut && (
                    <CommandShortcut>{command.shortcut}</CommandShortcut>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandGroup heading="Support">
              {supportCommands.map((command) => (
                <CommandItem key={command.id} onSelect={command.action}>
                  <command.icon className="mr-2 h-4 w-4" />
                  <div className="flex flex-col flex-1">
                    <span>{command.title}</span>
                    {command.description && (
                      <span className="text-xs text-muted-foreground">{command.description}</span>
                    )}
                  </div>
                  {command.shortcut && (
                    <CommandShortcut>{command.shortcut}</CommandShortcut>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}