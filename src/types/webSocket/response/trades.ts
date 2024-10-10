import type { MessageEventType } from '#types/enums/index';
import type { IDEXTrade } from '#types/rest/endpoints/GetTrades';
import type { IDEXSubscriptionEventBase } from '#types/webSocket/base';

/**
 * When the `trades` subscription provides an update
 *
 * @category IDEX - Get Trades
 * @category WebSocket - Message Types
 */
export interface IDEXTradeEvent extends IDEXSubscriptionEventBase {
  /**
   * @inheritDoc
   */
  type: typeof MessageEventType.trades;
  /**
   * @inheritDoc IDEXTradeEventData
   *
   * @see type {@link IDEXTradeEventData}
   */
  data: IDEXTradeEventData;
}

/**
 * - Trade updates on the WebSocket include all {@link IDEXTrade} properties as well
 *   as the `market` symbol that corresponds to the trade.
 *
 * @see related {@link IDEXTrade}
 *
 * @category IDEX - Get Trades
 * @category WebSocket - Message Types
 */
export interface IDEXTradeEventData extends IDEXTrade {
  /**
   * Market Symbol
   */
  market: string;
}

export interface WebSocketResponseSubscriptionMessageShortTrades
  extends IDEXSubscriptionEventBase {
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
   * @see inflated {@link IDEXTradeEventData.market}
   */
  m: IDEXTradeEventData['market'];
  /**
   * @see related {@link RestResponseTrade.fillId}
   * @see inflated {@link IDEXTradeEventData.fillId}
   */
  i: IDEXTradeEventData['fillId'];
  /**
   * @see related {@link RestResponseTrade.price}
   * @see inflated {@link IDEXTradeEventData.price}
   */
  p: IDEXTradeEventData['price'];
  /**
   * @see related {@link RestResponseTrade.quantity}
   * @see inflated {@link IDEXTradeEventData.quantity}
   */
  q: IDEXTradeEventData['quantity'];
  /**
   * @see related {@link RestResponseTrade.quoteQuantity}
   * @see inflated {@link IDEXTradeEventData.quoteQuantity}
   */
  Q: IDEXTradeEventData['quoteQuantity'];
  /**
   * @see related {@link RestResponseTrade.time}
   * @see inflated {@link IDEXTradeEventData.time}
   */
  t: IDEXTradeEventData['time'];
  /**
   * @see enum {@link enums2.OrderSide}
   * @see related {@link RestResponseTrade.makerSide}
   * @see inflated {@link IDEXTradeEventData.makerSide}
   */
  s: IDEXTradeEventData['makerSide'];
  /**
   * @see related {@link RestResponseTrade.sequence}
   * @see inflated {@link IDEXTradeEventData.sequence}
   */
  u: IDEXTradeEventData['sequence'];
}
