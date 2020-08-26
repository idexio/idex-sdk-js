import * as enums from '../enums';
import { AugmentedOptional, AugmentedRequired, Expand } from '../utils';

export const WebSocketRequestAuthenticatedSubscriptionName = {
  balances: 'balances',
  orders: 'orders',
} as const;

export const WebSocketRequestUnauthenticatedSubscriptionName = {
  candles: 'candles',
  l1orderbook: 'l1orderbook',
  l2orderbook: 'l2orderbook',
  tickers: 'tickers',
  trades: 'trades',
} as const;

export type WebSocketRequestSubscriptionName =
  | keyof typeof WebSocketRequestUnauthenticatedSubscriptionName
  | keyof typeof WebSocketRequestAuthenticatedSubscriptionName;

export type WebSocketRequestBalancesSubscription = {
  name: 'balances';
};

export type WebSocketRequestOrdersSubscription = {
  name: 'orders';
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

export type WebSocketRequestSubscription =
  | WebSocketRequestAuthenticatedSubscription
  | WebSocketRequestUnauthenticatedSubscription;

export type AuthTokenWebSocketRequestAuthenticatedSubscription =
  | AuthTokenWebSocketRequestBalancesSubscription
  | AuthTokenWebSocketRequestOrdersSubscription;

export type AuthTokenWebSocketRequestSubscription =
  | AuthTokenWebSocketRequestAuthenticatedSubscription
  | WebSocketRequestUnauthenticatedSubscription;

// This type is strictly typed and understands how subscriptions should look
// depending on if a top level markets array is provided.
export type WebSocketRequestSubscribeStrict =
  | {
      method: 'subscribe';
      cid?: string;
      token?: string;
      markets: string[];
      // when markets is provided, we can accept string subscriptions or full subscriptions
      // and the subscriptions markets parameter is optional.  Candles can never be specified
      // by name only due to requiring the `interval` property
      subscriptions: (
        | WebSocketRequestAuthenticatedSubscription['name']
        | Exclude<
            WebSocketRequestUnauthenticatedSubscription['name'],
            'candles'
          >
        | AugmentedOptional<
            WebSocketRequestUnauthenticatedSubscription,
            'markets'
          >
        | WebSocketRequestAuthenticatedSubscription
      )[];
    }
  | {
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

// less strict subscribe shape
export type WebSocketRequestSubscribe = {
  method: 'subscribe';
  cid?: string;
  token?: string;
  markets?: string[];
  subscriptions: Array<
    | WebSocketRequestUnauthenticatedSubscription
    | WebSocketRequestAuthenticatedSubscription
    | WebSocketRequestAuthenticatedSubscription['name']
    | Exclude<WebSocketRequestUnauthenticatedSubscription['name'], 'candles'>
  >;
};

// Subscription Objects in unsubscribe must have name but all other properties are
// considered optional
export type WebSocketRequestUnsubscribeSubscription = AugmentedRequired<
  Partial<WebSocketRequestUnauthenticatedSubscription>,
  'name'
>;

export interface WebSocketRequestUnsubscribe {
  method: 'unsubscribe';
  cid?: string;
  markets?: string[];
  subscriptions?: (
    | WebSocketRequestUnsubscribeSubscription
    | WebSocketRequestSubscriptionName
  )[];
}

export interface WebSocketRequestSubscriptions {
  method: 'subscriptions';
  cid?: string;
}

export type WebSocketRequest =
  | WebSocketRequestSubscribeStrict
  | WebSocketRequestSubscriptions
  | WebSocketRequestUnsubscribe;
