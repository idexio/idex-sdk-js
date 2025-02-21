import type {
  RestRequestPagination,
  RestRequestByWallet,
  RestRequestByMarketOptional,
} from '#index';

/**
 * Get Funding Payments
 *
 * @see response {@link RestResponseGetFundingPayments}
 * @see type {@link KumaFundingPayment}
 *
 * @category Kuma - Get Funding Payments
 */
export interface RestRequestGetFundingPayments
  extends RestRequestByWallet,
    RestRequestPagination,
    RestRequestByMarketOptional {}

/**
 * @see request {@link RestRequestGetFundingPayments}
 * @see response {@link RestResponseGetFundingPayments}
 *
 * @category Kuma - Get Funding Payments
 * @category Kuma Interfaces
 */
export interface KumaFundingPayment {
  /**
   * The timestamp indicating when the item was created.
   */
  time: number;
  /**
   * Market symbol for the item
   */
  market: string;
  /**
   * Quantity of the funding payment in quote terms
   */
  paymentQuantity: string;
  /**
   * Quantity of the open position at payment time in base terms
   */
  positionQuantity: string;
  /**
   * Funding rate for the period
   */
  fundingRate: string;
  /**
   * Index price of the market at payment time
   */
  indexPrice: string;
}

/**
 * @see type {@link KumaFundingPayment}
 * @see request {@link RestRequestGetFundingPayments}
 *
 * @category Kuma - Get Funding Payments
 */
export type RestResponseGetFundingPayments = KumaFundingPayment[];
