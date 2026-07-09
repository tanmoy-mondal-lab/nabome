/**
 * Random selection utilities
 */

/**
 * Select a random item from an array
 * @param array - The array to select from
 * @returns A random item from the array
 */
export function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Select multiple random items from an array without duplicates
 * @param array - The array to select from
 * @param count - Number of items to select
 * @returns Array of random items
 */
export function randomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, array.length));
}

/**
 * Select a random item with weights
 * @param weightedItems - Array of items with weights
 * @returns A randomly selected item based on weights
 */
export function randomWeightedItem<T>(weightedItems: Array<{ item: T; weight: number }>): T {
  const totalWeight = weightedItems.reduce((sum, { weight }) => sum + weight, 0);
  let random = Math.random() * totalWeight;

  for (const { item, weight } of weightedItems) {
    random -= weight;
    if (random <= 0) return item;
  }

  return weightedItems[weightedItems.length - 1].item;
}

/**
 * Generate a random number within a range
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns Random number in range
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random float within a range
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (exclusive)
 * @returns Random float in range
 */
export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Generate a random boolean with optional probability
 * @param probability - Probability of true (default 0.5)
 * @returns Random boolean
 */
export function randomBoolean(probability: number = 0.5): boolean {
  return Math.random() < probability;
}

/**
 * Shuffle an array in place
 * @param array - The array to shuffle
 * @returns The shuffled array
 */
export function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
