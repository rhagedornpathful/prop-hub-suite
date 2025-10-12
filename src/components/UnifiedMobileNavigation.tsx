import { NavLink, useLocation } from 'react-router-dom';
import { Home, Building, DollarSign, MessageCircle, Wrench, Settings, Users, FileText, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export const UnifiedMobileNavigation = () => {
  const location = useLocation();
  const { userRole } = useAuth();

  // Don't show on auth or setup pages
  if (location.pathname === '/auth' || location.pathname === '/setup') {
    return null;
  }

  // Role-based navigation items
  const getNavigationItems = () => {
    switch (userRole) {
      case 'admin':
        return [
          { title: 'Dashboard', href: '/admin/overview', icon: LayoutDashboard },
          { title: 'Properties', href: '/properties', icon: Building },
          { title: 'Finances', href: '/finances', icon: DollarSign },
          { title: 'Messages', href: '/messages', icon: MessageCircle },
          { title: 'Settings', href: '/settings', icon: Settings }
        ];
      
      case 'property_manager':
        return [
          { title: 'Home', href: '/property-manager-home', icon: Home },
          { title: 'Properties', href: '/property-manager-properties', icon: Building },
          { title: 'Messages', href: '/messages', icon: MessageCircle },
          { title: 'Maintenance', href: '/maintenance', icon: Wrench },
          { title: 'Settings', href: '/property-manager-settings', icon: Settings }
        ];
      
      case 'house_watcher':
        return [
          { title: 'Home', href: '/house-watcher-home', icon: Home },
          { title: 'Properties', href: '/house-watcher-properties', icon: Building },
          { title: 'Messages', href: '/messages', icon: MessageCircle },
          { title: 'Settings', href: '/house-watcher-settings', icon: Settings }
        ];
      
      case 'owner_investor':
        return [
          { title: 'Properties', href: '/properties', icon: Building },
          { title: 'Finances', href: '/finances', icon: DollarSign },
          { title: 'Reports', href: '/reports', icon: FileText },
          { title: 'Messages', href: '/messages', icon: MessageCircle },
          { title: 'Settings', href: '/settings', icon: Settings }
        ];
      
      case 'tenant':
        return [
          { title: 'Home', href: '/', icon: Home },
          { title: 'Maintenance', href: '/maintenance', icon: Wrench },
          { title: 'Messages', href: '/messages', icon: MessageCircle },
          { title: 'Settings', href: '/settings', icon: Settings }
        ];
      
      case 'contractor':
        return [
          { title: 'Home', href: '/vendor-portal', icon: Home },
          { title: 'Jobs', href: '/maintenance', icon: Wrench },
          { title: 'Messages', href: '/messages', icon: MessageCircle },
          { title: 'Settings', href: '/settings', icon: Settings }
        ];
      
      case 'leasing_agent':
        return [
          { title: 'Home', href: '/', icon: Home },
          { title: 'Properties', href: '/properties', icon: Building },
          { title: 'Tenants', href: '/tenants', icon: Users },
          { title: 'Messages', href: '/messages', icon: MessageCircle },
          { title: 'Settings', href: '/settings', icon: Settings }
        ];
      
      default:
        return [
          { title: 'Home', href: '/', icon: Home },
          { title: 'Messages', href: '/messages', icon: MessageCircle },
          { title: 'Settings', href: '/settings', icon: Settings }
        ];
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 md:hidden safe-area-pb">
      <div className="flex items-center justify-around py-2 px-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center min-w-0 flex-1 px-1 py-2 text-xs transition-colors rounded-lg",
                isActive 
                  ? "text-primary font-medium bg-primary/5" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className={cn("h-5 w-5 mb-1", isActive && "text-primary")} />
              <span className="truncate w-full text-center">
                {item.title}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
