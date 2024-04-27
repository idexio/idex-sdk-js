import type { MessageEventType } from '#types/enums/index';
import type { IDEXTicker } from '#types/rest/endpoints/GetTickers';
import type { IDEXSubscriptionEventBase } from '#types/webSocket/base';
/**
 * When the `tickers` subscription provides an update
 *
 * @category WebSocket - Message Types
 * @category IDEX - Get Tickers
 */
export interface IDEXTickerEvent extends IDEXSubscriptionEventBase {
  /**
   * @inheritDoc
   */
  type: typeof MessageEventType.tickers;
  /**
   * @inheritDoc IDEXOrderFillEventData
   *
   * @see type {@link IDEXTickerEventData}
   */
  data: IDEXTickerEventData;
}

/**
 * Represents the type found on the {@link IDEXTickerEvent.data} property.
 *
 * - An alias of the {@link IDEXTicker} interface.
 *
 * @see parent {@link IDEXTickerEvent}
 *
 * @category WebSocket - Message Types
 */
export type IDEXTickerEventData = IDEXTicker;

export interface WebSocketResponseSubscriptionMessageShortTickers
  extends IDEXSubscriptionEventBase {
  type: typeof MessageEventType.tickers;
  data: WebSocketResponseTickerShort;
}

/**
 * @internal
 *
 * Ticker response from the WebSocket, which is a deflated version of {@link RestResponseTicker}
 */
export interface WebSocketResponseTickerShort {
  /**
   * @see inflated {@link RestResponseTicker.market}
   */
  m: IDEXTickerEventData['market'];
  /**
   * @see inflated {@link RestResponseTicker.time}
   */
  t: IDEXTickerEventData['time'];
  /**
   * @see inflated {@link RestResponseTicker.open}
   */
  o: IDEXTickerEventData['open'];
  /**
   * @see inflated {@link RestResponseTicker.high}
   */
  h: IDEXTickerEventData['high'];
  /**
   * @see inflated {@link RestResponseTicker.low}
   */
  l: IDEXTickerEventData['low'];
  /**
   * @see inflated {@link RestResponseTicker.close}
   */
  c: IDEXTickerEventData['close'];
  /**
   * @see inflated {@link RestResponseTicker.closeQuantity}
   */
  Q: IDEXTickerEventData['closeQuantity'];
  /**
   * @see inflated {@link RestResponseTicker.baseVolume}
   */
  v: IDEXTickerEventData['baseVolume'];
  /**
   * @see inflated {@link RestResponseTicker.quoteVolume}
   */
  q: IDEXTickerEventData['quoteVolume'];
  /**
   * @see inflated {@link RestResponseTicker.percentChange}
   */
  P: IDEXTickerEventData['percentChange'];
  /**
   * @see inflated {@link RestResponseTicker.trades}
   */
  n: IDEXTickerEventData['trades'];
  /**
   * @see inflated {@link RestResponseTicker.ask}
   */
  a: IDEXTickerEventData['ask'];
  /**
   * @see inflated {@link RestResponseTicker.bid}
   */
  b: IDEXTickerEventData['bid'];
  /**
   * @see inflated {@link RestResponseTicker.markPrice}
   */
  mp: IDEXTickerEventData['markPrice'];
  /**
   * @see inflated {@link RestResponseTicker.indexPrice}
   */
  ip: IDEXTickerEventData['indexPrice'];
  /**
   * @see inflated {@link RestResponseTicker.indexPrice24h}
   */
  id: IDEXTickerEventData['indexPrice24h'];
  /**
   * @see inflated {@link RestResponseTicker.indexPricePercentChange}
   */
  iP: IDEXTickerEventData['indexPricePercentChange'];
  /**
   * @see inflated {@link RestResponseTicker.lastFundingRate}
   */
  lf: IDEXTickerEventData['lastFundingRate'];
  /**
   * @see inflated {@link RestResponseTicker.currentFundingRate}
   */
  nf: IDEXTickerEventData['currentFundingRate'];
  /**
   * @see inflated {@link RestResponseTicker.nextFundingTime}
   */
  ft: IDEXTickerEventData['nextFundingTime'];
  /**
   * @see inflated {@link RestResponseTicker.openInterest}
   */
  oi: IDEXTickerEventData['openInterest'];

  /**
   * @see inflated {@link RestResponseTicker.sequence}
   */
  u: IDEXTickerEventData['sequence'];
}
