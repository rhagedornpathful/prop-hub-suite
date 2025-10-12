import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen } from './utils/test-utils';
import { RoleBasedAccess, ROLES } from '@/components/RoleBasedAccess';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('RoleBasedAccess - Comprehensive Role Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Admin Role', () => {
    beforeEach(() => {
      vi.mock('@/contexts/AuthContext', () => ({
        useAuth: () => ({ 
          user: { id: 'admin-1', email: 'admin@test.com' }, 
          userRole: 'admin', 
          loading: false 
        })
      }));
    });

    it('should have access to all routes', () => {
      const { container } = render(
        <RoleBasedAccess allowedRoles={[ROLES.ADMIN]}>
          <div>Admin Content</div>
        </RoleBasedAccess>
      );
      expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });

    it('should access financial features', () => {
      const { container } = render(
        <RoleBasedAccess allowedRoles={[ROLES.ADMIN, ROLES.PROPERTY_MANAGER, ROLES.PROPERTY_OWNER]}>
          <div>Financial Dashboard</div>
        </RoleBasedAccess>
      );
      expect(screen.getByText('Financial Dashboard')).toBeInTheDocument();
    });
  });

  describe('Property Manager Role', () => {
    beforeEach(() => {
      vi.mock('@/contexts/AuthContext', () => ({
        useAuth: () => ({ 
          user: { id: 'pm-1', email: 'pm@test.com' }, 
          userRole: 'property_manager', 
          loading: false 
        })
      }));
    });

    it('should access property management features', () => {
      const { container } = render(
        <RoleBasedAccess allowedRoles={[ROLES.ADMIN, ROLES.PROPERTY_MANAGER]}>
          <div>Property Management</div>
        </RoleBasedAccess>
      );
      expect(screen.getByText('Property Management')).toBeInTheDocument();
    });

    it('should NOT access admin-only features', () => {
      const { container } = render(
        <RoleBasedAccess allowedRoles={[ROLES.ADMIN]}>
          <div>Admin Only Content</div>
        </RoleBasedAccess>
      );
      expect(screen.queryByText('Admin Only Content')).not.toBeInTheDocument();
    });
  });

  describe('House Watcher Role', () => {
    beforeEach(() => {
      vi.mock('@/contexts/AuthContext', () => ({
        useAuth: () => ({ 
          user: { id: 'hw-1', email: 'hw@test.com' }, 
          userRole: 'house_watcher', 
          loading: false 
        })
      }));
    });

    it('should access house watching features', () => {
      const { container } = render(
        <RoleBasedAccess allowedRoles={[ROLES.ADMIN, ROLES.HOUSE_WATCHER]}>
          <div>House Watching Dashboard</div>
        </RoleBasedAccess>
      );
      expect(screen.getByText('House Watching Dashboard')).toBeInTheDocument();
    });

    it('should NOT access financial features', () => {
      const { container } = render(
        <RoleBasedAccess allowedRoles={[ROLES.ADMIN, ROLES.PROPERTY_MANAGER, ROLES.PROPERTY_OWNER]}>
          <div>Financial Dashboard</div>
        </RoleBasedAccess>
      );
      expect(screen.queryByText('Financial Dashboard')).not.toBeInTheDocument();
    });

    it('should NOT access property management', () => {
      const { container } = render(
        <RoleBasedAccess allowedRoles={[ROLES.ADMIN, ROLES.PROPERTY_MANAGER]}>
          <div>Property Management</div>
        </RoleBasedAccess>
      );
      expect(screen.queryByText('Property Management')).not.toBeInTheDocument();
    });
  });

  describe('Tenant Role', () => {
    beforeEach(() => {
      vi.mock('@/contexts/AuthContext', () => ({
        useAuth: () => ({ 
          user: { id: 'tenant-1', email: 'tenant@test.com' }, 
          userRole: 'tenant', 
          loading: false 
        })
      }));
    });

    it('should access tenant portal', () => {
      const { container } = render(
        <RoleBasedAccess allowedRoles={[ROLES.ADMIN, ROLES.TENANT]}>
          <div>Tenant Portal</div>
        </RoleBasedAccess>
      );
      expect(screen.getByText('Tenant Portal')).toBeInTheDocument();
    });

    it('should access maintenance requests', () => {
      const { container } = render(
        <RoleBasedAccess allowedRoles={[ROLES.ADMIN, ROLES.PROPERTY_MANAGER, ROLES.TENANT]}>
          <div>Maintenance Requests</div>
        </RoleBasedAccess>
      );
      expect(screen.getByText('Maintenance Requests')).toBeInTheDocument();
    });

    it('should NOT access property management', () => {
      const { container } = render(
        <RoleBasedAccess allowedRoles={[ROLES.ADMIN, ROLES.PROPERTY_MANAGER]}>
          <div>Property Management</div>
        </RoleBasedAccess>
      );
      expect(screen.queryByText('Property Management')).not.toBeInTheDocument();
    });

    it('should NOT access house watching', () => {
      const { container } = render(
        <RoleBasedAccess allowedRoles={[ROLES.ADMIN, ROLES.HOUSE_WATCHER]}>
          <div>House Watching</div>
        </RoleBasedAccess>
      );
      expect(screen.queryByText('House Watching')).not.toBeInTheDocument();
    });
  });

  describe('Property Owner Role', () => {
    beforeEach(() => {
      vi.mock('@/contexts/AuthContext', () => ({
        useAuth: () => ({ 
          user: { id: 'owner-1', email: 'owner@test.com' }, 
          userRole: 'owner_investor', 
          loading: false 
        })
      }));
    });

    it('should access financial features', () => {
      const { container } = render(
        <RoleBasedAccess allowedRoles={[ROLES.ADMIN, ROLES.PROPERTY_OWNER, ROLES.PROPERTY_MANAGER]}>
          <div>Financial Dashboard</div>
        </RoleBasedAccess>
      );
      expect(screen.getByText('Financial Dashboard')).toBeInTheDocument();
    });

    it('should access property details', () => {
      const { container } = render(
        <RoleBasedAccess allowedRoles={[ROLES.ADMIN, ROLES.PROPERTY_OWNER, ROLES.PROPERTY_MANAGER]}>
          <div>Property Details</div>
        </RoleBasedAccess>
      );
      expect(screen.getByText('Property Details')).toBeInTheDocument();
    });

    it('should NOT access house watching', () => {
      const { container } = render(
        <RoleBasedAccess allowedRoles={[ROLES.ADMIN, ROLES.HOUSE_WATCHER]}>
          <div>House Watching</div>
        </RoleBasedAccess>
      );
      expect(screen.queryByText('House Watching')).not.toBeInTheDocument();
    });
  });

  describe('Contractor Role', () => {
    beforeEach(() => {
      vi.mock('@/contexts/AuthContext', () => ({
        useAuth: () => ({ 
          user: { id: 'contractor-1', email: 'contractor@test.com' }, 
          userRole: 'contractor', 
          loading: false 
        })
      }));
    });

    it('should access vendor portal', () => {
      const { container } = render(
        <RoleBasedAccess allowedRoles={[ROLES.ADMIN, ROLES.CONTRACTOR]}>
          <div>Vendor Portal</div>
        </RoleBasedAccess>
      );
      expect(screen.getByText('Vendor Portal')).toBeInTheDocument();
    });

    it('should NOT access financial features', () => {
      const { container } = render(
        <RoleBasedAccess allowedRoles={[ROLES.ADMIN, ROLES.PROPERTY_MANAGER, ROLES.PROPERTY_OWNER]}>
          <div>Financial Dashboard</div>
        </RoleBasedAccess>
      );
      expect(screen.queryByText('Financial Dashboard')).not.toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should show loading spinner when auth is loading', () => {
      vi.mock('@/contexts/AuthContext', () => ({
        useAuth: () => ({ 
          user: null, 
          userRole: null, 
          loading: true 
        })
      }));

      const { container } = render(
        <RoleBasedAccess allowedRoles={[ROLES.ADMIN]}>
          <div>Content</div>
        </RoleBasedAccess>
      );
      
      expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });
  });
});
