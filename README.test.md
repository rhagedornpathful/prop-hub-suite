# Testing Guide

This project uses Vitest for unit and integration tests, and Playwright for end-to-end tests.

## Running Tests

### Unit & Integration Tests (Vitest)

```bash
# Run all tests in watch mode
npm test

# Run tests once (CI mode)
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

### End-to-End Tests (Playwright)

```bash
# Run e2e tests
npm run test:e2e

# Run e2e tests with UI
npm run test:e2e:ui
```

## Test Structure

```
src/tests/
├── setup.ts                    # Test setup and global mocks
├── utils/
│   ├── test-utils.tsx         # Custom render with providers
│   └── mockSupabase.ts        # Supabase mock utilities
├── auth/
│   └── AuthContext.test.tsx   # Authentication tests
├── components/
│   ├── RoleBasedAccess.test.tsx
│   └── ProtectedRoute.test.tsx
└── hooks/
    └── useUserRole.test.ts    # Role management tests
```

## Writing Tests

### Basic Component Test

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '../utils/test-utils';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Testing with Supabase

```tsx
import { mockSupabaseClient } from '../utils/mockSupabase';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabaseClient,
}));

// In your test
mockSupabaseClient.from.mockReturnValueOnce({
  select: vi.fn().mockResolvedValue({
    data: [{ id: 1, name: 'Test' }],
    error: null,
  }),
});
```

### Testing Role-Based Access

```tsx
vi.mock('@/hooks/useUserRole', () => ({
  useUserRole: () => ({
    effectiveRole: 'admin',
    isAdmin: () => true,
    getPermissions: () => ({ canManageProperties: true }),
  }),
}));
```

## Critical Test Coverage

The following areas have priority test coverage:

1. **Authentication Flow**
   - Login/logout
   - Session management
   - Protected routes

2. **Role-Based Access Control**
   - Permission checks for all roles (admin, property_manager, owner_investor, tenant, house_watcher, contractor, leasing_agent)
   - Role switching
   - View-as functionality
   - Navigation redirects based on role
   - Feature visibility per role

3. **Property Management**
   - CRUD operations
   - Assignments
   - Access control

4. **Maintenance Requests**
   - Creation and updates
   - Status transitions
   - Notifications

5. **Dashboard Rendering**
   - Role-specific views
   - Data loading
   - Error states

## Running Role-Based Tests

```bash
# Run all tests
npm test

# Run only role-based access tests
npm test roleBasedAccess

# Run only navigation tests
npm test roleNavigation

# Run with coverage
npm run test:coverage
```

## Role Test Matrix

| Role | Finances | Properties | House Watching | Admin Panel | Tenant Portal |
|------|----------|------------|----------------|-------------|---------------|
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ |
| Property Manager | ✅ | ✅ | ❌ | ❌ | ❌ |
| Owner/Investor | ✅ | ✅ | ❌ | ❌ | ❌ |
| Tenant | ❌ | ❌ | ❌ | ❌ | ✅ |
| House Watcher | ❌ | ❌ | ✅ | ❌ | ❌ |
| Contractor | ❌ | ❌ | ❌ | ❌ | ❌ |

## Best Practices

1. **Use Custom Render**: Always use `render` from `test-utils.tsx` to ensure all providers are included
2. **Mock Supabase**: Use `mockSupabaseClient` for consistent mocking
3. **Test User Interactions**: Use `@testing-library/user-event` for realistic user interactions
4. **Async Testing**: Use `waitFor` for async operations
5. **Accessibility**: Test with screen reader queries (`getByRole`, `getByLabelText`)

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Merges to main branch
- Pre-deployment

Coverage reports are generated and can be viewed in `coverage/` directory.
