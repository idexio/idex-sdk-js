/* eslint-disable lines-between-class-members */
import * as http from 'http';
import * as https from 'https';

import Axios from 'axios';
import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';

import { REST_API_KEY_HEADER } from '#constants';
import {
  createPrivateKeyTypedDataSigner,
  getOrderCancellationSignatureTypedData,
  getOrderSignatureTypedData,
  getWalletAssociationSignatureTypedData,
  getWithdrawalSignatureTypedData,
  getLeverageSettingsSignatureTypedData,
} from '#signatures';
import {
  deriveBaseURL,
  isNode,
  createHmacRestRequestSignatureHeader,
  INTERNAL_SYMBOL,
  sanitizeSearchParams,
} from '#utils';

import { getEncodedWithdrawalPayloadForBridgeTarget } from '#bridge/bridge';
import { RestPublicClient } from '#client/rest/public';
import { BridgeTarget } from '#types/enums/request';

import type * as idex from '#index';
import type { AnyObj, Paginated } from '#types/utils';
import type {
  AxiosInstance,
  AxiosRequestConfig,
  CreateAxiosDefaults,
} from 'axios';

/**
 * Authenticated API client configuration options.
 *
 * @example
 * ```typescript
 * import { RestAuthenticatedClient } from '@idexio/idex-sdk';
 *
 * // Edit the values before for your environment
 * const authenticatedClient = new RestAuthenticatedClient({
 *   sandbox: false,
 *   apiKey: '1f7c4f52-4af7-4e1b-aa94-94fac8d931aa',
 *   apiSecret: 'axuh3ywgg854aq7m73oy6gnnpj5ar9a67szuw5lclbz77zqu0j',
 *   walletPrivateKey: '0x...'
 * });
 * ```
 *
 * <br />
 *
 * ---
 *
 * @see typedoc  [Reference Documentation](https://sdk-js-docs-v4.idex.io/interfaces/RestAuthenticatedClientOptions.html)
 * @see client   {@link RestAuthenticatedClient}
 *
 * @category API Clients
 */
export interface RestAuthenticatedClientOptions {
  /**
   * - Used to authenticate the requesting user making requests to the API.
   */
  apiKey: string;
  /**
   * - Used to compute HMAC signature for authenticated requests
   */
  apiSecret: string;
  /**
   * The private key for the wallet making requests to the API.
   *
   * **Note:** This should always be provided except in advanced use case scenarios.
   *
   * - When **provided**, used to create ECDSA signatures for authenticated requests automatically.
   * - When **not provided**, must provider your own {@link idex.SignTypedData signer} to sign requests
   *   that require an ECDSA signature.
   */
  walletPrivateKey?: string;

  /**
   * - If `true`, the client will point to [IDEX Sandbox API](https;//api-docs-v4.idex.io/#sandbox)
   * - If not provided or `false`, will point to the IDEX Production API.
   *
   * @defaultValue false
   */
  sandbox?: boolean;

  /* Note that most items below are optional and rarely required for users. */

  /**
   * - Optionally provide a custom baseURL to use instead of the automatically
   *   derived value based on the {@link sandbox} option.
   *
   * @internal
   */
  baseURL?: string;
  /**
   * **Optionally** provide the `exchangeContractAddress` as returned by the public clients
   * {@link RestPublicClient.getExchange getExchange} response's
   * {@link idex.IDEXExchange.exchangeContractAddress exchangeContractAddress} property.
   *
   * - If not provided, this will be fetched and cached automatically from the public client before
   *   making the first request which requires it.
   *
   * @internal
   */
  exchangeContractAddress?: string;
  /**
   * Optionally provide the `chainId` as returned by the public clients
   * {@link RestPublicClient.getExchange getExchange} response's
   * {@link idex.IDEXExchange.chainId chainId} property.
   *
   * - If not provided, this will be fetched and cached automatically from the public client before
   *   making the first request which requires it.
   *
   * @internal
   */
  chainId?: number;
  /**
   * Optionally provide the `stargateBridgeAdapterContractAddress` as returned by the public clients
   * {@link RestPublicClient.getExchange getExchange} response's
   * {@link idex.IDEXExchange.stargateBridgeAdapterContractAddress stargateBridgeAdapterContractAddress}
   * property.
   *
   * - If not provided, this will be fetched and cached automatically from the public client before
   *   making the first request which requires it.
   *
   * @internal
   */
  stargateBridgeAdapterContractAddress?: string;
  /**
   * - Changing this value will likely result in a broken client, internal use only.
   *
   * @defaultValue true
   * @internal
   */
  autoCreateHmacHeader?: boolean;
  /**
   * - This is for internal use only and may not work as expected if used.
   *
   * @internal
   */
  axiosConfig?: CreateAxiosDefaults;
}

/**
 * The {@link RestAuthenticatedClient} is used to make authenticated requests to the IDEX API.  It includes
 * methods that make requests on behalf of a specific wallet such as creating and cancelling orders.
 *
 * - The client requires the following properties to automatically handle authentication
 *   of requests:
 *   - {@link RestAuthenticatedClientOptions.apiKey apiKey}
 *   - {@link RestAuthenticatedClientOptions.apiSecret apiSecret}
 *   - {@link RestAuthenticatedClientOptions.walletPrivateKey walletPrivateKey}
 * - Optionally, a {@link RestAuthenticatedClientOptions.sandbox sandbox} option can
 *   be set to `true` in order to point to the IDEX Sandbox API.
 *
 * @example
 * ```typescript
 * import { RestAuthenticatedClient } from '@idexio/idex-sdk';
 *
 * // Edit the values before for your environment
 * const authenticatedClient = new RestAuthenticatedClient({
 *   sandbox: false,
 *   apiKey: '1f7c4f52-4af7-4e1b-aa94-94fac8d931aa',
 *   apiSecret: 'axuh3ywgg854aq7m73oy6gnnpj5ar9a67szuw5lclbz77zqu0j',
 *   walletPrivateKey: '0x...'
 * });
 * ```
 *
 * <br />
 *
 * ---
 *
 * @see typedoc  [Reference Documentation](https://sdk-js-docs-v4.idex.io/classes/RestAuthenticatedClient.html)
 * @see options  {@link RestAuthenticatedClientOptions}
 *
 * @category API Clients
 * @category IDEX - Get Market Maker Rewards Epochs
 * @category IDEX - Get Wallets
 * @category IDEX - Get Positions
 * @category IDEX - Associate Wallet
 * @category IDEX - Create Order
 * @category IDEX - Cancel Order
 * @category IDEX - Get Orders
 * @category IDEX - Get Fills
 * @category IDEX - Get Payouts
 * @category IDEX - Authorize Payout
 * @category IDEX - Get Deposits
 * @category IDEX - Get Withdrawals
 * @category IDEX - Withdraw Funds
 * @category IDEX - Get Funding Payments
 * @category IDEX - Get Historical PnL
 * @category IDEX - Get WebSocket Token
 */
export class RestAuthenticatedClient {
  /**
   * When creating an authenticated client, a {@link idex.RestPublicClient RestPublicClient} is automatically
   * created and can be used based on the config given for this client.
   *
   * - Can be utilized to fetch public data instead of creating both clients.
   * - Used when fetching the {@link idex.IDEXExchange.exchangeContractAddress exchangeContractAddress}
   *   and {@link idex.IDEXExchange.chainId chainId} properties from the public client's
   *   {@link RestPublicClient.getExchange getExchange} method.
   *
   * @example
   * ```typescript
   * import { RestAuthenticatedClient } from '@idexio/idex-sdk';
   *
   * // Edit the values before for your environment
   * const client = new RestAuthenticatedClient({
   *   sandbox: true,
   *   apiKey: '1f7c4f52-4af7-4e1b-aa94-94fac8d931aa',
   *   apiSecret: 'axuh3ywgg854aq7m73oy6gnnpj5ar9a67szuw5lclbz77zqu0j',
   *   walletPrivateKey: '0x...'
   * });
   *
   * const wallets = await client.getWallets();
   * ```
   *
   * <br />
   *
   * ---
   *
   * @see client {@link idex.RestPublicClient RestPublicClient}
   *
   * @category Accessors
   */
  readonly public: idex.RestPublicClient;

  #exchange: null | idex.IDEXExchange = null;
  #exchangeProm: null | Promise<idex.IDEXExchange> = null;

  readonly #signer: undefined | idex.SignTypedData = undefined;

  readonly #apiSecret: string;

  readonly #axiosConfig: RestAuthenticatedClientOptions['axiosConfig'];

  readonly axios: AxiosInstance;

  #config: {
    baseURL: string;
    sandbox: boolean;
    autoCreateHmacHeader: boolean;
  } & Partial<
    Pick<
      idex.IDEXExchange,
      | 'stargateBridgeAdapterContractAddress'
      | 'exchangeContractAddress'
      | 'chainId'
    >
  >;

  /**
   * Gets the current configured options for the client.
   *
   * - The `baseURL` is automatically derived from the {@link sandbox} option during construction
   *   unless a custom `baseURL` is given.
   * - The `sandbox` will either default to `false` unless provided in the client constructor.
   * - Both `exchangeContractAddress` and `chainId` use the provided values during construction
   *   or are automatically fetched from the {@link public} client.
   *
   * @category Accessors
   *
   * @internal
   */
  public get config() {
    return Object.freeze({
      ...this.#config,
    });
  }

  /**
   * The {@link RestAuthenticatedClient} is used to make authenticated requests to the IDEX API.  It includes
   * methods that make requests on behalf of a specific wallet such as creating and cancelling orders.
   *
   * - The client requires the following properties to automatically handle authentication
   *   of requests:
   *   - {@link RestAuthenticatedClientOptions.apiKey apiKey}
   *   - {@link RestAuthenticatedClientOptions.apiSecret apiSecret}
   *   - {@link RestAuthenticatedClientOptions.walletPrivateKey walletPrivateKey}
   * - Optionally, a {@link RestAuthenticatedClientOptions.sandbox sandbox} option can
   *   be set to `true` in order to point to the IDEX Sandbox API.
   *
   * @example
   * ```typescript
   * import { RestAuthenticatedClient } from '@idexio/idex-sdk';
   *
   * // Edit the values before for your environment
   * const client = new RestAuthenticatedClient({
   *   sandbox: true,
   *   apiKey: '1f7c4f52-4af7-4e1b-aa94-94fac8d931aa',
   *   apiSecret: 'axuh3ywgg854aq7m73oy6gnnpj5ar9a67szuw5lclbz77zqu0j',
   *   walletPrivateKey: '0x...'
   * });
   *
   * const wallets = await client.getWallets();
   * ```
   *
   * <br />
   *
   * ---
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v4.idex.io/classes/WebSocketClient.html)
   * @see options {@link RestAuthenticatedClientOptions}
   *
   * @category Constructor
   */
  public constructor(options: RestAuthenticatedClientOptions) {
    const {
      sandbox = false,
      exchangeContractAddress,
      chainId,
      stargateBridgeAdapterContractAddress,
      autoCreateHmacHeader = true,
    } = options;

    const baseURL = deriveBaseURL({
      sandbox,
      api: 'rest',
      overrideBaseURL: options.baseURL ?? options.axiosConfig?.baseURL,
    });

    if (!baseURL) {
      throw new Error(
        `Invalid configuration, baseURL could not be derived (sandbox? ${String(
          sandbox,
        )})`,
      );
    }

    this.#config = {
      baseURL,
      sandbox,
      stargateBridgeAdapterContractAddress,
      exchangeContractAddress,
      chainId,
      autoCreateHmacHeader,
    };

    this.public = new RestPublicClient({
      apiKey: options.apiKey,
      baseURL,
      sandbox,
    });

    this.#axiosConfig = Object.freeze({
      paramsSerializer(params) {
        return sanitizeSearchParams(params ?? {}).toString();
      },
      ...(isNode ?
        {
          httpAgent:
            options.axiosConfig?.httpAgent ??
            new http.Agent({ keepAlive: true }),
          httpsAgent:
            options.axiosConfig?.httpsAgent ??
            new https.Agent({ keepAlive: true }),
        }
      : {}),
      ...(options.axiosConfig ?? {}),

      baseURL,
      headers: {
        ...(options.axiosConfig?.headers ?? {
          [REST_API_KEY_HEADER]: options.apiKey,
        }),
      },
    });

    this.#apiSecret = options.apiSecret;

    if (options.walletPrivateKey) {
      this.#signer = createPrivateKeyTypedDataSigner(options.walletPrivateKey);
    }

    this.axios = Axios.create(this.#axiosConfig);

    if (options.axiosConfig?.headers) {
      Object.assign(
        this.axios.defaults.headers.common,
        options.axiosConfig.headers,
      );
    }
  }

  /**
   * <br />
   *
   * ---
   * **Endpoint Parameters**
   *
   * > - HTTP Request:      `GET /v4/marketMakerRewardsV1/epoch`
   * > - Endpoint Security: [User Data](https://api-docs-v4.idex.io/#endpointSecurityUserData)
   * > - API Key Scope:     [Read](https://api-docs-v4.idex.io/#api-keys)
   * ---
   *
   * <br />
   *
   * <details>
   *  <summary><span style="font-size:1.4em;font-weight:bold;">About Overloads</span></summary>
   *    <p>
   *      This method has two overloads to provide type-safe responses:
   *      <ul>
   *      <li>
   *        Calling this method with a {@link idex.RestRequestGetMarketMakerRewardsEpochWithWallet.wallet wallet}
   *        parameter returns {@link idex.MarketMakerRewardsEpochDetailedWithWallet MarketMakerRewardsEpochDetailedWithWallet}
   *      </li>
   *      <li>
   *        Calling this method without a {@link idex.RestRequestGetMarketMakerRewardsEpochWithWallet.wallet wallet}
   *        parameter returns {@link idex.MarketMakerRewardsEpochDetailedWithoutWallet MarketMakerRewardsEpochDetailedWithoutWallet}
   *      </li>
   *    </ul>
   * </p>
   * </details>
   * <br />
   *
   * <br />
   *
   * <h3>Overload 1: With Wallet</h3>
   *
   * <p>The Get Epoch endpoint provides detailed information about
   * epoch configuration as well as wallet epoch performance.</p>
   *
   * > When **providing** a wallet address, the resulting response will
   * > be {@link idex.MarketMakerRewardsEpochDetailedWithWallet MarketMakerRewardsEpochDetailedWithWallet}
   */
  public async getMarketMakerRewardsEpoch(
    params: idex.RestRequestGetMarketMakerRewardsEpochWithWallet,
  ): Promise<idex.MarketMakerRewardsEpochDetailedWithWallet>;
  /**
   * <h3>Overload 2: Without Wallet</h3>
   *
   * > When **not** providing a {@link idex.RestRequestGetMarketMakerRewardsEpochWithWallet.wallet wallet},
   * > the resulting response will be {@link idex.MarketMakerRewardsEpochDetailedWithoutWallet MarketMakerRewardsEpochDetailedWithoutWallet}
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v4.idex.io/classes/RestAuthenticatedClient.html#getMarketMakerRewardsEpoch)
   * @see request   {@link idex.RestRequestGetMarketMakerRewardsEpoch RestRequestGetMarketMakerRewardsEpoch}
   * @see response  {@link idex.RestResponseGetMarketMakerRewardsEpoch RestResponseGetMarketMakerRewardsEpoch}
   * @see type      {@link idex.IDEXMarketMakerRewardsEpoch IDEXMarketMakerRewardsEpoch}
   * @see related   {@link getMarketMakerRewardsEpochs this.getMarketMakerRewardsEpochs}
   *
   * @category Rewards & Payouts
   */
  public async getMarketMakerRewardsEpoch(
    params: idex.RestRequestGetMarketMakerRewardsEpochWithoutWallet,
  ): Promise<idex.MarketMakerRewardsEpochDetailedWithoutWallet>;
  public async getMarketMakerRewardsEpoch<
    R extends idex.RestRequestGetMarketMakerRewardsEpoch,
  >(params: R) {
    return this.get<idex.RestResponseGetMarketMakerRewardsEpoch<R>>(
      '/marketMakerRewardsV1/epoch',
      params,
    );
  }

  /**
   * The Get Epochs endpoint provides a list of the defined
   * market maker rewards epochs.
   *
   * ---
   * **Endpoint Parameters**
   *
   * > - HTTP Request:      `GET /v4/marketMakerRewardsV1/epochs`
   * > - Endpoint Security: [User Data](https://api-docs-v4.idex.io/#endpointSecurityUserData)
   * > - API Key Scope:     [Read](https://api-docs-v4.idex.io/#api-keys)
   * ---
   *
   * @see typedoc   [Reference Documentation](https://sdk-js-docs-v4.idex.io/classes/RestAuthenticatedClient.html#getMarketMakerRewardsEpochs)
   * @see request   {@link idex.RestRequestGetMarketMakerRewardsEpochs RestRequestGetMarketMakerRewardsEpochs}
   * @see response  {@link idex.RestResponseGetMarketMakerRewardsEpochs RestResponseGetMarketMakerRewardsEpochs}
   * @see type      {@link idex.IDEXMarketMakerRewardsEpochSummary IDEXMarketMakerRewardsEpochSummary}
   * @see related   {@link getMarketMakerRewardsEpoch client.getMarketMakerRewardsEpoch}
   *
   * @category Rewards & Payouts
   */
  public async getMarketMakerRewardsEpochs(
    params: idex.RestRequestGetMarketMakerRewardsEpochs = {},
  ) {
    return this.get<idex.RestResponseGetMarketMakerRewardsEpochs>(
      '/marketMakerRewardsV1/epochs',
      params,
    );
  }

  /**
   * Associates a wallet with an API account, allowing access to private data such as fills.
   * Associating a wallet with an API account is often the first step in interacting with private
   * read endpoints.
   *
   * ---
   * **Endpoint Parameters**
   *
   * > - **HTTP Request:**         `POST /v4/wallets`
   * > - **Endpoint Security:**    [Trade](https://api-docs-v4.idex.io/#endpointSecurityUserData)
   * > - **API Key Scope:**        [Read](https://api-docs-v4.idex.io/#api-keys)
   * > - **Pagination:**           `None`
   * ---
   *
   * @returns
   * - Returns the {@link idex.IDEXWallet IDEXWallet} which was associated by the request.
   *
   * ---
   *
   * @example
   * ```typescript
   * const wallet = await client.associateWallet({
   *   nonce: uuidv1(),
   *   wallet: '0xA71C4aeeAabBBB8D2910F41C2ca3964b81F7310d',
   * });
   * ```
   *
   * <br />
   *
   * ---
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v4.idex.io/classes/RestAuthenticatedClient.html#associateWallet)
   * @see request  {@link idex.RestRequestAssociateWallet RestRequestAssociateWallet}
   * @see response {@link idex.RestResponseAssociateWallet RestResponseAssociateWallet}
   * @see type     {@link idex.IDEXWallet IDEXWallet}
   *
   * @category Wallets & Positions
   */
  public async associateWallet(
    params: idex.RestRequestAssociateWallet,
    signer: undefined | idex.SignTypedData = this.#signer,
  ) {
    ensureSigner(signer);

    const { chainId, exchangeContractAddress } =
      await this.getContractAndChainId();

    return this.post<idex.RestResponseAssociateWallet>('/wallets', {
      parameters: params,
      signature: await signer(
        ...getWalletAssociationSignatureTypedData(
          params,
          exchangeContractAddress,
          chainId,
          this.#config.sandbox,
        ),
      ),
    });
  }

  /**
   * Returns information about the wallets associated with the API account.
   *
   * ---
   * **Endpoint Parameters**
   *
   * > - **HTTP Request:**         `GET /v4/wallets`
   * > - **Endpoint Security:**    [User Data](https://api-docs-v4.idex.io/#endpointSecurityUserData)
   * > - **API Key Scope:**        [Read](https://api-docs-v4.idex.io/#api-keys)
   * > - **Pagination:**           `None`
   * ---
   *
   * @returns
   *  - An array of {@link idex.IDEXWallet IDEXWallet} objects representing all associated wallets.
   *
   * ---
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v4.idex.io/classes/RestAuthenticatedClient.html#getWallets)
   * @see request  {@link idex.RestRequestGetWallets RestRequestGetWallets}
   * @see response {@link idex.RestResponseGetWallets RestResponseGetWallets}
   * @see type     {@link idex.IDEXWallet IDEXWallet}
   *
   * @category Wallets & Positions
   */
  public async getWallets(params: idex.RestRequestGetWallets) {
    return this.get<idex.RestResponseGetWallets>('/wallets', params);
  }

  /**
   * Get Positions
   *
   * ---
   * **Endpoint Parameters**
   *
   * > - **HTTP Request:**         `GET /v4/positions`
   * > - **Endpoint Security:**    [User Data](https://api-docs-v4.idex.io/#endpointSecurityUserData)
   * > - **API Key Scope:**        [Read](https://api-docs-v4.idex.io/#api-keys)
   * > - **Pagination:**           `None`
   * ---
   *
   * @returns
   *  - An array of {@link idex.IDEXPosition IDEXPosition} objects representing all matching positions based
   *    on your requested params.
   *
   * ---
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v4.idex.io/classes/RestAuthenticatedClient.html#getPositions)
   * @see request  {@link idex.RestRequestGetPositions RestRequestGetPositions}
   * @see response {@link idex.RestResponseGetPositions RestResponseGetPositions}
   * @see type     {@link idex.IDEXPosition IDEXPosition}
   *
   * @category Wallets & Positions
   */
  public async getPositions(params: idex.RestRequestGetPositions) {
    return this.get<idex.RestResponseGetPositions>('/positions', params);
  }

  /**
   * Create and submit an order to the matching engine.
   *
   * - It is recommended to use the {@link idex.OrderType OrderType} enum when creating
   *   your requests. This provides inline documentation and ensures accuracy of the values.
   * - Check out the {@link idex.RestRequestOrder RestRequestOrder} type for an overview
   *   of the various parameters needed for different order types.
   *
   * ---
   * **Endpoint Parameters**
   *
   * > - **HTTP Request:**         `POST /v4/orders`
   * > - **Endpoint Security:**    [Trade](https://api-docs-v4.idex.io/#endpointSecurityTrade)
   * > - **API Key Scope:**        [Trade](https://api-docs-v4.idex.io/#api-keys)
   * > - **Pagination:**           `None`
   * ---
   *
   * @returns
   *  - Returns the {@link idex.IDEXOrder IDEXOrder} which was created by the request.
   *
   * ---
   *
   * @example
   * ```typescript
   * import { OrderType, OrderSide } from '@idexio/idex-sdk';
   *
   * const order = await client.createOrder({
   *   // always use the enum and define it first so that
   *   // the type of this params object change to the
   *   // appropriate interface with completion hints in IDE!
   *   type: OrderType.market,
   *   // this object is now narrowed to
   *   // interface: RestRequestOrderTypeMarket
   *   side: OrderSide.buy,
   *   nonce: uuidv1(),
   *   wallet: '0xA71C4aeeAabBBB8D2910F41C2ca3964b81F7310d',
   *   market: 'ETH-USD',
   *   quantity: '10.00000000'
   * });
   * ```
   *
   * <br />
   *
   * ---
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v4.idex.io/classes/RestAuthenticatedClient.html#createOrder)
   * @see request  {@link idex.RestRequestOrder RestRequestOrder}
   * @see response {@link idex.RestResponseGetOrder RestResponseGetOrder}
   * @see type     {@link idex.IDEXOrder IDEXOrder}
   *
   * @category Orders
   */
  public async createOrder<T extends idex.OrderType>(
    params: idex.RestRequestOrder & { type: T },
    signer: undefined | idex.SignTypedData = this.#signer,
  ) {
    ensureSigner(signer);

    const { chainId, exchangeContractAddress } =
      await this.getContractAndChainId();

    return this.post<idex.RestResponseGetOrder>('/orders', {
      parameters: params,
      signature: await signer(
        ...getOrderSignatureTypedData(
          params,
          exchangeContractAddress,
          chainId,
          this.#config.sandbox,
        ),
      ),
    });
  }

  /**
   * Cancel multiple matching orders using one of the following methods:
   *
   * - By {@link idex.RestRequestCancelOrdersByWallet.wallet wallet} (params: {@link idex.RestRequestCancelOrdersByWallet RestRequestCancelOrdersByWallet})
   * - By {@link idex.RestRequestCancelOrdersByMarket.wallet wallet} & {@link idex.RestRequestCancelOrdersByMarket.market market} (params: {@link idex.RestRequestCancelOrdersByMarket RestRequestCancelOrdersByMarket})
   * - By {@link idex.RestRequestCancelOrdersByMarket.wallet wallet} & {@link idex.RestRequestCancelOrdersByOrderIds.orderIds orderIds} (params: {@link idex.RestRequestCancelOrdersByOrderIds RestRequestCancelOrdersByOrderIds})
   *
   * ---
   * **Endpoint Parameters**
   *
   * > - **HTTP Request:**         `DELETE /v4/orders`
   * > - **Endpoint Security:**    [Trade](https://api-docs-v4.idex.io/#endpointSecurityUserData)
   * > - **API Key Scope:**        [Trade](https://api-docs-v4.idex.io/#api-keys)
   * > - **Pagination:**           `None`
   * ---
   *
   * @returns
   * - Returns an array of cancelled orders matching {@link idex.IDEXCanceledOrder IDEXCanceledOrder}
   *
   * ---
   *
   * @example
   * ```typescript
   * const allOrders = client.cancelOrders({
   *   nonce: uuidv1(),
   *   wallet: '0xA71C4aeeAabBBB8D2910F41C2ca3964b81F7310d',
   * });
   *
   * const ordersForMarket = client.cancelOrders({
   *   nonce: uuidv1(),
   *   wallet: '0xA71C4aeeAabBBB8D2910F41C2ca3964b81F7310d',
   *   market: 'ETH-USD'
   * });
   * ```
   *
   * <br />
   *
   * ---
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v4.idex.io/classes/RestAuthenticatedClient.html#cancelOrders)
   * @see request  {@link idex.RestRequestCancelOrders RestRequestCancelOrders}
   * @see response {@link idex.RestResponseCancelOrders RestResponseCancelOrders}
   * @see type     {@link idex.IDEXCanceledOrder IDEXCanceledOrder}
   * @see related  {@link cancelOrder client.cancelOrder}
   *
   * @category Orders
   */
  public async cancelOrders(
    params: idex.RestRequestCancelOrders,
    signer: idex.SignTypedData | undefined = this.#signer,
  ) {
    ensureSigner(signer);

    const { chainId, exchangeContractAddress } =
      await this.getContractAndChainId();

    return this.delete<idex.RestResponseCancelOrders>('/orders', {
      parameters: params,
      signature: await signer(
        ...getOrderCancellationSignatureTypedData(
          params,
          exchangeContractAddress,
          chainId,
          this.#config.sandbox,
        ),
      ),
    });
  }

  /**
   * Returns an order matching your {@link idex.RestRequestGetOrder.orderId orderId} request parameter.
   *
   * - Can be an order's {@link idex.IDEXOrder.orderId orderId}
   * - To get an order by its {@link idex.IDEXOrder.clientOrderId clientOrderId},
   *   you should prefix the value with `client:`.
   *
   * ---
   * **Endpoint Parameters**
   *
   * > - **HTTP Request:**         `GET /v4/orders`
   * > - **Endpoint Security:**    [User Data](https://api-docs-v4.idex.io/#endpointSecurityUserData)
   * > - **API Key Scope:**        [Read](https://api-docs-v4.idex.io/#api-keys)
   * > - **Pagination:**           `None`
   * ---
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v4.idex.io/classes/RestAuthenticatedClient.html#getOrder)
   * @see request  {@link idex.RestRequestGetOrder RestRequestGetOrder}
   * @see response {@link idex.RestResponseGetOrder RestResponseGetOrder}
   * @see type     {@link idex.IDEXOrder IDEXOrder}
   * @see related  {@link getOrders client.getOrders}
   *
   * @category Orders
   */
  public async getOrder(params: idex.RestRequestGetOrder) {
    return this.get<idex.RestResponseGetOrder>('/orders', params);
  }

  /**
   * Returns information about open and past {@link idex.IDEXOrder orders}.
   *
   * ---
   * **Endpoint Parameters**
   *
   * > - **HTTP Request:**         `GET /v4/orders`
   * > - **Endpoint Security:**    [User Data](https://api-docs-v4.idex.io/#endpointSecurityUserData)
   * > - **API Key Scope:**        [Read](https://api-docs-v4.idex.io/#api-keys)
   * > - **Pagination:**
   * > {@link idex.RestRequestPaginationWithFromId.start start},
   * > {@link idex.RestRequestPaginationWithFromId.end end},
   * > {@link idex.RestRequestPaginationWithFromId.limit limit},
   * > {@link idex.RestRequestPaginationWithFromId.fromId fromId}
   * ---
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v4.idex.io/classes/RestAuthenticatedClient.html#getOrders)
   * @see request  {@link idex.RestRequestGetOrders RestRequestGetOrders}
   * @see response {@link idex.RestResponseGetOrders RestResponseGetOrders}
   * @see type     {@link idex.IDEXOrder IDEXOrder}
   * @see related  {@link getOrder client.getOrder}
   *
   * @category Orders
   */
  public async getOrders(params: idex.RestRequestGetOrders) {
    return this.get<idex.RestResponseGetOrders>('/orders', params);
  }

  /**
   * Get a single fill from the API by your requests {@link idex.RestRequestGetFill.fillId fillId}
   * parameter.
   *
   * ---
   * **Endpoint Parameters**
   *
   * > - **HTTP Request:**         `GET /v4/fills`
   * > - **Endpoint Security:**    [User Data](https://api-docs-v4.idex.io/#endpointSecurityUserData)
   * > - **API Key Scope:**        [Read](https://api-docs-v4.idex.io/#api-keys)
   * > - **Pagination:**           `None`
   * ---
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v4.idex.io/classes/RestAuthenticatedClient.html#getFill)
   * @see request  {@link idex.RestRequestGetFill RestRequestGetFill}
   * @see response {@link idex.RestResponseGetFill RestResponseGetFill}
   * @see type     {@link idex.IDEXFill IDEXFill}
   * @see related  {@link getFills client.getFills}
   *
   * @category Fills & Historical
   */
  public async getFill(params: idex.RestRequestGetFill) {
    return this.get<idex.RestResponseGetFill>('/fills', params);
  }

  /**
   * Get an array of {@link IDEXFill} objects matching your request parameters.
   *
   * ---
   * **Endpoint Parameters**
   *
   * > - **HTTP Request:**         `GET /v4/fills`
   * > - **Endpoint Security:**    [User Data](https://api-docs-v4.idex.io/#endpointSecurityUserData)
   * > - **API Key Scope:**        [Read](https://api-docs-v4.idex.io/#api-keys)
   * > - **Pagination:**
   * > {@link idex.RestRequestPaginationWithFromId.start start},
   * > {@link idex.RestRequestPaginationWithFromId.end end},
   * > {@link idex.RestRequestPaginationWithFromId.limit limit},
   * > {@link idex.RestRequestPaginationWithFromId.fromId fromId}
   * ---
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v4.idex.io/classes/RestAuthenticatedClient.html#getFills)
   * @see request  {@link idex.RestRequestGetFills RestRequestGetFills}
   * @see response {@link idex.RestResponseGetFills RestResponseGetFills}
   * @see type     {@link idex.IDEXFill IDEXFill}
   * @see related  {@link getFill client.getFill}
   *
   * @category Fills & Historical
   */
  public async getFills(params: idex.RestRequestGetFills) {
    return this.get<idex.RestResponseGetFills>('/fills', params);
  }

  /**
   * Returns information about a payout program and the requested wallets earned/paid amounts for
   * the program.
   *
   * - Includes the data required to authorize a payout using the `distribute`
   *   function of the escrow contract.
   * - Throws an error if the {@link idex.IDEXPayoutProgram.quantityOwed quantityOwed}
   *   is `0`
   *
   * ---
   * **Endpoint Parameters**
   *
   * > - **HTTP Request:**         `POST /v4/payouts`
   * > - **Endpoint Security:**    [User Data](https://api-docs-v4.idex.io/#endpointSecurityUserData)
   * > - **API Key Scope:**        [Read](https://api-docs-v4.idex.io/#api-keys)
   * > - **Pagination:**           `None`
   * ---
   *
   * @example
   * ```typescript
   * import { PayoutProgram } from '@idexio/idex-sdk';
   *
   * // create client
   *
   * await client.authorizePayout({
   *  wallet: '0x...',
   *  nonce: uuidv1(),
   *  // use the PayoutProgram enum for inline auto completion
   *  program: PayoutProgram.tradingRewardsV2
   * });
   * ```
   *
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v4.idex.io/classes/RestAuthenticatedClient.html#authorizePayout)
   * @see request  {@link idex.RestRequestAuthorizePayout RestRequestAuthorizePayout}
   * @see response {@link idex.RestResponseAuthorizePayout RestResponseAuthorizePayout}
   * @see type     {@link idex.IDEXPayoutProgramAuthorization IDEXPayoutProgramAuthorization}
   *
   * @category Rewards & Payouts
   */
  public async authorizePayout(params: idex.RestRequestAuthorizePayout) {
    return this.post<idex.RestResponseAuthorizePayout>('/payouts', params);
  }

  /**
   * Returns information about a payout program and the requested wallets
   * earned/paid amounts for the program.
   *
   * ---
   * **Endpoint Parameters**
   *
   * > - **HTTP Request:**       `GET /v4/payouts`
   * > - **Endpoint Security:**  [User Data](https://api-docs-v4.idex.io/#endpointSecurityUserData)
   * > - **API Key Scope:**      [Read](https://api-docs-v4.idex.io/#api-keys)
   * > - **Pagination:**         `None`
   * ---
   *
   * @example
   * ```typescript
   * import { PayoutProgram } from '@idexio/idex-sdk';
   *
   * // create client
   *
   * await client.getPayouts({
   *  wallet: '0x...',
   *  nonce: uuidv1(),
   *  // use the PayoutProgram enum for inline auto completion
   *  program: PayoutProgram.tradingRewardsV2
   * });
   * ```
   *
   * <br />
   *
   * ---
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v4.idex.io/classes/RestAuthenticatedClient.html#getPayouts)
   * @see request  {@link idex.RestRequestGetPayouts RestRequestGetPayouts}
   * @see response {@link idex.RestResponseGetPayouts RestResponseGetPayouts}
   * @see type     {@link idex.IDEXPayoutProgram IDEXPayoutProgram}
   *
   * @category Rewards & Payouts
   */
  public async getPayouts(params: idex.RestRequestGetPayouts) {
    return this.get<idex.RestResponseGetPayouts>('/payouts', params);
  }

  /**
   * Returns information about deposits made by a wallet.
   *
   * ---
   * **Endpoint Parameters**
   *
   * > - **HTTP Request:**         `GET /v4/deposits`
   * > - **Endpoint Security:**    [User Data](https://api-docs-v4.idex.io/#endpointSecurityUserData)
   * > - **API Key Scope:**        [Read](https://api-docs-v4.idex.io/#api-keys)
   * > - **Pagination:**           `None`
   * ---
   *
   * @returns
   * - Returns a single {@link idex.IDEXDeposit IDEXDeposit} object matching your parameters.
   *
   * ---
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v4.idex.io/classes/RestAuthenticatedClient.html#getDeposit)
   * @see request  {@link idex.RestRequestGetDeposit RestRequestGetDeposit}
   * @see response {@link idex.RestResponseGetDeposit RestResponseGetDeposit}
   * @see type     {@link idex.IDEXDeposit IDEXDeposit}
   * @see related  {@link getDeposits client.getDeposits}
   *
   * @category Deposits & Withdrawals
   */
  public async getDeposit(params: idex.RestRequestGetDeposit) {
    return this.get<idex.RestResponseGetDeposit>('/deposits', params);
  }

  /**
   * Returns information about deposits made by a wallet.
   *
   * ---
   * **Endpoint Parameters**
   *
   * > - **HTTP Request:**         `GET /v4/deposits`
   * > - **Endpoint Security:**    [User Data](https://api-docs-v4.idex.io/#endpointSecurityUserData)
   * > - **API Key Scope:**        [Read](https://api-docs-v4.idex.io/#api-keys)
   * > - **Pagination:**
   * > {@link idex.RestRequestPaginationWithFromId.start start},
   * > {@link idex.RestRequestPaginationWithFromId.end end},
   * > {@link idex.RestRequestPaginationWithFromId.limit limit},
   * > {@link idex.RestRequestPaginationWithFromId.fromId fromId}
   * ---
   *
   * @returns
   * - Returns an array of {@link idex.IDEXDeposit IDEXDeposit} objects matching your parameters.
   *
   * ---
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v4.idex.io/classes/RestAuthenticatedClient.html#getDeposits)
   * @see request  {@link idex.RestRequestGetDeposits RestRequestGetDeposits}
   * @see response {@link idex.RestResponseGetDeposits RestResponseGetDeposits}
   * @see type     {@link idex.IDEXDeposit IDEXDeposit}
   * @see related  {@link getDeposit client.getDeposit}
   *
   * @category Deposits & Withdrawals
   */
  public async getDeposits(params: idex.RestRequestGetDeposits) {
    return this.get<idex.RestResponseGetDeposits>('/deposits', params);
  }

  /**
   * A convenience method that helps capture the appropriate value for the
   * {@link withdraw} method's {@link idex.RestRequestWithdrawFundsBase.maximumGasFee maximumGasFee}
   * parameter.
   *
   * - Calls `publicClient.getGasFees` and adds the defined `maximumSlippagePercent` to it.
   * - User should then confirm the value is acceptable before calling {@link withdraw} method.
   * - If gas were `0.05000000` and `maximumSlippagePercent` is `0.10000000` (10%) then result would be `0.05500000`
   * - The value is represented in USD.
   *
   * ---
   *
   * @returns
   * - A value indicating the max gas fee that should be allowed (in USD) based on the
   *   core gas fee with your `maximumSlippagePercent` added.  This value should always
   *   be validated by your application before calling {@link withdraw} method with this
   *   as your {@link idex.RestRequestWithdrawFundsBase.maximumGasFee maximumGasFee}
   *   parameter.
   *
   * ---
   *
   * @example
   * ```typescript
   * // returns the max gas fee in USD you will accept for a withdrawal
   * const maximumGasFee = await client.calculateWithdrawalMaximumGasFee({
   *  bridgeTarget: BridgeTarget.STARGATE_ETHEREUM,
   *  // 10% slippage alllowed (default)
   *  maximumSlippagePercent: '0.10000000'
   * });
   *
   * // never pay more than $1 USD in gas fees to withdrawal
   * if (Number(maximumGasFee) >= 1) {
   *  throw new Error('Too Much Gas cost to Withdraw! ${maximumGasFee} USD >= 1 USD!');
   * }
   *
   * const withdrawal = await client.withdraw({
   *   nonce: uuidv1(),
   *   wallet: '0xA71C4aeeAabBBB8D2910F41C2ca3964b81F7310d',
   *   quantity: '100.00000000',
   *   maximumGasFee,
   *   bridgeTarget: BridgeTarget.STARGATE_ETHEREUM
   * });
   * ```
   *
   * <br />
   *
   * ---
   *
   * @see typedoc   [Reference Documentation](https://sdk-js-docs-v4.idex.io/classes/RestAuthenticatedClient.html#calculateWithdrawalMaximumGasFee)
   * @see related {@link withdraw client.withdraw}
   */
  public async calculateWithdrawalMaximumGasFee({
    bridgeTarget,
    maximumSlippagePercent,
  }: {
    /**
     * The bridge target for the withdrawal of funds.
     *
     * - Utilize the {@link BridgeTarget} enum for convenience and
     *   auto-completion.
     * - Automatically calculates the {@link bridgeAdapterAddress} &
     *   {@link bridgeAdapterPayload} parameters for the targeted network.
     *
     * @see enum {@link BridgeTarget}
     */
    bridgeTarget: idex.BridgeTarget;
    /**
     *  Maximum slippage percent in pips percent format (ex `0.10000000` for 10%)
     *
     * @example
     * ```typescript
     * // 10%
     * '0.10000000'
     * ```
     */
    maximumSlippagePercent: string;
  }) {
    const maximumSlippagePercentBN = BigNumber(maximumSlippagePercent);

    if (maximumSlippagePercentBN.gt(1) || maximumSlippagePercentBN.lt(0)) {
      throw new Error(
        `maximumSlippagePercent must be a value between 0 and 1. Value of ${maximumSlippagePercent} was provided`,
      );
    }

    const gasFees = await this.public.getGasFees();
    const fees = gasFees.withdrawal[bridgeTarget];

    if (!fees) {
      // in testnet we only define xchain so need this - mainnet should have all of them.
      throw new Error(
        `Could not estimate withdrawal maximumGasFee for ${bridgeTarget} as the "gasFees" endpoint does not provide the gas fee for the target.`,
      );
    }

    const slippage = BigNumber(fees).multipliedBy(maximumSlippagePercent);

    return BigNumber(fees).plus(slippage).toFixed(8, BigNumber.ROUND_DOWN);
  }

  /**
   * Withdraw funds from the exchange.
   *
   * - Unlike deposits, withdrawals are initiated via this REST API endpoint.
   * - Once the withdrawal is validated, IDEX automatically dispatches the
   *   resulting transaction to send funds to the wallet.
   *
   * ---
   * **Endpoint Parameters**
   *
   * > - **HTTP Request:**         `POST /v4/withdrawals`
   * > - **Endpoint Security:**    [Trade](https://api-docs-v4.idex.io/#endpointSecurityUserData)
   * > - **API Key Scope:**        [Withdraw](https://api-docs-v4.idex.io/#api-keys)
   * > - **Pagination:**           `None`
   * ---
   *
   * @returns
   * - Returns an {@link idex.IDEXWithdrawal IDEXWithdrawal} object providing the details of the
   *   withdrawal.
   *
   * ---
   *
   * @example
   * ```typescript
   * // returns the max gas fee in USD you will accept for a withdrawal
   * const maximumGasFee = await client.calculateWithdrawalMaximumGasFee({
   *  bridgeTarget: BridgeTarget.STARGATE_ETHEREUM,
   *  // 10% slippage alllowed (default)
   *  maximumSlippagePercent: '0.10000000'
   * });
   *
   * // never pay more than $1 USD in gas fees to withdrawal
   * if (Number(maximumGasFee) >= 1) {
   *  throw new Error('Too Much Gas cost to Withdraw! ${maximumGasFee} USD >= 1 USD!');
   * }
   *
   * const withdrawal = await client.withdraw({
   *   nonce: uuidv1(),
   *   wallet: '0xA71C4aeeAabBBB8D2910F41C2ca3964b81F7310d',
   *   quantity: '100.00000000',
   *   maximumGasFee,
   *   bridgeTarget: BridgeTarget.STARGATE_ETHEREUM
   * });
   * ```
   *
   * <br />
   *
   * ---
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v4.idex.io/classes/RestAuthenticatedClient.html#withdraw)
   * @see request  {@link idex.RestRequestWithdrawFunds RestRequestWithdrawFunds}
   * @see response {@link idex.RestResponseWithdrawFunds RestResponseWithdrawFunds}
   * @see type     {@link idex.IDEXWithdrawal IDEXWithdrawal}
   * @see related  {@link calculateWithdrawalMaximumGasFee}
   *
   * @category Deposits & Withdrawals
   */
  public async withdraw(
    $params: idex.RestRequestWithdrawFundsSDK | idex.RestRequestWithdrawFunds,
    signer: undefined | idex.SignTypedData = this.#signer,
  ) {
    ensureSigner(signer);

    const {
      chainId,
      exchangeContractAddress,
      stargateBridgeAdapterContractAddress,
    } = await this.getContractAndChainId();

    let params: idex.RestRequestWithdrawFunds;

    if ($params.bridgeTarget) {
      const { bridgeTarget, ...rest } = $params;

      params = {
        ...rest,
        bridgeAdapterAddress:
          bridgeTarget === BridgeTarget.XCHAIN_XCHAIN ?
            ethers.ZeroAddress
          : stargateBridgeAdapterContractAddress,
        bridgeAdapterPayload:
          bridgeTarget === BridgeTarget.XCHAIN_XCHAIN ?
            '0x'
          : getEncodedWithdrawalPayloadForBridgeTarget(
              bridgeTarget,
              this.#config.sandbox,
            ),
      };
    } else {
      params = $params;
    }

    return this.post<idex.RestResponseWithdrawFunds>('/withdrawals', {
      parameters: params,
      signature: await signer(
        ...getWithdrawalSignatureTypedData(
          params,
          exchangeContractAddress,
          chainId,
          this.#config.sandbox,
        ),
      ),
    });
  }

  /**
   * Returns information about a single withdrawal matching the request.
   *
   * ---
   * **Endpoint Parameters**
   *
   * > - **HTTP Request:**         `GET /v4/withdrawals`
   * > - **Endpoint Security:**    [User Data](https://api-docs-v4.idex.io/#endpointSecurityUserData)
   * > - **API Key Scope:**        [Read](https://api-docs-v4.idex.io/#api-keys)
   * > - **Pagination:**           `None`
   * ---
   *
   * @returns
   * - Returns an {@link idex.IDEXWithdrawal IDEXWithdrawal} object matching your request.
   *
   * ---
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v4.idex.io/classes/RestAuthenticatedClient.html#getWithdrawal)
   * @see request  {@link idex.RestRequestGetWithdrawal RestRequestGetWithdrawal}
   * @see response {@link idex.RestResponseGetWithdrawal RestResponseGetWithdrawal}
   * @see type     {@link idex.IDEXWithdrawal IDEXWithdrawal}
   * @see related  {@link getWithdrawals client.getWithdrawals}
   *
   * @category Deposits & Withdrawals
   */
  public async getWithdrawal(params: idex.RestRequestGetWithdrawal) {
    return this.get<idex.RestResponseGetWithdrawal>('/withdrawals', params);
  }

  /**
   * Returns information about withdrawals to a wallet.
   *
   * ---
   * **Endpoint Parameters**
   *
   * > - **HTTP Request:**         `GET /v4/withdrawals`
   * > - **Endpoint Security:**    [User Data](https://api-docs-v4.idex.io/#endpointSecurityUserData)
   * > - **API Key Scope:**        [Read](https://api-docs-v4.idex.io/#api-keys)
   * > - **Pagination:**
   * > {@link idex.RestRequestPaginationWithFromId.start start},
   * > {@link idex.RestRequestPaginationWithFromId.end end},
   * > {@link idex.RestRequestPaginationWithFromId.limit limit},
   * > {@link idex.RestRequestPaginationWithFromId.fromId fromId}
   * ---
   *
   * @returns
   * - Returns an array of {@link idex.IDEXWithdrawal IDEXWithdrawal} objects matching your request.
   *
   * ---
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v4.idex.io/classes/RestAuthenticatedClient.html#getWithdrawals)
   * @see request  {@link idex.RestRequestGetWithdrawals RestRequestGetWithdrawals}
   * @see response {@link idex.RestResponseGetWithdrawals RestResponseGetWithdrawals}
   * @see type     {@link idex.IDEXWithdrawal IDEXWithdrawal}
   * @see related  {@link getWithdrawal client.getWithdrawal}
   *
   * @category Deposits & Withdrawals
   */
  public async getWithdrawals(params: idex.RestRequestGetWithdrawals) {
    return this.get<idex.RestResponseGetWithdrawals>('/withdrawals', params);
  }

  /**
   * Get Funding Payments for wallet matching {@link idex.IDEXFundingPayment IDEXFundingPayment}
   *
   * ---
   * **Endpoint Parameters**
   *
   * > - **HTTP Request:**         `GET /v4/fundingPayments`
   * > - **Endpoint Security:**    [User Data](https://api-docs-v4.idex.io/#endpointSecurityUserData)
   * > - **API Key Scope:**        [Read](https://api-docs-v4.idex.io/#api-keys)
   * > - **Pagination:**
   * > {@link idex.RestRequestPaginationWithFromId.start start},
   * > {@link idex.RestRequestPaginationWithFromId.end end},
   * > {@link idex.RestRequestPaginationWithFromId.limit limit}
   * ---
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v4.idex.io/classes/RestAuthenticatedClient.html#getFundingPayments)
   * @see request  {@link idex.RestRequestGetFundingPayments RestRequestGetFundingPayments}
   * @see response {@link idex.RestResponseGetFundingPayments RestResponseGetFundingPayments}
   * @see type     {@link idex.IDEXFundingPayment IDEXFundingPayment}
   *
   * @category Fills & Historical
   */
  public async getFundingPayments<R = idex.RestResponseGetFundingPayments>(
    params: idex.RestRequestGetFundingPayments,
  ) {
    return this.get<R>('/fundingPayments', params);
  }

  /**
   * Set maximum leverage for wallet for a market
   *
   * ---
   * **Endpoint Parameters**
   *
   * > - **HTTP Request:**         `POST /v4/leverage`
   * > - **Endpoint Security:**    [Trade](https://api-docs-v4.idex.io/#endpointSecurityTrade)
   * > - **API Key Scope:**        [Read](https://api-docs-v4.idex.io/#api-keys)
   * > - **Pagination:**
   * ---
   *
   * @returns
   * - Returns an {@link idex.IDEXLeverage IDEXLeverage} object providing the details of the
   *   new leverage setting.

   *
   * @category Wallets & Positions
   */
  public async setLeverage<R = idex.RestResponseSetLeverage>(
    params: idex.RestRequestSetLeverage,
    signer: idex.SignTypedData | undefined = this.#signer,
  ) {
    ensureSigner(signer);

    const { chainId, exchangeContractAddress } =
      await this.getContractAndChainId();

    return this.post<R>('/leverage', {
      parameters: params,
      signature: await signer(
        ...getLeverageSettingsSignatureTypedData(
          params,
          exchangeContractAddress,
          chainId,
          this.#config.sandbox,
        ),
      ),
    });
  }

  /**
   * Get maximum leverage for wallet for a market
   *
   * ---
   * **Endpoint Parameters**
   *
   * > - **HTTP Request:**         `GET /v4/leverage`
   * > - **Endpoint Security:**    [Trade](https://api-docs-v4.idex.io/#endpointSecurityTrade)
   * > - **API Key Scope:**        [Read](https://api-docs-v4.idex.io/#api-keys)
   * > - **Pagination:**
   * ---
   *
   * @returns
   * - Returns an {@link idex.IDEXLeverage IDEXLeverage} object providing the details of the
   *   leverage setting.

   *
   * @category Wallets & Positions
   */
  public async getLeverage<R = idex.RestResponseGetLeverage>(
    params: idex.RestRequestGetLeverage,
  ) {
    return this.get<R>('/leverage', params);
  }

  /**
   * Get Historical PnL for the wallet / market matching {@link idex.IDEXHistoricalProfitLoss IDEXHistoricalProfitLoss}
   *
   * ---
   * **Endpoint Parameters**
   *
   * > - **HTTP Request:**         `GET /v4/historicalPnL`
   * > - **Endpoint Security:**    [User Data](https://api-docs-v4.idex.io/#endpointSecurityUserData)
   * > - **API Key Scope:**        [Read](https://api-docs-v4.idex.io/#api-keys)
   * > - **Pagination:**
   * > {@link idex.RestRequestPaginationWithFromId.start start},
   * > {@link idex.RestRequestPaginationWithFromId.end end},
   * > {@link idex.RestRequestPaginationWithFromId.limit limit}
   * ---
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v4.idex.io/classes/RestAuthenticatedClient.html#getHistoricalPnL)
   * @see request  {@link idex.RestRequestGetHistoricalPnL RestRequestGetHistoricalPnL}
   * @see response {@link idex.RestResponseGetHistoricalPnL RestResponseGetHistoricalPnL}
   * @see type     {@link idex.IDEXHistoricalProfitLoss IDEXHistoricalProfitLoss}
   *
   * @category Fills & Historical
   */
  public async getHistoricalPnL(params: idex.RestRequestGetHistoricalPnL) {
    return this.get<idex.RestResponseGetHistoricalPnL>(
      '/historicalPnL',
      params,
    );
  }

  /**
   * Returns a single-use authentication token as a string for access
   * to {@link idex.SubscriptionNameAuthenticated authenticated subscriptions}
   * in the WebSocket API.
   *
   * ---
   * **Endpoint Parameters**
   *
   * > - **HTTP Request:**         `GET /v4/wsToken`
   * > - **Endpoint Security:**    [User Data](https://api-docs-v4.idex.io/#endpointSecurityUserData)
   * > - **API Key Scope:**        [Read](https://api-docs-v4.idex.io/#api-keys)
   * > - **Pagination:**           `None`
   * ---
   *
   * @returns
   * - Returns the {@link idex.IDEXWebSocketToken.token IDEXWebSocketToken.token} string
   *   directly which you can use to authenticate with the WebSocket server.
   *
   * ---
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v4.idex.io/classes/RestAuthenticatedClient.html#getWsToken)
   * @see request  {@link idex.RestRequestGetAuthenticationToken RestRequestGetAuthenticationToken}
   * @see response {@link idex.RestResponseGetAuthenticationToken RestResponseGetAuthenticationToken}
   *
   * @category WebSocket
   */
  public async getWsToken(params: idex.RestRequestGetAuthenticationToken) {
    if (!params.nonce || !params.wallet) {
      throw new Error('Invalid request, nonce and wallet are required');
    }

    return (
      await this.get<idex.RestResponseGetAuthenticationToken>(
        '/wsToken',
        params,
      )
    ).token;
  }

  /**
   * - All requests within the internal symbol are undocumented internal methods which may change or be removed without notice.
   * - API handling of the parameters used within these methods is likely to change without notice without changes to the SDK to match.
   * - These methods or parameters may require additional permissions to use and result in errors or blocking of your request if used.
   * - If you need to use these methods for your use case, please contact support to discuss your requirements before using them.
   *
   * @internal
   */
  public readonly [INTERNAL_SYMBOL] = Object.freeze({
    getFundingPayments: async (
      ...[params, ...args]: Parameters<
        RestAuthenticatedClient['getFundingPayments']
      >
    ) => {
      const result = await this.getFundingPayments<
        Paginated<idex.RestResponseGetFundingPayments>
      >(
        {
          ...params,
          page: Math.max(typeof params.page === 'number' ? params.page : 1, 1),
        },
        ...args,
      );

      return result;
    },
  } as const);

  // Internal methods exposed for advanced usage

  protected async getContractAndChainId() {
    let {
      chainId,
      exchangeContractAddress,
      stargateBridgeAdapterContractAddress,
    } = this.#config;

    if (
      !chainId ||
      !exchangeContractAddress ||
      !stargateBridgeAdapterContractAddress
    ) {
      if (this.#exchangeProm) {
        // if we already requested the exchange details, wait for the promise to resolve
        return this.#exchangeProm;
      }

      this.#exchangeProm = this.public.getExchange();
      this.#exchange = await this.#exchangeProm;

      if (
        this.#exchange.chainId &&
        this.#exchange.exchangeContractAddress &&
        this.#exchange.stargateBridgeAdapterContractAddress
      ) {
        this.#config.chainId ??= this.#exchange.chainId;
        chainId ??= this.#config.chainId;

        this.#config.exchangeContractAddress ??=
          this.#exchange.exchangeContractAddress;
        exchangeContractAddress ??= this.#config.exchangeContractAddress;

        this.#config.stargateBridgeAdapterContractAddress ??=
          this.#exchange.stargateBridgeAdapterContractAddress;
        stargateBridgeAdapterContractAddress ??=
          this.#config.stargateBridgeAdapterContractAddress;
      }
    }

    if (
      !chainId ||
      !exchangeContractAddress ||
      !stargateBridgeAdapterContractAddress
    ) {
      throw new Error(
        `Could not determine chainId (${typeof chainId}) or exchangeContractAddress (${typeof exchangeContractAddress}) or stargateBridgeAdapterContractAddress (${typeof stargateBridgeAdapterContractAddress})`,
      );
    }

    return {
      chainId,
      exchangeContractAddress,
      stargateBridgeAdapterContractAddress,
    } as const;
  }

  /**
   * - Internal Use and may change or break without notice
   *
   * @internal
   * @hidden
   */
  protected async get<R>(
    endpoint: string,
    params: AnyObj | undefined = undefined,
    axiosConfig: Omit<
      Partial<AxiosRequestConfig>,
      'method' | 'url' | 'params'
    > = {},
  ) {
    return (
      await this.request<R>(endpoint, {
        ...axiosConfig,
        method: 'GET',
        params: sanitizeSearchParams(params),
      })
    ).data;
  }

  /**
   * - Internal Use and may change or break without notice
   *
   * @internal
   * @hidden
   */
  protected async post<R>(
    endpoint: string,
    data: AnyObj = {},
    axiosConfig: Omit<
      Partial<AxiosRequestConfig>,
      'method' | 'url' | 'data'
    > = {},
  ) {
    return (
      await this.request<R>(endpoint, {
        ...axiosConfig,
        method: 'POST',
        data,
      })
    ).data;
  }

  /**
   * - Internal Use and may change or break without notice
   *
   * @internal
   * @hidden
   */
  protected async delete<R>(
    endpoint: string,
    data: AnyObj = {},
    axiosConfig: Omit<
      Partial<AxiosRequestConfig>,
      'method' | 'url' | 'data'
    > = {},
  ) {
    return (
      await this.request<R>(endpoint, {
        ...axiosConfig,
        method: 'DELETE',
        data,
      })
    ).data;
  }

  /**
   * - Internal Use and may change or break without notice
   *
   * @internal
   * @hidden
   */
  protected async put<R>(
    endpoint: string,
    data: AnyObj = {},
    axiosConfig: Omit<
      Partial<AxiosRequestConfig>,
      'method' | 'url' | 'data'
    > = {},
  ) {
    return (
      await this.request<R>(endpoint, {
        ...axiosConfig,
        method: 'PUT',
        data,
      })
    ).data;
  }

  /**
   * - Internal Use and may change or break without notice
   *
   * @internal
   * @hidden
   */
  protected async patch<R>(
    endpoint: string,
    data: AnyObj = {},
    axiosConfig: Omit<
      Partial<AxiosRequestConfig>,
      'method' | 'url' | 'data'
    > = {},
  ) {
    return (
      await this.request<R>(endpoint, {
        ...axiosConfig,
        method: 'PATCH',
        data,
      })
    ).data;
  }

  /**
   * - Internal Use and may change or break without notice
   *
   * @internal
   * @hidden
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected request<R = any>(
    endpoint: string,
    config: Partial<AxiosRequestConfig> &
      (
        | { method: 'GET' }
        | {
            method: Exclude<AxiosRequestConfig['method'], 'GET' | 'get'>;
            data: { [key: string]: unknown };
          }
      ),
    createHmacSignatureHeader = this.#config.autoCreateHmacHeader,
  ) {
    const request: Omit<AxiosRequestConfig, 'headers'> & {
      headers: Record<string, unknown> & AxiosRequestConfig['headers'];
    } = {
      ...config,
      headers: config.headers ?? {},
      url: endpoint,
    };

    if (createHmacSignatureHeader) {
      const paramsSerialized =
        config.method === 'GET' ?
          new URLSearchParams(config.params ?? {}).toString()
        : JSON.stringify(config.data);

      Object.assign(
        request.headers,
        createHmacRestRequestSignatureHeader(paramsSerialized, this.#apiSecret),
      );
    }

    return this.axios<R>(request);
  }
}

/**
 * @internal
 *
 * Ensures that {@link signer} is provided either by constructor definition
 * or manually dependent on the use-case.
 *
 * - SDK use case by end-user should always be provided via constructor
 *   definition so the manual define case is for internal purposes only.
 */
function ensureSigner(
  signer: idex.SignTypedData | undefined,
): asserts signer is idex.SignTypedData {
  if (!signer) {
    throw new Error(
      'A "signer" function is required but was not provided during RestAuthenticatedClient constructor or when calling the method',
    );
  }
}
