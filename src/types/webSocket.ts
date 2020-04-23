export enum SubscriptionName {
  balances = 'balances',
  candles = 'candles',
  l1orderbook = 'l1orderbook',
  l2orderbook = 'l2orderbook',
  orders = 'orders',
  tickers = 'tickers',
  trades = 'trades',
}

export type Method = 'subscribe' | 'subscriptions' | 'unsubscribe';

export interface Subscription {
  markets: string[];
  name: keyof typeof SubscriptionName;
  token?: string;
}

interface SubscribeRequest {
  cid?: string;
  method: 'subscribe';
  subscriptions: Subscription[];
}

interface UnsubscribeRequest {
  cid?: string;
  method: 'unsubscribe';
  markets: string[];
  subscriptions: (keyof typeof SubscriptionName)[];
}

interface SubscriptionsRequest {
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
 * @property {string} cid
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

/**
 * Subscriptions Response
 *
 * @typedef {Object} webSocketResponse.Subscriptions
 * @property {string} cid
 * @property {string} method - subscriptions
 * @property {Subscription[]} subscriptions
 * @property {string} Subscription.name - subscription name
 * @property {string} Subscription.markets - markets
 */
export interface SubscriptionsResponse {
  cid?: string;
  type: 'subscriptions';
  subscriptions: Subscription[];
}

export type Response = ErrorResponse | SubscriptionsResponse;
