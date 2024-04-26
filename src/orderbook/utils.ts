import type { L1OrderBook, L2OrderBook } from '#types/orderBook';

/**
 * Derive the level 1 orderbook from a level 2 orderbook
 *
 * @internal
 */
export function L2toL1OrderBook(l2: L2OrderBook): L1OrderBook {
  return {
    ...l2,
    asks:
      l2.asks.length ?
        {
          price: l2.asks[0].price,
          size: l2.asks[0].size,
          numOrders: l2.asks[0].numOrders,
        }
      : { price: BigInt(0), size: BigInt(0), numOrders: 0 },
    bids:
      l2.bids.length ?
        {
          price: l2.bids[0].price,
          size: l2.bids[0].size,
          numOrders: l2.bids[0].numOrders,
        }
      : { price: BigInt(0), size: BigInt(0), numOrders: 0 },
  };
}
