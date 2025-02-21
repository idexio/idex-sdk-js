import type { MessageEventType } from '#types/enums/index';
import type { KumaTrade } from '#types/rest/endpoints/GetTrades';
import type { KumaSubscriptionEventBase } from '#types/webSocket/base';

/**
 * When the `trades` subscription provides an update
 *
 * @category Kuma - Get Trades
 * @category WebSocket - Message Types
 */
export interface KumaTradeEvent extends KumaSubscriptionEventBase {
  /**
   * @inheritDoc
   */
  type: typeof MessageEventType.trades;
  /**
   * @inheritDoc KumaTradeEventData
   *
   * @see type {@link KumaTradeEventData}
   */
  data: KumaTradeEventData;
}

/**
 * - Trade updates on the WebSocket include all {@link KumaTrade} properties as well
 *   as the `market` symbol that corresponds to the trade.
 *
 * @see related {@link KumaTrade}
 *
 * @category Kuma - Get Trades
 * @category WebSocket - Message Types
 */
export interface KumaTradeEventData extends KumaTrade {
  /**
   * Market Symbol
   */
  market: string;
}

export interface WebSocketResponseSubscriptionMessageShortTrades
  extends KumaSubscriptionEventBase {
  type: typeof MessageEventType.trades;
  data: WebSocketResponseTradeShort;
}

/**
 * @internal
 *
 * WebSocket Response Trade - Short (Deflated)
 *
 * An extended version used by WebSocket of {@link RestResponseTrade}
 */
export interface WebSocketResponseTradeShort {
  /**
   * @see inflated {@link KumaTradeEventData.market}
   */
  m: KumaTradeEventData['market'];
  /**
   * @see related {@link RestResponseTrade.fillId}
   * @see inflated {@link KumaTradeEventData.fillId}
   */
  i: KumaTradeEventData['fillId'];
  /**
   * @see related {@link RestResponseTrade.price}
   * @see inflated {@link KumaTradeEventData.price}
   */
  p: KumaTradeEventData['price'];
  /**
   * @see related {@link RestResponseTrade.quantity}
   * @see inflated {@link KumaTradeEventData.quantity}
   */
  q: KumaTradeEventData['quantity'];
  /**
   * @see related {@link RestResponseTrade.quoteQuantity}
   * @see inflated {@link KumaTradeEventData.quoteQuantity}
   */
  Q: KumaTradeEventData['quoteQuantity'];
  /**
   * @see related {@link RestResponseTrade.time}
   * @see inflated {@link KumaTradeEventData.time}
   */
  t: KumaTradeEventData['time'];
  /**
   * @see enum {@link enums2.OrderSide}
   * @see related {@link RestResponseTrade.makerSide}
   * @see inflated {@link KumaTradeEventData.makerSide}
   */
  s: KumaTradeEventData['makerSide'];
  /**
   * @see related {@link RestResponseTrade.sequence}
   * @see inflated {@link KumaTradeEventData.sequence}
   */
  u: KumaTradeEventData['sequence'];
}
