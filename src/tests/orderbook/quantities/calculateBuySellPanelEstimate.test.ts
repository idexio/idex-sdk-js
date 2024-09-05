import * as chai from 'chai';

import {
  absBigInt,
  decimalToPip,
  multiplyPips,
  oneInPips,
  pipToDecimal,
} from '#pipmath';

import { calculateMarginRequirementForStandingOrdersInMarket } from '#orderbook/buySellPanelEstimateUtils';
import * as orderbook from '#orderbook/index';
import { OrderSide } from '#types/enums/request';

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
            standingOrders: [],
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
            standingOrders: [],
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
            standingOrders: [],
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
            standingOrders: [],
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
            standingOrders: [],
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
            standingOrders: [],
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
            standingOrders: [],
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
            standingOrders: [],
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

    describe('Slider scenarios', () => {
      const runSliderScenario = (args: {
        quoteBalance: string;
        positionQuantity: string;
        otherPosition?: {
          quoteValue: string;
          imf: string;
        };
        reducingStandingOrderPrice?: string;
        heldCollateral?: string;

        takerSide: OrderSide;
        sliderFactor: number;
        makerOrderPrice: string;

        expectedBaseQty: string;
        expectedCost: string;
      }) => {
        const market = makeAMarket(decimalToPip('100'), 'FOO');
        const position = makeAPosition({
          market,
          quantity: decimalToPip(args.positionQuantity),
          initialMarginRequirement:
            (absBigInt(decimalToPip(args.positionQuantity)) *
              decimalToPip(market.indexPrice) *
              decimalToPip(market.initialMarginFraction)) /
            oneInPips /
            oneInPips,
        });

        const otherMarket = makeAMarket(decimalToPip('1'), 'BAR');
        otherMarket.initialMarginFraction = args.otherPosition?.imf ?? '0.03';
        // Index price is 1
        const otherPositionQuoteValue = decimalToPip(
          args.otherPosition?.quoteValue ?? '0',
        );
        const otherPosition = makeAPosition({
          market: otherMarket,
          quantity: otherPositionQuoteValue,
          initialMarginRequirement: multiplyPips(
            absBigInt(otherPositionQuoteValue),
            decimalToPip(otherMarket.initialMarginFraction),
          ),
        });

        /*
        const availableCollateralBefore = calculateAvailableCollateral({
          heldCollateral: decimalToPip(args.heldCollateral ?? '0'),
          market,
          positionInAnotherMarket: otherPosition,
          positionQuantity: decimalToPip(args.positionQuantity),
          quoteBalance: decimalToPip(args.quoteBalance),
        });
        */

        const result = orderbook.calculateBuySellPanelEstimate({
          formInputs: {
            takerSide: args.takerSide,
            sliderFactor: args.sliderFactor,
          },
          initialMarginFractionOverride: null,
          leverageParameters: market,
          makerSideOrders: [
            {
              price: decimalToPip(args.makerOrderPrice),
              size: decimalToPip('1000'), // Large enough to fill the taker
            },
          ],
          market,
          wallet: {
            heldCollateral: decimalToPip(args.heldCollateral ?? '0'),
            positions: [position, otherPosition],
            quoteBalance: decimalToPip(args.quoteBalance),
            standingOrders:
              args.reducingStandingOrderPrice ?
                [
                  {
                    market: market.market,
                    side:
                      decimalToPip(position.quantity) > BigInt(0) ?
                        'sell'
                      : 'buy',
                    // originalQuantity: position.quantity,
                    originalQuantity: '100',
                    executedQuantity: '0',
                    price: args.reducingStandingOrderPrice,
                  },
                ]
              : [],
          },
        });

        /*
        const availableCollateralAfter = calculateAvailableCollateral({
          heldCollateral: decimalToPip(args.heldCollateral ?? '0'),
          market,
          positionInAnotherMarket: otherPosition,
          positionQuantity:
            decimalToPip(args.positionQuantity) +
            BigInt(args.takerSide === 'buy' ? '1' : '-1') *
              result.takerBaseQuantity,
          quoteBalance:
            decimalToPip(args.quoteBalance) +
            BigInt(args.takerSide === 'buy' ? '-1' : '1') *
              result.takerQuoteQuantity,
        });
        */

        expect(result).to.eql({
          makerBaseQuantity: BigInt(0),
          makerQuoteQuantity: BigInt(0),
          takerBaseQuantity: decimalToPip(args.expectedBaseQty),
          takerQuoteQuantity: multiplyPips(
            decimalToPip(args.expectedBaseQty),
            decimalToPip(args.makerOrderPrice),
          ),
          cost: decimalToPip(args.expectedCost),
        } satisfies ReturnValue);
      };

      it('Increasing buy', () =>
        runSliderScenario({
          quoteBalance: '50',
          positionQuantity: '0.1',
          otherPosition: {
            quoteValue: '10',
            imf: '0.2',
          },
          reducingStandingOrderPrice: '106',
          heldCollateral: '35',

          takerSide: 'buy',
          sliderFactor: 0.75,
          makerOrderPrice: '103',

          expectedBaseQty: '8.69680851',
          expectedCost: '24.52499999', // Precision limitation; should be 24.525
        }));

      it('Increasing sell', () =>
        runSliderScenario({
          quoteBalance: '50',
          positionQuantity: '-0.1',
          otherPosition: {
            quoteValue: '10',
            imf: '0.2',
          },
          reducingStandingOrderPrice: '94',
          heldCollateral: '35',

          takerSide: 'sell',
          sliderFactor: 0.75,
          makerOrderPrice: '97',

          expectedBaseQty: '2.995283019',
          expectedCost: '9.52499997', // Precision limitation; should be 9.525
        }));

      it('Decreasing buy (no standing order)', () =>
        runSliderScenario({
          quoteBalance: '105',
          positionQuantity: '-1',

          takerSide: 'buy',
          sliderFactor: 0.75,
          makerOrderPrice: '105',

          expectedBaseQty: '0.75',
          expectedCost: '1.5',
        }));

      it('Decreasing sell (no standing order) (1)', () =>
        runSliderScenario({
          quoteBalance: '-95',
          positionQuantity: '1',

          takerSide: 'sell',
          sliderFactor: 0.75,
          makerOrderPrice: '96',

          expectedBaseQty: '1.07142857',
          expectedCost: '1.49999999', // Precision limitation; should be 1.5
        }));

      it('Decreasing sell (no standing order) (2)', () =>
        runSliderScenario({
          quoteBalance: '-95',
          positionQuantity: '1',

          takerSide: 'sell',
          sliderFactor: 0.75,
          /*
           * This price causes a division by zero in the calculations, which
           * implies available collateral increases. The matching loop should
           * apply the whole maker qty and continue with the next iteration.
           */
          makerOrderPrice: '97',

          expectedBaseQty: '1.25',
          expectedCost: '1.5',
        }));

      it('Decreasing buy', () =>
        runSliderScenario({
          quoteBalance: '105',
          positionQuantity: '-1',
          reducingStandingOrderPrice: '95',

          takerSide: 'buy',
          sliderFactor: 0.75,
          makerOrderPrice: '105',

          expectedBaseQty: '0.30927835',
          expectedCost: '1.49999999', // Precision limitation; should be 1.5
        }));

      it('Decreasing sell', () =>
        runSliderScenario({
          quoteBalance: '-95',
          positionQuantity: '1',
          reducingStandingOrderPrice: '105',

          takerSide: 'sell',
          sliderFactor: 0.75,
          makerOrderPrice: '95',

          expectedBaseQty: '0.29126213',
          expectedCost: '1.49999996', // Precision limitation; should be 1.5
        }));
    });

    const runIncrementalImfScenario = (
      takerSide: OrderSide,
      /**
       * Enables testing IMF rollover into the next incremental bracket while
       * matching a single maker order vs. at the boundary to the next one.
       */
      doesMakerSizeMatchBaselineImfThreshold: boolean,
    ) => {
      const market = makeAMarket(decimalToPip('1'), 'FOO', {
        ...defaultLeverageParameters,
        initialMarginFraction: decimalToPip('0.03'),
        incrementalInitialMarginFraction: decimalToPip('0.01'),
        basePositionSize: decimalToPip('100'),
        incrementalPositionSize: decimalToPip('10'),
      });
      /*
       * - Position size up to 100 requires 3 margin
       * - Position size up to 110 requires 4 margin
       * - Position size up to 120 requires 5 margin
       *
       * => 4.5 collateral can afford only 110, which requires 4.4 margin and
       *    leaves 0.1 collateral available
       */
      const quoteBalance = decimalToPip('4.5');

      const result = orderbook.calculateBuySellPanelEstimate({
        formInputs: {
          takerSide,
          desiredTradeBaseQuantity: decimalToPip('1000'),
        },
        initialMarginFractionOverride: null,
        leverageParameters: market,
        makerSideOrders:
          doesMakerSizeMatchBaselineImfThreshold ?
            [
              {
                price: decimalToPip(market.indexPrice),
                size: decimalToPip('100'),
              },
              {
                price: decimalToPip(market.indexPrice),
                size: decimalToPip('1000'),
              },
            ]
          : [
              {
                price: decimalToPip(market.indexPrice),
                size: decimalToPip('1000'), // Large enough to fill the taker
              },
            ],
        market,
        wallet: {
          heldCollateral: BigInt(0),
          positions: [],
          quoteBalance,
          standingOrders: [],
        },
      });

      expect(result).to.eql({
        makerBaseQuantity: BigInt(0),
        makerQuoteQuantity: BigInt(0),
        takerBaseQuantity: decimalToPip('110'),
        takerQuoteQuantity: decimalToPip('110'),
        cost: decimalToPip('4.4'),
      } satisfies ReturnValue);

      const newQuoteBalance =
        takerSide === 'buy' ?
          quoteBalance - result.takerQuoteQuantity
        : quoteBalance + result.takerQuoteQuantity;

      const accountValue =
        takerSide === 'buy' ?
          // Index price is 1
          newQuoteBalance + result.takerBaseQuantity
        : newQuoteBalance - result.takerBaseQuantity;

      const imr = orderbook.calculateInitialMarginRequirementOfPosition({
        indexPrice: decimalToPip('1'),
        initialMarginFractionOverride: null,
        leverageParameters: orderbook.convertToLeverageParametersBigInt(market),
        positionQty: result.takerBaseQuantity,
      });
      expect(imr).to.eql(decimalToPip('4.4'));

      const availableCollateral = accountValue - imr;
      expect(availableCollateral).to.eql(decimalToPip('0.1'));
    };

    it('should traverse incremental IMF thresholds (buy)', () =>
      runIncrementalImfScenario('buy', false));

    it('should succeed if incremental IMF thresholds line up with maker orders (buy)', () =>
      runIncrementalImfScenario('buy', true));

    it('should traverse incremental IMF thresholds (sell)', () =>
      runIncrementalImfScenario('sell', false));

    it('should succeed if incremental IMF thresholds line up with maker orders (sell)', () =>
      runIncrementalImfScenario('sell', true));

    /**
     * Maker qtys require a limit price
     */
    describe('Maker quantities', () => {
      const runMakerQtysSliderScenario = () => {
        const {
          market,
          positionInAnotherMarket,
          heldCollateral,
          quoteBalance,
        } = setUpStandardTestAccount();

        expect(
          orderbook.calculateBuySellPanelEstimate({
            formInputs: {
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
              standingOrders: [],
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
           */
          cost: decimalToPip('1.49999999'),
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
        runMakerQtysSliderScenario());

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
              standingOrders: [],
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
              standingOrders: [],
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
              standingOrders: [],
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
              standingOrders: [],
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

      const runEmptyOrderBookScenario = (takerSide: OrderSide) => {
        const {
          market,
          positionInAnotherMarket,
          heldCollateral,
          quoteBalance,
        } = setUpStandardTestAccount();

        expect(
          orderbook.calculateBuySellPanelEstimate({
            formInputs: {
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
              standingOrders: [],
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
        takerSide: OrderSide,
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
              standingOrders: [],
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
        takerSide: OrderSide,
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
              standingOrders: [],
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

      describe('Margin requirement for maker quantities', () => {
        const runBasicMakerQtyImrScenario = (
          takerSide: OrderSide,
          withOpenPosition?: boolean,
          withStandingOrders?: boolean,
        ) => {
          const market = makeAMarket(decimalToPip('0.01'), 'FOO');

          expect(
            orderbook.calculateBuySellPanelEstimate({
              formInputs: {
                limitPrice: decimalToPip('0.01'),
                takerSide,
                desiredTradeBaseQuantity: decimalToPip('100'),
              },
              initialMarginFractionOverride: null,
              leverageParameters: market,
              makerSideOrders: [],
              market,
              wallet: {
                heldCollateral: BigInt(0),
                positions:
                  withOpenPosition ?
                    [
                      makeAPosition({
                        market,
                        quantity: decimalToPip(
                          takerSide === 'buy' ? '123' : '-123',
                        ),
                        initialMarginRequirement: decimalToPip('0.123'),
                      }),
                    ]
                  : [],
                quoteBalance: decimalToPip('123'),
                standingOrders:
                  withStandingOrders ?
                    [
                      {
                        market: market.market,
                        side: takerSide,
                        originalQuantity: '123',
                        executedQuantity: '0',
                        price: '0.01',
                      },
                    ]
                  : [],
              },
            }),
          ).to.eql({
            makerBaseQuantity: decimalToPip('100'),
            makerQuoteQuantity: decimalToPip('1'),

            takerBaseQuantity: BigInt(0),
            takerQuoteQuantity: BigInt(0),

            cost: decimalToPip('0.03'),
          } satisfies ReturnValue);
        };

        it('should include margin requirement for a maker qty in cost (buy)', () =>
          runBasicMakerQtyImrScenario('buy', false));

        it('should include margin requirement for a maker qty in cost (sell)', () =>
          runBasicMakerQtyImrScenario('sell', false));

        it('should include margin requirement for a maker qty in cost (buy) (with open long position)', () =>
          runBasicMakerQtyImrScenario('buy', true));

        it('should include margin requirement for a maker qty in cost (sell) (with open short position)', () =>
          runBasicMakerQtyImrScenario('sell', true));

        it('should include margin requirement for a maker qty in cost (buy) (with standing buy orders)', () =>
          runBasicMakerQtyImrScenario('buy', false, true));

        it('should include margin requirement for a maker qty in cost (sell) (with standing sell orders)', () =>
          runBasicMakerQtyImrScenario('sell', false, true));

        const runReducingMakerQtyImrScenario = (
          takerSide: OrderSide,
          isOrderLargerThanPosition: boolean,
        ) => {
          const market = makeAMarket(decimalToPip('0.01'), 'FOO');

          const makerBaseQuantity = decimalToPip(
            isOrderLargerThanPosition ? '200' : '100',
          );
          const makerQuoteQuantity = decimalToPip(
            isOrderLargerThanPosition ? '2' : '1',
          );

          expect(
            orderbook.calculateBuySellPanelEstimate({
              formInputs: {
                limitPrice: decimalToPip('0.01'),
                takerSide,
                desiredTradeBaseQuantity: makerBaseQuantity,
              },
              initialMarginFractionOverride: null,
              leverageParameters: market,
              makerSideOrders: [],
              market,
              wallet: {
                heldCollateral: BigInt(0),
                positions: [
                  makeAPosition({
                    market,
                    quantity: decimalToPip(
                      takerSide === 'buy' ? '-100' : '100',
                    ),
                    initialMarginRequirement: decimalToPip('0.123'),
                  }),
                ],
                quoteBalance: decimalToPip('123'),
                standingOrders: [],
              },
            }),
          ).to.eql({
            makerBaseQuantity,
            makerQuoteQuantity,

            takerBaseQuantity: BigInt(0),
            takerQuoteQuantity: BigInt(0),

            cost:
              isOrderLargerThanPosition ?
                decimalToPip('0.03') // Half of the order reduces the position, the other half requires margin
              : BigInt(0),
          } satisfies ReturnValue);
        };

        it('should determine zero margin requirement for a reducing maker qty (buy)', () =>
          runReducingMakerQtyImrScenario('buy', false));

        it('should determine zero margin requirement for a reducing maker qty (sell)', () =>
          runReducingMakerQtyImrScenario('sell', false));

        it('should determine zero margin requirement for the reducing part of a maker qty (order larger than position) (buy)', () =>
          runReducingMakerQtyImrScenario('buy', true));

        it('should determine zero margin requirement for the reducing part of a maker qty (order larger than position) (sell)', () =>
          runReducingMakerQtyImrScenario('sell', true));

        const runTotalReducingLiquidityLargerThanPositionScenario = (
          takerSide: OrderSide,
        ) => {
          const market = makeAMarket(decimalToPip('0.01'), 'FOO');

          expect(
            orderbook.calculateBuySellPanelEstimate({
              formInputs: {
                limitPrice: decimalToPip('0.01'),
                takerSide,
                desiredTradeBaseQuantity: decimalToPip('100'),
              },
              initialMarginFractionOverride: null,
              leverageParameters: market,
              makerSideOrders: [],
              market,
              wallet: {
                heldCollateral: BigInt(0),
                positions: [
                  makeAPosition({
                    market,
                    quantity: decimalToPip(
                      takerSide === 'buy' ? '-100' : '100',
                    ),
                    initialMarginRequirement: decimalToPip('0.123'),
                  }),
                ],
                quoteBalance: decimalToPip('123'),
                standingOrders: [
                  {
                    market: market.market,
                    side: takerSide,
                    originalQuantity: '50',
                    executedQuantity: '0',
                    price: '0.01',
                  },
                ],
              },
            }),
          ).to.eql({
            makerBaseQuantity: decimalToPip('100'),
            makerQuoteQuantity: decimalToPip('1'),

            takerBaseQuantity: BigInt(0),
            takerQuoteQuantity: BigInt(0),
            /*
             * The standing order (50) already reduces the position; Only half
             * (50) of the new maker qty reduces the position (100) further,
             * thus the other half requires margin.
             */
            cost: decimalToPip('0.015'),
          } satisfies ReturnValue);
        };

        it('should determine zero margin requirement for the reducing part of a maker qty (order + standing order larger than position) (buy)', () =>
          runTotalReducingLiquidityLargerThanPositionScenario('buy'));

        it('should determine zero margin requirement for the reducing part of a maker qty (order + standing order larger than position) (sell)', () =>
          runTotalReducingLiquidityLargerThanPositionScenario('sell'));

        const runIgnoreUnrelatedStandingOrdersScenario = (
          takerSide: OrderSide,
        ) => {
          const market = makeAMarket(decimalToPip('0.01'), 'FOO');
          const otherMarket = makeAMarket(decimalToPip('1'), 'BAR');

          expect(
            orderbook.calculateBuySellPanelEstimate({
              formInputs: {
                limitPrice: decimalToPip('0.01'),
                takerSide,
                desiredTradeBaseQuantity: decimalToPip('100'),
              },
              initialMarginFractionOverride: null,
              leverageParameters: market,
              makerSideOrders: [],
              market,
              wallet: {
                heldCollateral: BigInt(0),
                positions: [
                  makeAPosition({
                    market,
                    quantity: decimalToPip(
                      takerSide === 'buy' ? '-100' : '100',
                    ),
                    initialMarginRequirement: decimalToPip('0.123'),
                  }),
                ],
                quoteBalance: decimalToPip('123'),
                standingOrders: [
                  {
                    market: market.market,
                    // Other side
                    side: takerSide === 'buy' ? 'sell' : 'buy',
                    originalQuantity: '100',
                    executedQuantity: '0',
                    price: '0.01',
                  },
                  {
                    // Other market
                    market: otherMarket.market,
                    side: takerSide,
                    originalQuantity: '100',
                    executedQuantity: '0',
                    price: '0.01',
                  },
                ],
              },
            }),
          ).to.eql({
            makerBaseQuantity: decimalToPip('100'),
            makerQuoteQuantity: decimalToPip('1'),

            takerBaseQuantity: BigInt(0),
            takerQuoteQuantity: BigInt(0),
            /*
             * The maker qty reduces the position in its entirety; were any of
             * the standing orders incorrectly included, this value would be
             * non-zero.
             */
            cost: BigInt(0),
          } satisfies ReturnValue);
        };

        it('should ignore standing orders on the other side of the book or in other markets (buy)', () =>
          runIgnoreUnrelatedStandingOrdersScenario('buy'));

        it('should ignore standing orders on the other side of the book or in other markets (sell)', () =>
          runIgnoreUnrelatedStandingOrdersScenario('sell'));

        /**
         * Standing order reduces position in its entirety; new maker qty is
         * priced inside the standing order, becoming the order that fully
         * reduces the position. As a result, the standing order now requires
         * margin, while the new maker qty does not. The standing order is
         * priced outside the new maker qty and requires a different amount of
         * margin.
         */
        const runMakerQtyInsideReducingStandingOrderScenario = (
          takerSide: OrderSide,
        ) => {
          const market = makeAMarket(decimalToPip('0.01'), 'FOO');

          expect(
            orderbook.calculateBuySellPanelEstimate({
              formInputs: {
                limitPrice: decimalToPip('0.01'),
                takerSide,
                desiredTradeBaseQuantity: decimalToPip('100'),
              },
              initialMarginFractionOverride: null,
              leverageParameters: market,
              makerSideOrders: [],
              market,
              wallet: {
                heldCollateral: BigInt(0),
                positions: [
                  makeAPosition({
                    market,
                    quantity: decimalToPip(
                      takerSide === 'buy' ? '-100' : '100',
                    ),
                    initialMarginRequirement: decimalToPip('0.123'),
                  }),
                ],
                quoteBalance: decimalToPip('123'),
                standingOrders: [
                  {
                    market: market.market,
                    side: takerSide,
                    originalQuantity: '100',
                    executedQuantity: '0',
                    /*
                     * - Priced outside (worse than) the new maker qty
                     * - Worth 0.5 quote (buy) or 2 quote (sell)
                     */
                    price: takerSide === 'buy' ? '0.005' : '0.02',
                  },
                ],
              },
            }),
          ).to.eql({
            makerBaseQuantity: decimalToPip('100'),
            makerQuoteQuantity: decimalToPip('1'),

            takerBaseQuantity: BigInt(0),
            takerQuoteQuantity: BigInt(0),
            /*
             * Margin requirement for the standing order, not the new maker qty
             * (which would be 0.03).
             */
            cost: decimalToPip(takerSide === 'buy' ? '0.015' : '0.06'),
          } satisfies ReturnValue);
        };

        it('should add margin requirement for a standing order that will not reduce the position anymore (buy)', () =>
          runMakerQtyInsideReducingStandingOrderScenario('buy'));

        it('should add margin requirement for a standing order that will not reduce the position anymore (sell)', () =>
          runMakerQtyInsideReducingStandingOrderScenario('sell'));

        const runReducingStandingOrderAndPositionGetsClosedScenario = (
          takerSide: OrderSide,
        ) => {
          const market = makeAMarket(decimalToPip('0.01'), 'FOO');

          expect(
            orderbook.calculateBuySellPanelEstimate({
              formInputs: {
                limitPrice: decimalToPip('0.01'),
                takerSide,
                // Closes the position
                desiredTradeBaseQuantity: decimalToPip('100'),
              },
              initialMarginFractionOverride: null,
              leverageParameters: market,
              makerSideOrders: [
                { price: decimalToPip('0.01'), size: decimalToPip('100') },
              ],
              market,
              wallet: {
                heldCollateral: BigInt(0),
                positions: [
                  makeAPosition({
                    market,
                    quantity: decimalToPip(
                      takerSide === 'buy' ? '-100' : '100',
                    ),
                    initialMarginRequirement: decimalToPip('0.03'),
                  }),
                ],
                quoteBalance: decimalToPip('123'),
                standingOrders: [
                  {
                    // Reduces the old position. Worth 2 quote.
                    market: market.market,
                    side: takerSide,
                    originalQuantity: '100',
                    executedQuantity: '0',
                    price: '0.02',
                  },
                ],
              },
            }),
          ).to.eql({
            makerBaseQuantity: BigInt(0),
            makerQuoteQuantity: BigInt(0),

            takerBaseQuantity: decimalToPip('100'),
            takerQuoteQuantity: decimalToPip('1'),
            /*
             * The position required margin, the reducing standing order did not.
             * With the position closed (-0.03 margin), the standing order now
             * requires margin; because the standing order is priced double the
             * index price, it's worth 2 quote and requires 0.06 margin, a net
             * difference of +0.03.
             */
            cost: decimalToPip('0.03'),
          } satisfies ReturnValue);
        };

        it('should add margin requirement for a standing order that will no longer reduce a position that gets closed (buy)', () =>
          runReducingStandingOrderAndPositionGetsClosedScenario('buy'));

        it('should add margin requirement for a standing order that will no longer reduce a position that gets closed (sell)', () =>
          runReducingStandingOrderAndPositionGetsClosedScenario('sell'));

        const runReducingStandingOrderAndPositionChangesSidesScenario = (
          takerSide: OrderSide,
        ) => {
          const market = makeAMarket(decimalToPip('0.01'), 'FOO');

          expect(
            orderbook.calculateBuySellPanelEstimate({
              formInputs: {
                limitPrice: decimalToPip('0.01'),
                takerSide,
                // Closes the position and opens one on the other side of the same size
                desiredTradeBaseQuantity: decimalToPip('200'),
              },
              initialMarginFractionOverride: null,
              leverageParameters: market,
              makerSideOrders: [
                { price: decimalToPip('0.01'), size: decimalToPip('200') },
              ],
              market,
              wallet: {
                heldCollateral: BigInt(0),
                positions: [
                  makeAPosition({
                    market,
                    quantity: decimalToPip(
                      takerSide === 'buy' ? '-100' : '100',
                    ),
                    initialMarginRequirement: decimalToPip('0.03'),
                  }),
                ],
                quoteBalance: decimalToPip('123'),
                standingOrders: [
                  {
                    // Reduces the old position but not the new one
                    market: market.market,
                    side: takerSide,
                    originalQuantity: '100',
                    executedQuantity: '0',
                    price: '0.01',
                  },
                ],
              },
            }),
          ).to.eql({
            makerBaseQuantity: BigInt(0),
            makerQuoteQuantity: BigInt(0),

            takerBaseQuantity: decimalToPip('200'),
            takerQuoteQuantity: decimalToPip('2'),
            /*
             * Margin requirement for the open position is the same as before
             * (same size, opposite side), but the standing order (worth 1 quote)
             * previously reduced the position but does not anymore, and thus
             * requires margin.
             */
            cost: decimalToPip('0.03'),
          } satisfies ReturnValue);
        };

        it('should add margin requirement for a standing order that will no longer reduce a position that switches sides (buy)', () =>
          runReducingStandingOrderAndPositionChangesSidesScenario('buy'));

        it('should add margin requirement for a standing order that will no longer reduce a position that switches sides (sell)', () =>
          runReducingStandingOrderAndPositionChangesSidesScenario('sell'));

        const runStandingOrderAndNewPositionOpenedOnOtherSideScenario = (
          takerSide: OrderSide,
        ) => {
          const market = makeAMarket(decimalToPip('0.01'), 'FOO');

          expect(
            orderbook.calculateBuySellPanelEstimate({
              formInputs: {
                limitPrice: decimalToPip('0.01'),
                takerSide,
                // Opens a position
                desiredTradeBaseQuantity: decimalToPip('100'),
              },
              initialMarginFractionOverride: null,
              leverageParameters: market,
              makerSideOrders: [
                { price: decimalToPip('0.01'), size: decimalToPip('100') },
              ],
              market,
              wallet: {
                heldCollateral: BigInt(0),
                positions: [],
                quoteBalance: decimalToPip('123'),
                standingOrders: [
                  {
                    // Reduces the new position. Worth 0.1 quote.
                    market: market.market,
                    side: takerSide === 'buy' ? OrderSide.sell : OrderSide.buy,
                    originalQuantity: '100',
                    executedQuantity: '0',
                    price: '0.001',
                  },
                ],
              },
            }),
          ).to.eql({
            makerBaseQuantity: BigInt(0),
            makerQuoteQuantity: BigInt(0),

            takerBaseQuantity: decimalToPip('100'),
            takerQuoteQuantity: decimalToPip('1'),
            /*
             * The standing order used to require 0.003 margin but does not
             * anymore because it reduces the new position. The new position
             * requires 0.03 margin, a net difference of +0.027.
             */
            cost: decimalToPip('0.027'),
          } satisfies ReturnValue);
        };

        it('should subtract margin requirement for a standing order that will reduce a newly opened position (buy)', () =>
          runStandingOrderAndNewPositionOpenedOnOtherSideScenario('buy'));

        it('should subtract margin requirement for a standing order that will reduce a newly opened position (sell)', () =>
          runStandingOrderAndNewPositionOpenedOnOtherSideScenario('sell'));
      });
    });

    const runOrderBookLiquidityExceededScenario = (takerSide: OrderSide) => {
      const { market, positionInAnotherMarket, heldCollateral, quoteBalance } =
        setUpStandardTestAccount();

      expect(
        orderbook.calculateBuySellPanelEstimate({
          formInputs: {
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
            standingOrders: [],
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
            standingOrders: [],
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
            standingOrders: [],
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
            standingOrders: [],
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
            standingOrders: [],
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
            standingOrders: [],
          },
        }),
      ).to.throw(
        'sliderFactor must be a floating point number between 0 and 1',
      );
    });

    function calculateAvailableCollateral(args: {
      heldCollateral: bigint;
      market: IDEXMarket;
      positionInAnotherMarket?: IDEXPosition;
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
        decimalToPip(positionInAnotherMarket?.quantity ?? '0');

      return (
        accountValue -
        initialMarginRequirement -
        decimalToPip(positionInAnotherMarket?.marginRequirement ?? '0') -
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
            standingOrders: [],
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
            standingOrders: [],
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

    describe('Reduction of positions', () => {
      const runBasicScenario = (args: {
        takerSide: OrderSide;
        positionQty: string;
        orderQty: string;
        expectedBaseQty: string;
        expectedCost: string;
      }) => {
        const indexPrice = decimalToPip('1000');
        const market = makeAMarket(indexPrice, 'FOO');

        const position = makeAPosition({
          market,
          quantity: decimalToPip(args.positionQty),
          initialMarginRequirement:
            (absBigInt(decimalToPip(args.positionQty)) *
              indexPrice *
              decimalToPip(market.initialMarginFraction)) /
            oneInPips /
            oneInPips,
        });

        expect(
          orderbook.calculateBuySellPanelEstimate({
            formInputs: {
              takerSide: args.takerSide,
              desiredTradeBaseQuantity: decimalToPip(args.orderQty),
            },
            initialMarginFractionOverride: null,
            leverageParameters: market,
            makerSideOrders: [
              {
                price: indexPrice,
                size: decimalToPip('10'), // Large enough to fill the taker
              },
            ],
            market,
            wallet: {
              heldCollateral: BigInt(0),
              positions: [position],
              quoteBalance: decimalToPip('10000'), // Large enough to cover a short position + IMR
              standingOrders: [],
            },
          }),
        ).to.eql({
          makerBaseQuantity: BigInt(0),
          makerQuoteQuantity: BigInt(0),
          takerBaseQuantity: decimalToPip(args.expectedBaseQty),
          takerQuoteQuantity: multiplyPips(
            decimalToPip(args.expectedBaseQty),
            indexPrice,
          ),
          cost: decimalToPip(args.expectedCost),
        } satisfies ReturnValue);
      };

      const runPositionChangesSideScenario = (takerSide: OrderSide) => {
        // Open a new position
        runBasicScenario({
          takerSide,
          positionQty: '0',
          orderQty: '1',
          expectedBaseQty: '1',
          expectedCost: '30', // IMR
        });
        // Close a position
        runBasicScenario({
          takerSide,
          positionQty: takerSide === 'buy' ? '-1' : '1',
          orderQty: '1',
          expectedBaseQty: '1',
          expectedCost: '0', // Get back IMR
        });
        // Close a position and open one on other side (same size)
        runBasicScenario({
          takerSide,
          positionQty: takerSide === 'buy' ? '-1' : '1',
          orderQty: '2',
          expectedBaseQty: '2',
          expectedCost: '0', // IMRs on both sides (return and reserve) cancel out
        });
        // Close a position and open one on other side (double the size)
        runBasicScenario({
          takerSide,
          positionQty: takerSide === 'buy' ? '-1' : '1',
          orderQty: '3',
          expectedBaseQty: '3',
          expectedCost: '30', // Same as previous + IMR for position qty > 1
        });
        // Close a position and open one on other side (triple the size)
        runBasicScenario({
          takerSide,
          positionQty: takerSide === 'buy' ? '-1' : '1',
          orderQty: '4',
          expectedBaseQty: '4',
          expectedCost: '60',
        });
      };

      it('should succeed for a trade that closes a long position and/or opens a short one on the other side (taker sell)', () =>
        runPositionChangesSideScenario('sell'));

      it('should succeed for a trade that closes a short position and/or opens a long one on the other side (taker buy)', () =>
        runPositionChangesSideScenario('buy'));
    });

    describe('Reducing standing orders', () => {
      const runScenario = (args: {
        positionQty: string;
        walletsStandingOrders: {
          side: OrderSide;
          size: string;
          price?: string; // Defaults to index price (1)
        }[];
        takerSide: OrderSide;
        desiredTradeBaseQty: string;

        expectedBaseQty: string;
        expectedCost: string;
      }) => {
        const market = makeAMarket(decimalToPip('1'), 'FOO');

        const positionQuantity = decimalToPip(args.positionQty);
        const position = makeAPosition({
          market,
          quantity: positionQuantity,
          initialMarginRequirement:
            // Index price is 1
            (absBigInt(positionQuantity) *
              decimalToPip(market.initialMarginFraction)) /
            oneInPips /
            oneInPips,
        });

        const result = orderbook.calculateBuySellPanelEstimate({
          formInputs: {
            takerSide: args.takerSide,
            limitPrice: decimalToPip('1'),
            desiredTradeBaseQuantity: decimalToPip(args.desiredTradeBaseQty),
          },
          initialMarginFractionOverride: null,
          leverageParameters: market,
          makerSideOrders: [
            {
              price: decimalToPip('1'),
              size: decimalToPip('1000'),
            },
          ],
          market,
          wallet: {
            heldCollateral: BigInt(0),
            positions: [position],
            quoteBalance: decimalToPip('10000'),
            standingOrders: args.walletsStandingOrders.map((order) => ({
              market: market.market,
              side: order.side,
              originalQuantity: order.size,
              executedQuantity: '0',
              price: order.price ?? '1',
            })),
          },
        });

        expect(result).to.eql({
          makerBaseQuantity: BigInt(0),
          makerQuoteQuantity: BigInt(0),
          takerBaseQuantity: decimalToPip(args.expectedBaseQty),
          // Trade price is 1
          takerQuoteQuantity: decimalToPip(args.expectedBaseQty),
          cost: decimalToPip(args.expectedCost),
        } satisfies ReturnValue);
      };

      const runIncreasingScenario = (takerSide: OrderSide) => {
        const positionQty = takerSide === 'buy' ? '100' : '-100';

        const reducingOrderSide: OrderSide =
          takerSide === 'buy' ? 'sell' : 'buy';

        runScenario({
          positionQty,
          walletsStandingOrders: [],
          takerSide,
          desiredTradeBaseQty: '100',

          expectedBaseQty: '100',
          expectedCost: '3',
        });
        runScenario({
          positionQty,
          walletsStandingOrders: [{ side: reducingOrderSide, size: '100' }],
          takerSide,
          desiredTradeBaseQty: '100',

          expectedBaseQty: '100',
          expectedCost: '3',
        });
        runScenario({
          positionQty,
          // 50 of this order becomes reducing
          walletsStandingOrders: [{ side: reducingOrderSide, size: '150' }],
          takerSide,
          desiredTradeBaseQty: '100',

          expectedBaseQty: '100',
          expectedCost: '1.5',
        });
        runScenario({
          positionQty,
          // Same as before, but several orders
          walletsStandingOrders: [
            { side: reducingOrderSide, size: '75' },
            { side: reducingOrderSide, size: '75' },
          ],
          takerSide,
          desiredTradeBaseQty: '100',

          expectedBaseQty: '100',
          expectedCost: '1.5',
        });
        runScenario({
          positionQty,
          // All of this order becomes reducing
          walletsStandingOrders: [{ side: reducingOrderSide, size: '200' }],
          takerSide,
          desiredTradeBaseQty: '100',

          expectedBaseQty: '100',
          expectedCost: '0',
        });
        runScenario({
          positionQty,
          // Same as before but on the other side (should be ignored)
          walletsStandingOrders: [{ side: takerSide, size: '200' }],
          takerSide,
          desiredTradeBaseQty: '100',

          expectedBaseQty: '100',
          expectedCost: '3',
        });
      };

      it('should succeed for an increasing buy', () =>
        runIncreasingScenario('buy'));

      it('should succeed for an increasing sell', () =>
        runIncreasingScenario('sell'));

      const runDecreasingScenario = (takerSide: OrderSide) => {
        const positionQty = takerSide === 'buy' ? '-100' : '100';

        const decreasingCurrentPositionOrderSide = takerSide;

        // The order side that decreases a position that switched sides
        const decreasingNewlyOpenedPositionOrderSide =
          takerSide === 'buy' ? 'sell' : 'buy';

        runScenario({
          positionQty,
          walletsStandingOrders: [],
          takerSide,
          // Close the position
          desiredTradeBaseQty: '100',

          expectedBaseQty: '100',
          expectedCost: '0',
        });
        runScenario({
          positionQty,
          walletsStandingOrders: [
            {
              /*
               * This order used to be reducing, but now requires 6 margin:
               * -3 IMR freed up from closing the position
               * +6 for this order
               * = 3 cost
               */
              side: decreasingCurrentPositionOrderSide,
              size: '100',
              price: '2',
            },
          ],
          takerSide,
          // Close the position
          desiredTradeBaseQty: '100',

          expectedBaseQty: '100',
          expectedCost: '3',
        });

        runScenario({
          positionQty,
          walletsStandingOrders: [],
          takerSide,
          // Close the position and open one double the size on the other side
          desiredTradeBaseQty: '300',

          expectedBaseQty: '300',
          expectedCost: '3',
        });
        runScenario({
          positionQty,
          walletsStandingOrders: [
            {
              /*
               * This order used to require 3 margin, but is now reducing:
               * +3 IMR new margin requirement for the new position
               * -3 for this order
               * = 0 cost
               */
              side: decreasingNewlyOpenedPositionOrderSide,
              size: '100',
              price: '1',
            },
          ],
          takerSide,
          // Close the position and open one double the size on the other side
          desiredTradeBaseQty: '300',

          expectedBaseQty: '300',
          expectedCost: '0',
        });
        runScenario({
          positionQty,
          walletsStandingOrders: [
            {
              /*
               * Same as before but 1/4 the order size:
               *  This order used to require 3/4=0.75 margin, but is now reducing:
               * +3 IMR new margin requirement for the new position
               * -0.75 for this order
               * = 2.25 cost
               */
              side: decreasingNewlyOpenedPositionOrderSide,
              size: '25',
              price: '1',
            },
          ],
          takerSide,
          // Close the position and open one double the size on the other side
          desiredTradeBaseQty: '300',

          expectedBaseQty: '300',
          expectedCost: '2.25',
        });

        runScenario({
          positionQty,
          walletsStandingOrders: [
            {
              side: decreasingCurrentPositionOrderSide,
              size: '100',
              price: '1',
            },
            {
              /*
               * These two orders cancel each other out (one is reducing before,
               * the other one after).
               */
              side: decreasingNewlyOpenedPositionOrderSide,
              size: '100',
              price: '1',
            },
          ],
          takerSide,
          // Close the position and open one double the size on the other side
          desiredTradeBaseQty: '300',

          expectedBaseQty: '300',
          expectedCost: '3',
        });
      };

      it('should succeed for a decreasing buy', () =>
        runDecreasingScenario('buy'));

      it('should succeed for a decreasing sell', () =>
        runDecreasingScenario('sell'));

      const runLimitedCollateralScenario = (args: {
        positionQty: string;
        quoteBalance: string;
        walletsStandingOrders: {
          side: OrderSide;
          size: string;
          price: string;
        }[];
        takerSide: OrderSide;
        desiredTradeBaseQty: string;

        makerPrice: string;

        expectedBaseQty: string;
        expectedQuoteQty: string;
        expectedCost: string;

        expectedHeldFundsBefore: string;
        expectedHeldFundsAfter: string;
        expectedAccountValueBefore: string;
        expectedAccountValueAfter: string;
        expectedFreeCollateralBefore: string;
        expectedFreeCollateralAfter: string;
      }) => {
        const market = makeAMarket(decimalToPip('1'), 'FOO', {
          ...defaultLeverageParameters,
          initialMarginFraction: decimalToPip('0.01'),
          incrementalInitialMarginFraction: decimalToPip('0.01'),
          basePositionSize: decimalToPip('20000'),
          incrementalPositionSize: decimalToPip('1000'),
        });

        const quoteBalance = decimalToPip(args.quoteBalance);

        const positionQuantity = decimalToPip(args.positionQty);
        const position = makeAPosition({
          market,
          quantity: positionQuantity,
          initialMarginRequirement:
            // Index price is 1
            (absBigInt(positionQuantity) *
              decimalToPip(market.initialMarginFraction)) /
            oneInPips /
            oneInPips,
        });

        const standingOrders: orderbook.ActiveStandingOrder[] =
          args.walletsStandingOrders.map((order) => ({
            market: market.market,
            side: order.side,
            originalQuantity: order.size,
            executedQuantity: '0',
            price: order.price,
          }));

        const result = orderbook.calculateBuySellPanelEstimate({
          formInputs: {
            takerSide: args.takerSide,
            limitPrice: decimalToPip(args.makerPrice),
            desiredTradeBaseQuantity: decimalToPip(args.desiredTradeBaseQty),
          },
          initialMarginFractionOverride: null,
          leverageParameters: market,
          makerSideOrders: [
            {
              price: decimalToPip(args.makerPrice),
              size: decimalToPip(args.desiredTradeBaseQty),
            },
          ],
          market,
          wallet: {
            heldCollateral: BigInt(0),
            positions: [position],
            quoteBalance,
            standingOrders,
          },
        });

        const positionQtyAfter =
          args.takerSide === 'buy' ?
            positionQuantity + result.takerBaseQuantity
          : positionQuantity - result.takerBaseQuantity;

        const quoteBalanceAfter =
          args.takerSide === 'buy' ?
            quoteBalance - result.takerQuoteQuantity
          : quoteBalance + result.takerQuoteQuantity;

        const positionImrBefore =
          orderbook.calculateInitialMarginRequirementOfPosition({
            indexPrice: decimalToPip(market.indexPrice),
            initialMarginFractionOverride: null,
            leverageParameters:
              orderbook.convertToLeverageParametersBigInt(market),
            positionQty: positionQuantity,
          });

        const positionImrAfter =
          orderbook.calculateInitialMarginRequirementOfPosition({
            indexPrice: decimalToPip(market.indexPrice),
            initialMarginFractionOverride: null,
            leverageParameters:
              orderbook.convertToLeverageParametersBigInt(market),
            positionQty: positionQtyAfter,
          });

        const heldFundsBefore =
          calculateMarginRequirementForStandingOrdersInMarket({
            initialMarginFractionOverride: null,
            leverageParameters:
              orderbook.convertToLeverageParametersBigInt(market),
            orders: standingOrders.map(
              orderbook.convertToActiveStandingOrderBigInt,
            ),
            positionQty: positionQuantity,
          });
        expect(heldFundsBefore).to.eql(
          decimalToPip(args.expectedHeldFundsBefore),
        );

        const heldFundsAfter =
          calculateMarginRequirementForStandingOrdersInMarket({
            initialMarginFractionOverride: null,
            leverageParameters:
              orderbook.convertToLeverageParametersBigInt(market),
            orders: standingOrders.map(
              orderbook.convertToActiveStandingOrderBigInt,
            ),
            positionQty: positionQtyAfter,
          });
        expect(heldFundsAfter).to.eql(
          decimalToPip(args.expectedHeldFundsAfter),
        );

        const accountValueBefore = quoteBalance + positionQuantity; // Index price is 1
        expect(accountValueBefore).to.eql(
          decimalToPip(args.expectedAccountValueBefore),
        );

        const accountValueAfter = quoteBalanceAfter + positionQtyAfter;
        expect(accountValueAfter).to.eql(
          decimalToPip(args.expectedAccountValueAfter),
        );

        const freeCollateralBefore =
          accountValueBefore - positionImrBefore - heldFundsBefore;
        expect(freeCollateralBefore).to.eql(
          decimalToPip(args.expectedFreeCollateralBefore),
        );

        const freeCollateralAfter =
          accountValueAfter - positionImrAfter - heldFundsAfter;
        expect(freeCollateralAfter).to.eql(
          decimalToPip(args.expectedFreeCollateralAfter),
        );

        expect(result).to.eql({
          makerBaseQuantity: BigInt(0),
          makerQuoteQuantity: BigInt(0),
          takerBaseQuantity: decimalToPip(args.expectedBaseQty),
          takerQuoteQuantity: decimalToPip(args.expectedQuoteQty),
          cost: decimalToPip(args.expectedCost),
        } satisfies ReturnValue);
      };

      it('should stop reducing a long position when free collateral is exhausted (with a smaller, reducing standing order)', () =>
        runLimitedCollateralScenario({
          positionQty: '100',
          quoteBalance: '-80',
          walletsStandingOrders: [
            {
              /*
               * Before trade:
               *   Order reduces position and is smaller than it => No IMR
               * After trade:
               *   As the position falls below 50, some of the order requires
               *   margin and at a higher price than index => the order's IMR
               *   increases faster than the position's IMR falls; in addition,
               *   the trade price is below index, which results in collateral
               *   to be exhausted before the position is closed.
               */
              side: 'sell',
              size: '50',
              price: '1.5',
            },
          ],
          takerSide: 'sell',
          desiredTradeBaseQty: '100',

          makerPrice: '0.7',

          expectedBaseQty: '64.75409836',
          expectedQuoteQty: '45.32786885',
          expectedCost: '19',

          expectedHeldFundsBefore: '0',
          expectedHeldFundsAfter: '0.22131147',

          expectedAccountValueBefore: '20',
          expectedAccountValueAfter: '0.57377049',

          expectedFreeCollateralBefore: '19',
          expectedFreeCollateralAfter: '0.00000001',
        }));

      it('should stop reducing a long position when free collateral is exhausted (with two smaller, reducing standing orders)', () =>
        runLimitedCollateralScenario({
          positionQty: '100',
          quoteBalance: '-80',
          walletsStandingOrders: [
            /*
             * Same as the previous test but with two reducing orders that
             * cover the entire position.
             */
            {
              side: 'sell',
              size: '50',
              price: '1.5',
            },
            {
              side: 'sell',
              size: '50',
              price: '1.5',
            },
          ],
          takerSide: 'sell',
          desiredTradeBaseQty: '100',

          makerPrice: '0.7',

          expectedBaseQty: '62.29508196',
          expectedQuoteQty: '43.60655737',
          expectedCost: '19',

          expectedHeldFundsBefore: '0',
          expectedHeldFundsAfter: '0.93442622',

          expectedAccountValueBefore: '20',
          expectedAccountValueAfter: '1.31147541',

          expectedFreeCollateralBefore: '19',
          expectedFreeCollateralAfter: '0.00000001',
        }));

      it('should stop reducing a short position when free collateral is exhausted (with a smaller, reducing standing order)', () =>
        runLimitedCollateralScenario({
          positionQty: '-100',
          quoteBalance: '120',
          walletsStandingOrders: [
            {
              // Same mechanics as in the previous test; see comment above.
              side: 'buy',
              size: '50',
              price: '1.5',
            },
          ],
          takerSide: 'buy',
          desiredTradeBaseQty: '100',

          makerPrice: '1.3',

          expectedBaseQty: '64.75409836',
          expectedQuoteQty: '84.18032786',
          expectedCost: '18.99999999',

          expectedHeldFundsBefore: '0',
          expectedHeldFundsAfter: '0.22131147',

          expectedAccountValueBefore: '20',
          expectedAccountValueAfter: '0.57377050',

          expectedFreeCollateralBefore: '19',
          expectedFreeCollateralAfter: '0.00000002',
        }));

      it('should stop reducing a long position when free collateral is exhausted (with a smaller, reducing standing order) (trading at bankruptcy price)', () =>
        runLimitedCollateralScenario({
          positionQty: '100',
          quoteBalance: '-80',
          walletsStandingOrders: [
            {
              /*
               * Before trade:
               *   Order reduces position and is smaller than it => No IMR
               * After trade:
               *   The position is reduced at bankruptcy pricing; if it were
               *   closed, the quote balance would be zero. However, this order
               *   now requires margin, and the position cannot be closed
               *   entirely.
               */
              side: 'sell',
              size: '50',
              price: '0.5',
            },
          ],
          takerSide: 'sell',
          desiredTradeBaseQty: '100',

          makerPrice: '0.8',

          expectedBaseQty: '98.71794871',
          expectedQuoteQty: '78.97435896',
          expectedCost: '19.00000001',

          expectedHeldFundsBefore: '0',
          expectedHeldFundsAfter: '0.24358974',

          expectedAccountValueBefore: '20',
          expectedAccountValueAfter: '0.25641025',

          expectedFreeCollateralBefore: '19',
          expectedFreeCollateralAfter: '0',
        }));

      it('should stop reducing a short position when free collateral is exhausted (with a smaller, reducing standing order) (trading at bankruptcy price)', () =>
        runLimitedCollateralScenario({
          positionQty: '-100',
          quoteBalance: '120',
          walletsStandingOrders: [
            {
              // Same mechanics as in the previous test; see comment above.
              side: 'buy',
              size: '50',
              price: '0.5',
            },
          ],
          takerSide: 'buy',
          desiredTradeBaseQty: '100',

          makerPrice: '1.2',

          expectedBaseQty: '98.71794871',
          expectedQuoteQty: '118.46153845',
          expectedCost: '19',

          expectedHeldFundsBefore: '0',
          expectedHeldFundsAfter: '0.24358974',

          expectedAccountValueBefore: '20',
          expectedAccountValueAfter: '0.25641026',

          expectedFreeCollateralBefore: '19',
          expectedFreeCollateralAfter: '0.00000001',
        }));
    });
  });
});
