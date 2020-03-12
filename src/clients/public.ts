import Axios, { AxiosInstance, AxiosResponse } from 'axios';
import Base64 from 'crypto-js/enc-base64';
import hmacSHA512 from 'crypto-js/hmac-sha512';
import queryString from 'query-string';
import sha256 from 'crypto-js/sha256';
import { ethers } from 'ethers';

import { enums, request, response } from '../types';

/**
 * Public API client
 *
 * ```typescript
 * import * as idex from '@idexio/idex-node';
 *
 * // Edit the values below for your environment
 * const config = {
 *   baseURL: 'https://api-sandbox.idex.io/api/v1',
 *   apiKey:
 *     'MTQxMA==.MQ==.TlRnM01qSmtPVEF0TmpJNFpDMHhNV1ZoTFRrMU5HVXROMlJrTWpRMVpEUmlNRFU0',
 * };
 *
 * const publicClient = new idex.PublicClient(config.baseURL);
 *
 * // Optionally provide an API key to increase rate limits
 * const publicClientWithApiKey = new idex.PublicClient(
 *   config.baseURL,
 *   config.apiKey,
 * );
 * ```
 *
 * @param {string} baseUrl
 * @param {string} [apiKey] Increases rate limits if provided
 */
export default class PublicClient {
  public baseURL: string;

  private axios: AxiosInstance;

  public constructor(baseURL: string, apiKey?: string) {
    this.baseURL = baseURL;

    this.axios = apiKey
      ? (this.axios = Axios.create({
          headers: { Authorization: `Bearer ${apiKey}` },
        }))
      : Axios.create({});
  }

  /**
   * Test connectivity to the REST API
   */
  public async ping(): Promise<void> {
    this.get('/ping');
  }

  /**
   * Get the current server time
   *
   * @returns {Promise<number>} Milliseconds since UNIX epoch
   */
  public async getServerTime(): Promise<number> {
    return (await this.get('/time')).data.serverTime;
  }

  /**
   * Get basic exchange info
   *
   * @return {Promise<response.ExchangeInfo>}
   */
  public async getExchangeInfo(): Promise<response.ExchangeInfo> {
    return (await this.get('/exchange')).data;
  }

  /**
   * Get comprehensive list of assets
   *
   * @return {Promise<response.Asset[]>}
   */
  public async getAssets(): Promise<response.Asset[]> {
    return (await this.get('/assets')).data;
  }

  /**
   * Get currently listed markets
   *
   * @return {Promise<response.Market[]>}
   */
  public async getMarkets(): Promise<response.Market[]> {
    return (await this.get('/markets')).data;
  }

  /**
   * Get current top bid/ask price levels of order book for a market
   *
   * @param {string} market - Base-quote pair e.g. 'IDEX-ETH'
   * @return {Promise<response.OrderBookLevel1>}
   */
  public async getOrderBookLevel1(
    market: string,
  ): Promise<response.OrderBookLevel1> {
    return (await this.get('/orderbook', { level: 1, market })).data;
  }

  /**
   * Get current order book price levels for a market
   *
   * @param {string} market - Base-quote pair e.g. 'IDEX-ETH'
   * @param {number} limit - Number of bids and asks to return. Default is 50, 0 returns the entire book
   * @return {Promise<response.OrderBookLevel2>}
   */
  public async getOrderBookLevel2(
    market: string,
    limit = 50,
  ): Promise<response.OrderBookLevel2> {
    return (await this.get('/orderbook', { level: 2, market, limit })).data;
  }

  /**
   * Get current order book entries for a market
   *
   * @param {string} market - Base-quote pair e.g. 'IDEX-ETH'
   * @param {number} limit - Number of bids and asks to return. Value of 0 returns the entire book
   * @return {Promise<response.OrderBookLevel3>}
   */
  public async getOrderBookLevel3(
    market: string,
    limit = 50,
  ): Promise<response.OrderBookLevel3> {
    return (await this.get('/orderbook', { level: 3, market, limit })).data;
  }

  /**
   * Get currently listed markets
   *
   * @param {string} [market] - Base-quote pair e.g. 'IDEX-ETH', if provided limits ticker data to a single market
   * @return {Promise<response.Ticker[]>}
   */
  public async getTickers(market?: string): Promise<response.Ticker[]> {
    return (await this.get('/tickers', { market })).data;
  }

  /**
   * Get candle (OHLCV) data for a market
   *
   * @param {string} [market] - Base-quote pair e.g. 'IDEX-ETH'
   * @param {CandleInterval} [interval] - Time interval for data
   * @param {number} [start] - Start period timestamp
   * @param {number} [end] - End period timestamp
   * @param {number} [limit] - Max results to return from 1-1000

   * @return {Promise<response.Candle[]>}
   */
  public async getCandles(
    market: string,
    interval: enums.CandleInterval,
    start?: number,
    end?: number,
    limit = 50,
  ): Promise<response.Candle[]> {
    return (await this.get('/candles', { market })).data;
  }

  /**
   * Get public trade history for a market
   *
   * @param {string} market - Base-quote pair e.g. 'IDEX-ETH'
   * @param {number} [start] - Starting timestamp (inclusive)
   * @param {number} [end] - Ending timestamp (inclusive)
   * @param {number} [limit] - Max results to return from 1-1000
   * @param {string} [fromId] - Fills created at the same timestamp or after fillId
   * @return {Promise<response.Trade[]>}
   */
  public async getTrades(
    market: string,
    start?: number,
    end?: number,
    limit = 50,
    fromId?: string,
  ): Promise<response.Trade[]> {
    return (await this.get('/trades', { market, start, end, limit, fromId }))
      .data;
  }

  private async get(
    endpoint: string,
    requestParams: Record<string, number | string> = {},
  ): Promise<AxiosResponse> {
    return this.axios({
      method: 'GET',
      url: `${this.baseURL}${endpoint}`,
      params: requestParams,
    });
  }
}
