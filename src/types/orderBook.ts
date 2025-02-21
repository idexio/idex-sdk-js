import type { OrderBookLevelType } from '#types/enums/response';

interface OrderBookBase {
  /**
   * Most recent order book update sequence number reflected in the returned snapshot
   */
  sequence: number;
  /**
   * Price of the last trade in quote terms
   */
  lastPrice: string | null; //
  /**
   * Mark price
   */
  markPrice: string | null;
  /**
   * Index price
   */
  indexPrice: string | null;
  bids: OrderBookLevelL1 | OrderBookLevelL2[];
  asks: OrderBookLevelL1 | OrderBookLevelL2[];
}

/**
 *
 *
 */
export type BestAvailablePriceLevels = {
  buyPrice: bigint;
  sellPrice: bigint;
};

/**
 * Level-1 order book data is limited to the best bid and ask for a market, including hybrid liquidity synthetic price levels.
 *
 * @see {@link https://api-docs-v1.kuma.bid/#get-order-books API Documentation}
 */
export interface L1OrderBook extends OrderBookBase {
  asks: OrderBookLevelL1;
  bids: OrderBookLevelL1;
}

/**
 * Level-2 order book data includes price and quantity information for all price levels in the order book.
 *
 * @see {@link https://api-docs-v1.kuma.bid/#get-order-books API Documentation}
 */
export interface L2OrderBook extends OrderBookBase {
  asks: OrderBookLevelL2[];
  bids: OrderBookLevelL2[];
}

/**
 *
 */
export type OrderBookFeesAndMinimums = {
  /**
   * Minimum order size that is accepted by the matching engine for execution in MATIC, applies to both MATIC and tokens
   */
  takerTradeMinimum: string;
};

/**
 *
 */
export interface OrderBookLevelL1 {
  price: bigint;
  size: bigint;
  numOrders: number;
}

/**
 *
 */
export interface OrderBookLevelL2 extends OrderBookLevelL1 {
  type: OrderBookLevelType;
}
