import type {
  WebSocketRequestMethod,
  SubscriptionNameAuthenticated,
  SubscriptionNamePublic,
} from '#types/enums/index';
import type {
  WebSocketRequestUnsubscribeSubscription,
  KumaSubscribeTypeAuthenticated,
  KumaSubscribeTypePublic,
  KumaSubscribeType,
} from '#types/webSocket/index';

/**
 * [[include:base.md]]
 *
 * @category Base Types
 */
interface WebSocketRequestBase {
  /**
   * The request that is being made matching the enum {@link WebSocketRequestMethod}
   */
  method: WebSocketRequestMethod;
  /**
   * Requests may optionally provide a `cid` parameter to identify the request a response should be associated with.
   *
   * - When provided, the `onResponse` callback object will include the provided `cid` as a property.
   */
  cid?: string;
  /**
   * A top-level `markets` array can be used to allow multiple subscriptions to inherit this array without having define them themselves.
   *
   * - When a subscription does not define the `markets` parameter, it will inherit the top-level
   *   `markets` array provided here.
   */
  markets?: string[];
}

/**
 * The base type which is a superset of all possible parameters and subscriptions that can
 * be made to the WebSocket API.
 *
 * @see related {@link WebSocketRequestSubscribeStrictWithTopLevelMarkets}
 * @see related {@link WebSocketRequestSubscribeStrictWithoutTopLevelMarkets}
 *
 * @category WebSocket - Subscribe
 */
export interface WebSocketRequestSubscribe extends WebSocketRequestBase {
  /**
   * The `subscribe` method is used to subscribe to a list of {@link subscriptions} based on
   * your provided parameters.
   */
  method: typeof WebSocketRequestMethod.subscribe;
  token?: string;

  /**
   * - **When top-level markets is provided:**
   *   - we can accept string subscription names or full subscriptions
   *     and the subscriptions markets parameter is optional.
   *   - `candles` may never be provided as a name-string as it has a
   *     required `interval` parameter.
   * - **when top level markets property is not provided:**
   *   - all unauthenticated subscriptions require the markets array so may not be defined only
   *     by their name.
   *   - authenticated subscriptions may still be defined by name
   */
  subscriptions: KumaSubscribeType[];
}

/**
 * When providing a top-level {@link markets} parameter, we can accept subscriptions using a short-hand
 * of the subscription name only.
 *
 * - If a subscription does not provide its own `markets` parameter, it will inherit the top-level
 *   markets array provided.
 *
 * @see base    {@link WebSocketRequestSubscribe}
 * @see related {@link WebSocketRequestSubscribeStrictWithoutTopLevelMarkets}
 *
 * @category WebSocket - Subscribe
 */
export interface WebSocketRequestSubscribeStrictWithTopLevelMarkets
  extends WebSocketRequestSubscribe {
  /**
   * @inheritDoc
   */
  markets: string[];
}

/**
 * When providing a top-level {@link markets} parameter, we can accept subscriptions using a short-hand
 * of the subscription name only.
 *
 * - If a subscription does not provide its own `markets` parameter, it will inherit the top-level
 *   markets array provided.
 *
 * @see base    {@link WebSocketRequestSubscribe}
 * @see related {@link WebSocketRequestSubscribeStrictWithTopLevelMarkets}
 *
 * @category WebSocket - Subscribe
 */
export interface WebSocketRequestSubscribeStrictWithoutTopLevelMarkets
  extends WebSocketRequestSubscribe {
  markets?: undefined;
  /**
   * @inheritDoc
   */
  subscriptions: (
    | (KumaSubscribeTypePublic & {
        /**
         * - When a top-level markets is not provided, all public subscriptions require a markets
         *   array.
         */
        markets: string[];
      })
    | KumaSubscribeTypeAuthenticated
  )[];
}

/**
 * @see union {@link WebSocketRequestSubscribeStrictWithTopLevelMarkets}
 * @see union {@link WebSocketRequestSubscribeStrictWithoutTopLevelMarkets}
 */
export type WebSocketRequestSubscribeStrict =
  | WebSocketRequestSubscribeStrictWithTopLevelMarkets
  | WebSocketRequestSubscribeStrictWithoutTopLevelMarkets;

/**
 * UnsubscribeRequest
 *
 * - When removing a subscription, you need only provide the `name` of the subscription
 *   rather than a complete subscription object.
 *
 * @category WebSocket - Unsubscribe
 */
export interface WebSocketRequestUnsubscribe extends WebSocketRequestBase {
  /**
   * @inheritDoc
   */
  method: typeof WebSocketRequestMethod.unsubscribe;
  /**
   * An array of subscription objects to unsubscribe from
   */
  subscriptions?: (
    | WebSocketRequestUnsubscribeSubscription
    | SubscriptionNamePublic
    | SubscriptionNameAuthenticated
  )[];
}

/**
 * Requests all current subscriptions active on the WebSocket session.
 */
export interface WebSocketRequestSubscriptionsList
  extends WebSocketRequestBase {
  /**
   * A `subscriptions` request will provide a response with a list of all current subscriptions for the client.
   */
  method: typeof WebSocketRequestMethod.subscriptions;
}

export type WebSocketRequestStrict =
  | WebSocketRequestSubscribeStrict
  | WebSocketRequestSubscriptionsList
  | WebSocketRequestUnsubscribe;

/**
 * A type representing all current requests that can be made to the WebSocket API.
 */
export type WebSocketRequest =
  | WebSocketRequestSubscribe
  | WebSocketRequestSubscriptionsList
  | WebSocketRequestUnsubscribe;
