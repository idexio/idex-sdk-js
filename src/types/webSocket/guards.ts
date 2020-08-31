/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  AuthTokenWebSocketRequestAuthenticatedSubscription,
  WebSocketRequestCandlesSubscription,
  WebSocketRequestSubscriptionLoose,
  WebSocketRequestUnauthenticatedSubscription,
} from './request';

import {
  WEBSOCKET_AUTHENTICATED_SUBSCRIPTIONS,
  WEBSOCKET_UNAUTHENTICATED_SUBSCRIPTIONS,
} from './constants';
import { WebSocketResponseSubscriptions } from './response';

/**
 * A type guard that checks if a given value is a subscription object which represents
 * an authenticated subscription. These subscriptions require the `wallet` property
 * (local to idex-sdk only) and require that the `WebSocketClient` was created
 * with the `websocketAuthTokenFetch` function provided.
 *
 * @property {any} subscription - The subscription to check
 */
export function isWebSocketAuthenticatedSubscription(
  subscription: any,
): subscription is AuthTokenWebSocketRequestAuthenticatedSubscription {
  return (
    subscription &&
    typeof subscription === 'object' &&
    WEBSOCKET_AUTHENTICATED_SUBSCRIPTIONS.includes(subscription.name)
  );
}

/**
 * A type guard that checks if a given value is a subscription object which represents
 * an unauthenticated subscription.
 *
 * @property {any} subscription - The subscription to check
 */
export function isWebSocketUnauthenticatedSubscription(
  subscription: any,
): subscription is WebSocketRequestUnauthenticatedSubscription {
  return (
    subscription &&
    typeof subscription === 'object' &&
    WEBSOCKET_UNAUTHENTICATED_SUBSCRIPTIONS.includes(subscription.name)
  );
}

/**
 * A type guard that checks if a given value is a subscription object which represents
 * a `candles` subscription. This is useful as the candles subscription has the `interval`
 * property in addition to `markets` and `name`.
 *
 * @property {any} subscription - The subscription to check
 */
export function isWebSocketCandlesSubscription(
  subscription: any,
): subscription is WebSocketRequestCandlesSubscription {
  return (
    subscription &&
    typeof subscription === 'object' &&
    subscription.name === 'candles' &&
    typeof subscription.interval === 'string'
  );
}

/**
 * A type guard which allows using a subscription object in a "loose" manner.  This is less "safe"
 * but can often be useful when parsing values where you do not need strict typing.  When true, the
 * provided value will be a "partial" shape of that conforms to any/all subscription objects.
 *
 * This should be used lightly.
 *
 * @property {any} subscription - The subscription to check
 */
export function isWebSocketLooseSubscription(
  subscription: any,
): subscription is WebSocketRequestSubscriptionLoose {
  return (
    subscription &&
    typeof subscription === 'object' &&
    typeof subscription.name === 'string'
  );
}

export function isWebSocketResponseSubscriptions(
  value: any,
): value is WebSocketResponseSubscriptions {
  return value && typeof value === 'object' && value.type === 'subscriptions';
}
