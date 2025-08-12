import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import HomeCheck from '@/pages/HomeCheck';

vi.mock('@/hooks/useUserRole', () => ({
  useUserRole: () => ({ userRole: 'owner_investor', isAdmin: () => false })
}));

describe('HomeCheck access restriction for non-house_watcher', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows Access Restricted for owner_investor', async () => {
    const { getByText } = render(
      <MemoryRouter initialEntries={["/house-watcher/check/prop-1"]}>
        <Routes>
          <Route path="/house-watcher/check/:id" element={<HomeCheck />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getByText('Access Restricted')).toBeInTheDocument();
  });
});
