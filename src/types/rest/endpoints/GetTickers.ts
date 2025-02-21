import type { RestRequestByMarketOptional } from '#index';

/**
 * Get Tickers
 *
 * @see response {@link RestResponseGetTickers}
 * @see type {@link KumaTicker}
 *
 * @category Kuma - Get Tickers
 */
export interface RestRequestGetTickers extends RestRequestByMarketOptional {}

/**
 * Kuma Ticker Response
 *
 * Response to `GET /v1/tickers`
 *
 * @see docs     [API Documentation: Get Tickers](https://api-docs-v1.kuma.bid/#get-tickers)
 * @see response {@link RestResponseGetTickers}
 * @see request  {@link RestRequestGetTickers}
 *
 * @category Kuma - Get Tickers
 * @category Kuma Interfaces
 */
export interface KumaTicker {
  /** Market symbol */
  market: string;
  /**
   * Timestamp when the statistics were computed; the opening time of the period
   * is 24 hours prior
   */
  time: number;
  /**
   * Price of the first trade in the period in quote terms
   */
  open: string | null;
  /**
   * Highest traded price in the period in quote terms
   */
  high: string | null;
  /**
   * Lowest traded price in the period in quote terms
   */
  low: string | null;
  /**
   * Price of the last trade in the period in quote terms
   */
  close: string | null;
  /**
   * Quantity of the last trade in the period in base terms
   */
  closeQuantity: string | null;
  /**
   * Trailing 24-hour trading volume in base terms
   */
  baseVolume: string;
  /**
   * Trailing 24-hour trading volume in quote terms
   */
  quoteVolume: string;
  /**
   * Percentage change from open price to close price,
   *
   * - in decimal notation with 8 decimals. For example, `1.00%` is expressed as `0.01000000`.
   * - `null` if we do not have an {@link open} and {@link close} price.
   */
  percentChange: string | null;
  /**
   * Number of trades in the period
   */
  trades: number;
  /**
   * Best ask price on the order book in quote terms
   */
  ask: string | null;
  /**
   * Best bid price on the order book in quote terms
   */
  bid: string | null;

  /**
   * Current mark price
   */
  markPrice: string | null;
  /**
   * Current index price
   */
  indexPrice: string | null;
  /**
   * Index price 24h ago
   */
  indexPrice24h: string | null;
  /**
   * Percentage change in index price from 24h ago to current.
   *
   * - `1.00%` is expressed as `0.01000000`
   */
  indexPricePercentChange: string | null;
  /**
   * Funding rate of the last payment.
   *
   * - `1.00%` is expressed as `0.01000000`
   */
  lastFundingRate: string | null;
  /**
   * Current funding rate
   *
   * - `1.00%` is expressed as `0.01000000`
   */
  currentFundingRate: string | null;
  /**
   * Time of the next funding payment
   */
  nextFundingTime: number;
  /**
   * Current open interest
   */
  openInterest: string;

  /**
   * Fill sequence number of the last trade in the period
   */
  sequence: number | null;
}

/**
 * @see type {@link KumaTicker}
 * @see request {@link RestRequestGetTickers}
 *
 * @category Kuma - Get Tickers
 */
export type RestResponseGetTickers = KumaTicker[];
