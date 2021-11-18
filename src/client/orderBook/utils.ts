import type { L1OrderBook, L2OrderBook, OrderBookLevelL2 } from '../../types';

/**
 * Determine whether two level 1 order books are equal, including pool reserves
 */
export function L1Equal(beforeL1: L1OrderBook, afterL1: L1OrderBook): boolean {
  return (
    beforeL1.asks.price === afterL1.asks.price &&
    beforeL1.bids.price === afterL1.bids.price &&
    beforeL1.asks.size === afterL1.asks.size &&
    beforeL1.bids.size === afterL1.bids.size &&
    beforeL1.asks.numOrders === afterL1.asks.numOrders &&
    beforeL1.bids.numOrders === afterL1.bids.numOrders &&
    beforeL1.pool?.baseReserveQuantity === afterL1.pool?.baseReserveQuantity &&
    beforeL1.pool?.quoteReserveQuantity === afterL1.pool?.quoteReserveQuantity
  );
}

/**
 * Updates a level 2 orderbook using a partial "diff" received over websockets
 *
 * @param {L2OrderBook} book
 * @param {L2OrderBook} updatedLevels
 * - level 2 orderbook containing only limit order price levels that have changed
 *
 * @returns {void} - orderbook is updated in-place
 */
export function updateL2Levels(
  book: L2OrderBook,
  updatedLevels: L2OrderBook,
): void {
  /* eslint-disable no-param-reassign */
  book.sequence = updatedLevels.sequence;
  book.asks = updateL2Side(true, book.asks, updatedLevels.asks);
  book.bids = updateL2Side(false, book.bids, updatedLevels.bids);
  book.pool = updatedLevels.pool;
  /* eslint-enable no-param-reassign */
}

/**
 * Applies a changeset to a single side of the orderbook
 *
 * @param {boolean} isAscending - true for asks, false for bids (ordering of price levels)
 * @param {OrderBookLevelL2[]} side
 * @param {OrderBookLevelL2[]} updates
 *
 * @returns {OrderBookLevelL2[]}
 */
function updateL2Side(
  isAscending: boolean,
  side: OrderBookLevelL2[],
  updates: OrderBookLevelL2[],
): OrderBookLevelL2[] {
  let nextUpdate = updates.shift();
  if (!nextUpdate) {
    return side;
  }

  const isBeforeOrEqual = function isBeforeOrEqual(
    a: OrderBookLevelL2,
    b: OrderBookLevelL2,
  ): boolean {
    if (isAscending && a.price <= b.price) {
      return true;
    }
    if (!isAscending && a.price >= b.price) {
      return true;
    }
    return false;
  };

  let lastPriceUpdated = BigInt(0);
  const newLevels: OrderBookLevelL2[] = [];

  for (const level of side) {
    // push all updated price levels prior to the existing level
    // skip any with no size, and no orders
    while (nextUpdate && isBeforeOrEqual(nextUpdate, level)) {
      if (nextUpdate.size > BigInt(0) && nextUpdate.numOrders > BigInt(0)) {
        newLevels.push(nextUpdate);
      }
      lastPriceUpdated = nextUpdate.price;
      nextUpdate = updates.shift();
    }
    // if the current level was not already updated, add it
    if (level.price !== lastPriceUpdated) {
      newLevels.push(level);
    }
  }

  // add all updates that go beyond the current end of the book
  while (
    nextUpdate &&
    nextUpdate.size > BigInt(0) &&
    nextUpdate.numOrders > BigInt(0)
  ) {
    newLevels.push(nextUpdate);
    nextUpdate = updates.shift();
  }

  return newLevels;
}
