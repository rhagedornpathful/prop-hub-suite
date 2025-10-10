/**
 * Calculate occupancy rate as a percentage
 */
export function calculateOccupancyRate(occupiedUnits: number, totalUnits: number): number {
  if (totalUnits === 0) return 0;
  return Math.round((occupiedUnits / totalUnits) * 100);
}

/**
 * Calculate total from an array of items with a numeric property
 */
export function sumByProperty<T>(items: T[], property: keyof T): number {
  return items.reduce((sum, item) => {
    const value = item[property];
    return sum + (typeof value === 'number' ? value : 0);
  }, 0);
}

/**
 * Filter items by status
 */
export function filterByStatus<T extends { status: string }>(items: T[], status: string): T[] {
  return items.filter(item => item.status === status);
}

/**
 * Filter items by priority
 */
export function filterByPriority<T extends { priority: string }>(items: T[], priority: string): T[] {
  return items.filter(item => item.priority === priority);
}

/**
 * Count unread messages across conversations
 */
export function countUnreadMessages(conversations: Array<{ unread_count?: number }>): number {
  return conversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);
}
