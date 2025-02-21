import type { MessageEventType } from '#types/enums/index';
import type { KumaFundingPayment } from '#types/rest/endpoints/GetFundingPayments';
import type { Expand } from '#types/utils';
import type { KumaSubscriptionEventBase } from '#types/webSocket/base';

/**
 * - `fundingPayments` updates provided to the message handler when subscribed.
 *
 * @inheritDoc KumaSubscriptionEventBase
 *
 * @category WebSocket - Message Types
 * @category Kuma - Get Funding Payments
 *
 * @see data {@link KumaFundingPaymentEventData}
 */
export interface KumaFundingPaymentEvent extends KumaSubscriptionEventBase {
  /**
   * @inheritDoc
   */
  type: typeof MessageEventType.fundingPayments;
  /**
   * - Includes all {@link KumaFundingPayment} properties as well as a `wallet` property.
   *
   * @see type {@link KumaFundingPaymentEventData}
   */
  data: Expand<KumaFundingPaymentEventData>;
}

/**
 * WebSocket position messages are identical to the REST API response
 * except they also include the `wallet` property.
 *
 * @see parent  {@link KumaFundingPaymentEvent}
 *
 * @category WebSocket - Message Types
 */
export interface KumaFundingPaymentEventData extends KumaFundingPayment {
  /**
   * Wallet address
   */
  wallet: string;
}

export interface WebSocketResponseSubscriptionMessageShortFundingPayments
  extends KumaSubscriptionEventBase {
  type: typeof MessageEventType.fundingPayments;
  data: WebSocketResponseFundingPaymentsShort;
}

/**
 * @internal
 */
export interface WebSocketResponseFundingPaymentsShort {
  /**
   * @see inflated {@link KumaFundingPaymentEventData.wallet}
   */
  w: KumaFundingPaymentEventData['wallet'];
  /**
   * @see inflated {@link KumaFundingPaymentEventData.market}
   */
  m: KumaFundingPaymentEventData['market'];
  /**
   * @see inflated {@link KumaFundingPaymentEventData.paymentQuantity}
   */
  Q: KumaFundingPaymentEventData['paymentQuantity'];
  /**
   * @see inflated {@link KumaFundingPaymentEventData.positionQuantity}
   */
  q: KumaFundingPaymentEventData['positionQuantity'];
  /**
   * @see inflated {@link KumaFundingPaymentEventData.fundingRate}
   */
  f: KumaFundingPaymentEventData['fundingRate'];
  /**
   * @see inflated {@link KumaFundingPaymentEventData.indexPrice}
   */
  ip: KumaFundingPaymentEventData['indexPrice'];
  /**
   * @see inflated {@link KumaFundingPaymentEventData.time}
   */
  t: KumaFundingPaymentEventData['time'];
}
