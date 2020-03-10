import Axios, { AxiosInstance, AxiosResponse } from 'axios';
import Base64 from 'crypto-js/enc-base64';
import hmacSHA512 from 'crypto-js/hmac-sha512';
import queryString from 'query-string';
import sha256 from 'crypto-js/sha256';
import { ethers } from 'ethers';

import * as models from './models';

export default class PublicClient {
  public baseURL: string;

  private axios: AxiosInstance;

  public constructor(baseURL: string) {
    this.baseURL = baseURL;

    this.axios = Axios.create({});
  }

  public async ping(): Promise<void> {
    this.get('/ping');
  }

  public async getServerTime(): Promise<number> {
    return (await this.get('/time')).data.serverTime;
  }

  public async getExchangeInfo(): Promise<models.ExchangeInfo> {
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
