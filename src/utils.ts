export const isNode =
  typeof process !== 'undefined' &&
  process.versions != null &&
  process.versions.node != null;

/**
 * Filter out any undefined values from an array using `Array.filter` so that
 * TypeScript understands.
 */
export function isDefinedFilter<T>(value: T | undefined): value is T {
  return typeof value !== 'undefined';
}
