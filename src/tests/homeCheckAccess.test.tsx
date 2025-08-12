import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import HomeCheck from '@/pages/HomeCheck';

vi.mock('@/hooks/useUserRole', () => ({
  useUserRole: () => ({ userRole: 'house_watcher', isAdmin: () => false })
}));

vi.mock('@/integrations/supabase/client', () => {
  const buildChain = () => ({
    select: () => buildChain(),
    eq: () => buildChain(),
    single: () => ({ data: { id: 'prop-1', address: '123 Main St' }, error: null })
  });
  return { supabase: { from: () => buildChain() } };
});

describe('HomeCheck access control', () => {
  beforeEach(() => vi.clearAllMocks());

  it('allows house_watcher to access check route alias', async () => {
    const { findByText, queryByText } = render(
      <MemoryRouter initialEntries={["/house-watcher/check/prop-1"]}>
        <Routes>
          <Route path="/house-watcher/check/:id" element={<HomeCheck />} />
        </Routes>
      </MemoryRouter>
    );

    // Should not show access restricted
    expect(queryByText('Access Restricted')).not.toBeInTheDocument();

    // Loads property
    await findByText('123 Main St');
  });
});
