import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';

const routeTitles: Array<{ match: RegExp; title: string }> = [
  { match: /^\/admin\/overview$/, title: 'Dashboard' },
  { match: /^\/$/, title: 'Home' },
  { match: /^\/properties(\/|$)/, title: 'Properties' },
  { match: /^\/finances(\/|$)/, title: 'Finances' },
  { match: /^\/messages(\/|$)/, title: 'Messages' },
  { match: /^\/maintenance(\/|$)/, title: 'Maintenance' },
  { match: /^\/settings(\/|$)/, title: 'Settings' },
];

export function AppHeader() {
  const location = useLocation();

  const title = useMemo(() => {
    const item = routeTitles.find(r => r.match.test(location.pathname));
    return item?.title ?? 'Latitude Premier';
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-40 h-12 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-2 md:px-4">
      <SidebarTrigger className="mr-2" />
      <h1 className="text-sm md:text-base font-medium text-foreground truncate">{title}</h1>
    </header>
  );
}
