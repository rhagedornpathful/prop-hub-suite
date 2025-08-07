import React from 'react'
import { render as rtlRender, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from '@/components/ui/toaster'

// Create a custom render function that includes providers
function customRender(
  ui: React.ReactElement,
  {
    initialEntries = ['/'],
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    }),
    ...renderOptions
  }: {
    initialEntries?: string[]
    queryClient?: QueryClient
  } & Omit<RenderOptions, 'wrapper'> = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    )
  }

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions })
}

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }
export { default as userEvent } from '@testing-library/user-event'

// Mock user with different roles
export const mockUsers = {
  admin: {
    id: 'admin-id',
    email: 'admin@test.com',
    aud: 'authenticated',
    role: 'authenticated',
    created_at: new Date().toISOString(),
    app_metadata: {},
    user_metadata: { role: 'admin' },
  },
  propertyManager: {
    id: 'pm-id',
    email: 'pm@test.com',
    aud: 'authenticated',
    role: 'authenticated',
    created_at: new Date().toISOString(),
    app_metadata: {},
    user_metadata: { role: 'property_manager' },
  },
  tenant: {
    id: 'tenant-id',
    email: 'tenant@test.com',
    aud: 'authenticated',
    role: 'authenticated',
    created_at: new Date().toISOString(),
    app_metadata: {},
    user_metadata: { role: 'tenant' },
  },
}

// Mock properties
export const mockProperties = [
  {
    id: 'prop-1',
    address: '123 Test St',
    city: 'Test City',
    state: 'TS',
    zip_code: '12345',
    bedrooms: 2,
    bathrooms: 1,
    monthly_rent: 1200,
    status: 'active',
    type: 'property' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// Mock maintenance requests
export const mockMaintenanceRequests = [
  {
    id: 'maint-1',
    title: 'Leaky Faucet',
    description: 'Kitchen faucet is dripping',
    status: 'pending',
    priority: 'medium',
    property_id: 'prop-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]