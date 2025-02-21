import type { WebSocketClient as _WebSocketClient } from '#client/webSocket/index';
import type { AugmentedRequired } from '#types/utils';
import type {
  KumaSubscribeTypeAuthenticated as _WebSocketSubscribeAuthenticatedType,
  KumaSubscribeTypePublic as _WebSocketSubscribePublicType,
} from '#types/webSocket/index';

/**
 * Providing the `auth` property to the {@link _WebSocketClient WebSocketClient} constructor will allow you
 * to make {@link _WebSocketSubscribeAuthenticatedType authenticated subscriptions} using the
 * {@link _WebSocketClient.subscribeAuthenticated subscribeAuthenticated} method
 *
 * @example
 * ```typescript
 *   import { WebSocketClient } from '@idexio/idex-sdk'
 *
 *   const client = new WebSocketClient({
 *    // Edit the values before for your environment
 *    auth: {
 *      apiKey: '1f7c4f52-4af7-4e1b-aa94-94fac8d931aa',
 *      apiSecret: 'axuh3ywgg854aq7m73oy6gnnpj5ar9a67szuw5lclbz77zqu0j',
 *      wallet: '0x...',
 *    }
 *    // sandbox: true,
 *    // logger: console.log
 *  });
 * ```
 *
 * <br />
 *
 * ---
 *
 * @see parent {@link WebSocketClientOptions}
 */
export interface WebSocketClientAuthOptions {
  /**
   * The user's API Key for the account they wish to make authenticated subscriptions with,
   * this is used to retrieve a [WebSocket Token](https://api-docs-v1.kuma.bid/#websocket-authentication-endpoints)
   * that can be used to authenticate the connection.
   *
   * @see [WebSocket Token API Docs](https://api-docs-v1.kuma.bid/#websocket-authentication-endpoints)
   */
  apiKey: string;
  /**
   * Used to compute HMAC signature when refreshing the
   * [WebSocket Token](https://api-docs-v1.kuma.bid/#websocket-authentication-endpoints)
   *
   * @see [WebSocket Token API Docs](https://api-docs-v1.kuma.bid/#websocket-authentication-endpoints)
   */
  apiSecret: string;
  /**
   * The wallet that should be used when subscribing to authenticated channels.
   */
  wallet: string;
}

export interface WebSocketClientOptionsBase {
  /**
   * If subscribing to {@link _WebSocketSubscribeAuthenticatedType authenticated subscriptions} is
   * desired, you must provide this property matching {@link WebSocketClientAuthOptions} which includes:
   *  - {@link WebSocketClientAuthOptions.apiKey apiKey}
   *  - {@link WebSocketClientAuthOptions.apiSecret apiSecret}
   *  - {@link WebSocketClientAuthOptions.wallet wallet}
   *
   * ---
   *
   * - These properties are used to fetch a [WebSocket Token](https://api-docs-v1.kuma.bid/#websocket-authentication-endpoints)
   *   from the REST API.
   *
   * ---
   *
   * @see [WebSocket Token API Docs](https://api-docs-v1.kuma.bid/#websocket-authentication-endpoints)
   */
  readonly auth?: WebSocketClientAuthOptions;

  /**
   * If `true`, client will point to the sandbox API endpoint.
   *
   * @see [Sandbox API Documentation](https://api-docs-v1.kuma.bid/#sandbox)
   *
   * @defaultValue false
   */
  sandbox?: boolean;

  /**
   * Provide a logging function if you would like the client to log internal messages.  The function
   * should match `console.log` signature.
   *
   * @example
   * ```typescript
   * new WebSocketClient({
   *  logger: console.log
   * })
   * ```
   */
  logger?: typeof console.log;

  /**
   * May be used to uniquely identify this client if the {@link logger} function is utilized.
   *
   * - If not provided, clients will receive id's which increment each time they are created.
   */
  clientId?: string;

  /**
   * If `true` (default), automatically reconnects when connection is closed by the server or network errors
   *
   * @see [WebSocket Connection Maintenance](https://api-docs-v1.kuma.bid/#connection-maintenance)
   *
   * @defaultValue
   * ```typescript
   * true
   * ```
   */
  shouldReconnectAutomatically?: boolean;

  /**
   * The base URL to use when connecting to the WebSocket API.
   *
   * - Allows you to use a custom URL to connect to the WebSocket API.
   * - *This is unlikely to be useful for most users.*
   *   - The `baseWebSocketURL` is automatically set based on
   *     whether you indicate you want to use the {@link sandbox} or not.
   *
   * @internal
   *
   * @example
   * 'wss://websocket.kuma.bid/v1'
   */
  baseWebSocketURL?: string;

  /**
   * The base URL to use when connecting to the REST API for WebSocket tokens.
   *
   * - Allows you to use a custom URL to connect to a REST API serving websocket tokens.
   * - Only used for authenticated subscriptions
   * - *This is unlikely to be useful for most users.*
   *   - The `baseRestApiURL` is automatically set based on
   *     whether you indicate you want to use the {@link sandbox} or not.
   *
   * @internal
   *
   * @example
   *  `https://api.kuma.bid/v1`
   */
  baseRestApiURL?: string;

  /**
   * [INTERNAL USE ONLY] - Will not have any functionality in normal circumstances.
   *
   * - Note that `wallet` is passed to the {@link auth} object for authenticated cases with
   *   WebSocket.
   *
   * @internal
   */
  readonly wallet?: string;

  /**
   * [INTERNAL USE ONLY]
   *
   * @see [WebSocket API Documentation](https://api-docs-v1.kuma.bid/#websocket-authentication-endpoints)
   *
   * @internal
   */
  readonly websocketAuthTokenFetch?: (
    options: WebSocketClientOptionsWithFetch,
  ) => string | Promise<string>;
}

/**
 * WebSocket constructor options which will only allow you to subscribe to
 * {@link _WebSocketSubscribePublicType public subscriptions}.
 *
 * - All properties are optional, thus `new WebSocketClient()` is valid for public subscriptions.
 *
 * @example
 * ```typescript
 *   import { WebSocketClient } from '@idexio/idex-sdk';
 *
 *   // all options are optional for public only clients
 *   const webSocketClientPublicOnly = new WebSocketClient({
 *     // sandbox: true,
 *   });
 * ```
 *
 * @category WebSocket - Client Options
 */
export interface WebSocketClientOptionsPublicOnly
  extends WebSocketClientOptionsBase {
  readonly auth?: undefined;
  readonly wallet?: undefined;
  readonly websocketAuthTokenFetch?: undefined;
}

/**
 * @internal
 */
export interface WebSocketClientOptionsWithFetch
  extends WebSocketClientOptionsBase {
  readonly auth?: undefined;
  /**
   * @inheritDoc
   */
  readonly wallet: string;
  /**
   * @inheritDoc
   */
  readonly websocketAuthTokenFetch: WebSocketClientOptionsBase['websocketAuthTokenFetch'] & {};
}

/**
 * Providing the required {@link WebSocketClientAuthOptions} object will allow the client to
 * make {@link _WebSocketSubscribeAuthenticatedType authenticated subscriptions}
 * as well as {@link _WebSocketSubscribePublicType public subscriptions}
 *
 * @example
 * ```typescript
 *   import { WebSocketClient } from '@idexio/idex-sdk'
 *
 *   const client = new WebSocketClient({
 *    // Edit the values before for your environment
 *    auth: {
 *      apiKey: '1f7c4f52-4af7-4e1b-aa94-94fac8d931aa',
 *      apiSecret: 'axuh3ywgg854aq7m73oy6gnnpj5ar9a67szuw5lclbz77zqu0j',
 *      wallet: '0x...',
 *    }
 *    // sandbox: true,
 *    // logger: console.log
 *  });
 * ```
 *
 * <br />
 *
 * ---
 *
 * @see docs [WebSocket API Documentation](https://api-docs-v1.kuma.bid/#subscriptions)
 *
 * @category WebSocket - Client Options
 */
export interface WebSocketClientOptionsWithAPIKey
  extends WebSocketClientOptionsBase {
  /**
   * @inheritDoc
   */
  readonly auth: WebSocketClientOptionsBase['auth'] & {};
  readonly wallet?: undefined;
  readonly websocketAuthTokenFetch?: undefined;
}

/**
 * WebSocket API client options
 *
 * You must provide options that match either:
 *
 * - To make {@link _WebSocketSubscribePublicType public subscriptions}, all options are optional.
 * - To make {@link _WebSocketSubscribeAuthenticatedType authenticated subscriptions}:
 *   - you must provide a valid {@link WebSocketClientAuthOptions auth}
 *     property in the constructor options which includes:
 *     - {@link WebSocketClientAuthOptions.apiKey apiKey}
 *     - {@link WebSocketClientAuthOptions.apiSecret apiSecret}
 *     - {@link WebSocketClientAuthOptions.wallet wallet}
 *
 * @example
 * ```typescript
 *   import { WebSocketClient } from '@idexio/idex-sdk';
 *
 *   // all options are optional for public only clients
 *   const webSocketClientPublicOnly = new WebSocketClient();
 *
 *   const client = new WebSocketClient({
 *    // Edit the values before for your environment
 *    auth: {
 *      apiKey: '1f7c4f52-4af7-4e1b-aa94-94fac8d931aa',
 *      apiSecret: 'axuh3ywgg854aq7m73oy6gnnpj5ar9a67szuw5lclbz77zqu0j',
 *      wallet: '0x...',
 *    }
 *    // sandbox: true,
 *    // logger: console.log
 *  });
 * ```
 *
 * <br />
 *
 * ---
 *
 * @see docs    [WebSocket API Documentation](https://api-docs-v1.kuma.bid/#subscriptions)
 * @see related {@link WebSocketClientOptionsWithAPIKey}
 * @see related {@link WebSocketClientOptionsPublicOnly}
 *
 * @category WebSocket - Client Options
 * @category API Clients
 */
export type WebSocketClientOptions =
  | WebSocketClientOptionsWithAPIKey
  | WebSocketClientOptionsPublicOnly
  | WebSocketClientOptionsWithFetch;

/**
 * Represents the shape of the options after being initialized during runtime.
 *
 * @internal
 */
export type WebSocketClientOptionsInitialized = AugmentedRequired<
  WebSocketClientOptionsBase,
  | 'baseWebSocketURL'
  | 'baseRestApiURL'
  | 'sandbox'
  | 'shouldReconnectAutomatically'
  | 'clientId'
>;
