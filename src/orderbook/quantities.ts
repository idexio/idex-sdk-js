import { BigNumber } from 'bignumber.js';

import {
  ROUNDING,
  absBigInt,
  arraySumBigInt,
  decimalToPip,
  divideBigInt,
  maxBigInt,
  minBigInt,
  multiplyPips,
  oneInPips,
} from '#pipmath';

import { OrderSide } from '#types/enums/request';

import type {
  L2OrderBook,
  OrderBookLevelL1,
  OrderBookLevelL2,
} from '#types/orderBook';
import type { IDEXMarket, IDEXPosition } from '#types/rest/endpoints/index';

type LeverageParameters = Pick<
  IDEXMarket,
  | 'maximumPositionSize'
  | 'initialMarginFraction'
  | 'maintenanceMarginFraction'
  | 'basePositionSize'
  | 'incrementalPositionSize'
  | 'incrementalInitialMarginFraction'
>;

export type LeverageParametersBigInt = Record<keyof LeverageParameters, bigint>;

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
 * Determines the liquidity (expressed in the market's base asset) that can be
 * taken off the given order book (asks or bids) by spending the specified
 * fraction of a wallet's available collateral and taking into account the
 * margin requirement for the newly acquired position balance.
 *
 * Also returns the cost basis of the newly acquired position balance (i.e. the
 * quote quantity that is exchanged to acquire the position balance).
 *
 * Both values are signed (positive for buys, negative for sells).
 *
 * The provided list of orders or price levels (asks or bids) is expected to be
 * sorted by best price (ascending for asks (lowest first), descending for bids
 * (highest first)). Multiple orders per price level are supported.
 */
export function calculateBuySellPanelEstimate(args: {
  /** All the wallet's open positions, including any in the current market */
  allWalletPositions: IDEXPosition[];
  /** Free collateral committed to open limit orders (unsigned) */
  heldCollateral: bigint;
  initialMarginFractionOverride: bigint | null;
  leverageParameters: LeverageParameters;
  makerSideOrders: Iterable<PriceAndSize>;
  market: Pick<IDEXMarket, 'market' | 'indexPrice'>;
  /** Quote token balance (USDC) (signed) */
  quoteBalance: bigint;
  /**
   * Floating point number between 0 and 1 that indicates the amount of the
   * available collateral to be spent.
   */
  sliderFactor: number;
  takerSide: OrderSide;
}): {
  baseQuantity: bigint;
  quoteQuantity: bigint;
} {
  const {
    allWalletPositions,
    market,
    heldCollateral,
    initialMarginFractionOverride,
    leverageParameters,
    makerSideOrders,
    quoteBalance,
    sliderFactor,
    takerSide,
  } = args;

  /*
   * Slider calculations
   */
  const accountValue =
    quoteBalance + calculateNotionalQuoteValueOfPositions(allWalletPositions);

  const initialMarginRequirementOfAllPositions = arraySumBigInt(
    allWalletPositions.map((position) =>
      decimalToPip(position.marginRequirement),
    ),
  );
  const initialAvailableCollateral =
    accountValue - initialMarginRequirementOfAllPositions - heldCollateral;

  if (initialAvailableCollateral <= BigInt(0) || sliderFactor === 0) {
    return {
      baseQuantity: BigInt(0),
      quoteQuantity: BigInt(0),
    };
  }
  if (sliderFactor < 0 || sliderFactor > 1) {
    throw new Error(
      'sliderFactor must be a floating point number between 0 and 1',
    );
  }
  const sliderFactorInPips = decimalToPip(sliderFactor.toString());

  const remainingAvailableCollateral =
    initialAvailableCollateral * (oneInPips - sliderFactorInPips);

  /*
   * Execute against order book
   */
  const indexPrice = decimalToPip(market.indexPrice);
  const indexPrice2p = indexPrice * oneInPips;

  const heldCollateral2p = heldCollateral * oneInPips;

  const currentPosition = allWalletPositions.find(
    (position) => position.market === market.market,
  );
  const otherPositions = allWalletPositions.filter(
    (position) => position.market !== market.market,
  );

  const quoteValueOfOtherPositions =
    calculateNotionalQuoteValueOfPositions(otherPositions);
  const quoteValueOfOtherPositions2p = quoteValueOfOtherPositions * oneInPips;

  const initialMarginRequirementOfOtherPositions = arraySumBigInt(
    otherPositions.map((position) => decimalToPip(position.marginRequirement)),
  );
  const initialMarginRequirementOfOtherPositions2p =
    initialMarginRequirementOfOtherPositions * oneInPips;

  const leverageParametersBigInt =
    convertToLeverageParametersBigInt(leverageParameters);

  let additionalPositionQty = BigInt(0); // Signed
  let additionalPositionCostBasis = BigInt(0); // Signed
  let quoteBalance2p = quoteBalance * oneInPips; // Signed

  for (const makerOrder of makerSideOrders) {
    if (!doOrdersMatch(makerOrder, { side: takerSide })) {
      return {
        baseQuantity: additionalPositionQty,
        quoteQuantity: additionalPositionCostBasis,
      };
    }
    if (
      takerSide === 'buy' ?
        indexPrice >= makerOrder.price
      : indexPrice <= makerOrder.price
    ) {
      return {
        baseQuantity: additionalPositionQty,
        quoteQuantity: additionalPositionCostBasis,
      };
    }
    const makerOrderPrice2p = makerOrder.price * oneInPips;

    const positionBalance =
      (currentPosition ? decimalToPip(currentPosition.quantity) : BigInt(0)) +
      additionalPositionQty;

    const quoteValueOfPosition2p = positionBalance * indexPrice; // Signed

    const initialMarginFraction = calculateInitialMarginFractionWithOverride({
      initialMarginFractionOverride,
      leverageParameters: leverageParametersBigInt,
      positionBalance,
    });

    // Unsigned
    const initialMarginRequirementOfPosition2p = multiplyPips(
      absBigInt(quoteValueOfPosition2p),
      initialMarginFraction,
    );

    // Signed
    const maxTakerBaseQty =
      ((-quoteBalance2p -
        quoteValueOfPosition2p -
        quoteValueOfOtherPositions2p +
        heldCollateral2p +
        remainingAvailableCollateral +
        initialMarginRequirementOfPosition2p +
        initialMarginRequirementOfOtherPositions2p) *
        oneInPips) /
      (indexPrice2p -
        makerOrderPrice2p +
        BigInt(takerSide === 'buy' ? -1 : 1) *
          indexPrice *
          initialMarginFraction);

    if (absBigInt(maxTakerBaseQty) < makerOrder.size) {
      additionalPositionQty += maxTakerBaseQty;
      additionalPositionCostBasis += multiplyPips(
        maxTakerBaseQty,
        makerOrder.price,
      );
      return {
        baseQuantity: additionalPositionQty,
        quoteQuantity: additionalPositionCostBasis,
      };
    }
    const tradeBaseQty = makerOrder.size * BigInt(takerSide === 'buy' ? 1 : -1);
    const tradeQuoteQty = multiplyPips(tradeBaseQty, makerOrder.price);
    additionalPositionQty += tradeBaseQty;
    additionalPositionCostBasis += tradeQuoteQty;

    quoteBalance2p -= tradeBaseQty * makerOrder.price;
  }
  return {
    baseQuantity: additionalPositionQty,
    quoteQuantity: additionalPositionCostBasis,
  };
}

/**
 * @private
 */
function calculateInitialMarginFraction(
  leverageParameters: LeverageParametersBigInt,
  positionBalance: bigint,
): bigint {
  const absPositionBalance = absBigInt(positionBalance);
  if (absPositionBalance <= leverageParameters.basePositionSize) {
    return leverageParameters.initialMarginFraction;
  }
  return (
    leverageParameters.initialMarginFraction +
    divideBigInt(
      absPositionBalance - leverageParameters.basePositionSize,
      leverageParameters.incrementalPositionSize,
      ROUNDING.RoundUp,
    ) *
      leverageParameters.incrementalInitialMarginFraction
  );
}

/**
 * @private
 */
function calculateInitialMarginFractionWithOverride(args: {
  initialMarginFractionOverride: bigint | null;
  leverageParameters: LeverageParametersBigInt;
  positionBalance: bigint;
}): bigint {
  const { initialMarginFractionOverride, leverageParameters, positionBalance } =
    args;

  return maxBigInt(
    calculateInitialMarginFraction(leverageParameters, positionBalance),
    initialMarginFractionOverride ?? BigInt(0),
  );
}

/**
 * @private
 */
function calculateNotionalQuoteValueOfPosition(position: IDEXPosition): bigint {
  return multiplyPips(
    decimalToPip(position.quantity),
    decimalToPip(position.indexPrice),
  );
}

/**
 * @private
 */
function calculateNotionalQuoteValueOfPositions(
  positions: IDEXPosition[],
): bigint {
  return arraySumBigInt(positions.map(calculateNotionalQuoteValueOfPosition));
}

/**
 * @private
 */
function convertToLeverageParametersBigInt(
  leverageParameters: LeverageParameters,
): LeverageParametersBigInt {
  return {
    maximumPositionSize: decimalToPip(leverageParameters.maximumPositionSize),
    initialMarginFraction: decimalToPip(
      leverageParameters.initialMarginFraction,
    ),
    maintenanceMarginFraction: decimalToPip(
      leverageParameters.maintenanceMarginFraction,
    ),
    basePositionSize: decimalToPip(leverageParameters.basePositionSize),
    incrementalPositionSize: decimalToPip(
      leverageParameters.incrementalPositionSize,
    ),
    incrementalInitialMarginFraction: decimalToPip(
      leverageParameters.incrementalInitialMarginFraction,
    ),
  };
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
  const takerQuantity2p = takerOrder.quantity * oneInPips;

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
      baseQuantity: filledBaseQty2p / oneInPips,
      quoteQuantity: filledQuoteQty2p / oneInPips,
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
  const makerQuantity2p = makerOrder.size * oneInPips;

  // Limit by base
  const fillBaseQty2p =
    isMaxTakerQuantityInQuote ? makerQuantity2p : (
      minBigInt(maxTakerQuantity2p, makerQuantity2p)
    );

  const fillQuoteQty2p = multiplyPips(fillBaseQty2p, makerOrder.price);

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
