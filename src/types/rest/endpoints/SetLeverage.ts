import type { RestRequestByMarket, RestRequestByWallet } from '#index';
import type { RestRequestWithSignature } from '#types/utils';

/**
 * - Rest Request: `POST /v4/leverage`
 *
 * @packageDocumentation
 */

/**
 *  - Automatically associates wallets that are not yet associated.
 *
 * @see response {@link RestResponseSetLeverage}
 * @see type     {@link IDEXLeverage}
 * @category IDEX - Set Leverage
 *
 * @hidden
 */
export interface RestRequestSetLeverage
  extends Required<RestRequestByWallet>,
    RestRequestByMarket {
  /**
   * Leverage override value between `1` and `1` / `initialMarginFraction`
   * of the market
   *
   * - Requests that do not include a `leverage` parameter
   *   **remove any existing leverage override** for the wallet.
   */
  leverage?: string;
}

/**
 * Result from calling get or set leverage
 *
 * @see request (POST)  {@link RestRequestSetLeverage}
 * @see response (POST) {@link RestResponseSetLeverage}
 * @see request (GET)   {@link RestRequestGetLeverage}
 * @see response (GET)  {@link RestResponseGetLeverage}
 *
 * @category IDEX - Set Leverage
 * @category IDEX - Get Leverage
 * @category IDEX Interfaces
 *
 * @hidden
 *
 */
export interface IDEXLeverage {
  /**
   * Wallet address
   */
  wallet: string;
  /**
   * Market symbol
   */
  market: string;
  /**
   * Leverage override value, `null` if no override is set on the market
   */
  leverage: string | null;
}

/**
 * - Automatically associates wallets that are not yet associated.
 *
 * @see type    {@link IDEXLeverage}
 * @see request {@link RestRequestSetLeverage}
 *
 * @category IDEX - Set Leverage
 *
 * @hidden
 */
export type RestResponseSetLeverage = IDEXLeverage;

/**
 * The raw request body for the `POST /v4/leverage` endpoint
 * including `signature` and the body in `parameters`.
 *
 * - Automatically associates wallets that are not yet associated.
 *
 * @see parameters {@link RestRequestSetLeverage}
 * @see response   {@link RestResponseSetLeverage}
 * @see type       {@link IDEXLeverage}
 *
 * @category IDEX - Set Leverage
 *
 * @hidden
 */
export type RestRequestSetLeverageSigned =
  RestRequestWithSignature<RestRequestSetLeverage>;
