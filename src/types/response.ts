import * as enums from './enums';

/**
 * Asset
 *
 * @typedef {Object} Asset
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
 * Market
 *
 * @typedef {Object} Market
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
  status: enums.MarketStatus;
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
 * Ticker
 *
 * @typedef {Object} Ticker
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
