import * as chai from 'chai';

import { decimalToPip } from '#pipmath';

import { stepThroughMatchingLoopQuantities } from '#orderbook/buySellPanelEstimateUtils';

import type { MakerAndReducingStandingOrderQuantityAndPrices } from '#orderbook/buySellPanelEstimateUtils';
import type * as orderbook from '#orderbook/index';
import type { OrderSide } from '#types/enums/request';

const { expect } = chai;

const defaultLeverageParameters: orderbook.LeverageParametersBigInt = {
  initialMarginFraction: decimalToPip('0.03'),
  incrementalInitialMarginFraction: decimalToPip('0.01'),

  basePositionSize: decimalToPip('10'),
  incrementalPositionSize: decimalToPip('1'),
  maximumPositionSize: decimalToPip('100'),

  maintenanceMarginFraction: decimalToPip('0.01'), // Unused
};

const fooMarketSymbol = 'FOO-USD';

function makeAPosition(quantity: string): orderbook.Position {
  return {
    market: fooMarketSymbol,
    quantity: decimalToPip(quantity),
    indexPrice: BigInt(123),
    marginRequirement: BigInt(123),
  };
}

function assertNext(
  generator: ReturnType<typeof stepThroughMatchingLoopQuantities>,
  expectedValue: MakerAndReducingStandingOrderQuantityAndPrices | undefined,
): void {
  expect(generator.next().value).to.eql(expectedValue);
}

describe('orderbook/buySellPanelEstimateUtils', () => {
  describe('stepThroughMatchingLoopQuantities', () => {
    const runSameBracketScenario = (takerSide: 'buy' | 'sell') => {
      const generator = stepThroughMatchingLoopQuantities({
        leverageParameters: defaultLeverageParameters,
        makerSideOrders: [
          { price: decimalToPip('123'), size: decimalToPip('2') },
        ],
        market: { market: fooMarketSymbol },
        takerSide,
        walletsStandingOrders: [],
      });
      assertNext(generator, {
        quantity: decimalToPip('2'),
        makerOrderPrice: decimalToPip('123'),
        reducingStandingOrderPrice: null,
      });
      assertNext(generator, undefined);
    };

    it('should not split up a step within a single IMF bracket (no open position) (buy)', () =>
      runSameBracketScenario('buy'));

    it('should not split up a step within a single IMF bracket (no open position) (sell)', () =>
      runSameBracketScenario('sell'));

    const runSameBracketWithOpenPositionScenario = (
      shortOrLong: 'short' | 'long',
      takerSide: OrderSide,
    ) => {
      const generator = stepThroughMatchingLoopQuantities({
        currentPosition: makeAPosition(shortOrLong === 'long' ? '11' : '-11'),
        leverageParameters: defaultLeverageParameters,
        makerSideOrders: [
          { price: decimalToPip('123'), size: decimalToPip('0.1') },
        ],
        market: { market: fooMarketSymbol },
        takerSide,
        walletsStandingOrders: [],
      });
      assertNext(generator, {
        quantity: decimalToPip('0.1'),
        makerOrderPrice: decimalToPip('123'),
        reducingStandingOrderPrice: null,
      });
      assertNext(generator, undefined);
    };

    it('should not split up a step within a single IMF bracket (open long position) (buy)', () =>
      runSameBracketWithOpenPositionScenario('long', 'buy'));

    it('should not split up a step within a single IMF bracket (open long position) (sell)', () =>
      runSameBracketWithOpenPositionScenario('long', 'sell'));

    it('should not split up a step within a single IMF bracket (open short position) (buy)', () =>
      runSameBracketWithOpenPositionScenario('short', 'buy'));

    it('should not split up a step within a single IMF bracket (open short position) (sell)', () =>
      runSameBracketWithOpenPositionScenario('short', 'sell'));

    const runMultipleBracketsScenario = (takerSide: OrderSide) => {
      const generator = stepThroughMatchingLoopQuantities({
        leverageParameters: defaultLeverageParameters,
        makerSideOrders: [
          { price: decimalToPip('123'), size: decimalToPip('12') },
        ],
        market: { market: fooMarketSymbol },
        takerSide,
        walletsStandingOrders: [],
      });
      assertNext(generator, {
        quantity: decimalToPip('10'),
        makerOrderPrice: decimalToPip('123'),
        reducingStandingOrderPrice: null,
      });
      assertNext(generator, {
        quantity: decimalToPip('1'),
        makerOrderPrice: decimalToPip('123'),
        reducingStandingOrderPrice: null,
      });
      assertNext(generator, {
        quantity: decimalToPip('1'),
        makerOrderPrice: decimalToPip('123'),
        reducingStandingOrderPrice: null,
      });
      assertNext(generator, undefined);
    };

    it('should step through multiple IMF brackets (buy)', () =>
      runMultipleBracketsScenario('buy'));

    it('should step through multiple IMF brackets (sell)', () =>
      runMultipleBracketsScenario('sell'));

    const runMultipleBracketsIncreasingPositionSizeScenario = (
      shortOrLong: 'short' | 'long',
    ) => {
      const generator = stepThroughMatchingLoopQuantities({
        currentPosition: makeAPosition(shortOrLong === 'long' ? '11' : '-11'),
        leverageParameters: defaultLeverageParameters,
        makerSideOrders: [
          { price: decimalToPip('123'), size: decimalToPip('2') },
        ],
        market: { market: fooMarketSymbol },
        takerSide: shortOrLong === 'long' ? 'buy' : 'sell',
        walletsStandingOrders: [],
      });
      assertNext(generator, {
        quantity: decimalToPip('1'),
        makerOrderPrice: decimalToPip('123'),
        reducingStandingOrderPrice: null,
      });
      assertNext(generator, {
        quantity: decimalToPip('1'),
        makerOrderPrice: decimalToPip('123'),
        reducingStandingOrderPrice: null,
      });
      assertNext(generator, undefined);
    };

    it('should step through multiple IMF brackets (increasing buy)', () =>
      runMultipleBracketsIncreasingPositionSizeScenario('long'));

    it('should step through multiple IMF brackets (increasing  sell)', () =>
      runMultipleBracketsIncreasingPositionSizeScenario('short'));

    const runMultipleBracketsSwitchSidesScenario = (
      shortOrLong: 'short' | 'long',
    ) => {
      const generator = stepThroughMatchingLoopQuantities({
        currentPosition: makeAPosition(shortOrLong === 'long' ? '11' : '-11'),
        leverageParameters: defaultLeverageParameters,
        makerSideOrders: [
          { price: decimalToPip('123'), size: decimalToPip('22') },
        ],
        market: { market: fooMarketSymbol },
        takerSide: shortOrLong === 'long' ? 'sell' : 'buy',
        walletsStandingOrders: [],
      });
      /*
       * The steps are to the last values at which the given IMF applies
       */
      assertNext(generator, {
        // Up to -10.00000001 (buy)/down to 10.00000001 (sell): 4% IMF
        quantity: decimalToPip('0.99999999'),
        makerOrderPrice: decimalToPip('123'),
        reducingStandingOrderPrice: null,
      });
      assertNext(generator, {
        // Up/down to 0: 3% IMF
        quantity: decimalToPip('10.00000001'),
        makerOrderPrice: decimalToPip('123'),
        reducingStandingOrderPrice: null,
      });
      // Position switches sides
      assertNext(generator, {
        // Up to 10 (buy)/down to -10 (sell): 3% IMF
        quantity: decimalToPip('10'),
        makerOrderPrice: decimalToPip('123'),
        reducingStandingOrderPrice: null,
      });
      assertNext(generator, {
        // Up to 11 (buy)/down to -11 (sell): 4% IMF
        quantity: decimalToPip('1'),
        makerOrderPrice: decimalToPip('123'),
        reducingStandingOrderPrice: null,
      });
      assertNext(generator, undefined);
    };

    it('should step through multiple IMF brackets when a position switches sides (long/sell)', () =>
      runMultipleBracketsSwitchSidesScenario('long'));

    it('should step through multiple IMF brackets when a position switches sides (short/buy)', () =>
      runMultipleBracketsSwitchSidesScenario('short'));
  });
});
