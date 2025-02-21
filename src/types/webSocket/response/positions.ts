import type { MessageEventType, PositionEventStatus } from '#types/enums/index';
import type { KumaPosition } from '#types/rest/endpoints/GetPositions';
import type { KumaSubscriptionEventBase } from '#types/webSocket/base';

/**
 * When the `positions` subscription provides an update
 *
 * @category WebSocket - Message Types
 * @category Kuma - Get Positions
 */
export interface KumaPositionEvent extends KumaSubscriptionEventBase {
  /**
   * @inheritDoc
   */
  type: typeof MessageEventType.positions;
  /**
   * @inheritDoc KumaPositionEventData
   *
   * @see data {@link KumaPositionEventData}
   */
  data: KumaPositionEventData;
}

/**
 * - Includes most properties from the REST API's {@link KumaPosition} type.
 * - Also includes
 *   {@link KumaPositionEventData.wallet wallet},
 *   {@link KumaPositionEventData.status status},
 *   and {@link KumaPositionEventData.quoteBalance quoteBalance} properties.
 *
 * @see parent {@link KumaPositionEvent}
 *
 * @category WebSocket - Message Types
 * @category Kuma - Get Positions
 */
export interface KumaPositionEventData
  extends Pick<
    KumaPosition,
    | 'market'
    | 'time'
    | 'quantity'
    | 'maximumQuantity'
    | 'entryPrice'
    | 'exitPrice'
    | 'realizedPnL'
    | 'totalFunding'
    | 'totalOpen'
    | 'totalClose'
    | 'openedByFillId'
    | 'lastFillId'
  > {
  /**
   * Wallet address
   */
  wallet: string;
  /**
   * - {@link PositionEventStatus.open open} if position is open.
   * - {@link PositionEventStatus.closed closed} for the last update.
   *
   * @see enum {@link PositionEventStatus}
   */
  status: PositionEventStatus;
  /**
   * The total quote balance after the positions update
   */
  quoteBalance: string;
}

export interface WebSocketResponseSubscriptionMessageShortPositions
  extends KumaSubscriptionEventBase {
  type: typeof MessageEventType.positions;
  data: WebSocketResponsePositionsShort;
}

/**
 * @internal
 */
export interface WebSocketResponsePositionsShort {
  /**
   * @see inflated {@link KumaPositionEventData.wallet}
   */
  w: KumaPositionEventData['wallet'];
  /**
   * @see inflated {@link KumaPositionEventData.market}
   */
  m: KumaPositionEventData['market'];
  /**
   * @see inflated {@link KumaPositionEventData.status}
   */
  X: KumaPositionEventData['status'];
  /**
   * @see inflated {@link KumaPositionEventData.quantity}
   */
  q: KumaPositionEventData['quantity'];
  /**
   * @see inflated {@link KumaPositionEventData.maximumQuantity}
   */
  mq: KumaPositionEventData['maximumQuantity'];
  /**
   * @see inflated {@link KumaPositionEventData.entryPrice}
   */
  np: KumaPositionEventData['entryPrice'];
  /**
   * @see inflated {@link KumaPositionEventData.exitPrice}
   */
  xp: KumaPositionEventData['exitPrice'];
  /**
   * @see inflated {@link KumaPositionEventData.realizedPnL}
   */
  rn: KumaPositionEventData['realizedPnL'];
  /**
   * @see inflated {@link KumaPositionEventData.totalFunding}
   */
  f: KumaPositionEventData['totalFunding'];
  /**
   * @see inflated {@link KumaPositionEventData.totalOpen}
   */
  to: KumaPositionEventData['totalOpen'];
  /**
   * @see inflated {@link KumaPositionEventData.totalClose}
   */
  tc: KumaPositionEventData['totalClose'];
  /**
   * @see inflated {@link KumaPositionEventData.openedByFillId}
   */
  of: KumaPositionEventData['openedByFillId'];
  /**
   * @see inflated {@link KumaPositionEventData.lastFillId}
   */
  lf: KumaPositionEventData['lastFillId'];
  /**
   * @see inflated {@link KumaPositionEventData.quoteBalance}
   */
  qb: KumaPositionEventData['quoteBalance'];
  /**
   * @see inflated {@link KumaPositionEventData.time}
   */
  t: KumaPositionEventData['time'];
}
