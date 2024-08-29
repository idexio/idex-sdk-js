import * as chai from 'chai';

import { decimalToPip, multiplyPips } from '#pipmath';

import * as orderbook from '#orderbook/index';

import type * as orderbookTypes from '../../../orderbook/types';

const { expect } = chai;

const defaultLeverageParameters: orderbookTypes.LeverageParametersBigInt = {
  initialMarginFraction: decimalToPip('0.1'),
  incrementalInitialMarginFraction: decimalToPip('0.02'),
  basePositionSize: decimalToPip('5'),
  incrementalPositionSize: decimalToPip('1'),
  maximumPositionSize: decimalToPip('7'),
  maintenanceMarginFraction: decimalToPip('0.01'), // Unused
};

function runDefaultScenario(
  availableCollateral: string,
  expectedResult: {
    baseQuantity: string;
    initialMarginFraction: string;
    initialMarginRequirement: string;
  },
): void {
  const expectedBaseQty = decimalToPip(expectedResult.baseQuantity);

  const limitPrice = decimalToPip('100');

  expect(
    orderbook.calculateMaximumMakerOrderSizeForAvailableCollateral({
      availableCollateral: decimalToPip(availableCollateral),
      initialMarginFractionOverride: null,
      leverageParameters: defaultLeverageParameters,
      limitPrice,
    }),
  ).to.eql({
    baseQuantity: expectedBaseQty,
    quoteQuantity: multiplyPips(expectedBaseQty, limitPrice),
    initialMarginFraction: decimalToPip(expectedResult.initialMarginFraction),
    initialMarginRequirement: decimalToPip(
      expectedResult.initialMarginRequirement,
    ),
  } satisfies ReturnType<
    typeof orderbook.calculateMaximumMakerOrderSizeForAvailableCollateral
  >);
}

describe('orderbook/quantities', () => {
  describe('calculateMaximumMakerOrderSizeForAvailableCollateral', () => {
    it('should succeed', () => {
      runDefaultScenario('0.00000010', {
        baseQuantity: '0.00000001',
        initialMarginFraction: '0.1',
        initialMarginRequirement: '0.00000010',
      });
      runDefaultScenario('1', {
        baseQuantity: '0.1',
        initialMarginFraction: '0.1',
        initialMarginRequirement: '1',
      });
      runDefaultScenario('5', {
        baseQuantity: '0.5',
        initialMarginFraction: '0.1',
        initialMarginRequirement: '5',
      });
      runDefaultScenario('50', {
        baseQuantity: '5',
        initialMarginFraction: '0.1',
        initialMarginRequirement: '50',
      });

      // Available collateral cannot support the next IMF level
      runDefaultScenario('60', {
        baseQuantity: '5',
        initialMarginFraction: '0.1',
        initialMarginRequirement: '50',
      });
      runDefaultScenario('60.00000011', {
        baseQuantity: '5',
        initialMarginFraction: '0.1',
        initialMarginRequirement: '50',
      });

      // Available collateral now can support the next IMF level
      runDefaultScenario('60.00000012', {
        baseQuantity: '5.00000001',
        initialMarginFraction: '0.12',
        initialMarginRequirement: '60.00000012',
      });
      runDefaultScenario('66', {
        baseQuantity: '5.5',
        initialMarginFraction: '0.12',
        initialMarginRequirement: '66',
      });
      runDefaultScenario('72', {
        baseQuantity: '6',
        initialMarginFraction: '0.12',
        initialMarginRequirement: '72',
      });

      // Available collateral cannot support the next IMF level
      runDefaultScenario('84.00000013', {
        baseQuantity: '6',
        initialMarginFraction: '0.12',
        initialMarginRequirement: '72',
      });

      // Available collateral now can support the next IMF level
      runDefaultScenario('84.00000014', {
        baseQuantity: '6.00000001',
        initialMarginFraction: '0.14',
        initialMarginRequirement: '84.00000014',
      });
      runDefaultScenario('91', {
        baseQuantity: '6.5',
        initialMarginFraction: '0.14',
        initialMarginRequirement: '91',
      });
      runDefaultScenario('98', {
        baseQuantity: '7',
        initialMarginFraction: '0.14',
        initialMarginRequirement: '98',
      });

      // 7 is the maximum position size
      runDefaultScenario('1000', {
        baseQuantity: '7',
        initialMarginFraction: '0.14',
        initialMarginRequirement: '98',
      });
    });
  });
});
