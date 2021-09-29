import type { RestPublicClient, RestPublicClientOptions } from '../client/rest';
import type {
  WebSocketClient,
  WebSocketClientOptions,
} from '../client/webSocket';

export type GrossQuantities = {
  grossBase: bigint;
  grossQuote: bigint;
};

export type OrderBookFeeRates = {
  idexFeeRate: string;
  poolFeeRate: string;
  takerMinimumInNativeAsset: string;
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

export type OrderBookRealTimeClientOptions = Omit<
  Omit<
    RestPublicClientOptions &
      WebSocketClientOptions & {
        restApiUrl?: string;
        webSocketApiUrl?: string;
      },
    'baseURL'
  >,
  'shouldReconnectAutomatically'
>;

export type SyntheticL2OrderBook = Omit<L2OrderBook, 'sequence'>;
