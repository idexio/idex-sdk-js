import * as chai from 'chai';

import { decimalToPip } from '#pipmath';

import * as orderbook from '#orderbook/index';
import { OrderSide } from '#types/enums/request';

const { expect } = chai;

describe('orderbook/quantities', () => {
  describe('calculateGrossFillQuantities', () => {
    const runScenario = (args: {
      makerSideOrders: orderbook.PriceAndSize[];
      takerOrder: {
        side: OrderSide;
        quantity: string;
        isQuantityInQuote: boolean;
        limitPrice?: string;
      };
      expectedBaseFillQuantity: string;
      expectedQuoteFillQuantity: string;
    }): void => {
      const takerQuantities = orderbook.calculateGrossFillQuantities(
        args.makerSideOrders,
        {
          side: args.takerOrder.side,
          quantity: decimalToPip(args.takerOrder.quantity),
          isQuantityInQuote: args.takerOrder.isQuantityInQuote,
          limitPrice:
            args.takerOrder.limitPrice ?
              decimalToPip(args.takerOrder.limitPrice)
            : undefined,
        },
      );
      expect(takerQuantities.baseQuantity).to.eql(
        decimalToPip(args.expectedBaseFillQuantity),
      );
      expect(takerQuantities.quoteQuantity).to.eql(
        decimalToPip(args.expectedQuoteFillQuantity),
      );
    };

    it('should succeed', () => {
      const sellSideMakerOrders: orderbook.PriceAndSize[] = [
        { price: decimalToPip('1'), size: decimalToPip('1') }, // 1 quote
        { price: decimalToPip('2'), size: decimalToPip('10') }, // 20 quote
        { price: decimalToPip('3'), size: decimalToPip('100') }, // 300 quote
      ];
      runScenario({
        makerSideOrders: sellSideMakerOrders,
        takerOrder: {
          side: OrderSide.buy,
          quantity: '0.5',
          isQuantityInQuote: false,
        },
        expectedBaseFillQuantity: '0.5',
        expectedQuoteFillQuantity: '0.5',
      });
      runScenario({
        makerSideOrders: sellSideMakerOrders,
        takerOrder: {
          side: OrderSide.buy,
          quantity: '1',
          isQuantityInQuote: false,
        },
        expectedBaseFillQuantity: '1',
        expectedQuoteFillQuantity: '1',
      });
      runScenario({
        makerSideOrders: sellSideMakerOrders,
        takerOrder: {
          side: OrderSide.buy,
          quantity: '6',
          isQuantityInQuote: false,
        },
        expectedBaseFillQuantity: '6',
        expectedQuoteFillQuantity: '11',
      });
      runScenario({
        makerSideOrders: sellSideMakerOrders,
        takerOrder: {
          side: OrderSide.buy,
          quantity: '11',
          isQuantityInQuote: false,
        },
        expectedBaseFillQuantity: '11',
        expectedQuoteFillQuantity: '21',
      });
      runScenario({
        makerSideOrders: sellSideMakerOrders,
        takerOrder: {
          side: OrderSide.buy,
          quantity: '61',
          isQuantityInQuote: false,
        },
        expectedBaseFillQuantity: '61',
        expectedQuoteFillQuantity: '171',
      });
      runScenario({
        makerSideOrders: sellSideMakerOrders,
        takerOrder: {
          side: OrderSide.buy,
          quantity: '200', // More than available liquidity
          isQuantityInQuote: false,
        },
        expectedBaseFillQuantity: '111',
        expectedQuoteFillQuantity: '321',
      });
    });

    it('should succeed for a taker quantity specified in quote', () => {
      const sellSideMakerOrders: orderbook.PriceAndSize[] = [
        { price: decimalToPip('1'), size: decimalToPip('1') }, // 1 quote
        { price: decimalToPip('2'), size: decimalToPip('10') }, // 20 quote
        { price: decimalToPip('3'), size: decimalToPip('100') }, // 300 quote
      ];
      runScenario({
        makerSideOrders: sellSideMakerOrders,
        takerOrder: {
          side: OrderSide.buy,
          quantity: '0.5',
          isQuantityInQuote: true,
        },
        expectedBaseFillQuantity: '0.5',
        expectedQuoteFillQuantity: '0.5',
      });
      runScenario({
        makerSideOrders: sellSideMakerOrders,
        takerOrder: {
          side: OrderSide.buy,
          quantity: '1',
          isQuantityInQuote: true,
        },
        expectedBaseFillQuantity: '1',
        expectedQuoteFillQuantity: '1',
      });
      runScenario({
        makerSideOrders: sellSideMakerOrders,
        takerOrder: {
          side: OrderSide.buy,
          quantity: '11',
          isQuantityInQuote: true,
        },
        expectedBaseFillQuantity: '6',
        expectedQuoteFillQuantity: '11',
      });
      runScenario({
        makerSideOrders: sellSideMakerOrders,
        takerOrder: {
          side: OrderSide.buy,
          quantity: '21',
          isQuantityInQuote: true,
        },
        expectedBaseFillQuantity: '11',
        expectedQuoteFillQuantity: '21',
      });
      runScenario({
        makerSideOrders: sellSideMakerOrders,
        takerOrder: {
          side: OrderSide.buy,
          quantity: '171',
          isQuantityInQuote: true,
        },
        expectedBaseFillQuantity: '61',
        expectedQuoteFillQuantity: '171',
      });
      runScenario({
        makerSideOrders: sellSideMakerOrders,
        takerOrder: {
          side: OrderSide.buy,
          quantity: '1000', // More than available liquidity
          isQuantityInQuote: true,
        },
        expectedBaseFillQuantity: '111',
        expectedQuoteFillQuantity: '321',
      });
    });

    it('should support multiple orders per price level', () => {
      const sellSideMakerOrders: orderbook.PriceAndSize[] = [
        { price: decimalToPip('1'), size: decimalToPip('1') },
        { price: decimalToPip('1'), size: decimalToPip('1') },
        { price: decimalToPip('2'), size: decimalToPip('1') },
      ];
      runScenario({
        makerSideOrders: sellSideMakerOrders,
        takerOrder: {
          side: OrderSide.buy,
          quantity: '1.5',
          isQuantityInQuote: false,
        },
        expectedBaseFillQuantity: '1.5',
        expectedQuoteFillQuantity: '1.5',
      });
      runScenario({
        makerSideOrders: sellSideMakerOrders,
        takerOrder: {
          side: OrderSide.buy,
          quantity: '1.5',
          isQuantityInQuote: true,
        },
        expectedBaseFillQuantity: '1.5',
        expectedQuoteFillQuantity: '1.5',
      });

      runScenario({
        makerSideOrders: sellSideMakerOrders,
        takerOrder: {
          side: OrderSide.buy,
          quantity: '3',
          isQuantityInQuote: false,
        },
        expectedBaseFillQuantity: '3',
        expectedQuoteFillQuantity: '4',
      });
      runScenario({
        makerSideOrders: sellSideMakerOrders,
        takerOrder: {
          side: OrderSide.buy,
          quantity: '4',
          isQuantityInQuote: true,
        },
        expectedBaseFillQuantity: '3',
        expectedQuoteFillQuantity: '4',
      });
    });

    it('should limit by price (buy)', () => {
      const sellSideMakerOrders: orderbook.PriceAndSize[] = [
        { price: decimalToPip('1'), size: decimalToPip('1') }, // 1 quote
        { price: decimalToPip('2'), size: decimalToPip('1') }, // 2 quote
        { price: decimalToPip('3'), size: decimalToPip('1') }, // 3 quote
      ];
      runScenario({
        makerSideOrders: sellSideMakerOrders,
        takerOrder: {
          side: OrderSide.buy,
          quantity: '1000', // More than available liquidity
          isQuantityInQuote: false,
          limitPrice: '2',
        },
        expectedBaseFillQuantity: '2',
        expectedQuoteFillQuantity: '3',
      });
    });

    it('should limit by price (sell)', () => {
      const buySideMakerOrders: orderbook.PriceAndSize[] = [
        { price: decimalToPip('3'), size: decimalToPip('1') }, // 3 quote
        { price: decimalToPip('2'), size: decimalToPip('1') }, // 2 quote
        { price: decimalToPip('1'), size: decimalToPip('1') }, // 1 quote
      ];
      runScenario({
        makerSideOrders: buySideMakerOrders,
        takerOrder: {
          side: OrderSide.sell,
          quantity: '1000', // More than available liquidity
          isQuantityInQuote: false,
          limitPrice: '2',
        },
        expectedBaseFillQuantity: '2',
        expectedQuoteFillQuantity: '5',
      });
    });

    it('should return zero if the limit price does not cross the spread (buy)', () => {
      const sellSideMakerOrders: orderbook.PriceAndSize[] = [
        { price: decimalToPip('1'), size: decimalToPip('1') },
      ];
      runScenario({
        makerSideOrders: sellSideMakerOrders,
        takerOrder: {
          side: OrderSide.buy,
          quantity: '1',
          isQuantityInQuote: false,
          limitPrice: '0.5',
        },
        expectedBaseFillQuantity: '0',
        expectedQuoteFillQuantity: '0',
      });
    });

    it('should return zero if the limit price does not cross the spread (sell)', () => {
      const buySideMakerOrders: orderbook.PriceAndSize[] = [
        { price: decimalToPip('1'), size: decimalToPip('1') },
      ];
      runScenario({
        makerSideOrders: buySideMakerOrders,
        takerOrder: {
          side: OrderSide.sell,
          quantity: '1',
          isQuantityInQuote: false,
          limitPrice: '2',
        },
        expectedBaseFillQuantity: '0',
        expectedQuoteFillQuantity: '0',
      });
    });

    it('should support double-pip precision', () => {
      const makerSideOrders: orderbook.PriceAndSize[] = [
        { price: decimalToPip('3'), size: decimalToPip('1') },
      ];

      const takerQuantities = orderbook.calculateGrossFillQuantities(
        makerSideOrders,
        {
          side: OrderSide.buy,
          quantity: decimalToPip('1'),
          isQuantityInQuote: false,
        },
        false,
      );
      expect(takerQuantities.baseQuantity).to.eql(decimalToPip('1'));
      expect(takerQuantities.quoteQuantity).to.eql(decimalToPip('3'));

      const takerQuantities2p = orderbook.calculateGrossFillQuantities(
        makerSideOrders,
        {
          side: OrderSide.buy,
          quantity: decimalToPip('1'),
          isQuantityInQuote: false,
        },
        true,
      );
      expect(takerQuantities2p.baseQuantity).to.eql(
        BigInt(10000000000000000), // 1 in 16 decimals
      );
      expect(takerQuantities2p.quoteQuantity).to.eql(
        BigInt(30000000000000000), // 3 in 16 decimals
      );
    });

    it('should support double-pip precision (taker quantity specified in quote)', () => {
      const makerSideOrders: orderbook.PriceAndSize[] = [
        { price: decimalToPip('3'), size: decimalToPip('1') },
      ];

      const takerQuantities = orderbook.calculateGrossFillQuantities(
        makerSideOrders,
        {
          side: OrderSide.buy,
          quantity: decimalToPip('1'), // 1/3 of the available quote
          isQuantityInQuote: true,
        },
        false,
      );
      expect(takerQuantities.baseQuantity).to.eql(decimalToPip('0.33333333'));
      expect(takerQuantities.quoteQuantity).to.eql(decimalToPip('1'));

      const takerQuantities2p = orderbook.calculateGrossFillQuantities(
        makerSideOrders,
        {
          side: OrderSide.buy,
          quantity: decimalToPip('1'), // 1/3 of the available quote
          isQuantityInQuote: true,
        },
        true,
      );
      expect(takerQuantities2p.baseQuantity).to.eql(
        BigInt(3333333333333333), // 1/3 in 16 decimals
      );
      expect(takerQuantities2p.quoteQuantity).to.eql(
        BigInt(10000000000000000), // 1 in 16 decimals
      );
    });
  });
});
