/* eslint-disable no-continue */
/* eslint-disable no-labels */

import {
  absBigInt,
  decimalToPip,
  maxBigInt,
  multiplyPips,
  oneInPips,
  sortBigIntArray,
} from '#pipmath';

import { OrderSide } from '#types/enums/request';

import * as leverage from './leverage';
import {
  isActiveStandingOrder,
  convertToActiveStandingOrderBigInt,
} from './types';

import type { IDEXMarket } from '#types/rest/endpoints/index';
import type {
  LeverageParametersBigInt,
  MakerAndTakerQuantities,
  Position,
  PriceAndSize,
  StandingOrder,
  ActiveStandingOrderBigInt,
} from './types';

export type MakerAndReducingStandingOrderQuantityAndPrices = {
  quantity: bigint;
  makerOrderPrice: bigint;
  reducingStandingOrderPrice: bigint | null;
};

/**
 * Iterates over all maker orders, the taker's reducing standing orders, and
 * incremental IMF brackets, and yields a value anytime either boundary is
 * crossed.
 *
 * @private
 */
export function* stepThroughMatchingLoopQuantities(args: {
  currentPosition?: Position;
  leverageParameters: LeverageParametersBigInt;
  makerSideOrders: Iterable<PriceAndSize>;
  market: Pick<IDEXMarket, 'market'>;
  takerSide: OrderSide;
  walletsStandingOrders: StandingOrder[];
}): Generator<MakerAndReducingStandingOrderQuantityAndPrices> {
  const { currentPosition, leverageParameters, takerSide } = args;

  const allImfThresholds = generateAllImfThresholds(
    leverageParameters,
    takerSide,
  );
  let runningPositionBalance = currentPosition?.quantity ?? BigInt(0);

  for (const qtyAndPrices of stepThroughMakerAndReducingStandingOrderQuantities(
    args,
  )) {
    const positionQtyAfter =
      takerSide === 'buy' ?
        runningPositionBalance + qtyAndPrices.quantity
      : runningPositionBalance - qtyAndPrices.quantity;

    const [min, max] =
      runningPositionBalance < positionQtyAfter ?
        [runningPositionBalance, positionQtyAfter]
      : [positionQtyAfter, runningPositionBalance];

    const positionSizes = allImfThresholds.filter(
      (threshold) => threshold > min && threshold < max,
    );
    positionSizes.push(min, max);

    if (positionSizes.length === 2) {
      // min and max are in the same IMF bracket
      yield qtyAndPrices;
    } else {
      sortBigIntArray(positionSizes);
      if (takerSide === 'sell') {
        // Sells traverse the position size thresholds right to left
        positionSizes.reverse();
      }
      // Return the distances between all position size thresholds
      const stepSizes = positionSizes
        .slice(1)
        .map((positionSize, index) =>
          absBigInt(positionSize - positionSizes[index]),
        );

      for (const stepSize of stepSizes) {
        yield { ...qtyAndPrices, quantity: stepSize };
      }
    }

    runningPositionBalance = positionQtyAfter;
  }
}

/**
 * Returns an ordered list of all position size thresholds at which the
 * incremental IMF changes. Sells traverse thresholds right to left, and
 * the returned thresholds are the last values at which a given IMF level
 * applies (lower end of a bracket for sells, upper end for buys).
 *
 * @private
 */
function generateAllImfThresholds(
  leverageParameters: LeverageParametersBigInt,
  takerSide: OrderSide,
): bigint[] {
  const allImfThresholds: bigint[] = [];
  for (
    let threshold = leverageParameters.basePositionSize;
    threshold <= leverageParameters.maximumPositionSize;
    threshold += leverageParameters.incrementalPositionSize
  ) {
    if (takerSide === 'buy') {
      allImfThresholds.unshift(-(threshold + BigInt(1)));
      allImfThresholds.push(threshold);
    } else {
      allImfThresholds.push(threshold + BigInt(1));
      allImfThresholds.unshift(-threshold);
    }
  }
  sortBigIntArray(allImfThresholds);

  return allImfThresholds;
}

/**
 * Iterates over all maker orders and the taker's reducing standing orders,
 * and yields a value anytime either boundary is crossed.
 *
 * @private
 */
export function* stepThroughMakerAndReducingStandingOrderQuantities(args: {
  currentPosition?: Position;
  makerSideOrders: Iterable<PriceAndSize>;
  market: Pick<IDEXMarket, 'market'>;
  takerSide: OrderSide;
  walletsStandingOrders: StandingOrder[];
}): Generator<MakerAndReducingStandingOrderQuantityAndPrices> {
  const {
    currentPosition,
    makerSideOrders,
    market,
    takerSide,
    walletsStandingOrders,
  } = args;

  let runningPositionBalance = currentPosition?.quantity ?? BigInt(0);
  const applyTradeQtyToPosition = (tradeQty: bigint): void => {
    if (takerSide === 'buy') {
      runningPositionBalance += tradeQty;
    } else {
      runningPositionBalance -= tradeQty;
    }
  };

  const reducingStandingOrders = determineReducingStandingOrders({
    currentPosition,
    market,
    takerSide,
    walletsStandingOrders,
  });

  let currentReducingStandingOrder: {
    price: bigint;
    quantity: bigint;
  } | null = null;

  makerOrderLoop: for (const makerOrder of makerSideOrders) {
    if (!currentReducingStandingOrder) {
      currentReducingStandingOrder = reducingStandingOrders.shift() ?? null;
    }
    if (!currentReducingStandingOrder) {
      /*
       * Reducing orders are present only while the position is open; thus,
       * it can switch sides only when no (further) reducing order is present.
       */
      for (const quantity of splitMakerQtyIfPositionSwitchesSides(
        makerOrder.size,
        runningPositionBalance,
        takerSide,
      )) {
        yield {
          quantity,
          makerOrderPrice: makerOrder.price,
          reducingStandingOrderPrice: null,
        };
        applyTradeQtyToPosition(quantity);
      }
      continue;
    }
    let remainingMakerOrderQty = makerOrder.size;
    /*
     * Iterate over all standing orders that are smaller than the (remaining)
     * maker order qty (if any)
     */
    while (remainingMakerOrderQty > currentReducingStandingOrder.quantity) {
      yield {
        quantity: currentReducingStandingOrder.quantity,
        makerOrderPrice: makerOrder.price,
        reducingStandingOrderPrice: currentReducingStandingOrder.price,
      };
      applyTradeQtyToPosition(currentReducingStandingOrder.quantity);

      remainingMakerOrderQty -= currentReducingStandingOrder.quantity;
      /*
       * If the next standing order is larger than the rest of the maker
       * order, this while loop terminates.
       */
      currentReducingStandingOrder = reducingStandingOrders.shift() ?? null;
      if (!currentReducingStandingOrder) {
        /*
         * Reducing orders are present only while the position is open; thus,
         * it can switch sides only when no (further) reducing order is present.
         */
        for (const quantity of splitMakerQtyIfPositionSwitchesSides(
          remainingMakerOrderQty,
          runningPositionBalance,
          takerSide,
        )) {
          yield {
            quantity,
            makerOrderPrice: makerOrder.price,
            reducingStandingOrderPrice: null,
          };
          applyTradeQtyToPosition(quantity);
        }
        continue makerOrderLoop;
      }
    }
    /*
     * The standing order is larger than (or equal to) the (remaining) maker
     * order qty
     */
    yield {
      quantity: remainingMakerOrderQty,
      makerOrderPrice: makerOrder.price,
      reducingStandingOrderPrice: currentReducingStandingOrder.price,
    };
    applyTradeQtyToPosition(remainingMakerOrderQty);

    currentReducingStandingOrder.quantity -= remainingMakerOrderQty;
    if (currentReducingStandingOrder.quantity === BigInt(0)) {
      currentReducingStandingOrder = null;
    }
    // Continue with next maker order
  }
}

/**
 * @private
 */
function splitMakerQtyIfPositionSwitchesSides(
  makerQty: bigint,
  takerPositionQty: bigint,
  takerSide: OrderSide,
): bigint[] {
  if (takerPositionQty === BigInt(0)) {
    return [makerQty];
  }
  const isReducing =
    (takerPositionQty > BigInt(0) && takerSide === OrderSide.sell) ||
    (takerPositionQty < BigInt(0) && takerSide === OrderSide.buy);

  const positionSize = absBigInt(takerPositionQty);
  if (isReducing && makerQty > positionSize) {
    // Position switches sides, break it up into two steps
    return [positionSize, makerQty - positionSize];
  }
  return [makerQty];
}

/**
 * Based on the current position balance, specific ones of the wallet's standing
 * orders reduce the current position.
 * As {@link stepThroughMakerAndReducingStandingOrderQuantities} simulates
 * trades against maker orders, those conditions change: More orders may become
 * reducing ones as the position size increases (and vice versa). If a position
 * is decreased far enough that it is closed and reopened on the other side,
 * standing orders on the other side become reducing.
 * This function returns a list of all those orders that are or become reducing
 * as the matching loop simulates trades against maker orders.
 *
 * @private
 */
function determineReducingStandingOrders(args: {
  currentPosition?: Position;
  market: Pick<IDEXMarket, 'market'>;
  takerSide: OrderSide;
  walletsStandingOrders: StandingOrder[];
}): { price: bigint; quantity: bigint }[] {
  const { currentPosition, market, takerSide, walletsStandingOrders } = args;

  const pickAndSortOrders = (side: OrderSide): ActiveStandingOrderBigInt[] => {
    const orders = walletsStandingOrders
      .filter((order) => order.market === market.market && order.side === side)
      .filter(isActiveStandingOrder)
      .map(convertToActiveStandingOrderBigInt);

    sortOrdersByBestPrice(orders);

    return orders;
  };

  const ordersOnOtherSideOfNewlyOpenedPosition = pickAndSortOrders(
    takerSide === OrderSide.buy ? OrderSide.sell : OrderSide.buy,
  ).map((order) => ({
    price: order.price,
    quantity: order.openQuantity,
  }));

  if (!currentPosition || currentPosition.quantity === BigInt(0)) {
    return ordersOnOtherSideOfNewlyOpenedPosition;
  }

  const ordersOnOtherSideOfCurrentPosition = pickAndSortOrders(
    currentPosition.quantity > BigInt(0) ? OrderSide.sell : OrderSide.buy,
  );

  const isReducingCurrentPosition =
    (currentPosition.quantity > BigInt(0) && takerSide === 'sell') ||
    (currentPosition.quantity < BigInt(0) && takerSide === 'buy');

  if (isReducingCurrentPosition) {
    const ordersThatReduceCurrentPosition = pickOrdersUpToPositionSize(
      ordersOnOtherSideOfCurrentPosition,
      currentPosition,
    );
    return [
      ...ordersThatReduceCurrentPosition,
      ...ordersOnOtherSideOfNewlyOpenedPosition,
    ];
  }
  return pickOrdersAbovePositionSize(
    ordersOnOtherSideOfCurrentPosition,
    currentPosition,
  );
}

/**
 * @private
 */
function pickOrdersUpToPositionSize(
  /** Must be sorted by best price */
  activeStandingOrders: ActiveStandingOrderBigInt[],
  position: Position,
): { price: bigint; quantity: bigint }[] {
  if (position.quantity === BigInt(0)) {
    return [];
  }
  let remainingPositionSize = absBigInt(position.quantity);
  const orders: { price: bigint; quantity: bigint }[] = [];

  for (const order of activeStandingOrders) {
    if (order.openQuantity >= remainingPositionSize) {
      orders.push({
        price: order.price,
        quantity: remainingPositionSize,
      });
      return orders;
    }
    orders.push({
      price: order.price,
      quantity: order.openQuantity,
    });
    remainingPositionSize -= order.openQuantity;
  }
  return orders;
}

/**
 * @private
 */
function pickOrdersAbovePositionSize(
  /** Must be sorted by best price */
  activeStandingOrders: ActiveStandingOrderBigInt[],
  position: Position,
): { price: bigint; quantity: bigint }[] {
  if (position.quantity === BigInt(0)) {
    return activeStandingOrders.map((order) => ({
      price: order.price,
      quantity: order.openQuantity,
    }));
  }
  const positionSize = absBigInt(position.quantity);
  let runningTotalBelowPositionSize = BigInt(0);

  for (const [index, order] of activeStandingOrders.entries()) {
    if (runningTotalBelowPositionSize + order.openQuantity > positionSize) {
      const orderQtyAbovePositionSize =
        runningTotalBelowPositionSize + order.openQuantity - positionSize;
      return [
        {
          price: order.price,
          quantity: orderQtyAbovePositionSize,
        },
        ...activeStandingOrders.slice(index + 1).map((_order) => ({
          price: _order.price,
          quantity: _order.openQuantity,
        })),
      ];
    }
    runningTotalBelowPositionSize += order.openQuantity;
  }
  return [];
}

/**
 * @private
 */
export function sortOrdersByBestPrice(
  buyOrSellOrders: ActiveStandingOrderBigInt[],
): void {
  buyOrSellOrders.sort(sortOrdersByBestPriceCompareFunction);
}

/**
 * @private
 */
function sortOrdersByBestPriceCompareFunction(
  orderA: ActiveStandingOrderBigInt,
  orderB: ActiveStandingOrderBigInt,
): number {
  if (orderA.side !== orderB.side) {
    // Orders are on different sides
    return orderA.side === OrderSide.buy ? -1 : 1; // Buys go to the top
  }
  if (orderA.price > orderB.price) {
    return orderA.side === OrderSide.buy ? -1 : 1; // Higher buy price = better price
  }
  if (orderA.price < orderB.price) {
    return orderA.side === OrderSide.sell ? -1 : 1; // Lower sell price = better price
  }
  return 0; // Same price
}

/**
 * @private
 */
export function calculateMaxMakerOrderSize(args: {
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

  // Unsigned
  const initialMarginRequirementOfPosition =
    leverage.calculateInitialMarginRequirementOfPosition({
      indexPrice,
      initialMarginFractionOverride,
      leverageParameters,
      positionQty: newPositionBalance,
    });

  const availableCollateral = leverage.calculateAvailableCollateral({
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

  return leverage.calculateMaximumMakerOrderSizeForAvailableCollateral({
    availableCollateral:
      availableCollateral - desiredRemainingAvailableCollateral,
    limitPrice,
    initialMarginFractionOverride,
    leverageParameters,
  });
}

/**
 * Returns the estimated decrease in available collateral.
 * The returned value is unsigned.
 *
 * @private
 */
export function calculateCost(args: {
  currentPosition?: Position;
  indexPrice: bigint;
  initialMarginFractionOverride: bigint | null;
  leverageParameters: LeverageParametersBigInt;
  limitPrice?: bigint;
  makerAndTakerQuantities: MakerAndTakerQuantities;
  market: Pick<IDEXMarket, 'market'>;
  orderSide: OrderSide;
  walletsStandingOrders: StandingOrder[];
}): bigint {
  const {
    currentPosition,
    indexPrice,
    initialMarginFractionOverride,
    leverageParameters,
    limitPrice,
    market,
    orderSide,
    walletsStandingOrders,
  } = args;

  const { makerBaseQuantity, takerBaseQuantity, takerQuoteQuantity } =
    args.makerAndTakerQuantities;

  if (makerBaseQuantity === BigInt(0) && takerBaseQuantity === BigInt(0)) {
    return BigInt(0);
  }

  const imf = (baseQuantity: bigint) =>
    leverage.calculateInitialMarginFractionWithOverride({
      baseQuantity,
      initialMarginFractionOverride,
      leverageParameters,
    });

  const currentPositionQty = currentPosition?.quantity ?? BigInt(0);
  const newPositionQty = currentPositionQty + takerBaseQuantity;

  const deltaStandingOrdersImr =
    calculateChangeInMarginRequirementForStandingOrdersInMarket({
      initialMarginFractionOverride,
      leverageParameters,
      market,
      newMakerOrder:
        limitPrice && makerBaseQuantity !== BigInt(0) ?
          {
            side: orderSide,
            quantity: absBigInt(makerBaseQuantity),
            limitPrice,
          }
        : null,
      positionQtyBefore: currentPositionQty,
      positionQtyAfter: newPositionQty,
      walletsStandingOrders,
    });

  const deltaPositionImr3p =
    imf(newPositionQty) * absBigInt(newPositionQty) * indexPrice -
    imf(currentPositionQty) * absBigInt(currentPositionQty) * indexPrice;

  const deltaPositionImr = deltaPositionImr3p / oneInPips / oneInPips;

  const deltaEquity =
    -takerQuoteQuantity + multiplyPips(indexPrice, takerBaseQuantity);

  return maxBigInt(
    deltaStandingOrdersImr + deltaPositionImr - deltaEquity,
    BigInt(0),
  );
}

/**
 * Returns the estimated change in margin requirement for standing orders in the
 * given market.
 * The returned value is signed.
 *
 * @private
 */
function calculateChangeInMarginRequirementForStandingOrdersInMarket(args: {
  initialMarginFractionOverride: bigint | null;
  leverageParameters: LeverageParametersBigInt;
  market: Pick<IDEXMarket, 'market'>;
  newMakerOrder: {
    side: OrderSide;
    quantity: bigint;
    limitPrice: bigint;
  } | null;
  positionQtyBefore: bigint; // Signed
  positionQtyAfter: bigint; // Signed
  walletsStandingOrders: StandingOrder[];
}): bigint {
  const {
    initialMarginFractionOverride,
    leverageParameters,
    market,
    newMakerOrder,
    positionQtyBefore,
    positionQtyAfter,
    walletsStandingOrders,
  } = args;

  const activeStandingOrders = walletsStandingOrders
    .filter((order) => order.market === market.market)
    .filter(isActiveStandingOrder)
    .map(convertToActiveStandingOrderBigInt);

  const imrBefore = calculateMarginRequirementForStandingOrdersInMarket({
    initialMarginFractionOverride,
    leverageParameters,
    orders: activeStandingOrders,
    positionQty: positionQtyBefore,
  });

  if (newMakerOrder) {
    activeStandingOrders.push({
      side: newMakerOrder.side,
      openQuantity: newMakerOrder.quantity,
      price: newMakerOrder.limitPrice,
    });
  }
  const imrAfter = calculateMarginRequirementForStandingOrdersInMarket({
    initialMarginFractionOverride,
    leverageParameters,
    orders: activeStandingOrders,
    positionQty: positionQtyAfter,
  });

  return imrAfter - imrBefore;
}

/**
 * @private
 */
function calculateMarginRequirementForStandingOrdersInMarket(args: {
  initialMarginFractionOverride: bigint | null;
  leverageParameters: LeverageParametersBigInt;
  orders: ActiveStandingOrderBigInt[];
  positionQty: bigint; // Signed
}): bigint {
  const {
    initialMarginFractionOverride,
    leverageParameters,
    orders,
    positionQty,
  } = args;

  if (orders.length === 0) {
    return BigInt(0);
  }
  sortOrdersByBestPrice(orders);

  let offsetPositionQty = positionQty;

  let marginRequirement = BigInt(0);
  for (const order of orders) {
    let orderOpenBaseQty = order.openQuantity;

    if (
      (offsetPositionQty > BigInt(0) && order.side === OrderSide.sell) ||
      (offsetPositionQty < BigInt(0) && order.side === OrderSide.buy)
    ) {
      if (orderOpenBaseQty > absBigInt(offsetPositionQty)) {
        // Order offsets (remaining) position qty
        orderOpenBaseQty -= absBigInt(offsetPositionQty);
        offsetPositionQty = BigInt(0);
      } else {
        // Order qty is lower than (remaining) position qty
        if (offsetPositionQty > BigInt(0)) {
          offsetPositionQty -= orderOpenBaseQty;
        } else {
          offsetPositionQty += orderOpenBaseQty;
        }
        orderOpenBaseQty = BigInt(0);
      }
    }

    if (orderOpenBaseQty > BigInt(0)) {
      marginRequirement += multiplyPips(
        multiplyPips(orderOpenBaseQty, order.price),
        leverage.calculateInitialMarginFractionWithOverride({
          baseQuantity: orderOpenBaseQty,
          initialMarginFractionOverride,
          leverageParameters,
        }),
      );
    }
  }
  return marginRequirement;
}
