import {
  dividePips,
  oneInPips,
  MAX_64_BIT_INT,
  multiplyPips,
  pipToDecimal,
  squareRootBigInt,
} from './numbers';

export type GrossQuantities = {
  grossBase: bigint;
  grossQuote: bigint;
};

// calculate total liquidity available to buy at a given price level (ask)
export const calculateBuyQuantitiesForTargetPrice = function calculateBuyQuantitiesForTargetPrice(
  baseAssetQuantity: bigint,
  quoteAssetQuantity: bigint,
  targetPrice: bigint,
  idexFeeRate: bigint,
  poolFeeRate: bigint,
): GrossQuantities {
  const grossQuote = calculateGrossQuoteQuantity(
    baseAssetQuantity,
    quoteAssetQuantity,
    targetPrice,
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
  if (resultingPrice < targetPrice) {
    netQuote += multiplyPips(targetPrice, resultingBase, true) - resultingQuote;
  } else if (resultingPrice > targetPrice) {
    netQuote -= BigInt(1);
  }

  const grossQuoteIn = netQuote + poolFee + idexFee;
  return {
    grossBase: calculateGrossBaseValueOfBuyQuantities(
      baseAssetQuantity,
      quoteAssetQuantity,
      grossQuoteIn,
    ),
    grossQuote: grossQuoteIn,
  };
};

// calculate total liquidity available to buy at a given price level (bid)
export const calculateSellQuantitiesForTargetPrice = function calculateSellQuantitiesForTargetPrice(
  baseAssetQuantity: bigint,
  quoteAssetQuantity: bigint,
  targetPrice: bigint,
  idexFeeRate: bigint,
  poolFeeRate: bigint,
): GrossQuantities {
  const grossBase = calculateGrossBaseQuantity(
    baseAssetQuantity,
    quoteAssetQuantity,
    targetPrice,
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
};

// base quantity (for a sell)
export const calculateGrossBaseQuantity = function calculateGrossBaseQuantity(
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
};

// quote => base, for a buy
export const calculateGrossBaseValueOfBuyQuantities = function calculateGrossBaseValueOfBuyQuantities(
  baseAssetQuantity: bigint,
  quoteAssetQuantity: bigint,
  grossQuoteQuantity: bigint,
): bigint {
  return (
    baseAssetQuantity -
    (baseAssetQuantity * quoteAssetQuantity) /
      (quoteAssetQuantity + grossQuoteQuantity)
  );
};

// quote quantity (for a buy)
export const calculateGrossQuoteQuantity = function calculateGrossQuoteQuantity(
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
};

// base => quote, for a sell
export const calculateGrossQuoteValueOfSellQuantities = function calculateGrossQuoteValueOfSellQuantities(
  baseAssetQuantity: bigint,
  quoteAssetQuantity: bigint,
  grossBaseQuantity: bigint,
): bigint {
  return (
    quoteAssetQuantity -
    (baseAssetQuantity * quoteAssetQuantity) /
      (baseAssetQuantity + grossBaseQuantity)
  );
};

export const calculateBaseQuantityOut = function calculateBaseQuantityOut(
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
};

export const calculateQuoteQuantityOut = function calculateQuoteQuantityOut(
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
};

// common constraints for generating synthetic L2 price levels
function validateSyntheticPriceLevelInputs(
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
