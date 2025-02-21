import type { RestRequestByMarket, RestRequestPagination } from '#index';

/**
 * Get Funding Rates
 *
 * @see response {@link RestResponseGetFundingRates}
 * @see type {@link KumaFundingRate}
 *
 * @category Kuma - Get Funding Rates
 */
export interface RestRequestGetFundingRates
  extends RestRequestPagination,
    RestRequestByMarket {}

/**
 * @see request {@link RestRequestGetFundingRates}
 * @see response {@link RestResponseGetFundingRates}
 *
 * @category Kuma - Get Funding Rates
 * @category Kuma Interfaces
 */
export interface KumaFundingRate {
  /** Funding rate for the period */
  fundingRate: string;
  /** Index price of the market at payment time */
  indexPrice: string;
  /** Timestamp of the payment */
  time: number;
}

/**
 * @see type {@link KumaFundingRate}
 * @see request {@link RestRequestGetFundingRates}
 *
 * @category Kuma - Get Funding Rates
 */
export type RestResponseGetFundingRates = KumaFundingRate[];
