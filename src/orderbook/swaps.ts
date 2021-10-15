import { L2OrderBook, PoolReserveQuantities } from '../types';
import { dividePips, multiplyPips, oneInPips, pipToDecimal } from '../pipmath';
import {
  calculateBaseQuantityOut,
  calculateQuoteQuantityOut,
  quantitiesAvailableFromPoolAtAskPrice,
  quantitiesAvailableFromPoolAtBidPrice,
} from './quantities';

export type tokenSwapValues = {
  inputAssetQuantity: bigint;
  feeQuantity: bigint;
  invertedPrice: bigint;
  limitPrice: bigint;
  outputAssetQuantityExpected: bigint;
  outputAssetQuantityMinimum: bigint;
  price: bigint;
  priceImpact: number;
};

export function swapBaseTokenWithOrderBook(
  baseAssetQuantity: bigint,
  l2: L2OrderBook,
  idexFeeRate: bigint,
  poolFeeRate: bigint,
  poolSlippageLimit: bigint,
): tokenSwapValues {
  if (!l2.pool) {
    return {
      inputAssetQuantity: baseAssetQuantity,
      feeQuantity: BigInt(0),
      invertedPrice: BigInt(0),
      limitPrice: BigInt(0),
      outputAssetQuantityExpected: BigInt(0),
      outputAssetQuantityMinimum: BigInt(0),
      price: BigInt(0),
      priceImpact: 0,
    };
  }
  const poolOnlyValues = swapBaseTokenWithPool(
    baseAssetQuantity,
    l2.pool,
    idexFeeRate,
    poolFeeRate,
    poolSlippageLimit,
  );

  // there are no limit orders available to improve the pricing
  if (!l2.bids.length || poolOnlyValues.price >= l2.bids[0].price) {
    return poolOnlyValues;
  }

  let actualQuoteReceived = BigInt(0);
  let baseRemaining = baseAssetQuantity;

  // backstop the limit order asks with a pool only level at the limit
  l2.bids.push({
    type: 'pool',
    size: quantitiesAvailableFromPoolAtBidPrice(
      l2.pool.baseReserveQuantity,
      l2.pool.quoteReserveQuantity,
      poolOnlyValues.limitPrice,
      BigInt(0), // idexFeeRate,
      BigInt(0), // poolFeeRate,
    ).grossBase,
    numOrders: 0,
    price: poolOnlyValues.limitPrice,
  });

  const poolCopy = { ...l2.pool };

  let lastBasePoolLiquidityAvailableAtThisLevel = BigInt(0);
  let lastQuotePoolLiquidityAvailableAtThisLevel = BigInt(0);

  for (const bid of l2.bids) {
    if (!baseRemaining) {
      break;
    }

    // first, try to buy all of the pool liquidity
    let {
      grossBase: basePoolLiquidityAvailableAtThisLevel,
      grossQuote: quotePoolLiquidityAvailableAtThisLevel,
    } = quantitiesAvailableFromPoolAtBidPrice(
      poolCopy.baseReserveQuantity,
      poolCopy.quoteReserveQuantity,
      bid.price,
      idexFeeRate,
      poolFeeRate,
    );

    basePoolLiquidityAvailableAtThisLevel -= lastBasePoolLiquidityAvailableAtThisLevel;
    quotePoolLiquidityAvailableAtThisLevel -= lastQuotePoolLiquidityAvailableAtThisLevel;

    // if we can't take all of it, calculate how much base we can actually take
    if (basePoolLiquidityAvailableAtThisLevel > baseRemaining) {
      basePoolLiquidityAvailableAtThisLevel = baseRemaining;
      quotePoolLiquidityAvailableAtThisLevel = calculateQuoteQuantityOut(
        poolCopy.baseReserveQuantity,
        poolCopy.quoteReserveQuantity,
        baseRemaining,
        idexFeeRate,
        poolFeeRate,
      );
    }

    actualQuoteReceived += quotePoolLiquidityAvailableAtThisLevel;
    baseRemaining -= basePoolLiquidityAvailableAtThisLevel;

    if (baseRemaining) {
      // if we have base remaining to spend, take from the limit order(s)
      let baseLimitOrderLiquidityAvailableAtThisLevel = bid.size;
      let quoteLimitOrderLiquidityAvailableAtThisLevel = multiplyPips(
        baseLimitOrderLiquidityAvailableAtThisLevel,
        bid.price,
      );
      if (baseLimitOrderLiquidityAvailableAtThisLevel > baseRemaining) {
        baseLimitOrderLiquidityAvailableAtThisLevel = baseRemaining;
        quoteLimitOrderLiquidityAvailableAtThisLevel = multiplyPips(
          baseLimitOrderLiquidityAvailableAtThisLevel,
          bid.price,
        );
      }
      actualQuoteReceived += quoteLimitOrderLiquidityAvailableAtThisLevel;
      baseRemaining -= baseLimitOrderLiquidityAvailableAtThisLevel;
    }

    lastBasePoolLiquidityAvailableAtThisLevel += basePoolLiquidityAvailableAtThisLevel;
    lastQuotePoolLiquidityAvailableAtThisLevel += quotePoolLiquidityAvailableAtThisLevel;
  }

  // amount of quote we would have received with infinite liquidity at the spread / pool price
  const poolPrice = dividePips(
    l2.pool.quoteReserveQuantity,
    l2.pool.baseReserveQuantity,
  );
  const expectedQuoteQuantityAtPoolPrice = multiplyPips(
    baseAssetQuantity,
    poolPrice,
  );

  const priceImpact = Number(
    pipToDecimal(
      dividePips(
        expectedQuoteQuantityAtPoolPrice - actualQuoteReceived,
        expectedQuoteQuantityAtPoolPrice,
      ),
    ),
  );

  // calculate fees using the simple percentage method
  const estimatedQuoteAssetFees = multiplyPips(
    actualQuoteReceived,
    idexFeeRate + poolFeeRate,
  );

  const actualQuoteReceivedWithFees =
    actualQuoteReceived - estimatedQuoteAssetFees;

  const price = dividePips(actualQuoteReceivedWithFees, baseAssetQuantity);
  const invertedPrice = dividePips(
    baseAssetQuantity,
    actualQuoteReceivedWithFees,
  );

  return {
    ...poolOnlyValues,
    outputAssetQuantityExpected: actualQuoteReceivedWithFees,
    invertedPrice,
    price,
    priceImpact,
  };
}

export function swapQuoteTokenWithOrderBook(
  quoteAssetQuantity: bigint,
  l2: L2OrderBook,
  idexFeeRate: bigint,
  poolFeeRate: bigint,
  poolSlippageLimit: bigint,
): tokenSwapValues {
  if (!l2.pool) {
    return {
      inputAssetQuantity: quoteAssetQuantity,
      feeQuantity: BigInt(0),
      invertedPrice: BigInt(0),
      limitPrice: BigInt(0),
      outputAssetQuantityExpected: BigInt(0),
      outputAssetQuantityMinimum: BigInt(0),
      price: BigInt(0),
      priceImpact: 0,
    };
  }
  const poolOnlyValues = swapQuoteTokenWithPool(
    quoteAssetQuantity,
    l2.pool,
    idexFeeRate,
    poolFeeRate,
    poolSlippageLimit,
  );

  // there are no limit orders available to improve the pricing
  if (!l2.asks.length || poolOnlyValues.price <= l2.asks[0].price) {
    return poolOnlyValues;
  }

  let actualBaseReceived = BigInt(0);
  let quoteRemaining = quoteAssetQuantity;

  // backstop the limit order asks with a pool only level at the limit
  l2.asks.push({
    type: 'pool',
    size: quantitiesAvailableFromPoolAtAskPrice(
      l2.pool.baseReserveQuantity,
      l2.pool.quoteReserveQuantity,
      poolOnlyValues.limitPrice,
      BigInt(0), // idexFeeRate,
      BigInt(0), // poolFeeRate,
    ).grossBase,
    numOrders: 0,
    price: poolOnlyValues.limitPrice,
  });

  const poolCopy = { ...l2.pool };

  let lastBasePoolLiquidityAvailableAtThisLevel = BigInt(0);
  let lastQuotePoolLiquidityAvailableAtThisLevel = BigInt(0);

  for (const ask of l2.asks) {
    if (!quoteRemaining) {
      break;
    }

    // first, try to buy all of the pool liquidity
    let {
      grossBase: basePoolLiquidityAvailableAtThisLevel,
      grossQuote: quotePoolLiquidityAvailableAtThisLevel,
    } = quantitiesAvailableFromPoolAtAskPrice(
      poolCopy.baseReserveQuantity,
      poolCopy.quoteReserveQuantity,
      ask.price,
      idexFeeRate,
      poolFeeRate,
    );

    basePoolLiquidityAvailableAtThisLevel -= lastBasePoolLiquidityAvailableAtThisLevel;
    quotePoolLiquidityAvailableAtThisLevel -= lastQuotePoolLiquidityAvailableAtThisLevel;

    // if we can't take all of it, calculate how much base we can actually take
    if (quotePoolLiquidityAvailableAtThisLevel > quoteRemaining) {
      quotePoolLiquidityAvailableAtThisLevel = quoteRemaining;
      basePoolLiquidityAvailableAtThisLevel = calculateBaseQuantityOut(
        poolCopy.baseReserveQuantity,
        poolCopy.quoteReserveQuantity,
        quoteRemaining,
        idexFeeRate,
        poolFeeRate,
      );
    }

    actualBaseReceived += basePoolLiquidityAvailableAtThisLevel;
    quoteRemaining -= quotePoolLiquidityAvailableAtThisLevel;

    if (quoteRemaining) {
      // if we have quote remaining to spend, take from the limit order(s)
      let baseLimitOrderLiquidityAvailableAtThisLevel = ask.size;
      let quoteLimitOrderLiquidityAvailableAtThisLevel = multiplyPips(
        baseLimitOrderLiquidityAvailableAtThisLevel,
        ask.price,
      );
      if (quoteLimitOrderLiquidityAvailableAtThisLevel > quoteRemaining) {
        quoteLimitOrderLiquidityAvailableAtThisLevel = quoteRemaining;
        baseLimitOrderLiquidityAvailableAtThisLevel = dividePips(
          quoteLimitOrderLiquidityAvailableAtThisLevel,
          ask.price,
        );
      }
      actualBaseReceived += baseLimitOrderLiquidityAvailableAtThisLevel;
      quoteRemaining -= quoteLimitOrderLiquidityAvailableAtThisLevel;
    }

    lastBasePoolLiquidityAvailableAtThisLevel += basePoolLiquidityAvailableAtThisLevel;
    lastQuotePoolLiquidityAvailableAtThisLevel += quotePoolLiquidityAvailableAtThisLevel;
  }

  // amount of base we would have received with infinite liquidity at the spread / pool price
  const poolPrice = dividePips(
    l2.pool.quoteReserveQuantity,
    l2.pool.baseReserveQuantity,
  );
  const expectedBaseQuantityAtPoolPrice = dividePips(
    quoteAssetQuantity,
    poolPrice,
  );

  const priceImpact = Number(
    pipToDecimal(
      dividePips(
        expectedBaseQuantityAtPoolPrice - actualBaseReceived,
        expectedBaseQuantityAtPoolPrice,
      ),
    ),
  );

  // calculate fees using the simple percentage method
  const estimatedBaseAssetFees = multiplyPips(
    actualBaseReceived,
    idexFeeRate + poolFeeRate,
  );

  const actualBaseReceivedWithFees =
    actualBaseReceived - estimatedBaseAssetFees;

  const price = dividePips(quoteAssetQuantity, actualBaseReceivedWithFees);
  const invertedPrice = dividePips(
    actualBaseReceivedWithFees,
    quoteAssetQuantity,
  );

  return {
    ...poolOnlyValues,
    outputAssetQuantityExpected: actualBaseReceivedWithFees,
    invertedPrice,
    price,
    priceImpact,
  };
}

export function swapBaseTokenWithPool(
  baseAssetQuantity: bigint,
  pool: PoolReserveQuantities,
  idexFeeRate: bigint,
  poolFeeRate: bigint,
  poolSlippageLimit: bigint,
): tokenSwapValues {
  const poolPrice = dividePips(
    pool.quoteReserveQuantity,
    pool.baseReserveQuantity,
  );

  // actual quote received, if there were no fees
  const actualQuoteAssetQuantityWithoutFees = calculateQuoteQuantityOut(
    pool.baseReserveQuantity,
    pool.quoteReserveQuantity,
    baseAssetQuantity,
    BigInt(0),
    BigInt(0),
  );

  // calculate fees using the simple percentage method
  const estimatedQuoteAssetFees = multiplyPips(
    actualQuoteAssetQuantityWithoutFees,
    idexFeeRate + poolFeeRate,
  );

  const actualQuoteAssetQuantityWithFees =
    actualQuoteAssetQuantityWithoutFees - estimatedQuoteAssetFees;

  // prices based on the base received from pool curve, minus simple fees
  const price = dividePips(actualQuoteAssetQuantityWithFees, baseAssetQuantity);

  const invertedPrice = dividePips(
    baseAssetQuantity,
    actualQuoteAssetQuantityWithFees,
  );

  // amount of base we would have received with infinite liquidity at the spread / pool price
  const expectedQuoteQuantityAtPoolPrice = multiplyPips(
    baseAssetQuantity,
    poolPrice,
  );

  const priceImpact = Number(
    pipToDecimal(
      dividePips(
        expectedQuoteQuantityAtPoolPrice - actualQuoteAssetQuantityWithoutFees,
        expectedQuoteQuantityAtPoolPrice,
      ),
    ),
  );

  const poolReceivedBaseQuantity = multiplyPips(
    baseAssetQuantity,
    oneInPips - idexFeeRate,
  );

  const poolBaseQuantityCreditedForSwap = multiplyPips(
    baseAssetQuantity,
    oneInPips - idexFeeRate - poolFeeRate,
  );

  const walletReceivedQuote =
    pool.quoteReserveQuantity -
    dividePips(
      multiplyPips(pool.baseReserveQuantity, pool.quoteReserveQuantity),
      pool.baseReserveQuantity + poolBaseQuantityCreditedForSwap,
    );

  const finalReserves = {
    baseReserveQuantity: pool.baseReserveQuantity + poolReceivedBaseQuantity,
    quoteReserveQuantity: pool.quoteReserveQuantity - walletReceivedQuote,
  };

  const nominalPrice = dividePips(
    finalReserves.quoteReserveQuantity,
    finalReserves.baseReserveQuantity,
  );

  const limitPrice = multiplyPips(nominalPrice, oneInPips - poolSlippageLimit);

  const minimumOutputNoFees = multiplyPips(baseAssetQuantity, limitPrice);
  const minimumOutputWithFees = multiplyPips(
    minimumOutputNoFees,
    oneInPips - idexFeeRate - poolFeeRate,
  );

  const estimatedBaseAssetFees = multiplyPips(
    baseAssetQuantity,
    idexFeeRate + poolFeeRate,
  );

  return {
    inputAssetQuantity: baseAssetQuantity,
    feeQuantity: estimatedBaseAssetFees,
    invertedPrice,
    limitPrice,
    outputAssetQuantityExpected: actualQuoteAssetQuantityWithFees,
    outputAssetQuantityMinimum: minimumOutputWithFees,
    price,
    priceImpact,
  };
}

export function swapQuoteTokenWithPool(
  quoteAssetQuantity: bigint,
  pool: PoolReserveQuantities,
  idexFeeRate: bigint,
  poolFeeRate: bigint,
  poolSlippageLimit: bigint,
): tokenSwapValues {
  const poolPrice = dividePips(
    pool.quoteReserveQuantity,
    pool.baseReserveQuantity,
  );

  // actual base received, if there were no fees
  const actualBaseAssetQuantityWithoutFees = calculateBaseQuantityOut(
    pool.baseReserveQuantity,
    pool.quoteReserveQuantity,
    quoteAssetQuantity,
    BigInt(0),
    BigInt(0),
  );

  // calculate fees using the simple percentage method
  const estimatedBaseAssetFees = multiplyPips(
    actualBaseAssetQuantityWithoutFees,
    idexFeeRate + poolFeeRate,
  );

  const actualBaseAssetQuantityWithFees =
    actualBaseAssetQuantityWithoutFees - estimatedBaseAssetFees;

  // prices based on the base received from pool curve, minus simple fees
  const price = dividePips(quoteAssetQuantity, actualBaseAssetQuantityWithFees);

  const invertedPrice = dividePips(
    actualBaseAssetQuantityWithFees,
    quoteAssetQuantity,
  );

  // amount of base we would have received with infinite liquidity at the spread / pool price
  const expectedBaseQuantityAtPoolPrice = dividePips(
    quoteAssetQuantity,
    poolPrice,
  );

  const priceImpact = Number(
    pipToDecimal(
      dividePips(
        expectedBaseQuantityAtPoolPrice - actualBaseAssetQuantityWithoutFees,
        expectedBaseQuantityAtPoolPrice,
      ),
    ),
  );

  const poolReceivedQuoteQuantity = multiplyPips(
    quoteAssetQuantity,
    oneInPips - idexFeeRate,
  );

  const poolQuoteQuantityCreditedForSwap = multiplyPips(
    quoteAssetQuantity,
    oneInPips - idexFeeRate - poolFeeRate,
  );

  const walletReceivedBase =
    pool.baseReserveQuantity -
    dividePips(
      multiplyPips(pool.baseReserveQuantity, pool.quoteReserveQuantity),
      pool.quoteReserveQuantity + poolQuoteQuantityCreditedForSwap,
    );

  const finalReserves = {
    baseReserveQuantity: pool.baseReserveQuantity - walletReceivedBase,
    quoteReserveQuantity: pool.quoteReserveQuantity + poolReceivedQuoteQuantity,
  };

  const nominalPrice = dividePips(
    finalReserves.quoteReserveQuantity,
    finalReserves.baseReserveQuantity,
  );

  const limitPrice = multiplyPips(nominalPrice, oneInPips + poolSlippageLimit);

  const minimumOutputNoFees = dividePips(quoteAssetQuantity, limitPrice);
  const minimumOutputWithFees = multiplyPips(
    minimumOutputNoFees,
    oneInPips - idexFeeRate - poolFeeRate,
  );

  const estimatedQuoteAssetFees = multiplyPips(
    quoteAssetQuantity,
    idexFeeRate + poolFeeRate,
  );

  return {
    inputAssetQuantity: quoteAssetQuantity,
    feeQuantity: estimatedQuoteAssetFees,
    invertedPrice,
    limitPrice,
    outputAssetQuantityExpected: actualBaseAssetQuantityWithFees,
    outputAssetQuantityMinimum: minimumOutputWithFees,
    price,
    priceImpact,
  };
}
