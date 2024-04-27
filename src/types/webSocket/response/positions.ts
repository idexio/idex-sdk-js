import type { MessageEventType, PositionEventStatus } from '#types/enums/index';
import type { IDEXPosition } from '#types/rest/endpoints/GetPositions';
import type { IDEXSubscriptionEventBase } from '#types/webSocket/base';

/**
 * When the `positions` subscription provides an update
 *
 * @category WebSocket - Message Types
 * @category IDEX - Get Positions
 */
export interface IDEXPositionEvent extends IDEXSubscriptionEventBase {
  /**
   * @inheritDoc
   */
  type: typeof MessageEventType.positions;
  /**
   * @inheritDoc IDEXPositionEventData
   *
   * @see data {@link IDEXPositionEventData}
   */
  data: IDEXPositionEventData;
}

/**
 * - Includes most properties from the REST API's {@link IDEXPosition} type.
 * - Also includes
 *   {@link IDEXPositionEventData.wallet wallet},
 *   {@link IDEXPositionEventData.status status},
 *   and {@link IDEXPositionEventData.quoteBalance quoteBalance} properties.
 *
 * @see parent {@link IDEXPositionEvent}
 *
 * @category WebSocket - Message Types
 * @category IDEX - Get Positions
 */
export interface IDEXPositionEventData
  extends Pick<
    IDEXPosition,
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
  extends IDEXSubscriptionEventBase {
  type: typeof MessageEventType.positions;
  data: WebSocketResponsePositionsShort;
}

/**
 * @internal
 */
export interface WebSocketResponsePositionsShort {
  /**
   * @see inflated {@link IDEXPositionEventData.wallet}
   */
  w: IDEXPositionEventData['wallet'];
  /**
   * @see inflated {@link IDEXPositionEventData.market}
   */
  m: IDEXPositionEventData['market'];
  /**
   * @see inflated {@link IDEXPositionEventData.status}
   */
  X: IDEXPositionEventData['status'];
  /**
   * @see inflated {@link IDEXPositionEventData.quantity}
   */
  q: IDEXPositionEventData['quantity'];
  /**
   * @see inflated {@link IDEXPositionEventData.maximumQuantity}
   */
  mq: IDEXPositionEventData['maximumQuantity'];
  /**
   * @see inflated {@link IDEXPositionEventData.entryPrice}
   */
  np: IDEXPositionEventData['entryPrice'];
  /**
   * @see inflated {@link IDEXPositionEventData.exitPrice}
   */
  xp: IDEXPositionEventData['exitPrice'];
  /**
   * @see inflated {@link IDEXPositionEventData.realizedPnL}
   */
  rn: IDEXPositionEventData['realizedPnL'];
  /**
   * @see inflated {@link IDEXPositionEventData.totalFunding}
   */
  f: IDEXPositionEventData['totalFunding'];
  /**
   * @see inflated {@link IDEXPositionEventData.totalOpen}
   */
  to: IDEXPositionEventData['totalOpen'];
  /**
   * @see inflated {@link IDEXPositionEventData.totalClose}
   */
  tc: IDEXPositionEventData['totalClose'];
  /**
   * @see inflated {@link IDEXPositionEventData.openedByFillId}
   */
  of: IDEXPositionEventData['openedByFillId'];
  /**
   * @see inflated {@link IDEXPositionEventData.lastFillId}
   */
  lf: IDEXPositionEventData['lastFillId'];
  /**
   * @see inflated {@link IDEXPositionEventData.quoteBalance}
   */
  qb: IDEXPositionEventData['quoteBalance'];
  /**
   * @see inflated {@link IDEXPositionEventData.time}
   */
  t: IDEXPositionEventData['time'];
}
