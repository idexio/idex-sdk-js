import type * as idex from '@idexio/idex-sdk/types';

/**
 * - Rest Request: `GET /candles`
 *
 * @packageDocumentation
 */

/**
 * GET candles request interface
 *
 * @see response {@link RestResponseGetCandles}
 * @see type {@link KumaCandle}
 *
 * @category Kuma - Get Candles
 */
export interface RestRequestGetCandles
  extends idex.RestRequestPagination,
    idex.RestRequestByMarket {
  /**
   * Time interval for data
   *
   * - Use the {@link idex.CandleInterval CandleInterval} enum to get auto completion
   *   and inline documentation on the enumerations.
   *
   * @example
   * ```typescript
   * import { RestPublicClient, CandleInterval } from '@idexio/idex-sdk';
   *
   * const client = new RestPublicClient();
   *
   * const candles = await client.getCandles({
   *  market: 'ETH-USD',
   *  interval: CandleInterval.ONE_HOUR
   * })
   * ```
   *
   * <br />
   *
   * ---
   *
   * @see enum {@link idex.CandleInterval CandleInterval}
   */
  interval: idex.CandleInterval;
  /**
   * - Max results to return from 1-1000.
   *
   * @inheritDoc
   * @defaultValue 50
   */
  limit?: number;
  /**
   * Only allowed in strict cases and for internal use only.
   *
   * @internal
   */
  countBack?: number;
}

/**
 * Candle (OHLCV) data points aggregated by time interval
 *
 * - Candles only include values from `fills`, not `liquidations` or `ADLs`.
 *
 * @see request {@link RestRequestGetCandles}
 * @see response {@link RestResponseGetCandles}
 *
 * @category Kuma - Get Candles
 * @category Kuma Interfaces
 */
export interface KumaCandle {
  /**
   * Time of the start of the interval
   */
  start: number;
  /**
   * Price of the first trade in the interval in quote terms
   */
  open: string;
  /**
   * Price of the traded price in the interval in quote terms
   */
  high: string;
  /**
   * Price of the traded price in the interval in quote terms
   */
  low: string;
  /**
   * Price of the last trade in the interval in quote terms
   */
  close: string;
  /**
   * Trading volume in the interval in base terms, `null` for some historical chart data
   */
  baseVolume: string | null;
  /**
   * Trading volume in the interval in quote terms, `null` for some historical chart data
   */
  quoteVolume: string | null;
  /**
   * Number of trades in the interval, `null` for some historical chart data
   */
  trades: number | null;
  /**
   * Fill sequence number of the last trade in the interval, `null` for some historical chart data
   */
  sequence: number | null;
}

/**
 * Candle (OHLCV) data points aggregated by time interval
 *
 * - Candles only include values from `fills`: not `liquidations` or `ADLs`.
 *
 * @see type {@link KumaCandle}
 * @see request {@link RestRequestGetCandles}
 *
 * @category Kuma - Get Candles
 */
export type RestResponseGetCandles = KumaCandle[];
