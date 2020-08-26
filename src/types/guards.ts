import { CandleInterval } from './enums';

const intervals = Object.keys(CandleInterval);

/**
 * A type guard which checks if a string is a valid candle interval.
 *
 * @property {string} value - The subscription to check
 */
export function isCandleInterval(value: unknown): value is CandleInterval {
  return intervals.includes(value as string);
}
