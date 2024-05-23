import * as chai from 'chai';

import { decimalToPip, pipToDecimal } from '#pipmath';

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

describe('orderbook/quantities', () => {
  describe('calculateBuySellPanelEstimate', () => {
    it('should succeed for a buy', () => {
      const sellSideMakerOrders: orderbook.PriceAndSize[] = [
        { price: decimalToPip('0.011'), size: decimalToPip('1000') },
        { price: decimalToPip('0.012'), size: decimalToPip('1000') },
        { price: decimalToPip('0.013'), size: decimalToPip('1000') },
        { price: decimalToPip('0.014'), size: decimalToPip('1000') },
      ];
      const { market, positionInAnotherMarket, heldCollateral, quoteBalance } =
        setUpStandardTestAccount();

      expect(
        orderbook.calculateBuySellPanelEstimate({
          allWalletPositions: [positionInAnotherMarket],
          heldCollateral,
          initialMarginFractionOverride: null,
          leverageParameters: market,
          makerSideOrders: sellSideMakerOrders,
          market,
          quoteBalance,
          sliderFactor: 0.97,
          takerSide: 'buy',
        }),
      ).to.eql({
        baseQuantity: decimalToPip('3651.16279069'),
        quoteQuantity: decimalToPip('45.11627906'),
      });
    });

    /**
     * Same as above, but matching continues after order #4 even though the
     * taker has no buying power remaining, and should stop with order #5.
     * Asserts that the equation correctly yields zero for order #5.
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
          allWalletPositions: [positionInAnotherMarket],
          heldCollateral,
          initialMarginFractionOverride: null,
          leverageParameters: market,
          makerSideOrders: sellSideMakerOrders,
          market,
          quoteBalance,
          sliderFactor: 0.97,
          takerSide: 'buy',
        }),
      ).to.eql({
        baseQuantity: decimalToPip('3651.16279069'),
        quoteQuantity: decimalToPip('45.11627906'),
      });
    });

    it('should succeed for a sell', () => {
      const buySideMakerOrders: orderbook.PriceAndSize[] = [
        { price: decimalToPip('0.009'), size: decimalToPip('1000') },
        { price: decimalToPip('0.008'), size: decimalToPip('1000') },
        { price: decimalToPip('0.007'), size: decimalToPip('1000') },
        { price: decimalToPip('0.006'), size: decimalToPip('1000') },
      ];
      const { market, positionInAnotherMarket, heldCollateral, quoteBalance } =
        setUpStandardTestAccount();

      expect(
        orderbook.calculateBuySellPanelEstimate({
          allWalletPositions: [positionInAnotherMarket],
          heldCollateral,
          initialMarginFractionOverride: null,
          leverageParameters: market,
          makerSideOrders: buySideMakerOrders,
          market,
          quoteBalance,
          sliderFactor: 0.97,
          takerSide: 'sell',
        }),
      ).to.eql({
        baseQuantity: decimalToPip('-3651.16279069'),
        quoteQuantity: decimalToPip('-27.90697674'),
      });
    });

    /**
     * Same as above, but matching continues after order #4 even though the
     * taker has no buying power remaining, and should stop with order #5.
     * Asserts that the equation correctly yields zero for order #5.
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
          allWalletPositions: [positionInAnotherMarket],
          heldCollateral,
          initialMarginFractionOverride: null,
          leverageParameters: market,
          makerSideOrders: buySideMakerOrders,
          market,
          quoteBalance,
          sliderFactor: 0.97,
          takerSide: 'sell',
        }),
      ).to.eql({
        baseQuantity: decimalToPip('-3651.16279069'),
        quoteQuantity: decimalToPip('-27.90697674'),
      });
    });

    const runOrderBookLiquidityExceededScenario = (
      takerSide: 'buy' | 'sell',
    ) => {
      const { market, positionInAnotherMarket, heldCollateral, quoteBalance } =
        setUpStandardTestAccount();

      expect(
        orderbook.calculateBuySellPanelEstimate({
          allWalletPositions: [positionInAnotherMarket],
          heldCollateral,
          initialMarginFractionOverride: null,
          leverageParameters: market,
          market,
          quoteBalance,
          makerSideOrders: [
            {
              price: decimalToPip(takerSide === 'buy' ? '0.011' : '0.009'),
              size: decimalToPip('1'),
            },
          ],
          sliderFactor: 0.97,
          takerSide,
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
          allWalletPositions: [positionInAnotherMarket],
          heldCollateral,
          initialMarginFractionOverride: null,
          leverageParameters: market,
          makerSideOrders: [
            { price: decimalToPip('123'), size: decimalToPip('123') },
          ],
          market,
          quoteBalance:
            availableCollateral === 'negative' ? decimalToPip('-1') : BigInt(0),
          sliderFactor: 0.123,
          takerSide: 'buy',
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

    it('should return zero for a zero sliderFactor', () => {
      const { market, positionInAnotherMarket, heldCollateral, quoteBalance } =
        setUpStandardTestAccount();

      expect(
        orderbook.calculateBuySellPanelEstimate({
          allWalletPositions: [positionInAnotherMarket],
          heldCollateral,
          initialMarginFractionOverride: null,
          leverageParameters: market,
          makerSideOrders: [
            { price: decimalToPip('123'), size: decimalToPip('123') },
          ],
          market,
          quoteBalance,
          sliderFactor: 0,
          takerSide: 'buy',
        }),
      ).to.eql({
        baseQuantity: BigInt(0),
        quoteQuantity: BigInt(0),
      });
    });

    it('should reject a negative sliderFactor', () => {
      const { market, positionInAnotherMarket, heldCollateral, quoteBalance } =
        setUpStandardTestAccount();

      expect(() =>
        orderbook.calculateBuySellPanelEstimate({
          allWalletPositions: [positionInAnotherMarket],
          heldCollateral,
          initialMarginFractionOverride: null,
          leverageParameters: market,
          makerSideOrders: [],
          market,
          quoteBalance,
          sliderFactor: -0.123,
          takerSide: 'buy',
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
          allWalletPositions: [positionInAnotherMarket],
          heldCollateral,
          initialMarginFractionOverride: null,
          leverageParameters: market,
          makerSideOrders: [],
          market,
          quoteBalance,
          sliderFactor: 1.1,
          takerSide: 'buy',
        }),
      ).to.throw(
        'sliderFactor must be a floating point number between 0 and 1',
      );
    });

    const runIndexPriceMismatchBuyScenario = (arePricesEqual: boolean) => {
      const { market, positionInAnotherMarket, heldCollateral, quoteBalance } =
        setUpStandardTestAccount();

      expect(
        orderbook.calculateBuySellPanelEstimate({
          allWalletPositions: [positionInAnotherMarket],
          heldCollateral,
          initialMarginFractionOverride: null,
          leverageParameters: market,
          makerSideOrders: [
            {
              price: decimalToPip(arePricesEqual ? '0.01' : '0.009'),
              size: decimalToPip('123'),
            },
          ],
          market,
          quoteBalance,
          sliderFactor: 0.123,
          takerSide: 'buy',
        }),
      ).to.eql({
        baseQuantity: BigInt(0),
        quoteQuantity: BigInt(0),
      });
    };

    it('should stop matching when the index price exceeds a maker sell price (taker buy)', () =>
      runIndexPriceMismatchBuyScenario(false));

    it('should stop matching when the index price is equal to a maker sell price (taker buy)', () =>
      runIndexPriceMismatchBuyScenario(true));

    const runIndexPriceMismatchSellScenario = (arePricesEqual: boolean) => {
      const { market, positionInAnotherMarket, heldCollateral, quoteBalance } =
        setUpStandardTestAccount();

      expect(
        orderbook.calculateBuySellPanelEstimate({
          allWalletPositions: [positionInAnotherMarket],
          heldCollateral,
          initialMarginFractionOverride: null,
          leverageParameters: market,
          makerSideOrders: [
            {
              price: decimalToPip(arePricesEqual ? '0.01' : '0.011'),
              size: decimalToPip('123'),
            },
          ],
          market,
          quoteBalance,
          sliderFactor: 0.123,
          takerSide: 'sell',
        }),
      ).to.eql({
        baseQuantity: BigInt(0),
        quoteQuantity: BigInt(0),
      });
    };

    it('should stop matching when the index price is below a maker buy price (taker sell)', () =>
      runIndexPriceMismatchSellScenario(false));

    it('should stop matching when the index price is equal to a maker buy price (taker sell)', () =>
      runIndexPriceMismatchSellScenario(true));
  });
});
