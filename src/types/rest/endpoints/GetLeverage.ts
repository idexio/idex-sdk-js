import type { RestRequestByMarketOptional, RestRequestByWallet } from '#index';
import type { IDEXLeverage } from './SetLeverage.js';

/**
 * - Rest Request: `GET /v4/leverage`
 * - Security:     `User`
 * - API Scope:    `Read`
 *
 * @packageDocumentation
 */

/**
 * @see response {@link RestResponseGetLeverage}
 * @see type     {@link IDEXLeverage}
 *
 * @category IDEX - Get Leverage
 */
export interface RestRequestGetLeverage
  extends Required<RestRequestByWallet>,
    RestRequestByMarketOptional {
  /**
   * - If provided, the response will include only the market in the resulting array.
   *
   * @inheritDoc
   */
  market?: string;
}

/**
 * @see type    {@link IDEXLeverage}
 * @see request {@link RestRequestGetLeverage}
 *
 * @category IDEX - Get Leverage
 */
export type RestResponseGetLeverage = IDEXLeverage[];
