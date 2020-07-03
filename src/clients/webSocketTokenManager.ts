import AuthenticatedClient from './authenticated';

type TokensMap = {
  [wallet: string]:
    | {
        expiration: number;
        token: string;
      }
    | undefined;
};

const TOKEN_EXPIRATION_MS = 1000 * 60 * 14; // 14 minutes

/**
 * https://docs.idex.io/#websocket-authentication-endpoints
 */
export default class WebsocketTokenManager {
  private restApiClient: AuthenticatedClient;

  private getRequestNonce: () => string;

  private walletTokens: TokensMap = {};

  constructor(
    restApiClient: AuthenticatedClient,
    getRequestNonce: () => string,
  ) {
    this.restApiClient = restApiClient;
    this.getRequestNonce = getRequestNonce;
  }

  getToken = async (walletAddress: string): Promise<string> => {
    const tokenObj = this.walletTokens[walletAddress];
    if (tokenObj) {
      const isValid =
        tokenObj.expiration < new Date().getTime() && tokenObj.token;

      if (isValid) {
        return tokenObj.token;
      }
    }
    // In case we requesting wallet token first time,
    // or token already expired (~15 mins),
    // we need to generate fresh one.
    const token = await this.restApiClient.getWsToken(
      this.getRequestNonce(),
      walletAddress,
    );
    this.walletTokens[walletAddress] = {
      expiration: new Date().getTime() + TOKEN_EXPIRATION_MS,
      token,
    };
    return token;
  };
}
