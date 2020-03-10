import { ethers } from 'ethers';

import * as utils from './utils';

export interface ExchangeInfo {
  timeZone: string;
  serverTime: number;
  ethereumDepositContractAddress: string;
  ethUsdPrice: string;
  gasPrice: string;
  usdVolume24h: string;
  makerFeeRate: string;
  takerFeeRate: string;
}

export enum OrderType {
  market,
  limit,
  limitMaker,
  stopLoss,
  stopLossLimit,
  takeProfit,
  takeProfitLimit,
}

export enum OrderSide {
  buy,
  sell,
}

export enum OrderTimeInForce {
  gtc, // Good until cancelled (default)
  gtt, // Good until time
  ioc, // Immediate or cancel
  fok, // Fill or kill
}

export interface AllOrderParameters {
  nonce: string;
  wallet: string;
  market: string;
  type: keyof typeof OrderType;
  side: keyof typeof OrderSide;
  timeInForce?: keyof typeof OrderTimeInForce;
  customClientOrderId?: string;
}

// Limit
export interface LimitOrder extends AllOrderParameters {
  type: 'limit' | 'limitMaker';
  price: string;
}

// Market
export interface MarketOrder extends AllOrderParameters {
  type: 'market';
}

// Stop-loss market
export interface StopLossOrder extends AllOrderParameters {
  type: 'stopLoss';
  stopPrice: string;
}

// Stop-loss limit
export interface StopLossLimitOrder extends AllOrderParameters {
  type: 'stopLossLimit';
  price: string;
  stopPrice: string;
}

// Take-profit
export interface TakeProfitOrder extends AllOrderParameters {
  type: 'takeProfit';
  stopPrice: string;
}

// Take-profit limit
export interface TakeProfitLimitOrder extends AllOrderParameters {
  type: 'takeProfitLimit';
  price: string;
  stopPrice: string;
}

type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
type XOR<T, U> = T | U extends object
  ? (Without<T, U> & U) | (Without<U, T> & T)
  : T | U;

// Quantity can be specified in units of base or quote asset, but not both
export type OrderByBaseQuantity = (
  | LimitOrder
  | MarketOrder
  | StopLossOrder
  | StopLossLimitOrder
  | TakeProfitOrder
  | TakeProfitLimitOrder
) & { quantity: string };
export type OrderByQuoteQuantity = (
  | LimitOrder
  | MarketOrder
  | StopLossOrder
  | StopLossLimitOrder
  | TakeProfitOrder
  | TakeProfitLimitOrder
) & { quoteOrderQuantity: string };

export type Order = XOR<OrderByBaseQuantity, OrderByQuoteQuantity>;

export type OrderWithPrice =
  | LimitOrder
  | StopLossLimitOrder
  | TakeProfitLimitOrder;

export type OrderWithStopPrice =
  | StopLossOrder
  | StopLossLimitOrder
  | TakeProfitLimitOrder
  | TakeProfitLimitOrder;

export interface CreateOrderRequest {
  order: Order;
  signature: string;
}

export const getOrderHash = (order: Order) =>
  ethers.utils.solidityKeccak256(
    [
      'string',
      'uint8',
      'uint8',
      'string',
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
      (order as OrderByBaseQuantity).quantity || '',
      (order as OrderByQuoteQuantity).quoteOrderQuantity || '',
      (order as OrderWithPrice).price || '',
      (order as OrderWithStopPrice).stopPrice || '',
      order.wallet,
      utils.uuidToBuffer(order.nonce),
    ],
  );
