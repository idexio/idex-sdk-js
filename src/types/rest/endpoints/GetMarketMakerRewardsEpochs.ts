import type { RestRequestByWalletOptional } from '#index';
import type { Expand } from '#types/utils';

/**
 * @category Base Types
 * @category Kuma - Get Market Maker Rewards Epochs
 */
interface RestRequestWithEpochId extends RestRequestByWalletOptional {
  /**
   * Epoch identifier to query.
   *
   * - If no `epochId` is provided, the API servers the currently active epoch when present.
   */
  epochId?: string;
  /**
   * By providing a wallet parameter, the `getEpoch` response
   * will **include** wallet-specific details.
   *
   * - When {@link wallet} is **provided**: {@link MarketMakerRewardsEpochDetailedWithWallet}
   * - When {@link wallet} is **excluded**: {@link MarketMakerRewardsEpochDetailedWithoutWallet}
   */
  wallet?: string;
}

/**
 * {@inheritDoc RestRequestGetMarketMakerRewardsEpoch}
 *
 * @remarks
 *  > This interface represents a {@link RestRequestGetMarketMakerRewardsEpoch} request
 *  > which does not provide a {@link wallet} parameter.
 *
 * ---
 * @see type     {@link MarketMakerRewardsEpochDetailedWithoutWallet}
 * @see response {@link RestResponseGetMarketMakerRewardsEpoch}
 * @see related  {@link RestRequestGetMarketMakerRewardsEpochs}
 *
 * @category Kuma - Get Market Maker Rewards Epochs
 */
export interface RestRequestGetMarketMakerRewardsEpochWithoutWallet
  extends RestRequestWithEpochId {
  /**
   * @hidden
   */
  wallet?: undefined;
}

/**
 * {@inheritDoc RestRequestGetMarketMakerRewardsEpoch}
 *
 * @remarks
 *  > This interface represents a {@link RestRequestGetMarketMakerRewardsEpoch} request
 *  > which does not provide a {@link wallet} parameter.
 *
 * ---
 * @see type     {@link MarketMakerRewardsEpochDetailedWithWallet}
 * @see response {@link RestResponseGetMarketMakerRewardsEpoch}
 * @see related  {@link RestRequestGetMarketMakerRewardsEpochs}
 *
 * @category Kuma - Get Market Maker Rewards Epochs
 */
export interface RestRequestGetMarketMakerRewardsEpochWithWallet
  extends RestRequestWithEpochId {
  /**
   * @inheritDoc
   */
  wallet: string;
}

/**
 * The Get Epoch endpoint provides detailed information about
 * epoch configuration as well as wallet epoch performance.
 *
 * - Providing a {@link RestRequestGetMarketMakerRewardsEpochWithWallet.wallet wallet} parameter
 *   will return {@link MarketMakerRewardsEpochDetailedWithWallet}
 *   which includes wallet-specific details in the response.
 * - Otherwise the request will return {@link MarketMakerRewardsEpochDetailedWithoutWallet}
 *
 * ---
 * **Endpoint Parameters**
 *
 * > - HTTP Request:      `GET /v1/marketMakerRewardsV1/epoch`
 * > - Endpoint Security: [User Data](https://api-docs-v1.kuma.bid/#endpointSecurityUserData)
 * > - API Key Scope:     [Read](https://api-docs-v1.kuma.bid/#api-keys)
 * ---
 *
 * @see type     {@link KumaMarketMakerRewardsEpoch}
 * @see response {@link RestResponseGetMarketMakerRewardsEpoch}
 * @see related  {@link RestRequestGetMarketMakerRewardsEpochs}
 *
 * @category Kuma - Get Market Maker Rewards Epochs
 */
export type RestRequestGetMarketMakerRewardsEpoch =
  | RestRequestGetMarketMakerRewardsEpochWithWallet
  | RestRequestGetMarketMakerRewardsEpochWithoutWallet;

/**
 * The Get Epochs endpoint provides a list of the defined market
 * maker rewards epochs.
 *
 * ---
 * **Endpoint Parameters**
 *
 * > - HTTP Request:      `GET /v1/marketMakerRewardsV1/epochs`
 * > - Endpoint Security: [User Data](https://api-docs-v1.kuma.bid/#endpointSecurityUserData)
 * > - API Key Scope:     [Read](https://api-docs-v1.kuma.bid/#api-keys)
 * ---
 *
 * @see type     {@link KumaMarketMakerRewardsEpochSummary}
 * @see response {@link RestResponseGetMarketMakerRewardsEpochs}
 * @see related  {@link RestRequestGetMarketMakerRewardsEpoch}
 *
 * @category Kuma - Get Market Maker Rewards Epochs
 */
export interface RestRequestGetMarketMakerRewardsEpochs {}

/**
 * @category Base Types
 * @category Kuma - Get Market Maker Rewards Epochs
 */
interface MarketMakerRewardsEpochMarketBase {
  /**
   * Market symbol
   */
  market: string;
  /**
   * Token reward quantity for the market
   */
  rewardQuantity: string;
  /**
   * Maximum qualified order distance from the midpoint of the spread.
   *
   * - All percents are expressed as standard decimal value with pip resolution.
   *   E.g. `18.5%` is `"0.18500000"`
   */
  maximumQualifiedOrderDistancePercent: string;
  /**
   * Minimum qualified order quantity
   */
  minimumQualifiedOrderQuantity: string;
  /**
   * Epoch’s wallet depth score for the market.
   *
   * - For currently active epochs, this is the wallet’s estimated depth at last cache time.
   * - Only provided if the request includes a wallet parameter.
   */
  walletDepthScore?: string;
  /**
   * Epoch’s wallet “uptime” score for the market as a percent.
   *
   * - For currently active epochs, this is the wallet’s estimated score at last cache time.
   * - Only provided if the request includes a wallet parameter.
   * - All percents are expressed as standard decimal value with pip resolution.
   *   E.g. `18.5%` is `"0.18500000"`
   */
  walletUptimePercent?: string;
  /**
   * Epoch’s wallet qualified maker volume for the market as a percent relative
   * to eligible wallet qualified maker volume.
   *
   * - For currently active epochs, this is the wallet’s estimated score at last cache time.
   * - Only provided if the request includes a wallet parameter.
   * - All percents are expressed as standard decimal value with pip resolution.
   *   E.g. `18.5%` is `"0.18500000"`
   */
  walletRewardVolumePercent?: string;
  /**
   * Epoch’s wallet qualified maker volume for the market as a percent relative
   * to total qualified maker volume.
   *
   * - For currently active epochs, this is the wallet’s estimated score at last cache time.
   * - Only provided if the request includes a wallet parameter.
   * - All percents are expressed as standard decimal value with pip resolution.
   *   E.g. `18.5%` is `"0.18500000"`
   */
  walletEligibilityVolumePercent?: string;
  /**
   * Epoch’s wallet score for the market as a percent.
   *
   * - For currently active epochs, this is the wallet’s estimated score at last cache time.
   * - Only provided if the request includes a wallet parameter.
   * - All percents are expressed as standard decimal value with pip resolution.
   *   E.g. `18.5%` is `"0.18500000"`
   */
  walletScorePercent?: string;
  /**
   * Epoch’s wallet token reward quantity for the market.
   *
   * - For currently active epochs, this is the wallet’s estimated token reward quantity at last cache time.
   * - Only provided if the request includes a wallet parameter.
   * - All percents are expressed as standard decimal value with pip resolution.
   */
  walletRewardQuantity?: string;
}

/**
 * When **not** providing a {@link RestRequestGetMarketMakerRewardsEpochWithWallet.wallet wallet} parameter with
 * the {@link RestRequestGetMarketMakerRewardsEpoch} request, the {@link MarketMakerRewardsEpochDetailedWithoutWallet.markets markets}
 * array **will not** include wallet-specific details for each market.
 *
 * ---
 *
 * @see MarketMakerRewardsEpochMarketWithWallet
 *
 * @category Kuma - Get Market Maker Rewards Epochs
 */
export interface MarketMakerRewardsEpochMarketWithoutWallet
  extends MarketMakerRewardsEpochMarketBase {
  walletDepthScore?: undefined;
  walletUptimePercent?: undefined;
  walletRewardVolumePercent?: undefined;
  walletEligibilityVolumePercent?: undefined;
  walletScorePercent?: undefined;
  walletRewardQuantity?: undefined;
}

/**
 * When providing a {@link RestRequestGetMarketMakerRewardsEpochWithWallet.wallet wallet} parameter with the
 * {@link RestRequestGetMarketMakerRewardsEpoch} request, the {@link MarketMakerRewardsEpochDetailedWithWallet.markets markets}
 * array **will** include wallet-specific details for each market.
 *
 * ---
 *
 * @see related {@link MarketMakerRewardsEpochMarketWithoutWallet}
 *
 * @category Kuma - Get Market Maker Rewards Epochs
 */
export interface MarketMakerRewardsEpochMarketWithWallet
  extends MarketMakerRewardsEpochMarketBase {
  /** @inheritDoc */
  walletDepthScore: string;
  /** @inheritDoc */
  walletUptimePercent: string;
  /** @inheritDoc */
  walletRewardVolumePercent: string;
  /** @inheritDoc */
  walletEligibilityVolumePercent: string;
  /** @inheritDoc */
  walletScorePercent: string;
  /** @inheritDoc */
  walletRewardQuantity: string;
}

/**
 * The possible types representing the {@link RestRequestGetMarketMakerRewardsEpoch} response's
 * {@link KumaMarketMakerRewardsEpoch.markets} markets details.
 *
 * ---
 *
 * @see type {@link KumaMarketMakerRewardsEpoch}
 *
 * @category Kuma - Get Market Maker Rewards Epochs
 */
export type MarketMakerRewardsEpochMarket =
  | MarketMakerRewardsEpochMarketWithWallet
  | MarketMakerRewardsEpochMarketWithoutWallet;

/**
 * When querying an epoch using the {@link RestRequestGetMarketMakerRewardsEpoch} endpoint
 * and not providing the {@link RestRequestGetMarketMakerRewardsEpoch.wallet wallet} parameter,
 * the response will exclude wallet-specific details from the response.
 *
 * Provide the wallet parameter to include the following details:
 *
 * - {@link MarketMakerRewardsEpochDetailedWithWallet.walletScorePercent walletScorePercent}
 * - {@link MarketMakerRewardsEpochDetailedWithWallet.walletRewardQuantity walletRewardQuantity}
 * - {@link MarketMakerRewardsEpochDetailedWithWallet.walletRewardVolumePercent walletRewardVolumePercent}
 * - {@link MarketMakerRewardsEpochDetailedWithWallet.walletEligibilityVolumePercent walletEligibilityVolumePercent}
 * - {@link MarketMakerRewardsEpochMarketWithWallet markets} - with wallet-specific details
 *
 * @category Kuma - Get Market Maker Rewards Epochs
 * @category Base Types
 */
interface MarketMakerRewardsEpochBase {
  /**
   * Epoch identifier
   */
  epochId: string;
  /**
   * Timestamp of the epoch start.
   */
  startsAt: number;
  /**
   * Timestamp of the epoch end.
   */
  endsAt: number;
  /**
   * Timestamp of the epoch review period completion.
   */
  reviewEndsAt: number;
  /**
   * Timestamp of the previous epoch’s review period end.
   *
   * - Only present if the value is in the future
   *   (ie the system is currently awaiting the previous epoch end)
   */
  previousEpochReviewEndsAt?: number;
  /**
   * Total token reward quantity
   */
  totalRewardQuantity?: string;
  /**
   * Qualified volume percent setting for the current epoch, if defined.
   *
   * - Wallet qualified maker volume for the prior epoch must meet or exceed
   *   this value as a percent of overall qualified maker volume to be eligible
   *   for the current epoch’s rewards
   * - Not present if no eligibility percent is defined for the epoch
   * - All percents are expressed as standard decimal value with pip resolution.
   *   E.g. `18.5%` is `"0.18500000"`
   */
  eligibilityVolumeRequirementPercent?: string;
  /**
   * Qualified volume percent setting for the next epoch, if defined.
   *
   * - All percents are expressed as standard decimal value with pip resolution.
   *   E.g. `18.5%` is `"0.18500000"`
   */
  nextEpochEligibilityVolumeRequirementPercent?: string;
  /**
   * Score parameter
   */
  alpha?: string;
  /**
   * Score parameter
   */
  beta?: string;
  /**
   * Indicates whether the wallet is eligible to earn market maker rewards in
   * the requested epoch, based on the wallet's performance in the previous
   * epoch.
   * @see walletEligibilityVolumePercent
   *
   * - Only provided if the request includes a wallet parameter, and when
   *   requesting the current or past epochs
   */
  isWalletEligibleInEpoch?: boolean;
  /**
   * Epoch’s wallet score as a percent.
   *
   * - For currently active epochs, this is the wallet’s
   *   estimated score at last cache time.
   * - Only provided if the request includes a wallet parameter.
   * - All percents are expressed as standard decimal value with pip resolution.
   *   E.g. `18.5%` is `"0.18500000"`
   */
  walletScorePercent?: string;
  /**
   * Epoch’s wallet token reward quantity.
   *
   * - For currently active epochs, this is the wallet’s estimated
   *   token reward quantity at last cache time.
   * - Only provided if the request includes a wallet parameter.
   */
  walletRewardQuantity?: string;
  /**
   * Epoch’s wallet qualified maker volume percent relative to eligible wallet
   * qualified maker volume.
   *
   * - This value is used as part of the current epoch’s reward calculation.
   * - All percents are expressed as standard decimal value with pip resolution.
   *   E.g. `18.5%` is `"0.18500000"`
   */
  walletRewardVolumePercent?: string;
  /**
   * Current epoch’s wallet qualified maker volume percent relative to total
   * qualified maker volume.
   *
   * - Wallet is eligible for the next epoch awards if this value
   *   exceeds {@link nextEpochEligibilityVolumeRequirementPercent}.
   * - All percents are expressed as standard decimal value with pip resolution.
   *   E.g. `18.5%` is `"0.18500000"`
   */
  walletEligibilityVolumePercent?: string;
  /**
   * - When wallet was in the request:  {@link MarketMakerRewardsEpochMarketWithWallet KumaEpochMarketWithWallet[]}
   * - Otherwise: {@link MarketMakerRewardsEpochMarketWithoutWallet KumaEpochMarketWithoutWallet[]}
   *
   * @see MarketMakerRewardsEpochMarket
   */
  markets?: MarketMakerRewardsEpochMarket[];
}

/**
 * When querying the list of epochs via the {@link RestRequestGetMarketMakerRewardsEpochs} endpoint
 * the response will be a summary of each epoch.
 *
 * - The {@link MarketMakerRewardsEpochBase.epochId epochId} can be used to query the detailed
 *   epoch information via the {@link RestRequestGetMarketMakerRewardsEpoch} endpoint.
 *
 * ---
 * @see request  {@link RestRequestGetMarketMakerRewardsEpochs}
 * @see response {@link RestResponseGetMarketMakerRewardsEpochs}
 * @see related  {@link KumaMarketMakerRewardsEpoch}
 *
 * @category Kuma - Get Market Maker Rewards Epochs
 *
 * @interface
 */
export type KumaMarketMakerRewardsEpochSummary = Expand<
  Pick<
    MarketMakerRewardsEpochBase,
    'epochId' | 'startsAt' | 'endsAt' | 'reviewEndsAt'
  >
>;

/**
 * When querying an epoch using the {@link RestRequestGetMarketMakerRewardsEpoch} endpoint
 * and not providing the {@link RestRequestGetMarketMakerRewardsEpoch.wallet wallet} parameter,
 * the response will exclude wallet-specific details from the response.
 *
 * Provide the wallet parameter to include the following details:
 *
 * - {@link MarketMakerRewardsEpochDetailedWithWallet.walletScorePercent walletScorePercent}
 * - {@link MarketMakerRewardsEpochDetailedWithWallet.walletRewardQuantity walletRewardQuantity}
 * - {@link MarketMakerRewardsEpochDetailedWithWallet.walletRewardVolumePercent walletRewardVolumePercent}
 * - {@link MarketMakerRewardsEpochDetailedWithWallet.walletEligibilityVolumePercent walletEligibilityVolumePercent}
 * - {@link MarketMakerRewardsEpochMarketWithWallet markets} - with wallet-specific details
 *
 * ---
 * @see type     {@link KumaMarketMakerRewardsEpoch}
 * @see request  {@link RestRequestGetMarketMakerRewardsEpoch}
 * @see response {@link RestResponseGetMarketMakerRewardsEpoch}
 * @see related  {@link MarketMakerRewardsEpochDetailedWithWallet}
 *
 * @category Kuma - Get Market Maker Rewards Epochs
 */
export interface MarketMakerRewardsEpochDetailedWithoutWallet
  extends MarketMakerRewardsEpochBase {
  /** @inheritDoc */
  totalRewardQuantity: string;
  /** @inheritDoc */
  alpha: string;
  /** @inheritDoc */
  beta: string;
  /** @inheritDoc */
  markets: MarketMakerRewardsEpochMarketWithoutWallet[];

  /* Can be used as type guards to refine type */

  walletScorePercent?: undefined;
  walletRewardQuantity?: undefined;
  walletRewardVolumePercent?: undefined;
  walletEligibilityVolumePercent?: undefined;
}

/**
 * When querying an epoch using the {@link RestRequestGetMarketMakerRewardsEpoch} endpoint
 * and providing the {@link RestRequestGetMarketMakerRewardsEpochWithWallet.wallet wallet} parameter,
 * the response will include the wallet-specific details from the response.
 *
 * Provide the wallet parameter to include the following details:
 *
 * - {@link walletScorePercent walletScorePercent}
 * - {@link walletRewardQuantity walletRewardQuantity}
 * - {@link walletRewardVolumePercent walletRewardVolumePercent}
 * - {@link walletEligibilityVolumePercent walletEligibilityVolumePercent}
 * - {@link MarketMakerRewardsEpochMarketWithWallet markets} (with wallet details)
 *
 * ---
 *
 * @see type     {@link KumaMarketMakerRewardsEpoch}
 * @see request  {@link RestRequestGetMarketMakerRewardsEpoch}
 * @see response {@link RestResponseGetMarketMakerRewardsEpoch}
 * @see related  {@link MarketMakerRewardsEpochDetailedWithoutWallet}
 *
 * @category Kuma - Get Market Maker Rewards Epochs
 */
export interface MarketMakerRewardsEpochDetailedWithWallet
  extends MarketMakerRewardsEpochBase {
  /** @inheritDoc */
  totalRewardQuantity: string;
  /** @inheritDoc */
  alpha: string;
  /** @inheritDoc */
  beta: string;
  /** @inheritDoc */
  walletScorePercent: string;
  /** @inheritDoc */
  walletRewardQuantity: string;
  /** @inheritDoc */
  walletRewardVolumePercent: string;
  /** @inheritDoc */
  walletEligibilityVolumePercent: string;
  /** @inheritDoc */
  markets: MarketMakerRewardsEpochMarketWithWallet[];
}

/**
 * When querying an epoch using the {@link RestRequestGetMarketMakerRewardsEpoch} endpoint
 * and providing the {@link RestRequestGetMarketMakerRewardsEpochWithWallet.wallet wallet} parameter,
 * the response will include the wallet-specific details from the response.
 *
 * Provide the `wallet` parameter to include the following details:
 *
 * - {@link MarketMakerRewardsEpochDetailedWithWallet.walletScorePercent walletScorePercent}
 * - {@link MarketMakerRewardsEpochDetailedWithWallet.walletRewardQuantity walletRewardQuantity}
 * - {@link MarketMakerRewardsEpochDetailedWithWallet.walletRewardVolumePercent walletRewardVolumePercent}
 * - {@link MarketMakerRewardsEpochDetailedWithWallet.walletEligibilityVolumePercent walletEligibilityVolumePercent}
 * - {@link MarketMakerRewardsEpochMarketWithWallet markets} - with wallet-specific details
 *
 * ---
 * @see request  {@link RestRequestGetMarketMakerRewardsEpoch}
 * @see response {@link RestResponseGetMarketMakerRewardsEpoch}
 *
 * @see related  {@link KumaMarketMakerRewardsEpochSummary}
 *
 * @category Kuma - Get Market Maker Rewards Epochs
 * @category Kuma Interfaces
 */
export type KumaMarketMakerRewardsEpoch =
  | MarketMakerRewardsEpochDetailedWithoutWallet
  | MarketMakerRewardsEpochDetailedWithWallet;

/**
 * Returns the detailed information about the requested epoch.
 *
 * ---
 * @see type    {@link KumaMarketMakerRewardsEpoch}
 * @see request {@link RestRequestGetMarketMakerRewardsEpoch}
 *
 * @see related {@link RestResponseGetMarketMakerRewardsEpochs}
 * @see related {@link RestRequestGetMarketMakerRewardsEpochs}
 *
 * @category Kuma - Get Market Maker Rewards Epochs
 *
 * @typeParam RequestType - Optionally provide the request parameters
 *                          used to return strong types based on if
 *                          the wallet parameter was used.
 *                          (this is automatic when calling the client methods)
 *
 * @example
 * ```ts
 *  // KumaMarketMakerRewardsEpochDetailedWithWallet | KumaMarketMakerRewardsEpochDetailedWithoutWallet
 *  type Response = RestResponseGetEpoch;
 *
 *  // KumaMarketMakerRewardsEpochDetailedWithWallet
 *  const response = await client.getEpoch({ wallet: '0x...', nonce: '...', epochId: '...' });
 *  // KumaEpochDetailedWithoutWallet
 *  const response = await client.getEpoch({ nonce: '...', epochId: '...' });
 *  // KumaMarketMakerRewardsEpochDetailedWithoutWallet | KumaMarketMakerRewardsEpochDetailedWithWallet
 *  const response = await client.getEpoch(someUntypedObj)
 *
 *  // When the response is returned as either, you can easily narrow the type
 *  // by checking any of the wallet-specific properties:
 *  if (response.walletScorePercent) {
 *     // response satisfies KumaMarketMakerRewardsEpochDetailedWithWallet
 *  } else {
 *    // response satisfies KumaMarketMakerRewardsEpochDetailedWithoutWallet
 *  }
 * ```
 */
export type RestResponseGetMarketMakerRewardsEpoch<
  RequestType extends
    RestRequestGetMarketMakerRewardsEpoch = RestRequestGetMarketMakerRewardsEpoch,
> =
  RequestType extends RestRequestGetMarketMakerRewardsEpochWithWallet ?
    MarketMakerRewardsEpochDetailedWithWallet
  : RequestType extends RestRequestGetMarketMakerRewardsEpochWithoutWallet ?
    MarketMakerRewardsEpochDetailedWithoutWallet
  : | MarketMakerRewardsEpochDetailedWithoutWallet
    | MarketMakerRewardsEpochDetailedWithWallet;

/**
 * Returns deposits according to the request parameters.
 *
 * ----
 *
 * @see type    {@link KumaMarketMakerRewardsEpochSummary}
 * @see request {@link RestRequestGetMarketMakerRewardsEpochs}
 *
 * @see related {@link RestResponseGetMarketMakerRewardsEpoch}
 * @see related {@link RestRequestGetMarketMakerRewardsEpoch}
 *
 * @category Kuma - Get Market Maker Rewards Epochs
 */
export type RestResponseGetMarketMakerRewardsEpochs =
  KumaMarketMakerRewardsEpochSummary[];
