import type * as idex from '#index';
import type { MessageEventType, OrderType } from '#types/enums/index';
import type { OrderStateChange } from '#types/enums/response';
import type { IDEXOrder } from '#types/rest/endpoints/GetOrders';
import type { IDEXSubscriptionEventBase } from '#types/webSocket/base';
import type { IDEXOrderFillEventData } from './ordersFill.js';

/**
 * - `orders` updates provided to the message handler when subscribed.
 *
 * @inheritDoc IDEXSubscriptionEventBase
 *
 * @category IDEX - Get Orders
 * @category WebSocket - Message Types
 *
 * @see {@link IDEXSubscriptionEventBase}
 */
export interface IDEXOrderEvent extends IDEXSubscriptionEventBase {
  /**
   * @inheritDoc
   */
  readonly type: typeof MessageEventType.orders;
  /**
   * @inheritDoc IDEXOrderEventData
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
   *    // orderEventData is of type IDEXOrderEventDataLiquidation | IDEXOrderEventDataDeleverage
   *  } else {
   *   // orderEventData is of type IDEXOrderEventDataGeneral
   *  }
   * ```
   *
   * <br />
   *
   * ---
   *
   * @see type {@link IDEXOrderEventData}
   */
  readonly data: IDEXOrderEventData;
}

/**
 * [[include:base.md]]
 *
 * @category Base Types
 */
export interface IDEXOrderEventDataBase
  extends Pick<IDEXOrder, 'market' | 'wallet' | 'side'> {
  /**
   * - When `undefined`, indicates the message is a `liquidation` or `deleverage`
   *   where `fills` will include a single  {@link IDEXOrderFillEventData.type} of
   *   {@link idex.FillTypeSystem FillTypeSystem}.
   */
  readonly type?: OrderType;
  /**
   * Timestamp of the most recent update
   */
  executionTime: number;
  /**
   * @inheritDoc IDEXOrderFillEventData
   *
   * @see type {@link IDEXOrderFillEventData}
   */
  readonly fills?: IDEXOrderFillEventData[];
}

/**
 * {@link idex.IDEXOrderFillEventDataSystem IDEXOrderFillEventDataSystem} updates do not
 * include many of the standard order update properties
 *
 * - Note that these types include a single {@link IDEXOrderFillEventDataSystem}.
 *
 * @category IDEX - Get Orders
 */
export interface IDEXOrderEventDataSystemFill extends IDEXOrderEventDataBase {
  readonly type?: undefined;
  readonly fills: IDEXOrderFillEventData[];
}

/**
 * All types other than {@link IDEXOrderEventDataSystemFill} include
 * most properties from {@link IDEXOrder}
 *
 * @category IDEX - Get Orders
 */
export interface IDEXOrderEventDataGeneral
  extends IDEXOrderEventDataBase,
    Omit<IDEXOrder, 'type' | 'fills' | 'market' | 'wallet' | 'side'> {
  /**
   * @inheritDoc
   */
  readonly type: OrderType;
  /**
   * Type of order update
   *
   * @see enum {@link OrderStateChange}
   */
  update: OrderStateChange;
  /**
   * order book update sequence number, only included if update type triggers an order book update
   *
   * @see related {@link idex.IDEXOrderBook.sequence}
   */
  sequence?: idex.IDEXOrderBook['sequence'];
  readonly fills?: IDEXOrderFillEventData[];
}

/**
 * Order updates received from the WebSocket differ from orders retreived from the
 * REST API in several ways.
 *
 * - In addition to the order types received when getting orders from the REST API, WebSocket update events
 *   may also provide the following `undefined` type indicating a {@link IDEXOrderEventDataSystemFill}
 *   where the `fills` property will include a {@link idex.FillTypeSystem FillTypeSystem} fill matching
 *   {@link idex.IDEXOrderFillEventDataSystem IDEXOrderFillEventDataSystem}
 * - It is best to narrow on the `type` property between these types and all the
 *   others as shown in the example below.
 *   - This is made easiest by using the {@link OrderType} enum as shown.
 *
 * @example
 * ```typescript
 *  import { OrderType } from '@idexio/idex-sdk';
 *
 *  if (!orderEventData.type) {
 *    // orderLong is of type IIDEXOrderEventDataSystemFill
 *  } else {
 *   // orderLong is of type IDEXOrderEventDataGeneral
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
 * @category IDEX - Get Orders
 * @category WebSocket - Message Types
 *
 * @see union {@link IDEXOrderEventDataGeneral}
 * @see union {@link IDEXOrderEventDataSystemFill}
 * @see parent {@link IDEXOrderEvent}
 */
export type IDEXOrderEventData =
  | IDEXOrderEventDataSystemFill
  | IDEXOrderEventDataGeneral;

export interface WebSocketResponseSubscriptionMessageShortOrders
  extends IDEXSubscriptionEventBase {
  type: typeof MessageEventType.orders;
  data: WebSocketResponseOrderShort;
}

export interface WebSocketResponseOrderShortBase {
  /**
   * @see related {@link IDEXOrder.type}
   * @see inflated {@link IDEXOrderEventDataGeneral.type}
   */
  o?: IDEXOrderEventDataGeneral['type'];
  /**
   * @see related {@link IDEXOrder.market}
   * @see inflated {@link IDEXOrderEventDataGeneral.market}
   */
  m: IDEXOrderEventDataBase['market'];
  /**
   * @see related {@link IDEXOrder.wallet}
   * @see inflated {@link IDEXOrderEventDataGeneral.wallet}
   */
  w: IDEXOrderEventDataBase['wallet'];
  // t: IDEXOrder['execut'];
  /**
   * @see inflated {@link IDEXOrderEventDataGeneral.executionTime}
   */
  t: IDEXOrderEventDataBase['executionTime'];
  /**
   * @see related {@link IDEXOrder.side}
   * @see inflated {@link IDEXOrderEventDataGeneral.side}
   */
  s: IDEXOrderEventDataBase['side'];
  /**
   * @see related {@link IDEXOrder.fills}
   * @see inflated {@link IDEXOrderEventDataGeneral.fills}
   */
  F?: idex.WebSocketResponseOrderFillShort[];
  /**
   * @see related {@link IDEXOrder.delegatedKey}
   * @see inflated {@link IDEXOrderEventDataGeneral.delegatedKey}
   */
  dk?: IDEXOrderEventDataGeneral['delegatedKey'];
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
  o: IDEXOrderEventDataGeneral['type'];
  /**
   * @see related {@link IDEXOrder.orderId}
   * @see inflated {@link IDEXOrderEventDataGeneral.orderId}
   */
  i: IDEXOrderEventDataGeneral['orderId'];
  /**
   * @see related {@link IDEXOrder.clientOrderId}
   * @see inflated {@link IDEXOrderEventDataGeneral.clientOrderId}
   */
  c: IDEXOrderEventDataGeneral['clientOrderId'];
  /**
   * @see related {@link IDEXOrder.time}
   * @see inflated {@link IDEXOrderEventDataGeneral.time}
   */
  T: IDEXOrderEventDataGeneral['time'];
  /**
   * @see enum {@link idex.OrderStateChange}
   * @see inflated {@link IDEXOrderEventDataGeneral.update}
   */
  x: IDEXOrderEventDataGeneral['update'];
  /**
   * @see related {@link IDEXOrder.status}
   * @see enum {@link idex.OrderStatus}
   * @see inflated {@link IDEXOrderEventDataGeneral.status}
   */
  X: IDEXOrderEventDataGeneral['status'];
  /**
   * @see related {@link IDEXOrderBook.sequence}
   * @see inflated {@link IDEXOrderEventDataGeneral.sequence}
   */
  u?: IDEXOrderEventDataGeneral['sequence'];
  /**
   * @see related {@link IDEXOrder.errorCode}
   * @see inflated {@link IDEXOrderEventDataGeneral.errorCode}
   */
  ec?: IDEXOrderEventDataGeneral['errorCode'];
  /**
   * @see related {@link IDEXOrder.errorMessage}
   * @see inflated {@link IDEXOrderEventDataGeneral.errorMessage}
   */
  em?: IDEXOrderEventDataGeneral['errorMessage'];
  /**
   * @see related {@link IDEXOrder.originalQuantity}
   * @see inflated {@link IDEXOrderEventDataGeneral.originalQuantity}
   */
  q: IDEXOrderEventDataGeneral['originalQuantity'];
  /**
   * @see related {@link IDEXOrder.executedQuantity}
   * @see inflated {@link IDEXOrderEventDataGeneral.executedQuantity}
   */
  z: IDEXOrderEventDataGeneral['executedQuantity'];
  /**
   * @see related {@link IDEXOrder.cumulativeQuoteQuantity}
   * @see inflated {@link IDEXOrderEventDataGeneral.cumulativeQuoteQuantity}
   */
  Z: IDEXOrderEventDataGeneral['cumulativeQuoteQuantity'];
  /**
   * @see related {@link IDEXOrder.avgExecutionPrice}
   * @see inflated {@link IDEXOrderEventDataGeneral.avgExecutionPrice}
   */
  v?: IDEXOrderEventDataGeneral['avgExecutionPrice'];
  /**
   * @see related {@link IDEXOrder.price}
   * @see inflated {@link IDEXOrderEventDataGeneral.price}
   */
  p?: IDEXOrderEventDataGeneral['price'];
  /**
   * @see related {@link IDEXOrder.triggerPrice}
   * @see inflated {@link IDEXOrderEventDataGeneral.triggerPrice}
   */
  P?: IDEXOrderEventDataGeneral['triggerPrice'];
  /**
   * @see related {@link IDEXOrder.triggerType}
   * @see inflated {@link IDEXOrderEventDataGeneral.triggerType}
   */
  tt?: IDEXOrderEventDataGeneral['triggerType'];
  /**
   * Only applicable to `trailingStopMarket` orders.
   *
   * @see inflated {@link IDEXOrderEventDataGeneral.callbackRate}
   */
  cr?: IDEXOrderEventDataGeneral['callbackRate'];
  /**
   * @see inflated {@link IDEXOrderEventDataGeneral.conditionalOrderId}
   */
  ci?: string;
  /**
   * @see related {@link IDEXOrder.reduceOnly}
   * @see inflated {@link IDEXOrderEventDataGeneral.reduceOnly}
   */
  r: IDEXOrderEventDataGeneral['reduceOnly'];
  /**
   * @see related {@link IDEXOrder.timeInForce}
   * @see inflated {@link IDEXOrderEventDataGeneral.timeInForce}
   */
  f?: IDEXOrderEventDataGeneral['timeInForce'];
  /**
   * @see related {@link IDEXOrder.selfTradePrevention}
   * @see inflated {@link IDEXOrderEventDataGeneral.selfTradePrevention}
   */
  V: IDEXOrderEventDataGeneral['selfTradePrevention'];

  /**
   * @see related {@link IDEXOrder.isLiquidationAcquisitionOnly}
   * @see inflated {@link IDEXOrderEventDataGeneral.isLiquidationAcquisitionOnly}
   */
  la?: IDEXOrderEventDataGeneral['isLiquidationAcquisitionOnly'];
}

/**
 * @internal
 *
 * WebSocket Response Order - Short (Deflated)
 *
 * An extended version used by WebSocket of {@link IDEXOrder},
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
