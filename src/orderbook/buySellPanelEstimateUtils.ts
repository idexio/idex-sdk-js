/* eslint-disable no-continue */
/* eslint-disable no-labels */

import { absBigInt, sortBigIntArray } from '#pipmath';

import { OrderSide } from '#types/enums/request';

import {
  isActiveStandingOrder,
  convertToActiveStandingOrderBigInt,
} from './types';

import type { IDEXMarket } from '#types/rest/endpoints/index';
import type {
  LeverageParametersBigInt,
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
 * @private
 */
function determineReducingStandingOrders(args: {
  currentPosition?: Position;
  market: Pick<IDEXMarket, 'market'>;
  takerSide: OrderSide;
  walletsStandingOrders: StandingOrder[];
}): { price: bigint; quantity: bigint }[] {
  const { currentPosition, market, takerSide, walletsStandingOrders } = args;

  const standingOrderAmountsThatReduceCurrentPosition =
    determineStandingOrderAmountsThatReduceCurrentPosition({
      currentPosition,
      takerSide,
      walletsStandingOrders,
    });

  // On the other side of a newly acquired/opened position
  const standingOrdersThatReduceNewPosition = walletsStandingOrders
    .filter(
      (order) =>
        order.market === market.market &&
        order.side ===
          (takerSide === OrderSide.buy ? OrderSide.sell : OrderSide.buy),
    )
    .filter(isActiveStandingOrder)
    .map(convertToActiveStandingOrderBigInt);

  sortOrdersByBestPrice(standingOrdersThatReduceNewPosition);

  return [
    ...standingOrderAmountsThatReduceCurrentPosition,
    ...standingOrdersThatReduceNewPosition.map((order) => ({
      price: order.price,
      quantity: order.openQuantity,
    })),
  ];
}

/**
 * @private
 */
export function determineStandingOrderAmountsThatReduceCurrentPosition(args: {
  currentPosition?: Position;
  takerSide: OrderSide;
  walletsStandingOrders: StandingOrder[];
}): { price: bigint; quantity: bigint }[] {
  const { currentPosition: position, takerSide, walletsStandingOrders } = args;

  if (!position || position.quantity === BigInt(0)) {
    return [];
  }

  const isTradeReducingPosition =
    (position.quantity > BigInt(0) && takerSide === 'sell') ||
    (position.quantity < BigInt(0) && takerSide === 'buy');

  if (!isTradeReducingPosition) {
    return [];
  }

  // On the other side of the position
  const activeStandingOrdersOnOtherSide = walletsStandingOrders
    .filter(
      (order) =>
        order.market === position.market &&
        order.side ===
          (position.quantity > BigInt(0) ? OrderSide.sell : OrderSide.buy),
    )
    .filter(isActiveStandingOrder)
    .map(convertToActiveStandingOrderBigInt);

  sortOrdersByBestPrice(activeStandingOrdersOnOtherSide);

  if (activeStandingOrdersOnOtherSide.length === 0) {
    return [];
  }

  let remainingPositionSize = absBigInt(position.quantity);
  const reducingStandingOrders: { price: bigint; quantity: bigint }[] = [];

  for (const order of activeStandingOrdersOnOtherSide) {
    if (order.openQuantity >= remainingPositionSize) {
      reducingStandingOrders.push({
        price: order.price,
        quantity: remainingPositionSize,
      });
      return reducingStandingOrders;
    }
    reducingStandingOrders.push({
      price: order.price,
      quantity: order.openQuantity,
    });
    remainingPositionSize -= order.openQuantity;
  }
  return reducingStandingOrders;
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
