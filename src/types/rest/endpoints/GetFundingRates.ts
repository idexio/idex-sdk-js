import type { RestRequestByMarket, RestRequestPagination } from '#index';

/**
 * Get Funding Rates
 *
 * @see response {@link RestResponseGetFundingRates}
 * @see type {@link IDEXFundingRate}
 *
 * @category IDEX - Get Funding Rates
 */
export interface RestRequestGetFundingRates
  extends RestRequestPagination,
    RestRequestByMarket {}

/**
 * @see request {@link RestRequestGetFundingRates}
 * @see response {@link RestResponseGetFundingRates}
 *
 * @category IDEX - Get Funding Rates
 * @category IDEX Interfaces
 */
export interface IDEXFundingRate {
  /** Funding rate for the period */
  fundingRate: string;
  /** Index price of the market at payment time */
  indexPrice: string;
  /** Timestamp of the payment */
  time: number;
}

/**
 * @see type {@link IDEXFundingRate}
 * @see request {@link RestRequestGetFundingRates}
 *
 * @category IDEX - Get Funding Rates
 */
export type RestResponseGetFundingRates = IDEXFundingRate[];
