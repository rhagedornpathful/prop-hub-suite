/**
 * Standardized icon size system for consistent visual hierarchy
 * Use these constants throughout the app instead of hard-coded sizes
 */

export const ICON_SIZES = {
  // Micro icons for badges, chips, inline text
  xs: 'h-3 w-3',
  
  // Small icons for buttons, list items, secondary actions
  sm: 'h-4 w-4',
  
  // Default icons for navigation, form fields, most UI elements
  md: 'h-5 w-5',
  
  // Large icons for headers, feature cards, emphasis
  lg: 'h-6 w-6',
  
  // Extra large for hero sections, empty states
  xl: 'h-8 w-8',
  
  // Massive icons for marketing, landing pages
  '2xl': 'h-12 w-12',
} as const;

export type IconSize = keyof typeof ICON_SIZES;

/**
 * Get icon size class by name
 * @example getIconSize('md') // returns 'h-5 w-5'
 */
export function getIconSize(size: IconSize = 'md'): string {
  return ICON_SIZES[size];
}

/**
 * Usage guidelines:
 * - xs (h-3 w-3): Inline badges, status indicators, tiny chips
 * - sm (h-4 w-4): Button icons, list item icons, table cells
 * - md (h-5 w-5): Default for nav items, form labels, cards
 * - lg (h-6 w-6): Section headers, feature highlights
 * - xl (h-8 w-8): Empty states, loading spinners
 * - 2xl (h-12 w-12): Hero sections, major visual elements
 */
