/** Requests */

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

export type IncomingMessage =
  | SubscribeRequest
  | SubscriptionsRequest
  | UnsubscribeRequest;

/** Responses */

export interface ErrorResponse {
  type: 'error';
  data: {
    code: string; // TODO improve type of short code
    message: string;
  };
}
