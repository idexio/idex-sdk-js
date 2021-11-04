import {
  L2OrderBook,
  OrderBookLevelL2,
  PoolReserveQuantities,
  TokenSwapValues,
} from '../types';
import {
  dividePips,
  minBigInt,
  multiplyPips,
  oneInPips,
  pipToDecimal,
} from '../pipmath';
import {
  calculateBaseQuantityOut,
  calculateQuoteQuantityOut,
  quantitiesAvailableFromPoolAtAskPrice,
  quantitiesAvailableFromPoolAtBidPrice,
} from './quantities';

const NullTokenSwap: TokenSwapValues = {
  inputAssetQuantity: BigInt(0),
  feeQuantity: BigInt(0),
  invertedPrice: BigInt(0),
  limitPrice: BigInt(0),
  outputAssetQuantityExpected: BigInt(0),
  outputAssetQuantityMinimum: BigInt(0),
  price: BigInt(0),
  priceImpact: 0,
};

export function swapTokenWithOrderBook(
  assetQuantity: bigint,
  isQuoteToken: boolean,
  l2: L2OrderBook,
  idexFeeRate: bigint,
  poolFeeRate: bigint,
  poolSlippageLimit: bigint,
): TokenSwapValues {
  // first, execute as if there were no limit orders
  const poolOnlyValues = l2.pool
    ? swapTokenWithPool(
        assetQuantity,
        isQuoteToken,
        l2.pool,
        idexFeeRate,
        poolFeeRate,
        poolSlippageLimit,
      )
    : {
        ...NullTokenSwap,
        inputAssetQuantity: assetQuantity,
      };

  // if there are no limit orders available to improve the pricing, we are done
  if (
    (isQuoteToken === false &&
      (!l2.bids.length || poolOnlyValues.price >= l2.bids[0].price)) ||
    (isQuoteToken === true &&
      (!l2.asks.length || poolOnlyValues.price <= l2.asks[0].price))
  ) {
    return poolOnlyValues;
  }

  // insert a synthetic orderbook level at the pool-only swap price
  const levels = isQuoteToken ? l2.asks : l2.bids;
  if (l2.pool) {
    const size = (isQuoteToken
      ? quantitiesAvailableFromPoolAtAskPrice(
          l2.pool.baseReserveQuantity,
          l2.pool.quoteReserveQuantity,
          poolOnlyValues.limitPrice,
          BigInt(0),
          BigInt(0),
        )
      : quantitiesAvailableFromPoolAtBidPrice(
          l2.pool.baseReserveQuantity,
          l2.pool.quoteReserveQuantity,
          poolOnlyValues.limitPrice,
          BigInt(0),
          BigInt(0),
        )
    ).grossBase;

    levels.push({
      type: 'pool',
      size,
      numOrders: 0,
      price: poolOnlyValues.limitPrice,
    });
  }

  // run the actual swap against limit orders to see improvements
  return isQuoteToken
    ? swapQuoteTokenWithOrderBook(
        assetQuantity,
        l2.pool,
        levels,
        poolOnlyValues,
        idexFeeRate,
        poolFeeRate,
      )
    : swapBaseTokenWithOrderBook(
        assetQuantity,
        l2.pool,
        levels,
        poolOnlyValues,
        idexFeeRate,
        poolFeeRate,
      );
}

function swapBaseTokenWithOrderBook(
  baseAssetQuantity: bigint,
  pool: PoolReserveQuantities | null,
  bids: OrderBookLevelL2[],
  poolOnlyValues: TokenSwapValues,
  idexFeeRate: bigint,
  poolFeeRate: bigint,
): TokenSwapValues {
  let actualQuoteReceived = BigInt(0);
  let baseRemaining = baseAssetQuantity;
  let lastBasePoolLiquidityAvailableAtThisLevel = BigInt(0);
  let lastQuotePoolLiquidityAvailableAtThisLevel = BigInt(0);
  const poolCopy = pool ? { ...pool } : null;

  for (const bid of bids) {
    if (!baseRemaining) {
      break;
    }
    // first, try to buy all of the pool liquidity
    if (poolCopy) {
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
          BigInt(0),
          BigInt(0),
        );
      }
      actualQuoteReceived += quotePoolLiquidityAvailableAtThisLevel;
      baseRemaining -= basePoolLiquidityAvailableAtThisLevel;
      lastBasePoolLiquidityAvailableAtThisLevel += basePoolLiquidityAvailableAtThisLevel;
      lastQuotePoolLiquidityAvailableAtThisLevel += quotePoolLiquidityAvailableAtThisLevel;
    }

    if (baseRemaining) {
      // if we have base remaining to spend, take from the limit order(s)
      const baseLimitOrderLiquidityAvailableAtThisLevel = minBigInt(
        bid.size,
        baseRemaining,
      );
      const quoteLimitOrderLiquidityAvailableAtThisLevel = multiplyPips(
        baseLimitOrderLiquidityAvailableAtThisLevel,
        bid.price,
      );

      actualQuoteReceived += quoteLimitOrderLiquidityAvailableAtThisLevel;
      baseRemaining -= baseLimitOrderLiquidityAvailableAtThisLevel;
    }
  }

  // same as base * price, if there's no pool it's the best bid
  const expectedQuoteQuantityAtPoolPrice = pool
    ? dividePips(
        multiplyPips(baseAssetQuantity, pool.quoteReserveQuantity),
        pool.baseReserveQuantity,
      )
    : multiplyPips(bids[0].price, baseAssetQuantity);

  // calculate fees using the simple percentage method
  const actualQuoteReceivedWithFees = multiplyPips(
    actualQuoteReceived,
    oneInPips - idexFeeRate - poolFeeRate,
  );

  return {
    ...poolOnlyValues,
    outputAssetQuantityExpected: actualQuoteReceivedWithFees,
    invertedPrice: dividePips(baseAssetQuantity, actualQuoteReceivedWithFees),
    price: dividePips(actualQuoteReceivedWithFees, baseAssetQuantity),
    priceImpact: Number(
      pipToDecimal(
        dividePips(
          expectedQuoteQuantityAtPoolPrice - actualQuoteReceived,
          expectedQuoteQuantityAtPoolPrice,
        ),
      ),
    ),
  };
}

function swapQuoteTokenWithOrderBook(
  quoteAssetQuantity: bigint,
  pool: PoolReserveQuantities | null,
  asks: OrderBookLevelL2[],
  poolOnlyValues: TokenSwapValues,
  idexFeeRate: bigint,
  poolFeeRate: bigint,
): TokenSwapValues {
  let actualBaseReceived = BigInt(0);
  let quoteRemaining = quoteAssetQuantity;
  let lastBasePoolLiquidityAvailableAtThisLevel = BigInt(0);
  let lastQuotePoolLiquidityAvailableAtThisLevel = BigInt(0);
  const poolCopy = pool ? { ...pool } : null;

  for (const ask of asks) {
    if (!quoteRemaining) {
      break;
    }
    // first, try to buy all of the pool liquidity
    if (poolCopy) {
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
          BigInt(0),
          BigInt(0),
        );
      }

      actualBaseReceived += basePoolLiquidityAvailableAtThisLevel;
      quoteRemaining -= quotePoolLiquidityAvailableAtThisLevel;
      lastBasePoolLiquidityAvailableAtThisLevel += basePoolLiquidityAvailableAtThisLevel;
      lastQuotePoolLiquidityAvailableAtThisLevel += quotePoolLiquidityAvailableAtThisLevel;
    }

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
  }

  // same as quote divided by pool price, but multiply first for precision
  const expectedBaseQuantityAtPoolPrice = pool
    ? dividePips(
        multiplyPips(pool.baseReserveQuantity, quoteAssetQuantity),
        pool.quoteReserveQuantity,
      )
    : dividePips(quoteAssetQuantity, asks[0].price);

  // calculate fees using the simple percentage method
  const actualBaseReceivedWithFees = multiplyPips(
    actualBaseReceived,
    oneInPips - idexFeeRate - poolFeeRate,
  );

  return {
    ...poolOnlyValues,
    outputAssetQuantityExpected: actualBaseReceivedWithFees,
    invertedPrice: dividePips(actualBaseReceivedWithFees, quoteAssetQuantity),
    price: dividePips(quoteAssetQuantity, actualBaseReceivedWithFees),
    priceImpact: Number(
      pipToDecimal(
        dividePips(
          expectedBaseQuantityAtPoolPrice - actualBaseReceived,
          expectedBaseQuantityAtPoolPrice,
        ),
      ),
    ),
  };
}

export function swapTokenWithPool(
  assetQuantity: bigint,
  isQuoteAsset: boolean,
  pool: PoolReserveQuantities,
  idexFeeRate: bigint,
  poolFeeRate: bigint,
  poolSlippageLimit: bigint,
): TokenSwapValues {
  return (isQuoteAsset ? swapQuoteTokenWithPool : swapBaseTokenWithPool)(
    assetQuantity,
    pool,
    idexFeeRate,
    poolFeeRate,
    poolSlippageLimit,
  );
}

function swapBaseTokenWithPool(
  baseAssetQuantity: bigint,
  pool: PoolReserveQuantities,
  idexFeeRate: bigint,
  poolFeeRate: bigint,
  poolSlippageLimit: bigint,
): TokenSwapValues {
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
  const actualQuoteAssetQuantityWithFees = multiplyPips(
    actualQuoteAssetQuantityWithoutFees,
    oneInPips - idexFeeRate - poolFeeRate,
  );

  // amount of base we would have received with infinite liquidity at the spread / pool price
  const expectedQuoteQuantityAtPoolPrice = multiplyPips(
    baseAssetQuantity,
    poolPrice,
  );

  const priceImpactInPips = dividePips(
    expectedQuoteQuantityAtPoolPrice - actualQuoteAssetQuantityWithoutFees,
    expectedQuoteQuantityAtPoolPrice,
  );

  // move the pool reserves based on quote received by the wallet, and base by the pool
  // then set a limit price with slippage from the new pool price

  const poolBaseCredit = multiplyPips(
    baseAssetQuantity,
    oneInPips - idexFeeRate,
  );

  const poolQuoteDebit =
    pool.quoteReserveQuantity -
    (pool.baseReserveQuantity * pool.quoteReserveQuantity) /
      (pool.baseReserveQuantity +
        multiplyPips(baseAssetQuantity, oneInPips - idexFeeRate - poolFeeRate));

  const newBaseReserveQuantity = pool.baseReserveQuantity + poolBaseCredit;
  const newQuoteReserveQuantity = pool.quoteReserveQuantity - poolQuoteDebit;

  const nominalPrice = dividePips(
    newQuoteReserveQuantity,
    newBaseReserveQuantity,
  );
  const limitPrice = multiplyPips(nominalPrice, oneInPips - poolSlippageLimit);

  return {
    inputAssetQuantity: baseAssetQuantity,
    feeQuantity: multiplyPips(baseAssetQuantity, idexFeeRate + poolFeeRate),
    invertedPrice: dividePips(
      baseAssetQuantity,
      actualQuoteAssetQuantityWithFees,
    ),
    limitPrice,
    outputAssetQuantityExpected: actualQuoteAssetQuantityWithFees,
    outputAssetQuantityMinimum: multiplyPips(
      multiplyPips(baseAssetQuantity, limitPrice),
      oneInPips - idexFeeRate - poolFeeRate,
    ),
    price: dividePips(actualQuoteAssetQuantityWithFees, baseAssetQuantity),
    priceImpact: Number(pipToDecimal(priceImpactInPips)),
  };
}

function swapQuoteTokenWithPool(
  quoteAssetQuantity: bigint,
  pool: PoolReserveQuantities,
  idexFeeRate: bigint,
  poolFeeRate: bigint,
  poolSlippageLimit: bigint,
): TokenSwapValues {
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
  const actualBaseAssetQuantityWithFees =
    actualBaseAssetQuantityWithoutFees -
    multiplyPips(actualBaseAssetQuantityWithoutFees, idexFeeRate + poolFeeRate);

  // amount of base we would have received with infinite liquidity at the spread / pool price
  const expectedBaseQuantityAtPoolPrice = dividePips(
    quoteAssetQuantity,
    poolPrice,
  );

  const priceImpactInPips = dividePips(
    expectedBaseQuantityAtPoolPrice - actualBaseAssetQuantityWithoutFees,
    expectedBaseQuantityAtPoolPrice,
  );

  // move the pool reserves based on base received by the wallet, and quote by the pool
  // then set a limit price with slippage from the new pool price

  const poolQuoteCredit = multiplyPips(
    quoteAssetQuantity,
    oneInPips - idexFeeRate,
  );

  const poolBaseDebit =
    pool.baseReserveQuantity -
    (pool.baseReserveQuantity * pool.quoteReserveQuantity) /
      (pool.quoteReserveQuantity +
        multiplyPips(
          quoteAssetQuantity,
          oneInPips - idexFeeRate - poolFeeRate,
        ));

  const newBaseReserveQuantity = pool.baseReserveQuantity - poolBaseDebit;
  const newQuoteReserveQuantity = pool.quoteReserveQuantity + poolQuoteCredit;
  const nominalPrice = dividePips(
    newQuoteReserveQuantity,
    newBaseReserveQuantity,
  );
  const limitPrice = multiplyPips(nominalPrice, oneInPips + poolSlippageLimit);

  return {
    inputAssetQuantity: quoteAssetQuantity,
    feeQuantity: multiplyPips(quoteAssetQuantity, idexFeeRate + poolFeeRate),
    invertedPrice: dividePips(
      actualBaseAssetQuantityWithFees,
      quoteAssetQuantity,
    ),
    limitPrice,
    outputAssetQuantityExpected: actualBaseAssetQuantityWithFees,
    outputAssetQuantityMinimum: multiplyPips(
      dividePips(quoteAssetQuantity, limitPrice),
      oneInPips - idexFeeRate - poolFeeRate,
    ),
    price: dividePips(quoteAssetQuantity, actualBaseAssetQuantityWithFees),
    priceImpact: Number(pipToDecimal(priceImpactInPips)),
  };
}
