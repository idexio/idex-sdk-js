import * as types from '../types';

const transformBuyOrSellShort = (
  buyOrSell: types.webSocketSubscriptionMessages.BuyOrSellShort,
): keyof typeof types.enums.OrderSide => (buyOrSell === 's' ? 'sell' : 'buy');

const transformTickersMessage = (
  ticker: types.webSocketSubscriptionMessages.TickerShort,
): types.response.Ticker => ({
  market: ticker.m,
  time: ticker.t,
  open: ticker.o,
  high: ticker.h,
  low: ticker.l,
  close: ticker.c,
  last: ticker.c,
  lastQuantity: ticker.Q,
  baseVolume: ticker.v,
  quoteVolume: ticker.q,
  percentChange: ticker.P,
  ...(ticker.n && { numTrades: ticker.n }),
  ask: ticker.a,
  bid: ticker.b,
  lastSequenceNumber: ticker.u,
});

const transformTradesMessage = (
  trade: types.webSocketSubscriptionMessages.TradeShort,
): types.webSocketSubscriptionMessages.TradeLong => ({
  market: trade.m,
  fillId: trade.i,
  price: trade.p,
  quantity: trade.q,
  quoteQuantity: trade.Q,
  time: trade.t,
  makerSide: transformBuyOrSellShort(trade.s),
  sequence: trade.u,
});

const transformCandlesMessage = (
  candle: types.webSocketSubscriptionMessages.CandleShort,
): types.webSocketSubscriptionMessages.CandleLong => ({
  market: candle.m,
  time: candle.t,
  interval: candle.i,
  startTime: candle.s,
  endTime: candle.e,
  open: candle.o,
  high: candle.h,
  low: candle.l,
  close: candle.c,
  volume: candle.v,
  numberOfFills: candle.n,
  sequence: candle.u,
});

const transformL1orderbooksMessage = (
  l1orderbook: types.webSocketSubscriptionMessages.L1OrderBookShort,
): types.webSocketSubscriptionMessages.L1OrderBookLong => ({
  market: l1orderbook.m,
  time: l1orderbook.t,
  askPrice: l1orderbook.a,
  askQuantity: l1orderbook.A,
  bidPrice: l1orderbook.b,
  bidQuantity: l1orderbook.B,
});

const transformL2orderbooksMessage = (
  l2orderbook: types.webSocketSubscriptionMessages.L2OrderBookShort,
): types.webSocketSubscriptionMessages.L2OrderBookLong => ({
  market: l2orderbook.m,
  time: l2orderbook.t,
  sequence: l2orderbook.u,
  ...(l2orderbook.b && { bids: l2orderbook.b }),
  ...(l2orderbook.a && { asks: l2orderbook.a }),
});

const transformBalancesMessage = (
  balance: types.webSocketSubscriptionMessages.BalanceShort,
): types.webSocketSubscriptionMessages.BalanceLong => ({
  wallet: balance.w,
  asset: balance.a,
  availableForTrade: balance.f,
  locked: balance.l,
});

const transformOrderFill = (
  fill: types.webSocketSubscriptionMessages.OrderFillShort,
): types.response.OrderFill => ({
  fillId: fill.i,
  price: fill.p,
  quantity: fill.q,
  quoteQuantity: fill.Q,
  time: fill.t,
  makerSide: transformBuyOrSellShort(fill.s),
  sequence: fill.u,
  fee: fill.f,
  feeAsset: fill.a,
  ...(fill.g && { gas: fill.g }),
  liquidity: fill.l,
  ...(fill.T && { txId: fill.T }),
  txStatus: fill.S,
});

const transformOrdersMessage = (
  order: types.webSocketSubscriptionMessages.OrderShort,
): types.webSocketSubscriptionMessages.OrderLong => ({
  market: order.m,
  orderId: order.i,
  clientOrderId: order.c,
  wallet: order.w,
  time: order.t,
  timeOfOriginalOrder: order.T,
  executionType: order.x,
  status: order.X,
  ...(order.u && { orderBookSequenceNumber: order.u }),
  type: order.o,
  side: order.S,
  timeInForce: order.f,
  ...(order.p && { limitOrderPrice: order.p }),
  ...(order.P && { stopOrderPrice: order.P }),
  selfTradePrevention: order.V,
  originalQuantity: order.q,
  executedQuantity: order.z,
  cumulativeQuoteQuantity: order.Z,
  ...(order.F && { fills: order.F.map(transformOrderFill) }),
});

export const transformMessage = (
  message:
    | types.webSocket.ErrorResponse
    | types.webSocket.SubscriptionsResponse
    | types.webSocketSubscriptionMessages.SubscriptionMessageShort,
): types.webSocket.Response => {
  if (message.type === 'error' || message.type === 'subscriptions') {
    return message;
  }
  switch (message.type) {
    case 'candles':
      return { ...message, data: transformCandlesMessage(message.data) };
    case 'tickers':
      return { ...message, data: transformTickersMessage(message.data) };
    case 'l1orderbook':
      return { ...message, data: transformL1orderbooksMessage(message.data) };
    case 'l2orderbook':
      return { ...message, data: transformL2orderbooksMessage(message.data) };
    case 'trades':
      return { ...message, data: transformTradesMessage(message.data) };
    case 'balances':
      return { ...message, data: transformBalancesMessage(message.data) };
    case 'orders':
      return { ...message, data: transformOrdersMessage(message.data) };

    default:
      return message;
  }
};
