/**
 * Estimates reading time for a given HTML or text string.
 * Based on average reading speed of 200 words per minute.
 */
export function readingTime(html: string): string {
  const words = html.replace(/<[^>]+>/g, '').trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

/**
 * Formats an ISO date string for display.
 */
export function formatDate(iso: string, locale = 'en-GB'): string {
  return new Date(iso).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Truncates a string to a given length, appending an ellipsis.
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length).trimEnd() + '…';
}
