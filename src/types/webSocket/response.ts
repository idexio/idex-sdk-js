import * as enums from '../enums';
import * as restResponse from '../rest/response';
import { WebSocketRequestSubscription } from './request';

export interface WebSocketResponseTickerShort {
  m: string;
  t: number;
  o: string;
  h: string;
  l: string;
  c: string;
  Q: string;
  v: string;
  q: string;
  P: string;
  n: number;
  a: string;
  b: string;
  u: number;
}

export interface WebSocketResponseTradeShort {
  m: string;
  i: string;
  p: string;
  q: string;
  Q: string;
  t: number;
  s: keyof typeof enums.OrderSide;
  u: number;
}

export interface WebSocketResponseTradeLong
  extends restResponse.RestResponseTrade {
  market: string; // m
}

export interface WebSocketResponseCandleShort {
  m: string;
  t: number;
  i: keyof typeof enums.CandleInterval;
  s: number;
  e: number;
  o: string;
  h: string;
  l: string;
  c: string;
  v: string;
  n: number;
  u: number;
}

export interface WebSocketResponseCandleLong
  extends restResponse.RestResponseCandle {
  market: string; // m
  time: number; // t
  interval: keyof typeof enums.CandleInterval; // i
  end: number; // e
  numTrades: number; // n
}

export interface WebSocketResponseL1OrderBookShort {
  m: string;
  t: number;
  b: string;
  B: string;
  a: string;
  A: string;
}

export interface WebSocketResponseL1OrderBookLong {
  market: string; // m
  time: number; // t
  bidPrice: string; // b
  bidQuantity: string; // B
  askPrice: string; // a
  askQuantity: string; // A
}

type WebSocketResponseL2OrderBookChange = restResponse.RestResponseOrderBookPriceLevel;

export interface WebSocketResponseL2OrderBookShort {
  m: string;
  t: number;
  u: number;
  b: WebSocketResponseL2OrderBookChange[];
  a: WebSocketResponseL2OrderBookChange[];
}

export interface WebSocketResponseL2OrderBookLong {
  market: string; // m
  time: number; // t
  sequence: number; // u
  bids: WebSocketResponseL2OrderBookChange[]; // b
  asks: WebSocketResponseL2OrderBookChange[]; // a
}

export interface WebSocketResponseBalanceShort {
  w: string;
  a: string;
  q: string;
  f: string;
  l: string;
  d: string;
}

export interface WebSocketResponseBalanceLong {
  wallet: string; // w
  asset: string; // a
  quantity: string;
  availableForTrade: string; // f
  locked: string; // l
  usdValue: string;
}

export interface WebSocketResponseOrderShort {
  m: string;
  i: string;
  c?: string;
  w: string;
  t: number;
  T: number;
  x: keyof typeof enums.OrderStateChange;
  X: keyof typeof enums.OrderStatus;
  u?: number;
  o: keyof typeof enums.OrderType;
  S: keyof typeof enums.OrderSide;
  q?: string;
  Q?: string;
  z: string;
  Z?: string;
  v?: string;
  p?: string;
  P?: string;
  f?: keyof typeof enums.OrderTimeInForce;
  V?: keyof typeof enums.OrderSelfTradePrevention;
  F?: WebSocketResponseOrderFillShort[];
}

export interface WebSocketResponseOrderLong {
  market: string; // m
  orderId: string; // i
  clientOrderId?: string; // c
  wallet: string; // w
  executionTime: number; // t
  time: number; // T
  update: keyof typeof enums.OrderStateChange; // x
  status: keyof typeof enums.OrderStatus; // X
  sequence?: number; // u
  type: keyof typeof enums.OrderType; // o
  side: keyof typeof enums.OrderSide; // S
  originalQuantity?: string; // q
  originalQuoteQuantity?: string; // Q
  executedQuantity: string; // z
  cumulativeQuoteQuantity?: string; // Z
  avgExecutionPrice?: string; // v
  price?: string; // p
  stopPrice?: string; // P
  timeInForce?: keyof typeof enums.OrderTimeInForce; // f
  selfTradePrevention?: keyof typeof enums.OrderSelfTradePrevention; // V
  fills?: restResponse.RestResponseOrderFill[]; // F
}

export interface WebSocketResponseOrderFillShort {
  i: string;
  p: string;
  q: string;
  Q: string;
  t: number;
  s: keyof typeof enums.OrderSide;
  u: number;
  f: string;
  a: string;
  g?: string;
  l: keyof typeof enums.Liquidity;
  T?: string;
  S: keyof typeof enums.EthTransactionStatus;
}

export type WebSocketResponseSubscriptionMessageShort =
  | { type: 'tickers'; data: WebSocketResponseTickerShort }
  | { type: 'trades'; data: WebSocketResponseTradeShort }
  | { type: 'candles'; data: WebSocketResponseCandleShort }
  | { type: 'l1orderbook'; data: WebSocketResponseL1OrderBookShort }
  | { type: 'l2orderbook'; data: WebSocketResponseL2OrderBookShort }
  | { type: 'balances'; data: WebSocketResponseBalanceShort }
  | { type: 'orders'; data: WebSocketResponseOrderShort };

export type WebSocketResponseSubscriptionMessageLong =
  | { type: 'tickers'; data: restResponse.RestResponseTicker }
  | { type: 'trades'; data: WebSocketResponseTradeLong }
  | { type: 'candles'; data: WebSocketResponseCandleLong }
  | { type: 'l1orderbook'; data: WebSocketResponseL1OrderBookLong }
  | { type: 'l2orderbook'; data: WebSocketResponseL2OrderBookLong }
  | { type: 'balances'; data: WebSocketResponseBalanceLong }
  | { type: 'orders'; data: WebSocketResponseOrderLong };

/**
 * Error Response
 *
 * @typedef {Object} WebSocketResponseError
 * @property {string} [cid]
 * @property {string} type - error
 * @property {Object} data
 * @property {string} data.code - error short code
 * @property {string} data.message - human readable error message
 */
export interface WebSocketResponseError {
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
 * @typedef {Object} WebSocketResponseSubscriptions
 * @property {string} [cid]
 * @property {string} method - subscriptions
 * @property {WebSocketRequestSubscription[]} subscriptions
 * @property {string} Subscription.name - subscription name
 * @property {string} Subscription.markets - markets
 * @property {string} [Subscription.interval] - candle interval
 * @property {string} [Subscription.wallet] - wallet address
 */
export type WebSocketResponseSubscriptions = {
  cid?: string;
  type: 'subscriptions';
  subscriptions: WebSocketRequestSubscription[];
};

export type WebSocketResponse =
  | WebSocketResponseError
  | WebSocketResponseSubscriptions
  | WebSocketResponseSubscriptionMessageLong;

/*
 * Response message without transformation to human readable form
 */
export type WebSocketResponseRawMessage = WebSocketResponseSubscriptionMessageShort;
