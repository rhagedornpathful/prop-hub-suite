import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { PropertyDetail } from '@/pages/PropertyDetail';

vi.mock('@/hooks/useUserRole', () => ({
  useUserRole: () => ({ userRole: 'house_watcher' })
}));

vi.mock('@/hooks/usePropertyActivity', () => ({
  usePropertyActivity: () => ({ activities: [], isLoading: false, error: null, refetch: vi.fn() })
}));

vi.mock('@/integrations/supabase/client', () => {
  const buildChain = (table: string) => ({
    select: () => buildChain(table),
    eq: () => buildChain(table),
    order: () => buildChain(table),
    limit: () => ({ data: [], error: null }),
    single: () => ({
      data: table === 'properties' 
        ? { id: 'abc', address: '123 Main St', city: 'Portland', state: 'OR', status: 'active', service_type: 'house_watching', monthly_rent: 2500 }
        : null,
      error: null,
    }),
  });
  return {
    supabase: {
      from: (table: string) => buildChain(table)
    }
  };
});

describe('PropertyDetail visibility for House Watcher', () => {
  beforeEach(() => vi.clearAllMocks());

  it('hides Services & Financials section for house_watcher role', async () => {
    const { queryByText, findByText } = render(
      <MemoryRouter initialEntries={["/properties/abc"]}>
        <Routes>
          <Route path="/properties/:id" element={<PropertyDetail />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for property address to render
    await findByText('123 Main St');

    // Ensure the merged Services & Financials section is not visible
    expect(queryByText('Services & Financials')).not.toBeInTheDocument();
  });
});
