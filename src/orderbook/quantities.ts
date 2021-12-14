import {
  dividePips,
  oneInPips,
  MAX_64_BIT_INT,
  multiplyPips,
  pipToDecimal,
  squareRootBigInt,
} from '../pipmath';

import {
  BestAvailablePriceLevels,
  L1OrderBook,
  L2OrderBook,
  OrderBookLevelL2,
  PoolReserveQuantities,
  PriceLevelQuantities,
  SyntheticL2OrderBook,
} from '../types';

import { L2toL1OrderBook } from './utils';

/**
 * Helper function to calculate gross base available at a bid price
 * see: {quantitiesAvailableFromPoolAtBidPrice}
 */
export function calculateGrossBaseQuantity(
  baseAssetQuantity: bigint,
  quoteAssetQuantity: bigint,
  targetPrice: bigint,
  idexFeeRate: bigint,
  poolFeeRate: bigint,
): bigint {
  validateSyntheticPriceLevelInputs(
    baseAssetQuantity,
    quoteAssetQuantity,
    targetPrice,
    false,
  );

  const poolFee =
    oneInPips - (oneInPips * poolFeeRate) / (oneInPips - idexFeeRate);
  const v0 = poolFee * baseAssetQuantity + oneInPips * baseAssetQuantity;
  const v1 =
    baseAssetQuantity * baseAssetQuantity -
    (oneInPips * baseAssetQuantity * quoteAssetQuantity) / targetPrice;
  const numerator =
    squareRootBigInt(v0 * v0 - BigInt(4) * poolFee * v1 * oneInPips) - v0;
  const denominator = BigInt(2) * poolFee * (oneInPips - idexFeeRate);

  return (numerator * oneInPips) / denominator;
}

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
 * Helper function to calculate gross quote available at an ask price
 * see: {quantitiesAvailableFromPoolAtAskPrice}
 */
export function calculateGrossQuoteQuantity(
  baseAssetQuantity: bigint,
  quoteAssetQuantity: bigint,
  targetPrice: bigint,
  idexFeeRate: bigint,
  poolFeeRate: bigint,
): bigint {
  validateSyntheticPriceLevelInputs(
    baseAssetQuantity,
    quoteAssetQuantity,
    targetPrice,
    true,
  );

  const poolFee =
    oneInPips - (oneInPips * poolFeeRate) / (oneInPips - idexFeeRate);
  const v0 = oneInPips * quoteAssetQuantity * (poolFee + oneInPips);
  const v1 =
    quoteAssetQuantity *
    quoteAssetQuantity *
    (poolFee * poolFee +
      BigInt(2) * poolFee * oneInPips +
      oneInPips * oneInPips);
  const v2 =
    quoteAssetQuantity *
    (oneInPips * quoteAssetQuantity - baseAssetQuantity * targetPrice);
  const numerator =
    squareRootBigInt((v1 - BigInt(4) * poolFee * v2) * oneInPips * oneInPips) -
    v0;
  const denominator =
    BigInt(2) * poolFee * oneInPips - BigInt(2) * poolFee * idexFeeRate;
  return numerator / denominator;
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
 * Given a taker order size expressed in quote, how much base is received from the pool
 *
 * see: {L1orL2BestAvailablePrices}
 */
export function calculateBaseQuantityOut(
  baseAssetQuantity: bigint,
  quoteAssetQuantity: bigint,
  grossQuoteQuantityIn: bigint,
  idexFeeRate: bigint,
  poolFeeRate: bigint,
): bigint {
  if (quoteAssetQuantity === BigInt(0) || grossQuoteQuantityIn === BigInt(0)) {
    return BigInt(0);
  }

  const numerator = baseAssetQuantity * quoteAssetQuantity * oneInPips;
  const denominator =
    quoteAssetQuantity * oneInPips +
    grossQuoteQuantityIn * (oneInPips - idexFeeRate - poolFeeRate);

  let quotient = numerator / denominator;
  if (quotient * denominator !== numerator) {
    quotient += BigInt(1);
  }

  return baseAssetQuantity - quotient;
}

/**
 * Given a taker order size expressed in base, how much quote is received from the pool
 *
 * see: {L1orL2BestAvailablePrices}
 */
export function calculateQuoteQuantityOut(
  baseAssetQuantity: bigint,
  quoteAssetQuantity: bigint,
  grossBaseQuantityIn: bigint,
  idexFeeRate: bigint,
  poolFeeRate: bigint,
): bigint {
  if (baseAssetQuantity === BigInt(0) || grossBaseQuantityIn === BigInt(0)) {
    return BigInt(0);
  }
  /**
   * The result needs to be rounded down to prevent the pool's constant
   * product from decreasing, ie. the second part of the subtraction (the
   * division) needs to be rounded up.
   */
  const numerator = baseAssetQuantity * quoteAssetQuantity * oneInPips;
  const denominator =
    baseAssetQuantity * oneInPips +
    grossBaseQuantityIn * (oneInPips - idexFeeRate - poolFeeRate);

  let quotient = numerator / denominator;
  if (quotient * denominator !== numerator) {
    quotient += BigInt(1);
  }

  return quoteAssetQuantity - quotient;
}

/**
 * Generates a synthetic orderbook consisting of price levels for pool liquidity only
 *
 * @param {bigint} baseAssetQuantity - pool reserve in base asset, must be at least 1.0 expressed in pips (10^-8)
 * @param {bigint} quoteAssetQuantity - pool reserve in quote asset, must be at least 1.0 expressed in pips (10^-8)
 * @param {number} visibleLevels - how many ask and bid price levels to generate (of each)
 * @param {number} visibleSlippage - how much slippage per price level, in 1/1000th of a percent (100 = 0.1%)
 * @param {bigint} [idexFeeRate] - the idex fee rate to use for calculations (query /v1/exchange for current global setting)
 * @param {bigint} [poolFeeRate] - the liquidity pool fee rate to use for calculations (query /v1/exchange for current global setting)
 *
 * @returns {SyntheticL2OrderBook} - a level 2 order book with synthetic price levels only
 */
export function calculateSyntheticPriceLevels(
  baseAssetQuantity: bigint,
  quoteAssetQuantity: bigint,
  visibleLevels: number,
  visibleSlippage: number,
  idexFeeRate = BigInt(0),
  poolFeeRate = BigInt(0),
): SyntheticL2OrderBook {
  const poolPrice = dividePips(quoteAssetQuantity, baseAssetQuantity);
  const priceSlippagePerLevel =
    (poolPrice * BigInt(visibleSlippage)) / BigInt(100000);
  const asks: OrderBookLevelL2[] = [];
  const bids: OrderBookLevelL2[] = [];

  let previousAskQuantityInBase = BigInt(0);
  let previousBidQuantityInBase = BigInt(0);

  for (let level = 1; level <= visibleLevels; level += 1) {
    const askPrice = poolPrice + BigInt(level) * priceSlippagePerLevel;

    const {
      grossBase: askQuantityInBase,
    } = quantitiesAvailableFromPoolAtAskPrice(
      baseAssetQuantity,
      quoteAssetQuantity,
      askPrice,
      idexFeeRate,
      poolFeeRate,
    );

    asks[level - 1] = {
      price: askPrice,
      size: askQuantityInBase - previousAskQuantityInBase,
      numOrders: 0,
      type: 'pool',
    };

    const bidPrice = poolPrice - BigInt(level) * priceSlippagePerLevel;

    if (bidPrice > BigInt(0)) {
      const {
        grossBase: bidQuantityInBase,
      } = quantitiesAvailableFromPoolAtBidPrice(
        baseAssetQuantity,
        quoteAssetQuantity,
        bidPrice,
        idexFeeRate,
        poolFeeRate,
      );

      bids[level - 1] = {
        price: bidPrice,
        size: bidQuantityInBase - previousBidQuantityInBase,
        numOrders: 0,
        type: 'pool',
      };

      previousBidQuantityInBase = bidQuantityInBase;
    }

    previousAskQuantityInBase = askQuantityInBase;
  }
  return {
    asks,
    bids,
    pool: {
      baseReserveQuantity: baseAssetQuantity,
      quoteReserveQuantity: quoteAssetQuantity,
    },
  };
}

/**
 * Recalculate price level quantities for a book previously sorted with {sortAndMergeLevelsUnadjusted}
 *
 * @param {L2OrderBook} orderbook - an unadjusted level 2 order book as returned by {sortAndMergeLevelsUnadjusted}
 * @param {bigint} idexFeeRate - idex fee rate to use in pool quantity calculations
 * @param {bigint} poolFeeRate - pool fee rate to use in pool quantity calculations
 *
 * @returns {L2OrderBook} - the recalculated level 2 order book
 */
export function recalculateHybridLevelAmounts(
  orderbook: L2OrderBook,
  idexFeeRate: bigint,
  poolFeeRate: bigint,
): L2OrderBook {
  if (!orderbook.pool) {
    return orderbook;
  }
  // sanity for empty order books (which may list a "0" price level)
  while (orderbook.asks.length && orderbook.asks[0].price === BigInt(0)) {
    orderbook.asks.shift();
  }

  while (orderbook.bids.length && orderbook.bids[0].price === BigInt(0)) {
    orderbook.bids.shift();
  }

  let prevAskLevel = {
    price: BigInt(0),
    size: BigInt(0),
    type: 'pool',
  };

  for (const level of orderbook.asks) {
    // empty asks may be represented this way
    if (level.price === BigInt(0)) {
      break;
    }

    // limit levels always accrue pool liquidity from the previous level
    if (level.type === 'limit') {
      level.size =
        level.size +
        quantitiesAvailableFromPoolAtAskPrice(
          orderbook.pool.baseReserveQuantity,
          orderbook.pool.quoteReserveQuantity,
          level.price,
          idexFeeRate,
          poolFeeRate,
        ).grossBase -
        (prevAskLevel.price
          ? quantitiesAvailableFromPoolAtAskPrice(
              orderbook.pool.baseReserveQuantity,
              orderbook.pool.quoteReserveQuantity,
              prevAskLevel.price,
              idexFeeRate,
              poolFeeRate,
            ).grossBase
          : BigInt(0));
    }

    // this pool level was previously subdivided
    if (level.type === 'pool' && prevAskLevel.type !== 'pool') {
      level.size =
        quantitiesAvailableFromPoolAtAskPrice(
          orderbook.pool.baseReserveQuantity,
          orderbook.pool.quoteReserveQuantity,
          level.price,
          idexFeeRate,
          poolFeeRate,
        ).grossBase -
        quantitiesAvailableFromPoolAtAskPrice(
          orderbook.pool.baseReserveQuantity,
          orderbook.pool.quoteReserveQuantity,
          prevAskLevel.price,
          idexFeeRate,
          poolFeeRate,
        ).grossBase;
    }
    prevAskLevel = level;
  }

  let prevBidLevel = {
    price: BigInt(0),
    size: BigInt(0),
    type: 'pool',
  };

  for (const level of orderbook.bids) {
    // empty bids may be represented this way
    if (level.price === BigInt(0)) {
      break;
    }

    // limit levels always accrue pool liquidity from the previous level
    if (level.type === 'limit') {
      level.size =
        level.size +
        quantitiesAvailableFromPoolAtBidPrice(
          orderbook.pool.baseReserveQuantity,
          orderbook.pool.quoteReserveQuantity,
          level.price,
          idexFeeRate,
          poolFeeRate,
        ).grossBase -
        (prevBidLevel.price
          ? quantitiesAvailableFromPoolAtBidPrice(
              orderbook.pool.baseReserveQuantity,
              orderbook.pool.quoteReserveQuantity,
              prevBidLevel.price,
              idexFeeRate,
              poolFeeRate,
            ).grossBase
          : BigInt(0));
    }

    // this pool level was previously subdivided
    if (level.type === 'pool' && prevBidLevel.type !== 'pool') {
      level.size =
        quantitiesAvailableFromPoolAtBidPrice(
          orderbook.pool.baseReserveQuantity,
          orderbook.pool.quoteReserveQuantity,
          level.price,
          idexFeeRate,
          poolFeeRate,
        ).grossBase -
        (prevBidLevel.price
          ? quantitiesAvailableFromPoolAtBidPrice(
              orderbook.pool.baseReserveQuantity,
              orderbook.pool.quoteReserveQuantity,
              prevBidLevel.price,
              idexFeeRate,
              poolFeeRate,
            ).grossBase
          : BigInt(0));
    }
    prevBidLevel = level;
  }

  return orderbook;
}

/**
 * Combines limit orders and synthetic price levels into an intermediate sorted state
 * IMPORTANT: this function does not update price level quantities after merging
 *
 * @param {OrderBookLevelL2[]} limitOrderLevels - a level 2 orderbook with only limit orders
 * @param {OrderBookLevelL2[]} syntheticLevels - a level 2 orderbook with only synthetic orders
 * @param {(a: OrderBookLevelL2, b: OrderBookLevelL2) => boolean} isBefore - comparison function for sorting price levels
 *
 * @returns {OrderBookLevelL2[]} - a level 2 order book with synthetic price levels only
 */

export function sortAndMergeLevelsUnadjusted(
  limitOrderLevels: OrderBookLevelL2[],
  syntheticLevels: OrderBookLevelL2[],
  isBefore: (a: OrderBookLevelL2, b: OrderBookLevelL2) => boolean,
): OrderBookLevelL2[] {
  const c: OrderBookLevelL2[] = [];
  while (limitOrderLevels.length && syntheticLevels.length) {
    if (limitOrderLevels[0].price === syntheticLevels[0].price) {
      // we can drop synthetic levels that match limit orders
      // the quantities will be recalculated
      c.push(limitOrderLevels[0]);
      limitOrderLevels.shift();
      syntheticLevels.shift();
    } else if (isBefore(limitOrderLevels[0], syntheticLevels[0])) {
      // a[0] comes first
      c.push(limitOrderLevels[0]);
      limitOrderLevels.shift();
    } else {
      // b[0] comes first
      c.push(syntheticLevels[0]);
      syntheticLevels.shift();
    }
  }
  return c.concat(limitOrderLevels).concat(syntheticLevels);
}

/**
 * Helper function to calculate the asset quantities available at a given price level (pool liquidity only)
 *
 * @param {bigint} baseAssetQuantity - pool reserve in base asset, must be at least 1.0 expressed in pips (10^-8)
 * @param {bigint} quoteAssetQuantity - pool reserve in quote asset, must be at least 1.0 expressed in pips (10^-8)
 * @param {bigint} askPrice - the ask price level to calculate quantities for
 * @param {bigint} [idexFeeRate] - the idex fee rate to use for calculations (query /v1/exchange for current global setting)
 * @param {bigint} [poolFeeRate] - the liquidity pool fee rate to use for calculations (query /v1/exchange for current global setting)
 *
 * @returns {PriceLevelQuantities} - a level 2 order book with synthetic price levels only
 */
export function quantitiesAvailableFromPoolAtAskPrice(
  baseAssetQuantity: bigint,
  quoteAssetQuantity: bigint,
  askPrice: bigint,
  idexFeeRate: bigint,
  poolFeeRate: bigint,
): PriceLevelQuantities {
  // if a limit order is equal to the pool price, the pool does not contribute
  if (askPrice === dividePips(quoteAssetQuantity, baseAssetQuantity)) {
    return {
      grossBase: BigInt(0),
      grossQuote: BigInt(0),
    };
  }

  const grossQuote = calculateGrossQuoteQuantity(
    baseAssetQuantity,
    quoteAssetQuantity,
    askPrice,
    idexFeeRate,
    poolFeeRate,
  );

  const idexFee = multiplyPips(grossQuote, idexFeeRate);
  const poolFee = multiplyPips(grossQuote, poolFeeRate);

  let netQuote =
    (grossQuote * (oneInPips - idexFeeRate - poolFeeRate)) / oneInPips;

  const baseOut =
    baseAssetQuantity -
    (baseAssetQuantity * quoteAssetQuantity) / (quoteAssetQuantity + netQuote);

  // new pool balances, including the retained pool fee
  const resultingBase = baseAssetQuantity - baseOut;
  const resultingQuote = quoteAssetQuantity + poolFee + netQuote;

  // fix quote quantity for constant pricing
  const resultingPrice = dividePips(resultingQuote, resultingBase);
  if (resultingPrice < askPrice) {
    netQuote += multiplyPips(askPrice, resultingBase, true) - resultingQuote;
  } else if (resultingPrice > askPrice) {
    netQuote -= BigInt(1);
  }

  const grossQuoteIn = netQuote + poolFee + idexFee;
  return {
    grossBase: calculateGrossBaseValueOfBuyQuantities(
      baseAssetQuantity,
      quoteAssetQuantity,
      grossQuoteIn,
    ),
    grossQuote,
  };
}

/**
 * Helper function to calculate the asset quantities available at a given price level (pool liquidity only)
 *
 * @param {bigint} baseAssetQuantity - pool reserve in base asset, must be at least 1.0 expressed in pips (10^-8)
 * @param {bigint} quoteAssetQuantity - pool reserve in quote asset, must be at least 1.0 expressed in pips (10^-8)
 * @param {bigint} bidPrice - the bid price level to calculate quantities for
 * @param {bigint} [idexFeeRate] - the idex fee rate to use for calculations (query /v1/exchange for current global setting)
 * @param {bigint} [poolFeeRate] - the liquidity pool fee rate to use for calculations (query /v1/exchange for current global setting)
 *
 * @returns {PriceLevelQuantities} - a level 2 order book with synthetic price levels only
 */

export function quantitiesAvailableFromPoolAtBidPrice(
  baseAssetQuantity: bigint,
  quoteAssetQuantity: bigint,
  bidPrice: bigint,
  idexFeeRate: bigint,
  poolFeeRate: bigint,
): PriceLevelQuantities {
  // if a limit order is equal to the pool price, the pool does not contribute
  if (bidPrice === dividePips(quoteAssetQuantity, baseAssetQuantity)) {
    return {
      grossBase: BigInt(0),
      grossQuote: BigInt(0),
    };
  }

  const grossBase = calculateGrossBaseQuantity(
    baseAssetQuantity,
    quoteAssetQuantity,
    bidPrice,
    idexFeeRate,
    poolFeeRate,
  );

  return {
    grossBase,
    grossQuote: calculateGrossQuoteValueOfSellQuantities(
      baseAssetQuantity,
      quoteAssetQuantity,
      grossBase,
    ),
  };
}

function L1BestAvailableBuyPrice(
  pool: PoolReserveQuantities,
  idexFeeRate: bigint,
  poolFeeRate: bigint,
  takerMinimumInQuote: bigint,
): bigint {
  const takerMinimumInQuoteAfterIdexFee = multiplyPips(
    takerMinimumInQuote,
    oneInPips - idexFeeRate,
  );

  const baseReceived = calculateBaseQuantityOut(
    pool.baseReserveQuantity,
    pool.quoteReserveQuantity,
    takerMinimumInQuote,
    idexFeeRate,
    poolFeeRate,
  );

  return dividePips(
    pool.quoteReserveQuantity + takerMinimumInQuoteAfterIdexFee,
    pool.baseReserveQuantity - baseReceived,
  );
}

function L1BestAvailableSellPrice(
  pool: PoolReserveQuantities,
  idexFeeRate: bigint,
  poolFeeRate: bigint,
  takerMinimumInBase: bigint,
): bigint {
  const takerMinimumInBaseAfterIdexFee = multiplyPips(
    takerMinimumInBase,
    oneInPips - idexFeeRate,
  );

  const quoteReceived = calculateQuoteQuantityOut(
    pool.baseReserveQuantity,
    pool.quoteReserveQuantity,
    takerMinimumInBase,
    idexFeeRate,
    poolFeeRate,
  );

  return dividePips(
    pool.quoteReserveQuantity - quoteReceived,
    pool.baseReserveQuantity + takerMinimumInBaseAfterIdexFee,
  );
}
/**
 * Given a minimum taker order size, calculate the best achievable price level using pool liquidity only
 *
 * @param {PoolReserveQuantities} pool - pool reserve quantities for the orderbook in question
 * @param {bigint} idexFeeRate - the idex fee rate to use for pool calculations
 * @param {bigint} poolFeeRate - the pool fee rate to use for pool calculations
 * @param {bigint} takerMinimumInBase - the minimum taker order size, expressed in base asset units
 * @param {bigint} takerMinimumInQuote - the minimum taker order size, expressed in quote asset units
 *
 * @returns {PriceLevelQuantities} - a level 2 order book with synthetic price levels only
 */
export function L1orL2BestAvailablePrices(
  pool: PoolReserveQuantities,
  idexFeeRate: bigint,
  poolFeeRate: bigint,
  takerMinimumInBase: bigint,
  takerMinimumInQuote: bigint,
): BestAvailablePriceLevels {
  const buyPrice = L1BestAvailableBuyPrice(
    pool,
    idexFeeRate,
    poolFeeRate,
    takerMinimumInQuote,
  );

  const sellPrice = L1BestAvailableSellPrice(
    pool,
    idexFeeRate,
    poolFeeRate,
    takerMinimumInBase,
  );

  return {
    buyPrice,
    sellPrice,
  };
}

/**
 * Modifies an existing level 2 order book to include better price levels at the desired taker order size, if available from pool reserves
 *
 * @param {PoolReserveQuantities} pool - pool reserve quantities for the orderbook in question
 * @param {bigint} idexFeeRate - the idex fee rate to use for pool calculations
 * @param {bigint} poolFeeRate - the pool fee rate to use for pool calculations
 * @param {bigint} takerMinimumInQuote - the minimum taker order size, expressed in quote asset units
 *
 * @returns {l1: L1OrderBook; l2: L2OrderBook} - the resulting level 1 and level 2 orderbooks
 */

export function L1L2OrderBooksWithMinimumTaker(
  l2: L2OrderBook,
  idexFeeRate: bigint,
  poolFeeRate: bigint,
  takerMinimumInQuote: bigint,
): { l1: L1OrderBook; l2: L2OrderBook } {
  if (!l2.pool) {
    return { l1: L2toL1OrderBook(l2), l2 };
  }

  const l2Values = { ...l2 };
  const takerMinimumInBase =
    (takerMinimumInQuote * l2.pool.baseReserveQuantity) /
    l2.pool.quoteReserveQuantity;

  let { buyPrice, sellPrice } = L1orL2BestAvailablePrices(
    l2.pool,
    idexFeeRate,
    poolFeeRate,
    takerMinimumInBase,
    takerMinimumInQuote,
  );

  let { grossBase: grossBuyBase } = quantitiesAvailableFromPoolAtAskPrice(
    l2.pool.baseReserveQuantity,
    l2.pool.quoteReserveQuantity,
    buyPrice,
    idexFeeRate,
    poolFeeRate,
  );

  if (grossBuyBase < takerMinimumInBase) {
    buyPrice += BigInt(1);
    grossBuyBase = quantitiesAvailableFromPoolAtAskPrice(
      l2.pool.baseReserveQuantity,
      l2.pool.quoteReserveQuantity,
      buyPrice,
      idexFeeRate,
      poolFeeRate,
    ).grossBase;
  }

  if (!l2.asks[0] || buyPrice < l2.asks[0].price) {
    l2Values.asks.unshift({
      price: buyPrice,
      size: grossBuyBase,
      numOrders: 0,
      type: 'pool',
    });
    if (l2Values.asks.length > 1) {
      l2Values.asks[1].size -= grossBuyBase;
    }
  }

  let { grossBase: grossSellBase } = quantitiesAvailableFromPoolAtBidPrice(
    l2.pool.baseReserveQuantity,
    l2.pool.quoteReserveQuantity,
    sellPrice,
    idexFeeRate,
    poolFeeRate,
  );

  if (grossSellBase < takerMinimumInBase) {
    sellPrice -= BigInt(1);
    grossSellBase = quantitiesAvailableFromPoolAtBidPrice(
      l2.pool.baseReserveQuantity,
      l2.pool.quoteReserveQuantity,
      sellPrice,
      idexFeeRate,
      poolFeeRate,
    ).grossBase;
  }

  if (!l2.bids[0] || sellPrice > l2.bids[0].price) {
    l2Values.bids.unshift({
      price: sellPrice,
      size: grossSellBase,
      numOrders: 0,
      type: 'pool',
    });
    if (l2Values.bids.length > 1) {
      l2Values.bids[1].size -= grossSellBase;
    }
  }

  return { l1: L2toL1OrderBook(l2Values), l2: l2Values };
}

/**
 * Validates assumptions for reserve quantities and pricing required for quantity calculations
 *
 * @param {bigint} baseAssetQuantity - pool reserve in base asset, must be at least 1.0 expressed in pips (10^-8)
 * @param {bigint} quoteAssetQuantity - pool reserve in quote asset, must be at least 1.0 expressed in pips (10^-8)
 * @param {bigint} targetPrice - price expressed in pips, must be 0 < price < 2^64-1 and on the correct side of the spread
 * @param {boolean} isBuy - if true, the price is targeting buy orders (bids), otherwise sell orders (asks)
 *
 * @returns {void} - validation always succeeds or throws
 */
export function validateSyntheticPriceLevelInputs(
  baseAssetQuantity: bigint,
  quoteAssetQuantity: bigint,
  targetPrice: bigint,
  isBuy: boolean,
): void {
  if (baseAssetQuantity < oneInPips || quoteAssetQuantity < oneInPips) {
    throw new Error(
      'Base asset quantity and quote asset quantity must be positive integers, for pools with at least 1 quote and 1 base token',
    );
  }

  if (targetPrice <= BigInt(0) || targetPrice > MAX_64_BIT_INT) {
    throw new Error(
      `Target price (${pipToDecimal(
        targetPrice,
      )}) must be above zero and below the 64 bit integer limit`,
    );
  }

  const currentPrice = dividePips(quoteAssetQuantity, baseAssetQuantity);
  if (isBuy && currentPrice >= targetPrice) {
    throw new Error(
      `Target price (${pipToDecimal(
        targetPrice,
      )}) must be above current price (${pipToDecimal(currentPrice)})`,
    );
  }

  if (!isBuy && currentPrice <= targetPrice) {
    throw new Error(
      `Target price (${pipToDecimal(
        targetPrice,
      )}) must be below current price (${pipToDecimal(currentPrice)})`,
    );
  }
}
