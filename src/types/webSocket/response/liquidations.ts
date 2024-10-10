import type { MessageEventType } from '#types/enums/index';
import type { IDEXLiquidation } from '#types/rest/endpoints/GetLiquidations';
import type { IDEXSubscriptionEventBase } from '#types/webSocket/base';

/**
 * - `liquidations` updates provided to the message handler when subscribed.
 *
 * @inheritDoc IDEXSubscriptionEventBase
 * @category WebSocket - Message Types
 * @category IDEX - Get Liquidations
 *
 * @see enum {@link MessageEventType}
 * @see data {@link IDEXLiquidationEventData}
 */
export interface IDEXLiquidationEvent extends IDEXSubscriptionEventBase {
  /**
   * @inheritDoc
   */
  type: typeof MessageEventType.liquidations;
  /**
   * @inheritDoc IDEXLiquidationEventData
   *
   * @see type {@link IDEXLiquidationEventData}
   */
  data: IDEXLiquidationEventData;
}

/**
 * - Liquidation updates on the WebSocket include all {@link IDEXLiquidation} properties as well
 *   as the `market` symbol that corresponds to the liquidation.
 *
 * @see parent {@link IDEXLiquidationEvent}
 *
 * @category WebSocket - Message Types
 * @category IDEX - Get Liquidations
 */
export interface IDEXLiquidationEventData extends IDEXLiquidation {
  /**
   * Market symbol
   */
  market: string;
}

export interface WebSocketResponseSubscriptionMessageShortLiquidations
  extends IDEXSubscriptionEventBase {
  type: typeof MessageEventType.liquidations;
  data: WebSocketResponseLiquidationsShort;
}

/**
 * @internal
 */
export interface WebSocketResponseLiquidationsShort {
  /**
   * @see inflated {@link IDEXLiquidationEventData.market}
   */
  m: IDEXLiquidationEventData['market'];
  /**
   * @see inflated {@link IDEXLiquidationEventData.fillId}
   */
  i: IDEXLiquidationEventData['fillId'];
  /**
   * @see inflated {@link IDEXLiquidationEventData.price}
   */
  p: IDEXLiquidationEventData['price'];
  /**
   * @see inflated {@link IDEXLiquidationEventData.quantity}
   */
  q: IDEXLiquidationEventData['quantity'];
  /**
   * @see inflated {@link IDEXLiquidationEventData.quoteQuantity}
   */
  Q: IDEXLiquidationEventData['quoteQuantity'];
  /**
   * @see inflated {@link IDEXLiquidationEventData.time}
   */
  t: IDEXLiquidationEventData['time'];
  /**
   * @see inflated {@link IDEXLiquidationEventData.liquidationSide}
   */
  s: IDEXLiquidationEventData['liquidationSide'];
}
