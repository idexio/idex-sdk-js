import http from 'http';
import https from 'https';
import Axios, { AxiosInstance, AxiosResponse } from 'axios';

import type {
  MultiverseChain,
  RestRequestFindCandles,
  RestRequestFindLiquidityPools,
  RestRequestFindMarkets,
  RestRequestFindTrades,
  RestResponseAsset,
  RestResponseCandle,
  RestResponseExchangeInfo,
  RestResponseLiquidityPool,
  RestResponseMarket,
  RestResponseOrderBookLevel1,
  RestResponseOrderBookLevel2,
  RestResponseTicker,
  RestResponseTrade,
} from '../../types';

import * as constants from '../../constants';

import { isNode } from '../../utils';

/**
 * Public REST API client options
 *
 * @typedef {Object} RestPublicClientOptions
 * @property {boolean} [sandbox]
 * @property {string} [baseURL] - Override the API url
 * @property {string} [apiKey] - Increases rate limits if provided
 * @property {MultiverseChain} [multiverseChain]
 */
export interface RestPublicClientOptions {
  sandbox?: boolean;
  baseURL?: string;
  apiKey?: string;
  multiverseChain?: MultiverseChain;
}

/**
 * Public REST API client
 *
 * @example
 * import { v1 as uuidv1 } from 'uuid';
 * import { RestPublicClient } from '@idexio/idex-sdk';
 *
 * const publicClient = new RestPublicClient({
 *   sandbox: true,
 *   // Optionally provide an API key to increase rate limits
 *   apiKey: '1f7c4f52-4af7-4e1b-aa94-94fac8d931aa',
 * });
 * console.log(await publicClient.getTickers('IDEX-ETH'));
 *
 * @param {RestPublicClientOptions} options
 */
export class RestPublicClient<
  C extends RestPublicClientOptions = RestPublicClientOptions
> {
  private axios: AxiosInstance;

  public readonly config: Readonly<{
    multiverseChain: C['multiverseChain'] extends MultiverseChain
      ? C['multiverseChain']
      : 'matic';
    baseURL: string;
    sandbox: boolean;
  }>;

  public constructor(options: C) {
    const { multiverseChain = 'matic', sandbox = false } = options;

    const baseURL =
      options.baseURL ??
      constants.URLS[options.sandbox ? 'sandbox' : 'production']?.[
        multiverseChain
      ]?.rest;

    if (!baseURL) {
      throw new Error(
        `Invalid configuration, baseURL could not be derived (sandbox? ${String(
          sandbox,
        )}) (chain: ${multiverseChain})`,
      );
    }

    this.config = Object.freeze({
      sandbox,
      baseURL,
      multiverseChain: multiverseChain as this['config']['multiverseChain'],
    } as const);

    const headers = options.apiKey
      ? { [constants.REST_API_KEY_HEADER]: options.apiKey }
      : {};

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
   * @see https://api-docs-v3.idex.io/#get-ping
   * @returns {{}}
   */
  public async ping(): Promise<{ [key: string]: never }> {
    return this.get('/ping');
  }

  /**
   * Returns the current server time
   *
   * @see https://api-docs-v3.idex.io/#get-time
   *
   * @returns {Promise<number>} Current server time as milliseconds since UNIX epoch
   */
  public async getServerTime(): Promise<number> {
    const { serverTime } = await this.get('/time');
    return serverTime;
  }

  /**
   * Returns basic information about the exchange.
   *
   * @see https://api-docs-v3.idex.io/#get-exchange
   *
   * @returns {Promise<RestResponseExchangeInfo>}
   */
  public async getExchangeInfo(): Promise<RestResponseExchangeInfo> {
    return this.get('/exchange');
  }

  /**
   * Returns information about assets supported by the exchange
   *
   * @see https://api-docs-v3.idex.io/#get-assets
   *
   * @returns {Promise<RestResponseAsset[]>}
   */
  public async getAssets(): Promise<RestResponseAsset[]> {
    return this.get('/assets');
  }

  /**
   * Returns information about the currently listed markets
   *
   * @see https://api-docs-v3.idex.io/#get-markets
   *
   * @param {RestRequestFindMarkets} findMarkets
   * @returns {Promise<RestResponseMarket[]>}
   */
  public async getMarkets(
    findMarkets?: RestRequestFindMarkets,
  ): Promise<RestResponseMarket[]> {
    return this.get('/markets', findMarkets);
  }

  /**
   * Returns information about liquidity pools supported by the exchange
   *
   * @see https://api-docs-v3.idex.io/#get-liquidity-pools
   *
   * @param {RestRequestFindLiquidityPools} findLiquidityPools
   * @returns {Promise<RestResponseLiquidityPool[]>}
   */
  public async getLiquidityPools(
    findLiquidityPools?: RestRequestFindLiquidityPools,
  ): Promise<RestResponseLiquidityPool[]> {
    return this.get('/liquidityPools', findLiquidityPools);
  }

  // Market Data Endpoints

  /**
   * Returns market statistics for the trailing 24-hour period
   *
   * @see https://api-docs-v3.idex.io/#get-tickers
   *
   * @param {string} [market] - Base-quote pair e.g. 'IDEX-ETH', if provided limits ticker data to a single market
   * @returns {Promise<RestResponseTicker[]>}
   */
  public async getTickers(market?: string): Promise<RestResponseTicker[]> {
    return this.get('/tickers', market ? { market } : undefined);
  }

  /**
   * Returns candle (OHLCV) data for a market
   *
   * @see https://api-docs-v3.idex.io/#get-candles
   *
   * @param {RestRequestFindCandles} findCandles
   * @returns {Promise<RestResponseCandle[]>}
   */
  public async getCandles(
    findCandles: RestRequestFindCandles,
  ): Promise<RestResponseCandle[]> {
    return this.get('/candles', findCandles);
  }

  /**
   * Returns public trade data for a market
   *
   * @see https://api-docs-v3.idex.io/#get-trades
   *
   * @param {RestRequestFindTrades} findTrades
   * @returns {Promise<RestResponseTrade[]>}
   */
  public async getTrades(
    findTrades: RestRequestFindTrades,
  ): Promise<RestResponseTrade[]> {
    return this.get('/trades', findTrades);
  }

  /**
   * Get current top bid/ask price levels of order book for a market
   *
   * @see https://api-docs-v3.idex.io/#get-order-books
   *
   * @param {string} market - Base-quote pair e.g. 'IDEX-ETH'
   * @returns {Promise<RestResponseOrderBookLevel1>}
   */
  public async getOrderBookLevel1(
    market: string,
    limitOrderOnly = false,
  ): Promise<RestResponseOrderBookLevel1> {
    return this.get('/orderbook', { level: 1, limitOrderOnly, market });
  }

  /**
   * Get current order book price levels for a market
   *
   * @see https://api-docs-v3.idex.io/#get-order-books
   *
   * @param {string} market - Base-quote pair e.g. 'IDEX-ETH'
   * @param {number} [limit=50] - Number of bids and asks to return. Default is 50, 0 returns the entire book
   * @returns {Promise<RestResponseOrderBookLevel2>}
   */
  public async getOrderBookLevel2(
    market: string,
    limit = 50,
    limitOrderOnly = false,
  ): Promise<RestResponseOrderBookLevel2> {
    return this.get('/orderbook', { level: 2, market, limit, limitOrderOnly });
  }

  // Internal methods exposed for advanced usage

  protected async get(
    endpoint: string,
    RestRequestParams: Record<string, any> = {}, // eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<AxiosResponse['data']> {
    return (
      await this.axios({
        method: 'GET',
        url: `${this.config.baseURL}${endpoint}`,
        params: RestRequestParams,
      })
    ).data;
  }
}
