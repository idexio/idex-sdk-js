import type { MessageEventType } from '#types/enums/index';
import type { KumaTicker } from '#types/rest/endpoints/GetTickers';
import type { KumaSubscriptionEventBase } from '#types/webSocket/base';
/**
 * When the `tickers` subscription provides an update
 *
 * @category WebSocket - Message Types
 * @category Kuma - Get Tickers
 */
export interface KumaTickerEvent extends KumaSubscriptionEventBase {
  /**
   * @inheritDoc
   */
  type: typeof MessageEventType.tickers;
  /**
   * @inheritDoc KumaOrderFillEventData
   *
   * @see type {@link KumaTickerEventData}
   */
  data: KumaTickerEventData;
}

/**
 * Represents the type found on the {@link KumaTickerEvent.data} property.
 *
 * - An alias of the {@link KumaTicker} interface.
 *
 * @see parent {@link KumaTickerEvent}
 *
 * @category WebSocket - Message Types
 */
export type KumaTickerEventData = KumaTicker;

export interface WebSocketResponseSubscriptionMessageShortTickers
  extends KumaSubscriptionEventBase {
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
  m: KumaTickerEventData['market'];
  /**
   * @see inflated {@link RestResponseTicker.time}
   */
  t: KumaTickerEventData['time'];
  /**
   * @see inflated {@link RestResponseTicker.open}
   */
  o: KumaTickerEventData['open'];
  /**
   * @see inflated {@link RestResponseTicker.high}
   */
  h: KumaTickerEventData['high'];
  /**
   * @see inflated {@link RestResponseTicker.low}
   */
  l: KumaTickerEventData['low'];
  /**
   * @see inflated {@link RestResponseTicker.close}
   */
  c: KumaTickerEventData['close'];
  /**
   * @see inflated {@link RestResponseTicker.closeQuantity}
   */
  Q: KumaTickerEventData['closeQuantity'];
  /**
   * @see inflated {@link RestResponseTicker.baseVolume}
   */
  v: KumaTickerEventData['baseVolume'];
  /**
   * @see inflated {@link RestResponseTicker.quoteVolume}
   */
  q: KumaTickerEventData['quoteVolume'];
  /**
   * @see inflated {@link RestResponseTicker.percentChange}
   */
  P: KumaTickerEventData['percentChange'];
  /**
   * @see inflated {@link RestResponseTicker.trades}
   */
  n: KumaTickerEventData['trades'];
  /**
   * @see inflated {@link RestResponseTicker.ask}
   */
  a: KumaTickerEventData['ask'];
  /**
   * @see inflated {@link RestResponseTicker.bid}
   */
  b: KumaTickerEventData['bid'];
  /**
   * @see inflated {@link RestResponseTicker.markPrice}
   */
  mp: KumaTickerEventData['markPrice'];
  /**
   * @see inflated {@link RestResponseTicker.indexPrice}
   */
  ip: KumaTickerEventData['indexPrice'];
  /**
   * @see inflated {@link RestResponseTicker.indexPrice24h}
   */
  id: KumaTickerEventData['indexPrice24h'];
  /**
   * @see inflated {@link RestResponseTicker.indexPricePercentChange}
   */
  iP: KumaTickerEventData['indexPricePercentChange'];
  /**
   * @see inflated {@link RestResponseTicker.lastFundingRate}
   */
  lf: KumaTickerEventData['lastFundingRate'];
  /**
   * @see inflated {@link RestResponseTicker.currentFundingRate}
   */
  nf: KumaTickerEventData['currentFundingRate'];
  /**
   * @see inflated {@link RestResponseTicker.nextFundingTime}
   */
  ft: KumaTickerEventData['nextFundingTime'];
  /**
   * @see inflated {@link RestResponseTicker.openInterest}
   */
  oi: KumaTickerEventData['openInterest'];

  /**
   * @see inflated {@link RestResponseTicker.sequence}
   */
  u: KumaTickerEventData['sequence'];
}
