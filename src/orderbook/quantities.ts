import { BigNumber } from 'bignumber.js';

import {
  ROUNDING,
  absBigInt,
  decimalToPip,
  divideBigInt,
  maxBigInt,
  minBigInt,
  multiplyPips,
  oneInPips,
  dividePips,
  pipToDecimal,
} from '#pipmath';

import { OrderSide } from '#types/enums/request';

import type {
  L2OrderBook,
  OrderBookLevelL1,
  OrderBookLevelL2,
} from '#types/orderBook';
import type {
  KumaInitialMarginFractionOverride,
  KumaMarket,
  KumaOrder,
  KumaPosition,
  KumaWallet,
} from '#types/rest/endpoints/index';

export type LeverageParameters = Pick<
  KumaMarket,
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

/**
 * Standing orders
 */
export type StandingOrder = Pick<
  KumaOrder,
  'market' | 'side' | 'originalQuantity' | 'executedQuantity' | 'price'
>;
type ActiveStandingOrder = StandingOrder & { price: string };
type ActiveStandingOrderBigInt = Pick<ActiveStandingOrder, 'side'> & {
  openQuantity: bigint;
  price: bigint;
};

export function isActiveStandingOrder(
  order: StandingOrder,
): order is ActiveStandingOrder {
  return typeof order.price !== 'undefined';
}

export const asksTickRoundingMode = BigNumber.ROUND_UP;

export const bidsTickRoundingMode = BigNumber.ROUND_DOWN;

export const nullLevel: OrderBookLevelL2 = {
  price: BigInt(0),
  size: BigInt(0),
  numOrders: 0,
  type: 'limit',
};

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
 * Use {@link convertToLeverageParametersBigInt} to convert a {@link KumaMarket}
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

export function calculateMaximumInitialMarginFractionOverride(
  market: Pick<KumaMarket, 'market' | 'initialMarginFraction'>,
  wallet: Pick<KumaWallet, 'positions' | 'freeCollateral' | 'heldCollateral'>,
  walletInitialMarginFractionOverrides: KumaInitialMarginFractionOverride[],
) {
  const positionForMarket =
    wallet.positions &&
    wallet.positions.find((p) => p.market === market.market);

  let positionNotionalValue = 0n;
  if (positionForMarket) {
    const position = convertToPositionBigInt(positionForMarket);
    positionNotionalValue = multiplyPips(
      absBigInt(position.quantity),
      position.indexPrice,
    );
  }

  const effectiveInitialMarginFraction = decimalToPip(
    walletInitialMarginFractionOverrides.find(
      (imfo) => imfo.market === market.market,
    )?.initialMarginFractionOverride || market.initialMarginFraction,
  );
  const initialMarginRequirement = multiplyPips(
    positionNotionalValue,
    effectiveInitialMarginFraction,
  );

  const potentialHeldOrderValue = dividePips(
    decimalToPip(wallet.heldCollateral),
    effectiveInitialMarginFraction,
  );
  const potentialLeveragedValue =
    positionNotionalValue + potentialHeldOrderValue;
  const availableCollateralForLeverage =
    initialMarginRequirement + decimalToPip(wallet.freeCollateral);

  return pipToDecimal(
    potentialLeveragedValue === 0n ? oneInPips : (
      minBigInt(
        oneInPips,
        dividePips(availableCollateralForLeverage, potentialLeveragedValue),
      )
    ),
  );
}

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
 * Converts a {@link KumaPosition} object to one used by some functions in this
 * file.
 */
export function convertToPositionBigInt(position: KumaPosition): Position {
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
 * Reduce-only orders may only be on the books if their execution would in fact
 * result in a reduction of an open position. That is, if any of the wallet's
 * other standing orders would be matched and executed first and reduce the
 * position, any reduce-only liquidity newly added to the books may not exceed
 * the remaining size of the position.
 *
 * This function returns the size of the given open position minus the combined
 * size of all the wallet's standing orders on the other side of the book that
 * are priced better (higher for buys, lower for sells) or equal to the provided
 * limit price.
 */
export function determineMaximumReduceOnlyQuantityAvailableAtPriceLevel(args: {
  limitPrice: bigint;
  position: KumaPosition;
  orderSide: OrderSide;
  walletsStandingOrders: StandingOrder[];
}): bigint {
  const { limitPrice, position, orderSide, walletsStandingOrders } = args;

  const positionQty = decimalToPip(position.quantity);

  if (positionQty === BigInt(0)) {
    return BigInt(0);
  }
  if (
    (orderSide === OrderSide.buy && positionQty > BigInt(0)) ||
    (orderSide === OrderSide.sell && positionQty < BigInt(0))
  ) {
    // Order does not reduce position
    return BigInt(0);
  }

  const activeStandingOrdersOnSameSide = walletsStandingOrders
    .filter(
      (order) => order.market === position.market && order.side === orderSide,
    )
    .filter(isActiveStandingOrder)
    .map(convertToActiveStandingOrderBigInt);

  let betterPricedActiveQtyOnTheBooks = BigInt(0);
  for (const order of activeStandingOrdersOnSameSide) {
    if (
      (order.side === OrderSide.buy && order.price >= limitPrice) ||
      (order.side === OrderSide.sell && order.price <= limitPrice)
    ) {
      betterPricedActiveQtyOnTheBooks += order.openQuantity;
    }
  }
  return maxBigInt(
    absBigInt(positionQty) - betterPricedActiveQtyOnTheBooks,
    BigInt(0),
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
