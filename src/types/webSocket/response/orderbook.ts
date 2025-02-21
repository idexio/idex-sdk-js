import type { MessageEventType } from '#types/enums/index';
import type {
  KumaOrderBook,
  OrderBookPriceLevel,
  RestResponseGetOrderBookLevel2,
} from '#types/rest/endpoints/GetOrderBook';
import type { KumaSubscriptionEventBase } from '#types/webSocket/base';

/**
 * - `l1orderbook` updates provided to the message handler when subscribed.
 *
 * @inheritDoc KumaSubscriptionEventBase
 *
 * @category WebSocket - Message Types
 * @category Kuma - Get OrderBook
 *
 * @see enum {@link MessageEventType}
 * @see data {@link KumaOrderBookLevel1EventData}
 */
export interface KumaOrderBookLevel1Event extends KumaSubscriptionEventBase {
  /**
   * @inheritDoc
   */
  type: typeof MessageEventType.l1orderbook;
  /**
   * @inheritDoc KumaOrderBookLevel1EventData
   *
   * @see type {@link KumaOrderBookLevel1EventData}
   */
  data: KumaOrderBookLevel1EventData;
}

/**
 * Level-1 event messages include properties that help indicate what changes
 * were made that triggered the message event.
 *
 * @see parent {@link KumaOrderBookLevel1Event}
 *
 * @category Kuma - Get OrderBook
 * @category WebSocket - Message Types
 */
export interface KumaOrderBookLevel1EventData
  extends Pick<KumaOrderBook, 'markPrice' | 'indexPrice' | 'lastPrice'> {
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
 * @inheritDoc KumaSubscriptionEventBase
 * @category WebSocket - Message Types
 * @category Kuma - Get OrderBook
 *
 * @see data {@link KumaOrderBookLevel2EventData}
 */
export interface KumaOrderBookLevel2Event extends KumaSubscriptionEventBase {
  /**
   * @inheritDoc
   */
  type: 'l2orderbook';
  /**
   * @inheritDoc KumaOrderBookLevel2EventData
   *
   * @see type {@link KumaOrderBookLevel2EventData}
   */
  data: KumaOrderBookLevel2EventData;
}

/**
 * - Level-2 OrderBook updates are identical to {@link RestResponseGetOrderBookLevel2}
 *   but also include a {@link KumaOrderBookLevel2EventData.market market} and
 *   {@link KumaOrderBookLevel2EventData.time time} property.
 *
 * @see parent {@link KumaOrderBookLevel2Event}
 *
 * @category Kuma - Get OrderBook
 * @category WebSocket - Message Types
 */
export interface KumaOrderBookLevel2EventData
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
  extends KumaSubscriptionEventBase {
  type: 'l1orderbook';
  data: WebSocketResponseL1OrderBookShort;
}

export interface WebSocketResponseSubscriptionMessageShortL2Orderbook
  extends KumaSubscriptionEventBase {
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
   * @see inflated {@link KumaOrderBookLevel1EventData.market}
   */
  m: KumaOrderBookLevel1EventData['market'];
  /**
   * @see inflated {@link KumaOrderBookLevel1EventData.time}
   */
  t: KumaOrderBookLevel1EventData['time'];
  /**
   * @see inflated {@link KumaOrderBookLevel1EventData.bidPrice}
   */
  b: KumaOrderBookLevel1EventData['bidPrice'];
  /**
   * @see inflated {@link KumaOrderBookLevel1EventData.bidQuantity}
   */
  B: KumaOrderBookLevel1EventData['bidQuantity'];
  /**
   * @see inflated {@link KumaOrderBookLevel1EventData.askPrice}
   */
  a: KumaOrderBookLevel1EventData['askPrice'];
  /**
   * @see inflated {@link KumaOrderBookLevel1EventData.askQuantity}
   */
  A: KumaOrderBookLevel1EventData['askQuantity'];
  /**
   * @see related {@link RestResponseOrderBook.lastPrice}
   * @see inflated {@link KumaOrderBookLevel1EventData.lastPrice}
   */
  lp: KumaOrderBookLevel1EventData['lastPrice'];
  /**
   * @see related {@link RestResponseOrderBook.markPrice}
   * @see inflated {@link KumaOrderBookLevel1EventData.markPrice}
   */
  mp: KumaOrderBookLevel1EventData['markPrice'];
  /**
   * @see related {@link RestResponseOrderBook.indexPrice}
   * @see inflated {@link KumaOrderBookLevel1EventData.indexPrice}
   */
  ip: KumaOrderBookLevel1EventData['indexPrice'];
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
   * @see inflated {@link KumaOrderBookLevel2EventData.market}
   */
  m: string;
  /**
   * @see inflated {@link KumaOrderBookLevel2EventData.time}
   */
  t: number;
  /**
   * @see related {@link RestResponseGetOrderBookLevel2.sequence}
   * @see inflated {@link KumaOrderBookLevel2EventData.sequence}
   */
  u: KumaOrderBookLevel2EventData['sequence'];
  /**
   * @see related {@link RestResponseGetOrderBookLevel2.bids}
   * @see inflated {@link KumaOrderBookLevel2EventData.bids}
   */
  b: KumaOrderBookLevel2EventData['bids'];
  /**
   * @see related {@link RestResponseGetOrderBookLevel2.asks}
   * @see inflated {@link KumaOrderBookLevel2EventData.asks}
   */
  a: KumaOrderBookLevel2EventData['asks'];
  /**
   * @see related {@link RestResponseGetOrderBookLevel2.lastPrice}
   * @see inflated {@link KumaOrderBookLevel2EventData.lastPrice}
   */
  lp: KumaOrderBookLevel2EventData['lastPrice'];
  /**
   * @see related {@link RestResponseGetOrderBookLevel2.markPrice}
   * @see inflated {@link KumaOrderBookLevel2EventData.markPrice}
   */
  mp: KumaOrderBookLevel2EventData['markPrice'];
  /**
   * @see related {@link RestResponseGetOrderBookLevel2.indexPrice}
   * @see inflated {@link KumaOrderBookLevel2EventData.indexPrice}
   */
  ip: KumaOrderBookLevel2EventData['indexPrice'];
}
