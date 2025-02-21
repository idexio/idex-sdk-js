import {
  SubscriptionNamePublic,
  SubscriptionNameAuthenticated,
} from '#types/enums/request';

import type { Expand } from '#types/utils';
/**
 * <div>
 * [[include:base.md]]
 * </div>
 *
 * A Base type that all authenticated WebSocket subscriptions extend upon.
 *
 * @see         [WebSocket API Docs](https://api-docs-v1.kuma.bid/#websocket-api-interaction)
 * @see names   {@link SubscriptionNameAuthenticated}
 * @see related {@link KumaSubscribeTypeAuthenticated}
 */
/**
 * Simple filter function to remove the `candles` that is both type safe
 * and does not require a type assertion.
 *
 * @internal
 */
function filterCandles<T extends SubscriptionNamePublic>(
  value: T,
): value is Exclude<T, 'candles'> {
  return value !== SubscriptionNamePublic.candles;
}

/**
 * - No changes from {@link SubscriptionNameAuthenticated}, all authenticated subscriptions
 *   may use the "short" name-only subscribe capability.
 *
 * @see alias {@link SubscriptionNameAuthenticated}
 *
 * @enum
 * @internal
 */
export const WebSocketSubscriptionShortNameAuthenticated =
  SubscriptionNameAuthenticated;

export type WebSocketSubscriptionShortNameAuthenticated =
  (typeof SubscriptionNameAuthenticated)[keyof typeof SubscriptionNameAuthenticated];

/**
 * - For public subscriptions, all subscription types except {@link SubscriptionNamePublic.candles}
 *   may use the "short" name-only subscribe capability.
 *
 * @see related {@link SubscriptionNamePublic}
 *
 * @enum
 * @internal
 */
export const WebSocketSubscriptionShortNamePublic = Object.fromEntries(
  Object.entries(SubscriptionNamePublic).filter(([, value]) =>
    filterCandles(value),
  ),
) as Expand<Omit<typeof SubscriptionNamePublic, 'candles'>>;

export type WebSocketSubscriptionShortNamePublic =
  (typeof WebSocketSubscriptionShortNamePublic)[keyof typeof WebSocketSubscriptionShortNamePublic];

export const WebSocketSubscriptionShortNamesAuthenticated = Object.freeze([
  ...Object.values(WebSocketSubscriptionShortNameAuthenticated),
]);

export const WebSocketSubscriptionShortNamesPublic = Object.freeze([
  ...Object.values(WebSocketSubscriptionShortNamePublic),
]);

export const WebSocketSubscriptionShortNames = Object.freeze([
  ...WebSocketSubscriptionShortNamesAuthenticated,
  ...WebSocketSubscriptionShortNamesPublic,
] as const);
