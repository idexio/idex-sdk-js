import {
  type KumaSubscribeTypeAuthenticated,
  type KumaSubscribeTypePublic,
  type KumaSubscribeType,
  type WebSocketClientOptionsPublicOnly,
  type WebSocketClientOptionsWithAPIKey,
  type WebSocketClientOptionsWithFetch,
  type WebSocketClientOptionsBase,
  type WebSocketSubscriptionShortNameAuthenticated,
  type WebSocketSubscriptionShortNamePublic,
  WebSocketSubscriptionShortNamesAuthenticated,
  WebSocketSubscriptionShortNamesPublic,
} from '#types/webSocket/index';

/**
 * @internal
 *
 * A type guard that checks if a given value is a subscription object which represents
 * an authenticated subscription. These subscriptions require the `wallet` property
 * (local to idex-sdk only) and require that the `WebSocketClient` was created
 * with the `websocketAuthTokenFetch` function provided.
 */
export function isWebSocketAuthenticatedSubscription(
  subscription:
    | KumaSubscribeType
    | WebSocketSubscriptionShortNameAuthenticated
    | WebSocketSubscriptionShortNamePublic,
  walletAuthAvailable: boolean = false,
): subscription is KumaSubscribeTypeAuthenticated {
  const name =
    typeof subscription === 'string' ? subscription : subscription?.name;

  if (name === 'webclient') {
    return walletAuthAvailable;
  }

  return WebSocketSubscriptionShortNamesAuthenticated.includes(
    name as WebSocketSubscriptionShortNameAuthenticated,
  );
}

export function isWebSocketPublicSubscription(
  subscription:
    | KumaSubscribeType
    | WebSocketSubscriptionShortNamePublic
    | WebSocketSubscriptionShortNameAuthenticated,
): subscription is KumaSubscribeTypePublic {
  const name =
    typeof subscription === 'string' ? subscription : subscription?.name;

  return WebSocketSubscriptionShortNamesPublic.includes(
    name as WebSocketSubscriptionShortNamePublic,
  );
}

export function isWebSocketOptionsPublicOnly(
  options: WebSocketClientOptionsBase,
): options is WebSocketClientOptionsPublicOnly {
  return !options.auth && !options.wallet && !options.websocketAuthTokenFetch;
}

export function isWebSocketOptionsAutoFetch(
  options: WebSocketClientOptionsBase,
): options is WebSocketClientOptionsWithAPIKey {
  return !!options.auth && !options.websocketAuthTokenFetch;
}

export function isWebSocketOptionsCustomFetch(
  options: WebSocketClientOptionsBase,
): options is WebSocketClientOptionsWithFetch {
  return !!options.websocketAuthTokenFetch && !options.auth && !!options.wallet;
}
