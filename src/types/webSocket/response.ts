import * as enums from '../enums';
import * as restResponse from '../rest/response';
import { WebSocketRequestSubscription } from './request';

// tickers

/**
 * TickerShort
 *
 * @typedef {Object} WebSocketResponseTickerShort
 * @property {string} m - (market) Market symbol
 * @property {number} t - (time) Timestamp when the statistics were computed, the opening time of the period is 24 hours prior
 * @property {string | null} o - (open) Price of the first trade in the period in quote terms
 * @property {string | null} h - (high) Highest traded price in the period in quote terms
 * @property {string | null} l - (low) Lowest traded price in the period in quote terms
 * @property {string | null} c - (close) Price of the last trade in the period in quote terms
 * @property {string | null} Q - (closeQuantity) Quantity of the last trade in th period in base terms
 * @property {string} v - (baseVolume) Trailing 24-hour trading volume in base terms
 * @property {string} q - (quoteVolume) Trailing 24-hour trading volume in quote terms
 * @property {string} P - (percentChange) Percentage change from open price to close price
 * @property {number} n - (numTrades) Number of trades in the period
 * @property {string | null} a - (ask) Best ask price on the order book in quote terms
 * @property {string | null} b - (bid) Best bid price on the order book in quote terms
 * @property {number | null} u - (sequence) Fill sequence number of the last trade in the period
 */
export interface WebSocketResponseTickerShort {
  m: string;
  t: number;
  o: string | null;
  h: string | null;
  l: string | null;
  c: string | null;
  Q: string | null;
  v: string;
  q: string;
  P: string;
  n: number;
  a: string | null;
  b: string | null;
  u: number | null;
}

/**
 * TickerLong
 *
 * @typedef {Object} WebSocketResponseTickerLong
 * @property {string} market - Market symbol
 * @property {number} time - Timestamp when the statistics were computed, the opening time of the period is 24 hours prior
 * @property {string | null} open - Price of the first trade in the period in quote terms
 * @property {string | null} high - Highest traded price in the period in quote terms
 * @property {string | null} low - Lowest traded price in the period in quote terms
 * @property {string | null} close - Price of the last trade in the period in quote terms
 * @property {string | null} closeQuantity - Quantity of the last trade in th period in base terms
 * @property {string} baseVolume - Trailing 24-hour trading volume in base terms
 * @property {string} quoteVolume - Trailing 24-hour trading volume in quote terms
 * @property {string} percentChange - Percentage change from open price to close price
 * @property {number} numTrades - Number of trades in the period
 * @property {string | null} ask - Best ask price on the order book in quote terms
 * @property {string | null} bid - Best bid price on the order book in quote terms
 * @property {number | null} sequence - Fill sequence number of the last trade in the period
 */
export type WebSocketResponseTickerLong = restResponse.RestResponseTicker;

// candles

/**
 * CandleShort
 *
 * @typedef {Object} WebSocketResponseCandleShort
 * @property {string} m - (market) Market symbol
 * @property {number} t - (time) Timestamp when the statistics were computed, time is always between the start and end timestamps of the interval
 * @property {string} i - (interval) Interval duration, see Interval Values
 * @property {number} s - (start) Timestamp of the start of the interval
 * @property {number} e - (end) Timestamp of the end of the interval
 * @property {string} o - (open) Price of the first trade in the interval in quote terms
 * @property {string} h - (high) Highest traded price in the interval in quote terms
 * @property {string} l - (low) Lowest traded price in the interval in quote terms
 * @property {string} c - (close) Price of the last trade in the interval in quote terms
 * @property {string} v - (volume) Trading volume in the interval in base terms
 * @property {number} n - (numTrades) Number of trades in the candle
 * @property {number} u - (sequence) Fill sequence number of the last trade in the interval
 */
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

/**
 * CandleLong
 *
 * @typedef {Object} WebSocketResponseCandleLong
 * @property {string} market - Market symbol
 * @property {number} time - Timestamp when the statistics were computed, time is always between the start and end timestamps of the interval
 * @property {string} interval - Interval duration, see Interval Values
 * @property {number} start - Timestamp of the start of the interval
 * @property {number} end - Timestamp of the end of the interval
 * @property {string} open - Price of the first trade in the interval in quote terms
 * @property {string} high - Highest traded price in the interval in quote terms
 * @property {string} low - Lowest traded price in the interval in quote terms
 * @property {string} close - Price of the last trade in the interval in quote terms
 * @property {string} volume - Trading volume in the interval in base terms
 * @property {number} numTrades - Number of trades in the candle
 * @property {number} sequence - Fill sequence number of the last trade in the interval
 */
export interface WebSocketResponseCandleLong
  extends restResponse.RestResponseCandle {
  market: string; // m
  time: number; // t
  interval: keyof typeof enums.CandleInterval; // i
  end: number; // e
  numTrades: number; // n
}

// trades

/**
 * TradeShort
 *
 * @typedef {Object} WebSocketResponseTradeShort
 * @property {string} y - (type) orderBook, pool, or hybrid
 * @property {string} m - (market) Market symbol
 * @property {string} i - (fillId) Trade identifier
 * @property {string} p - (price) Price of the trade in quote terms
 * @property {string} q - (quantity) Quantity of the trade in base terms
 * @property {string} Q - (quoteQuantity) Quantity of the trade in quote terms
 * @property {number} t - (time) Timestamp of the trade
 * @property {string} s - (makerSide) Maker side of the trade, buy or sell
 * @property {number} u - (sequence) Fill sequence number of the trade
 */
export interface WebSocketResponseTradeShort {
  y: keyof typeof enums.TradeType;
  m: string;
  i: string;
  p: string;
  q: string;
  Q: string;
  t: number;
  s: keyof typeof enums.OrderSide;
  u: number;
}

/**
 * TradeLong
 *
 * @typedef {Object} WebSocketResponseTradeLong
 * @property {string} market - Market symbol
 * @property {string} fillId - Trade identifier
 * @property {string} price - Price of the trade in quote terms
 * @property {string} quantity - Quantity of the trade in base terms
 * @property {string} quoteQuantity - Quantity of the trade in quote terms
 * @property {number} time - Timestamp of the trade
 * @property {string} makerSide - Maker side of the trade, buy or sell
 * @property {number} sequence - Fill sequence number of the trade
 */
export interface WebSocketResponseTradeLong
  extends restResponse.RestResponseTrade {
  market: string; // m
}

// l1orderbook

/**
 * LiquidityPoolShort
 *
 * @typedef {Object} WebSocketResponseLiquidityPoolShort
 * @property {string} q - (baseReserveQuantity) quantity of base asset held in the liquidity pool
 * @property {string} Q - (quoteReserveQuantity) quantity of quote asset held in the liquidity pool
 */

export interface WebSocketResponseLiquidityPoolShort {
  q: string;
  Q: string;
}

/**
 * LiquidityPoolLong
 *
 * @typedef {Object} WebSocketResponseLiquidityPoolLong
 * @property {string} baseReserveQuantity - quantity of base asset held in the liquidity pool
 * @property {string} quoteReserveQuantity - quantity of quote asset held in the liquidity pool
 */

export interface WebSocketResponseLiquidityPoolLong {
  baseReserveQuantity: string;
  quoteReserveQuantity: string;
}

/**
 * L1OrderBookShort
 *
 * @typedef {Object} WebSocketResponseL1OrderBookShort
 * @property {string} m - (market) Market symbol
 * @property {number} t - (time) Timestamp of the order book update
 * @property {string} b - (bidPrice) Best bid price
 * @property {string} B - (bidQuantity) Quantity available at the best bid price
 * @property {string} a - (askPrice) Best ask price
 * @property {string} A - (askQuantity) Quantity available at the best ask price
 * @property {WebSocketResponseLiquidityPoolShort | null} p - Liquidity pool reserves for this market
 */
export interface WebSocketResponseL1OrderBookShort {
  m: string;
  t: number;
  b: string;
  B: string;
  a: string;
  A: string;
  p: WebSocketResponseLiquidityPoolShort | null;
}

/**
 * L1OrderBookLong
 *
 * @typedef {Object} WebSocketResponseL1OrderBookLong
 * @property {string} market - Market symbol
 * @property {number} time - Timestamp of the order book update
 * @property {string} bidPrice - Best bid price
 * @property {string} bidQuantity - Quantity available at the best bid price
 * @property {string} askPrice - Best ask price
 * @property {string} askQuantity - Quantity available at the best ask price
 * @property {WebSocketResponseLiquidityPoolLong | null} pool - Liquidity pool reserves for this market
 */
export interface WebSocketResponseL1OrderBookLong {
  market: string; // m
  time: number; // t
  bidPrice: string; // b
  bidQuantity: string; // B
  askPrice: string; // a
  askQuantity: string; // A
  pool: WebSocketResponseLiquidityPoolLong | null;
}

/**
 * L2OrderBookChange
 *
 * @typedef {[string, string, number]} WebSocketResponseL2OrderBookChange
 */
type WebSocketResponseL2OrderBookChange = restResponse.RestResponseOrderBookPriceLevel;

/**
 * L2OrderBookShort
 *
 * @typedef {Object} WebSocketResponseL2OrderBookShort
 * @property {string} m - (market) Market symbol
 * @property {number} t - (time) Timestamp of the order book update
 * @property {number} u - (sequence) Order book update sequence number of the update
 * @property {WebSocketResponseL2OrderBookChange[]} b - (bids) Array of bid price level updates
 * @property {WebSocketResponseL2OrderBookChange[]} a - (asks) Array of ask price level updates
 * @property {WebSocketResponseLiquidityPoolShort | null} p - Liquidity pool reserves for this market
 */
export interface WebSocketResponseL2OrderBookShort {
  m: string;
  t: number;
  u: number;
  b: WebSocketResponseL2OrderBookChange[];
  a: WebSocketResponseL2OrderBookChange[];
  p: WebSocketResponseLiquidityPoolShort | null;
}

/**
 * L2OrderBookLong
 *
 * @typedef {Object} WebSocketResponseL2OrderBookLong
 * @property {string} market - Market symbol
 * @property {number} time - Timestamp of the order book update
 * @property {number} sequence - Order book update sequence number of the update
 * @property {WebSocketResponseL2OrderBookChange[]} bids - Array of bid price level updates
 * @property {WebSocketResponseL2OrderBookChange[]} asks - Array of ask price level updates
 * @property {baseReserveQuantity: string; quoteReserveQuantity: string} pool - liquidity pool reserves
 * @property {WebSocketResponseLiquidityPoolLong | null} p - Liquidity pool reserves for this market
 */
export interface WebSocketResponseL2OrderBookLong {
  market: string; // m
  time: number; // t
  sequence: number; // u
  bids: WebSocketResponseL2OrderBookChange[]; // b
  asks: WebSocketResponseL2OrderBookChange[]; // a
  pool: WebSocketResponseLiquidityPoolLong | null;
}

// balances

/**
 * BalanceShort
 *
 * @typedef {Object} WebSocketResponseBalanceShort
 * @property {string} w - (wallet) Target wallet address
 * @property {string} a - (asset) Asset symbol
 * @property {string} q - (quantity) Total quantity of the asset held by the wallet on the exchange
 * @property {string} f - (availableForTrade) Quantity of the asset available for trading; quantity - locked
 * @property {string} l - (locked) Quantity of the asset held in trades on the order book
 * @property {string} d - (usdValue) Total value of the asset held by the wallet on the exchange in USD
 */
export interface WebSocketResponseBalanceShort {
  w: string;
  a: string;
  q: string;
  f: string;
  l: string;
  d: string;
}

/**
 * BalanceLong
 *
 * @typedef {Object} WebSocketResponseBalanceLong
 * @property {string} wallet - Target wallet address
 * @property {string} asset - Asset symbol
 * @property {string} quantity - Total quantity of the asset held by the wallet on the exchange
 * @property {string} availableForTrade - Quantity of the asset available for trading; quantity - locked
 * @property {string} locked - Quantity of the asset held in trades on the order book
 * @property {string} usdValue - Total value of the asset held by the wallet on the exchange in USD
 */
export interface WebSocketResponseBalanceLong {
  wallet: string; // w
  asset: string; // a
  quantity: string;
  availableForTrade: string; // f
  locked: string; // l
  usdValue: string;
}

// orders

/**
 * OrderShort
 *
 * @typedef {Object} WebSocketResponseOrderShort
 * @property {string} m - (market) Market symbol
 * @property {string} i - (orderId) Exchange-assigned order identifier
 * @property {string} [c] - (clientOrderId) Client-specified order identifier
 * @property {string} w  - (wallet) Ethereum address of placing wallet
 * @property {string} t - (executionTime) Timestamp of the most recent update
 * @property {number} T - (time) Timestamp of initial order processing by the matching engine
 * @property {OrderStateChange} x - (update) Type of order update, see values
 * @property {OrderStatus} X - (status) Order status, see values
 * @property {number} [u] - (sequence) order book update sequence number, only included if update type triggers an order book update
 * @property {OrderType} o - (type) Order type, see values
 * @property {OrderSide} S - (side) Order side, buy or sell
 * @property {string} [q] - (originalQuantity) Original quantity specified by the order in base terms, omitted for market orders specified in quote terms
 * @property {string} [Q] - (originalQuoteQuantity) Original quantity specified by the order in quote terms, only present for market orders specified in quote terms
 * @property {string} z - (executedQuantity) Quantity that has been executed in base terms
 * @property {string} [Z] - (cumulativeQuoteQuantity) Cumulative quantity that has been spent (buy orders) or received (sell orders) in quote terms, omitted if unavailable for historical orders
 * @property {string} [v] - (avgExecutionPrice) Weighted average price of fills associated with the order; only present with fills
 * @property {string} [p] - (price) Original price specified by the order in quote terms, omitted for all market orders
 * @property {string} [P] - (stopPrice) Stop loss or take profit price, only present for stopLoss, stopLossLimit, takeProfit, and takeProfitLimit orders
 * @property {OrderTimeInForce} [f] - (timeInForce) Time in force policy, see values, only present for limit orders
 * @property {OrderSelfTradePrevention} V - (selfTradePrevention) Self-trade prevention policy, see values
 * @property {WebSocketResponseOrderFillShort[]} [F] - (fills) Array of order fill objects
 */
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
  V: keyof typeof enums.OrderSelfTradePrevention;
  F?: WebSocketResponseOrderFillShort[];
}

/**
 * OrderLong
 *
 * @typedef {Object} WebSocketResponseOrderLong
 * @property {string} market - Market symbol
 * @property {string} orderId - Exchange-assigned order identifier
 * @property {string} [clientOrderId] - Client-specified order identifier
 * @property {string} wallet - Ethereum address of placing wallet
 * @property {string} executionTime - Timestamp of the most recent update
 * @property {number} time - Timestamp of initial order processing by the matching engine
 * @property {string} update - Type of order update, see values
 * @property {OrderStatus} status - Order status, see values
 * @property {number} [sequence] - order book update sequence number, only included if update type triggers an order book update
 * @property {OrderType} type - Order type, see values
 * @property {OrderSide} side - Order side, buy or sell
 * @property {string} [originalQuantity] - Original quantity specified by the order in base terms, omitted for market orders specified in quote terms
 * @property {string} [originalQuoteQuantity] - Original quantity specified by the order in quote terms, only present for market orders specified in quote terms
 * @property {string} executedQuantity - Quantity that has been executed in base terms
 * @property {string} [cumulativeQuoteQuantity] - Cumulative quantity that has been spent (buy orders) or received (sell orders) in quote terms, omitted if unavailable for historical orders
 * @property {string} [avgExecutionPrice] - Weighted average price of fills associated with the order; only present with fills
 * @property {string} [price] - Original price specified by the order in quote terms, omitted for all market orders
 * @property {string} [stopPrice] - Stop loss or take profit price, only present for stopLoss, stopLossLimit, takeProfit, and takeProfitLimit orders
 * @property {OrderTimeInForce} [timeInForce] - Time in force policy, see values, only present for limit orders
 * @property {OrderSelfTradePrevention} selfTradePrevention - Self-trade prevention policy, see values
 * @property {RestResponseOrderFill[]} [fills] - Array of order fill objects
 */
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
  selfTradePrevention: keyof typeof enums.OrderSelfTradePrevention; // V
  fills?: restResponse.RestResponseOrderFill[]; // F
}

/**
 * OrderFillShort
 *
 *  @typedef {Object} WebSocketResponseOrderFillShort
 *
 * @property {TradeType} type - orderBook, pool, or hybrid
 * @property {string} i - (fillId) Fill identifier
 * @property {string} p - (price) Price of the fill in quote terms
 * @property {string} q - (quantity) Quantity of the fill in base terms
 * @property {string} Q - (quoteQuantity) Quantity of the fill in quote terms
 * @property {string} [oq] - Quantity of the fill in base terms supplied by order book liquidity, omitted for pool fills
 * @property {string} [oQ] - Quantity of the fill in quote terms supplied by order book liquidity, omitted for pool fills
 * @property {string} [pq] - Quantity of the fill in base terms supplied by pool liquidity, omitted for orderBook fills
 * @property {string} [pQ] - Quantity of the fill in quote terms supplied by pool liquidity, omitted for orderBook fills
 * @property {number} t - (time) Timestamp of the fill
 * @property {string} s - (makerSide) Maker side of the fill, buy or sell
 * @property {string} u - (sequence) Fill sequence number
 * @property {string} f - (fee) Fee amount collected on the fill
 * @property {string} a - (feeAsset) Symbol of asset in which fees collected
 * @property {string} [g] - (gas) Amount collected to cover trade settlement gas costs, only present for taker
 * @property {string} l - (liquidity) Whether the fill is the maker or taker in the trade from the perspective of the requesting user account, maker or taker
 * @property {string} T - (txId) Ethereum ID of the trade settlement transaction
 * @property {string} S - (txStatus) Status of the trade settlement transaction, see values
 */
export interface WebSocketResponseOrderFillShort {
  y: keyof typeof enums.TradeType;
  i: string;
  p: string;
  q: string;
  Q: string;
  oq?: string;
  oQ?: string;
  pq?: string;
  pQ?: string;
  t: number;
  s: keyof typeof enums.OrderSide;
  u: number;
  f: string;
  a: string;
  g?: string;
  l: keyof typeof enums.Liquidity;
  T: string | null;
  S: keyof typeof enums.EthTransactionStatus;
}

/**
 * TokenPriceShort
 *
 * @typedef {Object} WebSocketResponseTokenPriceShort
 * @property {string} t - (token) Token symbol
 * @property {string} p - (price) Current price of token relative to the native asset
 */
export interface WebSocketResponseTokenPriceShort {
  t: string;
  p: string | null;
}

/**
 * TokenPriceLong
 *
 * @typedef {Object} WebSocketResponseTokenPriceLong
 * @property {string} token - Token symbol
 * @property {string} price - Current price of token relative to the native asset
 */
export interface WebSocketResponseTokenPriceLong {
  token: string;
  price: string | null;
}

/**
 * Short-hand response payloads
 */
export type WebSocketResponseSubscriptionMessageShort =
  | { type: 'tickers'; data: WebSocketResponseTickerShort }
  | { type: 'trades'; data: WebSocketResponseTradeShort }
  | { type: 'candles'; data: WebSocketResponseCandleShort }
  | { type: 'l1orderbook'; data: WebSocketResponseL1OrderBookShort }
  | { type: 'l2orderbook'; data: WebSocketResponseL2OrderBookShort }
  | { type: 'balances'; data: WebSocketResponseBalanceShort }
  | { type: 'orders'; data: WebSocketResponseOrderShort }
  | { type: 'tokenprice'; data: WebSocketResponseTokenPriceShort };

/**
 * Transformer (long-form) response payloads
 */
export type WebSocketResponseSubscriptionMessageLong =
  | { type: 'tickers'; data: WebSocketResponseTickerLong }
  | { type: 'trades'; data: WebSocketResponseTradeLong }
  | { type: 'candles'; data: WebSocketResponseCandleLong }
  | { type: 'l1orderbook'; data: WebSocketResponseL1OrderBookLong }
  | { type: 'l2orderbook'; data: WebSocketResponseL2OrderBookLong }
  | { type: 'balances'; data: WebSocketResponseBalanceLong }
  | { type: 'orders'; data: WebSocketResponseOrderLong }
  | { type: 'tokenprice'; data: WebSocketResponseTokenPriceLong };

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
