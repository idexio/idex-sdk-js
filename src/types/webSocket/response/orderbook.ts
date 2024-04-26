import type { MessageEventType } from '#types/enums/index';
import type {
  IDEXOrderBook,
  OrderBookPriceLevel,
  RestResponseGetOrderBookLevel2,
} from '#types/rest/endpoints/GetOrderBook';
import type { IDEXSubscriptionEventBase } from '#types/webSocket/base';

/**
 * - `l1orderbook` updates provided to the message handler when subscribed.
 *
 * @inheritDoc IDEXSubscriptionEventBase
 *
 * @category WebSocket - Message Types
 * @category IDEX - Get OrderBook
 *
 * @see enum {@link MessageEventType}
 * @see data {@link IDEXOrderBookLevel1EventData}
 */
export interface IDEXOrderBookLevel1Event extends IDEXSubscriptionEventBase {
  /**
   * @inheritDoc
   */
  type: typeof MessageEventType.l1orderbook;
  /**
   * @inheritDoc IDEXOrderBookLevel1EventData
   *
   * @see type {@link IDEXOrderBookLevel1EventData}
   */
  data: IDEXOrderBookLevel1EventData;
}

/**
 * Level-1 event messages include properties that help indicate what changes
 * were made that triggered the message event.
 *
 * @see parent {@link IDEXOrderBookLevel1Event}
 *
 * @category IDEX - Get OrderBook
 * @category WebSocket - Message Types
 */
export interface IDEXOrderBookLevel1EventData
  extends Pick<IDEXOrderBook, 'markPrice' | 'indexPrice' | 'lastPrice'> {
  /**
   * Market symbol
   */
  market: string; // m
  /**
   * Timestamp of the order book update
   */
  time: number; // t
  /**
   * Best bid price
   *
   * @see tuple {@link OrderBookPriceLevel}.price
   */
  bidPrice: OrderBookPriceLevel[0]; // b
  /**
   * Quantity available at the best bid price
   *
   * @see tuple {@link OrderBookPriceLevel}.size
   */
  bidQuantity: OrderBookPriceLevel[1]; // B
  /**
   * Best ask price
   *
   * @see tuple {@link OrderBookPriceLevel}.price
   */
  askPrice: OrderBookPriceLevel[0];
  /**
   * Quantity available at the best ask price
   *
   * @see tuple {@link OrderBookPriceLevel}.size
   */
  askQuantity: OrderBookPriceLevel[1];
}

/**
 * - Level-2 updates provided to the message handler when subscribed.
 *
 * @inheritDoc IDEXSubscriptionEventBase
 * @category WebSocket - Message Types
 * @category IDEX - Get OrderBook
 *
 * @see data {@link IDEXOrderBookLevel2EventData}
 */
export interface IDEXOrderBookLevel2Event extends IDEXSubscriptionEventBase {
  /**
   * @inheritDoc
   */
  type: 'l2orderbook';
  /**
   * @inheritDoc IDEXOrderBookLevel2EventData
   *
   * @see type {@link IDEXOrderBookLevel2EventData}
   */
  data: IDEXOrderBookLevel2EventData;
}

/**
 * - Level-2 OrderBook updates are identical to {@link RestResponseGetOrderBookLevel2}
 *   but also include a {@link IDEXOrderBookLevel2EventData.market market} and
 *   {@link IDEXOrderBookLevel2EventData.time time} property.
 *
 * @see parent {@link IDEXOrderBookLevel2Event}
 *
 * @category IDEX - Get OrderBook
 * @category WebSocket - Message Types
 */
export interface IDEXOrderBookLevel2EventData
  extends RestResponseGetOrderBookLevel2 {
  /**
   * Market symbol
   */
  market: string; // m
  /**
   * Timestamp of the order book update
   */
  time: number; // t
}

export interface WebSocketResponseSubscriptionMessageShortL1Orderbook
  extends IDEXSubscriptionEventBase {
  type: 'l1orderbook';
  data: WebSocketResponseL1OrderBookShort;
}

export interface WebSocketResponseSubscriptionMessageShortL2Orderbook
  extends IDEXSubscriptionEventBase {
  type: 'l2orderbook';
  data: WebSocketResponseL2OrderBookShort;
}

/**
 * @internal
 *
 * WebSocket Response Order Book (Level 1) - Short (Deflated)
 *
 * An extended version used by WebSocket of {@link RestResponseOrderBookLevel1}
 */
export interface WebSocketResponseL1OrderBookShort {
  /**
   * @see inflated {@link IDEXOrderBookLevel1EventData.market}
   */
  m: IDEXOrderBookLevel1EventData['market'];
  /**
   * @see inflated {@link IDEXOrderBookLevel1EventData.time}
   */
  t: IDEXOrderBookLevel1EventData['time'];
  /**
   * @see inflated {@link IDEXOrderBookLevel1EventData.bidPrice}
   */
  b: IDEXOrderBookLevel1EventData['bidPrice'];
  /**
   * @see inflated {@link IDEXOrderBookLevel1EventData.bidQuantity}
   */
  B: IDEXOrderBookLevel1EventData['bidQuantity'];
  /**
   * @see inflated {@link IDEXOrderBookLevel1EventData.askPrice}
   */
  a: IDEXOrderBookLevel1EventData['askPrice'];
  /**
   * @see inflated {@link IDEXOrderBookLevel1EventData.askQuantity}
   */
  A: IDEXOrderBookLevel1EventData['askQuantity'];
  /**
   * @see related {@link RestResponseOrderBook.lastPrice}
   * @see inflated {@link IDEXOrderBookLevel1EventData.lastPrice}
   */
  lp: IDEXOrderBookLevel1EventData['lastPrice'];
  /**
   * @see related {@link RestResponseOrderBook.markPrice}
   * @see inflated {@link IDEXOrderBookLevel1EventData.markPrice}
   */
  mp: IDEXOrderBookLevel1EventData['markPrice'];
  /**
   * @see related {@link RestResponseOrderBook.indexPrice}
   * @see inflated {@link IDEXOrderBookLevel1EventData.indexPrice}
   */
  ip: IDEXOrderBookLevel1EventData['indexPrice'];
}

/**
 * @internal
 *
 * WebSocket Response Order Book (Level 2) - Short (Deflated)
 *
 * An extended version used by WebSocket of {@link RestResponseGetOrderBookLevel2}
 */
export interface WebSocketResponseL2OrderBookShort {
  /**
   * @see inflated {@link IDEXOrderBookLevel2EventData.market}
   */
  m: string;
  /**
   * @see inflated {@link IDEXOrderBookLevel2EventData.time}
   */
  t: number;
  /**
   * @see related {@link RestResponseGetOrderBookLevel2.sequence}
   * @see inflated {@link IDEXOrderBookLevel2EventData.sequence}
   */
  u: IDEXOrderBookLevel2EventData['sequence'];
  /**
   * @see related {@link RestResponseGetOrderBookLevel2.bids}
   * @see inflated {@link IDEXOrderBookLevel2EventData.bids}
   */
  b: IDEXOrderBookLevel2EventData['bids'];
  /**
   * @see related {@link RestResponseGetOrderBookLevel2.asks}
   * @see inflated {@link IDEXOrderBookLevel2EventData.asks}
   */
  a: IDEXOrderBookLevel2EventData['asks'];
  /**
   * @see related {@link RestResponseGetOrderBookLevel2.lastPrice}
   * @see inflated {@link IDEXOrderBookLevel2EventData.lastPrice}
   */
  lp: IDEXOrderBookLevel2EventData['lastPrice'];
  /**
   * @see related {@link RestResponseGetOrderBookLevel2.markPrice}
   * @see inflated {@link IDEXOrderBookLevel2EventData.markPrice}
   */
  mp: IDEXOrderBookLevel2EventData['markPrice'];
  /**
   * @see related {@link RestResponseGetOrderBookLevel2.indexPrice}
   * @see inflated {@link IDEXOrderBookLevel2EventData.indexPrice}
   */
  ip: IDEXOrderBookLevel2EventData['indexPrice'];
}
