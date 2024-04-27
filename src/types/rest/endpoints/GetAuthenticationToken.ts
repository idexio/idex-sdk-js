import type { RestRequestByWallet } from '#index';

/**
 * Returns a single-use authentication token for access to private subscriptions in the WebSocket API.
 *
 * @see typedoc [Reference Documentation](https://sdk-js-docs-v4.idex.io/interfaces/RestRequestGetAuthenticationToken.html)
 * @see response {@link RestResponseGetAuthenticationToken}
 * @see type {@link IDEXWebSocketToken}
 *
 * @category IDEX - Get WebSocket Token
 */
export interface RestRequestGetAuthenticationToken
  extends RestRequestByWallet {}

// TIP: Open the reference documentation to see the interfaces properties

/**
 * Returns a single-use authentication token for access to private subscriptions in the WebSocket API.
 *
 * @see [API Documentation](https://api-docs-v4.idex.io/#get-authentication-token)
 * @see request {@link RestRequestGetAuthenticationToken}
 * @see response {@link RestResponseGetAuthenticationToken}
 *
 * @category IDEX Interfaces
 * @category IDEX - Get WebSocket Token
 */
export interface IDEXWebSocketToken {
  /**
   * WebSocket subscription authentication token
   */
  token: string;
}

/**
 * Returns a single-use authentication token for access to private subscriptions in the WebSocket API.
 *
 * @see [API Documentation](https://api-docs-v4.idex.io/#get-authentication-token)
 * @see type {@link IDEXWebSocketToken}
 * @see request {@link RestRequestGetAuthenticationToken}
 *
 * @category IDEX - Get WebSocket Token
 */
export type RestResponseGetAuthenticationToken = IDEXWebSocketToken;
