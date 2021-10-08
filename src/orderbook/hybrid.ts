import type { L1OrderBook, L2OrderBook } from '../types';

import {
  calculateSyntheticPriceLevels,
  L1L2OrderBooksWithMinimumTaker,
  recalculateHybridLevelAmounts,
  sortAndMergeLevelsUnadjusted,
} from './quantities';

import { L2toL1OrderBook } from './utils';

/**
 * Convert a limit-order orderbook and a liquidity pool to a hybrid order book representation
 *
 * @param {L2OrderBook} orderBook - L2 book, e.g. from GET /v1/orderbook?level=2&limitOrderOnly=true
 * @param {number} visibleLevels - number of price levels to calculate, default = 10 asks, 10 bids
 * @param {number} visibleSlippage - price slippage per level, in increments of 0.001%, default = 100 (0.1%)
 * @param {bigint} idexFeeRate - trade fee rate charged by IDEX, expressed in pips
 * @param {bigint} poolFeeRate - pool fee rate chared by liquidity pool, expressed in pips
 * @param {boolean} includeMinimumTakerLevels - if true, calculate a synthetic price level at twice the minimum trade size
 * @param {bigint | null} minimumTakerInQuote - minimum trade size expressed in pips, or null if none available
 */
export function L2LimitOrderBookToHybridOrderBooks(
  orderBook: L2OrderBook,
  visibleLevels = 10,
  visibleSlippage = 100,
  idexFeeRate: bigint,
  poolFeeRate: bigint,
  includeMinimumTakerLevels: boolean,
  minimumTakerInQuote: bigint | null,
): { l1: L1OrderBook; l2: L2OrderBook } {
  if (!orderBook.pool) {
    return { l1: L2toL1OrderBook(orderBook), l2: orderBook };
  }

  const synthetic = calculateSyntheticPriceLevels(
    orderBook.pool.baseReserveQuantity,
    orderBook.pool.quoteReserveQuantity,
    visibleLevels,
    visibleSlippage,
    idexFeeRate,
    poolFeeRate,
  );

  // need to make a deep copy of asks and bids because they will be modified
  const limitAsksCopy = orderBook.asks.map((order) => {
    return { ...order };
  });
  const limitBidsCopy = orderBook.bids.map((order) => {
    return { ...order };
  });

  const adjustedL2OrderBook = recalculateHybridLevelAmounts(
    {
      sequence: orderBook.sequence,
      asks: sortAndMergeLevelsUnadjusted(
        limitAsksCopy,
        synthetic.asks,
        (a, b) => a.price <= b.price,
      ),
      bids: sortAndMergeLevelsUnadjusted(
        limitBidsCopy,
        synthetic.bids,
        (a, b) => a.price >= b.price,
      ),
      pool: {
        baseReserveQuantity: orderBook.pool.baseReserveQuantity,
        quoteReserveQuantity: orderBook.pool.quoteReserveQuantity,
      },
    },
    idexFeeRate,
    poolFeeRate,
  );

  return includeMinimumTakerLevels &&
    minimumTakerInQuote &&
    minimumTakerInQuote > BigInt(0)
    ? L1L2OrderBooksWithMinimumTaker(
        adjustedL2OrderBook,
        idexFeeRate,
        poolFeeRate,
        minimumTakerInQuote,
      )
    : { l1: L2toL1OrderBook(adjustedL2OrderBook), l2: adjustedL2OrderBook };
}
