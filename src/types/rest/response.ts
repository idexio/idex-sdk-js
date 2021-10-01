import * as enums from '../enums';

/**
 * Asset
 *
 * @typedef {Object} RestResponseAsset
 * @property {number} id - Internal id of the asset
 * @property {string} name
 * @property {string} symbol
 * @property {string} contractAddress
 * @property {number} assetDecimals
 * @property {number} exchangeDecimals
 * @property {string} maticPrice
 */
export interface RestResponseAsset {
  name: string;
  symbol: string;
  contractAddress: string;
  assetDecimals: number;
  exchangeDecimals: 8; // this is hardcoded everywhere and should not be changed
  maticPrice: string | null;
}

/**
 * Balance
 *
 * @typedef {Object} RestResponseBalance
 * @property {string} asset - Asset symbol
 * @property {string} quantity - Total quantity of the asset held by the wallet on the exchange
 * @property {string} availableForTrade - Quantity of the asset available for trading; quantity - locked
 * @property {string} locked - Quantity of the asset held in trades on the order book
 * @property {string} usdValue - Total value of the asset held by the wallet on the exchange in USD
 */
export interface RestResponseBalance {
  asset: string;
  quantity: string;
  availableForTrade: string;
  locked: string;
  usdValue: string;
}

/**
 * Candle (OHLCV) data points aggregated by time interval
 *
 * @typedef {Object} RestResponseCandle
 * @property {number} start - Time of the start of the interval
 * @property {string} open - Price of the first fill of the interval in quote terms
 * @property {string} high - Price of the highest fill of the interval in quote terms
 * @property {string} low - Price of the lowest fill of the interval in quote terms
 * @property {string} close - Price of the last fill of the interval in quote terms
 * @property {string} volume - Total volume of the period in base terms
 * @property {number} sequence - Fill sequence number of the last trade in the interval
 */
export interface RestResponseCandle {
  start: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  sequence: number;
}

/**
 * Asset deposits into smart contract
 *
 * @typedef {Object} RestResponseDeposit
 * @property {string} depositId - IDEX-issued deposit identifier
 * @property {string} asset - Asset by symbol
 * @property {string} quantity - Deposit amount in asset terms
 * @property {string} txId - Ethereum transaction hash
 * @property {number} txTime - Timestamp of the Ethereum deposit transaction
 * @property {number} confirmationTime - Timestamp of credit on IDEX including block confirmations
 */
export interface RestResponseDeposit {
  depositId: string;
  asset: string;
  quantity: string;
  txId: string;
  txTime: number;
  confirmationTime: number;
}

/**
 * Basic exchange info
 *
 * @typedef {Object} RestResponseExchangeInfo
 * @property {string} timeZone - Server time zone, always UTC
 * @property {number} serverTime - Current server time
 * @property {string} ethereumDepositContractAddress - Ethereum address of the exchange custody contract for deposits, only when multiverse chain is "eth"
 * @property {string} bscDepositContractAddress - Ethereum address of the exchange custody contract for deposits, only when multiverse chain is "bsc"
 * @property {string} ethUsdPrice - Current price of ETH in USD, only provided if multiverse chain is "eth"
 * @property {string} bnbUsdPrice - Current price of BNB in USD, only provided if multiverse chain is "bsc"
 * @property {number} gasPrice - Current gas price used by the exchange for trade settlement and withdrawal transactions in Gwei
 * @property {string} volume24hUsd - Total exchange trading volume for the trailing 24 hours in USD
 * @property {string} makerFeeRate - Maker trade fee rate
 * @property {string} takerFeeRate - Taker trade fee rate
 * @property {string} makerTradeMinimum - Minimum size of an order that can rest on the order book in ETH, applies to both ETH and tokens
 * @property {string} takerTradeMinimum - Minimum order size that is accepted by the matching engine for execution in ETH, applies to both ETH and tokens
 * @property {string} takerIdexFeeRate - Minimum order size that is accepted by the matching engine for execution in ETH, applies to both ETH and tokens
 * @property {string} takerLiquidityProviderFeeRate - Minimum order size that is accepted by the matching engine for execution in ETH, applies to both ETH and tokens
 * @property {string} withdrawMinimum - Minimum withdrawal amount in ETH, applies to both ETH and tokens
 */
export type RestResponseExchangeInfo<
  C extends enums.MultiverseChain = 'matic'
> = {
  timeZone: string;
  serverTime: number;
  gasPrice: number;
  volume24hUsd: string;
  makerFeeRate: string;
  takerFeeRate: string;
  makerTradeMinimum: string;
  takerTradeMinimum: string;
  takerIdexFeeRate: string;
  takerLiquidityProviderFeeRate: string;
  withdrawMinimum: string;
} & (C extends 'matic'
  ? {
      maticUsdPrice: string;
      maticDepositContractAddress: string;
      ethereumDepositContractAddress?: void;
      ethUsdPrice?: void;
      bnbUsdPrice?: void;
      bscDepositContractAddress?: void;
    }
  : never);

/**
 * Fill
 *
 * @typedef {Object} RestResponseFill
 * @property {string} fillId - Internal ID of fill
 * @property {string} orderId - Internal ID of order
 * @property {string} [clientOrderId] - Client-provided ID of order
 * @property {string} market - Base-quote pair e.g. 'IDEX-ETH'
 * @property {string} price - Executed price of fill in quote terms
 * @property {string} quantity - Executed quantity of fill in base terms
 * @property {string} quoteQuantity - Executed quantity of trade in quote terms
 * @property {OrderSide} makerSide - Which side of the order the liquidity maker was on
 * @property {string} fee - Fee amount on fill
 * @property {string} feeAsset - Which token the fee was taken in
 * @property {string} gas
 * @property {OrderSide} side
 * @property {Liquidity} liquidity
 * @property {string} time - Fill timestamp
 * @property {number} sequence - Last trade sequence number for the market
 * @property {string | null} txId - Ethereum transaction ID, if available
 * @property {string} txStatus - Ethereum transaction status
 */
export interface RestResponseFill extends RestResponseOrderFill {
  orderId: string;
  clientOrderId?: string;
  market: string;
  side: keyof typeof enums.OrderSide;
}

/**
 * Liquidity Pool
 *
 * @typedef {Object} RestResponseLiquidityPool
 * @property {string} tokenA - Address of one reserve token
 * @property {string} tokenB - Address of one reserve token
 * @property {string} reserveA - Quantity of token A held as reserve in token precision, not pips
 * @property {string} reserveB - Quantity of token B held as reserve in token precision, not pips
 * @property {string} liquidityToken - Address of the liquidity provider (LP) token
 * @property {string} totalLiquidity - Total quantity of liquidity provider (LP) tokens minted in token precision, not pips
 * @property {string} reserveUsd - Total value of reserves in USD
 * @property {string} market - Market symbol of pool’s associated hybrid market
 */
export interface RestResponseLiquidityPool {
  tokenA: string;
  tokenB: string;
  reserveA: string;
  reserveB: string;
  liquidityToken: string;
  totalLiquidity: string;
  reserveUsd: string;
  market: string;
}

interface RestResponseLiquidityBase {
  tokenA: string;
  tokenB: string;
  amountA: string | null;
  amountB: string | null;
  liquidity: string | null;
  time: number;
  initiatingTxId: string | null;
  errorCode?: string;
  errorMessage?: string;
  feeTokenA: string | null;
  feeTokenB: string | null;
  txId: string | null;
  txStatus: keyof typeof enums.EthTransactionStatus | null;
}

/**
 * LiquidityAddition
 *
 * @typedef {Object} RestResponseLiquidityAddition
 * @property {string} liquidityAdditionId - Internal ID of liquidity addition
 * @property {string} tokenA - Asset symbol
 * @property {string} tokenB - Asset symbol
 * @property {string} amountA - Amount of tokenA added to the liquidity pool
 * @property {string} amountB - Amount of tokenB added to the liquidity pool
 * @property {number} liquidity - Amount of liquidity provided (LP) tokens minted
 * @property {string} time - Liquidity addition timestamp
 * @property {string | null} initiatingTxId - On chain initiated transaction ID, if available
 * @property {boolean} validated - Whether on-chain tx was validated, or true
 * @property {string} feeTokenA - Amount of tokenA collected as fees
 * @property {string} feeTokenB - Amount of tokenB collected as fees
 * @property {string | null} txId - Ethereum transaction ID, if available
 * @property {string} txStatus - Ethereum transaction status
 */

export interface RestResponseLiquidityAddition
  extends RestResponseLiquidityBase {
  liquidityAdditionId: string | null;
}

/**
 * LiquidityPoolReserves
 *
 * @typedef {Object} RestResponseLiquidityPoolReserves
 * @property {string} baseReserveQuantity - reserve quantity of base asset in pool
 * @property {string} quoteReserveQuantity - reserve quantity of quote asset in pool
 */
export interface RestResponseLiquidityPoolReserves {
  baseReserveQuantity: string;
  quoteReserveQuantity: string;
}

/**
 * LiquidityRemoval
 *
 * @typedef {Object} RestResponseLiquidityRemoval
 * @property {string} liquidityRemovalId - Internal ID of liquidity removal
 * @property {string} tokenA - Asset symbol
 * @property {string} tokenB - Asset symbol
 * @property {string} amountA - Amount of tokenA removed from the liquidity pool
 * @property {string} amountB - Amount of tokenB removed from the liquidity pool
 * @property {string} time - Liquidity addition timestamp
 * @property {string | null} initiatingTxId - On chain initiated transaction ID, if available
 * @property {boolean} validated - Whether on-chain tx was validated, or true
 * @property {string} feeTokenA - Amount of tokenA collected as fees
 * @property {string} feeTokenB - Amount of tokenB collected as fees
 * @property {string | null} txId - Ethereum transaction ID, if available
 * @property {string} txStatus - Ethereum transaction status
 */
export interface RestResponseLiquidityRemoval
  extends RestResponseLiquidityBase {
  liquidityRemovalId: string | null;
}

/**
 * OrderFill
 *
 * @typedef {Object} RestResponseOrderFill
 * @property {TradeType} type - orderBook, pool, or hybrid
 * @property {string} fillId - Internal ID of fill
 * @property {string} price - Executed price of fill in quote terms
 * @property {string} quantity - Executed quantity of fill in base terms
 * @property {string} quoteQuantity - Executed quantity of trade in quote terms
 * @property {string} [orderBookQuantity] - Quantity of the fill in base terms supplied by order book liquidity, omitted for pool fills
 * @property {string} [orderBookQuoteQuantity] - Quantity of the fill in quote terms supplied by order book liquidity, omitted for pool fills
 * @property {string} [poolQuantity] - Quantity of the fill in base terms supplied by pool liquidity, omitted for orderBook fills
 * @property {string} [poolQuoteQuantity] - Quantity of the fill in quote terms supplied by pool liquidity, omitted for orderBook fills
 * @property {OrderSide} makerSide - Which side of the order the liquidity maker was on
 * @property {string} fee - Fee amount on fill
 * @property {string} feeAsset - Which token the fee was taken in
 * @property {string} [gas]
 * @property {Liquidity} liquidity
 * @property {string} time - Fill timestamp
 * @property {number} sequence - Last trade sequence number for the market
 * @property {string | null} txId - Ethereum transaction ID, if available
 * @property {string} txStatus - Ethereum transaction status
 */
export interface RestResponseOrderFill {
  type: keyof typeof enums.TradeType;
  fillId: string;
  price: string;
  quantity: string;
  quoteQuantity: string;
  orderBookQuantity?: string;
  orderBookQuoteQuantity?: string;
  poolQuantity?: string;
  poolQuoteQuantity?: string;
  time: number;
  makerSide: keyof typeof enums.OrderSide;
  sequence: number;
  fee: string;
  feeAsset: string;
  gas?: string;
  liquidity: keyof typeof enums.Liquidity;
  txId: string | null;
  txStatus: keyof typeof enums.EthTransactionStatus;
}

/**
 * Market
 *
 * @typedef {Object} RestResponseMarket
 * @property {string} market - Base-quote pair e.g. 'IDEX-USD'
 * @property {MarketStatus} status
 * @property {MarketType} type
 * @property {string} baseAsset - e.g. 'IDEX'
 * @property {number} baseAssetPrecision
 * @property {string} quoteAsset - e.g. 'USD'
 * @property {number} quoteAssetPrecision
 * @property {string} makerFeeRate
 * @property {string} takerFeeRate
 * @property {string} takerIdexFeeRate
 * @property {string} takerLiquidityProviderFeeRate
 * @property {OrderType[]} orderTypes
 * @property {string} tradeMinimum - Minimum quantity in base terms
 */
export interface RestResponseMarket {
  market: string;
  status: keyof typeof enums.MarketStatus;
  type: keyof typeof enums.MarketType;
  baseAsset: string;
  baseAssetPrecision: number;
  quoteAsset: string;
  quoteAssetPrecision: number;
  makerFeeRate: string;
  takerFeeRate: string;
  takerIdexFeeRate: string;
  takerLiquidityProviderFeeRate: string;
}

/**
 * Order
 *
 * @typedef {Object} RestResponseOrder
 * @property {string} market - Market symbol as base-quote pair e.g. 'IDEX-ETH'
 * @property {string} orderId - Exchange-assigned order identifier
 * @property {string} [clientOrderId] - Client-specified order identifier
 * @property {string} wallet - Ethereum address of placing wallet
 * @property {string} time - Time of initial order processing by the matching engine
 * @property {OrderStatus} status - Current order status
 * @property {string} [errorCode] - Error short code explaining order error or failed batch cancel
 * @property {string} [errorMessage] - Error description explaining order error or failed batch cancel
 * @property {OrderType} type - Order type
 * @property {OrderSide} side - Order side
 * @property {string} [originalQuantity] - Original quantity specified by the order in base terms, omitted for market orders specified in quote terms
 * @property {string} [originalQuoteQuantity] - Original quantity specified by the order in quote terms, only present for market orders specified in quote terms
 * @property {string} executedQuantity - Quantity that has been executed in base terms
 * @property {string} [cumulativeQuoteQuantity] - Cumulative quantity that has been spent (buy orders) or received (sell orders) in quote terms, omitted if unavailable for historical orders
 * @property {string} [avgExecutionPrice] - Weighted average price of fills associated with the order; only present with fills
 * @property {string} [price] -	Original price specified by the order in quote terms, omitted for all market orders
 * @property {string} [stopPrice] - Stop loss or take profit price, only present for stopLoss, stopLossLimit, takeProfit, and takeProfitLimit orders
 * @property {OrderTimeInForce} [timeInForce] - Time in force policy, see values, only present for limit orders
 * @property {OrderSelfTradePrevention} selfTradePrevention - Self-trade prevention policy, see values
 * @property {RestResponseOrderFill[]} [fills] - Array of order fill objects
 */
export interface RestResponseOrder {
  market: string;
  orderId: string;
  clientOrderId?: string;
  wallet: string;
  time: number;
  status: keyof typeof enums.OrderStatus;
  errorCode?: string;
  errorMessage?: string;
  type: keyof typeof enums.OrderType;
  side: keyof typeof enums.OrderSide;
  originalQuantity?: string;
  originalQuoteQuantity?: string;
  executedQuantity: string;
  cumulativeQuoteQuantity?: string;
  avgExecutionPrice?: string;
  price?: string;
  stopPrice?: string;
  timeInForce?: keyof typeof enums.OrderTimeInForce;
  selfTradePrevention: keyof typeof enums.OrderSelfTradePrevention;
  fills?: RestResponseOrderFill[];
}

/**
 * Response to "cancel order" requests (single or multiple orders). Includes
 * one `{ orderId: string }` object for each successfully canceled order.
 *
 * @typedef {Object[]} RestResponseCanceledOrder
 */
export type RestResponseCanceledOrder = {
  orderId: string;
}[];

type Price = string;

type Size = string;

type NumOrders = number;

/**
 * OrderBookPriceLevel
 *
 * price and size as decimal strings
 * numorders = # of limit orders at this price level (0 for synthetic levels)
 *
 * @typedef {[Price, Size, NumOrders]} RestResponseOrderBookPriceLevel
 */
export type RestResponseOrderBookPriceLevel = [Price, Size, NumOrders];

interface RestResponseOrderBook {
  sequence: number;
  bids: RestResponseOrderBookPriceLevel[];
  asks: RestResponseOrderBookPriceLevel[];
  pool: RestResponseLiquidityPoolReserves | null;
}

/**
 * OrderBookLevel1
 *
 * @typedef {Object} RestResponseOrderBookLevel1
 * @property {[RestResponseOrderBookPriceLevel]|[]} bids
 * @property {[RestResponseOrderBookPriceLevel]|[]} asks
 */
export interface RestResponseOrderBookLevel1 {
  sequence: number;
  bids: [RestResponseOrderBookPriceLevel] | [];
  asks: [RestResponseOrderBookPriceLevel] | [];
  pool: RestResponseLiquidityPoolReserves | null;
}

/**
 * OrderBookLevel2
 *
 * @typedef {Object} RestResponseOrderBookLevel2
 * @property {RestResponseOrderBookPriceLevel[]} bids
 * @property {RestResponseOrderBookPriceLevel[]} asks
 */
export interface RestResponseOrderBookLevel2 extends RestResponseOrderBook {
  bids: RestResponseOrderBookPriceLevel[];
  asks: RestResponseOrderBookPriceLevel[];
}

/**
 * Ping
 *
 * @typedef {Object} RestResponsePing
 */
export type RestResponsePing = { [key: string]: never };

/**
 * Ticker
 *
 * @typedef {Object} RestResponseTicker
 * @property {string} market - Base-quote pair e.g. 'IDEX-ETH'
 * @property {string} percentChange - % change from open to close
 * @property {string} baseVolume - 24h volume in base terms
 * @property {string} quoteVolume - 24h volume in quote terms
 * @property {string | null} low - Lowest traded price in the period in quote terms
 * @property {string | null} high - Highest traded price in the period in quote terms
 * @property {string | null} bid - Best bid price on the order book
 * @property {string | null} ask - Best ask price on the order book
 * @property {string | null} open - Price of the first trade for the period in quote terms
 * @property {string | null} close - Same as last
 * @property {string | null} closeQuantity - Quantity of the last period in base terms
 * @property {number} time - Time when data was calculated, open and change is assumed to be trailing 24h
 * @property {number} numTrades - Number of fills for the market in the period
 * @property {number | null} sequence - Last trade sequence number for the market
 */
export interface RestResponseTicker {
  market: string;
  percentChange: string;
  baseVolume: string;
  quoteVolume: string;
  low: string | null;
  high: string | null;
  bid: string | null;
  ask: string | null;
  open: string | null;
  close: string | null;
  closeQuantity: string | null;
  time: number;
  numTrades: number;
  sequence: number | null;
}

/**
 * Time
 *
 * @typedef {Object} RestResponseTime
 * @property {number} time - Current server time
 */
export interface RestResponseTime {
  serverTime: number;
}

/**
 * Trade
 *
 * @typedef {Object} RestResponseTrade
 * @property {TradeType} type - orderBook, pool, or hybrid
 * @property {string} fillId - Internal ID of fill
 * @property {string} price - Executed price of trade in quote terms
 * @property {string} quantity - Executed quantity of trade in base terms
 * @property {string} quoteQuantity - Executed quantity of trade in quote terms
 * @property {number} time - Fill timestamp
 * @property {OrderSide} makerSide - Which side of the order the liquidity maker was on
 * @property {number} sequence - Last trade sequence number for the market
 */
export interface RestResponseTrade {
  type: keyof typeof enums.TradeType;
  fillId: string;
  price: string;
  quantity: string;
  quoteQuantity: string;
  time: number;
  makerSide: keyof typeof enums.OrderSide;
  sequence: number;
}

/**
 * User
 *
 * @typedef {Object} RestResponseUser
 * @property {boolean} depositEnabled - Deposits are enabled for the user account
 * @property {boolean} orderEnabled - Placing orders is enabled for the user account
 * @property {boolean} cancelEnabled - Cancelling orders is enabled for the user account
 * @property {boolean} withdrawEnabled - Withdrawals are enabled for the user account
 * @property {string} totalPortfolioValueUsd - Total value of all holdings deposited on the exchange, for all wallets associated with the user account, in USD
 * @property {string} makerFeeRate - User-specific maker trade fee rate
 * @property {string} takerFeeRate - User-specific taker trade fee rate
 * @property {string} takerIdexFeeRate - User-specific liquidity pool taker IDEX fee rate
 * @property {string} takerLiquidityProviderFeeRate - User-specific liquidity pool taker LP provider fee rate
 */
export interface RestResponseUser {
  depositEnabled: boolean;
  orderEnabled: boolean;
  cancelEnabled: boolean;
  withdrawEnabled: boolean;
  totalPortfolioValueUsd: string;
  makerFeeRate: string;
  takerFeeRate: string;
  takerIdexFeeRate: string;
  takerLiquidityProviderFeeRate: string;
}

/**
 * @typedef {Object} RestResponseWallet
 * @property {string} address - Ethereum address of the wallet
 * @property {string} totalPortfolioValueUsd - Total value of all holdings deposited on the exchange for the wallet in USD
 * @property {number} time - Timestamp of association of the wallet with the user account
 */
export interface RestResponseWallet {
  address: string;
  totalPortfolioValueUsd: string;
  time: number;
}

/**
 * @typedef {Object} RestResponseWebSocketToken
 * @property {string} token - WebSocket subscription authentication token
 */
export interface RestResponseWebSocketToken {
  token: string;
}

interface RestResponseWithdrawalBase {
  withdrawalId: string;
  quantity: string;
  time: number;
  fee: string;
  txId: string | null;
  txStatus: keyof typeof enums.EthTransactionStatus;
}

/**
 * @typedef {Object} RestResponseWithdrawal
 * @property {string} withdrawalId - Exchange-assigned withdrawal identifier
 * @property {string} [asset] - Symbol of the withdrawn asset, exclusive with assetContractAddress
 * @property {string} [assetContractAddress] - Token contract address of withdrawn asset, exclusive with asset
 * @property {string} quantity - Quantity of the withdrawal
 * @property {number} time - Timestamp of withdrawal API request
 * @property {string} fee - Amount deducted from withdrawal to cover IDEX-paid gas
 * @property {string | null} txId - Ethereum transaction ID, if available
 * @property {string} txStatus - Ethereum transaction status
 */
export interface RestResponseWithdrawal extends RestResponseWithdrawalBase {
  asset: string;
  assetContractAddress: string;
}

/**
 * @typedef {Object} RestResponseAssociateWallet
 * @property {string} address - Ethereum address of the wallet
 * @property {string} totalPortfolioValueUsd - Total value of all holdings deposited on the exchange for the wallet in USD
 * @property {number} time - Timestamp of association of the wallet with the user account
 */
export type RestResponseAssociateWallet = {
  address: string;
  totalPortfolioValueUsd: string;
  time: number;
};
