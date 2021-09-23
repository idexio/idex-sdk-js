export const WEBSOCKET_AUTHENTICATED_SUBSCRIPTIONS = [
  'balances',
  'orders',
] as const;

export const WEBSOCKET_UNAUTHENTICATED_SUBSCRIPTIONS = [
  'candles',
  'l1orderbook',
  'l2orderbook',
  'tickers',
  'tokenprice',
  'trades',
] as const;
