import * as enums from '../enums';
import { XOR } from '../utils';

/**
 * @typedef {Object} RestRequestAddLiquidity
 * @property {string} nonce - UUIDv1
 * @property {string} wallet
 * @property {string} tokenA - Asset by address
 * @property {string} tokenB - Asset by address
 * @property {string} amountADesired - Maximum amount of tokenA to add to the liquidity pool
 * @property {string} amountBDesired - Maximum amount of tokenB to add to the liquidity pool
 * @property {string} amountAMin- Minimum amount of tokenA to add to the liquidity pool
 * @property {string} amountBMin - Minimum amount of tokenB to add to the liquidity pool
 * @property {string} to - Wallet to credit LP tokens, or the custodian contract address to leave on exchange
 * @property {number} deadline - Timestamp in seconds by which this request must be settled on-chain
 */

export interface RestRequestAddLiquidity {
  nonce: string;
  wallet: string;
  tokenA: string;
  tokenB: string;
  amountADesired: string;
  amountBDesired: string;
  amountAMin: string;
  amountBMin: string;
  to: string;
}

/**
 * @typedef {Object} RestRequestGetLiquidityAdditions
 * @property {string} nonce - UUIDv1
 * @property {string} wallet
 */

export interface RestRequestGetLiquidityAdditions {
  nonce: string;
  wallet: string;
  fromId?: string;
  initiatingTxId?: string;
  liquidityAdditionId?: string;
  start?: number;
  end?: number;
  limit?: number;
}

/**
 * @typedef {Object} RestRequestGetLiquidityRemovals
 * @property {string} nonce - UUIDv1
 * @property {string} wallet
 */

export interface RestRequestGetLiquidityRemovals {
  nonce: string;
  wallet: string;
  fromId?: string;
  initiatingTxId?: string;
  liquidityAdditionId?: string;
  start?: number;
  end?: number;
  limit?: number;
}

/**
 * @typedef {Object} RestRequestRemoveLiquidity
 * @property {string} nonce - UUIDv1
 * @property {string} wallet
 * @property {string} tokenA - Asset by address
 * @property {string} tokenB - Asset by address
 * @property {string} liquidity - LP tokens to burn
 * @property {string} amountAMin- Minimum amount of tokenA to add to the liquidity pool
 * @property {string} amountBMin - Minimum amount of tokenB to add to the liquidity pool
 * @property {string} to - Wallet to credit LP tokens, or the custodian contract address to leave on exchange
 * @property {number} deadline - Timestamp in seconds by which this request must be settled on-chain
 */

export interface RestRequestRemoveLiquidity {
  nonce: string;
  wallet: string;
  tokenA: string;
  tokenB: string;
  liquidity: string;
  amountAMin: string;
  amountBMin: string;
  to: string;
}

interface RestRequestCancelOrdersBase {
  nonce: string;
  wallet: string;
}

export interface RestRequestCancelOrder extends RestRequestCancelOrdersBase {
  orderId: string;
}

/**
 * @typedef {Object} RestRequestCancelOrders
 * @property {string} nonce - UUIDv1
 * @property {string} wallet
 * @property {string} [orderId] - Single orderId or clientOrderId to cancel; prefix client-provided ids with client:
 * @property {string} [market] - Base-quote pair e.g. 'IDEX-ETH'
 */
export interface RestRequestCancelOrders extends RestRequestCancelOrdersBase {
  market?: string;
}

export type RestRequestCancelOrderOrOrders = XOR<
  RestRequestCancelOrder,
  RestRequestCancelOrders
>;

export interface RestRequestCancelOrdersBody {
  parameters: RestRequestCancelOrderOrOrders;
  signature: string;
}

interface RestRequestFindByWallet {
  nonce: string;
  wallet: string;
}

export interface RestRequestFindWithPagination {
  start?: number;
  end?: number;
  limit?: number;
}

/**
 * @typedef {Object} RestRequestFindBalances
 * @property {string} nonce - UUIDv1
 * @property {string} wallet
 * @property {string} [asset[]] - Asset symbols
 */
export interface RestRequestFindBalances extends RestRequestFindByWallet {
  asset?: string[];
}

/**
 * @typedef {Object} RestRequestFindCandles
 * @property {string} market - Base-quote pair e.g. 'IDEX-ETH'
 * @property {CandleInterval} interval - Time interval for data
 * @property {number} [start] - Starting timestamp (inclusive)
 * @property {number} [end] - Ending timestamp (inclusive)
 * @property {number} [limit=50] - Max results to return from 1-1000
 */
export interface RestRequestFindCandles extends RestRequestFindWithPagination {
  market: string;
  interval: keyof typeof enums.CandleInterval;
}

/**
 * @typedef {Object} RestRequestFindDeposit
 * @property {string} nonce - UUIDv1
 * @property {string} wallet
 * @property {string} depositId
 */
export interface RestRequestFindDeposit extends RestRequestFindByWallet {
  depositId: string;
}

/**
 * @typedef {Object} RestRequestFindDeposits
 * @property {string} nonce - UUIDv1
 * @property {string} wallet
 * @property {string} [asset] - Asset by symbol
 * @property {number} [start] - Starting timestamp (inclusive)
 * @property {number} [end] - Ending timestamp (inclusive)
 * @property {number} [limit=50] - Max results to return from 1-1000
 * @property {string} [fromId] - Fills created at the same timestamp or after fillId
 */
export interface RestRequestFindDeposits
  extends RestRequestFindByWallet,
    RestRequestFindWithPagination {
  asset?: string;
  fromId?: string;
}

/**
 * @typedef {Object} RestRequestFindFill
 * @property {string} nonce - UUIDv1
 * @property {string} wallet
 * @property {string} fillId
 */
export interface RestRequestFindFill extends RestRequestFindByWallet {
  fillId: string;
}

/**
 * @typedef {Object} RestRequestFindFills
 * @property {string} nonce - UUIDv1
 * @property {string} wallet - Ethereum wallet address
 * @property {string} market - Base-quote pair e.g. 'IDEX-ETH'
 * @property {number} [start] - Starting timestamp (inclusive)
 * @property {number} [end] - Ending timestamp (inclusive)
 * @property {number} [limit=50] - Max results to return from 1-1000
 * @property {string} [fromId] - Fills created at the same timestamp or after fillId
 */
export interface RestRequestFindFills
  extends RestRequestFindByWallet,
    RestRequestFindWithPagination {
  market?: string;
  fromId?: string;
}

/**
 * @typedef {Object} RestRequestFindMarkets
 * @property {string} market - Target market, all markets are returned if omitted
 * @property {boolean} [regionOnly=false] - true only returns markets available in the geographic region of the request
 * @property {string} depositId
 */
export interface RestRequestFindMarkets {
  market?: string;
  regionOnly?: boolean;
}

/**
 * @typedef {Object} RestRequestFindOrder
 * @property {string} nonce - UUIDv1
 * @property {string} wallet
 * @property {string} orderId - Single orderId or clientOrderId to cancel; prefix client-provided ids with client:
 */
export interface RestRequestFindOrder extends RestRequestFindByWallet {
  orderId: string;
}

/**
 * @typedef {Object} RestRequestFindOrders
 * @property {string} nonce - UUIDv1
 * @property {string} wallet
 * @property {string} [market] - Base-quote pair e.g. 'IDEX-ETH'
 * @property {boolean} [closed] - false only returns active orders on the order book; true only returns orders that are no longer on the order book and resulted in at least one fill; only applies if orderId is absent
 * @property {number} [start] - Starting timestamp (inclusive)
 * @property {number} [end] - Ending timestamp (inclusive)
 * @property {number} [limit=50] - Max results to return from 1-1000
 * @property {string} [fromId] - orderId of the earliest (oldest) order, only applies if orderId is absent
 */
export interface RestRequestFindOrders
  extends RestRequestFindByWallet,
    RestRequestFindWithPagination {
  market?: string;
  closed?: boolean;
  fromId?: string;
}

/**
 * @typedef {Object} RestRequestFindTrades
 * @property {string} market - Base-quote pair e.g. 'IDEX-ETH'
 * @property {number} [start] - Starting timestamp (inclusive)
 * @property {number} [end] - Ending timestamp (inclusive)
 * @property {number} [limit] - Max results to return from 1-1000
 * @property {string} [fromId] - Trades created at the same timestamp or after fromId
 */
export interface RestRequestFindTrades extends RestRequestFindWithPagination {
  market?: string;
  fromId?: string;
}

/**
 * @typedef {Object} RestRequestFindWithdrawal
 * @property {string} nonce - UUIDv1
 * @property {string} wallet
 * @property {string} withdrawalId
 */
export interface RestRequestFindWithdrawal extends RestRequestFindByWallet {
  withdrawalId: string;
}

/**
 * @typedef {Object} RestRequestFindWithdrawals
 * @property {string} nonce - UUIDv1
 * @property {string} wallet
 * @property {string} [asset] - Asset by symbol
 * @property {string} [assetContractAddress] - Asset by contract address
 * @property {number} [start] - Starting timestamp (inclusive)
 * @property {number} [end] - Ending timestamp (inclusive)
 * @property {number} [limit=50] - Max results to return from 1-1000
 * @property {string} [fromId] - Withdrawals created after the fromId
 */
export interface RestRequestFindWithdrawals
  extends RestRequestFindByWallet,
    RestRequestFindWithPagination {
  asset?: string;
  assetContractAddress?: string;
  fromId?: string;
}

export interface RestRequestAllOrderParameters {
  nonce: string;
  wallet: string;
  market: string;
  type: keyof typeof enums.OrderType;
  side: keyof typeof enums.OrderSide;
  timeInForce?: keyof typeof enums.OrderTimeInForce;
  clientOrderId?: string;
  selfTradePrevention?: keyof typeof enums.OrderSelfTradePrevention;
  cancelAfter?: number;
}

// Limit
export interface RestRequestLimitOrder extends RestRequestAllOrderParameters {
  type: 'limit' | 'limitMaker';
  price: string;
}

// Market
export interface RestRequestMarketOrder extends RestRequestAllOrderParameters {
  type: 'market';
}

// Stop-loss market
export interface RestRequestStopLossOrder
  extends RestRequestAllOrderParameters {
  type: 'stopLoss';
  stopPrice: string;
}

// Stop-loss limit
export interface RestRequestStopLossLimitOrder
  extends RestRequestAllOrderParameters {
  type: 'stopLossLimit';
  price: string;
  stopPrice: string;
}

// Take-profit
export interface RestRequestTakeProfitOrder
  extends RestRequestAllOrderParameters {
  type: 'takeProfit';
  stopPrice: string;
}

// Take-profit limit
export interface RestRequestTakeProfitLimitOrder
  extends RestRequestAllOrderParameters {
  type: 'takeProfitLimit';
  price: string;
  stopPrice: string;
}

// Quantity can be specified in units of base or quote asset, but not both
export type RestRequestOrderByBaseQuantity = (
  | RestRequestLimitOrder
  | RestRequestMarketOrder
  | RestRequestStopLossOrder
  | RestRequestStopLossLimitOrder
  | RestRequestTakeProfitOrder
  | RestRequestTakeProfitLimitOrder
) & { quantity: string; quoteOrderQuantity?: undefined };

export type RestRequestOrderByQuoteQuantity = (
  | RestRequestLimitOrder
  | RestRequestMarketOrder
  | RestRequestStopLossOrder
  | RestRequestStopLossLimitOrder
  | RestRequestTakeProfitOrder
  | RestRequestTakeProfitLimitOrder
) & { quoteOrderQuantity: string; quantity?: undefined };

export type RestRequestOrderWithPrice =
  | RestRequestLimitOrder
  | RestRequestStopLossLimitOrder
  | RestRequestTakeProfitLimitOrder;

export type RestRequestOrderWithStopPrice =
  | RestRequestStopLossOrder
  | RestRequestStopLossLimitOrder
  | RestRequestTakeProfitLimitOrder
  | RestRequestTakeProfitLimitOrder;

/**
 * @typedef {Object} RestRequestOrder
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
 * @property {number} [cancelAfter] - Timestamp after which a standing limit order will be automatically canceled; gtt tif only
 */
export type RestRequestOrder = XOR<
  RestRequestOrderByBaseQuantity,
  RestRequestOrderByQuoteQuantity
>;

export interface RestRequestCreateOrderBody {
  parameters: RestRequestOrder;
  signature: string;
}

interface RestRequestWithdrawalBase {
  nonce: string;
  wallet: string;
  quantity: string;
  // Currently has no effect
  autoDispatchEnabled?: boolean;
}

export interface RestRequestWithdrawalBySymbol
  extends RestRequestWithdrawalBase {
  asset: string;
  assetContractAddress?: undefined;
}

export interface RestRequestWithdrawalByAddress
  extends RestRequestWithdrawalBase {
  assetContractAddress: string;
  asset?: undefined;
}

/**
 * @typedef {Object} RestRequestWithdrawal
 * @property {string} nonce - UUIDv1
 * @property {string} wallet
 * @property {string} [asset] - Asset by symbol
 * @property {string} [assetContractAddress] - Asset by contract address
 * @property {string} quantity - Withdrawal amount in asset terms, fees are taken from this value
 */
export type RestRequestWithdrawal = XOR<
  RestRequestWithdrawalBySymbol,
  RestRequestWithdrawalByAddress
>;

export interface RestRequestCreateWithdrawalBody {
  parameters: RestRequestWithdrawal;
  signature: string;
}

/**
 * @typedef {Object} RestRequestAssociateWallet
 * @property {string} nonce - UUIDv1
 * @property {string} wallet - The wallet to associate with the authenticated account.
 */
export type RestRequestAssociateWallet = {
  nonce: string;
  /**
   * The wallet to associate with the authenticated account.
   */
  wallet: string;
};
