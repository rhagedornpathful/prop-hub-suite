import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from './utils/test-utils';
import { RoleBasedAccess } from '@/components/RoleBasedAccess';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Role-Based Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('admin trying to access finances - should allow', async () => {
    vi.mock('@/contexts/AuthContext', () => ({
      useAuth: () => ({ 
        user: { id: 'admin-1' }, 
        userRole: 'admin', 
        loading: false 
      })
    }));

    render(
      <RoleBasedAccess allowedRoles={['admin', 'property_manager', 'owner_investor']}>
        <div>Finances Content</div>
      </RoleBasedAccess>
    );

    expect(screen.getByText('Finances Content')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('house_watcher trying to access finances - should redirect', async () => {
    vi.mock('@/contexts/AuthContext', () => ({
      useAuth: () => ({ 
        user: { id: 'hw-1' }, 
        userRole: 'house_watcher', 
        loading: false 
      })
    }));

    render(
      <RoleBasedAccess allowedRoles={['admin', 'property_manager', 'owner_investor']}>
        <div>Finances Content</div>
      </RoleBasedAccess>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/house-watcher/dashboard', { replace: true });
    });
  });

  it('tenant trying to access admin panel - should redirect', async () => {
    vi.mock('@/contexts/AuthContext', () => ({
      useAuth: () => ({ 
        user: { id: 'tenant-1' }, 
        userRole: 'tenant', 
        loading: false 
      })
    }));

    render(
      <RoleBasedAccess allowedRoles={['admin']}>
        <div>Admin Panel</div>
      </RoleBasedAccess>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('property_manager accessing properties - should allow', async () => {
    vi.mock('@/contexts/AuthContext', () => ({
      useAuth: () => ({ 
        user: { id: 'pm-1' }, 
        userRole: 'property_manager', 
        loading: false 
      })
    }));

    render(
      <RoleBasedAccess allowedRoles={['admin', 'property_manager', 'owner_investor']}>
        <div>Properties Content</div>
      </RoleBasedAccess>
    );

    expect(screen.getByText('Properties Content')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('owner_investor accessing finances - should allow', async () => {
    vi.mock('@/contexts/AuthContext', () => ({
      useAuth: () => ({ 
        user: { id: 'owner-1' }, 
        userRole: 'owner_investor', 
        loading: false 
      })
    }));

    render(
      <RoleBasedAccess allowedRoles={['admin', 'property_manager', 'owner_investor']}>
        <div>Finances Content</div>
      </RoleBasedAccess>
    );

    expect(screen.getByText('Finances Content')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('contractor trying to access house watching - should redirect', async () => {
    vi.mock('@/contexts/AuthContext', () => ({
      useAuth: () => ({ 
        user: { id: 'contractor-1' }, 
        userRole: 'contractor', 
        loading: false 
      })
    }));

    render(
      <RoleBasedAccess allowedRoles={['admin', 'house_watcher']}>
        <div>House Watching</div>
      </RoleBasedAccess>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    });
  });
});
