import {
  absBigInt,
  arraySumBigInt,
  divideBigInt,
  maxBigInt,
  multiplyPips,
  oneInPips,
  ROUNDING,
} from '#pipmath';

import type { LeverageParametersBigInt, Position } from './types';

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
 * @private
 */
function calculateInitialMarginFraction(
  leverageParameters: LeverageParametersBigInt,
  baseQuantity: bigint, // Signed
): bigint {
  const positionSize = absBigInt(baseQuantity);
  if (positionSize <= leverageParameters.basePositionSize) {
    return leverageParameters.initialMarginFraction;
  }
  return (
    leverageParameters.initialMarginFraction +
    divideBigInt(
      positionSize - leverageParameters.basePositionSize,
      leverageParameters.incrementalPositionSize,
      ROUNDING.RoundUp,
    ) *
      leverageParameters.incrementalInitialMarginFraction
  );
}

/**
 * Returns the initial margin fraction for a position or an order.
 *
 * Use {@link convertToLeverageParametersBigInt} to convert a {@link IDEXMarket}
 * or {@link LeverageParameters} object to {@link LeverageParametersBigInt}.
 */
export function calculateInitialMarginFractionWithOverride(args: {
  /** Signed */
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
 * Returns the initial margin requirement of a position.
 * The returned value is unsigned.
 *
 * @private
 */
export function calculateInitialMarginRequirementOfPosition(args: {
  indexPrice: bigint;
  initialMarginFractionOverride: bigint | null;
  leverageParameters: LeverageParametersBigInt;
  positionQty: bigint; // Signed
}): bigint {
  const {
    indexPrice,
    initialMarginFractionOverride,
    leverageParameters,
    positionQty,
  } = args;

  // Signed
  const quoteValueOfPosition = multiplyPips(positionQty, indexPrice);

  const initialMarginFraction = calculateInitialMarginFractionWithOverride({
    baseQuantity: positionQty,
    initialMarginFractionOverride,
    leverageParameters,
  });
  return multiplyPips(absBigInt(quoteValueOfPosition), initialMarginFraction);
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
export function calculateNotionalQuoteValueOfPositions(
  positions: Position[],
): bigint {
  return arraySumBigInt(positions.map(calculateNotionalQuoteValueOfPosition));
}
