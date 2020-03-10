import Axios, { AxiosInstance, AxiosResponse } from 'axios';
import Base64 from 'crypto-js/enc-base64';
import hmacSHA512 from 'crypto-js/hmac-sha512';
import queryString from 'query-string';
import sha256 from 'crypto-js/sha256';
import { ethers } from 'ethers';

import * as types from './types';

/**
 * Public API client
 *
 * ```typescript
 * const publicClient = new PublicClient('https://api-sandbox.idex.io/api/v1');
 * ```
 */
export default class PublicClient {
  public baseURL: string;

  private axios: AxiosInstance;

  public constructor(baseURL: string) {
    this.baseURL = baseURL;

    this.axios = Axios.create({});
  }

  /**
   * Test connectivity to the REST API
   */
  public async ping(): Promise<void> {
    this.get('/ping');
  }

  /**
   * Get the current server time
   */
  public async getServerTime(): Promise<number> {
    return (await this.get('/time')).data.serverTime;
  }

  /**
   * Get comprehensive list of assets
   */
  public async getAssets(): Promise<types.Asset[]> {
    return (await this.get('/assets')).data;
  }

  /**
   * Get basic exchange info
   *
   * @return {Promise<ExchangeInfo>}
   */
  public async getExchangeInfo(): Promise<types.ExchangeInfo> {
    return (await this.get('/exchange')).data;
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
