import { ethers } from 'ethers';

import * as utils from './utils';

export enum OrderSide {
  buy,
  sell,
}

export enum OrderType {
  limit,
  market,
  stopLimit,
}

export interface Order {
  market: string;
  side: 'buy' | 'sell';
  type: 'limit' | 'market' | 'stopLimit';
  quantity: string;
  price?: string;
  stopPrice?: string;
  customClientOrderId?: string;
}

export interface LimitOrder extends Order {
  type: 'limit';
  price: string;
}

export interface MarketOrder extends Order {
  type: 'market';
}

export interface StopLimitOrder extends Order {
  type: 'stopLimit';
  price: string;
  stopPrice: string;
}

export interface CreateOrderRequestWallet {
  address: string;
  nonce: string;
  signature: string;
}

export interface CreateOrderRequest {
  order: Order;
  wallet: CreateOrderRequestWallet;
}

export const getOrderHash = (
  order: Order,
  walletAddress: string,
  nonce: string,
) =>
  ethers.utils.solidityKeccak256(
    [
      'string',
      'uint8',
      'uint8',
      'string',
      'string',
      'string',
      'address',
      'uint128',
    ],
    [
      order.market,
      OrderSide[order.side],
      OrderType[order.type],
      order.quantity,
      order.price || '',
      order.stopPrice || '',
      walletAddress,
      utils.uuidToBuffer(nonce),
    ],
  );
