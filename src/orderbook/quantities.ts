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

type Position = {
  market: string;
  quantity: bigint;
  indexPrice: bigint;
  marginRequirement: bigint;
};

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

export function calculateAvailableCollateral(wallet: {
  /** Free collateral committed to open limit orders (unsigned) */
  heldCollateral: bigint;
  /** All the wallet's open positions */
  positions: Position[];
  /** Quote token balance (USDC) (signed) */
  quoteBalance: bigint;
}): bigint {
  const {
    heldCollateral,
    positions: allWalletPositions,
    quoteBalance,
  } = wallet;

  const accountValue =
    quoteBalance + calculateNotionalQuoteValueOfPositions(allWalletPositions);

  const initialMarginRequirementOfAllPositions = arraySumBigInt(
    allWalletPositions.map((position) => position.marginRequirement),
  );
  return accountValue - initialMarginRequirementOfAllPositions - heldCollateral;
}

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
  formInputs: {
    limitPrice?: bigint;
    takerSide: OrderSide;
  } & /**
   * Either desiredPositionBaseQuantity, desiredPositionQuoteQuantity, or
   * sliderFactor needs to be provided.
   */ (
    | {
        /** The desired base position qty to be acquired */
        desiredPositionBaseQuantity: bigint;
        desiredPositionQuoteQuantity?: undefined;
        sliderFactor?: undefined;
      }
    | {
        desiredPositionBaseQuantity?: undefined;
        /** The desired quote position qty to be acquired */
        desiredPositionQuoteQuantity: bigint;
        sliderFactor?: undefined;
      }
    | {
        desiredPositionBaseQuantity?: undefined;
        desiredPositionQuoteQuantity?: undefined;
        /**
         * Floating point number between 0 and 1 that indicates the amount of
         * the available collateral to be spent
         */
        sliderFactor: number;
      }
  );
  initialMarginFractionOverride: bigint | null;
  leverageParameters: LeverageParameters;
  makerSideOrders: Iterable<PriceAndSize>;
  market: Pick<IDEXMarket, 'market' | 'indexPrice'>;
  wallet: {
    /** Free collateral committed to open limit orders (unsigned) */
    heldCollateral: bigint;
    /** All the wallet's open positions, including any in the current market */
    positions: IDEXPosition[];
    /** Quote token balance (USDC) (signed) */
    quoteBalance: bigint;
  };
}): {
  makerBaseQuantity: bigint;
  makerQuoteQuantity: bigint;
  takerBaseQuantity: bigint;
  takerQuoteQuantity: bigint;
} {
  const {
    initialMarginFractionOverride,
    leverageParameters,
    makerSideOrders,
    market,
    wallet,
  } = args;
  const { limitPrice, takerSide, sliderFactor } = args.formInputs;

  let { desiredPositionBaseQuantity, desiredPositionQuoteQuantity } =
    args.formInputs;

  const undefinedQtyInputs = [
    desiredPositionBaseQuantity,
    desiredPositionQuoteQuantity,
    sliderFactor,
  ].filter((value) => typeof value === 'undefined');

  if (undefinedQtyInputs.length !== 2) {
    throw new Error(
      'Either desiredPositionBaseQuantity, desiredPositionQuoteQuantity, or sliderFactor needs to be provided',
    );
  }
  // Ensure the correct sign of desired position qtys
  if (typeof desiredPositionBaseQuantity !== 'undefined') {
    desiredPositionBaseQuantity =
      absBigInt(desiredPositionBaseQuantity) *
      BigInt(takerSide === 'buy' ? 1 : -1);
  }
  if (typeof desiredPositionQuoteQuantity !== 'undefined') {
    desiredPositionQuoteQuantity =
      absBigInt(desiredPositionQuoteQuantity) *
      BigInt(takerSide === 'buy' ? 1 : -1);
  }
  if (typeof sliderFactor !== 'undefined') {
    if (sliderFactor < 0 || sliderFactor > 1) {
      throw new Error(
        'sliderFactor must be a floating point number between 0 and 1',
      );
    }
  }

  const allWalletPositions = args.wallet.positions.map(convertToPositionBigInt);

  const initialAvailableCollateral = calculateAvailableCollateral({
    ...args.wallet,
    positions: allWalletPositions,
  });

  if (
    initialAvailableCollateral <= BigInt(0) ||
    desiredPositionBaseQuantity === BigInt(0) ||
    desiredPositionQuoteQuantity === BigInt(0) ||
    sliderFactor === 0
  ) {
    return {
      makerBaseQuantity: BigInt(0),
      makerQuoteQuantity: BigInt(0),
      takerBaseQuantity: BigInt(0),
      takerQuoteQuantity: BigInt(0),
    };
  }

  /*
   * Slider calculations
   *
   * Don't limit the amount of available collateral to be spent if limiting by
   * desired position qty.
   */
  let desiredRemainingAvailableCollateral2p = BigInt(0);

  if (typeof sliderFactor !== 'undefined') {
    const sliderFactorInPips = decimalToPip(sliderFactor.toString());

    desiredRemainingAvailableCollateral2p =
      initialAvailableCollateral * (oneInPips - sliderFactorInPips);
  }

  /*
   * Execute against order book
   */
  const indexPrice = decimalToPip(market.indexPrice);
  const indexPrice2p = indexPrice * oneInPips;

  const heldCollateral2p = wallet.heldCollateral * oneInPips;

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
    otherPositions.map((position) => position.marginRequirement),
  );
  const initialMarginRequirementOfOtherPositions2p =
    initialMarginRequirementOfOtherPositions * oneInPips;

  const leverageParametersBigInt =
    convertToLeverageParametersBigInt(leverageParameters);

  let additionalPositionQty = BigInt(0); // Signed
  let additionalPositionCostBasis = BigInt(0); // Signed
  let quoteBalance2p = wallet.quoteBalance * oneInPips; // Signed

  const calculateMakerQtys = (): {
    makerBaseQuantity: bigint;
    makerQuoteQuantity: bigint;
  } => {
    if (!limitPrice) {
      return {
        makerBaseQuantity: BigInt(0),
        makerQuoteQuantity: BigInt(0),
      };
    }
    const maxOrderSize = calculateBuySellPanelMaxMakerOrderSize({
      additionalPositionQty,
      additionalPositionCostBasis,
      desiredRemainingAvailableCollateral:
        desiredRemainingAvailableCollateral2p / oneInPips,
      initialMarginFractionOverride,
      leverageParameters: leverageParametersBigInt,
      limitPrice,
      market,
      wallet: { ...wallet, positions: allWalletPositions },
    });
    return {
      makerBaseQuantity: maxOrderSize.baseQuantity,
      makerQuoteQuantity: maxOrderSize.quoteQuantity,
    };
  };

  for (const makerOrder of makerSideOrders) {
    if (!doOrdersMatch(makerOrder, { side: takerSide, limitPrice })) {
      return {
        ...calculateMakerQtys(),
        takerBaseQuantity: additionalPositionQty,
        takerQuoteQuantity: additionalPositionCostBasis,
      };
    }
    const makerOrderPrice2p = makerOrder.price * oneInPips;

    // Signed
    const runningPositionBalance =
      (currentPosition?.quantity ?? BigInt(0)) + additionalPositionQty;

    const quoteValueOfPosition2p = runningPositionBalance * indexPrice; // Signed

    const initialMarginFraction = calculateInitialMarginFractionWithOverride({
      baseQuantity: runningPositionBalance,
      initialMarginFractionOverride,
      leverageParameters: leverageParametersBigInt,
    });

    // Signed
    let maxTakerBaseQty =
      makerOrder.size * BigInt(takerSide === 'buy' ? 1 : -1);

    if (
      takerSide === 'buy' ?
        makerOrder.price >
        multiplyPips(indexPrice, oneInPips - initialMarginFraction)
      : multiplyPips(indexPrice, oneInPips + initialMarginFraction) >
        makerOrder.price
    ) {
      /*
       * Trade decreases available collateral; determine the taker's buying
       * power (may exceed the maker order size).
       */

      // Unsigned
      const initialMarginRequirementOfPosition2p = multiplyPips(
        absBigInt(quoteValueOfPosition2p),
        initialMarginFraction,
      );

      // Signed
      maxTakerBaseQty =
        ((-quoteBalance2p -
          quoteValueOfPosition2p -
          quoteValueOfOtherPositions2p +
          heldCollateral2p +
          desiredRemainingAvailableCollateral2p +
          initialMarginRequirementOfPosition2p +
          initialMarginRequirementOfOtherPositions2p) *
          oneInPips) /
        (indexPrice2p -
          makerOrderPrice2p +
          BigInt(takerSide === 'buy' ? -1 : 1) *
            indexPrice *
            initialMarginFraction);
    }

    if (desiredPositionBaseQuantity) {
      // Limit max base to desired position qty and buying power
      maxTakerBaseQty =
        takerSide === 'buy' ?
          minBigInt(
            maxTakerBaseQty,
            desiredPositionBaseQuantity - additionalPositionQty,
          )
        : maxBigInt(
            maxTakerBaseQty,
            desiredPositionBaseQuantity - additionalPositionQty,
          );
    }

    let maxTakerQuoteQty = multiplyPips(maxTakerBaseQty, makerOrder.price);

    if (desiredPositionQuoteQuantity) {
      // Limit max quote to desired position qty and buying power
      const maxTakerQuoteQtyBefore = maxTakerQuoteQty;
      maxTakerQuoteQty =
        takerSide === 'buy' ?
          minBigInt(
            maxTakerQuoteQty,
            desiredPositionQuoteQuantity - additionalPositionCostBasis,
          )
        : maxBigInt(
            maxTakerQuoteQty,
            desiredPositionQuoteQuantity - additionalPositionCostBasis,
          );

      if (maxTakerQuoteQty !== maxTakerQuoteQtyBefore) {
        // Reduce base proportionally to reduction of quote
        maxTakerBaseQty =
          (maxTakerBaseQty * maxTakerQuoteQty) / maxTakerQuoteQtyBefore;
      }
    }

    if (absBigInt(maxTakerBaseQty) < makerOrder.size) {
      additionalPositionQty += maxTakerBaseQty;
      additionalPositionCostBasis += maxTakerQuoteQty;
      return {
        makerBaseQuantity: BigInt(0),
        makerQuoteQuantity: BigInt(0),
        takerBaseQuantity: additionalPositionQty,
        takerQuoteQuantity: additionalPositionCostBasis,
      };
    }
    const tradeBaseQty = makerOrder.size * BigInt(takerSide === 'buy' ? 1 : -1);
    const tradeQuoteQty = multiplyPips(tradeBaseQty, makerOrder.price);
    additionalPositionQty += tradeBaseQty;
    additionalPositionCostBasis += tradeQuoteQty;

    quoteBalance2p -= tradeBaseQty * makerOrder.price;
  }

  return {
    ...calculateMakerQtys(),
    takerBaseQuantity: additionalPositionQty,
    takerQuoteQuantity: additionalPositionCostBasis,
  };
}

/**
 * @private
 */
function calculateBuySellPanelMaxMakerOrderSize(args: {
  additionalPositionQty: bigint; // Signed
  additionalPositionCostBasis: bigint; // Signed
  desiredRemainingAvailableCollateral: bigint;
  initialMarginFractionOverride: bigint | null;
  leverageParameters: LeverageParametersBigInt;
  limitPrice: bigint;
  market: Pick<IDEXMarket, 'market' | 'indexPrice'>;
  wallet: {
    heldCollateral: bigint;
    positions: Position[];
    quoteBalance: bigint;
  };
}): {
  baseQuantity: bigint;
  quoteQuantity: bigint;
  initialMarginFraction: bigint;
  initialMarginRequirement: bigint;
} {
  const {
    additionalPositionQty,
    additionalPositionCostBasis,
    desiredRemainingAvailableCollateral,
    initialMarginFractionOverride,
    leverageParameters,
    limitPrice,
    market,
  } = args;
  const { heldCollateral, positions, quoteBalance } = args.wallet;

  const indexPrice = decimalToPip(market.indexPrice);

  const currentPosition = positions.find(
    (position) => position.market === market.market,
  );
  const otherPositions = positions.filter(
    (position) => position.market !== market.market,
  );

  // Signed
  const newPositionBalance =
    (currentPosition?.quantity ?? BigInt(0)) + additionalPositionQty;

  // Signed
  const quoteValueOfPosition = multiplyPips(newPositionBalance, indexPrice);

  const initialMarginFraction = calculateInitialMarginFractionWithOverride({
    baseQuantity: newPositionBalance,
    initialMarginFractionOverride,
    leverageParameters,
  });

  // Unsigned
  const initialMarginRequirementOfPosition = multiplyPips(
    absBigInt(quoteValueOfPosition),
    initialMarginFraction,
  );

  const availableCollateral = calculateAvailableCollateral({
    heldCollateral,
    positions: [
      ...otherPositions,
      {
        market: market.market,
        indexPrice,
        quantity: newPositionBalance,
        marginRequirement: initialMarginRequirementOfPosition,
      },
    ],
    quoteBalance: quoteBalance - additionalPositionCostBasis,
  });
  if (availableCollateral <= desiredRemainingAvailableCollateral) {
    return {
      baseQuantity: BigInt(0),
      quoteQuantity: BigInt(0),
      initialMarginFraction: BigInt(0),
      initialMarginRequirement: BigInt(0),
    };
  }

  return calculateMaximumMakerOrderSizeForAvailableCollateral({
    availableCollateral:
      availableCollateral - desiredRemainingAvailableCollateral,
    limitPrice,
    initialMarginFractionOverride,
    leverageParameters,
  });
}

/**
 * @private
 */
function calculateInitialMarginFraction(
  leverageParameters: LeverageParametersBigInt,
  baseQuantity: bigint,
): bigint {
  const absPositionBalance = absBigInt(baseQuantity);
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
  baseQuantity: bigint;
  initialMarginFractionOverride: bigint | null;
  leverageParameters: LeverageParametersBigInt;
}): bigint {
  const { initialMarginFractionOverride, leverageParameters, baseQuantity } =
    args;

  return maxBigInt(
    calculateInitialMarginFraction(leverageParameters, baseQuantity),
    initialMarginFractionOverride ?? BigInt(0),
  );
}

/**
 * Determines the maximum maker order size that can be supported by the given
 * available collateral, taking into account the (incremental) margin
 * requirement for that order size. Returns both values in addition to the
 * initial margin fraction (margin requirement / order size).
 */
export function calculateMaximumMakerOrderSizeForAvailableCollateral(args: {
  availableCollateral: bigint;
  initialMarginFractionOverride: bigint | null;
  leverageParameters: LeverageParametersBigInt;
  limitPrice: bigint;
}): {
  baseQuantity: bigint;
  quoteQuantity: bigint;
  initialMarginFraction: bigint;
  initialMarginRequirement: bigint;
} {
  const {
    availableCollateral,
    initialMarginFractionOverride,
    leverageParameters,
    limitPrice,
  } = args;

  if (availableCollateral === BigInt(0)) {
    return {
      baseQuantity: BigInt(0),
      quoteQuantity: BigInt(0),
      initialMarginFraction: BigInt(0),
      initialMarginRequirement: BigInt(0),
    };
  }

  const baselineImf = maxBigInt(
    leverageParameters.initialMarginFraction,
    initialMarginFractionOverride ?? BigInt(0),
  );
  const baselineMaxPositionSizeMarginRequirement =
    (leverageParameters.basePositionSize * limitPrice * baselineImf) /
    oneInPips /
    oneInPips;

  if (availableCollateral <= baselineMaxPositionSizeMarginRequirement) {
    const baseQuantity =
      (leverageParameters.basePositionSize * availableCollateral) /
      baselineMaxPositionSizeMarginRequirement;

    return {
      baseQuantity,
      quoteQuantity: multiplyPips(baseQuantity, limitPrice),
      initialMarginFraction: baselineImf,
      initialMarginRequirement: availableCollateral,
    };
  }

  let currentMaxima: {
    baseQuantity: bigint;
    quoteQuantity: bigint;
    initialMarginFraction: bigint;
    initialMarginRequirement: bigint;
  } = {
    baseQuantity: leverageParameters.basePositionSize,
    quoteQuantity: multiplyPips(
      leverageParameters.basePositionSize,
      limitPrice,
    ),
    initialMarginFraction: baselineImf,
    initialMarginRequirement: baselineMaxPositionSizeMarginRequirement,
  };

  /*
   * Iterate through incremental position sizes and correlated incremental IMFs,
   * calculate the range of margin required for the min and max position sizes
   * at each level, and determine where the given amount of available collateral
   * falls.
   */
  for (
    let i = 1;
    leverageParameters.basePositionSize +
      leverageParameters.incrementalPositionSize * BigInt(i) <=
    leverageParameters.maximumPositionSize;
    i += 1
  ) {
    const currentImfLevel = maxBigInt(
      leverageParameters.initialMarginFraction +
        leverageParameters.incrementalInitialMarginFraction * BigInt(i),
      initialMarginFractionOverride ?? BigInt(0),
    );
    const fromOrderSize =
      leverageParameters.basePositionSize +
      leverageParameters.incrementalPositionSize * BigInt(i - 1) +
      BigInt(1);

    const toOrderSize =
      leverageParameters.basePositionSize +
      leverageParameters.incrementalPositionSize * BigInt(i);

    const fromMarginRequirement =
      (fromOrderSize * limitPrice * currentImfLevel) / oneInPips / oneInPips;

    const toMarginRequirement =
      (toOrderSize * limitPrice * currentImfLevel) / oneInPips / oneInPips;

    if (availableCollateral < fromMarginRequirement) {
      /*
       * The starting position size at the current IMF level exceeds the maximum
       * position size that the given available collateral can support; the
       * given available collateral can support only up to the maximum position
       * size of the previous IMF level.
       */
      return currentMaxima;
    }

    if (
      fromMarginRequirement <= availableCollateral &&
      availableCollateral <= toMarginRequirement
    ) {
      const baseQuantity =
        (toOrderSize * availableCollateral) / toMarginRequirement;

      return {
        baseQuantity,
        quoteQuantity: multiplyPips(baseQuantity, limitPrice),
        initialMarginFraction: currentImfLevel,
        initialMarginRequirement: availableCollateral,
      };
    }
    currentMaxima = {
      baseQuantity: toOrderSize,
      quoteQuantity: multiplyPips(toOrderSize, limitPrice),
      initialMarginFraction: currentImfLevel,
      initialMarginRequirement: toMarginRequirement,
    };
  }
  return currentMaxima;
}

/**
 * @private
 */
function calculateNotionalQuoteValueOfPosition(position: Position): bigint {
  return multiplyPips(position.quantity, position.indexPrice);
}

/**
 * @private
 */
function calculateNotionalQuoteValueOfPositions(positions: Position[]): bigint {
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
 * Converts a {@link IDEXPosition} object to one used by some functions in this
 * file.
 */
export function convertToPositionBigInt(position: IDEXPosition): Position {
  return {
    market: position.market,
    quantity: decimalToPip(position.quantity),
    indexPrice: decimalToPip(position.indexPrice),
    marginRequirement: decimalToPip(position.marginRequirement),
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
