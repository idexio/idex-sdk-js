import type { MessageEventType } from '#types/enums/index';
import type { IDEXWithdrawal } from '#types/rest/endpoints/GetWithdrawals';
import type { IDEXSubscriptionEventBase } from '#types/webSocket/base';

/**
 * When the `withdrawals` subscription provides an update
 *
 * @category WebSocket - Message Types
 * @category IDEX - Get Withdrawals
 */
export interface IDEXWithdrawalEvent extends IDEXSubscriptionEventBase {
  /**
   * @inheritDoc
   */
  type: typeof MessageEventType.withdrawals;
  /**
   * @inheritDoc IDEXWithdrawalEventData
   *
   * @see type {@link IDEXWithdrawalEventData}
   */
  data: IDEXWithdrawalEventData;
}

/**
 * - Includes most properties from the REST API's {@link IDEXWithdrawal} type.
 * - Additionally includes the
 *    {@link IDEXWithdrawalEventData.wallet wallet},
 *    {@link IDEXWithdrawalEventData.time time},
 *    and {@link IDEXWithdrawalEventData.quoteBalance quoteBalance} properties.
 *
 * @category WebSocket - Message Types
 * @category IDEX - Get Withdrawals
 */
export interface IDEXWithdrawalEventData
  extends Pick<IDEXWithdrawal, 'withdrawalId' | 'quantity' | 'asset' | 'gas'> {
  /**
   * Wallet address
   */
  wallet: string;
  /**
   * Quote token balance after the withdrawal
   */
  quoteBalance: string;
  /**
   * Timestamp of debiting the withdrawn frond from the exchange
   */
  time: number;
}

export interface WebSocketResponseSubscriptionMessageShortWithdrawals
  extends IDEXSubscriptionEventBase {
  type: typeof MessageEventType.withdrawals;
  data: WebSocketResponseWithdrawalsShort;
}

/**
 * @internal
 */
export interface WebSocketResponseWithdrawalsShort {
  /**
   * @see inflated {@link IDEXWithdrawalEventData.wallet}
   */
  w: IDEXWithdrawalEventData['wallet'];
  /**
   * @see inflated {@link IDEXWithdrawalEventData.withdrawalId}
   */
  i: IDEXWithdrawalEventData['withdrawalId'];
  /**
   * @see inflated {@link IDEXWithdrawalEventData.asset}
   */
  a: IDEXWithdrawalEventData['asset'];
  /**
   * @see inflated {@link IDEXWithdrawalEventData.quantity}
   */
  q: IDEXWithdrawalEventData['quantity'];
  /**
   * @see inflated {@link IDEXWithdrawalEventData.quoteBalance}
   */
  qb: IDEXWithdrawalEventData['quoteBalance'];
  /**
   * @see inflated {@link IDEXWithdrawalEventData.gas}
   */
  g: IDEXWithdrawalEventData['gas'];
  /**
   * @see inflated {@link IDEXWithdrawalEventData.time}
   */
  t: IDEXWithdrawalEventData['time'];
}
