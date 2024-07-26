import { UnreachableCaseError } from '#utils';

import { FillType, MessageEventType } from '#types/enums/response';

import type * as idex from '#types/index';
import type { AnyObj } from '#types/utils';

function removeUndefinedFromObj<O extends AnyObj>(obj: O): O {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined),
  ) as O;
}

const transformTickersMessage = (
  short: idex.WebSocketResponseTickerShort,
): idex.IDEXTickerEventData =>
  removeUndefinedFromObj({
    market: short.m,
    time: short.t,
    open: short.o,
    high: short.h,
    low: short.l,
    close: short.c,
    closeQuantity: short.Q,
    baseVolume: short.v,
    quoteVolume: short.q,
    percentChange: short.P,
    trades: short.n,
    ask: short.a,
    bid: short.b,
    markPrice: short.mp,
    indexPrice: short.ip,
    indexPrice24h: short.id,
    indexPricePercentChange: short.iP,
    lastFundingRate: short.lf,
    currentFundingRate: short.nf,
    nextFundingTime: short.ft,
    openInterest: short.oi,
    sequence: short.u,
  });

const transformTradesMessage = (
  short: idex.WebSocketResponseTradeShort,
): idex.IDEXTradeEventData =>
  removeUndefinedFromObj({
    market: short.m,
    fillId: short.i,
    price: short.p,
    quantity: short.q,
    quoteQuantity: short.Q,
    time: short.t,
    makerSide: short.s,
    sequence: short.u,
  });

const transformLiquidationsMessage = (
  short: idex.WebSocketResponseLiquidationsShort,
): idex.IDEXLiquidationEventData =>
  removeUndefinedFromObj({
    market: short.m,
    fillId: short.i,
    price: short.p,
    quantity: short.q,
    quoteQuantity: short.Q,
    time: short.t,
    liquidationSide: short.s,
  });

const transformCandlesMessage = (
  short: idex.WebSocketResponseCandleShort,
): idex.IDEXCandleEventData =>
  removeUndefinedFromObj({
    market: short.m,
    time: short.t,
    interval: short.i,
    start: short.s,
    end: short.e,
    open: short.o,
    high: short.h,
    low: short.l,
    close: short.c,
    baseVolume: short.v,
    quoteVolume: short.q,
    trades: short.n,
    sequence: short.u,
  });

const transformL1orderbookMessage = (
  short: idex.WebSocketResponseL1OrderBookShort,
): idex.IDEXOrderBookLevel1EventData =>
  removeUndefinedFromObj({
    market: short.m,
    time: short.t,
    bidPrice: short.b,
    bidQuantity: short.B,
    askPrice: short.a,
    askQuantity: short.A,
    lastPrice: short.lp,
    markPrice: short.mp,
    indexPrice: short.ip,
  });

const transformL2orderbookMessage = (
  short: idex.WebSocketResponseL2OrderBookShort,
): idex.IDEXOrderBookLevel2EventData =>
  removeUndefinedFromObj({
    market: short.m,
    time: short.t,
    sequence: short.u,
    ...(short.b && { bids: short.b }),
    ...(short.a && { asks: short.a }),
    lastPrice: short.lp,
    markPrice: short.mp,
    indexPrice: short.ip,
  });

function transformOrderFill(short: idex.WebSocketResponseOrderFillShort) {
  return removeUndefinedFromObj({
    type: short.y,
    fillId: short.i,
    price: short.p,
    indexPrice: short.ip,
    quantity: short.q,
    quoteQuantity: short.Q,
    realizedPnL: short.rn,
    time: short.t,
    ...(isWebSocketResponseOrderFillShortGeneral(short) ?
      {
        makerSide: short.s,
        sequence: short.u,
      }
    : {}),
    fee: short.f,
    ...(isWebSocketResponseOrderFillShortGeneral(short) ?
      {
        liquidity: short.l,
      }
    : {}),
    action: short.a,
    position: short.P,
    txId: short.T,
    txStatus: short.S,
  });
}

function transformOrdersMessage(
  short: idex.WebSocketResponseOrderShort,
): idex.IDEXOrderEventData {
  if (!short.o) {
    return removeUndefinedFromObj({
      market: short.m,
      wallet: short.w,
      executionTime: short.t,
      side: short.s,
      // should only include a single fill but we map for future compat
      fills: short.F.map(transformOrderFill),
    } satisfies idex.IDEXOrderEventDataSystemFill);
  }

  return removeUndefinedFromObj({
    market: short.m,
    orderId: short.i,
    clientOrderId: short.c,
    wallet: short.w,
    executionTime: short.t,
    time: short.T,
    update: short.x,
    status: short.X,
    sequence: short.u,
    errorCode: short.ec,
    errorMessage: short.em,
    type: short.o,
    side: short.s,
    originalQuantity: short.q,
    executedQuantity: short.z,
    cumulativeQuoteQuantity: short.Z,
    avgExecutionPrice: short.v,
    price: short.p,
    triggerPrice: short.P,
    triggerType: short.tt,
    // callbackRate: short.cr,
    // conditionalOrderId: short.ci,
    reduceOnly: short.r,
    timeInForce: short.f,
    selfTradePrevention: short.V,
    delegatedKey: short.dk,
    isLiquidationAcquisitionOnly: short.la,
    ...(short.F && { fills: short.F.map(transformOrderFill) }),
  } satisfies idex.IDEXOrderEventDataGeneral);
}

const transformDepositsMessage = (
  short: idex.WebSocketResponseDepositsShort,
): idex.IDEXDepositEventData =>
  removeUndefinedFromObj({
    wallet: short.w,
    depositId: short.i,
    asset: short.a,
    quantity: short.q,
    quoteBalance: short.qb,
    time: short.t,
  });

const transformWithdrawalsMessage = (
  short: idex.WebSocketResponseWithdrawalsShort,
): idex.IDEXWithdrawalEventData =>
  removeUndefinedFromObj({
    wallet: short.w,
    withdrawalId: short.i,
    asset: short.a,
    quantity: short.q,
    gas: short.g,
    quoteBalance: short.qb,
    time: short.t,
  });

const transformPositionsMessage = (
  short: idex.WebSocketResponsePositionsShort,
): idex.IDEXPositionEventData =>
  removeUndefinedFromObj({
    wallet: short.w,
    market: short.m,
    status: short.X,
    quantity: short.q,
    maximumQuantity: short.mq,
    entryPrice: short.np,
    exitPrice: short.xp,
    realizedPnL: short.rn,
    totalFunding: short.f,
    totalOpen: short.to,
    totalClose: short.tc,
    openedByFillId: short.of,
    lastFillId: short.lf,
    quoteBalance: short.qb,
    time: short.t,
  });

const transformFundingPaymentsMessage = (
  short: idex.WebSocketResponseFundingPaymentsShort,
): idex.IDEXFundingPaymentEventData =>
  removeUndefinedFromObj({
    wallet: short.w,
    market: short.m,
    paymentQuantity: short.Q,
    positionQuantity: short.q,
    fundingRate: short.f,
    indexPrice: short.ip,
    time: short.t,
  });

export const transformWebsocketShortResponseMessage = (
  message:
    | idex.IDEXErrorEvent
    | idex.IDEXSubscriptionsListEvent
    | idex.WebSocketResponseSubscriptionMessageShort,
): idex.IDEXMessageEvent => {
  if (
    message.type === MessageEventType.error ||
    message.type === MessageEventType.subscriptions
  ) {
    return message;
  }

  const { type } = message;

  switch (type) {
    case MessageEventType.tickers:
      return { ...message, data: transformTickersMessage(message.data) };
    case MessageEventType.trades:
      return { ...message, data: transformTradesMessage(message.data) };
    case MessageEventType.liquidations:
      return { ...message, data: transformLiquidationsMessage(message.data) };
    case MessageEventType.candles:
      return { ...message, data: transformCandlesMessage(message.data) };
    case MessageEventType.l1orderbook:
      return { ...message, data: transformL1orderbookMessage(message.data) };
    case MessageEventType.l2orderbook:
      return { ...message, data: transformL2orderbookMessage(message.data) };
    case MessageEventType.orders:
      return { ...message, data: transformOrdersMessage(message.data) };
    case MessageEventType.deposits:
      return { ...message, data: transformDepositsMessage(message.data) };
    case MessageEventType.withdrawals:
      return { ...message, data: transformWithdrawalsMessage(message.data) };
    case MessageEventType.positions:
      return { ...message, data: transformPositionsMessage(message.data) };
    case MessageEventType.fundingPayments:
      return {
        ...message,
        data: transformFundingPaymentsMessage(message.data),
      };
    // due to their dynamic and internal nature, webclient events
    // are not transformed like other messages
    case MessageEventType.webclient:
      return message;
    default:
      throw new UnreachableCaseError(
        type,
        'transformWebsocketShortResponseMessage',
      );
  }
};

const isWebSocketResponseOrderFillShortGeneral = (
  short: idex.WebSocketResponseOrderFillShort,
): short is idex.WebSocketResponseOrderFillShortGeneral =>
  short.y !== FillType.closure &&
  short.y !== FillType.liquidation &&
  short.y !== FillType.deleverage;
