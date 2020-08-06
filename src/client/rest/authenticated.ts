import crypto from 'crypto';
import http from 'http';
import https from 'https';
import qs from 'qs';
import Axios, { AxiosInstance, AxiosResponse } from 'axios';

import * as types from '../../types';

import * as constants from '../../constants';
import * as signatures from '../../signatures';
import { isNode } from '../../utils';

/**
 * Authenticated API client configuration options.
 *
 * @typedef {Object} RestAuthenticatedClientOptions
 * @property {boolean} sandbox - Must be set to true
 * @property {string} apiKey - Used to authenticate user
 * @property {string} apiSecret - Used to compute HMAC signature
 * @property {string} [privateKey] - If provided, used to create ECDSA signatures
 */
export interface RestAuthenticatedClientOptions {
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
 * import { RestAuthenticatedClient } from '@idexio/idex-sdk';
 *
 * const authenticatedClient = new RestAuthenticatedClient({
 *   sandbox: true,
 *   // Edit the values before for your environment
 *   apiKey: '1f7c4f52-4af7-4e1b-aa94-94fac8d931aa',
 *   apiSecret: 'axuh3ywgg854aq7m73oy6gnnpj5ar9a67szuw5lclbz77zqu0j',
 *   // Optionally prove a wallet private key to automatically sign requests that need an ECDSA signature
 *   walletPrivateKey: '0x3141592653589793238462643383279502884197169399375105820974944592'
 * });
 *
 * @param {RestAuthenticatedClientOptions} options
 */
export class RestAuthenticatedClient {
  public baseURL: string;

  private axios: AxiosInstance;

  private apiSecret: string;

  private signer: signatures.MessageSigner;

  public constructor(options: RestAuthenticatedClientOptions) {
    const baseURL = options.sandbox
      ? constants.SANDBOX_REST_API_BASE_URL
      : options.baseURL;
    if (!baseURL) {
      throw new Error('Must set sandbox to true');
    }

    this.baseURL = baseURL;

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
   * @returns {Promise<RestResponseUser>}
   */
  public async getUser(nonce: string): Promise<types.RestResponseUser> {
    return (await this.get('/user', { nonce })).data;
  }

  /**
   * Get account details for the API key’s user
   *
   * @see https://docs.idex.io/#get-wallets
   *
   * @param {string} nonce - UUIDv1
   * @returns {Promise<RestResponseWallet[]>}
   */
  public async getWallets(nonce: string): Promise<types.RestResponseWallet[]> {
    return (await this.get('/wallets', { nonce })).data;
  }

  /**
   * Get asset quantity data (positions) held by a wallet on the exchange
   *
   * @see https://docs.idex.io/#get-balances
   *
   * @param {RestRequestFindBalances} findBalances
   * @returns {Promise<RestResponseBalance[]>}
   */
  public async getBalances(
    findBalances: types.RestRequestFindBalances,
  ): Promise<types.RestResponseBalance[]> {
    return (await this.get('/balances', findBalances)).data;
  }

  // Wallet Association Endpoint

  /**
   * Associate a wallet with the authenticated account
   *
   * @example
   *
   * const wallet = await authenticatedClient.associateWallet(
   *   {
   *     nonce: uuidv1(),
   *     wallet: '0xA71C4aeeAabBBB8D2910F41C2ca3964b81F7310d',
   *   },
   *   idex.signatures.privateKeySigner(config.walletPrivateKey),
   * );
   *
   * @see https://docs.idex.io/#associate-wallet
   *
   * @param {RestRequestAssociateWallet} withdrawal
   * @param {MessageSigner} [signer] - Required if a private key was not provided in the constructor
   * @returns {Promise<RestResponseAssociateWallet>}
   */
  public async associateWallet(
    associate: types.RestRequestAssociateWallet,
    signer: signatures.MessageSigner = this.signer,
  ): Promise<types.RestResponseAssociateWallet> {
    return (
      await this.post('/wallets', {
        parameters: associate,
        signature: await signer(
          signatures.createAssociateWalletSignature(associate),
        ),
      })
    ).data;
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
   * @param {RestRequestOrder} order
   * @param {MessageSigner} [signer] - Required if a private key was not provided in the constructor
   * @returns {Promise<RestResponseOrder>}
   */
  public async createOrder(
    order: types.RestRequestOrder,
    signer: signatures.MessageSigner = this.signer,
  ): Promise<types.RestResponseOrder> {
    if (!signer) {
      throw new Error('No signer provided');
    }

    return (
      await this.post('/orders', {
        parameters: order,
        signature: await signer(signatures.createOrderSignature(order)),
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
   * @param {RestRequestOrder} order
   * @param {MessageSigner} [signer] - Required if a private key was not provided in the constructor
   * @returns {Promise<RestResponseOrder>}
   */
  public async createTestOrder(
    order: types.RestRequestOrder,
    signer: signatures.MessageSigner = this.signer,
  ): Promise<types.RestResponseOrder> {
    if (!signer) {
      throw new Error('No signer provided');
    }

    return (
      await this.post('/orders/test', {
        parameters: order,
        signature: await signer(signatures.createOrderSignature(order)),
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
   * @param {RestRequestCancelOrder} cancelOrder
   * @param {MessageSigner} [signer] - Required if a private key was not provided in the constructor
   * @returns {Promise<RestResponseCancelledOrder>}
   */
  public async cancelOrder(
    cancelOrder: types.RestRequestCancelOrder,
    signer: signatures.MessageSigner = this.signer,
  ): Promise<types.RestResponseCancelledOrder> {
    if (!signer) {
      throw new Error('No signer provided');
    }

    return (
      await this.delete('/orders', {
        parameters: cancelOrder,
        signature: await signer(
          signatures.createCancelOrderSignature(cancelOrder),
        ),
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
   * @param {RestResponseCancelledOrder} orders
   * @param {MessageSigner} [signer] - Required if a private key was not provided in the constructor
   * @returns {Promise<RestResponseCancelledOrder>}
   */
  public async cancelOrders(
    cancelOrders: types.RestRequestCancelOrders,
    signer: signatures.MessageSigner = this.signer,
  ): Promise<types.RestResponseCancelledOrder> {
    if (!signer) {
      throw new Error('No signer provided');
    }

    return (
      await this.delete('/orders', {
        parameters: cancelOrders,
        signature: await signer(
          signatures.createCancelOrderSignature(cancelOrders),
        ),
      })
    ).data;
  }

  /**
   * Get an order
   *
   * @see https://docs.idex.io/#get-orders
   *
   * @param {RestRequestFindOrder} findOrder
   * @return {Promise<RestResponseOrder>}
   */
  public async getOrder(
    findOrder: types.RestRequestFindOrder,
  ): Promise<types.RestResponseOrder> {
    return (await this.get('/orders', findOrder)).data;
  }

  /**
   * Get multiple orders
   *
   * @see https://docs.idex.io/#cancel-order
   *
   * @param {RestRequestFindOrders} findOrders
   * @return {Promise<RestResponseOrder[]>}
   */
  public async getOrders(
    findOrders: types.RestRequestFindOrders,
  ): Promise<types.RestResponseOrder[]> {
    return (await this.get('/orders', findOrders)).data;
  }

  /**
   * Get a fill
   *
   * @see https://docs.idex.io/#get-fills
   *
   * @param {RestRequestFindFill} findFill
   * @returns {Promise<RestResponseFill>}
   */
  public async getFill(
    findFill: types.RestRequestFindFill,
  ): Promise<types.RestResponseFill> {
    return (await this.get('/fills', findFill)).data;
  }

  /**
   * Get multiple fills
   *
   * @see https://docs.idex.io/#get-fills
   *
   * @param {RestRequestFindFills} findFills
   * @returns {Promise<RestResponseFill[]>}
   */
  public async getFills(
    findFills: types.RestRequestFindFills,
  ): Promise<types.RestResponseFill[]> {
    return (await this.get('/fills', findFills)).data;
  }

  // Deposit Endpoints

  /**
   * Get a deposit
   *
   * @see https://docs.idex.io/#get-deposits
   *
   * @param {RestRequestFindDeposit} findDeposit
   * @returns {Promise<RestResponseDeposit>}
   */
  public async getDeposit(
    findDeposit: types.RestRequestFindDeposit,
  ): Promise<types.RestResponseDeposit> {
    return (await this.get('/deposits', findDeposit)).data;
  }

  /**
   * Get multiple deposits
   *
   * @see https://docs.idex.io/#get-deposits
   *
   * @param {RestRequestFindDeposits} findDeposits
   * @returns {Promise<RestResponseDeposit[]>}
   */
  public async getDeposits(
    findDeposits: types.RestRequestFindDeposits,
  ): Promise<types.RestResponseDeposit[]> {
    return (await this.get('/deposits', findDeposits)).data;
  }

  // Withdrawal Endpoints

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
   * @param {RestRequestWithdrawal} withdrawal
   * @param {MessageSigner} [signer] - Required if a private key was not provided in the constructor
   */
  public async withdraw(
    withdrawal: types.RestRequestWithdrawal,
    signer: signatures.MessageSigner = this.signer,
  ): Promise<types.RestResponseWithdrawal> {
    return (
      await this.post('/withdrawals', {
        parameters: withdrawal,
        signature: await signer(
          signatures.createWithdrawalSignature(withdrawal),
        ),
      })
    ).data;
  }

  /**
   * Get a withdrawal
   *
   * @see https://docs.idex.io/#get-withdrawals
   *
   * @param {RestRequestFindWithdrawal} findWithdrawal
   * @returns {Promise<RestResponseWithdrawal>}
   */
  public async getWithdrawal(
    findWithdrawal: types.RestRequestFindWithdrawal,
  ): Promise<types.RestResponseWithdrawal> {
    return (await this.get('/withdrawals', findWithdrawal)).data;
  }

  /**
   * Get multiple withdrawals
   *
   * @see https://docs.idex.io/#get-withdrawals
   *
   * @param {RestRequestFindWithdrawals} findWithdrawals
   * @return {Promise<RestResponseWithdrawal[]>}
   */
  public async getWithdrawals(
    findWithdrawals: types.RestRequestFindWithdrawals,
  ): Promise<types.RestResponseWithdrawal[]> {
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
    RestRequestParams: Record<string, any> = {}, // eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<AxiosResponse> {
    return this.axios({
      method: 'GET',
      url: `${this.baseURL}${endpoint}`,
      headers: this.createHmacRestRequestSignatureHeader(
        // The param serializer for HMAC must be the same as that used for the request itself
        qs.stringify(RestRequestParams),
      ),
      params: RestRequestParams,
      paramsSerializer: qs.stringify,
    });
  }

  protected async post(
    endpoint: string,
    RestRequestParams: Record<string, any> = {}, // eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<AxiosResponse> {
    return this.axios({
      method: 'POST',
      url: `${this.baseURL}${endpoint}`,
      headers: this.createHmacRestRequestSignatureHeader(
        JSON.stringify(RestRequestParams),
      ),
      data: RestRequestParams,
    });
  }

  protected async delete(
    endpoint: string,
    RestRequestParams: types.RestRequestCancelOrdersBody, // eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<AxiosResponse> {
    return this.axios({
      method: 'DELETE',
      url: `${this.baseURL}${endpoint}`,
      headers: this.createHmacRestRequestSignatureHeader(
        JSON.stringify(RestRequestParams),
      ),
      data: RestRequestParams,
    });
  }

  protected createHmacRestRequestSignatureHeader(
    payload: string,
  ): { [constants.REST_HMAC_SIGNATURE_HEADER]: string } {
    const hmacRestRequestSignature = crypto
      .createHmac('sha256', this.apiSecret)
      .update(payload)
      .digest('hex');

    return { [constants.REST_HMAC_SIGNATURE_HEADER]: hmacRestRequestSignature };
  }
}
