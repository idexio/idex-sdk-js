import * as chai from 'chai';

import {
  absBigInt,
  decimalToPip,
  multiplyPips,
  oneInPips,
  pipToDecimal,
} from '#pipmath';

import * as orderbook from '#orderbook/index';

import type { IDEXMarket, IDEXPosition } from '#types/rest/endpoints/index';

type ReturnValue = ReturnType<typeof orderbook.calculateBuySellPanelEstimate>;

const { expect } = chai;

const defaultLeverageParameters: orderbook.LeverageParametersBigInt = {
  initialMarginFraction: decimalToPip('0.03'),
  incrementalInitialMarginFraction: decimalToPip('0.01'),
  basePositionSize: decimalToPip('10000'),
  incrementalPositionSize: decimalToPip('10000'),
  maximumPositionSize: decimalToPip('100000'), // Unused
  maintenanceMarginFraction: decimalToPip('0.01'), // Unused
};

function makeAMarket(
  indexPrice: bigint,
  baseAssetSymbol = 'FOO',
  leverageParameters: orderbook.LeverageParametersBigInt = defaultLeverageParameters,
): IDEXMarket {
  // All empty values are not used by the functions under test
  return {
    market: `${baseAssetSymbol}-USD`,
    type: 'perpetual',
    status: 'active',
    baseAsset: baseAssetSymbol,
    quoteAsset: 'USD',
    stepSize: '',
    tickSize: '',
    indexPrice: pipToDecimal(indexPrice),
    indexPrice24h: '',
    indexPricePercentChange: '',
    lastFundingRate: null,
    currentFundingRate: null,
    nextFundingTime: 0,
    makerOrderMinimum: '',
    takerOrderMinimum: '',
    marketOrderExecutionPriceLimit: '',
    limitOrderExecutionPriceLimit: '',
    minimumPositionSize: '',

    maximumPositionSize: pipToDecimal(leverageParameters.maximumPositionSize),
    initialMarginFraction: pipToDecimal(
      leverageParameters.initialMarginFraction,
    ),
    maintenanceMarginFraction: pipToDecimal(
      leverageParameters.maintenanceMarginFraction,
    ),
    basePositionSize: pipToDecimal(leverageParameters.basePositionSize),
    incrementalPositionSize: pipToDecimal(
      leverageParameters.incrementalPositionSize,
    ),
    incrementalInitialMarginFraction: pipToDecimal(
      leverageParameters.incrementalInitialMarginFraction,
    ),

    makerFeeRate: '',
    takerFeeRate: '',
    volume24h: '',
    trades24h: 0,
    openInterest: '',
  };
}

function makeAPosition(props: {
  market: IDEXMarket;
  quantity: bigint;
  initialMarginRequirement: bigint;
}): IDEXPosition {
  // All empty values are not used by the functions under test
  return {
    market: props.market.market,
    quantity: pipToDecimal(props.quantity),
    maximumQuantity: '',
    entryPrice: '',
    exitPrice: '',
    markPrice: '',
    indexPrice: props.market.indexPrice,
    liquidationPrice: '',
    value: '',
    realizedPnL: '',
    unrealizedPnL: '',
    marginRequirement: pipToDecimal(props.initialMarginRequirement),
    leverage: '',
    totalFunding: '',
    totalOpen: '',
    totalClose: '',
    adlQuintile: 0,
    openedByFillId: '',
    lastFillId: '',
    time: 0,
  };
}

/**
 * Sets up an account with:
 * - 25 account value (10 quote balance + 15 quote value of a position in
 *   another market)
 * - 10 available collateral (25 account value - 5 initial margin requirement
 *   of position in another market - 10 held collateral)
 */
function setUpStandardTestAccount(): {
  market: IDEXMarket;
  positionInAnotherMarket: IDEXPosition;
  heldCollateral: bigint;
  quoteBalance: bigint;
} {
  const market = makeAMarket(decimalToPip('0.01'), 'FOO');

  const otherMarket = makeAMarket(decimalToPip('1'), 'BAR');
  const positionInAnotherMarket = makeAPosition({
    market: otherMarket,
    quantity: decimalToPip('15'), // Worth 15 USD
    initialMarginRequirement: decimalToPip('5'),
  });

  return {
    market,
    positionInAnotherMarket,
    heldCollateral: decimalToPip('10'),
    quoteBalance: decimalToPip('10'),
  };
}

const standardTestOrderBookSellSide: orderbook.PriceAndSize[] = [
  { price: decimalToPip('0.011'), size: decimalToPip('1000') },
  { price: decimalToPip('0.012'), size: decimalToPip('1000') },
  { price: decimalToPip('0.013'), size: decimalToPip('1000') },
  { price: decimalToPip('0.014'), size: decimalToPip('1000') },
];

const standardTestOrderBookBuySide: orderbook.PriceAndSize[] = [
  { price: decimalToPip('0.009'), size: decimalToPip('1000') },
  { price: decimalToPip('0.008'), size: decimalToPip('1000') },
  { price: decimalToPip('0.007'), size: decimalToPip('1000') },
  { price: decimalToPip('0.006'), size: decimalToPip('1000') },
];

describe('orderbook/quantities', () => {
  describe('calculateBuySellPanelEstimate', () => {
    it('should succeed for a buy', () => {
      const { market, positionInAnotherMarket, heldCollateral, quoteBalance } =
        setUpStandardTestAccount();

      expect(
        orderbook.calculateBuySellPanelEstimate({
          formInputs: {
            isReduceOnly: false,
            takerSide: 'buy',
            sliderFactor: 0.97,
          },
          initialMarginFractionOverride: null,
          leverageParameters: market,
          makerSideOrders: standardTestOrderBookSellSide,
          market,
          wallet: {
            heldCollateral,
            positions: [positionInAnotherMarket],
            quoteBalance,
          },
        }),
      ).to.eql({
        makerBaseQuantity: BigInt(0),
        makerQuoteQuantity: BigInt(0),

        takerBaseQuantity: decimalToPip('3651.16279069'),
        takerQuoteQuantity: decimalToPip('45.11627906'),

        cost: decimalToPip('9.69999999'),
      } satisfies ReturnValue);
    });

    it('should succeed for a sell', () => {
      const { market, positionInAnotherMarket, heldCollateral, quoteBalance } =
        setUpStandardTestAccount();

      expect(
        orderbook.calculateBuySellPanelEstimate({
          formInputs: {
            isReduceOnly: false,
            takerSide: 'sell',
            sliderFactor: 0.97,
          },
          initialMarginFractionOverride: null,
          leverageParameters: market,
          makerSideOrders: standardTestOrderBookBuySide,
          market,
          wallet: {
            heldCollateral,
            positions: [positionInAnotherMarket],
            quoteBalance,
          },
        }),
      ).to.eql({
        makerBaseQuantity: BigInt(0),
        makerQuoteQuantity: BigInt(0),

        takerBaseQuantity: decimalToPip('3651.16279069'),
        takerQuoteQuantity: decimalToPip('27.90697674'),

        cost: decimalToPip('9.69999999'),
      } satisfies ReturnValue);
    });

    it('should succeed for a buy with a limit price', () => {
      const { market, positionInAnotherMarket, heldCollateral, quoteBalance } =
        setUpStandardTestAccount();

      expect(
        orderbook.calculateBuySellPanelEstimate({
          formInputs: {
            isReduceOnly: false,
            limitPrice: decimalToPip('0.012'),
            takerSide: 'buy',
            sliderFactor: 0.97,
          },
          initialMarginFractionOverride: null,
          leverageParameters: market,
          makerSideOrders: standardTestOrderBookSellSide,
          market,
          wallet: {
            heldCollateral,
            positions: [positionInAnotherMarket],
            quoteBalance,
          },
        }),
      ).to.eql({
        takerBaseQuantity: decimalToPip('2000'),
        takerQuoteQuantity: decimalToPip('23'),

        // Maker qtys are incidental and not covered by this test
        makerBaseQuantity: decimalToPip('12708.33333333'),
        makerQuoteQuantity: decimalToPip('152.49999999'),

        cost: decimalToPip('9.69999999'),
      } satisfies ReturnValue);
    });

    it('should succeed for a sell with a limit price', () => {
      const { market, positionInAnotherMarket, heldCollateral, quoteBalance } =
        setUpStandardTestAccount();

      expect(
        orderbook.calculateBuySellPanelEstimate({
          formInputs: {
            isReduceOnly: false,
            limitPrice: decimalToPip('0.008'),
            takerSide: 'sell',
            sliderFactor: 0.97,
          },
          initialMarginFractionOverride: null,
          leverageParameters: market,
          makerSideOrders: standardTestOrderBookBuySide,
          market,
          wallet: {
            heldCollateral,
            positions: [positionInAnotherMarket],
            quoteBalance,
          },
        }),
      ).to.eql({
        takerBaseQuantity: decimalToPip('2000'),
        takerQuoteQuantity: decimalToPip('17'),

        // Maker qtys are incidental and not covered by this test
        makerBaseQuantity: decimalToPip('19062.5'),
        makerQuoteQuantity: decimalToPip('152.5'),

        cost: decimalToPip('9.7'),
      } satisfies ReturnValue);
    });

    /**
     * Same as the first buy test, but matching continues after order #4 even
     * though the taker has no buying power remaining, and should stop with
     * order #5. Asserts that the equation correctly yields zero for order #5.
     */
    it('should stop matching when the taker has no buying power remaining (buy)', () => {
      const sellSideMakerOrders: orderbook.PriceAndSize[] = [
        { price: decimalToPip('0.011'), size: decimalToPip('1000') },
        { price: decimalToPip('0.012'), size: decimalToPip('1000') },
        { price: decimalToPip('0.013'), size: decimalToPip('1000') },
        { price: decimalToPip('0.014'), size: decimalToPip('651.16279069') },
        { price: decimalToPip('0.015'), size: decimalToPip('1000') },
      ];
      const { market, positionInAnotherMarket, heldCollateral, quoteBalance } =
        setUpStandardTestAccount();

      expect(
        orderbook.calculateBuySellPanelEstimate({
          formInputs: {
            isReduceOnly: false,
            sliderFactor: 0.97,
            takerSide: 'buy',
          },
          initialMarginFractionOverride: null,
          leverageParameters: market,
          makerSideOrders: sellSideMakerOrders,
          market,
          wallet: {
            heldCollateral,
            positions: [positionInAnotherMarket],
            quoteBalance,
          },
        }),
      ).to.eql({
        makerBaseQuantity: BigInt(0),
        makerQuoteQuantity: BigInt(0),

        takerBaseQuantity: decimalToPip('3651.16279069'),
        takerQuoteQuantity: decimalToPip('45.11627906'),

        cost: decimalToPip('9.69999999'),
      } satisfies ReturnValue);
    });

    /**
     * Same as the first sell test, but matching continues after order #4 even
     * though the taker has no buying power remaining, and should stop with
     * order #5. Asserts that the equation correctly yields zero for order #5.
     */
    it('should stop matching when the taker has no buying power remaining (sell)', () => {
      const buySideMakerOrders: orderbook.PriceAndSize[] = [
        { price: decimalToPip('0.009'), size: decimalToPip('1000') },
        { price: decimalToPip('0.008'), size: decimalToPip('1000') },
        { price: decimalToPip('0.007'), size: decimalToPip('1000') },
        { price: decimalToPip('0.006'), size: decimalToPip('651.16279069') },
        { price: decimalToPip('0.005'), size: decimalToPip('1000') },
      ];
      const { market, positionInAnotherMarket, heldCollateral, quoteBalance } =
        setUpStandardTestAccount();

      expect(
        orderbook.calculateBuySellPanelEstimate({
          formInputs: {
            isReduceOnly: false,
            takerSide: 'sell',
            sliderFactor: 0.97,
          },
          initialMarginFractionOverride: null,
          leverageParameters: market,
          makerSideOrders: buySideMakerOrders,
          market,
          wallet: {
            heldCollateral,
            positions: [positionInAnotherMarket],
            quoteBalance,
          },
        }),
      ).to.eql({
        makerBaseQuantity: BigInt(0),
        makerQuoteQuantity: BigInt(0),

        takerBaseQuantity: decimalToPip('3651.16279069'),
        takerQuoteQuantity: decimalToPip('27.90697674'),

        cost: decimalToPip('9.69999999'),
      } satisfies ReturnValue);
    });

    const runDesiredPositionQtyBuyScenario = (
      desiredQtys:
        | {
            desiredTradeBaseQuantity: bigint;
          }
        | {
            desiredTradeQuoteQuantity: bigint;
          },
      expectedResult: ReturnValue,
    ) => {
      const { market, positionInAnotherMarket, heldCollateral, quoteBalance } =
        setUpStandardTestAccount();

      expect(
        orderbook.calculateBuySellPanelEstimate({
          formInputs: {
            isReduceOnly: false,
            takerSide: 'buy',
            ...desiredQtys,
          },
          initialMarginFractionOverride: null,
          leverageParameters: market,
          makerSideOrders: standardTestOrderBookSellSide,
          market,
          wallet: {
            heldCollateral,
            positions: [positionInAnotherMarket],
            quoteBalance,
          },
        }),
      ).to.eql(expectedResult);
    };

    describe('desiredTradeBaseQuantity (buy)', () => {
      it('should succeed', () =>
        runDesiredPositionQtyBuyScenario(
          {
            desiredTradeBaseQuantity: decimalToPip('3000'),
          },
          {
            makerBaseQuantity: BigInt(0),
            makerQuoteQuantity: BigInt(0),
            takerBaseQuantity: decimalToPip('3000'),
            takerQuoteQuantity: decimalToPip('36'),
            // Cost is not covered by this test
            cost: decimalToPip('6.9'),
          },
        ));

      it("should not exceed the taker's buying power", () =>
        runDesiredPositionQtyBuyScenario(
          {
            desiredTradeBaseQuantity: decimalToPip('4000'),
          },
          {
            makerBaseQuantity: BigInt(0),
            makerQuoteQuantity: BigInt(0),
            takerBaseQuantity: decimalToPip('3720.93023255'),
            takerQuoteQuantity: decimalToPip('46.09302325'),
            cost: decimalToPip('9.99999999'),
          },
        ));
    });

    describe('desiredTradeQuoteQuantity (buy)', () => {
      it('should succeed', () =>
        runDesiredPositionQtyBuyScenario(
          {
            desiredTradeQuoteQuantity: decimalToPip('40'),
          },
          {
            makerBaseQuantity: BigInt(0),
            makerQuoteQuantity: BigInt(0),
            takerBaseQuantity: decimalToPip('3285.71428587'),
            takerQuoteQuantity: decimalToPip('40'),
            // Cost is not covered by this test
            cost: decimalToPip('8.12857143'),
          },
        ));

      it("should not exceed the taker's buying power", () =>
        runDesiredPositionQtyBuyScenario(
          {
            desiredTradeQuoteQuantity: decimalToPip('50'),
          },
          {
            makerBaseQuantity: BigInt(0),
            makerQuoteQuantity: BigInt(0),
            takerBaseQuantity: decimalToPip('3720.93023255'),
            takerQuoteQuantity: decimalToPip('46.09302325'),
            cost: decimalToPip('9.99999999'),
          },
        ));
    });

    const runDesiredPositionQtySellScenario = (
      desiredQtys:
        | {
            desiredTradeBaseQuantity: bigint;
          }
        | {
            desiredTradeQuoteQuantity: bigint;
          },
      expectedResult: ReturnValue,
    ) => {
      const { market, positionInAnotherMarket, heldCollateral, quoteBalance } =
        setUpStandardTestAccount();

      expect(
        orderbook.calculateBuySellPanelEstimate({
          formInputs: {
            isReduceOnly: false,
            takerSide: 'sell',
            ...desiredQtys,
          },
          initialMarginFractionOverride: null,
          leverageParameters: market,
          makerSideOrders: standardTestOrderBookBuySide,
          market,
          wallet: {
            heldCollateral,
            positions: [positionInAnotherMarket],
            quoteBalance,
          },
        }),
      ).to.eql(expectedResult);
    };

    describe('desiredTradeBaseQuantity (sell)', () => {
      it('should succeed', () =>
        runDesiredPositionQtySellScenario(
          {
            desiredTradeBaseQuantity: decimalToPip('3000'),
          },
          {
            makerBaseQuantity: BigInt(0),
            makerQuoteQuantity: BigInt(0),
            takerBaseQuantity: decimalToPip('3000'),
            takerQuoteQuantity: decimalToPip('24'),
            // Cost is not covered by this test
            cost: decimalToPip('6.9'),
          },
        ));

      it('should ensure the correct sign', () =>
        runDesiredPositionQtySellScenario(
          {
            // Positive value, should be interpreted as a negative value
            desiredTradeBaseQuantity: decimalToPip('3000'),
          },
          {
            makerBaseQuantity: BigInt(0),
            makerQuoteQuantity: BigInt(0),
            takerBaseQuantity: decimalToPip('3000'),
            takerQuoteQuantity: decimalToPip('24'),
            // Cost is not covered by this test
            cost: decimalToPip('6.9'),
          },
        ));

      it("should not exceed the taker's buying power", () =>
        runDesiredPositionQtySellScenario(
          {
            desiredTradeBaseQuantity: decimalToPip('4000'),
          },
          {
            makerBaseQuantity: BigInt(0),
            makerQuoteQuantity: BigInt(0),
            takerBaseQuantity: decimalToPip('3720.93023255'),
            takerQuoteQuantity: decimalToPip('28.32558139'),
            cost: decimalToPip('9.99999999'),
          },
        ));
    });

    describe('desiredTradeQuoteQuantity (sell)', () => {
      it('should succeed', () =>
        runDesiredPositionQtySellScenario(
          {
            desiredTradeQuoteQuantity: decimalToPip('20'),
          },
          {
            makerBaseQuantity: BigInt(0),
            makerQuoteQuantity: BigInt(0),
            takerBaseQuantity: decimalToPip('2428.57142875'),
            takerQuoteQuantity: decimalToPip('20'),
            // Cost is not covered by this test
            cost: decimalToPip('5.01428570'),
          },
        ));

      it('should ensure the correct sign', () =>
        runDesiredPositionQtySellScenario(
          {
            // Positive value, should be interpreted as a negative value
            desiredTradeQuoteQuantity: decimalToPip('20'),
          },
          {
            makerBaseQuantity: BigInt(0),
            makerQuoteQuantity: BigInt(0),
            takerBaseQuantity: decimalToPip('2428.57142875'),
            takerQuoteQuantity: decimalToPip('20'),
            // Cost is not covered by this test
            cost: decimalToPip('5.01428570'),
          },
        ));

      it("should not exceed the taker's buying power", () =>
        runDesiredPositionQtySellScenario(
          {
            desiredTradeQuoteQuantity: decimalToPip('30'),
          },
          {
            makerBaseQuantity: BigInt(0),
            makerQuoteQuantity: BigInt(0),
            takerBaseQuantity: decimalToPip('3720.93023255'),
            takerQuoteQuantity: decimalToPip('28.32558139'),
            cost: decimalToPip('9.99999999'),
          },
        ));
    });

    /**
     * Maker qtys require a limit price
     */
    describe('Maker quantities', () => {
      const runMakerQtysSliderScenario = (isReduceOnly: boolean) => {
        const {
          market,
          positionInAnotherMarket,
          heldCollateral,
          quoteBalance,
        } = setUpStandardTestAccount();

        expect(
          orderbook.calculateBuySellPanelEstimate({
            formInputs: {
              isReduceOnly,
              limitPrice: decimalToPip('0.011'),
              takerSide: 'buy',
              sliderFactor: 0.15,
            },
            initialMarginFractionOverride: null,
            leverageParameters: market,
            makerSideOrders: standardTestOrderBookSellSide,
            market,
            wallet: {
              heldCollateral,
              positions: [positionInAnotherMarket],
              quoteBalance,
            },
          }),
        ).to.eql({
          // Only the first maker order is matched (limited by price)
          takerBaseQuantity: decimalToPip('1000'),
          takerQuoteQuantity: decimalToPip('11'),
          /*
           * - Wallet has 10 available collateral
           * - 85% of which (8.5) should remain (15% slider factor)
           * - After matching only the first maker order, 8.7 available collateral
           *   remains => 8.7 - 8.5 = 0.2 collateral can be put towards a maker
           *   order
           * - 6.66... order quote qty * 0.03 IMF = 0.2 margin requirement (rounded)
           * - 6.66... order quote qty / 0.011 limit price = 606.06060606 base qty
           */
          makerBaseQuantity: decimalToPip('606.06060606'),
          makerQuoteQuantity: decimalToPip('6.66666666'),
          /*
           * - Wallet has 10 available collateral
           * - Total cost is 1.49999999, matching the 15% slider factor
           * - 6.66... maker quote qty * 0.03 IMF = 0.199... margin requirement
           * - Reduce-only maker orders don't require margin:
           *   1.49999999 original cost - 0.199... maker qty margin requirement
           *   = 1.3
           */
          cost: decimalToPip(isReduceOnly ? '1.3' : '1.49999999'),
        } satisfies ReturnValue);

        // Confirm the 8.7 available collateral value stated in the above comment
        const availableCollateral = calculateAvailableCollateral({
          heldCollateral,
          market,
          positionInAnotherMarket,
          positionQuantity: decimalToPip('1000'),
          quoteBalance: quoteBalance - decimalToPip('11'),
        });
        expect(availableCollateral).to.eql(decimalToPip('8.7'));
      };

      it('should determine maker qtys for available collateral that does not match order book liquidity', () =>
        runMakerQtysSliderScenario(false));

      it('should determine maker qtys for available collateral that does not match order book liquidity (reduce-only)', () =>
        runMakerQtysSliderScenario(true));

      it('should determine maker qtys for a desired base trade qty that does not match order book liquidity (buy)', () => {
        const {
          market,
          positionInAnotherMarket,
          heldCollateral,
          quoteBalance,
        } = setUpStandardTestAccount();

        expect(
          orderbook.calculateBuySellPanelEstimate({
            formInputs: {
              isReduceOnly: false,
              limitPrice: decimalToPip('0.011'),
              takerSide: 'buy',
              desiredTradeBaseQuantity: decimalToPip('1500'),
            },
            initialMarginFractionOverride: null,
            leverageParameters: market,
            makerSideOrders: standardTestOrderBookSellSide,
            market,
            wallet: {
              heldCollateral,
              positions: [positionInAnotherMarket],
              quoteBalance,
            },
          }),
        ).to.eql({
          // Only the first maker order is matched (limited by price)
          takerBaseQuantity: decimalToPip('1000'),
          takerQuoteQuantity: decimalToPip('11'),

          // 500 base qty * 0.011 limit price = 5.5 quote
          makerBaseQuantity: decimalToPip('500'),
          makerQuoteQuantity: decimalToPip('5.5'),

          // Cost is not covered by this test
          cost: decimalToPip('1.465'),
        } satisfies ReturnValue);
      });

      it('should determine maker qtys for a desired base trade qty that does not match order book liquidity (sell)', () => {
        const {
          market,
          positionInAnotherMarket,
          heldCollateral,
          quoteBalance,
        } = setUpStandardTestAccount();

        expect(
          orderbook.calculateBuySellPanelEstimate({
            formInputs: {
              isReduceOnly: false,
              limitPrice: decimalToPip('0.009'),
              takerSide: 'sell',
              desiredTradeBaseQuantity: decimalToPip('1500'),
            },
            initialMarginFractionOverride: null,
            leverageParameters: market,
            makerSideOrders: standardTestOrderBookBuySide,
            market,
            wallet: {
              heldCollateral,
              positions: [positionInAnotherMarket],
              quoteBalance,
            },
          }),
        ).to.eql({
          // Only the first maker order is matched (limited by price)
          takerBaseQuantity: decimalToPip('1000'),
          takerQuoteQuantity: decimalToPip('9'),

          // 500 base qty * 0.009 limit price = 4.5 quote
          makerBaseQuantity: decimalToPip('500'),
          makerQuoteQuantity: decimalToPip('4.5'),

          // Cost is not covered by this test
          cost: decimalToPip('1.435'),
        } satisfies ReturnValue);
      });

      it('should determine maker qtys for a desired quote trade qty that does not match order book liquidity (buy)', () => {
        const {
          market,
          positionInAnotherMarket,
          heldCollateral,
          quoteBalance,
        } = setUpStandardTestAccount();

        expect(
          orderbook.calculateBuySellPanelEstimate({
            formInputs: {
              isReduceOnly: false,
              limitPrice: decimalToPip('0.011'),
              takerSide: 'buy',
              desiredTradeQuoteQuantity: decimalToPip('12.1'),
            },
            initialMarginFractionOverride: null,
            leverageParameters: market,
            makerSideOrders: standardTestOrderBookSellSide,
            market,
            wallet: {
              heldCollateral,
              positions: [positionInAnotherMarket],
              quoteBalance,
            },
          }),
        ).to.eql({
          // Only the first maker order is matched (limited by price)
          takerBaseQuantity: decimalToPip('1000'),
          takerQuoteQuantity: decimalToPip('11'),
          /*
           * 12.1 desired quote trade qty - 11 order book match = 1.1 quote can
           * be put towards a maker order. 1.1 / 0.011 limit price = 100 base
           */
          makerBaseQuantity: decimalToPip('100'),
          makerQuoteQuantity: decimalToPip('1.1'),

          // Cost is not covered by this test
          cost: decimalToPip('1.333'),
        } satisfies ReturnValue);
      });

      it('should determine maker qtys for a desired quote trade qty that does not match order book liquidity (sell)', () => {
        const {
          market,
          positionInAnotherMarket,
          heldCollateral,
          quoteBalance,
        } = setUpStandardTestAccount();

        expect(
          orderbook.calculateBuySellPanelEstimate({
            formInputs: {
              isReduceOnly: false,
              limitPrice: decimalToPip('0.009'),
              takerSide: 'sell',
              desiredTradeQuoteQuantity: decimalToPip('12.6'),
            },
            initialMarginFractionOverride: null,
            leverageParameters: market,
            makerSideOrders: standardTestOrderBookBuySide,
            market,
            wallet: {
              heldCollateral,
              positions: [positionInAnotherMarket],
              quoteBalance,
            },
          }),
        ).to.eql({
          // Only the first maker order is matched (limited by price)
          takerBaseQuantity: decimalToPip('1000'),
          takerQuoteQuantity: decimalToPip('9'),
          /*
           * 12.6 desired quote trade qty - 9 order book match = 3.6 quote can
           * be put towards a maker order. 3.6 / 0.009 limit price = 400 base
           */
          makerBaseQuantity: decimalToPip('400'),
          makerQuoteQuantity: decimalToPip('3.6'),

          // Cost is not covered by this test
          cost: decimalToPip('1.408'),
        } satisfies ReturnValue);
      });

      const runEmptyOrderBookScenario = (takerSide: 'buy' | 'sell') => {
        const {
          market,
          positionInAnotherMarket,
          heldCollateral,
          quoteBalance,
        } = setUpStandardTestAccount();

        expect(
          orderbook.calculateBuySellPanelEstimate({
            formInputs: {
              isReduceOnly: false,
              limitPrice: decimalToPip('0.01'),
              takerSide,
              sliderFactor: 1, // Use all 10 available collateral
            },
            initialMarginFractionOverride: null,
            leverageParameters: market,
            makerSideOrders: [],
            market,
            wallet: {
              heldCollateral,
              positions: [positionInAnotherMarket],
              quoteBalance,
            },
          }),
        ).to.eql({
          /*
           * - 20k base requires 0.04 IMF (0.3 for 1st 10k + 0.1 for 2nd 20k)
           * - 20k base * 0.01 limit price = 200 quote
           * - 200 quote * 0.04 IMF = 8 cost
           * Any amount above 20k would increase the IMF to 0.05 =>
           * 200.00000001 quote * 0.05 = 10.0000000005 cost, which is above the
           * wallet's 10 available collateral. Thus, the 0.04 IMF level and its
           * maximum qty of 20k base should be selected.
           */
          makerBaseQuantity: decimalToPip('20000'),
          makerQuoteQuantity: decimalToPip('200'),

          takerBaseQuantity: BigInt(0),
          takerQuoteQuantity: BigInt(0),

          cost: decimalToPip('8'),
        } satisfies ReturnValue);
      };

      it('should determine maker qtys for an empty order book (buy)', () =>
        runEmptyOrderBookScenario('buy'));

      it('should determine maker qtys for an empty order book (sell)', () =>
        runEmptyOrderBookScenario('sell'));

      const runDesiredBaseQtyEmptyOrderBookScenario = (
        takerSide: 'buy' | 'sell',
      ) => {
        const {
          market,
          positionInAnotherMarket,
          heldCollateral,
          quoteBalance,
        } = setUpStandardTestAccount();

        expect(
          orderbook.calculateBuySellPanelEstimate({
            formInputs: {
              isReduceOnly: false,
              limitPrice: decimalToPip('0.01'),
              takerSide,
              desiredTradeBaseQuantity: decimalToPip('1000'),
            },
            initialMarginFractionOverride: null,
            leverageParameters: market,
            makerSideOrders: [],
            market,
            wallet: {
              heldCollateral,
              positions: [positionInAnotherMarket],
              quoteBalance,
            },
          }),
        ).to.eql({
          makerBaseQuantity: decimalToPip('1000'),
          makerQuoteQuantity: decimalToPip('10'),

          takerBaseQuantity: BigInt(0),
          takerQuoteQuantity: BigInt(0),

          cost: decimalToPip('0.3'), // 10 quote * 0.03 IMF
        } satisfies ReturnValue);
      };

      it('should determine maker qtys for a desired base trade qty and an empty order book (buy)', () =>
        runDesiredBaseQtyEmptyOrderBookScenario('buy'));

      it('should determine maker qtys for a desired base trade qty and an empty order book (sell)', () =>
        runDesiredBaseQtyEmptyOrderBookScenario('sell'));

      const runDesiredQuoteQtyEmptyOrderBookScenario = (
        takerSide: 'buy' | 'sell',
      ) => {
        const {
          market,
          positionInAnotherMarket,
          heldCollateral,
          quoteBalance,
        } = setUpStandardTestAccount();

        expect(
          orderbook.calculateBuySellPanelEstimate({
            formInputs: {
              isReduceOnly: false,
              limitPrice: decimalToPip('0.01'),
              takerSide,
              desiredTradeQuoteQuantity: decimalToPip('10'),
            },
            initialMarginFractionOverride: null,
            leverageParameters: market,
            makerSideOrders: [],
            market,
            wallet: {
              heldCollateral,
              positions: [positionInAnotherMarket],
              quoteBalance,
            },
          }),
        ).to.eql({
          makerBaseQuantity: decimalToPip('1000'),
          makerQuoteQuantity: decimalToPip('10'),

          takerBaseQuantity: BigInt(0),
          takerQuoteQuantity: BigInt(0),

          cost: decimalToPip('0.3'), // 10 quote * 0.03 IMF
        } satisfies ReturnValue);
      };

      it('should determine maker qtys for a desired quote trade qty and an empty order book (buy)', () =>
        runDesiredQuoteQtyEmptyOrderBookScenario('buy'));

      it('should determine maker qtys for a desired quote trade qty and an empty order book (sell)', () =>
        runDesiredQuoteQtyEmptyOrderBookScenario('sell'));
    });

    const runOrderBookLiquidityExceededScenario = (
      takerSide: 'buy' | 'sell',
    ) => {
      const { market, positionInAnotherMarket, heldCollateral, quoteBalance } =
        setUpStandardTestAccount();

      expect(
        orderbook.calculateBuySellPanelEstimate({
          formInputs: {
            isReduceOnly: false,
            takerSide,
            sliderFactor: 0.97,
          },
          initialMarginFractionOverride: null,
          leverageParameters: market,
          market,
          makerSideOrders: [
            {
              price: decimalToPip(takerSide === 'buy' ? '0.011' : '0.009'),
              size: decimalToPip('1'),
            },
          ],
          wallet: {
            heldCollateral,
            positions: [positionInAnotherMarket],
            quoteBalance,
          },
        }),
      ).to.eql({
        makerBaseQuantity: BigInt(0),
        makerQuoteQuantity: BigInt(0),
        takerBaseQuantity: decimalToPip('1'),
        takerQuoteQuantity: decimalToPip(
          takerSide === 'buy' ? '0.011' : '0.009',
        ),
        // Cost is not covered by this test
        cost: decimalToPip('0.0013'),
      } satisfies ReturnValue);
    };

    it("should succeed when the taker's buying power exceeds order book liquidity (buy)", () =>
      runOrderBookLiquidityExceededScenario('buy'));

    it("should succeed when the taker's buying power exceeds order book liquidity (sell)", () =>
      runOrderBookLiquidityExceededScenario('sell'));

    const runNoAvailableCollateralScenario = (
      availableCollateral: 'zero' | 'negative',
    ) => {
      const { market, positionInAnotherMarket, heldCollateral } =
        setUpStandardTestAccount();

      expect(
        orderbook.calculateBuySellPanelEstimate({
          formInputs: {
            isReduceOnly: false,
            takerSide: 'buy',
            sliderFactor: 0.123,
          },
          initialMarginFractionOverride: null,
          leverageParameters: market,
          makerSideOrders: [
            { price: decimalToPip('123'), size: decimalToPip('123') },
          ],
          market,
          wallet: {
            heldCollateral,
            positions: [positionInAnotherMarket],
            quoteBalance:
              availableCollateral === 'negative' ?
                decimalToPip('-1')
              : BigInt(0),
          },
        }),
      ).to.eql({
        makerBaseQuantity: BigInt(0),
        makerQuoteQuantity: BigInt(0),
        takerBaseQuantity: BigInt(0),
        takerQuoteQuantity: BigInt(0),
        cost: BigInt(0),
      } satisfies ReturnValue);
    };

    it('should return zero for zero availableCollateral', () =>
      runNoAvailableCollateralScenario('zero'));

    it('should return zero for negative availableCollateral', () =>
      runNoAvailableCollateralScenario('negative'));

    const runWrongNumberOfQtyInputsScenario = (qtyInputs: {
      desiredTradeBaseQuantity?: bigint;
      desiredTradeQuoteQuantity?: bigint;
      sliderFactor?: number;
    }) => {
      const market = makeAMarket(BigInt(123));

      expect(() =>
        orderbook.calculateBuySellPanelEstimate({
          // @ts-expect-error the type declarations protect against this
          formInputs: {
            takerSide: 'buy',
            ...qtyInputs,
          },
          initialMarginFractionOverride: null,
          leverageParameters: market,
          makerSideOrders: [],
          market,
          wallet: {
            heldCollateral: BigInt(0),
            positions: [],
            quoteBalance: BigInt(0),
          },
        }),
      ).to.throw(
        'Either desiredTradeBaseQuantity, desiredTradeQuoteQuantity, or sliderFactor needs to be provided',
      );
    };

    it('should require at least one quantity input ', () =>
      runWrongNumberOfQtyInputsScenario({}));

    it('should reject multiple quantity inputs ', () => {
      runWrongNumberOfQtyInputsScenario({
        desiredTradeBaseQuantity: BigInt(123),
        desiredTradeQuoteQuantity: BigInt(123),
      });
      runWrongNumberOfQtyInputsScenario({
        desiredTradeBaseQuantity: BigInt(123),
        sliderFactor: 0.123,
      });
      runWrongNumberOfQtyInputsScenario({
        desiredTradeBaseQuantity: BigInt(123),
        desiredTradeQuoteQuantity: BigInt(123),
        sliderFactor: 0.123,
      });
    });

    const runZeroInputScenario = (qtyInputs: {
      desiredTradeBaseQuantity?: bigint;
      desiredTradeQuoteQuantity?: bigint;
      sliderFactor?: number;
    }) => {
      const { market, positionInAnotherMarket, heldCollateral, quoteBalance } =
        setUpStandardTestAccount();

      expect(
        orderbook.calculateBuySellPanelEstimate({
          // @ts-expect-error the type declarations protect against this
          formInputs: {
            takerSide: 'buy',
            ...qtyInputs,
          },
          initialMarginFractionOverride: null,
          leverageParameters: market,
          makerSideOrders: [
            { price: decimalToPip('123'), size: decimalToPip('123') },
          ],
          market,
          wallet: {
            heldCollateral,
            positions: [positionInAnotherMarket],
            quoteBalance,
          },
        }),
      ).to.eql({
        makerBaseQuantity: BigInt(0),
        makerQuoteQuantity: BigInt(0),
        takerBaseQuantity: BigInt(0),
        takerQuoteQuantity: BigInt(0),
        cost: BigInt(0),
      } satisfies ReturnValue);
    };

    it('should return zero for a zero desiredTradeBaseQuantity', () =>
      runZeroInputScenario({ desiredTradeBaseQuantity: BigInt(0) }));

    it('should return zero for a zero desiredTradeQuoteQuantity', () =>
      runZeroInputScenario({ desiredTradeQuoteQuantity: BigInt(0) }));

    it('should return zero for a zero sliderFactor', () =>
      runZeroInputScenario({ sliderFactor: 0 }));

    it('should reject a negative sliderFactor', () => {
      const { market, positionInAnotherMarket, heldCollateral, quoteBalance } =
        setUpStandardTestAccount();

      expect(() =>
        orderbook.calculateBuySellPanelEstimate({
          formInputs: {
            isReduceOnly: false,
            takerSide: 'buy',
            sliderFactor: -0.123,
          },
          initialMarginFractionOverride: null,
          leverageParameters: market,
          makerSideOrders: [],
          market,
          wallet: {
            heldCollateral,
            positions: [positionInAnotherMarket],
            quoteBalance,
          },
        }),
      ).to.throw(
        'sliderFactor must be a floating point number between 0 and 1',
      );
    });

    it('should reject a sliderFactor larger than 1', () => {
      const { market, positionInAnotherMarket, heldCollateral, quoteBalance } =
        setUpStandardTestAccount();

      expect(() =>
        orderbook.calculateBuySellPanelEstimate({
          formInputs: {
            isReduceOnly: false,
            takerSide: 'buy',
            sliderFactor: 1.1,
          },
          initialMarginFractionOverride: null,
          leverageParameters: market,
          makerSideOrders: [],
          market,
          wallet: {
            heldCollateral,
            positions: [positionInAnotherMarket],
            quoteBalance,
          },
        }),
      ).to.throw(
        'sliderFactor must be a floating point number between 0 and 1',
      );
    });

    function calculateAvailableCollateral(args: {
      heldCollateral: bigint;
      market: IDEXMarket;
      positionInAnotherMarket: IDEXPosition;
      positionQuantity: bigint;
      quoteBalance: bigint;
    }): bigint {
      const {
        heldCollateral,
        market,
        positionInAnotherMarket,
        positionQuantity,
        quoteBalance,
      } = args;

      // Signed
      const quoteValueOfPosition = multiplyPips(
        positionQuantity,
        decimalToPip(market.indexPrice),
      );

      const initialMarginRequirement = multiplyPips(
        absBigInt(quoteValueOfPosition),
        decimalToPip(market.initialMarginFraction),
      );

      const accountValue =
        quoteBalance +
        quoteValueOfPosition +
        // Other position has index price 1; see `setUpStandardTestAccount`
        decimalToPip(positionInAnotherMarket.quantity);

      return (
        accountValue -
        initialMarginRequirement -
        decimalToPip(positionInAnotherMarket.marginRequirement) -
        heldCollateral
      );
    }

    const runTradeIncreasesAvailableCollateralBuyScenario = (
      runAvailableCollateralStaysTheSameScenario: boolean,
    ) => {
      const { market, positionInAnotherMarket, heldCollateral } =
        setUpStandardTestAccount();

      // The test account's quote balance equals its available collateral
      const quoteBalance = BigInt(1);

      expect(
        calculateAvailableCollateral({
          heldCollateral,
          market,
          positionInAnotherMarket,
          positionQuantity: BigInt(0),
          quoteBalance,
        }),
      ).to.eql(BigInt(1));

      /*
       * Buy trades increase available collateral if
       * trade price <= index price * (1 - IMF)
       * 0.01 index price * (1 - 0.03 IMF) = 0.0097
       */
      const priceThreshold = multiplyPips(
        decimalToPip(market.indexPrice),
        oneInPips - decimalToPip(market.initialMarginFraction),
      );

      const orderQty = decimalToPip('1');
      const orderPrice =
        runAvailableCollateralStaysTheSameScenario ? priceThreshold : (
          priceThreshold - BigInt(1)
        );

      const expectedBaseQty = orderQty;
      const expectedQuoteQty = orderPrice; // order price * order qty (1)

      expect(
        orderbook.calculateBuySellPanelEstimate({
          formInputs: {
            isReduceOnly: false,
            takerSide: 'buy',
            sliderFactor: 0.123, // Should have no effect
          },
          initialMarginFractionOverride: null,
          leverageParameters: market,
          makerSideOrders: [
            {
              price: orderPrice,
              size: orderQty,
            },
          ],
          market,
          wallet: {
            heldCollateral,
            positions: [positionInAnotherMarket],
            quoteBalance,
          },
        }),
      ).to.eql({
        makerBaseQuantity: BigInt(0),
        makerQuoteQuantity: BigInt(0),
        takerBaseQuantity: expectedBaseQty,
        takerQuoteQuantity: expectedQuoteQty,
        cost: BigInt(0),
      } satisfies ReturnValue);

      expect(
        calculateAvailableCollateral({
          heldCollateral,
          market,
          positionInAnotherMarket,
          positionQuantity: expectedBaseQty,
          quoteBalance: quoteBalance - expectedQuoteQty,
        }),
      ).to.eql(
        runAvailableCollateralStaysTheSameScenario ? BigInt(1) : BigInt(2),
      );
    };

    it("should allow trades that don't change available collateral (taker buy)", () =>
      runTradeIncreasesAvailableCollateralBuyScenario(true));

    it('should allow trades that increase available collateral (taker buy)', () =>
      runTradeIncreasesAvailableCollateralBuyScenario(false));

    const runTradeIncreasesAvailableCollateralSellScenario = (
      runAvailableCollateralStaysTheSameScenario: boolean,
    ) => {
      const { market, positionInAnotherMarket, heldCollateral } =
        setUpStandardTestAccount();

      // The test account's quote balance equals its available collateral
      const quoteBalance = BigInt(1);

      expect(
        calculateAvailableCollateral({
          heldCollateral,
          market,
          positionInAnotherMarket,
          positionQuantity: BigInt(0),
          quoteBalance,
        }),
      ).to.eql(BigInt(1));

      /*
       * Sell trades increase available collateral if
       * trade price >= index price * (1 + IMF)
       * 0.01 index price * (1 + 0.03 IMF) = 0.0103
       */
      const priceThreshold = multiplyPips(
        decimalToPip(market.indexPrice),
        oneInPips + decimalToPip(market.initialMarginFraction),
      );

      const orderQty = decimalToPip('1');
      const orderPrice =
        runAvailableCollateralStaysTheSameScenario ? priceThreshold : (
          priceThreshold + BigInt(1)
        );

      const expectedBaseQty = -orderQty;
      const expectedQuoteQty = -orderPrice; // -(order price * order qty (1))

      expect(
        orderbook.calculateBuySellPanelEstimate({
          formInputs: {
            isReduceOnly: false,
            takerSide: 'sell',
            sliderFactor: 0.123, // Should have no effect
          },
          initialMarginFractionOverride: null,
          leverageParameters: market,
          makerSideOrders: [
            {
              price: orderPrice,
              size: orderQty,
            },
          ],
          market,
          wallet: {
            heldCollateral,
            positions: [positionInAnotherMarket],
            quoteBalance,
          },
        }),
      ).to.eql({
        makerBaseQuantity: BigInt(0),
        makerQuoteQuantity: BigInt(0),
        takerBaseQuantity: absBigInt(expectedBaseQty),
        takerQuoteQuantity: absBigInt(expectedQuoteQty),
        cost: BigInt(0),
      } satisfies ReturnValue);

      expect(
        calculateAvailableCollateral({
          heldCollateral,
          market,
          positionInAnotherMarket,
          positionQuantity: expectedBaseQty,
          quoteBalance: quoteBalance - expectedQuoteQty,
        }),
      ).to.eql(
        runAvailableCollateralStaysTheSameScenario ? BigInt(1) : BigInt(2),
      );
    };

    it("should allow trades that don't change available collateral (taker sell)", () =>
      runTradeIncreasesAvailableCollateralSellScenario(true));

    it('should allow trades that increase available collateral (taker sell)', () =>
      runTradeIncreasesAvailableCollateralSellScenario(false));
  });
});
