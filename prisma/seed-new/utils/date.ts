/**
 * Date generation utilities
 */

/**
 * Generate a random date within a range
 * @param start - Start date
 * @param end - End date
 * @returns Random date between start and end
 */
export function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

/**
 * Generate a random date in the past
 * @param daysBack - Maximum days back from now (default 365)
 * @returns Random date in the past
 */
export function randomPastDate(daysBack: number = 365): Date {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - daysBack);
  return randomDate(start, end);
}

/**
 * Generate a random date in the future
 * @param daysForward - Maximum days forward from now (default 365)
 * @returns Random date in the future
 */
export function randomFutureDate(daysForward: number = 365): Date {
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + daysForward);
  return randomDate(start, end);
}

/**
 * Generate a random date within the last N days
 * @param days - Number of days to look back
 * @returns Random date within the specified range
 */
export function recentDate(days: number = 30): Date {
  return randomPastDate(days);
}

/**
 * Add days to a date
 * @param date - The base date
 * @param days - Number of days to add
 * @returns New date with days added
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Subtract days from a date
 * @param date - The base date
 * @param days - Number of days to subtract
 * @returns New date with days subtracted
 */
export function subtractDays(date: Date, days: number): Date {
  return addDays(date, -days);
}

/**
 * Get a date at the start of day
 * @param date - The date
 * @returns Date at midnight (00:00:00)
 */
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get a date at the end of day
 * @param date - The date
 * @returns Date at end of day (23:59:59.999)
 */
export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}
