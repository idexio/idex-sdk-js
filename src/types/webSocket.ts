import * as enums from './enums';

export type Method = 'subscribe' | 'subscriptions' | 'unsubscribe';

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

export interface BalancesSubscription {
  name: 'balances';
  wallet: string;
}

export interface OrdersSubscription {
  name: 'orders';
  markets: string[];
  wallet: string;
}

export interface CandlesSubscription {
  name: 'candles';
  markets: string[];
  interval: keyof typeof enums.CandleInterval;
}

export interface L1OrderBookSubscription {
  name: 'l1orderbook';
  markets: string[];
}

export interface L2OrderBookSubscription {
  name: 'l2orderbook';
  markets: string[];
}

export interface TickersSubscription {
  name: 'tickers';
  markets: string[];
}

export interface TradesSubscription {
  name: 'trades';
  markets: string[];
}

export type AuthenticatedSubscription =
  | BalancesSubscription
  | OrdersSubscription;

export type UnauthenticatedSubscription =
  | CandlesSubscription
  | L1OrderBookSubscription
  | L2OrderBookSubscription
  | TickersSubscription
  | TradesSubscription;

export type Subscription =
  | CandlesSubscription
  | L1OrderBookSubscription
  | L2OrderBookSubscription
  | TickersSubscription
  | TradesSubscription
  | BalancesSubscription
  | OrdersSubscription;

export type SubscribeRequest = {
  method: 'subscribe';
  cid?: string;
  token?: string;
  markets?: string[];
  subscriptions: (Subscription | SubscriptionName)[];
};

export interface UnsubscribeRequest {
  method: 'unsubscribe';
  cid?: string;
  markets?: string[];
  subscriptions?: (Subscription | SubscriptionName)[];
}

export interface SubscriptionsRequest {
  method: 'subscriptions';
  cid?: string;
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
