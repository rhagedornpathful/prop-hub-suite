import { Home, Bell, Calendar, FileText, User } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    name: "Properties",
    href: "/",
    icon: Home,
  },
  {
    name: "Alerts",
    href: "/alerts",
    icon: Bell,
  },
  {
    name: "Schedule",
    href: "/schedule",
    icon: Calendar,
  },
  {
    name: "Reports",
    href: "/reports",
    icon: FileText,
  },
  {
    name: "Profile",
    href: "/profile",
    icon: User,
  },
];

export function MobileNavigation() {
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border pb-safe">
      <div className="flex items-center justify-around h-16">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-2 px-1 relative transition-colors",
                isActive
                  ? "text-[#2563eb]"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-[#2563eb] rounded-b-full" />
              )}
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{item.name}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}