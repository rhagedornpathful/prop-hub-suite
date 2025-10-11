import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useUserRole } from '@/hooks/useUserRole';

// Mock auth context
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock dev admin context
vi.mock('@/contexts/DevAdminContext', () => ({
  useDevAdmin: vi.fn(() => ({ isDevAdmin: false })),
}));

// Mock view as context
vi.mock('@/contexts/ViewAsContext', () => ({
  useViewAs: vi.fn(() => ({ viewAsRole: null, isViewingAs: false })),
}));

describe('useUserRole', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns correct role for admin user', () => {
    const { useAuth } = require('@/contexts/AuthContext');
    useAuth.mockReturnValue({
      user: { id: 'test-user' },
      userRole: 'admin',
      loading: false,
    });

    const { result } = renderHook(() => useUserRole());

    expect(result.current.userRole).toBe('admin');
    expect(result.current.isAdmin()).toBe(true);
    expect(result.current.isPropertyManager()).toBe(false);
  });

  it('returns correct role for property manager', () => {
    const { useAuth } = require('@/contexts/AuthContext');
    useAuth.mockReturnValue({
      user: { id: 'test-user' },
      userRole: 'property_manager',
      loading: false,
    });

    const { result } = renderHook(() => useUserRole());

    expect(result.current.userRole).toBe('property_manager');
    expect(result.current.isAdmin()).toBe(false);
    expect(result.current.isPropertyManager()).toBe(true);
  });

  it('returns correct permissions for admin', () => {
    const { useAuth } = require('@/contexts/AuthContext');
    useAuth.mockReturnValue({
      user: { id: 'test-user' },
      userRole: 'admin',
      loading: false,
    });

    const { result } = renderHook(() => useUserRole());
    const permissions = result.current.getPermissions();

    expect(permissions.canManageAllProperties).toBe(true);
    expect(permissions.canViewAllTenants).toBe(true);
    expect(permissions.canManageUsers).toBe(true);
  });

  it('returns correct permissions for house watcher', () => {
    const { useAuth } = require('@/contexts/AuthContext');
    useAuth.mockReturnValue({
      user: { id: 'test-user' },
      userRole: 'house_watcher',
      loading: false,
    });

    const { result } = renderHook(() => useUserRole());
    const permissions = result.current.getPermissions();

    expect(permissions.canManageAllProperties).toBe(false);
    expect(permissions.canViewAllTenants).toBe(false);
    expect(permissions.canManageUsers).toBe(false);
  });

  it('respects view-as mode', () => {
    const { useAuth } = require('@/contexts/AuthContext');
    const { useViewAs } = require('@/contexts/ViewAsContext');

    useAuth.mockReturnValue({
      user: { id: 'test-user' },
      userRole: 'admin',
      loading: false,
    });

    useViewAs.mockReturnValue({
      viewAsRole: 'tenant',
      isViewingAs: true,
    });

    const { result } = renderHook(() => useUserRole());

    expect(result.current.userRole).toBe('tenant');
    expect(result.current.isViewingAs).toBe(true);
  });

  it('provides correct role display names', () => {
    const { useAuth } = require('@/contexts/AuthContext');
    useAuth.mockReturnValue({
      user: { id: 'test-user' },
      userRole: 'property_manager',
      loading: false,
    });

    const { result } = renderHook(() => useUserRole());

    expect(result.current.getRoleDisplayName()).toBe('Property Manager');
  });
});
