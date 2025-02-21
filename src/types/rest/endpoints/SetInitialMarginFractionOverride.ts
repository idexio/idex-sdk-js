import type { RestRequestByMarket, RestRequestByWallet } from '#index';
import type { RestRequestWithSignature } from '#types/utils';
import type { DelegatedKeyParams } from '../../delegatedKeys';

/**
 * - Rest Request: `POST /v1/initialMarginFractionOverride`
 *
 * @packageDocumentation
 */

/**
 *  - Automatically associates wallets that are not yet associated.
 *
 * @see response {@link RestResponseSetInitialMarginFractionOverride}
 * @see type     {@link KumaInitialMarginFractionOverride}
 * @category Kuma - Set or clear Initial Margin Fraction override
 *
 * @hidden
 */
export interface RestRequestSetInitialMarginFractionOverride
  extends Required<RestRequestByWallet>,
    DelegatedKeyParams,
    RestRequestByMarket {
  /**
   * Initial margin fraction override value between `1` and default `initialMarginFraction`
   * of the market
   *
   * - Requests that do not include a `initialMarginFractionOverride` parameter
   *   **remove any existing Initial Margin Fraction override** for the wallet.
   */
  initialMarginFractionOverride?: string;
}

/**
 * Result from calling get or set InitialMarginFractionOverride
 *
 * @see request (POST)  {@link RestRequestSetInitialMarginFractionOverride}
 * @see response (POST) {@link RestResponseSetInitialMarginFractionOverride}
 * @see request (GET)   {@link RestRequestGetInitialMarginFractionOverride}
 * @see response (GET)  {@link RestResponseGetInitialMarginFractionOverride}
 *
 * @category Kuma - Set Initial Margin Fraction override
 * @category Kuma - Get Initial Margin Fraction override
 * @category Kuma Interfaces
 *
 * @hidden
 *
 */
export interface KumaInitialMarginFractionOverride {
  /**
   * Wallet address
   */
  wallet: string;
  /**
   * Market symbol
   */
  market: string;
  /**
   * Initial Margin Fraction override value, `null` if no override is set on the market
   */
  initialMarginFractionOverride: string | null;
}

/**
 * - Automatically associates wallets that are not yet associated.
 *
 * @see type    {@link KumaInitialMarginFractionOverride}
 * @see request {@link RestRequestSetInitialMarginFractionOverride}
 *
 * @category Kuma - Set initial margin fraction
 *
 * @hidden
 */
export type RestResponseSetInitialMarginFractionOverride =
  KumaInitialMarginFractionOverride;

/**
 * The raw request body for the `POST /v1/initialMarginFractionOverride` endpoint
 * including `signature` and the body in `parameters`.
 *
 * - Automatically associates wallets that are not yet associated.
 *
 * @see parameters {@link RestRequestSetInitialMarginFractionOverride}
 * @see response   {@link RestResponseSetInitialMarginFractionOverride}
 * @see type       {@link KumaInitialMarginFractionOverride}
 *
 * @category Kuma - Set Initial Margin Fraction override
 *
 * @hidden
 */
export type RestRequestSetInitialMarginFractionOverrideSigned =
  RestRequestWithSignature<RestRequestSetInitialMarginFractionOverride>;
