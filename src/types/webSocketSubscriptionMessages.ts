import * as enums from './enums';
import * as response from './response';

export type BuyOrSellShort = 'b' | 's';

export type BuyOrSellLong = 'buy' | 'sell';

export interface TickerShort {
  m: string;
  t: string;
  o: string;
  h: string;
  l: string;
  c: string;
  Q: string;
  v: string;
  q: string;
  P: string;
  n: string;
  a: string;
  b: string;
  u: string;
}

export interface TradeShort {
  m: string;
  i: string;
  p: string;
  q: string;
  Q: string;
  t: number;
  s: BuyOrSellShort;
  u: string;
}

export interface TradeLong extends response.Trade {
  market: string; // m
}

export interface CandleShort {
  m: string;
  t: number;
  i: enums.CandleInterval;
  s: number;
  e: number;
  o: string;
  h: string;
  l: string;
  c: string;
  v: string;
  n: number;
  u: string;
}

export interface CandleLong extends response.Candle {
  market: string; // m
  interval: enums.CandleInterval; // i
  startTime: number; // s
  endTime: number; // e
  numberOfFills: number; // n
  sequence: string; // u
}

export interface L1OrderBookShort {
  m: string;
  t: number;
  a: string;
  A: string;
  b: string;
  B: string;
}

export interface L1OrderBookLong {
  market: string; // m
  time: number; // t
  askPrice: string; // a
  askQuantity: string; // A
  bidPrice: string; // b
  bidQuantity: string; // B
}

type L2OrderBookChange = [response.OrderBookPriceLevel];

export interface L2OrderBookShort {
  m: string;
  t: number;
  u: string;
  b?: L2OrderBookChange[];
  a?: L2OrderBookChange[];
}

export interface L2OrderBookLong {
  market: string; // m
  time: number; // t
  sequence: string; // u
  bids?: L2OrderBookChange[]; // b
  asks?: L2OrderBookChange[]; // a
}

export interface BalanceShort {
  w: string;
  a: string;
  f: string;
  l: string;
}

export interface BalanceLong {
  wallet: string; // w
  asset: string; // a
  availableForTrade: string; // f
  locked: string; // l
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
  u: string;
  o: keyof typeof enums.OrderType;
  S: keyof typeof enums.OrderSide;
  f: keyof typeof enums.OrderTimeInForce;
  p: string;
  P?: string;
  V: keyof typeof enums.OrderSelfTradePrevention;
  q: string;
  z: string;
  Z: string;
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
  fills?: OrderFillLong[]; // F
}

export interface OrderFillShort {
  i: string;
  p: string;
  q: string;
  Q: string;
  t: number;
  s: BuyOrSellShort;
  u: string;
  f: string;
  a: string;
  g?: string;
  l: enums.Liquidity;
  T?: string;
  S: enums.EthTransactionStatus;
}

export interface OrderFillLong {
  fillId: string; // i
  price: string; // p
  quantity: string; // q
  quoteQuantity: string; // Q
  timestamp: number; // t
  side: BuyOrSellLong; // s
  fillSequenceNumber: string; // u
  feeAmount: string; // f
  feeToken: string; // a
  gas?: string; // g
  liquidity: enums.Liquidity; // l
  transactionId?: string; // T
  transactionStatus: enums.EthTransactionStatus; // S
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
  | { type: 'tickers'; data: response.Ticker }
  | { type: 'trades'; data: TradeLong }
  | { type: 'candles'; data: CandleLong }
  | { type: 'l1orderbook'; data: L1OrderBookLong }
  | { type: 'l2orderbook'; data: L2OrderBookLong }
  | { type: 'balances'; data: BalanceLong }
  | { type: 'orders'; data: OrderLong };
