import * as enums from './enums';

/**
 * Asset
 *
 * @typedef {Object} response.Asset
 * @property {number} id - Internal id of the asset
 * @property {string} name
 * @property {string} symbol
 * @property {string} contractAddress
 * @property {string} decimals
 * @property {string} depositMinimum
 * @property {string} tradeMinimum
 * @property {string} withdrawalMinimum
 */
export interface Asset {
  id: number;
  name: string;
  symbol: string;
  contractAddress: string;
  decimals: string;
  depositMinimum: string;
  tradeMinimum: string;
  withdrawalMinimum: string;
}

/**
 * Balance
 *
 * @typedef {Object} response.Balance
 * @property {string} asset - Balance symbol
 * @property {string} quantity - Total quantity of the asset held by the wallet on the exchange
 * @property {string} availableForTrade - Quantity of the asset available for trading, ie quantity - locked
 * @property {string} availableForWithdrawal - Quantity of the asset available for withdrawal, similar to availableForTrade, but subject to the KYC tier withdrawal limit of the user
 * @property {string} locked - Quantity of the asset locked in trades on the order book
 */
export interface Balance {
  asset: number;
  quantity: string;
  availableForTrade: string;
  availableForWithdrawal: string;
  locked: string;
}

/**
 * Candle (OHLCV) data points aggregated by time interval
 *
 * @typedef {Object} response.Candle
 * @property {number} start - Time of the start of the interval
 * @property {string} open - Price of the first fill of the interval in quote terms
 * @property {string} high - Price of the highest fill of the interval in quote terms
 * @property {string} low - Price of the lowest fill of the interval in quote terms
 * @property {string} close - Price of the last fill of the interval in quote terms
 * @property {string} volume - Total volume of the period in base terms
 * @property {number} sequence - Fill sequence number of the last trade in the interval
 */
export interface Candle {
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
 * @typedef {Object} response.Deposit
 * @property {string} depositId - IDEX-issued deposit identifier
 * @property {string} asset - Asset by symbol
 * @property {string} assetContractAddress - Asset by contract address
 * @property {string} quantity - Deposit amount in asset terms
 * @property {string} txId - Ethereum transaction hash
 * @property {number} txTime - Timestamp of the Ethereum deposit tx
 * @property {number} confirmationTime - Timestamp of credit on IDEX including block confirmations
 */
export interface Deposit {
  depositId: string;
  asset: string;
  assetContractAddress: string;
  quantity: string;
  txId: string;
  txTime: number;
  confirmationTime: number;
}

/**
 * Basic exchange info
 *
 * @typedef {Object} response.ExchangeInfo
 * @property {string} timeZone - UTC
 * @property {number} serverTime - UNIX epoch time in ms
 * @property {string} ethereumDepositContractAddress
 * @property {string} ethUsdPrice
 * @property {string} gasPrice - In gwei
 * @property {string} usdVolume24h - 24h volume in USD
 * @property {string} makerFeeRate
 * @property {string} takerFeeRate
 * @property {string} withdrawMinimum
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
  withdrawMinimum: string;
}

/**
 * Fill
 *
 * @typedef {Object} response.Fill
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
 * @property {string} sequence - Last trade sequence number for the market
 * @property {string} [txId] - Ethereum transaction id, if available
 * @property {string} txStatus - Eth Tx Status
 */
export interface Fill extends OrderFill {
  orderId: string;
  clientOrderId?: string;
  market: string;
  side: keyof typeof enums.OrderSide;
}

/**
 * OrderFill
 *
 * @typedef {Object} response.OrderFill
 * @property {string} fillId - Internal ID of fill
 * @property {string} price - Executed price of fill in quote terms
 * @property {string} quantity - Executed quantity of fill in base terms
 * @property {string} quoteQuantity - Executed quantity of trade in quote terms
 * @property {OrderSide} makerSide - Which side of the order the liquidity maker was on
 * @property {string} fee - Fee amount on fill
 * @property {string} feeAsset - Which token the fee was taken in
 * @property {string} [gas]
 * @property {Liquidity} liquidity
 * @property {string} time - Fill timestamp
 * @property {string} sequence - Last trade sequence number for the market
 * @property {string} [txId] - Ethereum transaction id, if available
 * @property {string} txStatus - Eth Tx Status
 */
export interface OrderFill {
  fillId: string;
  price: string;
  quantity: string;
  quoteQuantity: string;
  time: number;
  makerSide: keyof typeof enums.OrderSide;
  sequence: string;
  fee: string;
  feeAsset: string;
  gas?: string;
  liquidity: keyof typeof enums.Liquidity;
  txId?: string;
  txStatus: keyof typeof enums.EthTransactionStatus;
}

/**
 * Market
 *
 * @typedef {Object} response.Market
 * @property {string} market - Base-quote pair e.g. 'IDEX-ETH'
 * @property {MarketStatus} status
 * @property {string} baseAsset - e.g. 'IDEX'
 * @property {number} baseAssetPrecision
 * @property {string} quoteAsset - e.g. 'ETH'
 * @property {number} quoteAssetPrecision
 * @property {string} makerFeeRate
 * @property {string} takerFeeRate
 * @property {OrderType[]} orderTypes
 * @property {string} tradeMinimum - Minimum quantity in base terms
 */
export interface Market {
  market: string;
  status: keyof typeof enums.MarketStatus;
  baseAsset: string;
  baseAssetPrecision: number;
  quoteAsset: string;
  quoteAssetPrecision: number;
  makerFeeRate: string;
  takerFeeRate: string;
  orderTypes: (keyof typeof enums.OrderType)[];
  tradeMinimum: string;
}

/**
 * Order
 *
 * @typedef {Object} response.Order
 * @property {string} market - Market symbol as base-quote pair e.g. 'IDEX-ETH'
 * @property {string} orderId - Exchange-assigned order identifier
 * @property {string} [clientOrderId] - Client-specified order identifier
 * @property {string} wallet - Ethereum address of placing wallet
 * @property {string} time - Time of initial order processing by the matching engine
 * @property {OrderStatus} status - Current order status
 * @property {string} [rejectionCode] - Error short code explaining order rejection or failed batch cancel
 * @property {string} [rejectionReason] - Error description explaining order rejection or failed batch cancel
 * @property {OrderType} type - Order type
 * @property {OrderSide} side - Order side
 * @property {string} [originalQuantity] - Original quantity specified by the order in base terms, omitted for market orders specified in quote terms
 * @property {string} [originalQuoteQuantity] - Original quantity specified by the order in quote terms, only present for market orders specified in quote terms
 * @property {string} executedQuantity - Quantity that has been executed in base terms
 * @property {string} cumulativeQuoteQuantity - Cumulative quantity that has been spent (buy orders) or received (sell orders) in quote terms, omitted if unavailable for historical orders
 * @property {string} [avgExecutionPrice] - Weighted average price of fills associated with the order; only present with fills
 * @property {string} [price] -	Original price specified by the order in quote terms, omitted for all market orders
 * @property {string} [stopPrice] - Stop loss or take profit price, only present for stopLoss, stopLossLimit, takeProfit, and takeProfitLimit orders
 * @property {OrderTimeInForce} [timeInForce] - Time in force policy, see values, only present for all limit orders specifying a non-default (gtc) policy
 * @property {OrderSelfTradePrevention} [selfTradePrevention] - Self-trade prevention policy, see values, only present for orders specifying a non-default (dc) policy
 * @property {response.OrderFill[]} - Array of order fill objects
 */
export interface Order {
  market: string;
  orderId: string;
  clientOrderId?: string;
  wallet: string;
  time: number;
  status: keyof typeof enums.OrderStatus;
  rejectionCode?: string;
  rejectionReason?: string;
  type: keyof typeof enums.OrderType;
  side: keyof typeof enums.OrderSide;
  originalQuantity?: string;
  originalQuoteQuantity?: string;
  executedQuantity: string;
  cumulativeQuoteQuantity: string;
  avgExecutionPrice?: string;
  price?: string;
  stopPrice?: string;
  timeInForce: keyof typeof enums.OrderTimeInForce;
  selfTradePrevention: keyof typeof enums.OrderSelfTradePrevention;
  fills?: OrderFill[];
}

/**
 * OrderBookPriceLevel
 *
 * @typedef {Object} response.OrderBookPriceLevel
 * @property {string} price
 * @property {string} size
 * @property {number} [numOrders]
 */
export interface OrderBookPriceLevel {
  price: string;
  size: string;
  numOrders?: number;
}

interface OrderBook {
  sequence: number;
  bids: unknown[];
  asks: unknown[];
}

/**
 * OrderBookLevel1
 *
 * @typedef {Object} response.OrderBookLevel1
 * @property {[response.OrderBookPriceLevel]} bids
 * @property {[response.OrderBookPriceLevel]} asks
 */
export interface OrderBookLevel1 extends OrderBook {
  bids: [OrderBookPriceLevel];
  asks: [OrderBookPriceLevel];
}

/**
 * OrderBookLevel2
 *
 * @typedef {Object} response.OrderBookLevel2
 * @property {response.OrderBookPriceLevel[]} bids
 * @property {response.OrderBookPriceLevel[]} asks
 */
export interface OrderBookLevel2 extends OrderBook {
  bids: OrderBookPriceLevel[];
  asks: OrderBookPriceLevel[];
}

/**
 * Ping
 *
 * @typedef {Object} response.Ping
 */
export interface Ping {}

/**
 * Ticker
 *
 * @typedef {Object} response.Ticker
 * @property {string} market - Base-quote pair e.g. 'IDEX-ETH'
 * @property {string} percentChange - % change from open to close
 * @property {string} baseVolume - 24h volume in base terms
 * @property {string} quoteVolume - 24h volume in quote terms
 * @property {string} low - Lowest traded price in the period in quote terms
 * @property {string} high - Highest traded price in the period in quote terms
 * @property {string} bid - Best bid price on the order book
 * @property {string} ask - Best ask price on the order book
 * @property {string} open - Price of the first trade for the period in quote terms
 * @property {string} close - Same as last
 * @property {string} closeQuantity - Quantity of the last period in base terms
 * @property {number} time - Time when data was calculated, open and change is assumed to be trailing 24h
 * @property {string} numTrades - Number of fills for the market in the period
 * @property {number} sequence - Last trade sequence number for the market
 */
export interface Ticker {
  market: string;
  percentChange: string;
  baseVolume: string;
  quoteVolume: string;
  low: string;
  high: string;
  bid: string;
  ask: string;
  open: string;
  close: string;
  closeQuantity: string;
  time: number;
  numTrades: string;
  sequence: number;
}

/**
 * Time
 *
 * @typedef {Object} response.Time
 * @property {number} time - Current server time
 */
export interface Time {
  serverTime: number;
}

/**
 * Trade
 *
 * @typedef {Object} response.Trade
 * @property {string} fillId - Internal ID of fill
 * @property {string} price - Executed price of trade in quote terms
 * @property {string} quantity - Executed quantity of trade in base terms
 * @property {string} quoteQuantity - Executed quantity of trade in quote terms
 * @property {number} time - Fill timestamp
 * @property {OrderSide} makerSide - Which side of the order the liquidity maker was on
 * @property {string} sequence - Last trade sequence number for the market
 */
export interface Trade {
  fillId: string;
  price: string;
  quantity: string;
  quoteQuantity: string;
  time: number;
  makerSide: keyof typeof enums.OrderSide;
  sequence: string;
}

/**
 * User
 *
 * @typedef {Object} response.User
 * @property {boolean} depositEnabled
 * @property {boolean} orderEnabled
 * @property {boolean} cancelEnabled
 * @property {boolean} withdrawEnabled
 * @property {number} kycTier
 * @property {string} totalPortfolioValue - Total value of all holdings of all wallets on the exchange, denominated in USD
 * @property {string} withdrawalLimit - 24h withdrawal limit for the user account denominated in USD (non-negative integer or “unlimited”)
 * @property {string} withdrawalRemaining - Remaining 24h withdrawal amount for the user account denominated in USD (non-negative integer or “unlimited”)
 * @property {string} makerFeeRate - user-specific maker fee rate
 * @property {string} takerFeeRate - user-specific taker fee rate
 */
export interface User {
  depositEnabled: boolean;
  orderEnabled: boolean;
  cancelEnabled: boolean;
  withdrawEnabled: boolean;
  kycTier: 0 | 1 | 2;
  totalPortfolioValue: string;
  withdrawalLimit: string;
  withdrawalRemaining: string;
  markerFeeRate: string;
  takerFeeRate: string;
}

/**
 * @typedef {Object} response.Wallet
 * @property {string} walletId - Internal ID of the wallet
 * @property {string} address - Ethereum address of the wallet
 * @property {string} totalPortfolioValue - Total value of all holdings of the wallet on the exchange, denominated in USD
 * @property {number} time - Timestamp of wallet association with the user account
 */
export interface Wallet {
  walletId?: string;
  address: string;
  totalPortfolioValue: string;
  time: string;
}

/**
 * @typedef {Object} response.WebSocketToken
 * @property {string} token - WebSocket subscription authentication token
 */
export interface WebSocketToken {
  token: string;
}

/**
 * @typedef {Object} response.Withdrawal
 * @property {string} withdrawalId - IDEX-issued withdrawal identifier
 * @property {string} asset - Asset by symbol
 * @property {string} assetContractAddress - Asset by contract address
 * @property {string} quantity - Withdrawal amount in asset terms, fees are taken from this value
 * @property {string} fee - Amount in asset deducted from withdrawal to cover gas
 * @property {string} gas - Gas price in wei used to compute fee
 * @property {string} [txId] - Ethereum transaction hash, if available
 * @property {number} time - Timestamp of receipt / processing
 */
export interface Withdrawal {
  withdrawalId: string;
  asset: string;
  assetContractAddress: string;
  quantity: string;
  fee: string;
  gas: string;
  txId: string | null;
  time: number;
}
