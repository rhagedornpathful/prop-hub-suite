# Testing Guide

This project uses a comprehensive testing setup with multiple testing layers:

## Testing Stack

- **Unit Tests**: Vitest + Testing Library
- **Integration Tests**: React Query + Supabase mocking
- **E2E Tests**: Playwright
- **Coverage**: V8 provider

## Running Tests

```bash
# Run all unit and integration tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests in headed mode
npm run test:e2e:headed
```

## Test Structure

```
src/test/
├── components/     # Component unit tests
├── hooks/         # Custom hook tests
├── pages/         # Page component tests
├── e2e/           # End-to-end tests
├── integration/   # API integration tests
├── utils/         # Test utilities and helpers
└── setup.ts       # Test configuration
```

## Writing Tests

### Component Tests
```typescript
import { render, screen } from '../utils/test-utils'
import { MyComponent } from '@/components/MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### Hook Tests
```typescript
import { renderHook } from '@testing-library/react'
import { useMyHook } from '@/hooks/useMyHook'

describe('useMyHook', () => {
  it('returns expected value', () => {
    const { result } = renderHook(() => useMyHook())
    expect(result.current.value).toBe('expected')
  })
})
```

### E2E Tests
```typescript
import { test, expect } from '@playwright/test'

test('user can complete workflow', async ({ page }) => {
  await page.goto('/')
  await page.click('[data-testid="start-button"]')
  await expect(page.locator('.success')).toBeVisible()
})
```

## Test Utilities

The `test-utils.tsx` file provides:
- Custom render function with providers
- Mock users and data
- Common test helpers

## Mocking Strategy

- **Supabase**: Fully mocked in unit tests
- **React Router**: Mocked with MemoryRouter
- **Auth Context**: Mocked with test users
- **API Calls**: Mocked at the Supabase client level

## Coverage Goals

- **Components**: > 80%
- **Hooks**: > 90%
- **Critical Paths**: 100%
- **Overall**: > 80%

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Main branch pushes
- Release deployments

## Best Practices

1. **Test Behavior, Not Implementation**
2. **Use Test IDs for E2E Tests**
3. **Mock External Dependencies**
4. **Test Edge Cases and Error States**
5. **Keep Tests Isolated and Independent**
6. **Use Descriptive Test Names**
7. **Follow AAA Pattern (Arrange, Act, Assert)**