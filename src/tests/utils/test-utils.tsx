import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { DevAdminProvider } from '@/contexts/DevAdminContext';
import { ViewAsProvider } from '@/contexts/ViewAsContext';

// Create a test query client with no retries
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

interface AllTheProvidersProps {
  children: React.ReactNode;
  initialRoute?: string;
}

function AllTheProviders({ children, initialRoute = '/' }: AllTheProvidersProps) {
  const testQueryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={testQueryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <AuthProvider>
          <DevAdminProvider>
            <ViewAsProvider>
              {children}
            </ViewAsProvider>
          </DevAdminProvider>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { initialRoute?: string }
) => {
  const { initialRoute, ...renderOptions } = options || {};
  
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders initialRoute={initialRoute}>{children}</AllTheProviders>
    ),
    ...renderOptions,
  });
};

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

// Override render with custom version
export { customRender as render };
