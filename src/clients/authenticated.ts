import Axios, { AxiosInstance, AxiosResponse } from 'axios';
import Base64 from 'crypto-js/enc-base64';
import hmacSHA512 from 'crypto-js/hmac-sha512';
import queryString from 'query-string';
import sha256 from 'crypto-js/sha256';
import { ethers } from 'ethers';

import { request, response } from '../types';

/**
 * Authenticated API client
 *
 * ```typescript
 * import * as idex from '@idexio/idex-node';
 *
 * // Edit the values below for your environment
 * const config = {
 *   baseURL: 'https://api-sandbox.idex.io/api/v1',
 *   apiKey:
 *     'MTQxMA==.MQ==.TlRnM01qSmtPVEF0TmpJNFpDMHhNV1ZoTFRrMU5HVXROMlJrTWpRMVpEUmlNRFU0',
 *   apiSecret: 'axuh3ywgg854aq7m73oy6gnnpj5ar9a67szuw5lclbz77zqu0j',
 *   walletPrivateKey:
 *     '0x3141592653589793238462643383279502884197169399375105820974944592',
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
    this.axios = Axios.create({
      headers: { Authorization: `Bearer ${apiKey}` },
    });
  }

  /**
   * Cancel an order
   *
   * @param {request.CancelOrder} order
   */
  public async cancelOrder(order: request.FindOrder): Promise<response.Order> {
    return (await this.delete('/orders', order)).data;
  }

  /**
   * Cancel multiple orders
   *
   * @param {request.CancelOrder} order
   */
  public async cancelOrders(
    orders: request.FindOrders,
  ): Promise<response.Order[]> {
    return (await this.delete('/orders', orders)).data;
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
   * Obtain a datastream API token
   *
   * @param {string} nonce - UUIDv1
   * @param {string} wallet - Ethereum wallet address
   */
  public async getDatastreamToken(
    nonce: string,
    wallet: string,
  ): Promise<string> {
    return (await this.get('/datastream', { nonce, wallet })).data.token;
  }

  /**
   * Get order fill history for a wallet
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
   * Get a deposit
   *
   * @param {request.FindDeposit} findDeposit
   * @return {Promise<response.Deposit>}
   */
  public async getDeposit(
    findDeposit: request.FindDeposit,
  ): Promise<response.Deposit> {
    return (await this.get('/deposits', findDeposit)).data[0];
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
   * Get an order
   *
   * @param {request.FindOrder} findOrder
   * @return {Promise<response.Order>}
   */
  public async getOrder(findOrder: request.FindOrder): Promise<response.Order> {
    return (await this.get('/orders', findOrder)).data[0];
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
   * Get multiple orders including inactive ones
   *
   * @param {request.FindOrders} findOrders
   * @return {Promise<response.Order[]>}
   */
  public async getOrdersIncludingInactive(
    findOrders: request.FindOrdersIncludingInactive,
  ): Promise<response.Order[]> {
    return (
      await this.get('/orders', {
        ...findOrders,
        includeInactiveOrders: true,
      })
    ).data;
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
    return (await this.get('/withdrawals', findWithdrawal)).data[0];
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
   * @param {request.Order} order
   * @param {string} walletPrivateKey
   */
  public async placeOrder(
    order: request.Order,
    walletPrivateKey: string,
  ): Promise<response.Order> {
    return (
      await this.post('/orders', {
        parameters: order,
        signature: await new ethers.Wallet(walletPrivateKey).signMessage(
          ethers.utils.arrayify(request.getOrderHash(order)),
        ),
      })
    ).data;
  }

  /**
   * Test new order creation, validation, and trading engine acceptance, but no order is placed or executed
   *
   * @param {request.Order} order
   * @param {string} walletPrivateKey
   */
  public async placeTestOrder(
    order: request.Order,
    walletPrivateKey: string,
  ): Promise<response.Order> {
    return (
      await this.post('/orders/test', {
        parameters: order,
        signature: await new ethers.Wallet(walletPrivateKey).signMessage(
          ethers.utils.arrayify(request.getOrderHash(order)),
        ),
      })
    ).data;
  }

  /**
   * Create a new withdrawal
   *
   * @param {request.Withdrawal} withdrawal
   * @param {string} walletPrivateKey
   */
  public async withdraw(
    withdrawal: request.Withdrawal,
    walletPrivateKey: string,
  ): Promise<response.Withdrawal> {
    return (
      await this.post('/withdrawals', {
        parameters: withdrawal,
        signature: await new ethers.Wallet(walletPrivateKey).signMessage(
          ethers.utils.arrayify(request.getWithdrawalHash(withdrawal)),
        ),
      })
    ).data;
  }

  private async get(
    endpoint: string,
    requestParams: Record<string, any> = {},
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
