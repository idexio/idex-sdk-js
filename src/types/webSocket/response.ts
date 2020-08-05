import * as enums from '../enums';
import * as restResponse from '../rest/response';
import { Subscription } from './request';

export interface TickerShort {
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

export interface TradeShort {
  m: string;
  i: string;
  p: string;
  q: string;
  Q: string;
  t: number;
  s: keyof typeof enums.OrderSide;
  u: number;
}

export interface TradeLong extends restResponse.Trade {
  market: string; // m
}

export interface CandleShort {
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

export interface CandleLong extends restResponse.Candle {
  market: string; // m
  time: number; // t
  interval: keyof typeof enums.CandleInterval; // i
  end: number; // e
  numTrades: number; // n
}

export interface L1OrderBookShort {
  m: string;
  t: number;
  b: string;
  B: string;
  a: string;
  A: string;
}

export interface L1OrderBookLong {
  market: string; // m
  time: number; // t
  bidPrice: string; // b
  bidQuantity: string; // B
  askPrice: string; // a
  askQuantity: string; // A
}

type L2OrderBookChange = restResponse.OrderBookPriceLevel;

export interface L2OrderBookShort {
  m: string;
  t: number;
  u: number;
  b: L2OrderBookChange[];
  a: L2OrderBookChange[];
}

export interface L2OrderBookLong {
  market: string; // m
  time: number; // t
  sequence: number; // u
  bids: L2OrderBookChange[]; // b
  asks: L2OrderBookChange[]; // a
}

export interface BalanceShort {
  w: string;
  a: string;
  q: string;
  f: string;
  l: string;
  d: string;
}

export interface BalanceLong {
  wallet: string; // w
  asset: string; // a
  quantity: string;
  availableForTrade: string; // f
  locked: string; // l
  usdValue: string;
}

export interface OrderShort {
  m: string;
  i: string;
  c: string;
  w: string;
  t: number;
  T: number;
  x: keyof typeof enums.OrderStateChange;
  X: keyof typeof enums.OrderStatus;
  u: number;
  o: keyof typeof enums.OrderType;
  S: keyof typeof enums.OrderSide;
  q: string;
  Q?: string;
  z: string;
  Z?: string;
  v?: string;
  p?: string;
  P?: string;
  f: keyof typeof enums.OrderTimeInForce;
  V: keyof typeof enums.OrderSelfTradePrevention;
  F?: OrderFillShort[];
}

export interface OrderLong {
  market: string; // m
  orderId: string; // i
  clientOrderId: string; // c
  wallet: string; // w
  time: number; // t
  timeOfOriginalOrder: number; // T
  executionType: keyof typeof enums.OrderStateChange; // x
  status: keyof typeof enums.OrderStatus; // X
  sequence: number;
  orderBookSequenceNumber?: string; // u
  type: keyof typeof enums.OrderType; // o
  side: keyof typeof enums.OrderSide; // S
  timeInForce: keyof typeof enums.OrderTimeInForce; // f
  price?: string; // p
  stopPrice?: string; // P
  selfTradePrevention: keyof typeof enums.OrderSelfTradePrevention; // V
  originalQuantity: string; // q
  executedQuantity: string; // z
  cumulativeQuoteQuantity: string; // Z
  fills?: restResponse.OrderFill[]; // F
}

export interface OrderFillShort {
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

export type SubscriptionMessageShort =
  | { type: 'tickers'; data: TickerShort }
  | { type: 'trades'; data: TradeShort }
  | { type: 'candles'; data: CandleShort }
  | { type: 'l1orderbook'; data: L1OrderBookShort }
  | { type: 'l2orderbook'; data: L2OrderBookShort }
  | { type: 'balances'; data: BalanceShort }
  | { type: 'orders'; data: OrderShort };

export type SubscriptionMessageLong =
  | { type: 'tickers'; data: restResponse.Ticker }
  | { type: 'trades'; data: TradeLong }
  | { type: 'candles'; data: CandleLong }
  | { type: 'l1orderbook'; data: L1OrderBookLong }
  | { type: 'l2orderbook'; data: L2OrderBookLong }
  | { type: 'balances'; data: BalanceLong }
  | { type: 'orders'; data: OrderLong };

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
  subscriptions: Subscription[];
}

export type Response =
  | ErrorResponse
  | SubscriptionsResponse
  | SubscriptionMessageLong;

/*
 * Response message without transformation to human readable form
 */
export type RawResponseMessage = SubscriptionMessageShort;
