import type { MessageEventType } from '#types/enums/index';
import type { KumaWithdrawal } from '#types/rest/endpoints/GetWithdrawals';
import type { KumaSubscriptionEventBase } from '#types/webSocket/base';

/**
 * When the `withdrawals` subscription provides an update
 *
 * @category WebSocket - Message Types
 * @category Kuma - Get Withdrawals
 */
export interface KumaWithdrawalEvent extends KumaSubscriptionEventBase {
  /**
   * @inheritDoc
   */
  type: typeof MessageEventType.withdrawals;
  /**
   * @inheritDoc KumaWithdrawalEventData
   *
   * @see type {@link KumaWithdrawalEventData}
   */
  data: KumaWithdrawalEventData;
}

/**
 * - Includes most properties from the REST API's {@link KumaWithdrawal} type.
 * - Additionally includes the
 *    {@link KumaWithdrawalEventData.wallet wallet},
 *    {@link KumaWithdrawalEventData.time time},
 *    and {@link KumaWithdrawalEventData.quoteBalance quoteBalance} properties.
 *
 * @category WebSocket - Message Types
 * @category Kuma - Get Withdrawals
 */
export interface KumaWithdrawalEventData
  extends Pick<KumaWithdrawal, 'withdrawalId' | 'quantity' | 'asset' | 'gas'> {
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
  extends KumaSubscriptionEventBase {
  type: typeof MessageEventType.withdrawals;
  data: WebSocketResponseWithdrawalsShort;
}

/**
 * @internal
 */
export interface WebSocketResponseWithdrawalsShort {
  /**
   * @see inflated {@link KumaWithdrawalEventData.wallet}
   */
  w: KumaWithdrawalEventData['wallet'];
  /**
   * @see inflated {@link KumaWithdrawalEventData.withdrawalId}
   */
  i: KumaWithdrawalEventData['withdrawalId'];
  /**
   * @see inflated {@link KumaWithdrawalEventData.asset}
   */
  a: KumaWithdrawalEventData['asset'];
  /**
   * @see inflated {@link KumaWithdrawalEventData.quantity}
   */
  q: KumaWithdrawalEventData['quantity'];
  /**
   * @see inflated {@link KumaWithdrawalEventData.quoteBalance}
   */
  qb: KumaWithdrawalEventData['quoteBalance'];
  /**
   * @see inflated {@link KumaWithdrawalEventData.gas}
   */
  g: KumaWithdrawalEventData['gas'];
  /**
   * @see inflated {@link KumaWithdrawalEventData.time}
   */
  t: KumaWithdrawalEventData['time'];
}
