import type { PayoutProgram, RestRequestByWallet } from '#index';

/**
 * Payout distribution fields to be provided to the escrow contract's `distribute` function.
 *
 * @see parent {@link IDEXPayoutProgramAuthorization}
 *
 * @category IDEX - Authorize Payout
 */
export interface IDEXPayoutDistribution {
  nonce: string;
  parentNonce: string;
  walletAddress: string;
  assetAddress: string;
  quantity: string;
  exchangeSignature: string;
}

/**
 * Get Payout Program Data
 *
 * ---
 *
 * @example
 * ```typescript
 * import { PayoutProgram } from '@idexio/idex-sdk';
 *
 * // create client
 *
 * authenticatedClient.getPayouts({
 *  wallet: '0x...',
 *  nonce: uuidv1(),
 *  program: PayoutProgram.tradingRewardsV2
 * })
 * ```
 *
 * <br />
 *
 * ---
 *
 * @see [API Documentation](https://api-docs-v4.idex.io/#get-payouts)
 * @see response {@link RestResponseGetPayouts}
 * @see type {@link IDEXPayoutProgram}
 *
 * @category IDEX - Get Payouts
 */
export interface RestRequestGetPayouts extends RestRequestByWallet {
  /**
   * - The payout program to query for the given {@link wallet}
   *
   * ---
   *
   * @example
   * ```typescript
   * import { PayoutProgram } from '@idexio/idex-sdk';
   *
   * // create client
   *
   * await authenticatedClient.getPayouts({
   *  wallet: '0x...',
   *  nonce: uuidv1(),
   *  program: PayoutProgram.tradingRewardsV2
   * })
   * ```
   */
  program: PayoutProgram;
}

/**
 * Get Payout Program Authorization
 *
 * ---
 *
 * @example
 * ```typescript
 * import { PayoutProgram } from '@idexio/idex-sdk';
 *
 * // create client
 *
 * await authenticatedClient.authorizePayout({
 *  wallet: '0x...',
 *  nonce: uuidv1(),
 *  program: PayoutProgram.tradingRewardsV2
 * })
 * ```
 *
 * <br />
 *
 * ---
 *
 * @see [API Documentation](https://api-docs-v4.idex.io/#authorize-payout)
 * @see response {@link RestResponseAuthorizePayout}
 * @see type {@link IDEXPayoutProgramAuthorization}
 *
 * @category IDEX - Authorize Payout
 */
export interface RestRequestAuthorizePayout extends RestRequestByWallet {
  /**
   * - The payout program to authorize a payout for the given {@link wallet}
   *
   * @example
   * ```typescript
   * import { PayoutProgram } from '@idexio/idex-sdk';
   *
   * // create client
   *
   * await client.authorizePayout({
   *  wallet: '0x...',
   *  nonce: uuidv1(),
   *  // use the PayoutProgram enum for inline auto completion
   *  program: PayoutProgram.tradingRewardsV2
   * })
   * ```
   */
  program: PayoutProgram;
}

/**
 * IDEX Get Payout Program Response
 *
 * @see docs     [API Documentation: Get Payouts](https://api-docs-v4.idex.io/#get-payouts)
 * @see request  {@link RestRequestGetPayouts}
 * @see response {@link RestResponseGetPayouts}
 *
 * @category IDEX - Get Payouts
 */
export interface IDEXPayoutProgram {
  /**
   * Contract address of the rewarded asset for the {@link PayoutProgram payout program}
   */
  assetAddress: string;
  /**
   * Symbol of the rewarded asset for the {@link PayoutProgram payout program}
   */
  assetSymbol: string;
  /**
   * Address of the escrow contract for the {@link PayoutProgram payout program}
   */
  escrowContractAddress: string;
  /**
   * Total quantity earned for the requested wallet for the {@link PayoutProgram payout program}
   *
   * - **Format:** Asset Units
   */
  quantityEarned: string;
  /**
   * Total quantity paid to the requested wallet for the {@link PayoutProgram payout program}
   *
   * - **Format:** Asset Units
   */
  quantityPaid: string;
  /**
   * Total quantity owed to the requested wallet for the {@link PayoutProgram payout program}
   *
   * - **Minimums:** There is a minimum quantity of 1 asset unit that must be earned before a payout can be authorized
   * - **Logical Flow:** When ({@link quantityEarned} - {@link quantityPaid}) `< 1`, then `quantityOwed` will be `0` and an `authorize` call can not be made.
   * - **Format:** Asset Units
   */
  quantityOwed: string;
}

/**
 * IDEX Authorize Payout Program Response
 *
 * @see [API Documentation](https://api-docs-v4.idex.io/#authorize-payout)
 * @see request {@link RestRequestAuthorizePayout}
 * @see response {@link RestResponseAuthorizePayout}
 *
 * @category IDEX - Authorize Payout
 */
export interface IDEXPayoutProgramAuthorization
  extends Omit<IDEXPayoutProgram, `quantity${string}`> {
  /**
   * Payout distribution fields to be provided to the {@link IDEXPayoutProgram.escrowContractAddress escrow contract's} `distribute` function
   *
   * @see {@link IDEXPayoutDistribution}
   */
  distribution: IDEXPayoutDistribution;
}

/**
 * @see [API Documentation](https://api-docs-v4.idex.io/#get-payouts)
 * @see type {@link IDEXPayoutProgram}
 * @see request {@link RestRequestAuthorizePayout}
 * @see related {@link RestResponseAuthorizePayout}
 *
 * @category IDEX - Get Payouts
 */
export type RestResponseGetPayouts = IDEXPayoutProgram;

/**
 * @see [API Documentation](https://api-docs-v4.idex.io/#authorize-payout)
 * @see type {@link IDEXPayoutProgramAuthorization}
 * @see request {@link RestRequestGetPayouts}
 *
 * @category IDEX - Authorize Payout
 */
export type RestResponseAuthorizePayout = IDEXPayoutProgramAuthorization;
