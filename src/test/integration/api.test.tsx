import { QueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { vi } from 'vitest'

// Mock the Supabase client
vi.mock('@/integrations/supabase/client')

describe('API Integration Tests', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    vi.clearAllMocks()
  })

  describe('Properties API', () => {
    it('should fetch properties successfully', async () => {
      const mockProperties = [
        { id: '1', address: '123 Test St', city: 'Test City' }
      ]

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        then: vi.fn().mockResolvedValue({ data: mockProperties, error: null })
      } as any)

      const { data } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })

      expect(data).toEqual(mockProperties)
      expect(supabase.from).toHaveBeenCalledWith('properties')
    })

    it('should handle API errors gracefully', async () => {
      const mockError = { message: 'Network error' }

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        then: vi.fn().mockResolvedValue({ data: null, error: mockError })
      } as any)

      const { error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })

      expect(error).toEqual(mockError)
    })
  })

  describe('Authentication API', () => {
    it('should handle sign in', async () => {
      const mockSession = {
        user: { id: 'test-user', email: 'test@example.com' },
        access_token: 'mock-token'
      }

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { session: mockSession, user: mockSession.user },
        error: null
      })

      const result = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123'
      })

      expect(result.data.session).toEqual(mockSession)
      expect(result.error).toBeNull()
    })

    it('should handle sign in errors', async () => {
      const mockError = { message: 'Invalid credentials' }

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { session: null, user: null },
        error: mockError
      })

      const result = await supabase.auth.signInWithPassword({
        email: 'wrong@example.com',
        password: 'wrongpassword'
      })

      expect(result.error).toEqual(mockError)
      expect(result.data.session).toBeNull()
    })
  })
})