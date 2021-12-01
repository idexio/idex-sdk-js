import type {
  L1OrderBook,
  L2OrderBook,
  OrderBookLevelType,
  RestResponseOrderBookLevel1,
  RestResponseOrderBookLevel2,
  RestResponseOrderBookPriceLevel,
  WebSocketResponseL2OrderBookLong,
} from '../types';

import { decimalToPip, pipToDecimal } from '../pipmath';

export function L1OrderBookToRestResponse(
  l1: L1OrderBook,
): RestResponseOrderBookLevel1 {
  const asks: [RestResponseOrderBookPriceLevel] = [
    [
      pipToDecimal(l1.asks.price),
      pipToDecimal(l1.asks.size),
      l1.asks.numOrders,
    ],
  ];

  const bids: [RestResponseOrderBookPriceLevel] = [
    [
      pipToDecimal(l1.bids.price),
      pipToDecimal(l1.bids.size),
      l1.bids.numOrders,
    ],
  ];

  return {
    sequence: l1.sequence,
    asks,
    bids,
    pool: l1.pool
      ? {
          baseReserveQuantity: pipToDecimal(l1.pool.baseReserveQuantity),
          quoteReserveQuantity: pipToDecimal(l1.pool.quoteReserveQuantity),
        }
      : null,
  };
}

export function L2OrderBookToRestResponse(
  l2: L2OrderBook,
  limit = 1000,
): RestResponseOrderBookLevel2 {
  if (limit < 2 || limit > 1000) {
    throw new Error('limit must be between 2 and 1000');
  }
  const perSide = Math.ceil(limit / 2);
  const asks: RestResponseOrderBookPriceLevel[] = l2.asks
    .slice(0, perSide)
    .map((ask) => [
      pipToDecimal(ask.price),
      pipToDecimal(ask.size),
      ask.numOrders,
    ]);
  const bids: RestResponseOrderBookPriceLevel[] = l2.bids
    .slice(0, perSide)
    .map((bid) => [
      pipToDecimal(bid.price),
      pipToDecimal(bid.size),
      bid.numOrders,
    ]);
  return {
    sequence: l2.sequence,
    asks,
    bids,
    pool: l2.pool
      ? {
          baseReserveQuantity: pipToDecimal(l2.pool.baseReserveQuantity),
          quoteReserveQuantity: pipToDecimal(l2.pool.quoteReserveQuantity),
        }
      : null,
  };
}

export function restResponseToL2OrderBook(
  restResponseL2: RestResponseOrderBookLevel2,
): L2OrderBook {
  const type: OrderBookLevelType = 'limit';
  const asks = restResponseL2.asks.map((ask) => {
    return {
      price: decimalToPip(ask[0]),
      size: decimalToPip(ask[1]),
      numOrders: ask[2],
      type,
    };
  });
  const bids = restResponseL2.bids.map((bid) => {
    return {
      price: decimalToPip(bid[0]),
      size: decimalToPip(bid[1]),
      numOrders: bid[2],
      type,
    };
  });
  return {
    sequence: restResponseL2.sequence,
    asks,
    bids,
    pool: restResponseL2.pool
      ? {
          baseReserveQuantity: decimalToPip(
            restResponseL2.pool.baseReserveQuantity,
          ),
          quoteReserveQuantity: decimalToPip(
            restResponseL2.pool.quoteReserveQuantity,
          ),
        }
      : null,
  };
}

export function webSocketResponseToL2OrderBook(
  response: WebSocketResponseL2OrderBookLong,
): L2OrderBook {
  return {
    sequence: response.sequence,
    asks: response.asks.map((ask) => {
      return {
        price: decimalToPip(ask[0]),
        size: decimalToPip(ask[1]),
        numOrders: ask[2],
        type: 'limit',
      };
    }),
    bids: response.bids.map((bid) => {
      return {
        price: decimalToPip(bid[0]),
        size: decimalToPip(bid[1]),
        numOrders: bid[2],
        type: 'limit',
      };
    }),
    pool: response.pool
      ? {
          baseReserveQuantity: decimalToPip(response.pool.baseReserveQuantity),
          quoteReserveQuantity: decimalToPip(
            response.pool.quoteReserveQuantity,
          ),
        }
      : null,
  };
}
