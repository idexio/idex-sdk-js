import * as types from '../../types';

const transformTickersMessage = (
  ticker: types.WebSocketResponseTickerShort,
): types.RestResponseTicker => ({
  market: ticker.m,
  time: ticker.t,
  open: ticker.o,
  high: ticker.h,
  low: ticker.l,
  close: ticker.c,
  closeQuantity: ticker.Q,
  baseVolume: ticker.v,
  quoteVolume: ticker.q,
  percentChange: ticker.P,
  numTrades: ticker.n,
  ask: ticker.a,
  bid: ticker.b,
  sequence: ticker.u,
});

const transformTradesMessage = (
  trade: types.WebSocketResponseTradeShort,
): types.WebSocketResponseTradeLong => ({
  type: trade.y,
  market: trade.m,
  fillId: trade.i,
  price: trade.p,
  quantity: trade.q,
  quoteQuantity: trade.Q,
  time: trade.t,
  makerSide: trade.s,
  sequence: trade.u,
});

const transformCandlesMessage = (
  candle: types.WebSocketResponseCandleShort,
): types.WebSocketResponseCandleLong => ({
  market: candle.m,
  time: candle.t,
  interval: candle.i,
  start: candle.s,
  end: candle.e,
  open: candle.o,
  high: candle.h,
  low: candle.l,
  close: candle.c,
  volume: candle.v,
  numTrades: candle.n,
  sequence: candle.u,
});

const transformL1orderbooksMessage = (
  l1orderbook: types.WebSocketResponseL1OrderBookShort,
): types.WebSocketResponseL1OrderBookLong => ({
  market: l1orderbook.m,
  time: l1orderbook.t,
  bidPrice: l1orderbook.b,
  bidQuantity: l1orderbook.B,
  askPrice: l1orderbook.a,
  askQuantity: l1orderbook.A,
  pool: l1orderbook.p && {
    baseReserveQuantity: l1orderbook.p.q,
    quoteReserveQuantity: l1orderbook.p.Q,
  },
});

const transformL2orderbooksMessage = (
  l2orderbook: types.WebSocketResponseL2OrderBookShort,
): types.WebSocketResponseL2OrderBookLong => ({
  market: l2orderbook.m,
  time: l2orderbook.t,
  sequence: l2orderbook.u,
  ...(l2orderbook.b && { bids: l2orderbook.b }),
  ...(l2orderbook.a && { asks: l2orderbook.a }),
  pool: l2orderbook.p && {
    baseReserveQuantity: l2orderbook.p.q,
    quoteReserveQuantity: l2orderbook.p.Q,
  },
});

const transformBalancesMessage = (
  balance: types.WebSocketResponseBalanceShort,
): types.WebSocketResponseBalanceLong => ({
  wallet: balance.w,
  asset: balance.a,
  quantity: balance.q,
  availableForTrade: balance.f,
  locked: balance.l,
  usdValue: balance.d,
});

const transformOrderFill = (
  fill: types.WebSocketResponseOrderFillShort,
): types.RestResponseOrderFill => ({
  type: fill.y,
  fillId: fill.i,
  price: fill.p,
  quantity: fill.q,
  quoteQuantity: fill.Q,
  orderBookQuantity: fill.oq,
  orderBookQuoteQuantity: fill.oQ,
  poolQuantity: fill.pq,
  poolQuoteQuantity: fill.pQ,
  time: fill.t,
  makerSide: fill.s,
  sequence: fill.u,
  fee: fill.f,
  feeAsset: fill.a,
  ...(fill.g && { gas: fill.g }),
  liquidity: fill.l,
  txId: fill.T,
  txStatus: fill.S,
});

const transformOrdersMessage = (
  order: types.WebSocketResponseOrderShort,
): types.WebSocketResponseOrderLong => ({
  market: order.m,
  orderId: order.i,
  ...(order.c && { clientOrderId: order.c }),
  wallet: order.w,
  executionTime: order.t,
  time: order.T,
  update: order.x,
  status: order.X,
  ...(order.u && { sequence: order.u }),
  type: order.o,
  side: order.S,
  ...(order.q && { originalQuantity: order.q }),
  ...(order.Q && { originalQuoteQuantity: order.Q }),
  executedQuantity: order.z,
  ...(order.Z && { cumulativeQuoteQuantity: order.Z }),
  ...(order.v && { avgExecutionPrice: order.v }),
  ...(order.p && { price: order.p }),
  ...(order.P && { stopOrderPrice: order.P }),
  ...(order.f && { timeInForce: order.f }),
  selfTradePrevention: order.V,
  ...(order.F && { fills: order.F.map(transformOrderFill) }),
});

const transformTokenPriceMessage = (
  message: types.WebSocketResponseTokenPriceShort,
): types.WebSocketResponseTokenPriceLong => ({
  token: message.t,
  price: message.p,
});

export const transformWebsocketShortResponseMessage = (
  message:
    | types.WebSocketResponseError
    | types.WebSocketResponseSubscriptions
    | types.WebSocketResponseSubscriptionMessageShort,
): types.WebSocketResponse => {
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
    case 'tokenprice':
      return { ...message, data: transformTokenPriceMessage(message.data) };

    default:
      return message;
  }
};
