import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import HouseWatcherProperties from '@/pages/HouseWatcherProperties';

// Mock useUserRole to avoid view-as branch and treat as real house_watcher
vi.mock('@/hooks/useUserRole', () => ({
  useUserRole: () => ({ userRole: 'house_watcher', isViewingAs: false, isAdmin: () => false })
}));

// Mock AuthContext hook to provide a user id
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user-1' } })
}));

// Minimal supabase client mock for the data this page requests
vi.mock('@/integrations/supabase/client', () => {
  const buildChain = (table?: string) => ({
    select: () => buildChain(table),
    eq: () => buildChain(table),
    in: () => ({ data: [
      {
        id: 'watch-1',
        property_id: 'prop-1',
        property_address: '123 Main St',
        check_frequency: 'monthly',
        next_check_date: '2099-01-01',
        monthly_fee: 100,
        owner_name: 'Owner',
      }
    ], error: null }),
    single: () => ({ data: table === 'house_watchers' ? { id: 'hw-1' } : null, error: null }),
  });

  return {
    supabase: {
      from: (table: string) => {
        if (table === 'house_watcher_properties') {
          return {
            select: () => ({
              eq: () => ({
                data: [
                  {
                    id: 'assign-1',
                    notes: '',
                    assigned_date: new Date().toISOString(),
                    properties: {
                      id: 'prop-1',
                      address: '123 Main St',
                      city: 'Portland',
                      state: 'OR',
                      zip_code: '97201',
                      property_type: 'House',
                    }
                  }
                ],
                error: null
              })
            })
          } as any;
        }
        if (table === 'house_watching') {
          return buildChain(table);
        }
        if (table === 'house_watchers') {
          return buildChain(table);
        }
        return buildChain(table);
      }
    }
  };
});

const CheckStub = () => <div>CHECK PAGE</div>;

describe('HouseWatcher start flow', () => {
  beforeEach(() => vi.clearAllMocks());

  it('navigates to check page with property id when Start Check is clicked', async () => {
    const { findByText, getByText } = render(
      <MemoryRouter initialEntries={["/house-watcher-properties"]}>
        <Routes>
          <Route path="/house-watcher-properties" element={<HouseWatcherProperties />} />
          <Route path="/house-watcher/check/:id" element={<CheckStub />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for property to load
    await findByText('123 Main St');

    // Click Start Check
    await userEvent.click(getByText('Start Check'));

    // We should be on the CHECK PAGE stub now
    await findByText('CHECK PAGE');
  });
});
