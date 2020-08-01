import crypto from 'crypto';
import Axios, { AxiosInstance, AxiosResponse } from 'axios';
import http from 'http';
import https from 'https';
import queryString from 'query-string';

import * as eth from '../eth';
import { isNode } from '../utils';
import { request, response } from '../types';

/**
 * Authenticated API client
 *
 * ```typescript
 * import * as idex from '@idexio/idex-node';
 *
 * // Edit the values below for your environment
 * const config = {
 *   baseURL: 'https://api-sandbox.idex.io/v1',
 *   apiKey:
 *     'MTQxMA==.MQ==.TlRnM01qSmtPVEF0TmpJNFpDMHhNV1ZoTFRrMU5HVXROMlJrTWpRMVpEUmlNRFU0',
 *   apiSecret: 'axuh3ywgg854aq7m73oy6gnnpj5ar9a67szuw5lclbz77zqu0j',
 *   walletPrivateKey: '0x3141592653589793238462643383279502884197169399375105820974944592'
 * };
 *
 * const authenticatedClient = new idex.AuthenticatedClient(
 *   config.baseURL,
 *   config.apiKey,
 *   config.apiSecret,
 * );
 * ```
 */

export default class AuthenticatedClient {
  public baseURL: string;

  private axios: AxiosInstance;

  private apiSecret: string;

  public constructor(baseURL: string, apiKey: string, apiSecret: string) {
    this.baseURL = baseURL;
    this.apiSecret = apiSecret;

    this.axios = isNode
      ? Axios.create({
          headers: { Authorization: `Bearer ${apiKey}` },
          httpAgent: new http.Agent({ keepAlive: true }),
          httpsAgent: new https.Agent({ keepAlive: true }),
        })
      : Axios.create({
          headers: { Authorization: `Bearer ${apiKey}` },
        });
  }

  /**
   * Cancel a single order
   *
   * @param {string} order
   */
  public async cancelOrder(
    cancelOrder: request.CancelOrder,
    sign: (hash: string) => Promise<string>,
  ): Promise<response.Order> {
    return (
      await this.delete('/orders', {
        parameters: cancelOrder,
        signature: await sign(eth.getCancelOrderHash(cancelOrder)),
      })
    ).data;
  }

  /**
   * Cancel multiple orders
   *
   * @param {string} order
   */
  public async cancelOrders(
    cancelOrders: request.CancelOrders,
    sign: (hash: string) => Promise<string>,
  ): Promise<response.Order[]> {
    return (
      await this.delete('/orders', {
        parameters: cancelOrders,
        signature: await sign(eth.getCancelOrderHash(cancelOrders)),
      })
    ).data;
  }

  /**
   * Get asset quantity data (positions) held by a wallet on the exchange
   *
   * @param {string} nonce - UUIDv1
   * @param {string} wallet - Ethereum wallet address
   */
  public async getBalances(
    nonce: string,
    wallet: string,
    asset?: string,
  ): Promise<response.Balance | response.Balance[]> {
    return (await this.get('/balances', { nonce, wallet, asset })).data;
  }

  /**
   * Get a deposit
   *
   * @param {request.FindDeposit} findDeposit
   * @return {Promise<response.Deposit>}
   */
  public async getDeposit(
    findDeposit: request.FindDeposit,
  ): Promise<response.Deposit> {
    return (await this.get('/deposits', findDeposit)).data;
  }

  /**
   * Get multiple deposits
   *
   * @param {request.FindDeposits} findDeposits
   * @return {Promise<response.Deposit[]>}
   */
  public async getDeposits(
    findDeposits: request.FindDeposits,
  ): Promise<response.Deposit[]> {
    return (await this.get('/deposits', findDeposits)).data;
  }

  /**
   * Get a fill
   *
   * @param {request.FindFill} findFill
   * @return {Promise<response.Fill>}
   */
  public async getFill(findFill: request.FindFill): Promise<response.Fill> {
    return (await this.get('/fills', findFill)).data;
  }

  /**
   * Get multiple fills
   *
   * @param {request.FindFills} findFills
   * @return {Promise<response.Fill[]>}
   */
  public async getFills(
    findFills: request.FindFills,
  ): Promise<response.Fill[]> {
    return (await this.get('/fills', findFills)).data;
  }

  /**
   * Get an order
   *
   * @param {request.FindOrder} findOrder
   * @return {Promise<response.Order>}
   */
  public async getOrder(findOrder: request.FindOrder): Promise<response.Order> {
    return (await this.get('/orders', findOrder)).data;
  }

  /**
   * Get multiple orders
   *
   * @param {request.FindOrders} findOrders
   * @return {Promise<response.Order[]>}
   */
  public async getOrders(
    findOrders: request.FindOrders,
  ): Promise<response.Order[]> {
    return (await this.get('/orders', findOrders)).data;
  }

  /**
   * Get account details for the API key’s user
   *
   * @param {string} nonce - UUIDv1
   */
  public async getUser(nonce: string): Promise<response.User> {
    return (await this.get('/user', { nonce })).data;
  }

  /**
   * Get account details for the API key’s user
   *
   * @param {string} nonce - UUIDv1
   */
  public async getWallets(nonce: string): Promise<response.Wallet[]> {
    return (await this.get('/wallets', { nonce })).data;
  }

  /**
   * Get a withdrawal
   *
   * @param {request.FindWithdrawal} findWithdrawal
   * @return {Promise<response.Withdrawal>}
   */
  public async getWithdrawal(
    findWithdrawal: request.FindWithdrawal,
  ): Promise<response.Withdrawal> {
    return (await this.get('/withdrawals', findWithdrawal)).data;
  }

  /**
   * Get multiple withdrawals
   *
   * @param {request.FindWithdrawals} findWithdrawals
   * @return {Promise<response.Withdrawal[]>}
   */
  public async getWithdrawals(
    findWithdrawals: request.FindWithdrawals,
  ): Promise<response.Withdrawal[]> {
    return (await this.get('/withdrawals', findWithdrawals)).data;
  }

  /**
   * Place a new order
   *
   * Example:
   *
   * ```typescript
   *  await authenticatedClient.placeOrder(
   *   orderObject, // See type
   *   sign: idex.getPrivateKeySigner(config.walletPrivateKey),
   * );
   * ```
   *
   * @param {request.Order} order
   * @param {function} sign Sign hash function implementation. Possbile to use built-in `getPrivateKeySigner('YourPrivateKey')`
   */
  public async placeOrder(
    order: request.Order,
    sign: (hash: string) => Promise<string>,
  ): Promise<response.Order> {
    return (
      await this.post('/orders', {
        parameters: order,
        signature: await sign(eth.getOrderHash(order)),
      })
    ).data;
  }

  /**
   * Test new order creation, validation, and trading engine acceptance, but no order is placed or executed
   *
   * Example:
   *
   * ```typescript
   *  await authenticatedClient.placeTestOrder(
   *   orderObject, // See type
   *   sign: idex.getPrivateKeySigner(config.walletPrivateKey),
   * );
   * ```
   *
   * @param {request.Order} order
   * @param {function} sign Sign hash function implementation. Possbile to use built-in  `getPrivateKeySigner('YourPrivateKey')`
   */
  public async placeTestOrder(
    order: request.Order,
    sign: (hash: string) => Promise<string>,
  ): Promise<response.Order> {
    return (
      await this.post('/orders/test', {
        parameters: order,
        signature: await sign(eth.getOrderHash(order)),
      })
    ).data;
  }

  /**
   * Create a new withdrawal
   *
   * Example:
   *
   * ```typescript
   *  await authenticatedClient.withdraw(
   *   withdrawalObject, // See type
   *   sign: idex.getPrivateKeySigner(config.walletPrivateKey),
   * );
   *
   * @param {request.Withdrawal} withdrawal
   * @param {function} sign Sign hash function implementation. Possbile to use built-in `getPrivateKeySigner('YourPrivateKey')`
   */
  public async withdraw(
    withdrawal: request.Withdrawal,
    sign: (hash: string) => Promise<string>,
  ): Promise<response.Withdrawal> {
    return (
      await this.post('/withdrawals', {
        parameters: withdrawal,
        signature: await sign(eth.getWithdrawalHash(withdrawal)),
      })
    ).data;
  }

  /**
   * Obtain a WebSocket API token
   *
   * @param {string} nonce - UUIDv1
   * @param {string} wallet - Ethereum wallet address
   */
  public async getWsToken(nonce: string, wallet: string): Promise<string> {
    return (await this.get('/wsToken', { nonce, wallet })).data.token;
  }

  // Internal methods exposed for advanced usage

  protected async get(
    endpoint: string,
    requestParams: Record<string, any> = {}, // eslint-disable-line @typescript-eslint/no-explicit-any
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

  protected async post(
    endpoint: string,
    requestParams: Record<string, any> = {}, // eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<AxiosResponse> {
    return this.axios({
      method: 'POST',
      url: `${this.baseURL}${endpoint}`,
      headers: this.createHmacRequestSignatureHeader(requestParams),
      data: requestParams,
    });
  }

  protected async delete(
    endpoint: string,
    requestParams: Record<string, any>, // eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<AxiosResponse> {
    return this.axios({
      method: 'DELETE',
      url: `${this.baseURL}${endpoint}`,
      headers: this.createHmacRequestSignatureHeader(requestParams),
      data: requestParams,
    });
  }

  protected createHmacRequestSignatureHeader(
    payload: string | Record<string, unknown>,
  ): { 'hmac-request-signature': string } {
    const hmacRequestSignature = crypto
      .createHmac('sha256', this.apiSecret)
      .update(typeof payload === 'string' ? payload : JSON.stringify(payload))
      .digest('hex');

    return { 'hmac-request-signature': hmacRequestSignature };
  }
}
