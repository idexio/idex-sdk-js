import * as chai from 'chai';

import { decimalToPip } from '#pipmath';

import * as orderbook from '#orderbook/index';

const { expect } = chai;

const defaultLeverageParameters: orderbook.LeverageParametersBigInt = {
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
    orderSize: string;
    initialMarginFraction: string;
    initialMarginRequirement: string;
  },
): void {
  expect(
    orderbook.calculateMaximumMakerOrderSizeForAvailableCollateral({
      availableCollateral: decimalToPip(availableCollateral),
      indexPrice: decimalToPip('100'),
      initialMarginFractionOverride: null,
      leverageParameters: defaultLeverageParameters,
    }),
  ).to.eql({
    orderSize: decimalToPip(expectedResult.orderSize),
    initialMarginFraction: decimalToPip(expectedResult.initialMarginFraction),
    initialMarginRequirement: decimalToPip(
      expectedResult.initialMarginRequirement,
    ),
  });
}

describe('orderbook/quantities', () => {
  describe('calculateMaximumMakerOrderSizeForAvailableCollateral', () => {
    it('should succeed', () => {
      runDefaultScenario('0.00000010', {
        orderSize: '0.00000001',
        initialMarginFraction: '0.1',
        initialMarginRequirement: '0.00000010',
      });
      runDefaultScenario('1', {
        orderSize: '0.1',
        initialMarginFraction: '0.1',
        initialMarginRequirement: '1',
      });
      runDefaultScenario('5', {
        orderSize: '0.5',
        initialMarginFraction: '0.1',
        initialMarginRequirement: '5',
      });
      runDefaultScenario('50', {
        orderSize: '5',
        initialMarginFraction: '0.1',
        initialMarginRequirement: '50',
      });

      // Available collateral cannot support the next IMF level
      runDefaultScenario('60', {
        orderSize: '5',
        initialMarginFraction: '0.1',
        initialMarginRequirement: '50',
      });
      runDefaultScenario('60.00000011', {
        orderSize: '5',
        initialMarginFraction: '0.1',
        initialMarginRequirement: '50',
      });

      // Available collateral now can support the next IMF level
      runDefaultScenario('60.00000012', {
        orderSize: '5.00000001',
        initialMarginFraction: '0.12',
        initialMarginRequirement: '60.00000012',
      });
      runDefaultScenario('66', {
        orderSize: '5.5',
        initialMarginFraction: '0.12',
        initialMarginRequirement: '66',
      });
      runDefaultScenario('72', {
        orderSize: '6',
        initialMarginFraction: '0.12',
        initialMarginRequirement: '72',
      });

      // Available collateral cannot support the next IMF level
      runDefaultScenario('84.00000013', {
        orderSize: '6',
        initialMarginFraction: '0.12',
        initialMarginRequirement: '72',
      });

      // Available collateral now can support the next IMF level
      runDefaultScenario('84.00000014', {
        orderSize: '6.00000001',
        initialMarginFraction: '0.14',
        initialMarginRequirement: '84.00000014',
      });
      runDefaultScenario('91', {
        orderSize: '6.5',
        initialMarginFraction: '0.14',
        initialMarginRequirement: '91',
      });
      runDefaultScenario('98', {
        orderSize: '7',
        initialMarginFraction: '0.14',
        initialMarginRequirement: '98',
      });

      // 7 is the maximum position size
      runDefaultScenario('1000', {
        orderSize: '7',
        initialMarginFraction: '0.14',
        initialMarginRequirement: '98',
      });
    });
  });
});
