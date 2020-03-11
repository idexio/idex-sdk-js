import Axios, { AxiosInstance, AxiosResponse } from 'axios';
import Base64 from 'crypto-js/enc-base64';
import hmacSHA512 from 'crypto-js/hmac-sha512';
import queryString from 'query-string';
import sha256 from 'crypto-js/sha256';
import { ethers } from 'ethers';

import { enums, request, response } from '../types';
import * as utils from '../utils';

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

  /**
   * Place a new order
   *
   * @param {request.Order} order
   */
  public async placeOrder(order: request.Order): Promise<response.Order> {
    return (
      await this.post('/orders', {
        parameters: order,
        signature: await this.wallet.signMessage(getOrderHash(order)),
      })
    ).data;
  }

  /**
   * Create a new withdrawal
   *
   * @param {request.Withdrawal} withdrawal
   */
  public async withdraw(
    withdrawal: request.Withdrawal,
  ): Promise<response.Withdrawal> {
    return (
      await this.post('/orders', {
        parameters: withdrawal,
        signature: await this.wallet.signMessage(getWithdrawalHash(withdrawal)),
      })
    ).data;
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

const getOrderHash = (order: request.Order) =>
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
      enums.OrderSide[order.side],
      enums.OrderType[order.type],
      (order as request.OrderByBaseQuantity).quantity || '',
      (order as request.OrderByQuoteQuantity).quoteOrderQuantity || '',
      (order as request.OrderWithPrice).price || '',
      (order as request.OrderWithStopPrice).stopPrice || '',
      order.wallet,
      utils.uuidToBuffer(order.nonce),
    ],
  );

const getWithdrawalHash = (withdrawal: request.Withdrawal) =>
  (withdrawal.assetContractAddress || '').length > 0
    ? ethers.utils.solidityKeccak256(
        ['uint128', 'address', 'address', 'uint64', 'bool'],
        [
          withdrawal.nonce,
          withdrawal.wallet,
          withdrawal.assetContractAddress,
          withdrawal.quantity,
          true, // Auto-dispatch
        ],
      )
    : ethers.utils.solidityKeccak256(
        ['uint128', 'address', 'string', 'uint64', 'bool'],
        [
          withdrawal.nonce,
          withdrawal.wallet,
          withdrawal.asset,
          withdrawal.quantity,
          true, // Auto-dispatch
        ],
      );
