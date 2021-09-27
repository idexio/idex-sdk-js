import { RestResponseOrderBookLevel2 } from '../types';
import OrderBookRealTimeClient from './client';

const chain = 'matic';
const isSandbox = true;
const market = 'MATIC-USD';
const l2LevelsToDisplay = 5;

const client = new OrderBookRealTimeClient(true, chain);

const demo = async function demo(): Promise<RestResponseOrderBookLevel2> {
  return client.start([market]).then(() => {
    client.setCustomFeeRates({
      idexFeeRate: '0.00000000',
      takerMinimumInNativeAsset: '0.000001',
    });
    return client.getOrderBookL2(market, isSandbox, l2LevelsToDisplay);
  });
};

demo().then((l2Initial: RestResponseOrderBookLevel2) => {
  console.log('Initial order book', l2Initial);

  client.on('l2Changed', () => {
    client
      .getOrderBookL2(market, isSandbox, l2LevelsToDisplay)
      .then(console.log);
  });
});
