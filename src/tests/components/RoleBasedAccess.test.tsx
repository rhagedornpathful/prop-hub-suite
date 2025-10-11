import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import '@testing-library/jest-dom';
import { RoleBasedAccess } from '@/components/RoleBasedAccess';

// Mock the useUserProfile hook
vi.mock('@/hooks/useUserProfile', () => ({
  useUserProfile: vi.fn(() => ({
    hasRole: vi.fn((role: string) => role === 'admin'),
    loading: false,
  })),
}));

describe('RoleBasedAccess', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when user has allowed role', () => {
    const { useUserProfile } = require('@/hooks/useUserProfile');
    useUserProfile.mockReturnValue({
      hasRole: (role: string) => role === 'admin',
      loading: false,
    });

    render(
      <RoleBasedAccess allowedRoles={['admin']}>
        <div>Protected Content</div>
      </RoleBasedAccess>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('hides content when user does not have allowed role', () => {
    const { useUserProfile } = require('@/hooks/useUserProfile');
    useUserProfile.mockReturnValue({
      hasRole: (role: string) => role === 'tenant',
      loading: false,
    });

    render(
      <RoleBasedAccess allowedRoles={['admin', 'property_manager']}>
        <div>Protected Content</div>
      </RoleBasedAccess>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('shows nothing during loading', () => {
    const { useUserProfile } = require('@/hooks/useUserProfile');
    useUserProfile.mockReturnValue({
      hasRole: vi.fn(),
      loading: true,
    });

    const { container } = render(
      <RoleBasedAccess allowedRoles={['admin']}>
        <div>Protected Content</div>
      </RoleBasedAccess>
    );

    expect(container.firstChild).toBeNull();
  });

  it('allows multiple roles', () => {
    const { useUserProfile } = require('@/hooks/useUserProfile');
    useUserProfile.mockReturnValue({
      hasRole: (role: string) => role === 'property_manager',
      loading: false,
    });

    render(
      <RoleBasedAccess allowedRoles={['admin', 'property_manager', 'owner_investor']}>
        <div>Multi-Role Content</div>
      </RoleBasedAccess>
    );

    expect(screen.getByText('Multi-Role Content')).toBeInTheDocument();
  });
});
