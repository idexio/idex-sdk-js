import { decimalToPip } from '.';
import {
  RestResponseOrderBookLevel1,
  RestResponseOrderBookLevel2,
} from '../types';
import OrderBookRealTimeClient from './client';

// @todo retrieve these configs from exchange endpoint
const client = new OrderBookRealTimeClient(
  true,
  'matic',
  ['DIL-MATIC'],
  decimalToPip('0.002'),
  decimalToPip('0.0005'),
  decimalToPip('0.49'),
);

const demo = async function demo(): Promise<
  [RestResponseOrderBookLevel1, RestResponseOrderBookLevel2]
> {
  return Promise.all([
    client.getOrderBookL1('DIL-MATIC', true),
    client.getOrderBookL2('DIL-MATIC', true),
  ]);
};

demo().then(
  ([l1]: [RestResponseOrderBookLevel1, RestResponseOrderBookLevel2]) => {
    console.log(l1);

    client.on('l1Changed', () => {
      console.log('L1 changed');
      client
        .getOrderBookL1('DIL-MATIC', true)
        .then((l1New: RestResponseOrderBookLevel1) => {
          console.log(l1New);
        });
    });

    client.on('l2Changed', () => {
      console.log('L2 changed');
      client
        .getOrderBookL2('DIL-MATIC', true, 3)
        .then((l2: RestResponseOrderBookLevel2) => {
          console.log(l2);
        });
    });
  },
);