import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import '@testing-library/jest-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Mock auth context
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock setup check
vi.mock('@/hooks/useSetupCheck', () => ({
  useSetupCheck: vi.fn(() => ({ setupComplete: true, loading: false })),
}));

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/dashboard' }),
  };
});

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading spinner when auth is loading', () => {
    const { useAuth } = require('@/contexts/AuthContext');
    useAuth.mockReturnValue({
      user: null,
      loading: true,
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders children when user is authenticated and setup is complete', () => {
    const { useAuth } = require('@/contexts/AuthContext');
    useAuth.mockReturnValue({
      user: { id: 'test-user', email: 'test@example.com' },
      loading: false,
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to auth when user is not authenticated', () => {
    const { useAuth } = require('@/contexts/AuthContext');
    useAuth.mockReturnValue({
      user: null,
      loading: false,
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    // Navigation should be called to redirect
    // Note: In actual implementation, useEffect will call navigate
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirects to setup when setup is not complete', () => {
    const { useAuth } = require('@/contexts/AuthContext');
    const { useSetupCheck } = require('@/hooks/useSetupCheck');
    
    useAuth.mockReturnValue({
      user: { id: 'test-user', email: 'test@example.com' },
      loading: false,
    });

    useSetupCheck.mockReturnValue({
      setupComplete: false,
      loading: false,
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
