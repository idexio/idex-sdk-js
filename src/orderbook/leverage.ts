import {
  ROUNDING,
  absBigInt,
  decimalToPip,
  divideBigInt,
  maxBigInt,
} from '#pipmath';

import type { IDEXMarket } from '#types/rest/endpoints/index';

export type LeverageParameters = Pick<
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
 * @private
 */
function calculateInitialMarginFraction(
  leverageParameters: LeverageParametersBigInt,
  baseQuantity: bigint, // Signed
): bigint {
  const absPositionQty = absBigInt(baseQuantity);
  if (absPositionQty <= leverageParameters.basePositionSize) {
    return leverageParameters.initialMarginFraction;
  }
  return (
    leverageParameters.initialMarginFraction +
    divideBigInt(
      absPositionQty - leverageParameters.basePositionSize,
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

export function convertToLeverageParametersBigInt(
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
