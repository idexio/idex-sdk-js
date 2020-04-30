import * as enums from './enums';

type BuyOrSellShort = 'b' | 's';

type BuyOrSellLong = 'buy' | 'sell';

interface TickerShort {
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

interface TickerLong {
  market: string; // m <eg IDEX-ETH>
  timestamp: string; // t
  openPrice: string; // o
  highPrice: string; // h
  lowPrice: string; // l
  closePrice: string; // c
  lastQuantity: string; // Q
  totalTradedBaseAssetVolume: string; // v
  totalTradedQuoteAssetVolume: string; // q
  pricePercentChange: string; // P
  numberOfTrades: number; // n
  bestAskPrice: string; // a
  bestBidPrice: string; // b
  lastFillSequenceNumber: number; // u
}

interface TradeShort {
  m: string;
  i: string;
  p: string;
  q: string;
  Q: string;
  t: number;
  s: BuyOrSellShort;
  u: number;
}

interface TradeLong {
  market: string; // m
  fillId: string; // i
  price: string; // p
  quantity: string; // q
  quoteQuantity: string; // Q
  timestamp: number; // t
  makerSide: BuyOrSellLong; // s
  sequenceNumber: number; // u
}

interface CandleShort {
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
  u: number;
}

interface CandleLong {
  market: string; //m
  timestamp: number; // t
  interval: enums.CandleInterval; // i
  startTime: number; // s
  endTime: number; // e
  openFillPrice: string; // o
  highFillPrice: string; // h
  lowFillPrice: string; // l
  lastAvailableFillPrice: string; // c
  baseAssetVolume: string; // v
  numberOfFills: number; // n
  lastSequenceNumber: number; // u
}

interface L1orderbookShort {
  m: string;
  t: number;
  a: string;
  A: string;
  b: string;
  B: string;
}

interface L1orderbookLong {
  market: string; // m
  timestamp: number; // t
  bestAskPrice: string; // a
  bestAskQuantity: string; // A
  bestBidPrice: string; // b
  bestBidQuantity: string; // B
}

type L2orderbookChange = [string, string, number];

interface L2orderbookShort {
  m: string;
  t: number;
  u: number;
  b?: L2orderbookChange[];
  a?: L2orderbookChange[];
}

interface L2orderbookLong {
  market: string; // m
  timestamp: number; // t
  sequenceNumber: number; // u
  bids?: L2orderbookChange[]; // b
  asks?: L2orderbookChange[]; // a
}

interface BalanceShort {
  w: string;
  a: string;
  f: string;
  l: string;
}

interface BalanceLong {
  wallet: string; // w
  asset: string; // a
  freeQuantity: string; // f
  lockedQuantity: string; // l
}

interface OrderShort {
  m: string;
  i: string;
  c: string;
  w: string;
  t: number;
  T: number;
  x: enums.OrderStateChange;
  X: enums.OrderStatus;
  u: number;
  o: enums.OrderType;
  S: enums.OrderSide;
  f: enums.OrderTimeInForce;
  p: string;
  P?: string;
  V: enums.OrderSelfTradePrevention;
  q: string;
  z: string;
  Z: string;
  F?: {
    i: string;
    p: string;
    q: string;
    Q: string;
    t: number;
    s: BuyOrSellShort;
    u: number;
    f: string;
    a: string;
    g?: string;
    l: enums.Liquidity;
    T?: string;
    S: enums.EthTransactionStatus;
  }[];
}

interface OrderLong {
  market: string; // m
  orderId: string; // i
  clientOrderId: string; // c
  wallet: string; // w
  executionEventTime: number; // t
  timestamp: number; //T
  orderExecutionType: enums.OrderStateChange; // x
  currentOrderState: enums.OrderStatus; // X
  orderBookSequenceNumber?: number; // u
  orderType: enums.OrderType; // o
  orderSide: enums.OrderSide; // S
  orderTimeInForce: enums.OrderTimeInForce; // f
  limitOrderPrice?: string; // p
  stopOrderPrice?: string; // P
  selfTradePreventionStrategy: enums.OrderSelfTradePrevention; // V
  originalOrderQuantityBase: string; // q
  executedQuantityBase: string; // z
  cumulativeAmountSpentQuote: string; // Z
  // F
  fills?: {
    fillId: string; // i
    price: string; // p
    quantity: string; // q
    quoteQuantity: string; // Q
    timestamp: number; // t
    side: BuyOrSellShort; // s
    fillSequenceNumber: number; // u
    feeAmount: string; // f
    feeToken: string; // a
    gas?: string; // g
    liquidity: enums.Liquidity; // l
    transactionId?: string; // T
    transactionStatus: enums.EthTransactionStatus; // S
  }[];
}

export type SubscriptionMessageShort =
  | TickerShort
  | TradeShort
  | CandleShort
  | L1orderbookShort
  | L2orderbookShort
  | BalanceShort
  | OrderShort;

export type SubscriptionMessageLong =
  | TickerLong
  | TradeLong
  | CandleLong
  | L1orderbookLong
  | L2orderbookLong
  | BalanceLong
  | OrderLong;
