type TokensMap = {
  [wallet: string]:
    | {
        fetching?: Promise<string>;
        expiration: number;
        token?: string;
      }
    | undefined;
};

const TOKEN_EXPIRATION_MS = 1000 * 60 * 14; // 14 minutes (15 is already expired)

type WebsocketTokenFetch = (wallet: string) => Promise<string>;

/**
 * https://docs.idex.io/#websocket-authentication-endpoints
 *
 * ```
 * const wsTokenStore = new WebsocketTokenManager(wallet => client.getWsToken(uuidv1(), wallet))
 * const token = await wsTokenStore.getToken("0x123abc...");
 * wsClient.subscribe([{ name: 'balance', wallet: '0x0'}], token);
 * ```
 */
export default class WebsocketTokenManager {
  private websocketAuthTokenFetch: WebsocketTokenFetch;

  private walletTokens: TokensMap = {};

  constructor(websocketAuthTokenFetch: WebsocketTokenFetch) {
    this.websocketAuthTokenFetch = websocketAuthTokenFetch;
  }

  public getToken = async (walletAddress: string): Promise<string> => {
    const tokenRef = this.walletTokens[walletAddress];
    if (tokenRef) {
      // If there are more parallel requests, make sure we fetch just once
      if (tokenRef.fetching) {
        return tokenRef.fetching;
      }
      const isValid =
        tokenRef.expiration < new Date().getTime() && tokenRef.token;

      if (isValid) {
        return tokenRef.token;
      }
    }
    // In case we requesting wallet token first time,
    // or token already expired (~15 mins),
    // we need to generate fresh one.
    tokenRef.expiration = new Date().getTime() + TOKEN_EXPIRATION_MS;
    tokenRef.fetching = this.websocketAuthTokenFetch(walletAddress);
    tokenRef.token = '';

    const token = await tokenRef.fetching;

    tokenRef.token = token;
    tokenRef.fetching = undefined;

    return token;
  };

  public getLastCachedToken = (walletAddress: string): string => {
    return this.walletTokens[walletAddress].token || '';
  };
}
