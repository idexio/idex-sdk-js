import type { L1OrderBook, L2OrderBook, OrderBookLevelL2 } from '../types';

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
 * Derive the level 1 orderbook from a level 2 orderbook
 */
export function L2toL1OrderBook(l2: L2OrderBook): L1OrderBook {
  return {
    sequence: l2.sequence,
    asks: l2.asks.length
      ? {
          price: l2.asks[0].price,
          size: l2.asks[0].size,
          numOrders: l2.asks[0].numOrders,
        }
      : { price: BigInt(0), size: BigInt(0), numOrders: 0 },
    bids: l2.bids.length
      ? {
          price: l2.bids[0].price,
          size: l2.bids[0].size,
          numOrders: l2.bids[0].numOrders,
        }
      : { price: BigInt(0), size: BigInt(0), numOrders: 0 },
    pool: l2.pool,
  };
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

  const isBefore = function isBefore(
    a: OrderBookLevelL2,
    b: OrderBookLevelL2,
  ): boolean {
    if (isAscending && a.price < b.price) {
      return true;
    }
    if (!isAscending && a.price > b.price) {
      return true;
    }
    return false;
  };

  const newLevels: OrderBookLevelL2[] = [];

  side.forEach((level: OrderBookLevelL2) => {
    // add all new updates before the existing level
    while (nextUpdate && isBefore(nextUpdate, level)) {
      newLevels.push(nextUpdate);
      nextUpdate = updates.shift();
    }

    // add either the next update (if overwriting), or the next level
    if (nextUpdate && level.price === nextUpdate.price) {
      if (nextUpdate.size > BigInt(0)) {
        newLevels.push(nextUpdate);
      }
      nextUpdate = updates.shift();
    } else {
      newLevels.push(level);
    }
  });

  // add all updates that go beyond the end
  while (nextUpdate) {
    newLevels.push(nextUpdate);
    nextUpdate = updates.shift();
  }

  return newLevels;
}
