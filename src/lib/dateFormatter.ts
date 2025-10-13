import { format as dateFnsFormat, formatDistance, formatRelative, isToday, isYesterday, isThisWeek, isThisYear, differenceInMinutes, differenceInHours, differenceInDays, formatDistanceToNow } from 'date-fns';

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

/**
 * ============= MESSAGING-SPECIFIC FORMATTERS =============
 */

/**
 * Format for message list (compact version optimized for inbox/conversation lists)
 */
export function formatMessageListTime(date: string | Date | null | undefined): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '';
  
  if (isToday(dateObj)) {
    return dateFnsFormat(dateObj, 'h:mm a');
  }
  
  if (isYesterday(dateObj)) {
    return 'Yesterday';
  }
  
  if (isThisWeek(dateObj)) {
    return dateFnsFormat(dateObj, 'EEE'); // "Mon"
  }
  
  if (isThisYear(dateObj)) {
    return dateFnsFormat(dateObj, 'MMM d'); // "Mar 15"
  }
  
  return dateFnsFormat(dateObj, 'M/d/yy'); // "3/15/23"
}

/**
 * Format for conversation header (shows when conversation was last active)
 */
export function formatConversationTime(date: string | Date | null | undefined): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '';
  
  const daysAgo = differenceInDays(new Date(), dateObj);
  
  if (daysAgo === 0) {
    return `Active today at ${dateFnsFormat(dateObj, 'h:mm a')}`;
  }
  
  if (daysAgo === 1) {
    return `Active yesterday at ${dateFnsFormat(dateObj, 'h:mm a')}`;
  }
  
  if (daysAgo < 7) {
    return `Active ${dateFnsFormat(dateObj, 'EEEE \'at\' h:mm a')}`;
  }
  
  return `Active ${dateFnsFormat(dateObj, 'MMM d \'at\' h:mm a')}`;
}

/**
 * Smart timestamp for message bubbles in conversation view
 */
export function formatMessageTimestamp(date: string | Date | null | undefined): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '';
  
  const now = new Date();
  const minutesAgo = differenceInMinutes(now, dateObj);
  const hoursAgo = differenceInHours(now, dateObj);
  
  // Just now (< 1 minute)
  if (minutesAgo < 1) {
    return 'Just now';
  }
  
  // Minutes ago (< 1 hour)
  if (minutesAgo < 60) {
    return `${minutesAgo} min ago`;
  }
  
  // Today
  if (isToday(dateObj)) {
    return `Today ${dateFnsFormat(dateObj, 'h:mm a')}`;
  }
  
  // Yesterday
  if (isYesterday(dateObj)) {
    return `Yesterday ${dateFnsFormat(dateObj, 'h:mm a')}`;
  }
  
  // This week
  if (isThisWeek(dateObj)) {
    return dateFnsFormat(dateObj, 'EEE h:mm a'); // "Mon 2:30 PM"
  }
  
  // This year
  if (isThisYear(dateObj)) {
    return dateFnsFormat(dateObj, 'MMM d, h:mm a'); // "Mar 15, 2:30 PM"
  }
  
  // Older
  return dateFnsFormat(dateObj, 'MMM d, yyyy'); // "Mar 15, 2023"
}

/**
 * Format duration between two dates for analytics
 */
export function formatDuration(startDate: Date, endDate: Date = new Date()): string {
  const minutes = differenceInMinutes(endDate, startDate);
  
  if (minutes < 1) return 'less than a minute';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''}`;
  
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''}`;
}
