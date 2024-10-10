import { CandleInterval } from '#types/enums/request';

const intervals = Object.values(CandleInterval);

/**
 * @see {@link RestRequestCancelOrdersByMarket}
 *
 * @internal
 */
export function isCandleInterval(value: unknown): value is CandleInterval {
  return intervals.includes(value as CandleInterval);
}
