import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { 
  Plus, 
  Zap, 
  Clock, 
  TrendingUp, 
  Users, 
  Building, 
  Wrench, 
  FileText, 
  MessageSquare, 
  Calendar,
  DollarSign,
  Eye,
  Search,
  Filter,
  Settings,
  Download,
  Upload,
  Mail,
  Phone,
  AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  onClick?: () => void;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive';
  badge?: string;
  shortcut?: string;
  category: 'create' | 'manage' | 'view' | 'communicate' | 'analyze';
}

const quickActions: QuickAction[] = [
  // Create Actions
  { id: 'add-property', label: 'Add Property', icon: Building, href: '/properties/add', category: 'create', shortcut: 'Ctrl+P' },
  { id: 'add-tenant', label: 'Add Tenant', icon: Users, href: '/tenants/add', category: 'create', shortcut: 'Ctrl+T' },
  { id: 'schedule-maintenance', label: 'Schedule Maintenance', icon: Wrench, href: '/maintenance/schedule', category: 'create', shortcut: 'Ctrl+M' },
  { id: 'new-message', label: 'Send Message', icon: MessageSquare, href: '/messages/compose', category: 'communicate', shortcut: 'Ctrl+N' },
  
  // Manage Actions
  { id: 'urgent-requests', label: 'Urgent Requests', icon: AlertTriangle, href: '/maintenance?priority=urgent', category: 'manage', badge: '3', variant: 'destructive' },
  { id: 'expiring-leases', label: 'Expiring Leases', icon: Calendar, href: '/tenants?filter=expiring', category: 'manage', badge: '5' },
  { id: 'overdue-payments', label: 'Overdue Payments', icon: DollarSign, href: '/payments?status=overdue', category: 'manage', badge: '2' },
  
  // View Actions
  { id: 'all-properties', label: 'All Properties', icon: Building, href: '/properties', category: 'view' },
  { id: 'maintenance-board', label: 'Maintenance Board', icon: Wrench, href: '/maintenance', category: 'view' },
  { id: 'financial-reports', label: 'Financial Reports', icon: TrendingUp, href: '/reports/financial', category: 'view' },
  { id: 'house-watching', label: 'House Watching', icon: Eye, href: '/house-watching', category: 'view' },
  
  // Communicate Actions
  { id: 'bulk-email', label: 'Bulk Email', icon: Mail, href: '/messages?action=bulk', category: 'communicate' },
  { id: 'sms-blast', label: 'SMS Blast', icon: Phone, href: '/messages?action=sms', category: 'communicate' },
  
  // Analyze Actions
  { id: 'generate-report', label: 'Generate Report', icon: FileText, href: '/reports', category: 'analyze' },
  { id: 'export-data', label: 'Export Data', icon: Download, href: '/reports?action=export', category: 'analyze' },
  { id: 'import-data', label: 'Import Data', icon: Upload, href: '/settings?tab=import', category: 'analyze' }
];

const actionCategories = [
  { id: 'create', label: 'Create', icon: Plus, color: 'text-green-600' },
  { id: 'manage', label: 'Manage', icon: Settings, color: 'text-blue-600' },
  { id: 'view', label: 'View', icon: Eye, color: 'text-purple-600' },
  { id: 'communicate', label: 'Communicate', icon: MessageSquare, color: 'text-orange-600' },
  { id: 'analyze', label: 'Analyze', icon: TrendingUp, color: 'text-indigo-600' }
];

interface QuickActionsProps {
  variant?: 'card' | 'floating' | 'dropdown';
  maxVisible?: number;
  showCategories?: boolean;
  className?: string;
}

export function QuickActions({ variant = 'card', maxVisible = 8, showCategories = true, className }: QuickActionsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { toast } = useToast();

  const filteredActions = selectedCategory 
    ? quickActions.filter(action => action.category === selectedCategory)
    : quickActions;

  const visibleActions = filteredActions.slice(0, maxVisible);
  const hiddenActions = filteredActions.slice(maxVisible);

  const handleActionClick = (action: QuickAction) => {
    if (action.onClick) {
      action.onClick();
      toast({
        title: "Action Executed",
        description: `${action.label} action has been triggered.`,
      });
    }
  };

  const renderAction = (action: QuickAction, size: 'sm' | 'default' = 'default') => {
    const IconComponent = action.icon;
    const buttonContent = (
      <div className="flex items-center gap-2">
        <IconComponent className={size === 'sm' ? "h-3 w-3" : "h-4 w-4"} />
        <span className={size === 'sm' ? "text-xs" : "text-sm"}>{action.label}</span>
        {action.badge && (
          <Badge variant={action.variant === 'destructive' ? 'destructive' : 'secondary'} className="text-xs">
            {action.badge}
          </Badge>
        )}
      </div>
    );

    const button = (
      <Button
        variant={action.variant || 'outline'}
        size={size}
        className="justify-start"
        onClick={action.onClick ? () => handleActionClick(action) : undefined}
      >
        {buttonContent}
      </Button>
    );

    if (action.href) {
      return (
        <Link key={action.id} to={action.href}>
          {button}
        </Link>
      );
    }

    return <div key={action.id}>{button}</div>;
  };

  if (variant === 'floating') {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <Popover>
          <PopoverTrigger asChild>
            <Button size="lg" className="rounded-full shadow-lg">
              <Zap className="h-5 w-5 mr-2" />
              Quick Actions
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Quick Actions</h4>
                <Badge variant="secondary">{filteredActions.length} actions</Badge>
              </div>
              
              {showCategories && (
                <div className="flex flex-wrap gap-1">
                  <Button
                    variant={selectedCategory === null ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(null)}
                  >
                    All
                  </Button>
                  {actionCategories.map(category => {
                    const IconComponent = category.icon;
                    return (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <IconComponent className="h-3 w-3 mr-1" />
                        {category.label}
                      </Button>
                    );
                  })}
                </div>
              )}
              
              <div className="space-y-1">
                {visibleActions.map(action => renderAction(action, 'sm'))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  if (variant === 'dropdown') {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={className}>
            <Zap className="h-4 w-4 mr-2" />
            Actions
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="space-y-2">
            {visibleActions.map(action => renderAction(action, 'sm'))}
            {hiddenActions.length > 0 && (
              <>
                <Separator />
                <Button variant="ghost" size="sm" className="w-full justify-center">
                  +{hiddenActions.length} more actions
                </Button>
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Card variant (default)
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <Badge variant="secondary">{filteredActions.length} actions</Badge>
        </div>
        
        {showCategories && (
          <div className="flex flex-wrap gap-1 pt-2">
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {actionCategories.map(category => {
              const IconComponent = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <IconComponent className="h-3 w-3 mr-1" />
                  {category.label}
                </Button>
              );
            })}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {visibleActions.map(action => {
            const result = renderAction(action);
            
            if (action.shortcut) {
              return (
                <TooltipProvider key={action.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {result}
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Shortcut: {action.shortcut}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            }
            
            return result;
          })}
        </div>
        
        {hiddenActions.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <Button variant="ghost" size="sm" className="w-full">
              <Plus className="h-3 w-3 mr-1" />
              Show {hiddenActions.length} more actions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}