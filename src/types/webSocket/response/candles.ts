import type { MessageEventType } from '#types/enums/index';
import type { CandleInterval } from '#types/enums/request';
import type { KumaCandle } from '#types/rest/endpoints/GetCandles';
import type { KumaSubscriptionEventBase } from '#types/webSocket/base';

/**
 * - `candles` updates provided to the message handler when subscribed.
 *
 * @inheritDoc KumaSubscriptionEventBase
 * @category WebSocket - Message Types
 * @category Kuma - Get Candles
 *
 * @see {@link KumaSubscriptionEventBase}
 */
export interface KumaCandleEvent extends KumaSubscriptionEventBase {
  /**
   * @inheritDoc
   */
  type: typeof MessageEventType.candles;
  /**
   * @inheritDoc KumaCandleEventData
   *
   * @see type {@link KumaCandleEventData}
   */
  data: KumaCandleEventData;
}

/**
 * - Extended {@link KumaCandle} which includes additional properties for WebSocket messages:
 *   - {@link KumaCandleEventData.market market},
 *     {@link KumaCandleEventData.time time},
 *     {@link KumaCandleEventData.interval interval},
 *     {@link KumaCandleEventData.end end},
 *     {@link KumaCandleEventData.trades trades}
 *
 * @see parent {@link KumaCandleEvent}
 *
 * @category WebSocket - Message Types
 * @category Kuma - Get Candles
 */
export interface KumaCandleEventData extends KumaCandle {
  /**
   * Market symbol
   */
  market: string;
  /**
   * Timestamp when the statistics were computed, `time` is always
   * between the {@link start} and {@link close} timestamps
   * of the interval
   */
  time: number;
  /**
   * Interval duration of the candle.
   *
   * @see enum {@link CandleInterval}
   */
  interval: CandleInterval;
  /**
   * Timestamp of the end of the {@link interval}
   */
  end: number;
  /**
   * Number of trades in the {@link interval}
   */
  trades: number;
}

export interface WebSocketResponseSubscriptionMessageShortCandles
  extends KumaSubscriptionEventBase {
  type: typeof MessageEventType.candles;
  data: WebSocketResponseCandleShort;
}

/**
 * @internal
 *
 * WebSocket Response Candle - Short (Deflated)
 *
 * An extended version used by WebSocket of {@link KumaCandle}
 */
export interface WebSocketResponseCandleShort {
  /**
   * @see inflated {@link KumaCandleEventData.market}
   */
  m: KumaCandleEventData['market'];
  /**
   * @see inflated {@link KumaCandleEventData.time}
   */
  t: KumaCandleEventData['time'];
  /**
   * @see inflated {@link KumaCandleEventData.interval}
   */
  i: KumaCandleEventData['interval'];
  /**
   * @see inflated {@link KumaCandleEventData.start}
   */
  s: KumaCandleEventData['start'];
  /**
   * @see inflated {@link KumaCandleEventData.end}
   */
  e: KumaCandleEventData['end'];
  /**
   * @see related {@link KumaCandle.open}
   * @see inflated {@link KumaCandleEventData.open}
   */
  o: KumaCandleEventData['open'];
  /**
   * @see related {@link KumaCandle.high}
   * @see inflated {@link KumaCandleEventData.high}
   */
  h: KumaCandleEventData['high'];
  /**
   * @see related {@link KumaCandle.low}
   * @see inflated {@link KumaCandleEventData.low}
   */
  l: KumaCandleEventData['low'];
  /**
   * @see related {@link KumaCandle.close}
   * @see inflated {@link KumaCandleEventData.close}
   */
  c: KumaCandleEventData['close'];
  /**
   * @see {@link KumaCandle.baseVolume}
   * @see inflated {@link KumaCandleEventData.baseVolume}
   */
  v: KumaCandleEventData['baseVolume'];
  /**
   * @see related {@link KumaCandle.quoteVolume}
   * @see inflated {@link KumaCandleEventData.quoteVolume}
   */
  q: KumaCandleEventData['quoteVolume'];
  /**
   * @see related {@link KumaCandle.trades}
   * @see inflated {@link KumaCandleEventData.trades}
   */
  n: KumaCandleEventData['trades'];
  /**
   * @see related {@link KumaCandle.sequence}
   * @see inflated {@link KumaCandleEventData.sequence}
   */
  u: KumaCandleEventData['sequence'];
}
