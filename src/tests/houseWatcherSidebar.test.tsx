import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

vi.mock('@/hooks/useUserRole', () => ({
  useUserRole: () => ({ userRole: 'house_watcher', getRoleDisplayName: () => 'House Watcher' })
}));

describe('AppSidebar for House Watcher', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows Home, My Properties, Checks, Settings and hides Messages/Maintenance', () => {
    const { getByText, queryByText } = render(
      <MemoryRouter initialEntries={["/house-watcher-home"]}>
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <AppSidebar />
          </div>
        </SidebarProvider>
      </MemoryRouter>
    );

    expect(getByText('Home')).toBeInTheDocument();
    expect(getByText('My Properties')).toBeInTheDocument();
    expect(getByText('Checks')).toBeInTheDocument();
    expect(getByText('Settings')).toBeInTheDocument();

    expect(queryByText('Messages')).not.toBeInTheDocument();
    expect(queryByText('Maintenance Tasks')).not.toBeInTheDocument();
  });
});
