import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges class names intelligently using clsx and tailwind-merge
 * This ensures that Tailwind CSS classes are properly merged and conflicting classes are resolved
 * 
 * @param inputs - Class names, objects, arrays, or other clsx-compatible values
 * @returns Merged class name string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}