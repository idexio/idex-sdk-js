import type { RestRequestWithSignature } from '#types/utils';
import type { KumaWallet, RestRequestByWallet } from '@idexio/idex-sdk/types';

/**
 * Associate a wallet with the authenticated account.
 *
 * @category Kuma - Associate Wallet
 *
 * @see response {@link RestResponseAssociateWallet}
 * @see type     {@link KumaWallet}
 */
export interface RestRequestAssociateWallet extends RestRequestByWallet {
  /**
   * - The wallet to associate with the authenticated account.
   *
   * @inheritDoc
   */
  wallet: string;
}

/**
 * The raw request body for the `POST /v1/wallets` endpoint
 * including `signature` and the body in `parameters`.
 *
 * @internal
 */
export type RestRequestAssociateWalletSigned =
  RestRequestWithSignature<RestRequestAssociateWallet>;

/**
 * The response to a request to associate a wallet.
 *
 * @category Kuma - Associate Wallet
 *
 * @see request {@link RestRequestAssociateWallet}
 * @see type    {@link KumaWallet}
 */
export type RestResponseAssociateWallet = KumaWallet;
