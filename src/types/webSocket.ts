import { CandleInterval } from './enums';

export enum AuthenticatedSubscriptionName {
  balances = 'balances',
  orders = 'orders',
}

export enum UnauthenticatedSubscriptionName {
  candles = 'candles',
  l1orderbook = 'l1orderbook',
  l2orderbook = 'l2orderbook',
  tickers = 'tickers',
  trades = 'trades',
}

export type SubscriptionName =
  | keyof typeof UnauthenticatedSubscriptionName
  | keyof typeof AuthenticatedSubscriptionName;

export type Method = 'subscribe' | 'subscriptions' | 'unsubscribe';

export interface Subscription {
  markets: string[];
  name: SubscriptionName;
  interval?: keyof typeof CandleInterval;
}

export type SubscribeRequestShort = {
  cid?: string;
  token?: string;
  method: 'subscribe';
  markets: string[];
  subscriptions: SubscriptionName[];
};

export type SubscribeRequestLong = {
  cid?: string;
  token?: string;
  method: 'subscribe';
  subscriptions: Subscription[];
};

export type SubscribeRequest = SubscribeRequestLong | SubscribeRequestShort;

export interface UnsubscribeRequest {
  cid?: string;
  method: 'unsubscribe';
  markets?: string[];
  subscriptions?: SubscriptionName[];
}

export interface SubscriptionsRequest {
  cid?: string;
  method: 'subscriptions';
}

export type Request =
  | SubscribeRequest
  | SubscriptionsRequest
  | UnsubscribeRequest;

/**
 * Error Response
 *
 * @typedef {Object} webSocketResponse.Error
 * @property {string} [cid]
 * @property {string} type - error
 * @property {Object} data
 * @property {string} data.code - error short code
 * @property {string} data.message - human readable error message
 */
export interface ErrorResponse {
  cid?: string;
  type: 'error';
  data: {
    code: string;
    message: string;
  };
}

export interface ResponseSubscription {
  markets: string[];
  name: SubscriptionName;
  interval?: keyof typeof CandleInterval;
  wallet?: string;
}

/**
 * Subscriptions Response
 *
 * @typedef {Object} webSocketResponse.Subscriptions
 * @property {string} [cid]
 * @property {string} method - subscriptions
 * @property {Subscription[]} subscriptions
 * @property {string} Subscription.name - subscription name
 * @property {string} Subscription.markets - markets
 * @property {string} [Subscription.interval] - candle interval
 * @property {string} [Subscription.wallet] - wallet address
 */
export interface SubscriptionsResponse {
  cid?: string;
  type: 'subscriptions';
  subscriptions: ResponseSubscription[];
}

export type Response = ErrorResponse | SubscriptionsResponse;
