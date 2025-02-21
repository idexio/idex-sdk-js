import type { MessageEventType } from '#types/enums/index';
import type { KumaDeposit } from '#types/rest/endpoints/GetDeposits';
import type { KumaSubscriptionEventBase } from '#types/webSocket/base';

/**
 * - `deposits` updates provided to the message handler when subscribed.
 *
 * @inheritDoc KumaSubscriptionEventBase
 * @category WebSocket - Message Types
 * @category Kuma - Get Deposits
 *
 * @see data {@link KumaDepositEventData}
 */
export interface KumaDepositEvent extends KumaSubscriptionEventBase {
  /**
   * @inheritDoc
   */
  type: typeof MessageEventType.deposits;
  /**
   * @inheritDoc KumaDepositEventData
   *
   * @see type {@link KumaDepositEventData}
   */
  data: KumaDepositEventData;
}

/**
 * `deposits` events provide a specialized `data` property which is similar to {@link KumaDeposit} with the following changes:
 *
 * - `depositId`, `quantity`, `asset`, and `time` are provided from the {@link KumaDeposit} interface.
 * - WebSocket `deposits` events include additional exclusive properties:
 *   - {@link KumaDepositEventData.wallet wallet}, {@link KumaDepositEventData.quoteBalance quoteBalance}
 *
 * @see parent {@link KumaDepositEvent}
 *
 * @category WebSocket - Message Types
 * @category Kuma - Get Deposits
 */
export interface KumaDepositEventData
  extends Pick<KumaDeposit, 'depositId' | 'quantity' | 'asset' | 'time'> {
  /**
   * Wallet address associated with the deposit message.
   */
  wallet: string;
  /**
   * Quote token balance after the deposit
   */
  quoteBalance: string;
}

export interface WebSocketResponseSubscriptionMessageShortDeposits
  extends KumaSubscriptionEventBase {
  type: typeof MessageEventType.deposits;
  data: WebSocketResponseDepositsShort;
}

/**
 * @internal
 */
export interface WebSocketResponseDepositsShort {
  /**
   * @see inflated {@link KumaDepositEventData.wallet}
   */
  w: KumaDepositEventData['wallet'];
  /**
   * @see inflated {@link KumaDepositEventData.depositId}
   */
  i: KumaDepositEventData['depositId'];
  /**
   * @see inflated {@link KumaDepositEventData.asset}
   */
  a: KumaDepositEventData['asset'];
  /**
   * @see inflated {@link KumaDepositEventData.quantity}
   */
  q: KumaDepositEventData['quantity'];
  /**
   * @see inflated {@link KumaDepositEventData.quoteBalance}
   */
  qb: KumaDepositEventData['quoteBalance'];
  /**
   * @see inflated {@link KumaDepositEventData.time}
   */
  t: KumaDepositEventData['time'];
}
