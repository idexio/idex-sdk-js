import * as enums from './enums';

export type BuyOrSellShort = 'b' | 's';

export type BuyOrSellLong = 'buy' | 'sell';

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
  u: string;
}

export interface TickerLong {
  market: string; // m <eg IDEX-ETH>
  time: number; // t
  open: string; // o
  high: string; // h
  low: string; // l
  close: string; // c
  lastQuantity: string; // Q
  baseVolume: string; // v
  quoteVolume: string; // q
  percentChange: string; // P
  numTrades: number; // n
  ask: string; // a
  bid: string; // b
  sequence: string; // u
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

export interface TradeLong {
  market: string; // m
  fillId: string; // i
  price: string; // p
  quantity: string; // q
  quoteQuantity: string; // Q
  time: number; // t
  makerSide: BuyOrSellLong; // s
  sequence: string; // u
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

export interface CandleLong {
  market: string; // m
  time: number; // t
  interval: enums.CandleInterval; // i
  startTime: number; // s
  endTime: number; // e
  open: string; // o
  high: string; // h
  low: string; // l
  close: string; // c
  volume: string; // v
  numberOfFills: number; // n
  sequence: string; // u
}

export interface L1orderbookShort {
  m: string;
  t: number;
  a: string;
  A: string;
  b: string;
  B: string;
}

export interface L1orderbookLong {
  market: string; // m
  time: number; // t
  askPrice: string; // a
  askQuantity: string; // A
  bidPrice: string; // b
  bidQuantity: string; // B
}

type L2orderbookChange = [string, string, number];

export interface L2orderbookShort {
  m: string;
  t: number;
  u: string;
  b?: L2orderbookChange[];
  a?: L2orderbookChange[];
}

export interface L2orderbookLong {
  market: string; // m
  time: number; // t
  sequence: string; // u
  bids?: L2orderbookChange[]; // b
  asks?: L2orderbookChange[]; // a
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
  x: enums.OrderStateChange;
  X: enums.OrderStatus;
  u: string;
  o: enums.OrderType;
  S: enums.OrderSide;
  f: enums.OrderTimeInForce;
  p: string;
  P?: string;
  V: enums.OrderSelfTradePrevention;
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
  executionType: enums.OrderStateChange; // x
  currentOrderState: enums.OrderStatus; // X
  orderBookSequenceNumber?: string; // u
  type: enums.OrderType; // o
  side: enums.OrderSide; // S
  timeInForce: enums.OrderTimeInForce; // f
  price?: string; // p
  stopPrice?: string; // P
  selfTradePrevention: enums.OrderSelfTradePrevention; // V
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
  | { type: 'l1orderbook'; data: L1orderbookShort }
  | { type: 'l2orderbook'; data: L2orderbookShort }
  | { type: 'balances'; data: BalanceShort }
  | { type: 'orders'; data: OrderShort };

export type SubscriptionMessageLong =
  | { type: 'tickers'; data: TickerLong }
  | { type: 'trades'; data: TradeLong }
  | { type: 'candles'; data: CandleLong }
  | { type: 'l1orderbook'; data: L1orderbookLong }
  | { type: 'l2orderbook'; data: L2orderbookLong }
  | { type: 'balances'; data: BalanceLong }
  | { type: 'orders'; data: OrderLong };
