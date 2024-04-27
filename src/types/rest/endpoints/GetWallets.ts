import type { RestRequestByWalletOptional, IDEXPosition } from '#index';

/**
 * - HTTP Request: `GET /v4/wallets`
 * - Endpoint Security: [User Data](https://api-docs-v4.idex.io/#endpointSecurityUserData)
 * - API Key Scope: [Read](https://api-docs-v4.idex.io/#api-keys)
 *
 * @see response {@link RestResponseGetWallets}
 * @see type {@link IDEXWallet}
 *
 * @category IDEX - Get Wallets
 */
export interface RestRequestGetWallets extends RestRequestByWalletOptional {
  /**
   * To filter for multiple associated wallets, you may provide a
   * wallets property with an array of wallet addresses to return.
   *
   * - This is merged with the {@link wallet} property if provided.
   * - This will throw an error if any of the requested wallets
   *   are not associated with your account.
   * - Omitting {@link wallets} and {@link wallet} will return
   *   all wallets for the account.
   */
  wallets?: string | string[];
  /**
   * If false, do not include a positions array in the response.
   *
   * @defaultValue true
   */
  includePositions?: boolean;
}

/**
 * The Standard `wallet` response shape.
 *
 * @see [API Documentation](https://api-docs-v4.idex.io/#get-wallets)
 * @see request {@link RestRequestGetWallets}
 * @see response {@link RestResponseGetWallets}
 *
 * @category IDEX - Get Wallets
 * @category IDEX - Associate Wallet
 * @category IDEX Interfaces
 */
export interface IDEXWallet {
  /** Address of the wallet */
  wallet: string;
  /** Total account value */
  equity: string;
  /**
   * `equity - initial margin requirement`
   * collateral funds beyond the baseline requirements of open positions
   */
  freeCollateral: string;
  /**
   * Free collateral committed to open limit orders
   */
  heldCollateral: string;
  /**
   * Free collateral available for order placement or withdrawal
   */
  availableCollateral: string;
  /**
   * `(freeCollateral) * (maximum market leverage)`
   */
  buyingPower: string;
  /**
   * total absolute position notional value / equity
   */
  leverage: string;
  /**
   * total maintenance margin requirement / equity
   */
  marginRatio: string;
  /**
   * Quote token balance (USDC)
   */
  quoteBalance: string;
  /**
   * Unrealized PnL of all open positions in quote terms at the mark price.
   */
  unrealizedPnL: string;
  /**
   * Maker trade fee rate with promotions applied
   *
   * - Overrides the "Get Exchange" and "Get Markets" endpoint's maker fee rate.
   * - Effective fee rate will be the lowest of the three
   */
  makerFeeRate: string;
  /**
   * Taker trade fee rate with promotions applied
   *
   * - Overrides the "Get Exchange" and "Get Markets" endpoint's taker fee rate.
   * - Effective fee rate will be the lowest of the three
   */
  takerFeeRate: string;
  /**
   * Total trailing 30-day maker volume
   */
  makerVolume30d: string;
  /**
   * Total trailing 30-day taker volume
   */
  takerVolume30d: string;
  /**
   * Total trailing 30-day fees paid or earned
   */
  fees30d: string;
  /**
   * Positions will be included if the request indicated it was interested in them
   *
   * - Only present if {@link RestRequestGetWallets.includePositions} was not set to `false`
   */
  positions?: undefined | IDEXPosition[];
}

/**
 * @see type {@link IDEXWallet}
 * @see request {@link RestRequestGetWallets}
 *
 * @category IDEX - Get Wallets
 */
export type RestResponseGetWallets = IDEXWallet[];
