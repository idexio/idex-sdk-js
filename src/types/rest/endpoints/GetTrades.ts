import type {
  OrderSide,
  RestRequestByMarket,
  RestRequestPaginationWithFromId,
} from '#index';

/**
 * Get Trades
 *
 * @see [API Documentation](https://api-docs-v1.kuma.bid/#get-trades)
 * @see response {@link RestResponseGetTrades}
 * @see type {@link KumaTrade}
 * @category Kuma - Get Trades
 */
export interface RestRequestGetTrades
  extends RestRequestPaginationWithFromId,
    RestRequestByMarket {
  /**
   * - Trades created at the same timestamp or after fromId
   *
   * @inheritDoc
   */
  fromId?: string;
  /**
   * - Max results to return from 1-1000
   *
   * @inheritDoc
   */
  limit?: number;
}

/**
 * Kuma Trade Response
 *
 * @see [API Documentation](https://api-docs-v1.kuma.bid/#get-trades)
 * @see request {@link RestRequestGetTrades}
 * @see response {@link RestResponseGetTrades}
 *
 * @category Kuma - Get Trades
 * @category Kuma Interfaces
 */
export interface KumaTrade {
  /** Trade identifier */
  fillId: string;
  /** Price of the trade in quote terms */
  price: string;
  /** Quantity of the trade in base terms */
  quantity: string;
  /** Quantity of the trade in quote terms */
  quoteQuantity: string;
  /** Timestamp of the trade */
  time: number;
  /**
   * Maker side of the trade, `buy` or `sell`
   *
   * @see {@link OrderSide}
   */
  makerSide: OrderSide;
  /** Fill sequence number of the trade */
  sequence: number;
}

/**
 * @see [API Documentation](https://api-docs-v1.kuma.bid/#get-trades)
 * @see type {@link KumaTrade}
 * @see request {@link RestRequestGetTrades}
 *
 * @category Kuma - Get Trades
 */
export type RestResponseGetTrades = KumaTrade[];
