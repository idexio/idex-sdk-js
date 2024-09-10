import { decimalToPip } from '#pipmath';

import type { OrderBookLevelL1 } from '#types/orderBook';
import type {
  IDEXMarket,
  IDEXOrder,
  IDEXPosition,
} from '#types/rest/endpoints/index';

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

/**
 * All values are signed
 */
export type MakerAndTakerQuantities = {
  makerBaseQuantity: bigint;
  makerQuoteQuantity: bigint;
  takerBaseQuantity: bigint;
  takerQuoteQuantity: bigint;
};

export type Position = {
  market: string;
  quantity: bigint;
  indexPrice: bigint;
  marginRequirement: bigint;
};

/**
 * Converts a {@link IDEXPosition} object to one used by some SDK functions.
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
 * Price and Size values form the {@link OrderBookLevelL1} type
 */
export type PriceAndSize = Pick<OrderBookLevelL1, 'price' | 'size'>;

/**
 * Standing orders
 */
export type StandingOrder = Pick<
  IDEXOrder,
  'market' | 'side' | 'originalQuantity' | 'executedQuantity' | 'price'
>;
export type ActiveStandingOrder = StandingOrder & { price: string };
export type ActiveStandingOrderBigInt = Pick<ActiveStandingOrder, 'side'> & {
  openQuantity: bigint;
  price: bigint;
};

/**
 * @private
 */
export function isActiveStandingOrder(
  order: StandingOrder,
): order is ActiveStandingOrder {
  return typeof order.price !== 'undefined';
}

/**
 * @private
 */
export function convertToActiveStandingOrderBigInt(
  order: ActiveStandingOrder,
): ActiveStandingOrderBigInt {
  return {
    ...order,
    openQuantity:
      decimalToPip(order.originalQuantity) -
      decimalToPip(order.executedQuantity),
    price: decimalToPip(order.price),
  };
}
