import { BigNumber } from 'bignumber.js';

import * as pipmath from '#pipmath';

import { OrderSide } from '#types/enums/request';

import type {
  L2OrderBook,
  OrderBookLevelL1,
  OrderBookLevelL2,
} from '#types/orderBook';

/**
 * Price and Size values form the {@link OrderBookLevelL1} type
 */
export type PriceAndSize = Pick<OrderBookLevelL1, 'price' | 'size'>;

export const asksTickRoundingMode = BigNumber.ROUND_UP;

export const bidsTickRoundingMode = BigNumber.ROUND_DOWN;

export const nullLevel: OrderBookLevelL2 = {
  price: BigInt(0),
  size: BigInt(0),
  numOrders: 0,
  type: 'limit',
};

/**
 * Helper function to convert from quote to base quantities
 * see: {quantitiesAvailableFromPoolAtAskPrice}
 */
export function calculateGrossBaseValueOfBuyQuantities(
  baseAssetQuantity: bigint,
  quoteAssetQuantity: bigint,
  grossQuoteQuantity: bigint,
): bigint {
  return (
    baseAssetQuantity -
    (baseAssetQuantity * quoteAssetQuantity) /
      (quoteAssetQuantity + grossQuoteQuantity)
  );
}

/**
 * Helper function to convert from base to quote quantities
 * see: {quantitiesAvailableFromPoolAtBidPrice}
 */
export function calculateGrossQuoteValueOfSellQuantities(
  baseAssetQuantity: bigint,
  quoteAssetQuantity: bigint,
  grossBaseQuantity: bigint,
): bigint {
  return (
    quoteAssetQuantity -
    (baseAssetQuantity * quoteAssetQuantity) /
      (baseAssetQuantity + grossBaseQuantity)
  );
}

/**
 * Determines the liquidity available in the given order book (asks or bids)
 * for a given taker quantity (which may be expressed in base or quote asset)
 * and price (optional).
 * In other words, it performs very basic order matching to provide an estimate
 * of the base and quote quantities with which a taker order of the given
 * size (quantity) and limit price (optional) would be filled.
 *
 * The taker order may represent a limit or a market order: If a limit price is
 * given, it is matched as a limit order (which necessitates specifying whether
 * it's a buy or a sell). Otherwise it is matched as a market order.
 *
 * The provided list of orders or price levels (asks or bids) is expected to be
 * sorted by best price (ascending for asks (lowest first), descending for bids
 * (highest first)). Multiple orders per price level are supported.
 *
 * To support high-precision calculations in which pip-precision is
 * insufficient, the result may optionally be returned in double-pip precision;
 * the returned values then represent numbers with 16 decimals instead of 8.
 *
 * @param returnInDoublePipPrecision - Defaults to false
 */
export function calculateGrossFillQuantities(
  makerSideOrders: Iterable<PriceAndSize>,
  takerOrder: {
    side: OrderSide;
    quantity: bigint;
    isQuantityInQuote: boolean;
    limitPrice?: bigint;
  },
  returnInDoublePipPrecision = false,
): {
  baseQuantity: bigint;
  quoteQuantity: bigint;
} {
  const takerQuantity2p = takerOrder.quantity * pipmath.oneInPips;

  let filledBaseQty2p = BigInt(0);
  let filledQuoteQty2p = BigInt(0);

  const makeReturnValue = (): {
    baseQuantity: bigint;
    quoteQuantity: bigint;
  } => {
    if (returnInDoublePipPrecision) {
      return {
        baseQuantity: filledBaseQty2p,
        quoteQuantity: filledQuoteQty2p,
      };
    }
    return {
      baseQuantity: filledBaseQty2p / pipmath.oneInPips,
      quoteQuantity: filledQuoteQty2p / pipmath.oneInPips,
    };
  };

  for (const makerOrder of makerSideOrders) {
    if (!doOrdersMatch(makerOrder, takerOrder)) {
      return makeReturnValue();
    }
    const maxTakerQuantity2p =
      takerOrder.isQuantityInQuote ?
        takerQuantity2p - filledQuoteQty2p
      : takerQuantity2p - filledBaseQty2p;

    const tradeQuantities = determineTradeQuantities(
      makerOrder,
      maxTakerQuantity2p,
      takerOrder.isQuantityInQuote,
    );
    if (
      tradeQuantities.baseQuantity2p === BigInt(0) ||
      tradeQuantities.quoteQuantity2p === BigInt(0)
    ) {
      return makeReturnValue();
    }
    filledBaseQty2p += tradeQuantities.baseQuantity2p;
    filledQuoteQty2p += tradeQuantities.quoteQuantity2p;
  }
  return makeReturnValue();
}

/**
 * Operates in double-pip precision ("2p") (16 decimals)
 *
 * @private
 */
function determineTradeQuantities(
  makerOrder: PriceAndSize,
  maxTakerQuantity2p: bigint,
  isMaxTakerQuantityInQuote: boolean,
): {
  baseQuantity2p: bigint;
  quoteQuantity2p: bigint;
} {
  const makerQuantity2p = makerOrder.size * pipmath.oneInPips;

  // Limit by base
  const fillBaseQty2p =
    isMaxTakerQuantityInQuote ? makerQuantity2p : (
      pipmath.minBigInt(maxTakerQuantity2p, makerQuantity2p)
    );

  const fillQuoteQty2p = pipmath.multiplyPips(fillBaseQty2p, makerOrder.price);

  // Limit by quote
  if (isMaxTakerQuantityInQuote && maxTakerQuantity2p < fillQuoteQty2p) {
    return {
      // Reduce base proportionally to reduction of fillQuoteQty2p
      baseQuantity2p: (fillBaseQty2p * maxTakerQuantity2p) / fillQuoteQty2p,
      quoteQuantity2p: maxTakerQuantity2p,
    };
  }
  return {
    baseQuantity2p: fillBaseQty2p,
    quoteQuantity2p: fillQuoteQty2p,
  };
}

/**
 * @private
 */
function doOrdersMatch(
  makerOrder: PriceAndSize,
  takerOrder: {
    side: OrderSide;
    limitPrice?: bigint;
  },
): boolean {
  if (!takerOrder.limitPrice) {
    return true;
  }
  return (
    (takerOrder.side === OrderSide.buy &&
      takerOrder.limitPrice >= makerOrder.price) ||
    (takerOrder.side === OrderSide.sell &&
      takerOrder.limitPrice <= makerOrder.price)
  );
}

/**
 * Helper function to re-aggregate L2 orderbook price levels at a larger (more zeroes) tick size
 */
export function aggregateL2OrderBookAtTickSize(
  inputBook: L2OrderBook,
  tickSize: bigint,
): L2OrderBook {
  const askLevelsByPrice = new Map<bigint, OrderBookLevelL2>();
  for (const askLevel of inputBook.asks) {
    const price = adjustPriceToTickSize(
      askLevel.price,
      tickSize,
      asksTickRoundingMode,
    );
    const level = askLevelsByPrice.get(price) || { ...nullLevel, price };

    level.numOrders += askLevel.numOrders;
    level.size += askLevel.size;

    askLevelsByPrice.set(price, level);
  }

  const bidLevelsByPrice = new Map<bigint, OrderBookLevelL2>();
  for (const bidLevel of inputBook.bids) {
    const price = adjustPriceToTickSize(
      bidLevel.price,
      tickSize,
      bidsTickRoundingMode,
    );
    const level = bidLevelsByPrice.get(price) || { ...nullLevel, price };

    level.numOrders += bidLevel.numOrders;
    level.size += bidLevel.size;

    bidLevelsByPrice.set(price, level);
  }

  return {
    ...inputBook,
    asks: Array.from(askLevelsByPrice.values()),
    bids: Array.from(bidLevelsByPrice.values()),
  };
}

/**
 * Adjusts prices in pips to account for tick size by discarding insignificant digits using
 * specified rounding mode. Ex price 123456789 at tick size 1 is 123456789, at tick size 10
 * 123456780, at 100 123456700, etc
 */
export function adjustPriceToTickSize(
  price: bigint,
  tickSize: bigint,
  roundingMode: BigNumber.RoundingMode = BigNumber.ROUND_HALF_UP,
): bigint {
  const significantDigits = new BigNumber(price.toString())
    .dividedBy(new BigNumber(tickSize.toString()))
    .toFixed(0, roundingMode);

  return BigInt(significantDigits) * tickSize;
}
