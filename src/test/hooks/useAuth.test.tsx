import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { mockUsers } from '../utils/test-utils'

// Create wrapper for hooks that need providers
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  )
}

describe('useAuth Hook', () => {
  it('returns null user initially', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    })

    expect(result.current.user).toBeNull()
    expect(result.current.loading).toBe(true)
  })

  it('provides signin function', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    })

    expect(typeof result.current.signIn).toBe('function')
    expect(typeof result.current.signUp).toBe('function')
    expect(typeof result.current.signOut).toBe('function')
  })

  it('handles loading state correctly', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    })

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })
})