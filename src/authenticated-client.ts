import Axios, { AxiosInstance, AxiosResponse } from 'axios';
import Base64 from 'crypto-js/enc-base64';
import hmacSHA512 from 'crypto-js/hmac-sha512';
import queryString from 'query-string';
import sha256 from 'crypto-js/sha256';
import { ethers } from 'ethers';

import * as models from './models';

export default class AuthenticatedClient {
  public baseURL: string;

  private axios: AxiosInstance;

  private apiKey: string;

  private apiSecret: string;

  private wallet: ethers.Wallet;

  public constructor(
    baseURL: string,
    apiKey: string,
    apiSecret: string,
    wallet: ethers.Wallet,
  ) {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.wallet = wallet;

    this.axios = Axios.create({
      headers: { Authorization: `Bearer ${apiKey}` },
    });
  }

  public async placeOrder(order: models.Order): Promise<AxiosResponse> {
    return this.post('/orders', {
      parameters: order,
      signature: await this.wallet.signMessage(models.getOrderHash(order)),
    });
  }

  private async get(
    endpoint: string,
    requestParams: Record<string, number | string> = {},
  ): Promise<AxiosResponse> {
    return this.axios({
      method: 'GET',
      url: `${this.baseURL}${endpoint}`,
      headers: this.createHmacRequestSignatureHeader(
        queryString.stringify(requestParams),
      ),
      params: requestParams,
    });
  }

  private async post(
    endpoint: string,
    requestParams: Record<string, any>,
  ): Promise<AxiosResponse> {
    return this.axios({
      method: 'POST',
      url: `${this.baseURL}${endpoint}`,
      headers: this.createHmacRequestSignatureHeader(requestParams),
      data: requestParams,
    });
  }

  private async delete(
    endpoint: string,
    requestParams: Record<string, any>,
  ): Promise<AxiosResponse> {
    return this.axios({
      method: 'DELETE',
      url: `${this.baseURL}${endpoint}`,
      headers: this.createHmacRequestSignatureHeader(requestParams),
      data: requestParams,
    });
  }

  private createHmacRequestSignatureHeader(
    payload: string | Record<string, any>,
  ): { 'hmac-request-signature': string } {
    const hashDigest = sha256(
      typeof payload === 'string' ? payload : JSON.stringify(payload),
    );
    const hmacRequestSignature = Base64.stringify(
      hmacSHA512(hashDigest.toString(), this.apiSecret),
    );
    return { 'hmac-request-signature': hmacRequestSignature };
  }
}
