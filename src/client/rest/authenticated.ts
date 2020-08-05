import crypto from 'crypto';
import http from 'http';
import https from 'https';
import qs from 'qs';
import Axios, { AxiosInstance, AxiosResponse } from 'axios';

import * as constants from '../../constants';
import * as request from '../../types/rest/request';
import * as response from '../../types/rest/response';
import * as signatures from '../../signatures';
import { isNode } from '../../utils';

/**
 * Authenticated API client options
 *
 * @typedef {Object} AuthenticatedRESTClientOptions
 * @property {boolean} sandbox - Must be set to true
 * @property {string} apiKey - Used to authenticate user
 * @property {string} apiSecret - Used to compute HMAC signature
 * @property {string} [privateKey] - If provided, used to create ECDSA signatures
 */
export interface AuthenticatedRESTClientOptions {
  sandbox?: boolean;
  baseURL?: string;
  apiKey: string;
  apiSecret: string;
  walletPrivateKey?: string;
}

/**
 * Authenticated API client
 *
 * @example
 * import { v1 as uuidv1 } from 'uuid';
 * import * as idex from '@idexio/idex-sdk-js';
 *
 * const authenticatedClient = new idex.client.rest.Authenticated({
 *   sandbox: true,
 *   // Edit the values before for your environment
 *   apiKey: '1f7c4f52-4af7-4e1b-aa94-94fac8d931aa',
 *   apiSecret: 'axuh3ywgg854aq7m73oy6gnnpj5ar9a67szuw5lclbz77zqu0j',
 *   // Optionally prove a wallet private key to automatically sign requests that need an ECDSA signature
 *   walletPrivateKey: '0x3141592653589793238462643383279502884197169399375105820974944592'
 * });
 *
 * @param {AuthenticatedRESTClientOptions} options
 */
export default class AuthenticatedRESTClient {
  public baseURL: string;

  private axios: AxiosInstance;

  private apiSecret: string;

  private signer: signatures.MessageSigner;

  public constructor(options: AuthenticatedRESTClientOptions) {
    this.baseURL = options.sandbox
      ? constants.SANDBOX_REST_API_BASE_URL
      : options.baseURL;
    if (!this.baseURL) {
      throw new Error('Must set sandbox to true');
    }

    this.apiSecret = options.apiSecret;

    if (options.walletPrivateKey) {
      this.signer = signatures.privateKeySigner(options.walletPrivateKey);
    }

    this.axios = isNode
      ? Axios.create({
          headers: {
            [constants.REST_API_KEY_HEADER]: options.apiKey,
          },
          httpAgent: new http.Agent({ keepAlive: true }),
          httpsAgent: new https.Agent({ keepAlive: true }),
        })
      : Axios.create({
          headers: { [constants.REST_API_KEY_HEADER]: options.apiKey },
        });
  }

  // User Data Endpoints

  /**
   * Get account details for the API key’s user
   *
   * @see https://docs.idex.io/#get-user-account
   *
   * @param {string} nonce - UUIDv1
   */
  public async getUser(nonce: string): Promise<response.User> {
    return (await this.get('/user', { nonce })).data;
  }

  /**
   * Get account details for the API key’s user
   *
   * @see https://docs.idex.io/#get-wallets
   *
   * @param {string} nonce - UUIDv1
   */
  public async getWallets(nonce: string): Promise<response.Wallet[]> {
    return (await this.get('/wallets', { nonce })).data;
  }

  /**
   * Get asset quantity data (positions) held by a wallet on the exchange
   *
   * @see https://docs.idex.io/#get-balances
   *
   * @param {request.FindBalances} findBalances
   */
  public async getBalances(
    findBalances: request.FindBalances,
  ): Promise<response.Balance[]> {
    return (await this.get('/balances', findBalances)).data;
  }

  // Orders & Trade Endpoints

  /**
   * Create and submit an order to the matching engine.
   *
   * @example
   * const order = await authenticatedClient.createOrder(
   *   {
   *     nonce: uuidv1(),
   *     wallet: '0xA71C4aeeAabBBB8D2910F41C2ca3964b81F7310d',
   *     market: 'IDEX-ETH',
   *     type: 'limit',
   *     side: 'sell',
   *     price: '0.10000000',
   *     quantity: '1.50000000",
   *   },
   *   idex.signatures.privateKeySigner(config.walletPrivateKey),
   * );
   *
   * @see https://docs.idex.io/#create-order
   *
   * @param {request.Order} order
   * @param {signatures.MessageSigner} [signer] - Required if a private key was not provided in the constructor
   */
  public async createOrder(
    order: request.Order,
    signer: signatures.MessageSigner = this.signer,
  ): Promise<response.Order> {
    if (!signer) {
      throw new Error('No signer provided');
    }

    return (
      await this.post('/orders', {
        parameters: order,
        signature: await signer(signatures.orderHash(order)),
      })
    ).data;
  }

  /**
   * Tests order creation and validation without submitting an order to the matching engine
   *
   * @example
   * const order = await authenticatedClient.createTestOrder(
   *   {
   *     nonce: uuidv1(),
   *     wallet: '0xA71C4aeeAabBBB8D2910F41C2ca3964b81F7310d',
   *     market: 'IDEX-ETH',
   *     type: 'limit',
   *     side: 'sell',
   *     price: '0.10000000',
   *     quantity: '1.50000000",
   *   },
   *   idex.signatures.privateKeySigner(config.walletPrivateKey),
   * );
   *
   * @see https://docs.idex.io/#test-create-order
   *
   * @param {request.Order} order
   * @param {signatures.MessageSigner} [signer] - Required if a private key was not provided in the constructor
   */
  public async createTestOrder(
    order: request.Order,
    signer: signatures.MessageSigner = this.signer,
  ): Promise<response.Order> {
    if (!signer) {
      throw new Error('No signer provided');
    }

    return (
      await this.post('/orders/test', {
        parameters: order,
        signature: await signer(signatures.orderHash(order)),
      })
    ).data;
  }

  /**
   * Cancel a single order
   *
   * @example
   * const responseByOrderId = await authenticatedClient.cancelOrder(
   *   {
   *     nonce: uuidv1(),
   *     wallet: '0xA71C4aeeAabBBB8D2910F41C2ca3964b81F7310d',
   *     orderId: 'f077a010-ce18-11ea-9557-a9d3f954788d',
   *   },
   *   idex.signatures.privateKeySigner(config.walletPrivateKey),
   * );
   *
   * const clientOrderId = '0001_23234_18863_IDEX_ETH';
   * const responseByClientId = await authenticatedClient.cancelOrder(
   *   {
   *     nonce: uuidv1(),
   *     wallet: '0xA71C4aeeAabBBB8D2910F41C2ca3964b81F7310d',
   *     orderId: `client:${clientOrderId}`,
   *   },
   *   idex.signatures.privateKeySigner(config.walletPrivateKey),
   * );
   *
   * @see https://docs.idex.io/#cancel-order
   *
   * @param {string} cancelOrder
   * @param {signatures.MessageSigner} [signer] - Required if a private key was not provided in the constructor
   */
  public async cancelOrder(
    cancelOrder: request.CancelOrder,
    signer: signatures.MessageSigner = this.signer,
  ): Promise<response.Order> {
    if (!signer) {
      throw new Error('No signer provided');
    }

    return (
      await this.delete('/orders', {
        parameters: cancelOrder,
        signature: await signer(signatures.cancelOrderHash(cancelOrder)),
      })
    ).data;
  }

  /**
   * Cancel multiple orders
   *
   * @example
   * const allOrders = authenticatedClient.cancelOrders(
   *   {
   *     nonce: uuidv1(),
   *     wallet: '0xA71C4aeeAabBBB8D2910F41C2ca3964b81F7310d',
   *   },
   *   idex.signatures.privateKeySigner(config.walletPrivateKey),
   * );
   *
   * const ordersForMarket = authenticatedClient.cancelOrders(
   *   {
   *     nonce: uuidv1(),
   *     wallet: '0xA71C4aeeAabBBB8D2910F41C2ca3964b81F7310d',
   *     market: 'IDEX-ETH'
   *   },
   *   idex.signatures.privateKeySigner(config.walletPrivateKey),
   * );
   *
   * @see https://docs.idex.io/#cancel-order
   *
   * @param {string} order
   * @param {signatures.MessageSigner} [signer] - Required if a private key was not provided in the constructor
   */
  public async cancelOrders(
    cancelOrders: request.CancelOrders,
    signer: signatures.MessageSigner = this.signer,
  ): Promise<response.Order[]> {
    if (!signer) {
      throw new Error('No signer provided');
    }

    return (
      await this.delete('/orders', {
        parameters: cancelOrders,
        signature: await signer(signatures.cancelOrderHash(cancelOrders)),
      })
    ).data;
  }

  /**
   * Get an order
   *
   * @see https://docs.idex.io/#get-orders
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
   * @see https://docs.idex.io/#cancel-order
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
   * Get a fill
   *
   * @see https://docs.idex.io/#get-fills
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
   * @see https://docs.idex.io/#get-fills
   *
   * @param {request.FindFills} findFills
   * @return {Promise<response.Fill[]>}
   */
  public async getFills(
    findFills: request.FindFills,
  ): Promise<response.Fill[]> {
    return (await this.get('/fills', findFills)).data;
  }

  // Deposit Endpoints

  /**
   * Get a deposit
   *
   * @see https://docs.idex.io/#get-deposits
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
   * @see https://docs.idex.io/#get-deposits
   *
   * @param {request.FindDeposits} findDeposits
   * @return {Promise<response.Deposit[]>}
   */
  public async getDeposits(
    findDeposits: request.FindDeposits,
  ): Promise<response.Deposit[]> {
    return (await this.get('/deposits', findDeposits)).data;
  }

  // Withdrawal Endpoints
  /**
   * Get a withdrawal
   *
   * @see https://docs.idex.io/#get-withdrawals
   *
   * @param {request.FindWithdrawal} findWithdrawal
   * @return {Promise<response.Withdrawal>}
   */

  /**
   * Create a new withdrawal
   *
   * @example
   *
   * const withdrawal = await authenticatedClient.withdraw(
   *   {
   *     nonce: uuidv1(),
   *     wallet: '0xA71C4aeeAabBBB8D2910F41C2ca3964b81F7310d',
   *     asset: 'ETH',
   *     quantity: '0.04000000',
   *   },
   *   idex.signatures.privateKeySigner(config.walletPrivateKey),
   * );
   *
   * @see https://docs.idex.io/#withdraw-funds
   *
   * @param {request.Withdrawal} withdrawal
   * @param {signatures.MessageSigner} [signer] - Required if a private key was not provided in the constructor
   */
  public async withdraw(
    withdrawal: request.Withdrawal,
    signer: signatures.MessageSigner = this.signer,
  ): Promise<response.Withdrawal> {
    return (
      await this.post('/withdrawals', {
        parameters: withdrawal,
        signature: await signer(signatures.withdrawalHash(withdrawal)),
      })
    ).data;
  }

  public async getWithdrawal(
    findWithdrawal: request.FindWithdrawal,
  ): Promise<response.Withdrawal> {
    return (await this.get('/withdrawals', findWithdrawal)).data;
  }

  /**
   * Get multiple withdrawals
   *
   * @see https://docs.idex.io/#get-withdrawals
   *
   * @param {request.FindWithdrawals} findWithdrawals
   * @return {Promise<response.Withdrawal[]>}
   */
  public async getWithdrawals(
    findWithdrawals: request.FindWithdrawals,
  ): Promise<response.Withdrawal[]> {
    return (await this.get('/withdrawals', findWithdrawals)).data;
  }

  // WebSocket Authentication Endpoints

  /**
   * Obtain a WebSocket API token
   *
   * @see https://docs.idex.io/#get-authentication-token
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
        // The query serializer for HMAC must be the same as that used to send the request so the
        // signature can deterministically be computed on the other side
        qs.stringify(requestParams),
      ),
      params: requestParams,
      paramsSerializer: qs.stringify,
    });
  }

  protected async post(
    endpoint: string,
    requestParams: Record<string, any> = {}, // eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<AxiosResponse> {
    return this.axios({
      method: 'POST',
      url: `${this.baseURL}${endpoint}`,
      headers: this.createHmacRequestSignatureHeader(
        JSON.stringify(requestParams),
      ),
      data: requestParams,
    });
  }

  protected async delete(
    endpoint: string,
    requestParams: request.CancelOrdersBody, // eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<AxiosResponse> {
    return this.axios({
      method: 'DELETE',
      url: `${this.baseURL}${endpoint}`,
      headers: this.createHmacRequestSignatureHeader(
        qs.stringify(requestParams),
      ),
      params: requestParams,
      // The query serializer for HMAC must be the same as that used to send the request so the
      // signature can deterministically be computed on the other side
      paramsSerializer: qs.stringify,
    });
  }

  protected createHmacRequestSignatureHeader(
    payload: string,
  ): { [constants.REST_HMAC_SIGNATURE_HEADER]: string } {
    const hmacRequestSignature = crypto
      .createHmac('sha256', this.apiSecret)
      .update(payload)
      .digest('hex');

    return { [constants.REST_HMAC_SIGNATURE_HEADER]: hmacRequestSignature };
  }
}
