import http from 'http';
import https from 'https';
import Axios, { AxiosInstance, AxiosResponse } from 'axios';

import * as types from '../../types';

import * as constants from '../../constants';

import { isNode } from '../../utils';

/**
 * Public REST API client options
 *
 * @typedef {Object} RestPublicClientOptions
 * @property {boolean} sandbox - Must be set to true
 * @property {string} [apiKey] - Increases rate limits if provided
 */
export interface RestPublicClientOptions {
  sandbox?: boolean;
  baseURL?: string;
  apiKey?: string;
}

/**
 * Public REST API client
 *
 * @example
 * import { v1 as uuidv1 } from 'uuid';
 * import { RestPublicClient } from '@idexio/idex-sdk';
 *
 * const publicClient = new RestPublicClientPublic({
 *   sandbox: true,
 *   // Optionally provide an API key to increase rate limits
 *   apiKey: '1f7c4f52-4af7-4e1b-aa94-94fac8d931aa',
 * });
 * console.log(await publicClient.getTickers('IDEX-ETH'));
 *
 * @param {RestPublicClientOptions} options
 */
export default class RestPublicClient {
  public baseURL: string;

  private axios: AxiosInstance;

  public constructor(options: RestPublicClientOptions) {
    const baseURL = options.sandbox
      ? constants.SANDBOX_REST_API_BASE_URL
      : options.baseURL;
    if (!baseURL) {
      throw new Error('Must set sandbox to true');
    }

    this.baseURL = baseURL;

    const headers = options.apiKey
      ? { [constants.REST_API_KEY_HEADER]: options.apiKey }
      : null;
    this.axios = isNode
      ? Axios.create({
          headers,
          httpAgent: new http.Agent({ keepAlive: true }),
          httpsAgent: new https.Agent({ keepAlive: true }),
        })
      : Axios.create({
          headers,
        });
  }

  // Public Data Endpoints

  /**
   * Test connectivity to the REST API
   *
   * @see https://docs.idex.io/#get-ping
   */
  public async ping(): Promise<{ [key: string]: never }> {
    return (await this.get('/ping')).data;
  }

  /**
   * Returns the current server time
   *
   * @see https://docs.idex.io/#get-time
   *
   * @returns {Promise<number>} Current server time as milliseconds since UNIX epoch
   */
  public async getServerTime(): Promise<number> {
    return (await this.get('/time')).data.serverTime;
  }

  /**
   * Returns basic information about the exchange.
   *
   * @see https://docs.idex.io/#get-exchange
   *
   * @return {Promise<types.RestResponseExchangeInfo>}
   */
  public async getExchangeInfo(): Promise<types.RestResponseExchangeInfo> {
    return (await this.get('/exchange')).data;
  }

  /**
   * Returns information about assets supported by the exchange
   *
   * @see https://docs.idex.io/#get-assets
   *
   * @return {Promise<types.RestResponseAsset[]>}
   */
  public async getAssets(): Promise<types.RestResponseAsset[]> {
    return (await this.get('/assets')).data;
  }

  /**
   * Returns information about the currently listed markets
   *
   * @see https://docs.idex.io/#get-markets
   *
   * @param {FindMarkets} findMarkets
   * @return {Promise<types.RestResponseMarket[]>}
   */
  public async getMarkets(
    findMarkets: types.RestRequestFindMarkets,
  ): Promise<types.RestResponseMarket[]> {
    return (await this.get('/markets', findMarkets)).data;
  }

  // Market Data Endpoints

  /**
   * Returns market statistics for the trailing 24-hour period
   *
   * @see https://docs.idex.io/#get-tickers
   *
   * @param {string} [market] - Base-quote pair e.g. 'IDEX-ETH', if provided limits ticker data to a single market
   * @return {Promise<types.RestResponseTicker[]>}
   */
  public async getTickers(
    market?: string,
  ): Promise<types.RestResponseTicker[]> {
    return (await this.get('/tickers', { market })).data;
  }

  /**
   * Returns candle (OHLCV) data for a market
   *
   * @see https://docs.idex.io/#get-candles
   *
   * @param {FindCandles} findCandles
   * @return {Promise<types.RestResponseCandle[]>}
   */
  public async getCandles(
    findCandles: types.RestRequestFindCandles,
  ): Promise<types.RestResponseCandle[]> {
    return (await this.get('/candles', findCandles)).data;
  }

  /**
   * Returns public trade data for a market
   *
   * @see https://docs.idex.io/#get-trades
   *
   * @param {types.RestRequestFindTrades} findTrades
   * @return {Promise<types.RestResponseTrade[]>}
   */
  public async getTrades(
    findTrades: types.RestRequestFindTrades,
  ): Promise<types.RestResponseTrade[]> {
    return (await this.get('/trades', findTrades)).data;
  }

  /**
   * Get current top bid/ask price levels of order book for a market
   *
   * @see https://docs.idex.io/#get-order-books
   *
   * @param {string} market - Base-quote pair e.g. 'IDEX-ETH'
   * @return {Promise<types.RestResponseOrderBookLevel1>}
   */
  public async getOrderBookLevel1(
    market: string,
  ): Promise<types.RestResponseOrderBookLevel1> {
    return (await this.get('/orderbook', { level: 1, market })).data;
  }

  /**
   * Get current order book price levels for a market
   *
   * @see https://docs.idex.io/#get-order-books
   *
   * @param {string} market - Base-quote pair e.g. 'IDEX-ETH'
   * @param {number} [limit=50] - Number of bids and asks to return. Default is 50, 0 returns the entire book
   * @return {Promise<types.RestResponseOrderBookLevel2>}
   */
  public async getOrderBookLevel2(
    market: string,
    limit = 50,
  ): Promise<types.RestResponseOrderBookLevel2> {
    return (await this.get('/orderbook', { level: 2, market, limit })).data;
  }

  // Internal methods exposed for advanced usage

  protected async get(
    endpoint: string,
    RestRequestParams: Record<string, any> = {}, // eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<AxiosResponse> {
    return this.axios({
      method: 'GET',
      url: `${this.baseURL}${endpoint}`,
      params: RestRequestParams,
    });
  }
}
