import http from 'http';
import https from 'https';
import qs from 'qs';
import Axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios';

import * as types from '../../types';

import * as constants from '../../constants';
import * as signatures from '../../signatures';
import { isNode, createHmacRestRequestSignatureHeader } from '../../utils';

/**
 * Authenticated API client configuration options.
 *
 * @typedef {Object} RestAuthenticatedClientOptions
 * @property {string} apiKey - Used to authenticate user
 * @property {string} apiSecret - Used to compute HMAC signature
 * @property {MultiverseChain} [multiverseChain=eth] - Which multiverse chain the client will point to
 * @property {boolean} [sandbox] - If true, client will point to API sandbox
 * @property {string} [walletPrivateKey] - If provided, used to create ECDSA signatures
 */
export interface RestAuthenticatedClientOptions {
  apiKey: string;
  apiSecret: string;
  baseURL?: string;
  multiverseChain?: keyof typeof types.MultiverseChain;
  sandbox?: boolean;
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

  private multiverseChain: keyof typeof types.MultiverseChain;

  private signer: undefined | signatures.MessageSigner = undefined;

  protected autoCreateHmacHeader = true;

  public constructor(options: RestAuthenticatedClientOptions) {
    const baseURL =
      options.baseURL ??
      (options.sandbox
        ? constants.SANDBOX_REST_API_BASE_URL
        : constants.LIVE_REST_API_BASE_URL);

    this.baseURL = baseURL;

    this.apiSecret = options.apiSecret;

    this.multiverseChain = options.multiverseChain ?? 'eth';

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
    return this.get('/user', { nonce });
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
    return this.get('/wallets', { nonce });
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
    return this.get('/balances', findBalances);
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
   * @see {@link https://docs.idex.io/#associate-wallet|Associate Wallet}
   *
   * @param {RestRequestAssociateWallet} associate
   * @param {MessageSigner} [signer] - Required if a private key was not provided in the constructor
   * @returns {Promise<RestResponseAssociateWallet>}
   */
  public async associateWallet(
    associate: types.RestRequestAssociateWallet,
    signer: undefined | signatures.MessageSigner = this.signer,
  ): Promise<types.RestResponseAssociateWallet> {
    if (!signer) {
      throw new Error(
        'A "signer" function is required but was not provided during RestAuthenticatedClient constructor or when calling the method',
      );
    }
    return this.post('/wallets', {
      parameters: associate,
      signature: await signer(
        signatures.createAssociateWalletSignature(associate),
      ),
    });
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
    signer: undefined | signatures.MessageSigner = this.signer,
  ): Promise<types.RestResponseOrder> {
    if (!signer) {
      throw new Error(
        'A "signer" function is required but was not provided during RestAuthenticatedClient constructor or when calling the method',
      );
    }

    return this.post('/orders', {
      parameters: order,
      signature: await signer(
        signatures.createOrderSignature(order, this.multiverseChain),
      ),
    });
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
    signer: undefined | signatures.MessageSigner = this.signer,
  ): Promise<types.RestResponseOrder> {
    if (!signer) {
      throw new Error(
        'A "signer" function is required but was not provided during RestAuthenticatedClient constructor or when calling the method',
      );
    }

    return this.post('/orders/test', {
      parameters: order,
      signature: await signer(
        signatures.createOrderSignature(order, this.multiverseChain),
      ),
    });
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
   * @returns {Promise<RestResponseCanceledOrder>}
   */
  public async cancelOrder(
    cancelOrder: types.RestRequestCancelOrder,
    signer: undefined | signatures.MessageSigner = this.signer,
  ): Promise<types.RestResponseCanceledOrder> {
    if (!signer) {
      throw new Error(
        'A "signer" function is required but was not provided during RestAuthenticatedClient constructor or when calling the method',
      );
    }

    return this.delete('/orders', {
      parameters: cancelOrder,
      signature: await signer(
        signatures.createCancelOrderSignature(cancelOrder),
      ),
    });
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
   * @param {RestResponseCanceledOrder} cancelOrders
   * @param {MessageSigner} [signer] - Required if a private key was not provided in the constructor
   * @returns {Promise<RestResponseCanceledOrder>}
   */
  public async cancelOrders(
    cancelOrders: types.RestRequestCancelOrders,
    signer: undefined | signatures.MessageSigner = this.signer,
  ): Promise<types.RestResponseCanceledOrder> {
    if (!signer) {
      throw new Error(
        'A "signer" function is required but was not provided during RestAuthenticatedClient constructor or when calling the method',
      );
    }

    return this.delete('/orders', {
      parameters: cancelOrders,
      signature: await signer(
        signatures.createCancelOrderSignature(cancelOrders),
      ),
    });
  }

  /**
   * Get an order
   *
   * @see https://docs.idex.io/#get-orders
   *
   * @param {RestRequestFindOrder} findOrder
   * @returns {Promise<RestResponseOrder>}
   */
  public async getOrder(
    findOrder: types.RestRequestFindOrder,
  ): Promise<types.RestResponseOrder> {
    return this.get('/orders', findOrder);
  }

  /**
   * Get multiple orders
   *
   * @see https://docs.idex.io/#get-orders
   *
   * @param {RestRequestFindOrders} findOrders
   * @returns {Promise<RestResponseOrder[]>}
   */
  public async getOrders(
    findOrders: types.RestRequestFindOrders,
  ): Promise<types.RestResponseOrder[]> {
    return this.get('/orders', findOrders);
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
    return this.get('/fills', findFill);
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
    return this.get('/fills', findFills);
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
    return this.get('/deposits', findDeposit);
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
    return this.get('/deposits', findDeposits);
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
   * @returns {Promise<RestResponseWithdrawal>}
   */
  public async withdraw(
    withdrawal: types.RestRequestWithdrawal,
    signer: undefined | signatures.MessageSigner = this.signer,
  ): Promise<types.RestResponseWithdrawal> {
    if (!signer) {
      throw new Error(
        'A "signer" function is required but was not provided during RestAuthenticatedClient constructor or when calling the method',
      );
    }
    return this.post('/withdrawals', {
      parameters: withdrawal,
      signature: await signer(signatures.createWithdrawalSignature(withdrawal)),
    });
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
    return this.get('/withdrawals', findWithdrawal);
  }

  /**
   * Get multiple withdrawals
   *
   * @see https://docs.idex.io/#get-withdrawals
   *
   * @param {RestRequestFindWithdrawals} findWithdrawals
   * @returns {Promise<RestResponseWithdrawal[]>}
   */
  public async getWithdrawals(
    findWithdrawals: types.RestRequestFindWithdrawals,
  ): Promise<types.RestResponseWithdrawal[]> {
    return this.get('/withdrawals', findWithdrawals);
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
    return (await this.get('/wsToken', { nonce, wallet })).token;
  }

  // Internal methods exposed for advanced usage

  protected async get(
    endpoint: string,
    params: Record<string, any> = {}, // eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<AxiosResponse['data']> {
    return (
      await this.request(endpoint, {
        method: 'GET',
        params,
        paramsSerializer: qs.stringify,
      })
    ).data;
  }

  protected async post(
    endpoint: string,
    data: Record<string, any> = {}, // eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<AxiosResponse['data']> {
    return (
      await this.request(endpoint, {
        method: 'POST',
        data,
      })
    ).data;
  }

  protected async delete(
    endpoint: string,
    data: Record<string, any> = {}, // eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<AxiosResponse['data']> {
    return (
      await this.request(endpoint, {
        method: 'DELETE',
        data,
      })
    ).data;
  }

  protected async put(
    endpoint: string,
    data: Record<string, any> = {}, // eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<AxiosResponse['data']> {
    return (
      await this.request(endpoint, {
        method: 'PUT',
        data,
      })
    ).data;
  }

  protected async patch(
    endpoint: string,
    data: Record<string, any> = {}, // eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<AxiosResponse['data']> {
    return (
      await this.request(endpoint, {
        method: 'PATCH',
        data,
      })
    ).data;
  }

  protected request(
    endpoint: string,
    config: Partial<AxiosRequestConfig> &
      (
        | { method: 'GET' }
        | {
            method: Exclude<AxiosRequestConfig['method'], 'GET' | 'get'>;
            data: { [key: string]: unknown };
          }
      ),
    createHmacSignatureHeader = this.autoCreateHmacHeader,
  ): Promise<AxiosResponse> {
    const request: AxiosRequestConfig = {
      headers: {},
      ...config,
      url: `${this.baseURL}${endpoint}`,
    };

    if (createHmacSignatureHeader) {
      Object.assign(
        request.headers,
        createHmacRestRequestSignatureHeader(
          config.method === 'GET'
            ? qs.stringify(config.params)
            : JSON.stringify(config.data),
          this.apiSecret,
        ),
      );
    }

    return this.axios(request);
  }
}
