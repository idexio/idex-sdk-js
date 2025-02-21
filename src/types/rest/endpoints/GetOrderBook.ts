import type { RestRequestByMarket, RestRequestPagination } from '#index';

/**
 * OrderBookPriceLevel
 *
 * - `price` and `size` as decimal strings
 * - `totalOrders` = # of limit orders at this price level (0 for synthetic levels)
 *
 * @example
 * ```typescript
 *  [ "202.01000000", "8.11400000", 0 ]
 * ```
 *
 * @category Kuma - Get OrderBook
 */
export type OrderBookPriceLevel = [
  price: string,
  size: string,
  totalOrders: number,
];

/**
 * <div>
 * [[include:base.md]]
 * </div>
 *
 * @category Base Types
 */
export interface GetOrderBookBase extends RestRequestByMarket {
  /**
   * Level of order book, `1` or `2`.
   *
   * @defaultValue `1`
   */
  level?: 1 | 2;
}

/**
 * GET Order Books
 *
 * @see related {@link OrderBookPriceLevel} (bids/asks)
 * @see level 1 - request  - {@link RestRequestGetOrderBookLevel1}
 * @see level 1 - response - {@link RestResponseGetOrderBookLevel1}
 * @see level 2 - request  - {@link RestRequestGetOrderBookLevel2}
 * @see level 2 - response - {@link RestResponseGetOrderBookLevel2}
 *
 * @category Kuma - Get OrderBook
 */
export interface RestRequestGetOrderBookLevel1 extends GetOrderBookBase {
  /**
   * - Not required & ignored when using the Kuma SDK, and is already defaulted
   *   to level 1 when using the REST API.
   *
   * @inheritDoc
   */
  level?: 1;
}

/**
 * GET Order Books
 *
 * @see related {@link OrderBookPriceLevel} (bids/asks)
 * @see level 1 - request  - {@link RestRequestGetOrderBookLevel1}
 * @see level 1 - response - {@link RestResponseGetOrderBookLevel1}
 * @see level 2 - request  - {@link RestRequestGetOrderBookLevel2}
 * @see level 2 - response - {@link RestResponseGetOrderBookLevel2}
 *
 * @category Kuma - Get OrderBook
 */
export interface RestRequestGetOrderBookLevel2
  extends GetOrderBookBase,
    Pick<RestRequestPagination, 'limit'> {
  /**
   * - Not required & ignored when using the Kuma SDK, but required when using the REST API directly
   *   as it normally will default to level 1.
   *
   * @inheritDoc
   */
  level?: 2;
  /**
   * - Number of `bids` and `asks` to return, only applicable for `level: 2` data.
   * - `0` returns maximum of `500` price levels per side
   *
   * @inheritDoc
   * @defaultValue 50
   */
  limit?: number;
}

/**
 * The Base OrderBook response which matches both level 1 and level 2 orderbook
 * responses.
 *
 * @see related {@link OrderBookPriceLevel} (bids/asks)
 * @see level 1 - request  - {@link RestRequestGetOrderBookLevel1}
 * @see level 1 - response - {@link RestResponseGetOrderBookLevel1}
 * @see level 2 - request  - {@link RestRequestGetOrderBookLevel2}
 * @see level 2 - response - {@link RestResponseGetOrderBookLevel2}
 *
 * @category Kuma - Get OrderBook
 * @category Kuma Interfaces
 */
export interface KumaOrderBook {
  /**
   * Most recent order book update sequence number reflected in the returned snapshot
   */
  sequence: number;
  /**
   * Price of the last trade in quote terms
   */
  lastPrice: string | null;
  /**
   * Mark price
   */
  markPrice: string | null;
  /**
   * Index price
   */
  indexPrice: string | null;
  /**
   * One or more bids depending on the Orderbook Level
   *
   * @see type {@link OrderBookPriceLevel}
   */
  bids: OrderBookPriceLevel[];
  /**
   * One or more asks depending on the Orderbook Level
   *
   * @see type {@link OrderBookPriceLevel}
   */
  asks: OrderBookPriceLevel[];
}

/**
 * Level-1 order book data is limited to the best bid and ask for a market, including hybrid liquidity synthetic price levels.
 *
 * @see [API Documentation](https://api-docs-v1.kuma.bid/#get-order-books)
 * @see related {@link OrderBookPriceLevel} (bids/asks)
 * @see type {@link KumaOrderBook}
 * @see level 1 - request  - {@link RestRequestGetOrderBookLevel1}
 * @see level 1 - response - {@link RestResponseGetOrderBookLevel1}
 * @see level 2 - request  - {@link RestRequestGetOrderBookLevel2}
 * @see level 2 - response - {@link RestResponseGetOrderBookLevel2}
 *
 * @category Kuma - Get OrderBook
 */
export interface RestResponseGetOrderBookLevel1 extends KumaOrderBook {
  /**
   * - Level-1 order book data is limited to the best bid and ask for a market
   * @inheritDoc
   */
  bids: [OrderBookPriceLevel] | [];
  /**
   * - Level-1 order book data is limited to the best bid and ask for a market
   * @inheritDoc
   */
  asks: [OrderBookPriceLevel] | [];
}

/**
 * Level-2 order book data includes price and quantity information for all price levels in the order book.
 *
 * @see [API Documentation](https://api-docs-v1.kuma.bid/#get-order-books)
 * @see type {@link KumaOrderBook}
 * @see related {@link OrderBookPriceLevel} (bids/asks)
 * @see level 1 - request  - {@link RestRequestGetOrderBookLevel1}
 * @see level 1 - response - {@link RestResponseGetOrderBookLevel1}
 * @see level 2 - request  - {@link RestRequestGetOrderBookLevel2}
 * @see level 2 - response - {@link RestResponseGetOrderBookLevel2}
 *
 * @category Kuma - Get OrderBook
 */
export interface RestResponseGetOrderBookLevel2 extends KumaOrderBook {
  /**
   * - Level-2 order book data includes price and quantity information for all price levels in the order book.
   * @inheritDoc
   */
  bids: OrderBookPriceLevel[];
  /**
   * - Level-2 order book data includes price and quantity information for all price levels in the order book.
   * @inheritDoc
   */
  asks: OrderBookPriceLevel[];
}
