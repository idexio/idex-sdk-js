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

/**
 * @typedef {Object} WebSocketRequestBalancesSubscription
 * @property {'balances'} name - The name of the subscription
 * @property {string} [wallet] -
 *  Wallet to subscribe to.  This is fed to the `websocketAuthTokenFetch` function when
 *  needed to get an updated `wsToken`.  This property is not required if a wallet was
 *  provided when constructing the WebSocketClient.
 *  <br />
 *  **Note:** This property is not sent over the WebSocket and is exclusive to the idex-sdk.
 *
 */
export type WebSocketRequestBalancesSubscription = {
  name: 'balances';
  /**
   *  Wallet to subscribe to.  This is fed to the `websocketAuthTokenFetch` function when
   *  needed to get an updated `wsToken`.  This property is not required if a wallet was
   *  provided when constructing the WebSocketClient.
   */
  wallet?: string;
};

/**
 * @typedef {Object} WebSocketRequestOrdersSubscription
 * @property {'orders'} name - The name of the subscription
 * @property {string} [wallet] -
 *  Wallet to subscribe to.  This is fed to the `websocketAuthTokenFetch` function when
 *  needed to get an updated `wsToken`.  This property is not required if a wallet was
 *  provided when constructing the WebSocketClient.
 *  <br />
 *  **Note:** This property is not sent over the WebSocket and is exclusive to the idex-sdk.
 */
export type WebSocketRequestOrdersSubscription = {
  name: 'orders';
  /**
   *  Wallet to subscribe to.  This is fed to the `websocketAuthTokenFetch` function when
   *  needed to get an updated `wsToken`.  This property is not required if a wallet was
   *  provided when constructing the WebSocketClient.
   */
  wallet?: string;
};

export interface WebSocketRequestCandlesSubscription {
  name: 'candles';
  markets?: string[];
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

export type WebSocketRequestSubscribeRequest = {
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

export interface WebSocketRequestUnsubscribeRequest {
  method: 'unsubscribe';
  cid?: string;
  markets?: string[];
  subscriptions?: (
    | WebSocketRequestUnsubscribeSubscription
    | WebSocketRequestSubscriptionName
  )[];
}

export interface WebSocketRequestSubscriptionsRequest {
  method: 'subscriptions';
  cid?: string;
}

export type WebSocketRequest =
  | WebSocketRequestSubscribeRequest
  | WebSocketRequestSubscriptionsRequest
  | WebSocketRequestUnsubscribeRequest;
