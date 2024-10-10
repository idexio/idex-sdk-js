import type { MessageEventType } from '#types/enums/index';
import type { IDEXFundingPayment } from '#types/rest/endpoints/GetFundingPayments';
import type { Expand } from '#types/utils';
import type { IDEXSubscriptionEventBase } from '#types/webSocket/base';

/**
 * - `fundingPayments` updates provided to the message handler when subscribed.
 *
 * @inheritDoc IDEXSubscriptionEventBase
 *
 * @category WebSocket - Message Types
 * @category IDEX - Get Funding Payments
 *
 * @see data {@link IDEXFundingPaymentEventData}
 */
export interface IDEXFundingPaymentEvent extends IDEXSubscriptionEventBase {
  /**
   * @inheritDoc
   */
  type: typeof MessageEventType.fundingPayments;
  /**
   * - Includes all {@link IDEXFundingPayment} properties as well as a `wallet` property.
   *
   * @see type {@link IDEXFundingPaymentEventData}
   */
  data: Expand<IDEXFundingPaymentEventData>;
}

/**
 * WebSocket position messages are identical to the REST API response
 * except they also include the `wallet` property.
 *
 * @see parent  {@link IDEXFundingPaymentEvent}
 *
 * @category WebSocket - Message Types
 */
export interface IDEXFundingPaymentEventData extends IDEXFundingPayment {
  /**
   * Wallet address
   */
  wallet: string;
}

export interface WebSocketResponseSubscriptionMessageShortFundingPayments
  extends IDEXSubscriptionEventBase {
  type: typeof MessageEventType.fundingPayments;
  data: WebSocketResponseFundingPaymentsShort;
}

/**
 * @internal
 */
export interface WebSocketResponseFundingPaymentsShort {
  /**
   * @see inflated {@link IDEXFundingPaymentEventData.wallet}
   */
  w: IDEXFundingPaymentEventData['wallet'];
  /**
   * @see inflated {@link IDEXFundingPaymentEventData.market}
   */
  m: IDEXFundingPaymentEventData['market'];
  /**
   * @see inflated {@link IDEXFundingPaymentEventData.paymentQuantity}
   */
  Q: IDEXFundingPaymentEventData['paymentQuantity'];
  /**
   * @see inflated {@link IDEXFundingPaymentEventData.positionQuantity}
   */
  q: IDEXFundingPaymentEventData['positionQuantity'];
  /**
   * @see inflated {@link IDEXFundingPaymentEventData.fundingRate}
   */
  f: IDEXFundingPaymentEventData['fundingRate'];
  /**
   * @see inflated {@link IDEXFundingPaymentEventData.indexPrice}
   */
  ip: IDEXFundingPaymentEventData['indexPrice'];
  /**
   * @see inflated {@link IDEXFundingPaymentEventData.time}
   */
  t: IDEXFundingPaymentEventData['time'];
}
