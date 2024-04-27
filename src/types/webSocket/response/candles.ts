import type { MessageEventType } from '#types/enums/index';
import type { CandleInterval } from '#types/enums/request';
import type { IDEXCandle } from '#types/rest/endpoints/GetCandles';
import type { IDEXSubscriptionEventBase } from '#types/webSocket/base';

/**
 * - `candles` updates provided to the message handler when subscribed.
 *
 * @inheritDoc IDEXSubscriptionEventBase
 * @category WebSocket - Message Types
 * @category IDEX - Get Candles
 *
 * @see {@link IDEXSubscriptionEventBase}
 */
export interface IDEXCandleEvent extends IDEXSubscriptionEventBase {
  /**
   * @inheritDoc
   */
  type: typeof MessageEventType.candles;
  /**
   * @inheritDoc IDEXCandleEventData
   *
   * @see type {@link IDEXCandleEventData}
   */
  data: IDEXCandleEventData;
}

/**
 * - Extended {@link IDEXCandle} which includes additional properties for WebSocket messages:
 *   - {@link IDEXCandleEventData.market market},
 *     {@link IDEXCandleEventData.time time},
 *     {@link IDEXCandleEventData.interval interval},
 *     {@link IDEXCandleEventData.end end},
 *     {@link IDEXCandleEventData.trades trades}
 *
 * @see parent {@link IDEXCandleEvent}
 *
 * @category WebSocket - Message Types
 * @category IDEX - Get Candles
 */
export interface IDEXCandleEventData extends IDEXCandle {
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
  extends IDEXSubscriptionEventBase {
  type: typeof MessageEventType.candles;
  data: WebSocketResponseCandleShort;
}

/**
 * @internal
 *
 * WebSocket Response Candle - Short (Deflated)
 *
 * An extended version used by WebSocket of {@link IDEXCandle}
 */
export interface WebSocketResponseCandleShort {
  /**
   * @see inflated {@link IDEXCandleEventData.market}
   */
  m: IDEXCandleEventData['market'];
  /**
   * @see inflated {@link IDEXCandleEventData.time}
   */
  t: IDEXCandleEventData['time'];
  /**
   * @see inflated {@link IDEXCandleEventData.interval}
   */
  i: IDEXCandleEventData['interval'];
  /**
   * @see inflated {@link IDEXCandleEventData.start}
   */
  s: IDEXCandleEventData['start'];
  /**
   * @see inflated {@link IDEXCandleEventData.end}
   */
  e: IDEXCandleEventData['end'];
  /**
   * @see related {@link IDEXCandle.open}
   * @see inflated {@link IDEXCandleEventData.open}
   */
  o: IDEXCandleEventData['open'];
  /**
   * @see related {@link IDEXCandle.high}
   * @see inflated {@link IDEXCandleEventData.high}
   */
  h: IDEXCandleEventData['high'];
  /**
   * @see related {@link IDEXCandle.low}
   * @see inflated {@link IDEXCandleEventData.low}
   */
  l: IDEXCandleEventData['low'];
  /**
   * @see related {@link IDEXCandle.close}
   * @see inflated {@link IDEXCandleEventData.close}
   */
  c: IDEXCandleEventData['close'];
  /**
   * @see {@link IDEXCandle.baseVolume}
   * @see inflated {@link IDEXCandleEventData.baseVolume}
   */
  v: IDEXCandleEventData['baseVolume'];
  /**
   * @see related {@link IDEXCandle.quoteVolume}
   * @see inflated {@link IDEXCandleEventData.quoteVolume}
   */
  q: IDEXCandleEventData['quoteVolume'];
  /**
   * @see related {@link IDEXCandle.trades}
   * @see inflated {@link IDEXCandleEventData.trades}
   */
  n: IDEXCandleEventData['trades'];
  /**
   * @see related {@link IDEXCandle.sequence}
   * @see inflated {@link IDEXCandleEventData.sequence}
   */
  u: IDEXCandleEventData['sequence'];
}
