import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, CheckCircle2, MessageSquare, Settings, Wrench, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserRole } from '@/hooks/useUserRole';
import { cn } from '@/lib/utils';

const MobileBottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole } = useUserRole();

  // Only show for mobile roles
  if (!['house_watcher', 'property_manager'].includes(userRole)) {
    return null;
  }

  const isActive = (path: string) => location.pathname === path;

  const houseWatcherTabs = [
    { icon: Home, label: 'Home', path: '/house-watcher/dashboard' },
    { icon: CheckCircle2, label: 'Checks', path: '/house-watcher/checks' },
    { icon: MessageSquare, label: 'Messages', path: '/messages' },
    { icon: Settings, label: 'Settings', path: '/house-watcher-settings' },
  ];

  const propertyManagerTabs = [
    { icon: Home, label: 'Home', path: '/property-manager/dashboard' },
    { icon: Wrench, label: 'Maintenance', path: '/property-manager/maintenance' },
    { icon: Users, label: 'Tenants', path: '/property-manager/tenants' },
    { icon: MessageSquare, label: 'Messages', path: '/messages' },
  ];

  const tabs = userRole === 'house_watcher' ? houseWatcherTabs : propertyManagerTabs;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-2xl z-50 safe-area-pb">
      <div className="flex justify-around items-center py-3 px-2">
        {tabs.map(({ icon: Icon, label, path }) => (
          <Button
            key={path}
            variant="ghost"
            size="sm"
            onClick={() => navigate(path)}
            className={cn(
              "flex-1 flex-col gap-1 h-auto py-3 px-2 min-h-[60px] rounded-xl transition-all duration-200",
              isActive(path) 
                ? "text-primary bg-primary/10 font-semibold" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Icon className={cn(
              "h-6 w-6 transition-all duration-200", 
              isActive(path) ? "text-primary scale-110" : ""
            )} />
            <span className="text-xs leading-none">{label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default MobileBottomNavigation;