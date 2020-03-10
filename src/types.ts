import { ethers } from 'ethers';

import * as utils from './utils';

/**
 * Basic exchange info
 *
 * @typedef {Object} ExchangeInfo
 * @property {string} timeZone - UTC
 * @property {number} serverTime - UNIX epoch time in ms
 * @property {string} ethereumDepositContractAddress
 * @property {string} ethUsdPrice
 * @property {string} gasPrice - In gwei
 * @property {string} usdVolume24h - 24h volume in USD
 * @property {string} makerFeeRate
 * @property {string} takerFeeRate
 */
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

/**
 * @readonly
 * @enum {string}
 */
export enum OrderType {
  /** @type {string} */
  market,
  /** @type {string} */
  limit,
  /** @type {string} */
  limitMaker,
  /** @type {string} */
  stopLoss,
  /** @type {string} */
  stopLossLimit,
  /** @type {string} */
  takeProfit,
  /** @type {string} */
  takeProfitLimit,
}

/**
 * @readonly
 * @enum {string}
 */
export enum OrderSide {
  /** @type {string} */
  buy,
  /** @type {string} */
  sell,
}

/**
 * @readonly
 * @enum {string}
 */
export enum OrderTimeInForce {
  /**
   * Good until cancelled (default)
   * @type {string}
   */
  gtc,
  /**
   * Good until time
   * @type {string}
   */
  gtt,
  /**
   *Immediate or cancel
   * @type {string}
   */
  ioc,
  /**
   * Fill or kill
   * @type {string}
   */
  fok,
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

/**
 * @typedef {Object} Order
 * @property {string} nonce - UUIDv1
 * @property {string} wallet
 * @property {string} market - Base-quote pair e.g. 'IDEX-ETH'
 * @property {OrderType} type
 * @property {OrderSide} side
 * @property {OrderTimeInForce} [timeInForce] - Defaults to gtc
 * @property {string} [quantity] - Order quantity in base terms, exclusive with quoteOrderQuantity
 * @property {string} [quoteOrderQuantity] - Order quantity in quote terms, exclusive with quantity
 * @property {string} [price] - Price in quote terms, optional for market orders
 * @property {string} [clientOrderId] - Client-supplied order id
 * @property {string} [stopPrice] - Stop loss or take profit price, only if stop or take order
 */
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
