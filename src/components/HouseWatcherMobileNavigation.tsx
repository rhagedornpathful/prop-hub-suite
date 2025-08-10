import { Home, Building, MessageCircle, Wrench, Settings } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navigationItems = [
  {
    title: 'Home',
    href: '/house-watcher-home',
    icon: Home
  },
  {
    title: 'Properties',
    href: '/house-watcher-properties',
    icon: Building
  },
  {
    title: 'Messages',
    href: '/messages',
    icon: MessageCircle
  },
  {
    title: 'Tasks',
    href: '/maintenance',
    icon: Wrench
  },
  {
    title: 'Settings',
    href: '/house-watcher-settings',
    icon: Settings
  }
];

export const HouseWatcherMobileNavigation = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 md:hidden">
      <div className="flex items-center justify-around py-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center min-w-0 flex-1 px-2 py-1 text-xs transition-colors",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5 mb-1", isActive && "text-primary")} />
              <span className={cn("truncate", isActive && "font-medium")}>
                {item.title}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};