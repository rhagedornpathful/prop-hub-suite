import { useState } from "react";
import { 
  Home, 
  Building, 
  Users, 
  UserCheck,
  UserCog,
  FileText, 
  DollarSign, 
  Wrench, 
  MessageCircle,
  FolderOpen,
  BarChart3,
  Settings,
  Plus,
  Search,
  Eye,
  Shield,
  X,
  Navigation,
  Activity
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useMobileDetection } from "@/hooks/useMobileDetection";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddPropertyDialog } from "@/components/AddPropertyDialog";
import { useUserRole } from "@/hooks/useUserRole";

// Define menu items for different user roles
const adminMenuItems = [
  {
    title: "Admin Dashboard",
    url: "/",
    icon: Home,
    description: "Overview & metrics"
  },
  {
    title: "Activity Dashboard",
    url: "/activity",
    icon: Activity,
    description: "Activity dashboard"
  },
  {
    title: "Messages",
    url: "/messages",
    icon: MessageCircle,
    description: "Communication"
  },
  {
    title: "Maintenance Management",
    url: "/maintenance",
    icon: Wrench,
    description: "Work orders"
  },
  {
    title: "Properties",
    url: "/properties",
    icon: Building,
    description: "Manage properties"
  },
  {
    title: "Property Owners",
    url: "/property-owners",
    icon: UserCheck,
    description: "Manage property owners"
  },
  {
    title: "House Watcher",
    url: "/house-watching",
    icon: Eye,
    description: "Property monitoring"
  },
  {
    title: "Tenants",
    url: "/tenants",
    icon: Users,
    description: "Tenant management"
  },
  {
    title: "Lease Management",
    url: "/leases",
    icon: FileText,
    description: "Lease agreements"
  },
  {
    title: "Financial Management",
    url: "/finances",
    icon: DollarSign,
    description: "Payments & reports"
  },
  {
    title: "Documents",
    url: "/documents",
    icon: FolderOpen,
    description: "File management"
  },
  {
    title: "Reports",
    url: "/reports",
    icon: BarChart3,
    description: "Analytics & insights"
  },
  {
    title: "User Management",
    url: "/user-management",
    icon: UserCog,
    description: "Manage users & roles"
  }
];

const propertyOwnerMenuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
    description: "Owner dashboard"
  },
  {
    title: "My Properties",
    url: "/properties",
    icon: Building,
    description: "Your properties"
  },
  {
    title: "My Tenants",
    url: "/tenants",
    icon: Users,
    description: "Your tenants"
  },
  {
    title: "Maintenance Requests",
    url: "/maintenance",
    icon: Wrench,
    description: "Property maintenance"
  },
  {
    title: "Financial Reports",
    url: "/finances",
    icon: DollarSign,
    description: "Income & expenses"
  },
  {
    title: "My Profile",
    url: "/settings",
    icon: Settings,
    description: "Account settings"
  }
];

const tenantMenuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
    description: "Tenant dashboard"
  },
  {
    title: "My Lease",
    url: "/leases",
    icon: FileText,
    description: "Lease agreement"
  },
  {
    title: "Pay Rent",
    url: "/finances",
    icon: DollarSign,
    description: "Payment portal"
  },
  {
    title: "Maintenance Requests",
    url: "/maintenance",
    icon: Wrench,
    description: "Submit requests"
  },
  {
    title: "Documents",
    url: "/documents",
    icon: FolderOpen,
    description: "Lease documents"
  },
  {
    title: "My Profile",
    url: "/settings",
    icon: Settings,
    description: "Account settings"
  }
];

const propertyManagerMenuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
    description: "Operations dashboard"
  },
  {
    title: "Properties",
    url: "/properties",
    icon: Building,
    description: "Manage properties"
  },
  {
    title: "Tenants",
    url: "/tenants",
    icon: Users,
    description: "Tenant management"
  },
  {
    title: "Maintenance",
    url: "/maintenance",
    icon: Wrench,
    description: "Work orders"
  },
  {
    title: "House Watching",
    url: "/house-watching",
    icon: Eye,
    description: "Property monitoring"
  },
  {
    title: "Messages",
    url: "/messages",
    icon: MessageCircle,
    description: "Communication"
  },
  {
    title: "Documents",
    url: "/documents",
    icon: FolderOpen,
    description: "File management"
  },
  {
    title: "Activity",
    url: "/activity",
    icon: Activity,
    description: "Activity dashboard"
  },
  {
    title: "My Profile",
    url: "/settings",
    icon: Settings,
    description: "Account settings"
  }
];

const houseWatcherMenuItems = [
  {
    title: "Properties",
    url: "/house-watching",
    icon: Building,
    description: "Assigned properties"
  },
  {
    title: "Maintenance Tasks",
    url: "/maintenance",
    icon: Wrench,
    description: "Maintenance work"
  },
  {
    title: "Check-in Reports",
    url: "/property-check",
    icon: Eye,
    description: "Property reports"
  },
  {
    title: "My Profile",
    url: "/settings",
    icon: Settings,
    description: "Account settings"
  }
];

export function AppSidebar() {
  const { state, setOpen } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);
  const collapsed = state === "collapsed";
  const { isMobile } = useMobileDetection();
  const { userRole, getRoleDisplayName } = useUserRole();

  // Get menu items based on user role
  const getMenuItems = () => {
    switch (userRole) {
      case 'admin':
        return adminMenuItems;
      case 'property_manager':
        return propertyManagerMenuItems;
      case 'owner_investor':
        return propertyOwnerMenuItems;
      case 'tenant':
        return tenantMenuItems;
      case 'house_watcher':
        return houseWatcherMenuItems;
      case 'client':
        return tenantMenuItems; // Clients see tenant view
      case 'contractor':
        return tenantMenuItems; // Contractors see tenant view
      case 'leasing_agent':
        return adminMenuItems; // Leasing agents see admin view
      default:
        return adminMenuItems; // Default fallback
    }
  };

  const menuItems = getMenuItems();

  // Check if we're in demo mode
  const isDemoMode = currentPath.startsWith('/demo');
  const basePath = isDemoMode ? '/demo' : '';

  const isActive = (path: string) => {
    const fullPath = basePath + path;
    if (path === "/" && currentPath === fullPath) return true;
    if (path !== "/" && currentPath.startsWith(fullPath)) return true;
    return false;
  };

  const filteredItems = menuItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Sidebar 
        variant="inset" 
        collapsible={isMobile ? "offcanvas" : "icon"}
        className={isMobile ? "fixed inset-y-0 left-0 z-50 w-full" : ""}
      >
        <SidebarContent>
          {/* Header */}
          <div className="p-2 border-b border-sidebar-border">
            <div className="flex items-center justify-between">
              {!collapsed && (
                <div className="flex items-center justify-center w-full">
                  <img 
                    src="/lovable-uploads/3102d2d8-1c41-484b-a873-0b9ae2b75918.png" 
                    alt="Latitude Premier Properties" 
                    className={`${isMobile ? "w-32 h-32" : "w-40 h-40"} object-contain`}
                  />
                </div>
              )}
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                {isMobile && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setOpen(false)}
                    className="p-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>


          {/* Quick Actions */}
          {!collapsed && (
            <div className="p-4 border-b border-sidebar-border">
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="flex-1 bg-gradient-primary hover:bg-primary-dark"
                  onClick={() => setIsAddPropertyOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Property
                </Button>
              </div>
            </div>
          )}

          {/* Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/60 uppercase tracking-wider text-xs font-medium">
              {collapsed ? "Menu" : "Main Navigation"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={basePath + item.url} 
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive(item.url) 
                            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm" 
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        }`}
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {!collapsed && (
                          <span className="font-medium">{item.title}</span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Search */}
          {!collapsed && (
            <div className="p-4 border-t border-sidebar-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-sidebar-foreground/40" />
                <Input
                  placeholder="Search menu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-sidebar-accent border-sidebar-border"
                />
              </div>
            </div>
          )}

          {/* Role Indicator */}
          {!collapsed && userRole && (
            <div className="p-4 border-t border-sidebar-border">
              <div className="flex items-center gap-2 text-xs text-sidebar-foreground/60">
                <Shield className="w-3 h-3" />
                <span>Role: {getRoleDisplayName()}</span>
              </div>
            </div>
          )}

          {/* Settings */}
          <div className="mt-auto p-4 border-t border-sidebar-border">
            <SidebarMenuButton asChild>
              <NavLink 
                to={basePath + "/settings"}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive("/settings") 
                    ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                <Settings className="w-5 h-5" />
                {!collapsed && <span>Settings</span>}
              </NavLink>
            </SidebarMenuButton>
          </div>
        </SidebarContent>
      </Sidebar>

      <AddPropertyDialog 
        open={isAddPropertyOpen} 
        onOpenChange={setIsAddPropertyOpen}
        onPropertyAdded={() => {
          // Could refresh property data here if needed
        }}
      />
    </>
  );
}