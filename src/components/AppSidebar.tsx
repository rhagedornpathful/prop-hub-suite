import { useState } from "react";
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
  Plus,
  Search,
  Eye
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

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

const menuItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,
    description: "Overview & metrics"
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
    title: "House Watching",
    url: "/house-watching",
    icon: Eye,
    description: "Property monitoring"
  },
  {
    title: "Leases",
    url: "/leases",
    icon: FileText,
    description: "Lease agreements"
  },
  {
    title: "Finances",
    url: "/finances",
    icon: DollarSign,
    description: "Payments & reports"
  },
  {
    title: "Maintenance",
    url: "/maintenance",
    icon: Wrench,
    description: "Work orders"
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
    title: "Reports",
    url: "/reports",
    icon: BarChart3,
    description: "Analytics & insights"
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);
  const collapsed = state === "collapsed";

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
      <Sidebar variant="inset" collapsible="icon">
        <SidebarContent>
          {/* Header */}
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center justify-between">
              {!collapsed && (
                <div className="flex items-center justify-center w-full">
                  <img 
                    src="/lovable-uploads/a1c36a6f-e37d-42f5-9f3c-f434a26e8627.png" 
                    alt="Lattitude Premier Properties" 
                    className="w-32 h-32 object-contain"
                  />
                </div>
              )}
              <SidebarTrigger />
            </div>
          </div>

          {/* Search */}
          {!collapsed && (
            <div className="p-4 border-b border-sidebar-border">
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
                          <div className="flex-1">
                            <div className="font-medium">{item.title}</div>
                            <div className="text-xs opacity-70">{item.description}</div>
                          </div>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

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