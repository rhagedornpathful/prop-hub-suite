import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HouseWatcherMobileNavigation } from '@/components/HouseWatcherMobileNavigation';

vi.mock('@/hooks/useUserRole', () => ({
  useUserRole: () => ({ userRole: 'house_watcher' })
}));

describe('HouseWatcherMobileNavigation', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows only Home, Properties, Checks, and Settings', () => {
    const { getByText, queryByText } = render(
      <MemoryRouter initialEntries={["/house-watcher-home"]}>
        <HouseWatcherMobileNavigation />
      </MemoryRouter>
    );

    expect(getByText('Home')).toBeInTheDocument();
    expect(getByText('Properties')).toBeInTheDocument();
    expect(getByText('Checks')).toBeInTheDocument();
    expect(getByText('Settings')).toBeInTheDocument();

    // Ensure Messages/Maintenance are not present
    expect(queryByText('Messages')).not.toBeInTheDocument();
    expect(queryByText('Tasks')).not.toBeInTheDocument();
  });
});
