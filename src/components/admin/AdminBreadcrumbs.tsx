import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface AdminBreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const routeBreadcrumbs: Record<string, BreadcrumbItem[]> = {
  '/admin': [
    { label: 'Dashboard', icon: Home }
  ],
  '/properties': [
    { label: 'Dashboard', href: '/admin', icon: Home },
    { label: 'Properties' }
  ],
  '/maintenance': [
    { label: 'Dashboard', href: '/admin', icon: Home },
    { label: 'Maintenance' }
  ],
  '/tenants': [
    { label: 'Dashboard', href: '/admin', icon: Home },
    { label: 'Tenants' }
  ],
  '/reports': [
    { label: 'Dashboard', href: '/admin', icon: Home },
    { label: 'Reports & Analytics' }
  ],
  '/messages': [
    { label: 'Dashboard', href: '/admin', icon: Home },
    { label: 'Communications' }
  ],
  '/house-watching': [
    { label: 'Dashboard', href: '/admin', icon: Home },
    { label: 'House Watching' }
  ],
  '/settings': [
    { label: 'Dashboard', href: '/admin', icon: Home },
    { label: 'Settings' }
  ]
};

export function AdminBreadcrumbs({ items, className }: AdminBreadcrumbsProps) {
  const location = useLocation();
  
  // Use custom items or derive from current route
  const breadcrumbItems = items || routeBreadcrumbs[location.pathname] || [
    { label: 'Dashboard', icon: Home }
  ];

  if (breadcrumbItems.length <= 1) {
    return null; // Don't show breadcrumbs for single-level pages
  }

  return (
    <nav className={cn("flex items-center space-x-1 text-sm text-muted-foreground mb-4", className)}>
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;
        const IconComponent = item.icon;

        return (
          <div key={index} className="flex items-center gap-1">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            )}
            
            {item.href && !isLast ? (
              <Link
                to={item.href}
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                {IconComponent && <IconComponent className="h-4 w-4" />}
                {item.label}
              </Link>
            ) : (
              <span className={cn(
                "flex items-center gap-1",
                isLast ? "text-foreground font-medium" : "text-muted-foreground"
              )}>
                {IconComponent && <IconComponent className="h-4 w-4" />}
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}