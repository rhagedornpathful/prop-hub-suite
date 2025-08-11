import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowUpRight, 
  Navigation, 
  Bookmark, 
  Clock, 
  Home, 
  Building, 
  Users, 
  Wrench, 
  FileText, 
  Settings,
  BarChart3
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface NavigationShortcut {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  description?: string;
}

const navigationShortcuts: NavigationShortcut[] = [
  {
    label: 'Dashboard Overview',
    href: '/admin',
    icon: Home,
    description: 'Main command center'
  },
  {
    label: 'Property Management',
    href: '/properties',
    icon: Building,
    badge: '24',
    description: 'Manage all properties'
  },
  {
    label: 'Tenant Portal',
    href: '/tenants',
    icon: Users,
    badge: '18',
    description: 'Tenant information & leases'
  },
  {
    label: 'Maintenance Requests',
    href: '/maintenance',
    icon: Wrench,
    badge: '7',
    description: 'Active maintenance issues'
  },
  {
    label: 'Reports & Analytics',
    href: '/reports',
    icon: BarChart3,
    description: 'Financial & operational reports'
  },
  {
    label: 'System Settings',
    href: '/settings',
    icon: Settings,
    description: 'Configure system preferences'
  }
];

const recentPages = [
  { label: 'Property Details - 123 Main St', href: '/properties/123', time: '2 min ago' },
  { label: 'Maintenance Request #M-2024-001', href: '/maintenance/001', time: '5 min ago' },
  { label: 'Tenant Profile - John Smith', href: '/tenants/john-smith', time: '10 min ago' },
  { label: 'Financial Report - November', href: '/reports/november', time: '15 min ago' }
];

const bookmarkedPages = [
  { label: 'Monthly Revenue Dashboard', href: '/reports/revenue' },
  { label: 'Emergency Contact List', href: '/contacts/emergency' },
  { label: 'Maintenance Vendor Directory', href: '/vendors' },
  { label: 'Lease Template Library', href: '/documents/templates' }
];

interface NavigationHubProps {
  className?: string;
  showRecent?: boolean;
  showBookmarks?: boolean;
  maxShortcuts?: number;
}

export function NavigationHub({ 
  className, 
  showRecent = true, 
  showBookmarks = true, 
  maxShortcuts = 6 
}: NavigationHubProps) {
  const location = useLocation();
  
  const isCurrentPage = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="h-5 w-5" />
          Navigation Hub
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Main Navigation Shortcuts */}
        <div>
          <h4 className="text-sm font-medium mb-3 text-muted-foreground">Quick Navigation</h4>
          <div className="grid grid-cols-1 gap-2">
            {navigationShortcuts.slice(0, maxShortcuts).map(shortcut => {
              const IconComponent = shortcut.icon;
              const isCurrent = isCurrentPage(shortcut.href);
              
              return (
                <Link key={shortcut.href} to={shortcut.href}>
                  <Button
                    variant={isCurrent ? "default" : "ghost"}
                    className="w-full justify-between h-auto p-3"
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className="h-4 w-4" />
                      <div className="text-left">
                        <div className="font-medium text-sm">{shortcut.label}</div>
                        {shortcut.description && (
                          <div className="text-xs text-muted-foreground">{shortcut.description}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {shortcut.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {shortcut.badge}
                        </Badge>
                      )}
                      <ArrowUpRight className="h-3 w-3" />
                    </div>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Pages */}
        {showRecent && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-medium mb-3 text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Recently Visited
              </h4>
              <div className="space-y-1">
                {recentPages.map((page, index) => (
                  <Link key={index} to={page.href}>
                    <Button variant="ghost" className="w-full justify-between h-auto p-2">
                      <span className="text-sm truncate">{page.label}</span>
                      <span className="text-xs text-muted-foreground">{page.time}</span>
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Bookmarked Pages */}
        {showBookmarks && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-medium mb-3 text-muted-foreground flex items-center gap-2">
                <Bookmark className="h-4 w-4" />
                Bookmarks
              </h4>
              <div className="space-y-1">
                {bookmarkedPages.map((bookmark, index) => (
                  <Link key={index} to={bookmark.href}>
                    <Button variant="ghost" className="w-full justify-start h-auto p-2">
                      <span className="text-sm">{bookmark.label}</span>
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}