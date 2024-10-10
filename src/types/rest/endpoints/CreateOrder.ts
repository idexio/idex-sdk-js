import type * as idex from '#index';
import type { RestRequestWithSignature } from '#types/utils';

/**
 * <div>
 * [[include:base.md]]
 * </div>
 *
 * @category Base Types
 *
 * @see related {@link RestRequestOrderBaseWithoutTriggerPrice}
 * @see related {@link RestRequestOrderBaseWithTriggerPrice}
 */
export interface RestRequestOrderBase
  extends idex.RestRequestByWallet,
    idex.DelegatedKeyParams,
    idex.RestRequestByMarket {
  /**
   * - When specifying, using the {@link idex.OrderType OrderType} enum is recommended for
   *   inline docs and convenience.
   *
   * @example
   * ```typescript
   *  import { OrderType } from '@idexio/idex-sdk'
   *
   *  const response = await client.createOrder({
   *    // whichever order type you are creating
   *    type: OrderType.market,
   *    // ...other params
   *  })
   * ```
   *
   * @see docs [API Documentation: Order Types](https://api-docs-v4.idex.io/#order-types)
   * @see enum {@link idex.OrderType OrderType}
   */
  readonly type: idex.OrderType;
  /**
   * - When specifying, using the {@link idex.OrderSide OrderSide} enum is recommended for
   *   inline docs and convenience.
   *
   * @see enum {@link idex.OrderSide OrderSide}
   */
  readonly side: idex.OrderSide;
  /**
   * Order quantity in base terms
   */
  readonly quantity: string;
  /**
   * Client-specified order id, maximum of 40 bytes
   */
  readonly clientOrderId?: string;
  /**
   * Reduce only orders are only accepted opposite open
   * positions and only reduce an opposite position’s size
   */
  readonly reduceOnly?: boolean;
  /**
   * - When specifying, using the {@link idex.TimeInForce TimeInForce} enum is recommended for inline docs and convenience.
   * - {@link isLiquidationAcquisitionOnly} limit orders must have `timeInForce` set to {@link idex.TimeInForce.gtx TimeInForce.gtx}
   * - Defaults to {@link idex.TimeInForce.gtc TimeInForce.gtc}
   *
   * @see enum {@link idex.TimeInForce TimeInForce}
   *
   * @defaultValue
   * ```typescript
   * TimeInForce.gtc
   * ```
   */
  readonly timeInForce?: idex.TimeInForce;
  /**
   * Self-trade prevention policy, see enum links
   *
   * - When specifying, using the {@link idex.SelfTradePrevention SelfTradePrevention} enum is
   *   recommended for inline docs and convenience.
   * - **MUST** be {@link idex.SelfTradePrevention.cn SelfTradePrevention.cn} if
   *   {@link idex.TimeInForce.fok TimeInForce.fok} is specified for the {@link timeInForce} property.
   * - For {@link isLiquidationAcquisitionOnly} {@link idex.OrderType.limit OrderType.limit} orders,
   *   `selfTradePrevention` must be omitted or its default value of {@link idex.SelfTradePrevention.dc SelfTradePrevention.dc}.
   *
   * @see enum {@link idex.SelfTradePrevention SelfTradePrevention}
   *
   * @defaultValue
   * ```typescript
   * SelfTradePrevention.dc
   * ```
   */
  readonly selfTradePrevention?: idex.SelfTradePrevention;
  /**
   * **Internal:** Not yet available in production APIs.
   *
   * - Only applicable to stop {@link idex.OrderType order types}:
   *   - {@link idex.OrderType.stopLossMarket stopLossMarket}
   *   - {@link idex.OrderType.stopLossLimit stopLossLimit}
   *   - {@link idex.OrderType.trailingStopMarket trailingStopMarket}
   * - Indicates an {@link idex.IDEXOrder.orderId orderId} of an open {@link idex.OrderType.limit limit} order
   *   by the same wallet in the same market that must be filled before the stop becomes active.
   * - Canceling the conditional order also cancels the stop order.
   *
   * @see enum {@link idex.OrderType OrderType}
   *
   * @alpha
   * @internal
   */
  readonly conditionalOrderId?: string | undefined;
  /**
   * **Internal:** Not yet available in production APIs.
   *
   * - Only applicable to {@link idex.OrderType.trailingStopMarket trailingStopMarket} order types.
   * - bounded from `0.1%` to `5%`
   *
   * @see type {@link RestRequestOrderTypeTrailingStopMarket}
   * @see enum {@link idex.OrderType OrderType}
   *
   * @alpha
   * @internal
   */
  readonly callbackRate?: string | undefined;
  /**
   * Only allowed for certain order types mentioned below, omitted otherwise.
   *
   * - Stop loss or take profit price for order types:
   *   - {@link idex.OrderType.stopLossMarket stopLossMarket}
   *   - {@link idex.OrderType.stopLossLimit stopLossLimit}
   *   - {@link idex.OrderType.takeProfitMarket takeProfitMarket}
   *   - {@link idex.OrderType.takeProfitLimit takeProfitLimit}
   *
   * - Activation price for order types:
   *   - {@link idex.OrderType.trailingStopMarket trailingStopMarket}
   *
   * @see enum {@link idex.OrderType OrderType}
   */
  readonly triggerPrice?: string;
  /**
   * Price type for the {@link triggerPrice}
   *
   * - When specifying, using the {@link idex.TriggerType TriggerType} enum is recommended
   *   for inline docs and convenience.
   * - Required when {@link triggerPrice} is defined.
   *
   * @see enum {@link idex.TriggerType TriggerType}
   */
  readonly triggerType?: idex.TriggerType;
  /**
   * Order price in quote terms
   *
   * - Required for all {@link idex.OrderType.limit limit} order types.
   * - Omitted for all {@link idex.OrderType.market market}  order types.
   *
   * @see enum {@link idex.OrderType OrderType}
   */
  readonly price?: string | undefined;
  /**
   * When this parameter is `true` it indicates that the order is an LP side
   * channel order not to be executed against the order book.
   *
   * - Wallet placing the order **MUST BE WHITELISTED.** Contact the IDEX team for more details.
   * - This parameter is only allowed to be `true` on {@link idex.OrderType.market market} and
   *   {@link idex.OrderType.limit limit} order types.
   * - In the case of `limit` orders, {@link timeInForce} must be {@link idex.TimeInForce.gtc TimeInForce.gtc}
   *   indicating that side channel orders never take liquidity.
   * - {@link reduceOnly} and {@link selfTradePrevention} parameters may be omitted or set to their
   *   default values only.
   *
   * @see enum {@link idex.OrderType OrderType}
   * @see enum {@link idex.TimeInForce TimeInForce}
   */
  readonly isLiquidationAcquisitionOnly?: boolean | undefined;
}

/**
 * [[include:unexported.md]]
 *
 * @category Base Types
 */
interface RestRequestOrderBaseWithTriggerPrice extends RestRequestOrderBase {
  /**
   * @inheritDoc
   */
  readonly triggerPrice: string;
  /**
   * @inheritDoc
   */
  readonly triggerType: idex.TriggerType;
}

/**
 * [[include:unexported.md]]
 *
 * @category Base Types
 */
interface RestRequestOrderBaseWithoutTriggerPrice extends RestRequestOrderBase {
  readonly triggerPrice?: undefined;
  readonly triggerType?: undefined;
}

/**
 * @category IDEX - Create Order
 */
export interface RestRequestOrderTypeLimit
  extends RestRequestOrderBaseWithoutTriggerPrice {
  /**
   * @inheritDoc
   */
  readonly type: typeof idex.OrderType.limit;
  /**
   * @inheritDoc
   */
  readonly price: string;
  callbackRate?: undefined;
  conditionalOrderId?: undefined;
  readonly isLiquidationAcquisitionOnly?: false;
}

/**
 * > Orders with {@link RestRequestOrderBase.isLiquidationAcquisitionOnly isLiquidationAcquisitionOnly} set to `true` are
 * > only allowed for whitelisted wallets at this time.  Please contact
 * > the IDEX team if you would like more details.
 *
 * @category IDEX - Create Order
 */
export interface RestRequestOrderTypeLimitLPP
  extends RestRequestOrderBaseWithoutTriggerPrice {
  /**
   * @inheritDoc
   */
  readonly type: typeof idex.OrderType.limit;
  /**
   * @inheritDoc
   */
  readonly isLiquidationAcquisitionOnly: true;
  /**
   * @inheritDoc
   */
  readonly timeInForce: typeof idex.TimeInForce.gtx;
  /**
   * @inheritDoc
   */
  readonly price: string;
  reduceOnly?: false;
  selfTradePrevention?: typeof idex.SelfTradePrevention.dc;
  callbackRate?: undefined;
  conditionalOrderId?: undefined;
}

/**
 * @category IDEX - Create Order
 */
export interface RestRequestOrderTypeMarket
  extends RestRequestOrderBaseWithoutTriggerPrice {
  /**
   * @inheritDoc
   */
  readonly type: typeof idex.OrderType.market;
  price?: undefined;
  timeInForce?: undefined;
  callbackRate?: undefined;
  conditionalOrderId?: undefined;
  isLiquidationAcquisitionOnly?: false;
}

/**
 * > Orders with {@link RestRequestOrderBase.isLiquidationAcquisitionOnly isLiquidationAcquisitionOnly} set to `true` are
 * > only allowed for whitelisted wallets at this time.  Please contact
 * > the IDEX team if you would like more details.
 *
 * @category IDEX - Create Order
 */
export interface RestRequestOrderTypeMarketLPP
  extends RestRequestOrderBaseWithoutTriggerPrice {
  /**
   * @inheritDoc
   */
  readonly type: typeof idex.OrderType.market;
  /**
   * @inheritDoc
   */
  readonly isLiquidationAcquisitionOnly: true;
  price?: undefined;
  timeInForce?: undefined;
  reduceOnly?: false;
  selfTradePrevention?: typeof idex.SelfTradePrevention.dc;
  callbackRate?: undefined;
  conditionalOrderId?: undefined;
}

/**
 * @category IDEX - Create Order
 */
export interface RestRequestOrderTypeStopLossMarket
  extends RestRequestOrderBaseWithTriggerPrice {
  readonly type: typeof idex.OrderType.stopLossMarket;
  price?: undefined;
  timeInForce?: undefined;

  callbackRate?: undefined;
  isLiquidationAcquisitionOnly?: false;
}

/**
 * Order request parameters for when the {@link idex.OrderType type} is a {@link idex.OrderType.stopLossLimit stopLossLimit} order.
 *
 * @category IDEX - Create Order
 *
 * @see related {@link idex.OrderType.stopLossLimit OrderType.stopLossLimit}
 * @see enum {@link idex.OrderType OrderType}
 */
export interface RestRequestOrderTypeStopLossLimit
  extends RestRequestOrderBaseWithTriggerPrice {
  /**
   * @inheritDoc
   */
  readonly type: typeof idex.OrderType.stopLossLimit;
  /**
   * @inheritDoc
   */
  readonly price: string;
  callbackRate?: undefined;
  isLiquidationAcquisitionOnly?: false;
}

/**
 * @category IDEX - Create Order
 */
export interface RestRequestOrderTypeTakeProfitMarket
  extends RestRequestOrderBaseWithTriggerPrice {
  /**
   * @inheritDoc
   */
  readonly type: typeof idex.OrderType.takeProfitMarket;
  price?: undefined;
  timeInForce?: undefined;
  callbackRate?: undefined;
  conditionalOrderId?: undefined;
  isLiquidationAcquisitionOnly?: false;
}

/**
 * @category IDEX - Create Order
 */
export interface RestRequestOrderTypeTakeProfitLimit
  extends RestRequestOrderBaseWithTriggerPrice {
  /**
   * @inheritDoc
   */
  readonly type: typeof idex.OrderType.takeProfitLimit;
  /**
   * @inheritDoc
   */
  readonly price: string;
  callbackRate?: undefined;
  conditionalOrderId?: undefined;
  isLiquidationAcquisitionOnly?: false;
}

/**
 * @category IDEX - Create Order
 */
export interface RestRequestOrderTypeTrailingStopMarket
  extends RestRequestOrderBaseWithTriggerPrice {
  /**
   * @inheritDoc
   */
  readonly type: typeof idex.OrderType.trailingStopMarket;
  /**
   * @inheritDoc
   */
  readonly callbackRate?: string;
  price?: undefined;
  timeInForce?: undefined;
  isLiquidationAcquisitionOnly?: false;
}

/**
 * Available Request Order Types.  The request is narrowed based on the parameters given to the
 * request. Below is a summary of the various interfaces to match to achieve different orders.
 *
 * - {@link RestRequestOrderTypeLimit}
 *   - parameter {@link RestRequestOrderBase.type type} is {@link idex.OrderType.limit OrderType.limit}
 * - {@link RestRequestOrderTypeMarket}
 *   - parameter {@link RestRequestOrderBase.type type} is {@link idex.OrderType.market OrderType.market}
 * - {@link RestRequestOrderTypeStopLossMarket}
 *   - parameter {@link RestRequestOrderBase.type type} is {@link idex.OrderType.stopLossMarket OrderType.stopLossMarket}
 * - {@link RestRequestOrderTypeStopLossLimit}
 *   - parameter {@link RestRequestOrderBase.type type} is {@link idex.OrderType.stopLossLimit OrderType.stopLossLimit}
 * - {@link RestRequestOrderTypeTakeProfitMarket}
 *   - parameter {@link RestRequestOrderBase.type type} is {@link idex.OrderType.takeProfitMarket OrderType.takeProfitMarket}
 * - {@link RestRequestOrderTypeTakeProfitLimit}
 *   - parameter {@link RestRequestOrderBase.type type} is {@link idex.OrderType.takeProfitLimit OrderType.takeProfitLimit}
 * - {@link RestRequestOrderTypeTrailingStopMarket}
 *   - parameter {@link RestRequestOrderBase.type type} is {@link idex.OrderType.trailingStopMarket OrderType.trailingStopMarket}
 *
 * Protected Request Order Types:
 *
 * - {@link RestRequestOrderTypeLimitLPP}
 *   - parameter {@link RestRequestOrderBase.isLiquidationAcquisitionOnly isLiquidationAcquisitionOnly} set to `true`
 *   - parameter {@link RestRequestOrderBase.type type} is {@link idex.OrderType.limit OrderType.limit}
 * - {@link RestRequestOrderTypeMarketLPP}
 *   - parameter {@link RestRequestOrderBase.isLiquidationAcquisitionOnly isLiquidationAcquisitionOnly} set to `true`
 *   - parameter {@link RestRequestOrderBase.type type} is {@link idex.OrderType.market OrderType.market} order
 *
 * @category IDEX - Create Order
 */
export type RestRequestOrder =
  | RestRequestOrderTypeLimit
  | RestRequestOrderTypeMarket
  | RestRequestOrderTypeStopLossMarket
  | RestRequestOrderTypeStopLossLimit
  | RestRequestOrderTypeTakeProfitMarket
  | RestRequestOrderTypeTakeProfitLimit
  | RestRequestOrderTypeTrailingStopMarket
  | RestRequestOrderTypeLimitLPP
  | RestRequestOrderTypeMarketLPP;

/**
 * Extract an order by its {@link RestRequestOrderBase.type type} parameter.
 */
export type RestRequestOrderOfType<T extends idex.OrderType> = Extract<
  RestRequestOrder,
  { type: T }
>;

export type RestRequestOrderTypeAllLimit = Extract<
  RestRequestOrder,
  { type: 'limit' | `${string}Limit` }
>;

export type RestRequestOrderTypeAllMarket = Extract<
  RestRequestOrder,
  { type: 'market' | `${string}Market` }
>;

export type RestRequestOrderTypeLPP = Extract<
  RestRequestOrder,
  { isLiquidationAcquisitionOnly: true }
>;

/**
 * The raw request body for the `DELETE /v4/orders` endpoint
 * including `signature` and the body in `parameters`.
 *
 * @internal
 */
export type RestRequestCreateOrderSigned =
  RestRequestWithSignature<RestRequestOrder>;
