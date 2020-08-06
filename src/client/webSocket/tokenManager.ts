import { WebSocketRequestSubscription } from '../../types';

type TokenValue = {
  fetching?: Promise<string>;
  expiration: number;
  token?: string;
};

type TokensMap = {
  [wallet: string]: TokenValue | undefined;
};

const TOKEN_EXPIRATION_MS = 1000 * 60 * 14; // 14 minutes (15 is already expired)

type WebsocketTokenFetch = (wallet: string) => Promise<string>;

/**
 * https://docs.idex.io/#websocket-authentication-endpoints
 *
 * @private
 * @example
 *  const wsTokenStore = new WebsocketTokenManager(wallet => client.getWsToken(uuidv1(), wallet))
 *  const token = await wsTokenStore.getToken("0x123abc...");
 *  wsClient.subscribe([{ name: 'balance', wallet: '0x0'}], token);
 */
export default class WebsocketTokenManager {
  private websocketAuthTokenFetch: WebsocketTokenFetch;

  private walletTokens: TokensMap = {};

  constructor(websocketAuthTokenFetch: WebsocketTokenFetch) {
    this.websocketAuthTokenFetch = websocketAuthTokenFetch;
  }

  /**
   * Get a token for the given wallet, returning any previously generated
   * tokens if they have not expired yet.  If called in parallel it will
   * return the pending request if the wallet is the same.
   * @private
   */
  public async getToken(walletAddress: string): Promise<string | undefined> {
    const tokenRef = this.walletTokens[walletAddress];
    if (tokenRef) {
      // If there are more parallel requests, make sure we fetch just once
      if (tokenRef.fetching) {
        return tokenRef.fetching;
      }

      if (tokenRef.token && tokenRef.expiration < Date.now()) {
        return tokenRef.token;
      }
    }

    // In case we RestRequesting wallet token first time,
    // or token already expired (~15 mins),
    // we need to generate fresh one.
    const tokenUpdate = (this.walletTokens[walletAddress] = {
      expiration: Date.now() + TOKEN_EXPIRATION_MS,
      fetching: this.websocketAuthTokenFetch(walletAddress),
      token: undefined,
    } as TokenValue);

    try {
      const token = await tokenUpdate.fetching;
      tokenUpdate.token = token;
      return token;
    } finally {
      tokenUpdate.fetching = undefined;
    }
  }

  public getLastCachedToken = (walletAddress: string): string => {
    return this.walletTokens[walletAddress]?.token || '';
  };
}

/*
 * Wallet is used only to generate user's wallet auth token
 * After we got token, we don't want to send wallet to the server
 */
export const removeWalletFromSdkSubscription = (
  subscription: WebSocketRequestSubscription & { wallet?: string },
): WebSocketRequestSubscription => {
  const subscriptionWithoutWallet = { ...subscription };
  if (subscriptionWithoutWallet.wallet) {
    delete subscriptionWithoutWallet.wallet;
  }
  return subscriptionWithoutWallet;
};
