import { BigNumber } from 'bignumber.js';

import {
  absBigInt,
  arraySumBigInt,
  decimalToPip,
  dividePips,
  maxBigInt,
  minBigInt,
  multiplyPips,
  oneInPips,
} from '#pipmath';

import { OrderSide } from '#types/enums/request';

import * as buySellPanelEstimateUtils from './buySellPanelEstimateUtils';
import * as leverage from './leverage';
import {
  isActiveStandingOrder,
  convertToActiveStandingOrderBigInt,
  convertToLeverageParametersBigInt,
  convertToPositionBigInt,
} from './types';

import type { L2OrderBook, OrderBookLevelL2 } from '#types/orderBook';
import type { IDEXMarket, IDEXPosition } from '#types/rest/endpoints/index';
import type {
  LeverageParameters,
  MakerAndTakerQuantities,
  PriceAndSize,
  StandingOrder,
} from './types';

export const asksTickRoundingMode = BigNumber.ROUND_UP;

export const bidsTickRoundingMode = BigNumber.ROUND_DOWN;

export const nullLevel: OrderBookLevelL2 = {
  price: BigInt(0),
  size: BigInt(0),
  numOrders: 0,
  type: 'limit',
};

export type CalculateBuySellPanelEstimateArgs = {
  formInputs: {
    limitPrice?: bigint;
    takerSide: OrderSide;
  } & /**
   * Either desiredTradeBaseQuantity, desiredTradeQuoteQuantity, or
   * sliderFactor needs to be provided.
   */ (
    | {
        /** The desired base position qty to be bought or sold (unsigned) */
        desiredTradeBaseQuantity: bigint;
        desiredTradeQuoteQuantity?: undefined;
        sliderFactor?: undefined;
      }
    | {
        desiredTradeBaseQuantity?: undefined;
        /** The desired quote position qty to be bought or sold (unsigned) */
        desiredTradeQuoteQuantity: bigint;
        sliderFactor?: undefined;
      }
    | {
        desiredTradeBaseQuantity?: undefined;
        desiredTradeQuoteQuantity?: undefined;
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
    /**
     * All the taker wallet's standing orders in the current market.
     * Orders in other markets are ignored.
     */
    standingOrders: StandingOrder[];
  };
};

/**
 * Determines the liquidity (expressed in the market's base asset) that can be
 * taken off the given order book (asks or bids) by trading either absolute
 * quantities (specified in base or quote) or a specified fraction of a wallet's
 * available collateral, and taking into account the margin requirement for the
 * newly acquired position balance. If a limit price is specified, any amount
 * that cannot be matched against the order book (e.g. limited by limit price)
 * is used to estimate the quantity that would be added to the book as a maker
 * order, taking into account the margin requirement for that maker order.
 *
 * Returns the estimated trade quantities (taker base and quote), the estimated
 * size of the maker order (maker base and quote), and the estimated decrease in
 * available collateral (cost). The trade (taker) quote quantity represents the
 * cost basis of the newly acquired position balance (i.e. the quote quantity
 * that is exchanged to acquire the position balance).
 *
 * All returned values are unsigned.
 *
 * The provided list of orders or price levels (asks or bids) is expected to be
 * sorted by best price (ascending for asks (lowest first), descending for bids
 * (highest first)). Multiple orders per price level are supported.
 */
export function calculateBuySellPanelEstimate(
  args: CalculateBuySellPanelEstimateArgs,
): MakerAndTakerQuantities & {
  /** The estimated decrease in available collateral (unsigned) */
  cost: bigint;
} {
  const {
    initialMarginFractionOverride,
    leverageParameters,
    makerSideOrders,
    market,
    wallet,
  } = args;
  const { limitPrice, takerSide, sliderFactor } = args.formInputs;
  let { desiredTradeBaseQuantity, desiredTradeQuoteQuantity } = args.formInputs;

  const undefinedQtyInputs = [
    desiredTradeBaseQuantity,
    desiredTradeQuoteQuantity,
    sliderFactor,
  ].filter((value) => typeof value === 'undefined');

  if (undefinedQtyInputs.length !== 2) {
    throw new Error(
      'Either desiredTradeBaseQuantity, desiredTradeQuoteQuantity, or sliderFactor needs to be provided',
    );
  }
  // Ensure the correct sign of desired position qtys
  if (typeof desiredTradeBaseQuantity !== 'undefined') {
    desiredTradeBaseQuantity =
      absBigInt(desiredTradeBaseQuantity) *
      BigInt(takerSide === 'buy' ? 1 : -1);
  }
  if (typeof desiredTradeQuoteQuantity !== 'undefined') {
    desiredTradeQuoteQuantity =
      absBigInt(desiredTradeQuoteQuantity) *
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

  const initialAvailableCollateral = leverage.calculateAvailableCollateral({
    ...args.wallet,
    positions: allWalletPositions,
  });

  if (
    initialAvailableCollateral <= BigInt(0) ||
    desiredTradeBaseQuantity === BigInt(0) ||
    desiredTradeQuoteQuantity === BigInt(0) ||
    sliderFactor === 0
  ) {
    return {
      makerBaseQuantity: BigInt(0),
      makerQuoteQuantity: BigInt(0),
      takerBaseQuantity: BigInt(0),
      takerQuoteQuantity: BigInt(0),
      cost: BigInt(0),
    };
  }

  /*
   * Slider calculations
   *
   * Don't limit the amount of available collateral to be spent if limiting by
   * desired trade qty.
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
    leverage.calculateNotionalQuoteValueOfPositions(otherPositions);
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
    if (desiredTradeBaseQuantity) {
      // Signed
      const remainingBaseQty = desiredTradeBaseQuantity - additionalPositionQty;

      return {
        makerBaseQuantity: remainingBaseQty,
        makerQuoteQuantity: multiplyPips(remainingBaseQty, limitPrice),
      };
    }
    if (desiredTradeQuoteQuantity) {
      // Signed
      const remainingQuoteQty =
        desiredTradeQuoteQuantity - additionalPositionCostBasis;

      return {
        makerBaseQuantity: dividePips(remainingQuoteQty, limitPrice),
        makerQuoteQuantity: remainingQuoteQty,
      };
    }
    const maxOrderSize = buySellPanelEstimateUtils.calculateMaxMakerOrderSize({
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

  const makeReturnValue = (
    makerAndTakerQtys: MakerAndTakerQuantities,
  ): MakerAndTakerQuantities & {
    cost: bigint;
  } => {
    return {
      makerBaseQuantity: absBigInt(makerAndTakerQtys.makerBaseQuantity),
      makerQuoteQuantity: absBigInt(makerAndTakerQtys.makerQuoteQuantity),
      takerBaseQuantity: absBigInt(makerAndTakerQtys.takerBaseQuantity),
      takerQuoteQuantity: absBigInt(makerAndTakerQtys.takerQuoteQuantity),
      cost: buySellPanelEstimateUtils.calculateCost({
        currentPosition,
        indexPrice,
        initialMarginFractionOverride,
        leverageParameters: leverageParametersBigInt,
        limitPrice,
        makerAndTakerQuantities: makerAndTakerQtys,
        market,
        orderSide: takerSide,
        walletsStandingOrders: wallet.standingOrders,
      }),
    };
  };

  for (const match of buySellPanelEstimateUtils.stepThroughMatchingLoopQuantities(
    {
      currentPosition,
      leverageParameters: leverageParametersBigInt,
      makerSideOrders,
      market,
      takerSide,
      walletsStandingOrders: wallet.standingOrders,
    },
  )) {
    if (
      !doOrdersMatch(
        { price: match.makerOrderPrice },
        { side: takerSide, limitPrice },
      )
    ) {
      return makeReturnValue({
        ...calculateMakerQtys(),
        takerBaseQuantity: additionalPositionQty,
        takerQuoteQuantity: additionalPositionCostBasis,
      });
    }
    // Signed
    const matchQtySigned =
      match.quantity * BigInt(takerSide === 'buy' ? 1 : -1);

    // Signed
    let maxTradeBaseQty = matchQtySigned;

    // Signed
    const runningPositionBalance =
      (currentPosition?.quantity ?? BigInt(0)) + additionalPositionQty;

    // Signed
    const quoteValueOfPosition2p = runningPositionBalance * indexPrice;

    const initialMarginFraction =
      leverage.calculateInitialMarginFractionWithOverride({
        baseQuantity: runningPositionBalance + matchQtySigned,
        initialMarginFractionOverride,
        leverageParameters: leverageParametersBigInt,
      });

    // Unsigned
    const initialMarginRequirementOfPosition2p = multiplyPips(
      absBigInt(quoteValueOfPosition2p),
      initialMarginFraction,
    );

    const isTradeOnLongSide =
      runningPositionBalance + matchQtySigned === BigInt(0) ?
        takerSide === 'sell' // True when closing a long position
        /*
         * The maker quantity is calculated so that a position does not switch
         * sides; a position can only switch sides if it is closed in one step
         * (iteration), and then reopened on the other side in the next
         * iteration.
         */
      : runningPositionBalance + matchQtySigned > BigInt(0);

    try {
      // Signed
      const maxTakerBaseQty =
        ((-quoteBalance2p -
          quoteValueOfPosition2p -
          quoteValueOfOtherPositions2p +
          heldCollateral2p +
          desiredRemainingAvailableCollateral2p +
          initialMarginRequirementOfPosition2p +
          initialMarginRequirementOfOtherPositions2p) *
          oneInPips) /
        (indexPrice2p -
          match.makerOrderPrice * oneInPips +
          BigInt(isTradeOnLongSide ? 1 : -1) *
            initialMarginFraction *
            (match.reducingStandingOrderPrice ?? BigInt(0)) +
          BigInt(isTradeOnLongSide ? -1 : 1) *
            initialMarginFraction *
            indexPrice);

      if (
        (takerSide === 'buy' && maxTakerBaseQty >= BigInt(0)) ||
        (takerSide === 'sell' && maxTakerBaseQty <= BigInt(0))
      ) {
        maxTradeBaseQty = maxTakerBaseQty;
      } else {
        /*
         * Max taker qty has the wrong sign. If available collateral increases
         * as a result of this trade (negative cost); take it all. Otherwise
         * (positive cost), the taker's buying power has been exceeded, and
         * matching can stop.
         */
        const tradeBaseQty = matchQtySigned;
        const tradeQuoteQty = multiplyPips(tradeBaseQty, match.makerOrderPrice);

        const cost = buySellPanelEstimateUtils.calculateCost({
          currentPosition,
          indexPrice,
          initialMarginFractionOverride,
          leverageParameters: leverageParametersBigInt,
          limitPrice,
          makerAndTakerQuantities: {
            makerBaseQuantity: BigInt(0),
            makerQuoteQuantity: BigInt(0),
            takerBaseQuantity: additionalPositionQty + tradeBaseQty,
            takerQuoteQuantity: additionalPositionCostBasis + tradeQuoteQty,
          },
          market,
          orderSide: takerSide,
          walletsStandingOrders: wallet.standingOrders,
        });

        if (cost > BigInt(0)) {
          return makeReturnValue({
            ...calculateMakerQtys(),
            takerBaseQuantity: additionalPositionQty,
            takerQuoteQuantity: additionalPositionCostBasis,
          });
        }
      }
    } catch (error) {
      // Division by zero. Indicates the whole maker qty can be taken.
    }

    if (desiredTradeBaseQuantity) {
      // Limit max base to desired trade qty and buying power
      maxTradeBaseQty =
        takerSide === 'buy' ?
          minBigInt(
            maxTradeBaseQty,
            desiredTradeBaseQuantity - additionalPositionQty,
          )
        : maxBigInt(
            maxTradeBaseQty,
            desiredTradeBaseQuantity - additionalPositionQty,
          );
    }

    // Signed
    let maxTradeQuoteQty = multiplyPips(maxTradeBaseQty, match.makerOrderPrice);

    if (desiredTradeQuoteQuantity) {
      // Limit max quote to desired trade qty and buying power
      const maxTakerQuoteQtyBefore = maxTradeQuoteQty;
      maxTradeQuoteQty =
        takerSide === 'buy' ?
          minBigInt(
            maxTradeQuoteQty,
            desiredTradeQuoteQuantity - additionalPositionCostBasis,
          )
        : maxBigInt(
            maxTradeQuoteQty,
            desiredTradeQuoteQuantity - additionalPositionCostBasis,
          );

      if (maxTradeQuoteQty !== maxTakerQuoteQtyBefore) {
        // Reduce base proportionally to reduction of quote
        maxTradeBaseQty =
          (maxTradeBaseQty * maxTradeQuoteQty) / maxTakerQuoteQtyBefore;
      }
    }

    if (absBigInt(maxTradeBaseQty) < match.quantity) {
      additionalPositionQty += maxTradeBaseQty;
      additionalPositionCostBasis += maxTradeQuoteQty;
      return makeReturnValue({
        makerBaseQuantity: BigInt(0),
        makerQuoteQuantity: BigInt(0),
        takerBaseQuantity: additionalPositionQty,
        takerQuoteQuantity: additionalPositionCostBasis,
      });
    }
    const tradeBaseQty = matchQtySigned;
    const tradeQuoteQty = multiplyPips(tradeBaseQty, match.makerOrderPrice);
    additionalPositionQty += tradeBaseQty;
    additionalPositionCostBasis += tradeQuoteQty;

    quoteBalance2p -= tradeBaseQty * match.makerOrderPrice;

    if (
      (desiredTradeBaseQuantity &&
        desiredTradeBaseQuantity === absBigInt(additionalPositionQty)) ||
      (desiredTradeQuoteQuantity &&
        desiredTradeQuoteQuantity === absBigInt(additionalPositionCostBasis))
    ) {
      return makeReturnValue({
        ...calculateMakerQtys(),
        takerBaseQuantity: additionalPositionQty,
        takerQuoteQuantity: additionalPositionCostBasis,
      });
    }
  }

  return makeReturnValue({
    ...calculateMakerQtys(),
    takerBaseQuantity: additionalPositionQty,
    takerQuoteQuantity: additionalPositionCostBasis,
  });
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
  makerOrder: { price: bigint },
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
  position: IDEXPosition;
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

  // On the same side as `orderSide`
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
