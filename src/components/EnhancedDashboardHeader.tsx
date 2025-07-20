import { Bell, Search, User, Plus, Calendar, MessageSquare, Command } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { NotificationsDropdown } from './NotificationsDropdown';
import { EnhancedCommandPalette } from './EnhancedCommandPalette';
import { GlobalSearch } from './GlobalSearch';
import { BreadcrumbNavigation } from './BreadcrumbNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ViewAsDropdown } from './ViewAsDropdown';

interface EnhancedDashboardHeaderProps {
  onAddProperty?: () => void;
  onAddTenant?: () => void;
  onScheduleMaintenance?: () => void;
}

export const EnhancedDashboardHeader = ({ onAddProperty, onAddTenant, onScheduleMaintenance }: EnhancedDashboardHeaderProps) => {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const navigate = useNavigate();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  
  const userName = profile?.first_name && profile?.last_name 
    ? `${profile.first_name} ${profile.last_name}`
    : user?.email || 'User';

  const userInitials = profile?.first_name && profile?.last_name
    ? `${profile.first_name[0]}${profile.last_name[0]}`
    : user?.email?.[0]?.toUpperCase() || 'U';

  const handleSignOut = async () => {
    try {
      console.log('🔐 Header: Starting sign out...');
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Sign out error:', error);
        throw error;
      }
      
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
      
      console.log('✅ Header: Sign out successful, redirecting...');
      navigate('/auth');
      
    } catch (error: any) {
      console.error('💥 Sign out failed:', error);
      toast({
        title: "Sign out failed",
        description: error.message || "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">Property Management</h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Global Search */}
          <div className="hidden md:flex relative">
            <GlobalSearch 
              isExpanded={searchExpanded}
              onExpand={setSearchExpanded}
              className="w-64"
            />
          </div>

          {/* Command Palette Trigger */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCommandPaletteOpen(true)}
            className="hidden md:flex"
            aria-label="Open command palette"
            aria-keyshortcuts="Ctrl+K"
          >
            <Command className="h-4 w-4 mr-2" />
            <span className="hidden lg:inline">Command</span>
            <Badge variant="secondary" className="ml-2 text-xs">⌘K</Badge>
          </Button>

          {/* Notifications */}
          <NotificationsDropdown notificationCount={0} />

          {/* View As (Admin only) */}
          <ViewAsDropdown />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" alt={userName} />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Enhanced Command Palette */}
          <EnhancedCommandPalette
            isOpen={commandPaletteOpen}
            onOpenChange={setCommandPaletteOpen}
            onAddProperty={onAddProperty}
            onAddTenant={onAddTenant}
            onScheduleMaintenance={onScheduleMaintenance}
          />
        </div>
      </div>
      
      {/* Breadcrumb Navigation */}
      <div className="px-6 py-2 border-t border-border/50">
        <BreadcrumbNavigation />
      </div>
    </header>
  );
};