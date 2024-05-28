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
          },
        }),
      ).to.eql({
        baseQuantity: decimalToPip('3651.16279069'),
        quoteQuantity: decimalToPip('45.11627906'),
      });
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
          },
        }),
      ).to.eql({
        baseQuantity: decimalToPip('-3651.16279069'),
        quoteQuantity: decimalToPip('-27.90697674'),
      });
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
          },
        }),
      ).to.eql({
        baseQuantity: decimalToPip('2000'),
        quoteQuantity: decimalToPip('23'),
      });
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
          },
        }),
      ).to.eql({
        baseQuantity: decimalToPip('-2000'),
        quoteQuantity: decimalToPip('-17'),
      });
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
          },
        }),
      ).to.eql({
        baseQuantity: decimalToPip('3651.16279069'),
        quoteQuantity: decimalToPip('45.11627906'),
      });
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
          },
        }),
      ).to.eql({
        baseQuantity: decimalToPip('-3651.16279069'),
        quoteQuantity: decimalToPip('-27.90697674'),
      });
    });

    const runDesiredPositionQtyBuyScenario = (
      desiredQtys:
        | {
            desiredPositionBaseQuantity: bigint;
          }
        | {
            desiredPositionQuoteQuantity: bigint;
          },
      expectedResult: {
        baseQuantity: bigint;
        quoteQuantity: bigint;
      },
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
          },
        }),
      ).to.eql(expectedResult);
    };

    describe('desiredPositionBaseQuantity (buy)', () => {
      it('should succeed', () =>
        runDesiredPositionQtyBuyScenario(
          {
            desiredPositionBaseQuantity: decimalToPip('3000'),
          },
          {
            baseQuantity: decimalToPip('3000'),
            quoteQuantity: decimalToPip('36'),
          },
        ));

      it("should not exceed the taker's buying power", () =>
        runDesiredPositionQtyBuyScenario(
          {
            desiredPositionBaseQuantity: decimalToPip('4000'),
          },
          {
            baseQuantity: decimalToPip('3720.93023255'),
            quoteQuantity: decimalToPip('46.09302325'),
          },
        ));
    });

    describe('desiredPositionQuoteQuantity (buy)', () => {
      it('should succeed', () =>
        runDesiredPositionQtyBuyScenario(
          {
            desiredPositionQuoteQuantity: decimalToPip('40'),
          },
          {
            baseQuantity: decimalToPip('3285.71428587'),
            quoteQuantity: decimalToPip('40'),
          },
        ));

      it("should not exceed the taker's buying power", () =>
        runDesiredPositionQtyBuyScenario(
          {
            desiredPositionQuoteQuantity: decimalToPip('50'),
          },
          {
            baseQuantity: decimalToPip('3720.93023255'),
            quoteQuantity: decimalToPip('46.09302325'),
          },
        ));
    });

    const runDesiredPositionQtySellScenario = (
      desiredQtys:
        | {
            desiredPositionBaseQuantity: bigint;
          }
        | {
            desiredPositionQuoteQuantity: bigint;
          },
      expectedResult: {
        baseQuantity: bigint;
        quoteQuantity: bigint;
      },
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
          },
        }),
      ).to.eql(expectedResult);
    };

    describe('desiredPositionBaseQuantity (sell)', () => {
      it('should succeed', () =>
        runDesiredPositionQtySellScenario(
          {
            desiredPositionBaseQuantity: decimalToPip('-3000'),
          },
          {
            baseQuantity: decimalToPip('-3000'),
            quoteQuantity: decimalToPip('-24'),
          },
        ));

      it('should ensure the correct sign', () =>
        runDesiredPositionQtySellScenario(
          {
            // Positive value, should be interpreted as a negative value
            desiredPositionBaseQuantity: decimalToPip('3000'),
          },
          {
            baseQuantity: decimalToPip('-3000'),
            quoteQuantity: decimalToPip('-24'),
          },
        ));

      it("should not exceed the taker's buying power", () =>
        runDesiredPositionQtySellScenario(
          {
            desiredPositionBaseQuantity: decimalToPip('-4000'),
          },
          {
            baseQuantity: decimalToPip('-3720.93023255'),
            quoteQuantity: decimalToPip('-28.32558139'),
          },
        ));
    });

    describe('desiredPositionQuoteQuantity (sell)', () => {
      it('should succeed', () =>
        runDesiredPositionQtySellScenario(
          {
            desiredPositionQuoteQuantity: decimalToPip('-20'),
          },
          {
            baseQuantity: decimalToPip('-2428.57142875'),
            quoteQuantity: decimalToPip('-20'),
          },
        ));

      it('should ensure the correct sign', () =>
        runDesiredPositionQtySellScenario(
          {
            // Positive value, should be interpreted as a negative value
            desiredPositionQuoteQuantity: decimalToPip('20'),
          },
          {
            baseQuantity: decimalToPip('-2428.57142875'),
            quoteQuantity: decimalToPip('-20'),
          },
        ));

      it("should not exceed the taker's buying power", () =>
        runDesiredPositionQtySellScenario(
          {
            desiredPositionQuoteQuantity: decimalToPip('-30'),
          },
          {
            baseQuantity: decimalToPip('-3720.93023255'),
            quoteQuantity: decimalToPip('-28.32558139'),
          },
        ));
    });

    const runOrderBookLiquidityExceededScenario = (
      takerSide: 'buy' | 'sell',
    ) => {
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
          },
        }),
      ).to.eql({
        baseQuantity: decimalToPip(takerSide === 'buy' ? '1' : '-1'),
        quoteQuantity: decimalToPip(takerSide === 'buy' ? '0.011' : '-0.009'),
      });
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
          },
        }),
      ).to.eql({
        baseQuantity: BigInt(0),
        quoteQuantity: BigInt(0),
      });
    };

    it('should return zero for zero availableCollateral', () =>
      runNoAvailableCollateralScenario('zero'));

    it('should return zero for negative availableCollateral', () =>
      runNoAvailableCollateralScenario('negative'));

    const runWrongNumberOfQtyInputsScenario = (qtyInputs: {
      desiredPositionBaseQuantity?: bigint;
      desiredPositionQuoteQuantity?: bigint;
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
        'Either desiredPositionBaseQuantity, desiredPositionQuoteQuantity, or sliderFactor needs to be provided',
      );
    };

    it('should require at least one quantity input ', () =>
      runWrongNumberOfQtyInputsScenario({}));

    it('should reject multiple quantity inputs ', () => {
      runWrongNumberOfQtyInputsScenario({
        desiredPositionBaseQuantity: BigInt(123),
        desiredPositionQuoteQuantity: BigInt(123),
      });
      runWrongNumberOfQtyInputsScenario({
        desiredPositionBaseQuantity: BigInt(123),
        sliderFactor: 0.123,
      });
      runWrongNumberOfQtyInputsScenario({
        desiredPositionBaseQuantity: BigInt(123),
        desiredPositionQuoteQuantity: BigInt(123),
        sliderFactor: 0.123,
      });
    });

    const runZeroInputScenario = (qtyInputs: {
      desiredPositionBaseQuantity?: bigint;
      desiredPositionQuoteQuantity?: bigint;
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
        baseQuantity: BigInt(0),
        quoteQuantity: BigInt(0),
      });
    };

    it('should return zero for a zero desiredPositionBaseQuantity', () =>
      runZeroInputScenario({ desiredPositionBaseQuantity: BigInt(0) }));

    it('should return zero for a zero desiredPositionQuoteQuantity', () =>
      runZeroInputScenario({ desiredPositionQuoteQuantity: BigInt(0) }));

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
        baseQuantity: expectedBaseQty,
        quoteQuantity: expectedQuoteQty,
      });

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
          },
        }),
      ).to.eql({
        baseQuantity: expectedBaseQty,
        quoteQuantity: expectedQuoteQty,
      });

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
