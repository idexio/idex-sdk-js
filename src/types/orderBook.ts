import type { MultiverseChain } from './enums';

/**
 * @typedef {Object} BestAvailablePriceLevels
 * @property {bigint} baseReceived - actual quantity received, in base units at the best available buy price
 * @property {bigint} bestAvailableBuyPrice - best available price for buy orders of the minimum size
 * @property {bigint} bestAvailableSellPrice - best available price for sell orders of the minimum size
 * @property {bigint} quoteReceived - actual quantity received, in quote units at the best available sell price
 */
export type BestAvailablePriceLevels = {
  buyPrice: bigint;
  sellPrice: bigint;
};

/**
 * @typedef {Object} L1OrderBook
 * @property {number} sequence
 * @property {OrderBookLevelL1} asks
 * @property {OrderBookLevelL1} bids
 * @property {PoolReserveQuantities | null} pool
 */
export type L1OrderBook = {
  sequence: number;
  asks: OrderBookLevelL1;
  bids: OrderBookLevelL1;
  pool: PoolReserveQuantities | null;
};

/**
 * @typedef {Object} L2OrderBook
 * @property {number} sequence
 * @property {OrderBookLevelL2[]} asks
 * @property {OrderBookLevelL2[]} bids
 * @property {PoolReserveQuantities | null} pool
 */
export type L2OrderBook = {
  sequence: number;
  asks: OrderBookLevelL2[];
  bids: OrderBookLevelL2[];
  pool: null | PoolReserveQuantities;
};

/**
 * @typedef {Object} OrderBookFeesAndMinimums
 * @property {string} takerIdexFeeRate - Taker trade fee rate collected by IDEX; used in computing synthetic price levels for real-time order books
 * @property {string} takerLiquidityProviderFeeRate - Taker trade fee rate collected by liquidity providers; used in computing synthetic price levels for real-time order books
 * @property {string} takerTradeMinimum - Minimum order size that is accepted by the matching engine for execution in MATIC, applies to both MATIC and tokens
 *
 * See {@link RestResponseExchangeInfo}
 */
export type OrderBookFeesAndMinimums = {
  takerIdexFeeRate: string;
  takerLiquidityProviderFeeRate: string;
  takerTradeMinimum: string;
};

/**
 * @typedef {Object} OrderBookLevelType
 */
export type OrderBookLevelType = 'limit' | 'pool';

/**
 * @typedef {Object} OrderBookLevelL1
 * @property {bigint} price
 * @property {bigint} size
 * @property {number} numOrders
 */
export type OrderBookLevelL1 = {
  price: bigint;
  size: bigint;
  numOrders: number;
};

/**
 * @typedef {Object} OrderBookLevelL2
 * @property {bigint} price
 * @property {bigint} size
 * @property {number} numOrders
 * @property {OrderBookLevelType} type
 */
export type OrderBookLevelL2 = OrderBookLevelL1 & {
  type: OrderBookLevelType;
};

/**
 * @typedef {Object} PoolReserveQuantities
 * @property {bigint} baseReserveQuantity
 * @property {bigint} quoteReserveQuantity
 */
export type PoolReserveQuantities = {
  baseReserveQuantity: bigint;
  quoteReserveQuantity: bigint;
};

/**
 * @typedef {Object} PriceLevelQuantities
 * @property {bigint} grossBase
 * @property {bigint} grossQuote
 */
export type PriceLevelQuantities = { grossBase: bigint; grossQuote: bigint };

export type SyntheticL2OrderBook = Omit<L2OrderBook, 'sequence'>;
