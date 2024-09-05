import * as chai from 'chai';

import { decimalToPip, pipToDecimal } from '#pipmath';

import { stepThroughMakerAndReducingStandingOrderQuantities } from '#orderbook/buySellPanelEstimateUtils';

import type { MakerAndReducingStandingOrderQuantityAndPrices } from '#orderbook/buySellPanelEstimateUtils';
import type * as orderbook from '#orderbook/index';
import type { OrderSide } from '#types/enums/request';

const { expect } = chai;

const fooMarketSymbol = 'FOO-USD';

function makeAStandingOrder(args: {
  side: OrderSide;
  quantity: string;
  price: string;
}): orderbook.StandingOrder {
  return {
    market: fooMarketSymbol,
    side: args.side,
    originalQuantity: pipToDecimal(decimalToPip(args.quantity)),
    executedQuantity: pipToDecimal(BigInt(0)),
    price: pipToDecimal(decimalToPip(args.price)),
  };
}

function makeAPosition(quantity: string): orderbook.Position {
  return {
    market: fooMarketSymbol,
    quantity: decimalToPip(quantity),
    indexPrice: BigInt(123),
    marginRequirement: BigInt(123),
  };
}

function assertNext(
  generator: ReturnType<
    typeof stepThroughMakerAndReducingStandingOrderQuantities
  >,
  expectedValue: MakerAndReducingStandingOrderQuantityAndPrices | undefined,
): void {
  expect(generator.next().value).to.eql(expectedValue);
}

describe('orderbook/buySellPanelEstimateUtils', () => {
  describe('stepThroughMakerAndReducingStandingOrderQuantities', () => {
    it('should succeed when no standing orders are present', () => {
      const generator = stepThroughMakerAndReducingStandingOrderQuantities({
        currentPosition: makeAPosition('60'),
        makerSideOrders: [
          // Buys
          { price: decimalToPip('3'), size: decimalToPip('30') },
          { price: decimalToPip('2'), size: decimalToPip('20') },
          { price: decimalToPip('1'), size: decimalToPip('100') },
        ],
        market: { market: fooMarketSymbol },
        takerSide: 'sell',
        walletsStandingOrders: [],
      });
      assertNext(generator, {
        quantity: decimalToPip('30'),
        makerOrderPrice: decimalToPip('3'),
        reducingStandingOrderPrice: null,
      });
      assertNext(generator, {
        quantity: decimalToPip('20'),
        makerOrderPrice: decimalToPip('2'),
        reducingStandingOrderPrice: null,
      });
      assertNext(generator, {
        quantity: decimalToPip('10'),
        makerOrderPrice: decimalToPip('1'),
        reducingStandingOrderPrice: null,
      });
      // The position is now closed and switches sides next
      assertNext(generator, {
        quantity: decimalToPip('90'), // The rest of the last maker order
        makerOrderPrice: decimalToPip('1'),
        reducingStandingOrderPrice: null,
      });

      assertNext(generator, undefined);
    });

    it('should succeed for multiple standing orders that are smaller than a maker order', () => {
      const generator = stepThroughMakerAndReducingStandingOrderQuantities({
        currentPosition: makeAPosition('60'),
        makerSideOrders: [
          // Buys
          { price: decimalToPip('1'), size: decimalToPip('100') },
          { price: decimalToPip('2'), size: decimalToPip('200') },
        ],
        market: { market: fooMarketSymbol },
        takerSide: 'sell',
        walletsStandingOrders: [
          makeAStandingOrder({
            side: 'sell',
            quantity: '10',
            price: '0.1',
          }),
          makeAStandingOrder({
            side: 'sell',
            quantity: '20',
            price: '0.2',
          }),
        ],
      });
      assertNext(generator, {
        quantity: decimalToPip('30'),
        makerOrderPrice: decimalToPip('1'),
        reducingStandingOrderPrice: null,
      });
      assertNext(generator, {
        quantity: decimalToPip('20'),
        makerOrderPrice: decimalToPip('1'),
        reducingStandingOrderPrice: decimalToPip('0.2'),
      });
      assertNext(generator, {
        quantity: decimalToPip('10'),
        makerOrderPrice: decimalToPip('1'),
        reducingStandingOrderPrice: decimalToPip('0.1'),
      });
      // The position is now closed and switches sides next
      assertNext(generator, {
        quantity: decimalToPip('40'), // The rest of the first maker order
        makerOrderPrice: decimalToPip('1'),
        reducingStandingOrderPrice: null,
      });
      assertNext(generator, {
        quantity: decimalToPip('200'),
        makerOrderPrice: decimalToPip('2'),
        reducingStandingOrderPrice: null,
      });
      assertNext(generator, undefined);
    });

    it('should succeed for multiple maker orders that are smaller than a standing order', () => {
      const generator = stepThroughMakerAndReducingStandingOrderQuantities({
        currentPosition: makeAPosition('60'),
        makerSideOrders: [
          // Buys
          { price: decimalToPip('0.3'), size: decimalToPip('30') },
          { price: decimalToPip('0.2'), size: decimalToPip('20') },
          { price: decimalToPip('0.1'), size: decimalToPip('100') },
        ],
        market: { market: fooMarketSymbol },
        takerSide: 'sell',
        walletsStandingOrders: [
          makeAStandingOrder({ side: 'sell', quantity: '200', price: '1' }),
        ],
      });
      assertNext(generator, {
        quantity: decimalToPip('30'),
        makerOrderPrice: decimalToPip('0.3'),
        reducingStandingOrderPrice: decimalToPip('1'),
      });
      assertNext(generator, {
        quantity: decimalToPip('20'),
        makerOrderPrice: decimalToPip('0.2'),
        reducingStandingOrderPrice: decimalToPip('1'),
      });
      assertNext(generator, {
        quantity: decimalToPip('10'),
        makerOrderPrice: decimalToPip('0.1'),
        reducingStandingOrderPrice: decimalToPip('1'),
      });
      // The position is now closed and switches sides next
      assertNext(generator, {
        quantity: decimalToPip('90'), // The rest of the last maker order
        makerOrderPrice: decimalToPip('0.1'),
        /*
         * The rest of the wallet's standing order is not reducing (the position
         * switched sides)
         */
        reducingStandingOrderPrice: null,
      });
      // Iteration stops when no more maker orders are left
      assertNext(generator, undefined);
    });

    it('should succeed for multiple maker and standing orders of the same size', () => {
      const generator = stepThroughMakerAndReducingStandingOrderQuantities({
        currentPosition: makeAPosition('100'),
        makerSideOrders: [
          // Buys
          { price: decimalToPip('0.4'), size: decimalToPip('40') },
          { price: decimalToPip('0.3'), size: decimalToPip('30') },
          { price: decimalToPip('0.2'), size: decimalToPip('20') },
          { price: decimalToPip('0.1'), size: decimalToPip('100') },
        ],
        market: { market: fooMarketSymbol },
        takerSide: 'sell',
        walletsStandingOrders: [
          /*
           * These get sorted by best (lowest) price and lined up with position
           * closure.
           */
          makeAStandingOrder({ side: 'sell', quantity: '10', price: '1' }),
          makeAStandingOrder({ side: 'sell', quantity: '20', price: '2' }),
          makeAStandingOrder({ side: 'sell', quantity: '30', price: '3' }),
        ],
      });
      assertNext(generator, {
        quantity: decimalToPip('40'),
        makerOrderPrice: decimalToPip('0.4'),
        reducingStandingOrderPrice: null,
      });
      assertNext(generator, {
        quantity: decimalToPip('30'),
        makerOrderPrice: decimalToPip('0.3'),
        reducingStandingOrderPrice: decimalToPip('3'),
      });
      assertNext(generator, {
        quantity: decimalToPip('20'),
        makerOrderPrice: decimalToPip('0.2'),
        reducingStandingOrderPrice: decimalToPip('2'),
      });
      assertNext(generator, {
        quantity: decimalToPip('10'),
        makerOrderPrice: decimalToPip('0.1'),
        reducingStandingOrderPrice: decimalToPip('1'),
      });
      // The position is now closed and switches sides next
      assertNext(generator, {
        quantity: decimalToPip('90'), // The rest of the last maker order
        makerOrderPrice: decimalToPip('0.1'),
        reducingStandingOrderPrice: null,
      });
      assertNext(generator, undefined);
    });

    it('should alternate the steps between maker and standing orders', () => {
      const generator = stepThroughMakerAndReducingStandingOrderQuantities({
        currentPosition: makeAPosition('32'),
        makerSideOrders: [
          // Buys
          { price: decimalToPip('0.2'), size: decimalToPip('15') },
          { price: decimalToPip('0.1'), size: decimalToPip('20') },
        ],
        market: { market: fooMarketSymbol },
        takerSide: 'sell',
        walletsStandingOrders: [
          /*
           * These get sorted by best (lowest) price and lined up with position
           * closure.
           */
          makeAStandingOrder({ side: 'sell', quantity: '10', price: '1' }),
          makeAStandingOrder({ side: 'sell', quantity: '20', price: '2' }),
        ],
      });
      /*
       * Short <-- 0 --> Long
       *           |--------------- 32 --------------| Current position
       *        |-------- 20 --------|------ 15 -----| Maker orders
       *           |--- 10 ---|-------- 20 --------|   Reducing standing (sell) orders
       *        |3 |    10    |  7   |      13     |2| Expected steps
       */
      assertNext(generator, {
        quantity: decimalToPip('2'),
        makerOrderPrice: decimalToPip('0.2'),
        reducingStandingOrderPrice: null,
      });
      assertNext(generator, {
        quantity: decimalToPip('13'),
        makerOrderPrice: decimalToPip('0.2'),
        reducingStandingOrderPrice: decimalToPip('2'),
      });
      assertNext(generator, {
        quantity: decimalToPip('7'),
        makerOrderPrice: decimalToPip('0.1'),
        reducingStandingOrderPrice: decimalToPip('2'),
      });
      assertNext(generator, {
        quantity: decimalToPip('10'),
        makerOrderPrice: decimalToPip('0.1'),
        reducingStandingOrderPrice: decimalToPip('1'),
      });
      // The position is now closed and switches sides next
      assertNext(generator, {
        quantity: decimalToPip('3'), // The rest of maker order 2
        makerOrderPrice: decimalToPip('0.1'),
        reducingStandingOrderPrice: null,
      });
      assertNext(generator, undefined);
    });
  });
});
