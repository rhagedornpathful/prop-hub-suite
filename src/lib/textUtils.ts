/**
 * Smart text truncation utilities
 */

/**
 * Truncates text intelligently at word boundaries
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  
  // Find the last space within maxLength
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  // If there's a space, cut there; otherwise cut at maxLength
  const cutPoint = lastSpace > maxLength * 0.8 ? lastSpace : maxLength;
  
  return text.slice(0, cutPoint).trim() + '…';
}

/**
 * Truncates message preview with smart content detection
 */
export function truncateMessagePreview(text: string, maxLength: number = 100): string {
  if (!text) return '';
  
  // Remove excessive whitespace and newlines
  const cleaned = text.replace(/\s+/g, ' ').trim();
  
  // Detect and handle special content
  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
    return '🔗 Link';
  }
  
  if (cleaned.match(/^[\d\s\-\(\)\+]+$/)) {
    return '📞 ' + cleaned.slice(0, 20);
  }
  
  return truncateText(cleaned, maxLength);
}

/**
 * Removes HTML tags and entities from text
 */
export function stripHtml(html: string): string {
  if (!html) return '';
  
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/&[a-z]+;/gi, '') // Remove other HTML entities
    .trim();
}

/**
 * Extracts first meaningful sentence from text
 */
export function extractFirstSentence(text: string, maxLength: number = 150): string {
  if (!text) return '';
  
  const cleaned = stripHtml(text).trim();
  const firstSentence = cleaned.match(/^[^.!?]+[.!?]/)?.[0];
  
  if (firstSentence && firstSentence.length <= maxLength) {
    return firstSentence;
  }
  
  return truncateText(cleaned, maxLength);
}

/**
 * Highlights search terms in text
 */
export function highlightSearchTerms(text: string, searchTerm: string): string {
  if (!text || !searchTerm) return text;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

/**
 * Capitalizes first letter of each word
 */
export function titleCase(text: string): string {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
