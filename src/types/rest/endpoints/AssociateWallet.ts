import type { RestRequestWithSignature } from '#types/utils';
import type { IDEXWallet, RestRequestByWallet } from '@idexio/idex-sdk/types';

/**
 * Associate a wallet with the authenticated account.
 *
 * @category IDEX - Associate Wallet
 *
 * @see response {@link RestResponseAssociateWallet}
 * @see type     {@link IDEXWallet}
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
 * The raw request body for the `POST /v4/wallets` endpoint
 * including `signature` and the body in `parameters`.
 *
 * @internal
 */
export type RestRequestAssociateWalletSigned =
  RestRequestWithSignature<RestRequestAssociateWallet>;

/**
 * The response to a request to associate a wallet.
 *
 * @category IDEX - Associate Wallet
 *
 * @see request {@link RestRequestAssociateWallet}
 * @see type    {@link IDEXWallet}
 */
export type RestResponseAssociateWallet = IDEXWallet;
