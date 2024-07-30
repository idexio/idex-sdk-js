import * as chai from 'chai';

import { decimalToPip } from '#pipmath';

import * as orderbook from '#orderbook/index';

const { expect } = chai;

const defaultLeverageParameters: orderbook.LeverageParametersBigInt = {
  initialMarginFraction: decimalToPip('0.03'),
  incrementalInitialMarginFraction: decimalToPip('0.01'),
  basePositionSize: decimalToPip('1000'),
  incrementalPositionSize: decimalToPip('100'),
  maximumPositionSize: decimalToPip('100000'), // Unused
  maintenanceMarginFraction: decimalToPip('0.01'), // Unused
};

describe('orderbook/quantities', () => {
  describe('calculateInitialMarginFractionWithOverride', () => {
    it('should succeed', () => {
      const runScenario = (baseQuantity: string, expectedImf: string): void => {
        expect(
          orderbook.calculateInitialMarginFractionWithOverride({
            baseQuantity: decimalToPip(baseQuantity),
            initialMarginFractionOverride: null,
            leverageParameters: defaultLeverageParameters,
          }),
        ).to.eql(decimalToPip(expectedImf));
      };
      runScenario('1', '0.03');
      runScenario('-1', '0.03');

      runScenario('1000', '0.03');
      runScenario('1001', '0.04');
      runScenario('1100', '0.04');
      runScenario('1101', '0.05');
    });

    it('should use an IMF override, if larger', () => {
      const runScenario = (
        baseQuantity: string,
        initialMarginFractionOverride: string,
        expectedImf: string,
      ): void => {
        expect(
          orderbook.calculateInitialMarginFractionWithOverride({
            baseQuantity: decimalToPip(baseQuantity),
            initialMarginFractionOverride: decimalToPip(
              initialMarginFractionOverride,
            ),
            leverageParameters: defaultLeverageParameters,
          }),
        ).to.eql(decimalToPip(expectedImf));
      };
      runScenario('1', '0.02', '0.03');
      runScenario('1', '0.03', '0.03');
      runScenario('1', '0.04', '0.04');

      runScenario('1000', '0.04', '0.04');
      runScenario('1001', '0.04', '0.04');
      runScenario('1101', '0.04', '0.05');
    });
  });
});
