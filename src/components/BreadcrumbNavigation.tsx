import { useLocation, Link } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface BreadcrumbConfig {
  path: string;
  label: string;
  icon?: React.ComponentType<any>;
}

const breadcrumbConfig: Record<string, BreadcrumbConfig> = {
  '/': { path: '/', label: 'Dashboard', icon: Home },
  '/properties': { path: '/properties', label: 'Properties' },
  '/property': { path: '/property', label: 'Property Details' },
  '/tenants': { path: '/tenants', label: 'Tenants' },
  '/property-owners': { path: '/property-owners', label: 'Property Owners' },
  '/house-watching': { path: '/house-watching', label: 'House Watching' },
  '/house-watcher': { path: '/house-watcher', label: 'House Watcher' },
  '/maintenance': { path: '/maintenance', label: 'Maintenance' },
  '/home-check': { path: '/home-check', label: 'Home Check' },
  '/property-check': { path: '/property-check', label: 'Property Check' },
  '/messages': { path: '/messages', label: 'Messages' },
  '/finances': { path: '/finances', label: 'Finances' },
  '/documents': { path: '/documents', label: 'Documents' },
  '/leases': { path: '/leases', label: 'Leases' },
  '/activity': { path: '/activity', label: 'Activity' },
  '/settings': { path: '/settings', label: 'Settings' },
  '/user-management': { path: '/user-management', label: 'User Management' },
  '/dev-tools': { path: '/dev-tools', label: 'Dev Tools' },
  '/setup': { path: '/setup', label: 'Setup' },
  '/auth': { path: '/auth', label: 'Authentication' },
};

export const BreadcrumbNavigation = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  // Build breadcrumb items
  const breadcrumbItems: BreadcrumbConfig[] = [];
  
  // Always start with home
  breadcrumbItems.push(breadcrumbConfig['/']);
  
  // Build path segments
  let currentPath = '';
  for (const segment of pathSegments) {
    currentPath += `/${segment}`;
    const config = breadcrumbConfig[currentPath];
    
    if (config) {
      breadcrumbItems.push(config);
    } else {
      // Create a fallback for dynamic routes
      breadcrumbItems.push({
        path: currentPath,
        label: segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ')
      });
    }
  }
  
  // Don't show breadcrumbs if we're only at home
  if (breadcrumbItems.length <= 1) {
    return null;
  }
  
  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          const Icon = item.icon;
          
          return (
            <div key={item.path} className="flex items-center">
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="flex items-center gap-2">
                    {Icon && <Icon className="h-4 w-4" />}
                    <span>{item.label}</span>
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link 
                      to={item.path}
                      className="flex items-center gap-2 hover:text-primary transition-colors"
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                      <span>{item.label}</span>
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};