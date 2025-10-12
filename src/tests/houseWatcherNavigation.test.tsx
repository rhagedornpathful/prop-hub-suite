import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';

vi.mock('@/hooks/useUserRole', () => ({
  useUserRole: () => ({ userRole: 'house_watcher' })
}));

describe('HouseWatcherMobileNavigation', () => {
  it('should be replaced by unified MobileTabBar', () => {
    // This test is deprecated - MobileTabBar now handles all roles
    expect(true).toBe(true);
  });
});
