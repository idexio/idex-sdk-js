import type { RestRequestByMarketOptional, RestRequestByWallet } from '#index';
import type { IDEXInitialMarginFractionOverride } from './SetInitialMarginFractionOverride.js';

/**
 * - Rest Request: `GET /v4/initialMarginFractionOverride`
 * - Security:     `User`
 * - API Scope:    `Read`
 *
 * @packageDocumentation
 */

/**
 * @see response {@link RestResponseGetInitialMarginFractionOverride}
 * @see type     {@link IDEXInitialMarginFractionOverride}
 *
 * @category IDEX - Get Initial Margin Fraction override
 */
export interface RestRequestGetInitialMarginFractionOverride
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
 * @see type    {@link IDEXInitialMarginFractionOverride}
 * @see request {@link RestRequestGetInitialMarginFractionOverride}
 *
 * @category IDEX - Get Initial Margin Fraction override
 */
export type RestResponseGetInitialMarginFractionOverride =
  IDEXInitialMarginFractionOverride[];
