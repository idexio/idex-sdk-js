import * as enums from './enums';

type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
export type XOR<T, U> = T | U extends object
  ? (Without<T, U> & U) | (Without<U, T> & T)
  : T | U;

interface CancelOrdersBase {
  nonce: string;
  wallet: string;
}

export interface CancelOrder extends CancelOrdersBase {
  orderId: string;
}

/**
 * @typedef {Object} request.CancelOrders
 * @property {string} nonce - UUIDv1
 * @property {string} wallet
 * @property {string} [orderId] - Single orderId or clientOrderId to cancel; prefix client-provided ids with client:
 * @property {string} [market] - Base-quote pair e.g. 'IDEX-ETH'
 */
export interface CancelOrders extends CancelOrdersBase {
  market?: string;
}

export interface CancelOrdersBody {
  parameters: XOR<CancelOrder, CancelOrders>;
  signature: string;
}

interface FindByWallet {
  nonce: string;
  wallet: string;
}

export interface FindWithPagination {
  start?: number;
  end?: number;
  limit?: number;
}

/**
 * @typedef {Object} request.FindCandles
 * @property {string} market - Base-quote pair e.g. 'IDEX-ETH'
 * @property {CandleInterval} [interval] - Time interval for data
 * @property {number} [start] - Starting timestamp (inclusive)
 * @property {number} [end] - Ending timestamp (inclusive)
 * @property {number} [limit=50] - Max results to return from 1-1000
 */
export interface FindCandles extends FindWithPagination {
  market?: string;
  interval?: enums.CandleInterval;
}

/**
 * @typedef {Object} request.FindDeposit
 * @property {string} nonce - UUIDv1
 * @property {string} wallet
 * @property {string} depositId
 */
export interface FindDeposit extends FindByWallet {
  depositId: string;
}

/**
 * @typedef {Object} request.FindDeposits
 * @property {string} nonce - UUIDv1
 * @property {string} wallet
 * @property {string} [asset] - Asset by symbol
 * @property {number} [start] - Starting timestamp (inclusive)
 * @property {number} [end] - Ending timestamp (inclusive)
 * @property {number} [limit=50] - Max results to return from 1-1000
 */
export interface FindDeposits extends FindByWallet, FindWithPagination {
  asset?: string;
}

/**
 * @typedef {Object} request.FindFill
 * @property {string} nonce - UUIDv1
 * @property {string} wallet
 * @property {string} fillId
 */
export interface FindFill extends FindByWallet {
  fillId: string;
}

/**
 * @typedef {Object} request.FindFills
 * @property {string} nonce - UUIDv1
 * @property {string} wallet - Ethereum wallet address
 * @property {string} market - Base-quote pair e.g. 'IDEX-ETH'
 * @property {number} [start] - Starting timestamp (inclusive)
 * @property {number} [end] - Ending timestamp (inclusive)
 * @property {number} [limit=50] - Max results to return from 1-1000
 * @property {string} [fromId] - Fills created at the same timestamp or after fillId
 */
export interface FindFills extends FindByWallet, FindWithPagination {
  market?: string;
  fromId?: string;
}

/**
 * @typedef {Object} request.FindOrder
 * @property {string} nonce - UUIDv1
 * @property {string} wallet
 * @property {string} orderId - Single orderId or clientOrderId to cancel; prefix client-provided ids with client:
 */
export interface FindOrder extends FindByWallet {
  orderId: string;
}

/**
 * @typedef {Object} request.FindOrders
 * @property {string} nonce - UUIDv1
 * @property {string} wallet
 * @property {string} [market] - Base-quote pair e.g. 'IDEX-ETH'
 * @property {boolean} [closed] - false only returns active orders on the order book; true only returns orders that are no longer on the order book and resulted in at least one fill; only applies if orderId is absent
 * @property {number} [start] - Starting timestamp (inclusive)
 * @property {number} [end] - Ending timestamp (inclusive)
 * @property {number} [limit=50] - Max results to return from 1-1000
 * @property {string} [fromId] - orderId of the earliest (oldest) order, only applies if orderId is absent
 */
export interface FindOrders extends FindByWallet, FindWithPagination {
  market?: string;
  closed: boolean;
  fromId?: string;
}

/**
 * @typedef {Object} request.FindTrades
 * @property {string} market - Base-quote pair e.g. 'IDEX-ETH'
 * @property {number} [start] - Starting timestamp (inclusive)
 * @property {number} [end] - Ending timestamp (inclusive)
 * @property {number} [limit] - Max results to return from 1-1000
 * @property {string} [fromId] - Trades created at the same timestamp or after fromId
 */
export interface FindTrades extends FindWithPagination {
  market?: string;
  fromId?: string;
}

/**
 * @typedef {Object} request.FindWithdrawal
 * @property {string} nonce - UUIDv1
 * @property {string} wallet
 * @property {string} withdrawalId
 */
export interface FindWithdrawal extends FindByWallet {
  withdrawalId: string;
}

/**
 * @typedef {Object} request.FindWithdrawals
 * @property {string} nonce - UUIDv1
 * @property {string} wallet
 * @property {string} [asset] - Asset by symbol
 * @property {string} [assetContractAddress] - Asset by contract address
 * @property {number} [start] - Starting timestamp (inclusive)
 * @property {number} [end] - Ending timestamp (inclusive)
 * @property {number} [limit=50] - Max results to return from 1-1000
 * @property {string} [fromId] - Withdrawals created after the fromId
 */
export interface FindWithdrawals extends FindByWallet, FindWithPagination {
  asset?: string;
  assetContractAddress?: string;
  fromId?: string;
}

export interface AllOrderParameters {
  nonce: string;
  wallet: string;
  market: string;
  type: keyof typeof enums.OrderType;
  side: keyof typeof enums.OrderSide;
  timeInForce?: keyof typeof enums.OrderTimeInForce;
  customClientOrderId?: string;
  selfTradePrevention?: keyof typeof enums.OrderSelfTradePrevention;
  cancelAfter?: number;
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

export type OrderWithPrice =
  | LimitOrder
  | StopLossLimitOrder
  | TakeProfitLimitOrder;

export type OrderWithStopPrice =
  | StopLossOrder
  | StopLossLimitOrder
  | TakeProfitLimitOrder
  | TakeProfitLimitOrder;

/**
 * @typedef {Object} request.Order
 * @property {string} nonce - UUIDv1
 * @property {string} wallet
 * @property {string} market - Base-quote pair e.g. 'IDEX-ETH'
 * @property {OrderType} type
 * @property {OrderSide} side
 * @property {OrderTimeInForce} [timeInForce=gtc] - Defaults to good until canceled
 * @property {string} [quantity] - Order quantity in base terms, exclusive with quoteOrderQuantity
 * @property {string} [quoteOrderQuantity] - Order quantity in quote terms, exclusive with quantity
 * @property {string} [price] - Price in quote terms, optional for market orders
 * @property {ustring} [clientOrderId] - Client-supplied order id
 * @property {string} [stopPrice] - Stop loss or take profit price, only if stop or take order
 * @property {OrderSelfTradePrevention} [selfTradePrevention=decreaseAndCancel] - Defaults to decrease and cancel
 * @property {number} [cancelAfter] - Timestamp after which a standing limit order will be automatically cancelled; gtt tif only
 */
export type Order = XOR<OrderByBaseQuantity, OrderByQuoteQuantity>;

export interface CreateOrderBody {
  parameters: Order;
  signature: string;
}

/**
 * @typedef {Object} request.User
 * @property {string} nonce - UUIDv1
 */
export interface User {
  nonce: string;
}

export interface FindUser {
  parameters: User;
  signature: string;
}

interface WithdrawalBase {
  nonce: string;
  wallet: string;
  quantity: string;
  /** Currently has no effect */
  autoDispatchEnabled?: boolean;
}

export interface WithdrawalBySymbol extends WithdrawalBase {
  asset: string;
}

export interface WithdrawalByAddress extends WithdrawalBase {
  assetContractAddress: string;
}

/**
 * @typedef {Object} request.Withdrawal
 * @property {string} nonce - UUIDv1
 * @property {string} wallet
 * @property {string} [asset] - Asset by symbol
 * @property {string} [assetContractAddress] - Asset by contract address
 * @property {string} quantity - Withdrawal amount in asset terms, fees are taken from this value
 */
export type Withdrawal = XOR<WithdrawalBySymbol, WithdrawalByAddress>;

export interface CreateWithdrawal {
  parameters: Withdrawal;
  signature: string;
}
