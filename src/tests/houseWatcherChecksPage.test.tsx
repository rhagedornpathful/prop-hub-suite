import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HouseWatcherMobileChecks from '@/pages/HouseWatcherMobileChecks';

vi.mock('@/hooks/useUserRole', () => ({
  useUserRole: () => ({ userRole: 'house_watcher' })
}));

vi.mock('@/integrations/supabase/client', () => {
  const buildChain = (table: string) => ({
    select: () => buildChain(table),
    eq: () => buildChain(table),
    order: () => buildChain(table),
    limit: () => ({ data: [], error: null }),
  });
  return {
    supabase: {
      from: (table: string) => buildChain(table),
      auth: {
        getUser: async () => ({ data: { user: { id: 'user-1' } } })
      }
    }
  };
});

describe('HouseWatcherMobileChecks page', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders and shows empty states without assigned properties', async () => {
    const qc = new QueryClient();
    const { findByText } = render(
      <QueryClientProvider client={qc}>
        <MemoryRouter initialEntries={["/house-watcher/checks"]}>
          <HouseWatcherMobileChecks />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await findByText('House Checks');
    await findByText('No properties available');
  });
});
