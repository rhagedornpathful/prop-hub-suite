import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building, DollarSign, MessageCircle, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export function MobileTabBar() {
  const { userRole } = useAuth();
  const location = useLocation();

  // Hide on auth/setup pages
  if (location.pathname.startsWith('/auth') || location.pathname.startsWith('/setup')) {
    return null;
  }

  // Basic role-aware tabs (keep it simple)
  const items = (
    userRole === 'admin' || userRole === 'owner_investor'
      ? [
          { title: 'Dashboard', href: '/admin/overview', icon: LayoutDashboard },
          { title: 'Properties', href: '/properties', icon: Building },
          { title: 'Finances', href: '/finances', icon: DollarSign },
          { title: 'Messages', href: '/messages', icon: MessageCircle },
          { title: 'Settings', href: '/settings', icon: Settings },
        ]
      : userRole === 'property_manager'
      ? [
          { title: 'Home', href: '/property-manager-home', icon: LayoutDashboard },
          { title: 'Properties', href: '/property-manager-properties', icon: Building },
          { title: 'Maintenance', href: '/maintenance', icon: DollarSign },
          { title: 'Messages', href: '/messages', icon: MessageCircle },
          { title: 'Settings', href: '/property-manager-settings', icon: Settings },
        ]
      : userRole === 'house_watcher'
      ? [
          { title: 'Home', href: '/house-watcher-home', icon: LayoutDashboard },
          { title: 'Properties', href: '/house-watcher-properties', icon: Building },
          { title: 'Messages', href: '/messages', icon: MessageCircle },
          { title: 'Settings', href: '/house-watcher-settings', icon: Settings },
        ]
      : [
          { title: 'Home', href: '/', icon: LayoutDashboard },
          { title: 'Properties', href: '/properties', icon: Building },
          { title: 'Messages', href: '/messages', icon: MessageCircle },
          { title: 'Settings', href: '/settings', icon: Settings },
        ]
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 md:hidden">
      <div className={`grid gap-1 px-1 py-1.5 ${items.length === 5 ? 'grid-cols-5' : 'grid-cols-4'}`}>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href || 
                          (item.href !== '/' && location.pathname.startsWith(item.href));
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center px-2 py-1.5 rounded-md text-[11px] leading-3 min-h-[44px]',
                isActive
                  ? 'text-primary bg-primary/5 font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <Icon className={cn('h-5 w-5 mb-0.5', isActive && 'text-primary')} />
              <span className="truncate w-full text-center">{item.title}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
