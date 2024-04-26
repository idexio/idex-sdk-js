import type { MessageEventType } from '#types/enums/index';
import type { IDEXDeposit } from '#types/rest/endpoints/GetDeposits';
import type { IDEXSubscriptionEventBase } from '#types/webSocket/base';

/**
 * - `deposits` updates provided to the message handler when subscribed.
 *
 * @inheritDoc IDEXSubscriptionEventBase
 * @category WebSocket - Message Types
 * @category IDEX - Get Deposits
 *
 * @see data {@link IDEXDepositEventData}
 */
export interface IDEXDepositEvent extends IDEXSubscriptionEventBase {
  /**
   * @inheritDoc
   */
  type: typeof MessageEventType.deposits;
  /**
   * @inheritDoc IDEXDepositEventData
   *
   * @see type {@link IDEXDepositEventData}
   */
  data: IDEXDepositEventData;
}

/**
 * `deposits` events provide a specialized `data` property which is similar to {@link IDEXDeposit} with the following changes:
 *
 * - `depositId`, `quantity`, `asset`, and `time` are provided from the {@link IDEXDeposit} interface.
 * - WebSocket `deposits` events include additional exclusive properties:
 *   - {@link IDEXDepositEventData.wallet wallet}, {@link IDEXDepositEventData.quoteBalance quoteBalance}
 *
 * @see parent {@link IDEXDepositEvent}
 *
 * @category WebSocket - Message Types
 * @category IDEX - Get Deposits
 */
export interface IDEXDepositEventData
  extends Pick<IDEXDeposit, 'depositId' | 'quantity' | 'asset' | 'time'> {
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
  extends IDEXSubscriptionEventBase {
  type: typeof MessageEventType.deposits;
  data: WebSocketResponseDepositsShort;
}

/**
 * @internal
 */
export interface WebSocketResponseDepositsShort {
  /**
   * @see inflated {@link IDEXDepositEventData.wallet}
   */
  w: IDEXDepositEventData['wallet'];
  /**
   * @see inflated {@link IDEXDepositEventData.depositId}
   */
  i: IDEXDepositEventData['depositId'];
  /**
   * @see inflated {@link IDEXDepositEventData.asset}
   */
  a: IDEXDepositEventData['asset'];
  /**
   * @see inflated {@link IDEXDepositEventData.quantity}
   */
  q: IDEXDepositEventData['quantity'];
  /**
   * @see inflated {@link IDEXDepositEventData.quoteBalance}
   */
  qb: IDEXDepositEventData['quoteBalance'];
  /**
   * @see inflated {@link IDEXDepositEventData.time}
   */
  t: IDEXDepositEventData['time'];
}
