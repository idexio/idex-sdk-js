import {
  WebSocketRequestSubscription,
  WebSocketRequestUnauthenticatedSubscription,
} from '../../types';

/*
 * Wallet is used only to generate user's wallet auth token
 * After we got token, we don't want to send wallet to the server
 */
export const removeWalletFromSdkSubscription = (
  subscription:
    | WebSocketRequestUnauthenticatedSubscription['name']
    | (WebSocketRequestSubscription & { wallet?: string }),
):
  | WebSocketRequestUnauthenticatedSubscription['name']
  | WebSocketRequestSubscription => {
  if (typeof subscription === 'string') {
    return subscription;
  }
  const subscriptionWithoutWallet = { ...subscription };
  if (subscriptionWithoutWallet.wallet) {
    delete subscriptionWithoutWallet.wallet;
  }
  return subscriptionWithoutWallet;
};
