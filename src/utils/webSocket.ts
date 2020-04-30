import * as types from '../types';

const transformBuyOrSellShort = (
  buyOrSell: types.webSocketSubscriptionMessages.BuyOrSellShort,
): types.webSocketSubscriptionMessages.BuyOrSellLong =>
  buyOrSell === 's' ? 'sell' : 'buy';

export const transformTickerMessage = (
  ticker: types.webSocketSubscriptionMessages.TickerShort,
): types.webSocketSubscriptionMessages.TickerLong => ({
  market: ticker.m,
  timestamp: ticker.t,
  openPrice: ticker.o,
  highPrice: ticker.h,
  lowPrice: ticker.l,
  closePrice: ticker.c,
  lastQuantity: ticker.Q,
  totalTradedBaseAssetVolume: ticker.v,
  totalTradedQuoteAssetVolume: ticker.q,
  pricePercentChange: ticker.P,
  numberOfTrades: ticker.n,
  bestAskPrice: ticker.a,
  bestBidPrice: ticker.b,
  lastFillSequenceNumber: ticker.u,
});

export const transformTradeMessage = (
  trade: types.webSocketSubscriptionMessages.TradeShort,
): types.webSocketSubscriptionMessages.TradeLong => ({
  market: trade.m,
  fillId: trade.i,
  price: trade.p,
  quantity: trade.q,
  quoteQuantity: trade.Q,
  timestamp: trade.t,
  makerSide: transformBuyOrSellShort(trade.s),
  sequenceNumber: trade.u,
});

export const transformCandleMessage = (
  candle: types.webSocketSubscriptionMessages.CandleShort,
): types.webSocketSubscriptionMessages.CandleLong => ({
  market: candle.m,
  timestamp: candle.t,
  interval: candle.i,
  startTime: candle.s,
  endTime: candle.e,
  openFillPrice: candle.o,
  highFillPrice: candle.h,
  lowFillPrice: candle.l,
  lastAvailableFillPrice: candle.c,
  baseAssetVolume: candle.v,
  numberOfFills: candle.n,
  lastSequenceNumber: candle.u,
});

export const transformL1orderbookMessage = (
  l1orderbook: types.webSocketSubscriptionMessages.L1orderbookShort,
): types.webSocketSubscriptionMessages.L1orderbookLong => ({
  market: l1orderbook.m,
  timestamp: l1orderbook.t,
  bestAskPrice: l1orderbook.a,
  bestAskQuantity: l1orderbook.A,
  bestBidPrice: l1orderbook.b,
  bestBidQuantity: l1orderbook.B,
});

export const transformL2orderbookMessage = (
  l2orderbook: types.webSocketSubscriptionMessages.L2orderbookShort,
): types.webSocketSubscriptionMessages.L2orderbookLong => ({
  market: l2orderbook.m,
  timestamp: l2orderbook.t,
  sequenceNumber: l2orderbook.u,
  ...(l2orderbook.b && { bids: l2orderbook.b }),
  ...(l2orderbook.a && { asks: l2orderbook.a }),
});

export const transformBalanceMessage = (
  balance: types.webSocketSubscriptionMessages.BalanceShort,
): types.webSocketSubscriptionMessages.BalanceLong => ({
  wallet: balance.w,
  asset: balance.a,
  freeQuantity: balance.f,
  lockedQuantity: balance.l,
});

export const transformOrderFill = (
  fill: types.webSocketSubscriptionMessages.OrderFillShort,
): types.webSocketSubscriptionMessages.OrderFillLong => ({
  fillId: fill.i,
  price: fill.p,
  quantity: fill.q,
  quoteQuantity: fill.Q,
  timestamp: fill.t,
  side: transformBuyOrSellShort(fill.s),
  fillSequenceNumber: fill.u,
  feeAmount: fill.f,
  feeToken: fill.a,
  ...(fill.g && { gas: fill.g }),
  liquidity: fill.l,
  ...(fill.T && { transactionId: fill.T }),
  transactionStatus: fill.S,
});

export const transformOrderMessage = (
  order: types.webSocketSubscriptionMessages.OrderShort,
): types.webSocketSubscriptionMessages.OrderLong => ({
  market: order.m,
  orderId: order.i,
  clientOrderId: order.c,
  wallet: order.w,
  executionEventTime: order.t,
  timestamp: order.T,
  orderExecutionType: order.x,
  currentOrderState: order.X,
  ...(order.u && { orderBookSequenceNumber: order.u }),
  orderType: order.o,
  orderSide: order.S,
  orderTimeInForce: order.f,
  ...(order.p && { limitOrderPrice: order.p }),
  ...(order.P && { stopOrderPrice: order.P }),
  selfTradePreventionStrategy: order.V,
  originalOrderQuantityBase: order.q,
  executedQuantityBase: order.z,
  cumulativeAmountSpentQuote: order.Z,
  ...(order.F && { fills: order.F.map(transformOrderFill) }),
});
