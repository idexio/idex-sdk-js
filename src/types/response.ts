import * as enums from './enums';

/**
 * Asset
 *
 * @typedef {Object} response.Asset
 * @property {number} id - Internal id of the asset
 * @property {string} name
 * @property {string} symbol
 * @property {string} contractAddress
 * @property {number} decimals
 * @property {string} depositMinimum
 * @property {string} withdrawalMinimum
 */
export interface Asset {
  id: number;
  name: string;
  symbol: string;
  contractAddress: string;
  decimals: number;
  depositMinimum: string;
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
 * OHLCV data points aggregated by time interval
 *
 * @typedef {Object} response.Candle
 * @property {number} time - Timestamp of the datapoint
 * @property {string} open - Price of the first fill of the interval in quote terms
 * @property {string} high - Price of the highest fill of the interval in quote terms
 * @property {string} low - Price of the lowest fill of the interval in quote terms
 * @property {string} close - Price of the last fill of the interval in quote terms
 * @property {string} volume - Total volume of the period in base terms
 */
export interface Candle {
  time: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
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
 * Fill
 *
 * @typedef {Object} response.Fill
 * @property {string} fillId - Internal ID of fill
 * @property {string} orderId - Internal ID of order
 * @property {string} clientOrderId - Client-provided ID of order
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
 */
export interface Fill extends OrderFill {
  fillId: string;
  orderId: string;
  clientOrderId: string;
  market: string;
  price: string;
  quantity: string;
  quoteQuantity: string;
  makerSide: keyof typeof enums.OrderSide;
  fee: string;
  feeAsset: string;
  gas: string;
  side: keyof typeof enums.OrderSide;
  liquidity: keyof typeof enums.Liquidity;
  time: number;
  sequence: number;
}

/**
 * OrderFill
 *
 * @typedef {Object} response.OrderFill
 * @property {string} price - Executed price of fill in quote terms
 * @property {string} quantity - Executed quantity of fill in base terms
 * @property {string} fee - Fee amount on fill
 * @property {string} feeAsset - Which token the fee was taken in
 * @property {string} gas
 */
export interface OrderFill {
  price: string;
  quantity: string;
  fee: string;
  feeAsset: string;
  gas: string;
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
 * @property {string} market - Base-quote pair e.g. 'IDEX-ETH'
 * @property {string} orderId - IDEX-assigned order id
 * @property {string} [clientOrderId] - If provided by the client
 * @property {string} wallet
 * @property {string} time - Timestamp of initial trading engine processing
 * @property {OrderStatus} status
 * @property {string} [rejectionCode] - Error code capturing reason for rejection
 * @property {string} [rejectionReason] - Human readable rejection error message
 * @property {OrderType} type
 * @property {OrderSide} side
 * @property {OrderTimeInForce} [timeInForce] - Defaults to gtc
 * @property {string} [price] - Price in quote terms, optional for market orders
 * @property {string} [stopPrice] - Stop loss or take profit price, only if stop or take order
 * @property {OrderSelfTradePrevention} [selfTradePrevention] - Stop loss or take profit price, only if stop or take order
 * @property {string} originalQuantity - Original quantity specified by the order in base terms
 * @property {string} executedQuantity - Amount of quantity that has been executed in base terms
 * @property {string} cumulativeQuoteQuantity - Represents the cumulative amount of the quote that has been spent (with a BUY order) or received (with a SELL order). Historical orders will have a value < 0 in this field indicating the data is not available at this time
 * @property {string} [avgExecutionPrice]
 * @property {response.Fill[]} fills
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
  timeInForce: keyof typeof enums.OrderTimeInForce;
  price?: string;
  stopPrice?: string;
  selfTradePrevention: keyof typeof enums.OrderSelfTradePrevention;
  originalQuantity: string;
  executedQuantity: string;
  cumulativeQuoteQuantity: string;
  avgExecutionPrice?: string;
  fills: OrderFill[];
}

/**
 * OrderBookPriceLevel
 *
 * @typedef {Object} response.OrderBookPriceLevel
 * @property {string} price
 * @property {number} size
 * @property {number} [numOrders]
 */
export interface OrderBookPriceLevel {
  price: string;
  size: number;
  numOrders?: number;
}

/**
 * OrderBookOrder
 *
 * @typedef {Object} response.OrderBookOrder
 * @property {string} price
 * @property {number} size
 * @property {string} orderId
 */

export interface OrderBookOrder {
  price: string;
  size: number;
  orderId: string;
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
 * OrderBookLevel3
 *
 * @typedef {Object} response.OrderBookLevel3
 * @property {response.OrderBookOrder[]} bids
 * @property {response.OrderBookOrder[]} asks
 */
export interface OrderBookLevel3 extends OrderBook {
  bids: OrderBookOrder[];
  asks: OrderBookOrder[];
}

/**
 * Ticker
 *
 * @typedef {Object} response.Ticker
 * @property {string} market - Base-quote pair e.g. 'IDEX-ETH'
 * @property {string} percentChange - % change from open to close
 * @property {string} baseVolume - 24h volume in base terms
 * @property {string} quoteVolume - 24h volume in quote terms
 * @property {string} last - Price of the last trade for the period in quote terms
 * @property {string} low - Lowest traded price in the period in quote terms
 * @property {string} high - Highest traded price in the period in quote terms
 * @property {string} bid - Best bid price on the order book
 * @property {string} ask - Best ask price on the order book
 * @property {string} open - Price of the first trade for the period in quote terms
 * @property {string} close - Same as last
 * @property {string} lastQuantity - Quantity of the last period in base terms
 * @property {string} time - Time when data was calculated, open and change is assumed to be trailing 24h
 * @property {string} [numTrades] - Number of fills for the market in the period
 * @property {string} [lastSequenceNumber] - Last trade sequence number for the market
 */
export interface Ticker {
  market: string;
  percentChange: string;
  baseVolume: string;
  quoteVolume: string;
  last: string;
  low: string;
  high: string;
  bid: string;
  ask: string;
  open: string;
  close: string;
  lastQuantity: string;
  time: string;
  numTrades?: string;
  lastSequenceNumber?: string;
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
  sequence: number;
}

/**
 * User
 *
 * @typedef {Object} response.User
 * @property {UserStatus} depositStatus
 * @property {UserStatus} orderStatus
 * @property {UserStatus} cancelStatus
 * @property {UserStatus} withdrawStatus
 * @property {number} kycTier
 * @property {string} totalPortfolioValue - Total value of all holdings of all wallets on the exchange, denominated in USD
 * @property {string} withdrawalLimit - 24h withdrawal limit for the user account denominated in USD (non-negative integer or “unlimited”)
 * @property {string} withdrawalRemaining - Remaining 24h withdrawal amount for the user account denominated in USD (non-negative integer or “unlimited”)
 */
export interface User {
  depositStatus: enums.UserStatus;
  orderStatus: enums.UserStatus;
  cancelStatus: enums.UserStatus;
  withdrawStatus: enums.UserStatus;
  kycTier: 0 | 1 | 2;
  totalPortfolioValue: string;
  withdrawalLimit: string;
  withdrawalRemaining: string;
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
