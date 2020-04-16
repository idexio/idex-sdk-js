export type SubscriptionName =
  | 'balances'
  | 'candles'
  | 'l1orderbook'
  | 'l2orderbook'
  | 'orders'
  | 'tickers'
  | 'trades';

export type Method = 'subscribe' | 'subscriptions' | 'unsubscribe';

interface Subscription {
  name: SubscriptionName;
  markets: string[];
}

interface SubscribeRequest {
  cid?: string;
  method: 'subscribe';
  subscriptions: Subscription[];
}

interface UnsubscribeRequest {
  cid?: string;
  method: 'unsubscribe';
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
 * @typedef {Object} response.Error
 * @property {string} type - error
 * @property {Object} data
 * @property {string} data.code - error short code
 * @property {string} data.message - human readable error message
 */
export interface ErrorResponse {
  type: 'error';
  data: {
    code: string;
    message: string;
  };
}
