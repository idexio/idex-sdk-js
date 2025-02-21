import * as chai from 'chai';

import { calculateMaximumInitialMarginFractionOverride } from '#orderbook/quantities';

import type { KumaMarket } from '#types/index';

const { expect } = chai;

const market: KumaMarket = {
  market: 'DIL-USD',
  type: 'perpetual',
  status: 'active',
  baseAsset: 'DIL',
  quoteAsset: 'USD',
  stepSize: '0.00000100',
  tickSize: '0.00000100',
  indexPrice: '100.00000000',
  indexPrice24h: '100.00000000',
  indexPricePercentChange: '0.00000000',
  lastFundingRate: null,
  currentFundingRate: null,
  nextFundingTime: 1730246400000,
  makerOrderMinimum: '0.10000000',
  takerOrderMinimum: '0.05000000',
  marketOrderExecutionPriceLimit: '0.10000000',
  limitOrderExecutionPriceLimit: '0.40000000',
  minimumPositionSize: '0.00070000',
  maximumPositionSize: '10.00000000',
  initialMarginFraction: '0.10000000',
  maintenanceMarginFraction: '0.03000000',
  basePositionSize: '1.00000000',
  incrementalPositionSize: '0.10000000',
  incrementalInitialMarginFraction: '0.01000000',
  makerFeeRate: '0.00000000',
  takerFeeRate: '0.00000000',
  volume24h: '0.00000000',
  trades24h: 0,
  openInterest: '10.10000000',
  default: true,
};

const wallet = {
  wallet: '0x36915BE02C6E9B3A7FFa342Cfb81C080DC48e0Ab',
  equity: '100.00000000',
  freeCollateral: '40.00000000',
  heldCollateral: '10.00000000',
  availableCollateral: '30.00000000',
  buyingPower: '30.00000000',
  leverage: '5.00000000',
  marginRatio: '0.20000000',
  quoteBalance: '200.00000000',
  unrealizedPnL: '0.00000000',
  makerFeeRate: '0.00000000',
  takerFeeRate: '0.00000000',
  positions: [
    {
      market: 'DIL-USD',
      quantity: '2.00000000',
      maximumQuantity: '2.00000000',
      entryPrice: '100.00000000',
      exitPrice: '100.00000000',
      markPrice: '0.00000000',
      indexPrice: '100.00000000',
      liquidationPrice: '100.00000000',
      value: '200.00000000',
      realizedPnL: '0.00000000',
      unrealizedPnL: '0.00000000',
      marginRequirement: '6.00000000',
      leverage: '5.00000000',
      totalFunding: '0.00000000',
      totalOpen: '2.00000000',
      totalClose: '0.00000000',
      adlQuintile: 1,
      openedByFillId: '27ec3e9b-cae0-3473-b68a-b170866be302',
      lastFillId: '772f1c53-782e-3f13-9660-2e331831bbd7',
      time: 1729622134888,
    },
  ],
};

describe('orderbook/quantities', () => {
  describe('calculateInitialMarginFractionWithOverride', () => {
    it('should succeed', () => {
      expect(
        calculateMaximumInitialMarginFractionOverride(market, wallet, []),
      ).to.eql('0.20000000');
      expect(
        calculateMaximumInitialMarginFractionOverride(market, wallet, [
          {
            wallet: wallet.wallet,
            market: market.market,
            initialMarginFractionOverride: null,
          },
        ]),
      ).to.eql('0.20000000');
      expect(
        calculateMaximumInitialMarginFractionOverride(market, wallet, [
          {
            wallet: wallet.wallet,
            market: market.market,
            initialMarginFractionOverride: '0.20000000',
          },
        ]),
      ).to.eql('0.32000000');

      const walletWithShortPosition = { ...wallet };
      walletWithShortPosition.positions[0].quantity = '-2.00000000';
      expect(
        calculateMaximumInitialMarginFractionOverride(
          market,
          walletWithShortPosition,
          [
            {
              wallet: wallet.wallet,
              market: market.market,
              initialMarginFractionOverride: '0.20000000',
            },
          ],
        ),
      ).to.eql('0.32000000');

      const walletWithoutPositions = { ...wallet, positions: undefined };
      expect(
        calculateMaximumInitialMarginFractionOverride(
          market,
          walletWithoutPositions,
          [],
        ),
      ).to.eql('0.40000000');
      expect(
        calculateMaximumInitialMarginFractionOverride(
          market,
          walletWithoutPositions,
          [
            {
              wallet: wallet.wallet,
              market: market.market,
              initialMarginFractionOverride: '0.20000000',
            },
          ],
        ),
      ).to.eql('0.80000000');
    });

    const walletWithoutPositionsOrHeldCollateral = {
      ...wallet,
      freeCollateral: '100.00000000',
      heldCollateral: '0.00000000',
      positions: undefined,
    };
    expect(
      calculateMaximumInitialMarginFractionOverride(
        market,
        walletWithoutPositionsOrHeldCollateral,
        [],
      ),
    ).to.eql('1.00000000');
  });
});
