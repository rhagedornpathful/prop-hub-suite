import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RoleBasedAccess } from '@/components/RoleBasedAccess';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'u1' }, userRole: 'house_watcher', loading: false })
}));

describe('RoleBasedAccess - finances blocked for house_watcher', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders Access Restricted when role not allowed', () => {
    const { getByText } = render(
      <MemoryRouter>
        <RoleBasedAccess allowedRoles={["admin","owner_investor","tenant","property_manager"]}>
          <div>Finances Content</div>
        </RoleBasedAccess>
      </MemoryRouter>
    );

    expect(getByText('Access Restricted')).toBeInTheDocument();
  });
});
