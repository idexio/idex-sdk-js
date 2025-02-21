import type * as idex from '#index';
import type {
  MessageEventType,
  OrderSubType,
  OrderType,
} from '#types/enums/index';
import type { OrderStateChange } from '#types/enums/response';
import type { KumaOrder } from '#types/rest/endpoints/GetOrders';
import type { KumaSubscriptionEventBase } from '#types/webSocket/base';
import type { KumaOrderFillEventData } from './ordersFill.js';

/**
 * - `orders` updates provided to the message handler when subscribed.
 *
 * @inheritDoc KumaSubscriptionEventBase
 *
 * @category Kuma - Get Orders
 * @category WebSocket - Message Types
 *
 * @see {@link KumaSubscriptionEventBase}
 */
export interface KumaOrderEvent extends KumaSubscriptionEventBase {
  /**
   * @inheritDoc
   */
  readonly type: typeof MessageEventType.orders;
  /**
   * @inheritDoc KumaOrderEventData
   *
   * @example
   * ```typescript
   *  import { OrderEventType } from '@idexio/idex-sdk';
   *
   *  // ...
   *
   *  const orderEventData = orderEvent.data
   *
   *  if (
   *    orderEventData.type === OrderEventType.liquidation ||
   *    orderEventData.type === OrderEventType.deleverage
   *  ) {
   *    // orderEventData is of type KumaOrderEventDataLiquidation | KumaOrderEventDataDeleverage
   *  } else {
   *   // orderEventData is of type KumaOrderEventDataGeneral
   *  }
   * ```
   *
   * <br />
   *
   * ---
   *
   * @see type {@link KumaOrderEventData}
   */
  readonly data: KumaOrderEventData;
}

/**
 * [[include:base.md]]
 *
 * @category Base Types
 */
export interface KumaOrderEventDataBase
  extends Pick<KumaOrder, 'market' | 'wallet' | 'side'> {
  /**
   * - When `undefined`, indicates the message is a `liquidation` or `deleverage`
   *   where `fills` will include a single  {@link KumaOrderFillEventData.type} of
   *   {@link idex.FillTypeSystem FillTypeSystem}.
   */
  readonly type?: OrderType;
  /**
   * Timestamp of the most recent update
   */
  executionTime: number;
  /**
   * @inheritDoc KumaOrderFillEventData
   *
   * @see type {@link KumaOrderFillEventData}
   */
  readonly fills?: KumaOrderFillEventData[];
}

/**
 * {@link idex.KumaOrderFillEventDataSystem KumaOrderFillEventDataSystem} updates do not
 * include many of the standard order update properties
 *
 * - Note that these types include a single {@link KumaOrderFillEventDataSystem}.
 *
 * @category Kuma - Get Orders
 */
export interface KumaOrderEventDataSystemFill extends KumaOrderEventDataBase {
  readonly type?: undefined;
  readonly fills: KumaOrderFillEventData[];
}

/**
 * All types other than {@link KumaOrderEventDataSystemFill} include
 * most properties from {@link KumaOrder}
 *
 * @category Kuma - Get Orders
 */
export interface KumaOrderEventDataGeneral
  extends KumaOrderEventDataBase,
    Omit<KumaOrder, 'type' | 'fills' | 'market' | 'wallet' | 'side'> {
  /**
   * @inheritDoc
   */
  readonly type: OrderType;
  /**
   * @internal
   */
  readonly subType?: OrderSubType;
  /**
   * Type of order update
   *
   * @see enum {@link OrderStateChange}
   */
  update: OrderStateChange;
  /**
   * order book update sequence number, only included if update type triggers an order book update
   *
   * @see related {@link idex.KumaOrderBook.sequence}
   */
  sequence?: idex.KumaOrderBook['sequence'];
  readonly fills?: KumaOrderFillEventData[];
}

/**
 * Order updates received from the WebSocket differ from orders retreived from the
 * REST API in several ways.
 *
 * - In addition to the order types received when getting orders from the REST API, WebSocket update events
 *   may also provide the following `undefined` type indicating a {@link KumaOrderEventDataSystemFill}
 *   where the `fills` property will include a {@link idex.FillTypeSystem FillTypeSystem} fill matching
 *   {@link idex.KumaOrderFillEventDataSystem KumaOrderFillEventDataSystem}
 * - It is best to narrow on the `type` property between these types and all the
 *   others as shown in the example below.
 *   - This is made easiest by using the {@link OrderType} enum as shown.
 *
 * @example
 * ```typescript
 *  import { OrderType } from '@idexio/idex-sdk';
 *
 *  if (!orderEventData.type) {
 *    // orderLong is of type IKumaOrderEventDataSystemFill
 *  } else {
 *   // orderLong is of type KumaOrderEventDataGeneral
 *   switch(orderEventData.type) {
 *    case OrderType.fill:
 *      break;
 *    // ...etc
 *   }
 *  }
 * ```
 *
 * <br />
 *
 * ---
 *
 * @category Kuma - Get Orders
 * @category WebSocket - Message Types
 *
 * @see union {@link KumaOrderEventDataGeneral}
 * @see union {@link KumaOrderEventDataSystemFill}
 * @see parent {@link KumaOrderEvent}
 */
export type KumaOrderEventData =
  | KumaOrderEventDataSystemFill
  | KumaOrderEventDataGeneral;

export interface WebSocketResponseSubscriptionMessageShortOrders
  extends KumaSubscriptionEventBase {
  type: typeof MessageEventType.orders;
  data: WebSocketResponseOrderShort;
}

export interface WebSocketResponseOrderShortBase {
  /**
   * @see related {@link KumaOrder.type}
   * @see inflated {@link KumaOrderEventDataGeneral.type}
   */
  o?: KumaOrderEventDataGeneral['type'];
  /**
   * @see related {@link KumaOrder.market}
   * @see inflated {@link KumaOrderEventDataGeneral.market}
   */
  m: KumaOrderEventDataBase['market'];
  /**
   * @see related {@link KumaOrder.wallet}
   * @see inflated {@link KumaOrderEventDataGeneral.wallet}
   */
  w: KumaOrderEventDataBase['wallet'];
  /**
   * @see inflated {@link KumaOrderEventDataGeneral.executionTime}
   */
  t: KumaOrderEventDataBase['executionTime'];
  /**
   * @see related {@link KumaOrder.side}
   * @see inflated {@link KumaOrderEventDataGeneral.side}
   */
  s: KumaOrderEventDataBase['side'];
  /**
   * @see related {@link KumaOrder.fills}
   * @see inflated {@link KumaOrderEventDataGeneral.fills}
   */
  F?: idex.WebSocketResponseOrderFillShort[];
  /**
   * @see related {@link KumaOrder.delegatedKey}
   * @see inflated {@link KumaOrderEventDataGeneral.delegatedKey}
   */
  dk?: KumaOrderEventDataGeneral['delegatedKey'];
}

/**
 * @internal
 *
 * `liquidation`, `deleverage`, and `closure` types do not include many of the
 * properties of other order types
 */
export interface WebSocketResponseOrderShortSystem
  extends WebSocketResponseOrderShortBase {
  /**
   * @inheritDoc
   */
  readonly o?: undefined;
  readonly F: idex.WebSocketResponseOrderFillShort[];
}

/**
 * @internal
 *
 * The type for all order types other than `liquidation`
 */
export interface WebSocketResponseOrderShortGeneral
  extends WebSocketResponseOrderShortBase {
  /**
   * @inheritDoc
   */
  o: KumaOrderEventDataGeneral['type'];
  /**
   * @internal
   */
  O?: KumaOrderEventDataGeneral['subType'];
  /**
   * @see related {@link KumaOrder.orderId}
   * @see inflated {@link KumaOrderEventDataGeneral.orderId}
   */
  i: KumaOrderEventDataGeneral['orderId'];
  /**
   * @see related {@link KumaOrder.clientOrderId}
   * @see inflated {@link KumaOrderEventDataGeneral.clientOrderId}
   */
  c: KumaOrderEventDataGeneral['clientOrderId'];
  /**
   * @see related {@link KumaOrder.time}
   * @see inflated {@link KumaOrderEventDataGeneral.time}
   */
  T: KumaOrderEventDataGeneral['time'];
  /**
   * @see enum {@link idex.OrderStateChange}
   * @see inflated {@link KumaOrderEventDataGeneral.update}
   */
  x: KumaOrderEventDataGeneral['update'];
  /**
   * @see related {@link KumaOrder.status}
   * @see enum {@link idex.OrderStatus}
   * @see inflated {@link KumaOrderEventDataGeneral.status}
   */
  X: KumaOrderEventDataGeneral['status'];
  /**
   * @see related {@link KumaOrderBook.sequence}
   * @see inflated {@link KumaOrderEventDataGeneral.sequence}
   */
  u?: KumaOrderEventDataGeneral['sequence'];
  /**
   * @see related {@link KumaOrder.errorCode}
   * @see inflated {@link KumaOrderEventDataGeneral.errorCode}
   */
  ec?: KumaOrderEventDataGeneral['errorCode'];
  /**
   * @see related {@link KumaOrder.errorMessage}
   * @see inflated {@link KumaOrderEventDataGeneral.errorMessage}
   */
  em?: KumaOrderEventDataGeneral['errorMessage'];
  /**
   * @see related {@link KumaOrder.originalQuantity}
   * @see inflated {@link KumaOrderEventDataGeneral.originalQuantity}
   */
  q: KumaOrderEventDataGeneral['originalQuantity'];
  /**
   * @see related {@link KumaOrder.executedQuantity}
   * @see inflated {@link KumaOrderEventDataGeneral.executedQuantity}
   */
  z: KumaOrderEventDataGeneral['executedQuantity'];
  /**
   * @see related {@link KumaOrder.cumulativeQuoteQuantity}
   * @see inflated {@link KumaOrderEventDataGeneral.cumulativeQuoteQuantity}
   */
  Z: KumaOrderEventDataGeneral['cumulativeQuoteQuantity'];
  /**
   * @see related {@link KumaOrder.avgExecutionPrice}
   * @see inflated {@link KumaOrderEventDataGeneral.avgExecutionPrice}
   */
  v?: KumaOrderEventDataGeneral['avgExecutionPrice'];
  /**
   * @see related {@link KumaOrder.price}
   * @see inflated {@link KumaOrderEventDataGeneral.price}
   */
  p?: KumaOrderEventDataGeneral['price'];
  /**
   * @see related {@link KumaOrder.triggerPrice}
   * @see inflated {@link KumaOrderEventDataGeneral.triggerPrice}
   */
  P?: KumaOrderEventDataGeneral['triggerPrice'];
  /**
   * @see related {@link KumaOrder.triggerType}
   * @see inflated {@link KumaOrderEventDataGeneral.triggerType}
   */
  tt?: KumaOrderEventDataGeneral['triggerType'];
  /**
   * Only applicable to `trailingStopMarket` orders.
   *
   * @see inflated {@link KumaOrderEventDataGeneral.callbackRate}
   */
  cr?: KumaOrderEventDataGeneral['callbackRate'];
  /**
   * @see inflated {@link KumaOrderEventDataGeneral.conditionalOrderId}
   */
  ci?: KumaOrderEventDataGeneral['conditionalOrderId'];
  /**
   * @see related {@link KumaOrder.reduceOnly}
   * @see inflated {@link KumaOrderEventDataGeneral.reduceOnly}
   */
  r: KumaOrderEventDataGeneral['reduceOnly'];
  /**
   * @see related {@link KumaOrder.timeInForce}
   * @see inflated {@link KumaOrderEventDataGeneral.timeInForce}
   */
  f?: KumaOrderEventDataGeneral['timeInForce'];
  /**
   * @see related {@link KumaOrder.selfTradePrevention}
   * @see inflated {@link KumaOrderEventDataGeneral.selfTradePrevention}
   */
  V: KumaOrderEventDataGeneral['selfTradePrevention'];

  /**
   * @see related {@link KumaOrder.isLiquidationAcquisitionOnly}
   * @see inflated {@link KumaOrderEventDataGeneral.isLiquidationAcquisitionOnly}
   */
  la?: KumaOrderEventDataGeneral['isLiquidationAcquisitionOnly'];
}

/**
 * @internal
 *
 * WebSocket Response Order - Short (Deflated)
 *
 * An extended version used by WebSocket of {@link KumaOrder},
 *
 * ## Discriminated Union
 *
 * This type is a discriminated union by property `o` of two types:
 *  - {@link WebSocketResponseOrderShortGeneral}
 *  - {@link WebSocketResponseOrderShortSystem}
 *
 * When `o` is `liquidation`, the type is {@link WebSocketResponseOrderShortSystem} and
 * will not include many of the properties that are included when `o` is not `liquidation`.
 *
 * @example
 * ```typescript
 *  if (orderShort.o === 'liquidation') {
 *    // orderShort is of type WebSocketResponseOrderShortLiquidation
 *  } else {
 *   // orderShort is of type WebSocketResponseOrderShortGeneral
 *  }
 * ```
 */
export type WebSocketResponseOrderShort =
  | WebSocketResponseOrderShortGeneral
  | WebSocketResponseOrderShortSystem;
