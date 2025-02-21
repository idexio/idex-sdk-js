import { decimalToPip, pipToDecimal } from '#pipmath';

import { OrderBookLevelType } from '#types/enums/response';

import type { L1OrderBook, L2OrderBook } from '#types/orderBook';
import type {
  OrderBookPriceLevel,
  RestResponseGetOrderBookLevel1,
  RestResponseGetOrderBookLevel2,
} from '#types/rest/endpoints/GetOrderBook';
import type { KumaOrderBookLevel2EventData } from '#types/webSocket/response/orderbook';

export function L1OrderBookToRestResponse(
  l1: L1OrderBook,
): RestResponseGetOrderBookLevel1 {
  const asks: [OrderBookPriceLevel] = [
    [
      pipToDecimal(l1.asks.price),
      pipToDecimal(l1.asks.size),
      l1.asks.numOrders,
    ],
  ];

  const bids: [OrderBookPriceLevel] = [
    [
      pipToDecimal(l1.bids.price),
      pipToDecimal(l1.bids.size),
      l1.bids.numOrders,
    ],
  ];

  return {
    ...l1,
    asks,
    bids,
  };
}

export function L2OrderBookToRestResponse(
  l2: L2OrderBook,
  limit = 1000,
): RestResponseGetOrderBookLevel2 {
  if (limit < 2 || limit > 1000) {
    throw new Error('limit must be between 2 and 1000');
  }
  const perSide = Math.ceil(limit / 2);
  const asks: OrderBookPriceLevel[] = l2.asks
    .slice(0, perSide)
    .map((ask) => [
      pipToDecimal(ask.price),
      pipToDecimal(ask.size),
      ask.numOrders,
    ]);
  const bids: OrderBookPriceLevel[] = l2.bids
    .slice(0, perSide)
    .map((bid) => [
      pipToDecimal(bid.price),
      pipToDecimal(bid.size),
      bid.numOrders,
    ]);
  return {
    ...l2,
    asks,
    bids,
  };
}

export function restResponseToL2OrderBook(
  restResponseL2: RestResponseGetOrderBookLevel2,
): L2OrderBook {
  const type = OrderBookLevelType.limit;

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
    ...restResponseL2,
    asks,
    bids,
  };
}

export function webSocketResponseToL2OrderBook(
  response: KumaOrderBookLevel2EventData,
): L2OrderBook {
  return {
    ...response,
    asks: response.asks.map((ask) => {
      return {
        price: decimalToPip(ask[0]),
        size: decimalToPip(ask[1]),
        numOrders: ask[2],
        type: OrderBookLevelType.limit,
      };
    }),
    bids: response.bids.map((bid) => {
      return {
        price: decimalToPip(bid[0]),
        size: decimalToPip(bid[1]),
        numOrders: bid[2],
        type: OrderBookLevelType.limit,
      };
    }),
  };
}
