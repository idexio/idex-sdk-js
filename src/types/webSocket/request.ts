import * as enums from '../enums';
import { AugmentedOptional, AugmentedRequired, Expand } from '../utils';
import {
  WEBSOCKET_AUTHENTICATED_SUBSCRIPTIONS,
  WEBSOCKET_UNAUTHENTICATED_SUBSCRIPTIONS,
} from './constants';

export type WebSocketRequestSubscriptionName =
  | typeof WEBSOCKET_AUTHENTICATED_SUBSCRIPTIONS[number]
  | typeof WEBSOCKET_UNAUTHENTICATED_SUBSCRIPTIONS[number];

export type WebSocketRequestBalancesSubscription = {
  name: 'balances';
  wallet?: string;
};

export type WebSocketRequestOrdersSubscription = {
  name: 'orders';
  wallet?: string;
};

export type WebSocketRequestCandlesSubscription = {
  name: 'candles';
  markets: string[];
  interval: keyof typeof enums.CandleInterval;
};

export type WebSocketRequestL1OrderBookSubscription = {
  name: 'l1orderbook';
  markets: string[];
};

export type WebSocketRequestL2OrderBookSubscription = {
  name: 'l2orderbook';
  markets: string[];
};

export type WebSocketRequestTickersSubscription = {
  name: 'tickers';
  markets: string[];
};

export type WebSocketRequestTradesSubscription = {
  name: 'trades';
  markets: string[];
};

type WebSocketRequestWallet = {
  /**
   * wallet is required and is only handled by the idex-sdk.  It is used to auto generate the required
   * wsToken
   * @private
   */
  wallet: string;
};

/**
 * @typedef {Object} AuthTokenWebSocketRequestBalancesSubscription
 * @property {'balances'} name - The name of the subscription
 * @property {string} wallet -
 *  Balances subscription with `wallet` attribute, which is fed to the `websocketAuthTokenFetch`
 *  function when needed to get an updated `wsToken`.
 *  <br />
 *  **Note:** This property is not sent over the WebSocket and is exclusive to the idex-sdk.
 */
export type AuthTokenWebSocketRequestBalancesSubscription = Expand<
  WebSocketRequestBalancesSubscription & WebSocketRequestWallet
>;

/**
 * @typedef {Object} AuthTokenWebSocketRequestOrdersSubscription
 * @property {'orders'} name - The name of the subscription
 * @property {string} wallet -
 *  Orders subscription with `wallet` attribute, which is fed to the `websocketAuthTokenFetch`
 *  function when needed to get an updated `wsToken`.
 *  <br />
 *  **Note:** This property is not sent over the WebSocket and is exclusive to the idex-sdk.
 */
export type AuthTokenWebSocketRequestOrdersSubscription = Expand<
  WebSocketRequestOrdersSubscription & WebSocketRequestWallet
>;

export type WebSocketRequestAuthenticatedSubscription =
  | WebSocketRequestBalancesSubscription
  | WebSocketRequestOrdersSubscription;

export type WebSocketRequestUnauthenticatedSubscription =
  | WebSocketRequestCandlesSubscription
  | WebSocketRequestL1OrderBookSubscription
  | WebSocketRequestL2OrderBookSubscription
  | WebSocketRequestTickersSubscription
  | WebSocketRequestTradesSubscription;

export type AuthTokenWebSocketRequestAuthenticatedSubscription =
  | AuthTokenWebSocketRequestBalancesSubscription
  | AuthTokenWebSocketRequestOrdersSubscription;

export type AuthTokenWebSocketRequestSubscription =
  | AuthTokenWebSocketRequestAuthenticatedSubscription
  | WebSocketRequestUnauthenticatedSubscription;

export type WebSocketRequestSubscription =
  | AuthTokenWebSocketRequestAuthenticatedSubscription
  | WebSocketRequestUnauthenticatedSubscription;

export type WebSocketRequestSubscriptionsByName = {
  balances: WebSocketRequestBalancesSubscription;
  orders: WebSocketRequestOrdersSubscription;
  candles: WebSocketRequestCandlesSubscription;
  l1orderbook: WebSocketRequestL1OrderBookSubscription;
  l2orderbook: WebSocketRequestL2OrderBookSubscription;
  tickers: WebSocketRequestTickersSubscription;
  trades: WebSocketRequestTradesSubscription;
};

export type WebSocketRequestSubscribeShortNames = Exclude<
  keyof WebSocketRequestSubscriptionsByName,
  'candles'
>;

export type WebSocketRequestUnsubscribeShortNames = keyof WebSocketRequestSubscriptionsByName;

export type WebSocketRequestSubscribeStrictWithTopLevelMarkets = {
  method: 'subscribe';
  cid?: string;
  token?: string;
  markets: string[];
  // when markets is provided, we can accept string subscriptions or full subscriptions
  // and the subscriptions markets parameter is optional.  Candles can never be specified
  // by name only due to requiring the `interval` property
  subscriptions: (
    | WebSocketRequestAuthenticatedSubscription['name']
    | Exclude<WebSocketRequestUnauthenticatedSubscription['name'], 'candles'>
    | AugmentedOptional<WebSocketRequestUnauthenticatedSubscription, 'markets'>
    | WebSocketRequestAuthenticatedSubscription
  )[];
};

export type WebSocketRequestSubscribeStrictWithoutTopLevelMarkets = {
  method: 'subscribe';
  cid?: string;
  token?: string;
  markets?: undefined;
  // when top level markets property is not provided, authenticated subscriptions may still be defined
  // by name but all unauthenticated subscriptions require the markets array so may not be defined only
  // by their name.
  subscriptions: (
    | WebSocketRequestUnauthenticatedSubscription
    | WebSocketRequestAuthenticatedSubscription
    | WebSocketRequestAuthenticatedSubscription['name']
  )[];
};

// This type is strictly typed and understands how subscriptions should look
// depending on if a top level markets array is provided.
export type WebSocketRequestSubscribeStrict =
  | WebSocketRequestSubscribeStrictWithTopLevelMarkets
  | WebSocketRequestSubscribeStrictWithoutTopLevelMarkets;

// less strict subscribe shape
export type WebSocketRequestSubscribe = {
  method: 'subscribe';
  cid?: string;
  token?: string;
  markets?: string[];
  subscriptions: Array<
    | WebSocketRequestUnauthenticatedSubscription
    | WebSocketRequestAuthenticatedSubscription
    | WebSocketRequestUnauthenticatedSubscription['name']
  >;
};

// Loose typing to use while parsing or building
export type WebSocketRequestSubscriptionLoose = {
  name: string;
  markets?: string[];
  interval?: keyof typeof enums.CandleInterval;
};

// Subscription Objects in unsubscribe must have name but all other properties are
// considered optional
export type WebSocketRequestUnsubscribeSubscription = AugmentedRequired<
  Partial<
    | WebSocketRequestUnauthenticatedSubscription
    | WebSocketRequestAuthenticatedSubscription
  >,
  'name'
>;

export type WebSocketRequestUnsubscribe = {
  method: 'unsubscribe';
  cid?: string;
  markets?: string[];
  subscriptions?: (
    | WebSocketRequestUnsubscribeSubscription
    | WebSocketRequestUnsubscribeShortNames
  )[];
};

export type WebSocketRequestSubscriptions = {
  method: 'subscriptions';
  cid?: string;
};

export type WebSocketRequestStrict =
  | WebSocketRequestSubscribeStrict
  | WebSocketRequestSubscriptions
  | WebSocketRequestUnsubscribe;

export type WebSocketRequest =
  | WebSocketRequestSubscribe
  | WebSocketRequestSubscriptions
  | WebSocketRequestUnsubscribe;
