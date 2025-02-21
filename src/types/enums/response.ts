import {
  SubscriptionNameAuthenticated,
  SubscriptionNamePublic,
} from '#types/enums/request';

import type * as _types from '#index';

/**
 *  Using these objects we can construct appropriate enum with auto completion and information
 *  on each available option, if that makes sense.
 *
 *  @packageDocumentation
 */

/**
 * @category Enums - Response Properties
 * @enum
 *
 * @see related {@link _types.KumaPosition KumaPosition Interface}
 */
export const PositionSide = Object.freeze({
  long: 'long',
  short: 'short',
  none: 'none',
} as const);

export type PositionSide = (typeof PositionSide)[keyof typeof PositionSide];

/**
 * Specialized fill types which do not include orders and may produce different
 * messaging / types in various places within the code.
 */
export const FillTypeSystem = Object.freeze({
  /**
   * Position closures resulting from forced liquidation or ADL.
   */
  liquidation: 'liquidation',
  /**
   * Position closure as the counterparty to an ADL action.
   */
  deleverage: 'deleverage',
  /**
   * Position closures resulting from forced dust liquidation.
   */
  closure: 'closure',
} as const);

export type FillTypeSystem =
  (typeof FillTypeSystem)[keyof typeof FillTypeSystem];

/**
 * Fill types associated with an order.
 */
export const FillTypeOrder = Object.freeze({
  /**
   * Fills resulting from any type of market order.
   */
  market: 'market',
  /**
   * Fills resulting from any type of limit order.
   */
  limit: 'limit',
} as const);

export type FillTypeOrder = (typeof FillTypeOrder)[keyof typeof FillTypeOrder];

/**
 * Whether the fill increases or decreases the notional value of the position.
 *
 * - Includes {@link FillTypeSysem} properties which may produce different
 *   message types in places like the WebSocket API.
 *
 * @category Enums - Response Properties
 * @enum
 */
export const FillType = Object.freeze({
  ...FillTypeOrder,
  ...FillTypeSystem,
});

export type FillType = (typeof FillType)[keyof typeof FillType];

/**
 * @category Enums - Response Properties
 * @enum
 */
export const FillAction = Object.freeze({
  open: 'open',
  close: 'close',
  closeAndOpen: 'closeAndOpen',
} as const);

export type FillAction = (typeof FillAction)[keyof typeof FillAction];

/**
 * Order state is included in all order endpoint responses. Orders are not guaranteed to enter the open state before
 * reporting as another state. For example, a limit order that is completely filled on execution first reports in the
 * filled state in endpoint responses.
 *
 * @category Enums - Response Properties
 * @enum
 *
 * @see related {@link _types.KumaOrder KumaOrder Interface}
 * @see docs    [API Documentation - Order States & Lifecycle](https://api-docs-v1.kuma.bid/#order-states-amp-lifecycle)
 */
export const OrderStatus = Object.freeze({
  /**
   * Stop order exists on the order book
   */
  active: 'active',
  /**
   * Limit order was canceled prior to execution completion but may be partially filled
   */
  canceled: 'canceled',
  /**
   * Limit order is completely filled and is no longer on the book; market order was filled
   */
  filled: 'filled',
  /**
   * Conditional and trailing stop orders that have not yet entered the active state
   */
  inactive: 'inactive',
  /**
   * Order ID to cancel was not found
   */
  notFound: 'notFound',
  /**
   * Limit order exists on the order book
   */
  open: 'open',
  /**
   * Limit order has completed fills but has remaining open quantity
   */
  partiallyFilled: 'partiallyFilled',
} as const);

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

/**
 * @category Enums - Response Properties
 * @enum
 */
export const OrderStateChange = Object.freeze({
  /**
   * An order without a stop has been accepted into the trading engine.
   * Will not be sent as a discrete change event if the order matches on execution.
   */
  new: 'new',
  /**
   * A stop order has been accepted into the trading engine. Once triggered, it
   * will go through other normal events starting with "new".
   */
  activated: 'activated',
  /**
   * A conditional or trailing stop order has been accepted into the trading
   * engine, but has not yet entered the active state. Once activated, it
   * will go through other stop order events starting with "activated".
   *
   * @internal
   */
  accepted: 'accepted',
  /**
   * An order has generated a fill, both on maker and taker sides.
   * Will be the first change event sent if an order matches on execution.
   */
  fill: 'fill',
  /**
   * An order is canceled by the user.
   */
  canceled: 'canceled',
  /**
   * LIMIT FOK orders with no fill, LIMIT IOC or MARKET orders that partially fill, GTT orders past time.
   */
  expired: 'expired',
} as const);

export type OrderStateChange =
  (typeof OrderStateChange)[keyof typeof OrderStateChange];

/**
 * @category Enums - Response Properties
 * @enum
 */
export const MarketStatus = Object.freeze({
  /**
   * No orders or cancels accepted
   */
  inactive: 'inactive',
  /**
   * Cancels accepted but not trades
   */
  cancelsOnly: 'cancelsOnly',
  /**
   * Cancels and gtx orders only
   */
  limitMakerOnly: 'limitMakerOnly',
  /**
   * Trades and cancels accepted
   */
  active: 'active',
  /**
   * Hybrid trades and cancels accepted
   */
  activeHybrid: 'activeHybrid',
} as const);

export type MarketStatus = (typeof MarketStatus)[keyof typeof MarketStatus];

/**
 * @category Enums - Response Properties
 * @enum
 *
 * @see related {@link _types.KumaOrder KumaOrder}
 */
export const TriggerType = Object.freeze({
  last: 'last',
  index: 'index',
  /**
   * @internal
   */
  none: 'none',
} as const);

export type TriggerType = (typeof TriggerType)[keyof typeof TriggerType];

/**
 * @category Enums - Response Properties
 * @enum
 */
export const ChainTransactionStatus = Object.freeze({
  /** Either not yet submitted or not yet mined */
  pending: 'pending',
  /** Mined, no need for any block confirmation delay */
  mined: 'mined',
  /** Transaction reverted */
  failed: 'failed',
} as const);

export type ChainTransactionStatus =
  (typeof ChainTransactionStatus)[keyof typeof ChainTransactionStatus];

/**
 * @category Enums - Response Properties
 * @enum
 */
export const LiquidityProvider = Object.freeze({
  /**
   * Maker provides liquidity
   */
  maker: 'maker',
  /**
   * Taker removes liquidity
   */
  taker: 'taker',
} as const);

export type LiquidityProvider =
  (typeof LiquidityProvider)[keyof typeof LiquidityProvider];

/**
 * @category Enums - Response Properties
 * @enum
 */
export const OrderBookLevelType = Object.freeze({
  limit: 'limit',
} as const);

export type OrderBookLevelType =
  (typeof OrderBookLevelType)[keyof typeof OrderBookLevelType];

/**
 * Can be used as a convenience when specifying your orders for WebSocket
 * to benefit from inline documentation and auto-complete.
 *
 * @category Enums - Response Properties
 * @enum
 */
export const PositionEventStatus = Object.freeze({
  /**
   * - Default when position is open.
   */
  open: 'open',
  /**
   * - Only {@link closed} on last update.
   */
  closed: 'closed',
});

export type PositionEventStatus =
  (typeof PositionEventStatus)[keyof typeof PositionEventStatus];

/**
 * @category Enums - Response Properties
 * @enum
 */
export const MessageEventType = Object.freeze({
  /**
   * **Subscription Update Events:**
   *
   * - Receives a {@link _types.KumaErrorEvent KumaErrorEvent} WebSocket response via
   *   the {@link _types.WebSocketClient.onMessage WebSocketClient.onMessage} handler
   *   detailing an error that occured while processing your request on the server.
   */
  error: 'error',
  /**
   * Recieving a list of all active subscriptions.
   *
   * **Subscription Update Events:**
   *
   * - Receives a {@link _types.KumaSubscriptionsListEvent KumaSubscriptionsListEvent} WebSocket response via
   *   the {@link _types.WebSocketClient.onMessage WebSocketClient.onMessage} handler listing all active
   *   subscriptions as an array on the {@link _types.KumaSubscriptionsListEvent.subscriptions subscriptions} property
   */
  subscriptions: 'subscriptions',
  ...SubscriptionNameAuthenticated,
  ...SubscriptionNamePublic,
} as const);

export type MessageEventType =
  (typeof MessageEventType)[keyof typeof MessageEventType];

/**
 * @internal
 */
export const WebClientEvent = {
  reload_banners: 'reload_banners',
  exchange_status_updated: 'exchange_status_updated',
  transaction_settled: 'transaction_settled',
  /**
   * At this time this event is not active.
   */
  buy_crypto_completed: 'buy_crypto_completed',
} as const;

/**
 * @internal
 */
export type WebClientEvent =
  (typeof WebClientEvent)[keyof typeof WebClientEvent];

/**
 * @internal
 */
export const WebClientEventExchangeStatusAction = {
  controls_wallet: 'controls_wallet',
  controls_exchange: 'controls_exchange',
  controls_market: 'controls_market',
} as const;

/**
 * @internal
 */
export type WebClientEventExchangeStatusAction =
  (typeof WebClientEventExchangeStatusAction)[keyof typeof WebClientEventExchangeStatusAction];

/**
 * @internal
 */
export const WebClientEventTxSettledAction = {
  payout: 'payout',
  withdraw: 'withdraw',
  executeTrade: 'executeTrade',
} as const;

export type WebClientEventTxSettledAction =
  (typeof WebClientEventTxSettledAction)[keyof typeof WebClientEventTxSettledAction];
