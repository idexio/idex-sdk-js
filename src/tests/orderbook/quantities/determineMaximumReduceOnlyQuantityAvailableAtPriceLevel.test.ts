import * as chai from 'chai';

import { decimalToPip, pipToDecimal } from '#pipmath';

import * as orderbook from '#orderbook/index';

import type { KumaPosition } from '#types/rest/endpoints/index';
import type { OrderSide } from '../../../types/enums/request';

const { expect } = chai;

function makeAPosition(marketSymbol: string, quantity: string): KumaPosition {
  // All empty values are not used by the function under test
  return {
    market: marketSymbol,
    quantity: pipToDecimal(decimalToPip(quantity)),
    maximumQuantity: '',
    entryPrice: '',
    exitPrice: '',
    markPrice: '',
    indexPrice: '1',
    liquidationPrice: '',
    value: '',
    realizedPnL: '',
    unrealizedPnL: '',
    marginRequirement: '',
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

function makeAStandingOrder(args: {
  marketSymbol: string;
  side: OrderSide;
  quantity: string;
  price: string;
}): orderbook.StandingOrder {
  return {
    market: args.marketSymbol,
    side: args.side,
    originalQuantity: pipToDecimal(decimalToPip(args.quantity)),
    executedQuantity: pipToDecimal(BigInt(0)),
    price: pipToDecimal(decimalToPip(args.price)),
  };
}

describe('orderbook/quantities', () => {
  describe('determineMaximumReduceOnlyQuantityAvailableAtPriceLevel', () => {
    const fooMarketSymbol = 'FOO-USD';

    const makeOrder = (
      side: OrderSide,
      price: string,
      marketSymbol = fooMarketSymbol,
    ) =>
      makeAStandingOrder({
        marketSymbol,
        side,
        quantity: '1',
        price,
      });

    it('should succeed for a long position and sell orders', () => {
      const runScenario = (limitPrice: string, expectedQtyAvailable: string) =>
        expect(
          orderbook.determineMaximumReduceOnlyQuantityAvailableAtPriceLevel({
            limitPrice: decimalToPip(limitPrice),
            position: makeAPosition(fooMarketSymbol, '3'),
            orderSide: 'sell',
            walletsStandingOrders: [
              makeOrder('sell', '10'),
              makeOrder('sell', '11'),
              makeOrder('sell', '12'),
            ],
          }),
        ).to.eql(decimalToPip(expectedQtyAvailable));

      runScenario('9', '3');
      runScenario('10', '2');
      runScenario('11', '1');
      runScenario('12', '0');
      runScenario('13', '0');
    });

    it('should succeed for a short position and buy orders', () => {
      const runScenario = (limitPrice: string, expectedQtyAvailable: string) =>
        expect(
          orderbook.determineMaximumReduceOnlyQuantityAvailableAtPriceLevel({
            limitPrice: decimalToPip(limitPrice),
            position: makeAPosition(fooMarketSymbol, '-3'),
            orderSide: 'buy',
            walletsStandingOrders: [
              makeOrder('buy', '10'),
              makeOrder('buy', '9'),
              makeOrder('buy', '8'),
            ],
          }),
        ).to.eql(decimalToPip(expectedQtyAvailable));

      runScenario('11', '3');
      runScenario('10', '2');
      runScenario('9', '1');
      runScenario('8', '0');
      runScenario('7', '0');
    });

    it('should ignore orders in other markets or on the other side of the book (long position)', () => {
      expect(
        orderbook.determineMaximumReduceOnlyQuantityAvailableAtPriceLevel({
          limitPrice: decimalToPip('1'),
          position: makeAPosition(fooMarketSymbol, '3'),
          orderSide: 'sell',
          walletsStandingOrders: [
            makeOrder('buy', '1'), // Wrong side
            makeOrder('sell', '1', 'BAR-USD'), // Wrong market
          ],
        }),
      ).to.eql(decimalToPip('3'));
    });

    it('should ignore orders in other markets or on the other side of the book (short position)', () => {
      expect(
        orderbook.determineMaximumReduceOnlyQuantityAvailableAtPriceLevel({
          limitPrice: decimalToPip('1'),
          position: makeAPosition(fooMarketSymbol, '-3'),
          orderSide: 'buy',
          walletsStandingOrders: [
            makeOrder('sell', '1'), // Wrong side
            makeOrder('buy', '1', 'BAR-USD'), // Wrong market
          ],
        }),
      ).to.eql(decimalToPip('3'));
    });

    it('should return zero for a long position and a buy order', () => {
      expect(
        orderbook.determineMaximumReduceOnlyQuantityAvailableAtPriceLevel({
          limitPrice: decimalToPip('123'),
          position: makeAPosition(fooMarketSymbol, '123'),
          orderSide: 'buy',
          walletsStandingOrders: [],
        }),
      ).to.eql(BigInt(0));
    });

    it('should return zero for a short position and a sell order', () => {
      expect(
        orderbook.determineMaximumReduceOnlyQuantityAvailableAtPriceLevel({
          limitPrice: decimalToPip('123'),
          position: makeAPosition(fooMarketSymbol, '-123'),
          orderSide: 'sell',
          walletsStandingOrders: [],
        }),
      ).to.eql(BigInt(0));
    });

    it('should return zero for a closed position', () => {
      expect(
        orderbook.determineMaximumReduceOnlyQuantityAvailableAtPriceLevel({
          limitPrice: decimalToPip('123'),
          position: makeAPosition(fooMarketSymbol, '0'),
          orderSide: 'buy',
          walletsStandingOrders: [],
        }),
      ).to.eql(BigInt(0));

      expect(
        orderbook.determineMaximumReduceOnlyQuantityAvailableAtPriceLevel({
          limitPrice: decimalToPip('123'),
          position: makeAPosition(fooMarketSymbol, '0'),
          orderSide: 'sell',
          walletsStandingOrders: [],
        }),
      ).to.eql(BigInt(0));
    });
  });
});
