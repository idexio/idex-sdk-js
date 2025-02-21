import type {
  OrderStatus,
  OrderType,
  OrderSide,
  TimeInForce,
  SelfTradePrevention,
  TriggerType,
  RestRequestByWallet,
  RestRequestPaginationWithFromId,
  KumaOrderFill,
  RestRequestByMarketOptional,
  RestAuthenticatedClient as _RestAuthenticatedClient,
} from '#index';

/**
 * Request parameters for making a request to get a single order from the API.
 *
 * @see request {@link _RestAuthenticatedClient.getOrder RestAuthenticatedClient.getOrder}
 *
 * @category Kuma - Get Orders
 */
export interface RestRequestGetOrder extends RestRequestByWallet {
  /**
   * Single orderId or clientOrderId to cancel; prefix client-provided ids with client:
   */
  orderId: `client:${string}` | string;
}

/**
 * Request parameters for getting multiple matching orders based on the provided parameters.
 *
 * @see request {@link _RestAuthenticatedClient.getOrders RestAuthenticatedClient.getOrders}
 *
 * @category Kuma - Get Orders
 */
export interface RestRequestGetOrders
  extends RestRequestByWallet,
    RestRequestPaginationWithFromId,
    RestRequestByMarketOptional {
  /**
   * - only applies if `orderId` is absent
   * - `false` only returns active orders on the order book
   * - `true` only returns orders that are no longer on the order book and resulted in at least one fill
   */
  closed?: boolean;
  orderId?: undefined;
}

/**
 * The standard order object.
 *
 * @category Kuma - Get Orders
 * @category Kuma Interfaces
 */
export interface KumaOrder {
  /** Market symbol as base-quote pair e.g. 'ETH-USD' */
  market: string;
  /** Exchange-assigned order identifier */
  orderId: string;
  /** Client-specified order identifier (if provided) */
  clientOrderId?: string;
  /** Address of the wallet which placed the order */
  wallet: string;
  /** Timestamp of initial order processing by the matching engine */
  time: number;
  /**
   * Current order status
   *
   * @see enum {@link OrderStatus}
   */
  status: OrderStatus;
  /**
   * Error short code explaining forced cancelation condition
   */
  errorCode?: string;
  /**
   * Error description explaining forced cancelation condition
   */
  errorMessage?: string;
  /**
   * OrderType
   *
   * @see enum {@link OrderType}
   */
  type: OrderType;
  /**
   * Order side, {@link OrderSide.buy buy} or {@link OrderSide.sell sell}
   *
   * @see enum {@link OrderSide}
   */
  side: OrderSide;
  /** Original quantity specified by the order in base terms */
  originalQuantity: string;
  /** Quantity that has been executed in base terms */
  executedQuantity: string;
  /**
   * Cumulative quantity that has been spent (buy orders) or received (sell orders) in quote terms.
   */
  cumulativeQuoteQuantity: string;
  /**
   * Weighted average price of fills associated with the order; only present with fills
   */
  avgExecutionPrice?: string;
  /**
   * Original price specified by the order in quote terms, omitted for all market orders
   */
  price?: string;
  /**
   * - Only allowed for certain order types mentioned below, omitted otherwise.
   *
   * Stop loss or take profit price for order types:
   *
   * - {@link OrderType.stopLossMarket stopLossMarket}
   * - {@link OrderType.stopLossLimit stopLossLimit}
   * - {@link OrderType.takeProfitMarket takeProfitMarket}
   * - {@link OrderType.takeProfitLimit takeProfitLimit}
   *
   * Activation price for order types:
   *
   * - {@link OrderType.trailingStopMarket trailingStopMarket}
   */
  triggerPrice?: string;
  /**
   * Price type for {@link triggerPrice}, last or index, only present when {@link triggerPrice} is defined
   *
   * @see enum {@link TriggerType}
   */
  triggerType?: Exclude<TriggerType, 'none'>;
  /**
   * **Internal:** Not yet available in production APIs.
   *
   * - Only applicable when {@link type} is {@link OrderType.trailingStopMarket trailingStopMarket}.
   *
   * @alpha
   * @internal
   */
  callbackRate?: string;
  /**
   * **Internal:** Not yet available in production APIs.
   *
   * - Only applicable to stop {@link OrderType order types}:
   *   - {@link OrderType.stopLossMarket stopLossMarket}
   *   - {@link OrderType.stopLossLimit stopLossLimit}
   *   - {@link OrderType.takeProfitMarket takeProfitMarket}
   *   - {@link OrderType.trailingStopMarket trailingStopMarket}
   * - Indicates an {@link orderId} of an open {@link OrderType.limit limit} order
   *   by the same wallet in the same market that must be filled before the stop becomes active.
   * - Canceling the conditional order also cancels the stop order.
   *
   * @alpha
   * @internal
   */
  conditionalOrderId?: string;
  /**
   * Reduce only orders are only accepted opposite open positions and only reduce an opposite position’s size
   */
  reduceOnly: boolean;
  /**
   * @see enum {@link TimeInForce}
   */
  timeInForce?: TimeInForce;
  /**
   * Self-trade prevention policy
   *
   * @see [API Documentation](https://api-docs-v1.kuma.bid/#self-trade-prevention)
   * @see enum {@link SelfTradePrevention}
   */
  selfTradePrevention: SelfTradePrevention;
  /**
   * Delegated key, if present
   *
   * @internal
   */
  delegatedKey?: string;
  /**
   * Array of order fill objects
   */
  fills?: KumaOrderFill[];

  /**
   * - When `true`, the order is a liquidation acquisition only order.
   * - These will not be included in get orders unless the request includes `isLiquidationAcquisitionOnly`
   *
   * @internal
   */
  isLiquidationAcquisitionOnly?: true | undefined;
}

type ConditionalOrdersMixin = {
  conditionalTakeProfitOrder?: KumaOrder & {
    type: typeof OrderType.takeProfitMarket;
  };
  conditionalStopLossOrder?: KumaOrder & {
    type: typeof OrderType.stopLossMarket;
  };
};

/**
 * @see type {@link KumaOrder}
 * @category Kuma - Get Orders
 */
export type RestResponseGetOrder = KumaOrder & ConditionalOrdersMixin;

/**
 * @see type {@link KumaOrder}
 * @category Kuma - Get Orders
 */
export type RestResponseGetOrders = (KumaOrder & ConditionalOrdersMixin)[];
