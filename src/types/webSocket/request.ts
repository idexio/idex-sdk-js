import * as enums from '../enums';

export type WebSocketRequestMethod =
  | 'subscribe'
  | 'subscriptions'
  | 'unsubscribe';

export enum WebSocketRequestAuthenticatedSubscriptionName {
  balances = 'balances',
  orders = 'orders',
}

export enum WebSocketRequestUnauthenticatedSubscriptionName {
  candles = 'candles',
  l1orderbook = 'l1orderbook',
  l2orderbook = 'l2orderbook',
  tickers = 'tickers',
  trades = 'trades',
}

export type WebSocketRequestSubscriptionName =
  | keyof typeof WebSocketRequestUnauthenticatedSubscriptionName
  | keyof typeof WebSocketRequestAuthenticatedSubscriptionName;

export type WebSocketRequestBalancesSubscription = {
  name: 'balances';
};

/**
 * @typedef {Object} AuthTokenWebSocketRequestBalancesSubscription
 * @property {'balances'} name - The name of the subscription
 * @property {string} [wallet] -
 *  Balances subscription with `wallet` attribute, which is fed to the `websocketAuthTokenFetch`
 *  function when needed to get an updated `wsToken`.
 *  <br />
 *  **Note:** This property is not sent over the WebSocket and is exclusive to the idex-sdk.
 */
export type AuthTokenWebSocketRequestBalancesSubscription = WebSocketRequestBalancesSubscription & {
  wallet: string;
};

export type WebSocketRequestOrdersSubscription = {
  name: 'orders';
};

/**
 * @typedef {Object} AuthTokenWebSocketRequestOrdersSubscription
 * @property {'orders'} name - The name of the subscription
 * @property {string} [wallet] -
 *  Orders subscription with `wallet` attribute, which is fed to the `websocketAuthTokenFetch`
 *  function when needed to get an updated `wsToken`.
 *  <br />
 *  **Note:** This property is not sent over the WebSocket and is exclusive to the idex-sdk.
 */
export type AuthTokenWebSocketRequestOrdersSubscription = WebSocketRequestOrdersSubscription & {
  wallet: string;
};

export interface WebSocketRequestCandlesSubscription {
  name: 'candles';
  markets: string[];
  interval: keyof typeof enums.CandleInterval;
}

export interface WebSocketRequestL1OrderBookSubscription {
  name: 'l1orderbook';
  markets?: string[];
}

export interface WebSocketRequestL2OrderBookSubscription {
  name: 'l2orderbook';
  markets?: string[];
}

export interface WebSocketRequestTickersSubscription {
  name: 'tickers';
  markets?: string[];
}

export interface WebSocketRequestTradesSubscription {
  name: 'trades';
  markets?: string[];
}

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

export type WebSocketRequestSubscribe = {
  method: 'subscribe';
  cid?: string;
  token?: string;
  markets?: string[];
  subscriptions: (
    | WebSocketRequestSubscription
    | WebSocketRequestSubscriptionName
  )[];
};

export type WebSocketRequestUnsubscribeSubscription = Partial<
  WebSocketRequestSubscription
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
  | WebSocketRequestSubscribe
  | WebSocketRequestSubscriptions
  | WebSocketRequestUnsubscribe;
