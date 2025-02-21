import type { RestRequestByWallet } from '#index';

/**
 * Returns a single-use authentication token for access to private subscriptions in the WebSocket API.
 *
 * @see typedoc [Reference Documentation](https://sdk-js-docs-v1.kuma.bid/interfaces/RestRequestGetAuthenticationToken.html)
 * @see response {@link RestResponseGetAuthenticationToken}
 * @see type {@link KumaWebSocketToken}
 *
 * @category Kuma - Get WebSocket Token
 */
export interface RestRequestGetAuthenticationToken
  extends RestRequestByWallet {}

// TIP: Open the reference documentation to see the interfaces properties

/**
 * Returns a single-use authentication token for access to private subscriptions in the WebSocket API.
 *
 * @see [API Documentation](https://api-docs-v1.kuma.bid/#get-authentication-token)
 * @see request {@link RestRequestGetAuthenticationToken}
 * @see response {@link RestResponseGetAuthenticationToken}
 *
 * @category Kuma Interfaces
 * @category Kuma - Get WebSocket Token
 */
export interface KumaWebSocketToken {
  /**
   * WebSocket subscription authentication token
   */
  token: string;
}

/**
 * Returns a single-use authentication token for access to private subscriptions in the WebSocket API.
 *
 * @see [API Documentation](https://api-docs-v1.kuma.bid/#get-authentication-token)
 * @see type {@link KumaWebSocketToken}
 * @see request {@link RestRequestGetAuthenticationToken}
 *
 * @category Kuma - Get WebSocket Token
 */
export type RestResponseGetAuthenticationToken = KumaWebSocketToken;
