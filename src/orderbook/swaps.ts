import { L2OrderBook, PoolReserveQuantities } from '../types';
import { dividePips, multiplyPips, oneInPips, pipToDecimal } from '../pipmath';
import {
  calculateBaseQuantityOut,
  calculateQuoteQuantityOut,
  recalculateHybridLevelAmounts,
  sortAndMergeLevelsUnadjusted,
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

// how much quote do we expect to actually receive from this order book?
function quoteQuantityReceivedFromOrderBook(
  hybridBook: L2OrderBook,
  quoteAssetQuantity: bigint,
): bigint {
  if (!hybridBook.asks.length) {
    return BigInt(0);
  }
  let baseQuantityReceived = BigInt(0);
  let isDone = false;
  let quoteRemaining = quoteAssetQuantity;
  for (const askLevel of hybridBook.asks) {
    let quoteAvailable = multiplyPips(askLevel.size, askLevel.price);
    if (quoteAvailable > quoteRemaining) {
      quoteAvailable = quoteRemaining;
      baseQuantityReceived += dividePips(quoteAvailable, askLevel.price);
      isDone = true;
    } else {
      baseQuantityReceived += askLevel.size;
    }
    quoteRemaining -= quoteAvailable;
    if (isDone) {
      break;
    }
  }
  return baseQuantityReceived;
}

export function swapQuoteTokenWithOrderBook(
  quoteAssetQuantity: bigint,
  l2: L2OrderBook,
  idexFeeRate: bigint,
  poolFeeRate: bigint,
  takerFeeRate: bigint,
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

  // construct a synthetic orderbook with only the one synthetic ask level
  const hybridBook: L2OrderBook = recalculateHybridLevelAmounts(
    {
      sequence: 1,
      asks: sortAndMergeLevelsUnadjusted(
        l2.asks,
        [
          {
            type: 'pool',
            price: poolOnlyValues.price,
            numOrders: 0,
            size: poolOnlyValues.outputAssetQuantityExpected,
          },
        ],
        (a, b) => a.price <= b.price,
      ),
      bids: [],
      pool: l2.pool,
    },
    idexFeeRate,
    poolFeeRate,
    takerFeeRate,
  );

  const baseQuantityReceivedFromLimitOrdersOnly = quoteQuantityReceivedFromOrderBook(
    l2,
    quoteAssetQuantity,
  );

  const baseQuantityReceived = quoteQuantityReceivedFromOrderBook(
    hybridBook,
    quoteAssetQuantity,
  );

  const baseQuantityReceivedFromPool =
    baseQuantityReceived - baseQuantityReceivedFromLimitOrdersOnly;

  const price = dividePips(
    l2.pool.quoteReserveQuantity + quoteAssetQuantity,
    l2.pool.baseReserveQuantity - baseQuantityReceivedFromPool,
  );

  const invertedPrice = dividePips(oneInPips, price);

  // recalculates slippage
  const poolPrice = dividePips(
    l2.pool.quoteReserveQuantity,
    l2.pool.baseReserveQuantity,
  );

  const priceImpactInPips = dividePips(price - poolPrice, poolPrice);
  const priceImpactAsNumber = Number(pipToDecimal(priceImpactInPips));

  const estimatedBaseAssetFees = multiplyPips(
    baseQuantityReceived,
    idexFeeRate + poolFeeRate,
  );

  const estimatedQuoteAssetFees = multiplyPips(estimatedBaseAssetFees, price);

  return {
    ...poolOnlyValues,
    feeQuantity: estimatedQuoteAssetFees,
    outputAssetQuantityExpected: baseQuantityReceived,
    invertedPrice,
    price,
    priceImpact: priceImpactAsNumber,
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

  const actualQuoteAssetQuantityWithFees = calculateQuoteQuantityOut(
    pool.baseReserveQuantity,
    pool.quoteReserveQuantity,
    baseAssetQuantity,
    idexFeeRate,
    poolFeeRate,
  );

  const estimatedBaseAssetFees = multiplyPips(
    baseAssetQuantity,
    idexFeeRate + poolFeeRate,
  );

  const price = dividePips(actualQuoteAssetQuantityWithFees, baseAssetQuantity);

  const invertedPrice = dividePips(
    baseAssetQuantity,
    actualQuoteAssetQuantityWithFees,
  );

  const priceImpactInPips = dividePips(price - poolPrice, poolPrice);
  const priceImpactAsNumber = Number(pipToDecimal(priceImpactInPips));

  const limitPrice = multiplyPips(price, oneInPips - poolSlippageLimit);

  const minimumOutputNoFees = multiplyPips(baseAssetQuantity, limitPrice);
  const minimumOutputWithFees = multiplyPips(
    minimumOutputNoFees,
    oneInPips - idexFeeRate - poolFeeRate,
  );

  return {
    inputAssetQuantity: baseAssetQuantity,
    feeQuantity: estimatedBaseAssetFees,
    invertedPrice,
    limitPrice,
    outputAssetQuantityExpected: actualQuoteAssetQuantityWithFees,
    outputAssetQuantityMinimum: minimumOutputWithFees,
    price,
    priceImpact: priceImpactAsNumber,
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

  const actualBaseAssetQuantityWithFees = calculateBaseQuantityOut(
    pool.baseReserveQuantity,
    pool.quoteReserveQuantity,
    quoteAssetQuantity,
    idexFeeRate,
    poolFeeRate,
  );

  const estimatedQuoteAssetFees = multiplyPips(
    quoteAssetQuantity,
    idexFeeRate + poolFeeRate,
  );

  const price = dividePips(quoteAssetQuantity, actualBaseAssetQuantityWithFees);

  const invertedPrice = dividePips(
    actualBaseAssetQuantityWithFees,
    quoteAssetQuantity,
  );

  const priceImpactInPips = dividePips(price - poolPrice, poolPrice);
  const priceImpactAsNumber = Number(pipToDecimal(priceImpactInPips));

  const limitPrice = multiplyPips(price, oneInPips + poolSlippageLimit);

  const minimumOutputNoFees = dividePips(quoteAssetQuantity, limitPrice);
  const minimumOutputWithFees = multiplyPips(
    minimumOutputNoFees,
    oneInPips - idexFeeRate - poolFeeRate,
  );

  return {
    inputAssetQuantity: quoteAssetQuantity,
    feeQuantity: estimatedQuoteAssetFees,
    invertedPrice,
    limitPrice,
    outputAssetQuantityExpected: actualBaseAssetQuantityWithFees,
    outputAssetQuantityMinimum: minimumOutputWithFees,
    price,
    priceImpact: priceImpactAsNumber,
  };
}
