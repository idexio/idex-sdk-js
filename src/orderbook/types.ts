import { decimalToPip } from '#pipmath';

import type { OrderBookLevelL1 } from '#types/orderBook';
import type { IDEXMarket, IDEXOrder } from '#types/rest/endpoints/index';

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
