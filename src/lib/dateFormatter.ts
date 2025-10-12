import { format as dateFnsFormat, formatDistance, formatRelative, isToday, isYesterday, isThisWeek, isThisYear } from 'date-fns';

/**
 * Standardized date formatting utilities for consistent display across the app
 */

export const DATE_FORMATS = {
  // Full formats
  FULL: 'MMMM d, yyyy h:mm a',        // January 15, 2024 3:45 PM
  FULL_DATE: 'MMMM d, yyyy',          // January 15, 2024
  
  // Medium formats  
  MEDIUM: 'MMM d, yyyy h:mm a',       // Jan 15, 2024 3:45 PM
  MEDIUM_DATE: 'MMM d, yyyy',         // Jan 15, 2024
  MEDIUM_TIME: 'MMM d, h:mm a',       // Jan 15, 3:45 PM
  
  // Short formats
  SHORT: 'M/d/yy',                    // 1/15/24
  SHORT_WITH_TIME: 'M/d/yy h:mm a',   // 1/15/24 3:45 PM
  
  // Time only
  TIME: 'h:mm a',                     // 3:45 PM
  TIME_24H: 'HH:mm',                  // 15:45
  
  // Month and year
  MONTH_YEAR: 'MMMM yyyy',            // January 2024
  MONTH_YEAR_SHORT: 'MMM yyyy',       // Jan 2024
  
  // Day and month
  DAY_MONTH: 'MMM d',                 // Jan 15
} as const;

/**
 * Format a date using a standard format
 */
export function formatDate(
  date: Date | string | number,
  formatType: keyof typeof DATE_FORMATS = 'MEDIUM_DATE'
): string {
  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' 
      ? new Date(date) 
      : date;
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    
    return dateFnsFormat(dateObj, DATE_FORMATS[formatType]);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid date';
  }
}

/**
 * Format a date relative to now (e.g., "2 hours ago", "in 3 days")
 */
export function formatRelativeDate(date: Date | string | number): string {
  try {
    const dateObj = typeof date === 'string' || typeof date === 'number'
      ? new Date(date)
      : date;
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    
    return formatDistance(dateObj, new Date(), { addSuffix: true });
  } catch (error) {
    console.error('Relative date formatting error:', error);
    return 'Invalid date';
  }
}

/**
 * Smart date formatter that shows relative dates for recent items
 * and absolute dates for older items
 */
export function formatSmartDate(date: Date | string | number): string {
  try {
    const dateObj = typeof date === 'string' || typeof date === 'number'
      ? new Date(date)
      : date;
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    
    // For dates within the last 7 days, show relative time
    const daysDiff = Math.floor((Date.now() - dateObj.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 7) {
      if (isToday(dateObj)) {
        return `Today at ${dateFnsFormat(dateObj, DATE_FORMATS.TIME)}`;
      }
      if (isYesterday(dateObj)) {
        return `Yesterday at ${dateFnsFormat(dateObj, DATE_FORMATS.TIME)}`;
      }
      if (isThisWeek(dateObj)) {
        return formatRelative(dateObj, new Date()).replace('last ', '');
      }
    }
    
    // For older dates, show formatted date
    if (isThisYear(dateObj)) {
      return dateFnsFormat(dateObj, DATE_FORMATS.MEDIUM_TIME);
    }
    
    return dateFnsFormat(dateObj, DATE_FORMATS.MEDIUM);
  } catch (error) {
    console.error('Smart date formatting error:', error);
    return 'Invalid date';
  }
}

/**
 * Format timestamp for display (created_at, updated_at fields)
 */
export function formatTimestamp(timestamp: string | Date | null | undefined): string {
  if (!timestamp) return 'N/A';
  return formatDate(timestamp, 'MEDIUM');
}

/**
 * Format timestamp for activity feeds and lists
 */
export function formatActivityDate(timestamp: string | Date): string {
  return formatSmartDate(timestamp);
}

/**
 * Format date range
 */
export function formatDateRange(
  startDate: Date | string,
  endDate: Date | string,
  formatType: keyof typeof DATE_FORMATS = 'MEDIUM_DATE'
): string {
  try {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 'Invalid date range';
    }
    
    return `${formatDate(start, formatType)} - ${formatDate(end, formatType)}`;
  } catch (error) {
    console.error('Date range formatting error:', error);
    return 'Invalid date range';
  }
}
