export type GrossQuantities = {
  grossBase: bigint;
  grossQuote: bigint;
};

export type OrderBookLevelType = 'limit' | 'pool' | 'hybrid';

export type OrderBookLevelL1 = {
  price: bigint;
  size: bigint;
  numOrders: number;
};

export type OrderBookLevelL2 = OrderBookLevelL1 & {
  type: OrderBookLevelType;
};

export type PoolReserveQuantities = {
  baseReserveQuantity: bigint;
  quoteReserveQuantity: bigint;
};

export type L1OrderBook = {
  sequence: number;
  bids: OrderBookLevelL1;
  asks: OrderBookLevelL1;
  pool: null | PoolReserveQuantities;
};

export type L2OrderBook = {
  sequence: number;
  bids: OrderBookLevelL2[];
  asks: OrderBookLevelL2[];
  pool: null | PoolReserveQuantities;
};

export type BeforeComparison = (
  a: OrderBookLevelL2,
  b: OrderBookLevelL2,
) => boolean;

export type SyntheticL2OrderBook = Omit<L2OrderBook, 'sequence'>;
