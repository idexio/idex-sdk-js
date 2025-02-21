import type { RestRequestByMarketOptional, RestRequestByWallet } from '#index';
import type { KumaInitialMarginFractionOverride } from './SetInitialMarginFractionOverride.js';

/**
 * - Rest Request: `GET /v1/initialMarginFractionOverride`
 * - Security:     `User`
 * - API Scope:    `Read`
 *
 * @packageDocumentation
 */

/**
 * @see response {@link RestResponseGetInitialMarginFractionOverride}
 * @see type     {@link KumaInitialMarginFractionOverride}
 *
 * @category Kuma - Get Initial Margin Fraction override
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
 * @see type    {@link KumaInitialMarginFractionOverride}
 * @see request {@link RestRequestGetInitialMarginFractionOverride}
 *
 * @category Kuma - Get Initial Margin Fraction override
 */
export type RestResponseGetInitialMarginFractionOverride =
  KumaInitialMarginFractionOverride[];
