import type { MessageEventType } from '#types/enums/index';
import type { KumaLiquidation } from '#types/rest/endpoints/GetLiquidations';
import type { KumaSubscriptionEventBase } from '#types/webSocket/base';

/**
 * - `liquidations` updates provided to the message handler when subscribed.
 *
 * @inheritDoc KumaSubscriptionEventBase
 * @category WebSocket - Message Types
 * @category Kuma - Get Liquidations
 *
 * @see enum {@link MessageEventType}
 * @see data {@link KumaLiquidationEventData}
 */
export interface KumaLiquidationEvent extends KumaSubscriptionEventBase {
  /**
   * @inheritDoc
   */
  type: typeof MessageEventType.liquidations;
  /**
   * @inheritDoc KumaLiquidationEventData
   *
   * @see type {@link KumaLiquidationEventData}
   */
  data: KumaLiquidationEventData;
}

/**
 * - Liquidation updates on the WebSocket include all {@link KumaLiquidation} properties as well
 *   as the `market` symbol that corresponds to the liquidation.
 *
 * @see parent {@link KumaLiquidationEvent}
 *
 * @category WebSocket - Message Types
 * @category Kuma - Get Liquidations
 */
export interface KumaLiquidationEventData extends KumaLiquidation {
  /**
   * Market symbol
   */
  market: string;
}

export interface WebSocketResponseSubscriptionMessageShortLiquidations
  extends KumaSubscriptionEventBase {
  type: typeof MessageEventType.liquidations;
  data: WebSocketResponseLiquidationsShort;
}

/**
 * @internal
 */
export interface WebSocketResponseLiquidationsShort {
  /**
   * @see inflated {@link KumaLiquidationEventData.market}
   */
  m: KumaLiquidationEventData['market'];
  /**
   * @see inflated {@link KumaLiquidationEventData.fillId}
   */
  i: KumaLiquidationEventData['fillId'];
  /**
   * @see inflated {@link KumaLiquidationEventData.price}
   */
  p: KumaLiquidationEventData['price'];
  /**
   * @see inflated {@link KumaLiquidationEventData.quantity}
   */
  q: KumaLiquidationEventData['quantity'];
  /**
   * @see inflated {@link KumaLiquidationEventData.quoteQuantity}
   */
  Q: KumaLiquidationEventData['quoteQuantity'];
  /**
   * @see inflated {@link KumaLiquidationEventData.time}
   */
  t: KumaLiquidationEventData['time'];
  /**
   * @see inflated {@link KumaLiquidationEventData.liquidationSide}
   */
  s: KumaLiquidationEventData['liquidationSide'];
}
