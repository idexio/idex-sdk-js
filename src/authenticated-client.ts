import Axios, { AxiosInstance, AxiosResponse } from 'axios';
import Base64 from 'crypto-js/enc-base64';
import hmacSHA512 from 'crypto-js/hmac-sha512';
import queryString from 'query-string';
import sha256 from 'crypto-js/sha256';
import { ethers } from 'ethers';

import * as types from './types';
import * as utils from './utils';

/**
 * Authenticated API client
 *
 * ```typescript
 * const config = {
 *   baseURL: 'https://api-sandbox.idex.io/api/v1',
 *   apiKey:
 *     'MTQxMA==.MQ==.TlRnM01qSmtPVEF0TmpJNFpDMHhNV1ZoTFRrMU5HVXROMlJrTWpRMVpEUmlNRFU0',
 *   apiSecret: 'axuh3ywgg854aq7m73oy6gnnpj5ar9a67szuw5lclbz77zqu0j',
 *   walletPrivateKey:
 *     '0x3141592653589793238462643383279502884197169399375105820974944592',
 * };
 * const authenticatedClient = new AuthenticatedClient(
 *   config.baseURL,
 *   config.apiKey,
 *   config.apiSecret,
 *   new ethers.Wallet(config.walletPrivateKey),
 * );
 * ```
 */
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

  public async placeOrder(order: types.Order): Promise<AxiosResponse> {
    return this.post('/orders', {
      parameters: order,
      signature: await this.wallet.signMessage(getOrderHash(order)),
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

const getOrderHash = (order: types.Order) =>
  ethers.utils.solidityKeccak256(
    [
      'string',
      'uint8',
      'uint8',
      'string',
      'string',
      'string',
      'string',
      'address',
      'uint128',
    ],
    [
      order.market,
      types.OrderSide[order.side],
      types.OrderType[order.type],
      (order as types.OrderByBaseQuantity).quantity || '',
      (order as types.OrderByQuoteQuantity).quoteOrderQuantity || '',
      (order as types.OrderWithPrice).price || '',
      (order as types.OrderWithStopPrice).stopPrice || '',
      order.wallet,
      utils.uuidToBuffer(order.nonce),
    ],
  );
