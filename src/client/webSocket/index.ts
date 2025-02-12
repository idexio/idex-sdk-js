import WebSocket from 'isomorphic-ws';
import { v1 as uuidv1 } from 'uuid';

import { deriveBaseURL, isNode } from '#utils';

import { RestAuthenticatedClient } from '#client/rest/authenticated';
import * as guards from '#client/webSocket/guards';
import { transformWebsocketShortResponseMessage } from '#client/webSocket/transform';
import {
  WebSocketRequestMethod,
  type SubscriptionNamePublic as _SubscriptionNamePublic,
  type SubscriptionNameAuthenticated as _SubscriptionNameAuthenticated,
} from '#types/enums/request';

import type * as idex from '#index';
import type { MessageEventType as _MessageEventType } from '#types/enums/response';
import type {
  WebSocketClientOptions,
  WebSocketClientOptionsWithAPIKey,
  WebSocketClientOptionsWithFetch,
  WebSocketRequest,
  WebSocketRequestUnsubscribeShortNames,
  IDEXMessageEvent,
  IDEXSubscribeTypeAuthenticated,
  IDEXSubscribeTypePublic,
  IDEXSubscribeType,
  WebSocketClientOptionsInitialized,
  WebSocketRequestUnsubscribeSubscription,
  WebSocketClientOptionsPublicOnly as _WebSocketClientOptionsPublicOnly,
} from '#types/webSocket/index';

export * from '#client/webSocket/guards';

export { transformWebsocketShortResponseMessage };

let autoId = 1;

/**
 * This is the doc comment for file1.ts
 *
 * Specify this is a module comment and rename it to my-module:
 * @module my-module
 */

/**
 * @internal
 *
 * How often to send `ping` messages to the server (in milliseconds).
 */
export const WEBSOCKET_PING_TIMEOUT_MS = 30_000;

/**
 * WebSocket Client handler for the `onConnect` method
 */
export type WebSocketHandlerConnect = () => unknown;

/**
 * WebSocket Client handler for the `onDisconnect` method
 */
export type WebSocketHandlerDisconnect = (
  code: number,
  reason: string,
) => unknown;

/**
 * WebSocket Client handler for the `onError` method
 */
export type WebSocketHandlerError = (error: WebSocket.ErrorEvent) => unknown;

/**
 * WebSocket Client handler for the `onMessage` method
 */
export type WebSocketHandlerMessage = (message: IDEXMessageEvent) => unknown;

/**
 * ### WebSocket API client
 *
 * You must provide constructor options that match either:
 *
 * - If you only need {@link IDEXSubscribeTypePublic public subscriptions}, all options are optional.
 * - If you want to make {@link IDEXSubscribeTypeAuthenticated authenticated subscriptions}:
 *   - You must provide a valid {@link WebSocketClientOptions.auth auth}
 *     property in the {@link WebSocketClientOptions constructor options} which includes:
 *     - {@link idex.WebSocketClientAuthOptions.apiKey apiKey}
 *     - {@link idex.WebSocketClientAuthOptions.apiSecret apiSecret}
 *     - {@link idex.WebSocketClientAuthOptions.wallet wallet}
 *
 * @example
 * ```typescript
 *   import {
 *    WebSocketClient,
 *    SubscriptionNameAuthenticated,
 *    SubscriptionNamePublic
 *   } from '@idexio/idex-sdk';
 *
 *   const webSocketClientPublicOnly = new WebSocketClient();
 *
 *   // or ... to enable both public and authenticated subscriptions:
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
 *
 *  client.onConnect(() => {
 *    // [see onConnect docs for full example and information]
 *  })
 *
 *  client.onDisconnect((code, reason) => {
 *    // [see onDisconnect docs for full example and information]
 *  })
 *
 *  client.onError(errorEvent => {
 *    // [see onError docs for full example and information]
 *  })
 *
 *  client.onMessage(message => {
 *   console.log('Receiving Message: ', message)
 *   switch(message.type) {
 *     case MessageEventType.subscriptions:
 *       return handleSubscriptions(message.subscriptions);
 *     case MessageEventType.error:
 *      return handleAPIError(message.data);
 *     case MessageEventType.candles:
 *      return handleCandles(message.data);
 *     default:
 *        break;
 *  })
 *
 *  await client.connect();
 *
 * // subscribe as needed!
 *
 *  await client
 *    .subscribePublic([
 *      {
 *        name: SubscriptionNamePublic.tickers,
 *        markets: ['ETH-USD']
 *      },
 *   ])
 *   .subscribeAuthenticated([
 *      { name: SubscriptionNameAuthenticated.positions },
 *      { name: SubscriptionNameAuthenticated.orders },
 *   ]);
 * ```
 *
 * <br />
 *
 * ---
 *
 * @see typedoc  [Reference Documentation](https://sdk-js-docs-v4.idex.io/classes/WebSocketClient.html)
 *
 * @category API Clients
 * @category IDEX - Get Candles
 * @category IDEX - Get Deposits
 * @category IDEX - Get Funding Payments
 * @category IDEX - Get Liquidations
 * @category IDEX - Get OrderBook
 * @category IDEX - Get Orders
 * @category IDEX - Get Positions
 * @category IDEX - Get Tickers
 * @category IDEX - Get Trades
 * @category IDEX - Get Withdrawals
 */
export class WebSocketClient {
  /**
   * @internal
   * @private
   */
  readonly #state = {
    /**
     * Set to true when the reconnect logic should not be run.
     * @private
     */
    doNotReconnect: false,
    isReconnecting: false,
    /**
     * Used to track the number of reconnect attempts for exponential backoff
     * @private
     */
    reconnectAttempt: 0,
    /**
     * When the ping timeout is scheduled, it saves its id to this property.  Since
     * the type from Node & dom are not compatible, using it may require casting
     *
     * @example
     * clearTimeout(this.#state.pingTimeoutId as number);
     *
     * @private
     */
    pingTimeoutId: undefined as undefined | number | NodeJS.Timeout,
    reconnectTimeoutId: undefined as undefined | ReturnType<typeof setTimeout>,
    connectHandlers: new Set<WebSocketHandlerConnect>(),
    disconnectHandlers: new Set<WebSocketHandlerDisconnect>(),
    errorHandlers: new Set<WebSocketHandlerError>(),
    messageHandlers: new Set<WebSocketHandlerMessage>(),
  };

  readonly #websocketCustomAuthTokenFetcher:
    | ({} & WebSocketClientOptions['websocketAuthTokenFetch'])
    | null = null;

  readonly #websocketAutoAuthTokenFetcher: (() => Promise<string>) | null =
    null;

  /**
   * If `true`, this client will throw an error if it attempts to subscribe to
   * an {@link IDEXSubscribeTypeAuthenticated authenticated subscription}.
   *
   * - This is determined by whether or not the {@link idex.WebSocketClientOptions.auth auth}
   *   property was provided during construction.
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v4.idex.io/classes/WebSocketClient.html#isPublicOnly)
   *
   * @category Accessors
   */
  public get isPublicOnly(): boolean {
    return (
      !this.#websocketCustomAuthTokenFetcher &&
      !this.#websocketAutoAuthTokenFetcher
    );
  }

  readonly #options: WebSocketClientOptionsInitialized;

  #terminated = false;

  /**
   * When a client is terminated, it will cease to function and a new WebSocketClient must be created
   * to start a new connection.
   */
  get terminated() {
    return this.#terminated;
  }

  #ws: null | WebSocket = null;

  /**
   * You can access the current {@link WebSocket}
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v4.idex.io/classes/WebSocketClient.html#ws)
   *
   * @category Accessors
   */
  get ws(): null | WebSocket {
    return this.#ws;
  }

  /**
   * A boolean indicating whether the WebSocket client is currently connected to the IDEX WebSocket API.
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v4.idex.io/classes/WebSocketClient.html#isConnected)
   *
   * @category Accessors
   */
  get isConnected(): boolean {
    if (!this.ws) {
      return false;
    }
    return this.ws.readyState === this.ws.OPEN;
  }

  /**
   * ### WebSocket API client
   *
   * You must provide constructor options that match either:
   *
   * - If you only need {@link IDEXSubscribeTypePublic public subscriptions}, all options are optional.
   * - If you want to make {@link IDEXSubscribeTypeAuthenticated authenticated subscriptions}:
   *   - You must provide a valid {@link WebSocketClientOptions.auth auth}
   *     property in the {@link WebSocketClientOptions constructor options} which includes:
   *     - {@link idex.WebSocketClientAuthOptions.apiKey apiKey}
   *     - {@link idex.WebSocketClientAuthOptions.apiSecret apiSecret}
   *     - {@link idex.WebSocketClientAuthOptions.wallet wallet}
   *
   * @example
   * ```typescript
   *   import {
   *    WebSocketClient,
   *    SubscriptionNameAuthenticated,
   *    SubscriptionNamePublic
   *   } from '@idexio/idex-sdk';
   *
   *   const webSocketClientPublicOnly = new WebSocketClient();
   *
   *   // or ... to enable both public and authenticated subscriptions:
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
   *
   *  client.onConnect(() => {
   *    // [see onConnect docs for full example and information]
   *  })
   *
   *  client.onDisconnect((code, reason) => {
   *    // [see onDisconnect docs for full example and information]
   *  })
   *
   *  client.onError(errorEvent => {
   *    // [see onError docs for full example and information]
   *  })
   *
   *  client.onMessage(message => {
   *   console.log('Receiving Message: ', message)
   *   switch(message.type) {
   *     case MessageEventType.subscriptions:
   *       return handleSubscriptions(message.subscriptions);
   *     case MessageEventType.error:
   *      return handleAPIError(message.data);
   *     case MessageEventType.candles:
   *      return handleCandles(message.data);
   *     default:
   *        break;
   *  })
   *
   *  await client.connect();
   *
   * // subscribe as needed!
   *
   *  await client
   *    .subscribePublic([
   *      {
   *        name: SubscriptionNamePublic.tickers,
   *        markets: ['ETH-USD']
   *      },
   *   ])
   *   .subscribeAuthenticated([
   *      { name: SubscriptionNameAuthenticated.positions },
   *      { name: SubscriptionNameAuthenticated.orders },
   *   ]);
   * ```
   *
   * <br />
   *
   * ---
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v4.idex.io/classes/WebSocketClient.html)
   */
  constructor(options: idex.WebSocketClientOptions = {}) {
    const sandbox = options.sandbox ?? false;

    const baseWebSocketURL = deriveBaseURL({
      sandbox,
      api: 'websocket',
      baseRestApiURL: options.baseRestApiURL,
      baseWebSocketURL: options.baseWebSocketURL,
    });

    const baseRestApiURL = deriveBaseURL({
      sandbox,
      api: 'rest',
      baseWebSocketURL: options.baseWebSocketURL,
      baseRestApiURL: options.baseRestApiURL,
    });

    const initializedOptions = {
      sandbox,
      baseWebSocketURL,
      baseRestApiURL,
      shouldReconnectAutomatically:
        options.shouldReconnectAutomatically ?? true,
      // eslint-disable-next-line no-plusplus
      clientId: options.clientId ?? `${autoId++}`,
    };

    this.#options = {
      ...options,
      ...initializedOptions,
    } satisfies WebSocketClientOptionsInitialized;

    // Options must exactly match one of the subsets of WebSocketClientOptionsBase
    if (this.#options.websocketAuthTokenFetch) {
      // WebSocketClientOptionsWithFetch
      this.#websocketCustomAuthTokenFetcher =
        this.#options.websocketAuthTokenFetch.bind(this);
      this.#websocketAutoAuthTokenFetcher = null;
    } else if (guards.isWebSocketOptionsAutoFetch(this.#options)) {
      // WebSocketClientOptionsWithAPIKey
      this.#websocketCustomAuthTokenFetcher = null;
      this.#websocketAutoAuthTokenFetcher = createDefaultWebSocketTokenFetcher(
        this.#options,
      );
    } else if (guards.isWebSocketOptionsPublicOnly(this.#options)) {
      // WebSocketClientOptionsPublicOnly
      this.#websocketCustomAuthTokenFetcher = null;
      this.#websocketAutoAuthTokenFetcher = null;
    } else {
      throw new Error(
        'Invalid configuration, must specify options for either public only, auto wsToken fetch, or custom wsToken fetch',
      );
    }
  }

  private throwIfTerminated() {
    if (this.terminated) {
      throw new Error(
        `WebSocketClient ${this.#options.clientId} is terminated and cannot be used`,
      );
    }
  }

  /**
   * Connect to the [IDEX WebSocket API](https://api-docs-v4.idex.io/#websocket-api-interaction)
   *
   * ---
   * @param awaitConnected
   *  - If `true`, the promise will not resolve until the connection is established
   * @returns
   *  - `this` to allow chaining with other methods or requests.
   * ---
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v4.idex.io/classes/WebSocketClient.html#connect)
   *
   * @category Connection Management
   */
  public async connect(awaitConnected = true): Promise<this> {
    this.throwIfTerminated();

    if (this.isConnected) {
      return this;
    }

    this.log(
      'info',
      `Connecting to WebSocket, awaiting connection? ${awaitConnected}`,
    );

    this.#state.doNotReconnect = false;

    // connect and await connection to succeed
    const connectionProm = this.createWebSocketIfNeeded(true).then(() => {
      this.#state.connectHandlers.forEach((listener) => listener());
    });

    if (awaitConnected) {
      await connectionProm;
    }

    return this;
  }

  /**
   * Disconnect from the WebSocket if connected.
   *
   * - If `terminate` is `true`, the WebSocket will be disconnected immediately and this client will
   *   cease to work or connect.
   *   - All listeners will be cleared and all methods will throw errors once terminated.
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v4.idex.io/classes/WebSocketClient.html#disconnect)
   *
   * @category Connection Management
   */
  public disconnect(terminate?: boolean): this {
    if (!terminate) {
      this.throwIfTerminated();
    } else if (this.terminated) {
      return this;
    }

    this.#state.doNotReconnect = true;

    this.log('info', 'Disconnecting from WebSocket');

    this.stopPinging();

    this.cancelReconnect();

    if (!this.#ws) {
      if (terminate) {
        this.#terminated = true;
      }
      return this; // Already disconnected
    }

    this.#state.doNotReconnect = true;

    if (terminate) {
      this.#options.shouldReconnectAutomatically = false;
      this.#terminated = true;

      // handlers are not called when terminating
      this.#state.connectHandlers.clear();
      this.#state.disconnectHandlers.clear();
      this.#state.errorHandlers.clear();
      this.#state.disconnectHandlers.clear();
      this.#state.messageHandlers.clear();

      if (typeof this.#ws.terminate === 'function') {
        this.#ws.terminate();
      } else {
        this.#ws.close();
      }
    } else {
      this.#ws.close();
    }

    this.#ws = null;

    return this;
  }

  /**
   * Subscribe a handler to all WebSocket disconnect events.
   *
   * - Calling multiple times will add multiple subscribers to the given event
   *
   * ---
   * @param handler
   *  - A handler function matching {@link WebSocketHandlerConnect} that will receive events.
   * @param replaceAll
   *  - Replaces all current handlers with the provided handler.
   * @returns
   *  - `this` to allow chaining with other methods or requests.
   * ---
   *
   * @example
   * ```typescript
   *  websocketClient.onConnect(() => {
   *   console.warn('WebSocket Connection Connects')
   *  })
   * ```
   *
   * <br />
   *
   * ---
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v4.idex.io/classes/WebSocketClient.html#onConnect)
   *
   * @category Event Handling
   */
  public onConnect(
    handler: WebSocketHandlerConnect,
    replaceAll?: boolean,
  ): this {
    this.throwIfTerminated();
    if (replaceAll) {
      this.#state.connectHandlers.clear();
    }
    this.#state.connectHandlers.add(handler);
    return this;
  }

  /**
   * Subscribe a handler to all WebSocket disconnect events.
   *
   * ---
   * @param handler
   *  - A handler function matching {@link WebSocketHandlerDisconnect} that will receive events.
   * @param replaceAll
   *  - Replaces all current handlers with the provided handler.
   * @returns
   *  - `this` to allow chaining with other methods or requests.
   * ---
   *
   * @example
   * ```typescript
   *  websocketClient.onDisconnect((code, reason) => {
   *   console.warn('WebSocket Connection Disconnects: ', code, reason)
   *  })
   * ```
   *
   * <br />
   *
   * ---
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v4.idex.io/classes/WebSocketClient.html#onDisconnect)
   *
   * @category Event Handling
   */
  public onDisconnect(
    handler: WebSocketHandlerDisconnect,
    replaceAll?: boolean,
  ): this {
    this.throwIfTerminated();
    if (replaceAll) {
      this.#state.disconnectHandlers.clear();
    }
    this.#state.disconnectHandlers.add(handler);
    return this;
  }

  /**
   * Subscribe a handler to all WebSocket connection errors that may occur during
   * your requests.
   *
   * - **Note:** These errors will be coming from the `ws` library itself and provide
   *   its {@link ErrorEvent} errors.
   * - Errors coming from the IDEX WebSocket client will be present as a {@link idex.IDEXErrorEvent IDEXErrorEvent}
   *   message to the {@link onMessage} handler.
   *
   * ---
   * @param handler
   *  - A handler function matching {@link WebSocketHandlerError} that will receive events.
   * @param replaceAll
   *  - Replaces all current handlers with the provided handler.
   * @returns
   *  - `this` to allow chaining with other methods or requests.
   * ---
   *
   * @example
   * ```typescript
   *  websocketClient.onError(errorEvent => {
   *   console.error('Connection Error on WebSocket: ', errorEvent.error)
   *  })
   * ```
   *
   * <br />
   *
   * ---
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v4.idex.io/classes/WebSocketClient.html#onError)
   *
   * @category Event Handling
   */
  public onError(handler: WebSocketHandlerError, replaceAll?: boolean): this {
    this.throwIfTerminated();
    if (replaceAll) {
      this.#state.errorHandlers.clear();
    }
    this.#state.errorHandlers.add(handler);
    return this;
  }

  /**
   * Subscribe a handler to all subscription responses.
   *
   * - Your handler will receive updates when available matching the {@link IDEXMessageEvent}
   *   interface.
   * - Use the {@link idex.MessageEventType MessageEventType} enum to get an enum
   *   defining all possible `type` values that can be received on the WebSocket message (see example).
   *
   * ---
   * @param handler
   *  - A handler function matching {@link WebSocketHandlerMessage} that will receive events.
   * @param replaceAll
   *  - Replaces all current handlers with the provided handler.
   * @returns
   *  - `this` to allow chaining with other methods or requests.
   * ---
   *
   * @example
   * ```typescript
   *  import { MessageEventType } from '@idexio/idex-sdk';
   *
   *  // ... client setup
   *
   *  websocketClient.onMessage(message => {
   *   console.log('Receiving Message: ', message)
   *   switch(message.type) {
   *     case MessageEventType.subscriptions:
   *       return handleSubscriptions(message.subscriptions);
   *     case MessageEventType.error:
   *      return handleAPIError(message.data);
   *     case MessageEventType.candles:
   *      return handleCandles(message.data);
   *     default:
   *        break;
   *   }
   *  })
   * ```
   *
   * <br />
   *
   * ---
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v4.idex.io/classes/WebSocketClient.html#onMessage)
   * @see enum     {@link idex.MessageEventType MessageEventType}
   * @see type     {@link IDEXMessageEvent}
   *
   * @category Event Handling
   */
  public onMessage(
    handler: WebSocketHandlerMessage,
    replaceAll?: boolean,
  ): this {
    this.throwIfTerminated();
    if (replaceAll) {
      this.#state.messageHandlers.clear();
    }
    this.#state.messageHandlers.add(handler);
    return this;
  }

  /**
   * Creates new {@link IDEXSubscribeTypeAuthenticated authenticated subscriptions} based on the provided parameters.
   *
   * - Use the {@link idex.SubscriptionNameAuthenticated SubscriptionNameAuthenticated} enum for IDE
   *   inline documentation and auto completion (see example)
   *
   * ---
   *
   * **Subscription Update Events:**
   *
   * - Receives a {@link idex.IDEXSubscriptionsListEvent IDEXSubscriptionsListEvent} WebSocket response via
   *   the {@link idex.WebSocketClient.onMessage WebSocketClient.onMessage} handler listing all active
   *   subscriptions.
   * - Begins receiving {@link idex.IDEXSubscriptionEvent IDEXSubscriptionEvent}'s for all subscribed
   *   subscriptions via the {@link idex.WebSocketClient.onMessage WebSocketClient.onMessage} handler.
   *
   * ---
   * @param subscriptions
   *  - An array of {@link IDEXSubscribeTypeAuthenticated} subscription objects.
   * @param cid
   *  - Optionally provide a `cid` property which will be returned in the response
   *    so that you can correlate the response to the request.
   * @returns
   *  - `this` to allow chaining with other methods or requests.
   * ---
   *
   * @throws
   * >  This method will **throw an error** if you did not provide the {@link idex.WebSocketClientOptionsWithAPIKey.auth auth} option
   *    to the constructor in order to handle authenticated subscriptions.
   *
   * ---
   *
   * @example
   * ```typescript
   *  import {
   *    WebSocketClient,
   *    SubscriptionNameAuthenticated,
   *  } from '@idexio/idex-sdk';
   *
   *  const client = new WebSocketClient({
   *    auth: {
   *      apiKey: '...',
   *      apiSecret: '...',
   *      wallet: '0x...'
   *    }
   *  })
   *
   *  client.onMessage(message => {
   *    console.log('Received WebSocket Message: ', message)
   *  })
   *
   *  await client.subscribeAuthenticated([
   *    { name: SubscriptionNameAuthenticated.positions },
   *    { name: SubscriptionNameAuthenticated.orders },
   *  ])
   * ```
   *
   * <br />
   *
   * ---
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v4.idex.io/classes/WebSocketClient.html#subscribeAuthenticated)
   * @see related  {@link subscribePublic client.subscribePublic}
   *
   * @category Subscription Management
   */
  public subscribeAuthenticated(
    /**
     * An array of {@link IDEXSubscribeTypeAuthenticated} subscription
     * objects.
     */
    subscriptions: IDEXSubscribeTypeAuthenticated[],
    /**
     * Optionally provide a `cid` property which will be returned in the response
     * so that you can correlate the response to the request.
     */
    cid?: string,
  ): this {
    this.throwIfTerminated();
    if (this.isPublicOnly) {
      throw new Error(
        '[subscribeAuthenticated] Cannot subscribe to authenticated subscriptions ' +
          'without providing the apiKey, apiSecret, and wallet options during client construction',
      );
    }
    this.subscribe(subscriptions, undefined, cid);

    return this;
  }

  /**
   * This method allows subscribing to IDEX's {@link IDEXSubscribeTypePublic public subscriptions}.
   *
   * - Use the {@link idex.SubscriptionNamePublic SubscriptionNamePublic} enum for IDE
   *   inline documentation and auto completion (see example)
   *
   * ---
   *
   * **Subscription Update Events:**
   *
   * - Receives a {@link idex.IDEXSubscriptionsListEvent IDEXSubscriptionsListEvent} WebSocket response via
   *   the {@link idex.WebSocketClient.onMessage WebSocketClient.onMessage} handler listing all active
   *   subscriptions.
   * - Begins receiving {@link idex.IDEXSubscriptionEvent IDEXSubscriptionEvent}'s for all subscribed
   *   subscriptions via the {@link idex.WebSocketClient.onMessage WebSocketClient.onMessage} handler.
   *
   * ---
   * @param subscriptions
   *  - An array of {@link IDEXSubscribeTypePublic} subscription objects.
   * @param markets
   *  - Optionally provide top-level markets.
   *    - Any {@link subscriptions} that **require but do not define** their own `markets`
   *    array will inherit this set of markets.
   *    - If a subscription in your {@link subscriptions} array defines its own
   *    {@link IDEXSubscribeType.markets markets} array, the top-level markets
   *    **will not be inherited**
   * @param cid
   *  - Optionally provide a `cid` property which will be returned in the response
   *    so that you can correlate the response to the request.
   * @returns
   *  - `this` to allow chaining with other methods or requests.
   * ---
   *
   * @example
   * ```typescript
   *  import {
   *    WebSocketClient,
   *    SubscriptionNamePublic,
   *    CandleInterval
   *  } from '@idexio/idex-sdk';
   *
   *  const client = new WebSocketClient();
   *
   *  await client.subscribePublic([
   *    // will inherit markets from the markets array
   *    { name: SubscriptionNamePublic.tickers },
   *    // overrides the top level markets array with its own
   *    {
   *      name: SubscriptionNamePublic.candles,
   *      interval: CandleInterval.ONE_MINUTE,
   *      // replaces the top-level markets when provided
   *      markets: ['ETH-USD', 'BTC-USD'],
   *    },
   *  ], ['ETH-USD'])
   * ```
   *
   * <br />
   *
   * ---
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v4.idex.io/classes/WebSocketClient.html#subscribePublic)
   * @see related  {@link subscribeAuthenticated client.subscribeAuthenticated}
   *
   * @category Subscription Management
   */
  public subscribePublic(
    subscriptions: IDEXSubscribeTypePublic[],
    markets?: string[],
    cid?: string,
  ): this {
    this.throwIfTerminated();
    this.subscribe(subscriptions, markets, cid);
    return this;
  }

  /**
   * Unsubscribes from a subscription or subscriptions
   *
   * ---
   *
   * **Subscription Update Events:**
   *
   * - Receives a {@link idex.IDEXSubscriptionsListEvent IDEXSubscriptionsListEvent} WebSocket response via
   *   the {@link idex.WebSocketClient.onMessage WebSocketClient.onMessage} handler listing all active
   *   subscriptions.
   *
   * ---
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v4.idex.io/classes/WebSocketClient.html#unsubscribe)
   * @see related {@link WebSocketRequestUnsubscribeSubscription}
   *
   * @category Subscription Management
   */
  public unsubscribe(
    subscriptions?: Array<
      | WebSocketRequestUnsubscribeShortNames
      | WebSocketRequestUnsubscribeSubscription
    >,
    markets?: string[],
    cid?: string,
  ): this {
    this.throwIfTerminated();
    return this.sendMessage({
      cid,
      method: WebSocketRequestMethod.unsubscribe,
      markets,
      subscriptions,
    });
  }

  /**
   * List all active subscriptions
   *
   * ---
   *
   * **Subscription Update Events:**
   *
   * - Receives a {@link idex.IDEXSubscriptionsListEvent IDEXSubscriptionsListEvent} WebSocket response via
   *   the {@link idex.WebSocketClient.onMessage WebSocketClient.onMessage} handler listing all active
   *   subscriptions.
   *
   * ---
   * @param cid
   *  - Optionally provide a `cid` property which will be returned in the response
   *    so that you can correlate the response to the request.
   * @returns
   *  - `this` to allow chaining with other methods or requests.
   * ---
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v4.idex.io/classes/WebSocketClient.html#listSubscriptions)
   *
   * @category Subscription Management
   */
  public listSubscriptions(cid?: string): this {
    this.throwIfTerminated();
    return this.sendMessage({
      method: WebSocketRequestMethod.subscriptions,
      cid,
    });
  }

  /* Private / Protected */

  /**
   * @internal
   */
  protected subscribe(
    subscriptions: IDEXSubscribeType[],
    markets?: string[],
    cid?: string,
  ): this {
    this.throwIfTerminated();
    this.subscribeRequest(subscriptions, markets, cid).catch((error) => {
      this.handleWebSocketError(error);
    });
    return this;
  }

  private async subscribeRequest(
    subscriptions: IDEXSubscribeType[],
    markets?: string[],
    cid?: string,
  ): Promise<this> {
    const wallet = this.#options.auth?.wallet ?? this.#options.wallet;

    // One of the two must be provided for authenticated subscriptions
    const websocketAuthTokenFetch =
      this.#websocketCustomAuthTokenFetcher ??
      this.#websocketAutoAuthTokenFetcher;

    const walletAuthAvailable = !!websocketAuthTokenFetch && !!wallet;

    const authSubscriptions = subscriptions.filter((subscription) =>
      guards.isWebSocketAuthenticatedSubscription(
        subscription,
        walletAuthAvailable,
      ),
    );

    // Public subscriptions can be subscribed all at once
    if (authSubscriptions.length === 0) {
      return this.sendMessage({
        cid,
        method: WebSocketRequestMethod.subscribe,
        markets,
        subscriptions,
      });
    }

    // For authenticated, we do require token manager
    if (!websocketAuthTokenFetch) {
      throw new Error(
        'WebSocket: `websocketAuthTokenFetch` is required for authenticated subscriptions',
      );
    }

    if (!wallet) {
      throw new Error(
        'WebSocket: Missing `wallet` for authenticated subscriptions',
      );
    }

    // For single wallet, send all subscriptions at once (also unauthenticated)
    return this.sendMessage({
      cid,
      method: WebSocketRequestMethod.subscribe,
      markets,
      subscriptions,
      token: await websocketAuthTokenFetch.call(
        this,
        this.#options as WebSocketClientOptionsWithFetch,
      ),
    });
  }

  private async createWebSocketIfNeeded(awaitConnect = false) {
    try {
      this.throwIfTerminated();
      this.#state.doNotReconnect = false;

      if (this.#ws) {
        return this.#ws;
      }

      const ws = new WebSocket(
        this.#options.baseWebSocketURL,
        isNode ?
          {
            headers: { 'User-Agent': 'kuma-sdk-js' },
          }
        : undefined,
      );

      this.#ws = ws;

      this.#ws.addEventListener(
        'message',
        this.handleWebSocketMessage.bind(this),
      );
      this.#ws.addEventListener('close', this.handleWebSocketClose.bind(this));
      this.#ws.addEventListener('error', this.handleWebSocketError.bind(this));
      this.#ws.addEventListener('open', this.handleWebSocketConnect.bind(this));

      if (awaitConnect) {
        await this.resolveWhenConnected();
      }

      return this.#ws;
    } catch (err) {
      if (this.terminated) {
        return;
      }

      let handlerErr = err;
      if (
        this.#options.shouldReconnectAutomatically &&
        !this.#state.doNotReconnect
      ) {
        this.reconnect();
        handlerErr = new Error(
          `Failed to connect: "${err.message}" - a reconnect attempt will be scheduled automatically`,
        );
      }

      if (this.#state.errorHandlers.size) {
        this.handleWebSocketError({
          error: handlerErr,
          type: 'connection_error',
          message: handlerErr.message,
          target: this.#ws!,
        });
      } else {
        throw handlerErr;
      }
    }

    return this.#ws!;
  }

  /**
   * Waits until the WebSocket is connected before returning
   *
   * @internal
   */
  private async resolveWhenConnected(timeout = 5_000): Promise<void> {
    const { ws } = this;

    if (!ws) {
      throw new Error(
        'Can not wait for WebSocket to connect, no WebSocket was found',
      );
    }

    if (ws.readyState === ws.OPEN) {
      return;
    }

    if (ws.readyState !== ws.CONNECTING) {
      throw new Error(
        'Can not wait for WebSocket to connect that is not open or connecting',
      );
    }

    await new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        if (this.terminated) {
          return;
        }
        if (this.#ws === ws) {
          this.disconnect();
          reject(new Error('timed out while waiting for WebSocket to connect'));
        }
      }, timeout);

      const listener = () => {
        clearTimeout(timeoutId);
        ws.removeEventListener('open', listener);
        resolve(true);
      };

      ws.addEventListener('open', listener);
    });
  }

  private handleWebSocketConnect(): void {
    this.resetReconnectionState();
    this.startPinging();
  }

  // we need to ping from the client side to detect client-side socket closures which would otherwise
  // not generate any close notifications.  This also aids against idle timeouts being hit.
  // we can only send a ping from node-based environments, on browsers we need to instead use
  // a standard message to accomplish this.
  //
  // the server will always only reply to custom ping messages with native pong responses so the
  // client will not recieve any events in the browser when they occur.
  private startPinging() {
    this.stopPinging();

    if (!this.isConnected || this.terminated) {
      return;
    }

    try {
      const { ws } = this;

      if (!ws) {
        return;
      }

      if (typeof ws.ping === 'function') {
        ws.ping(JSON.stringify({ method: WebSocketRequestMethod.ping }));
      } else {
        ws.send(JSON.stringify({ method: WebSocketRequestMethod.ping }));
      }
    } finally {
      if (this.isConnected) {
        this.#state.pingTimeoutId = setTimeout(
          this.startPinging.bind(this),
          WEBSOCKET_PING_TIMEOUT_MS,
        );
      }
    }
  }

  private stopPinging() {
    clearTimeout(this.#state.pingTimeoutId);
    this.#state.pingTimeoutId = undefined;
  }

  private handleWebSocketClose(event: WebSocket.CloseEvent): void {
    this.stopPinging();
    this.#ws = null;
    this.#state.disconnectHandlers.forEach((listener) =>
      listener(event.code, event.reason),
    );

    if (
      !this.terminated &&
      this.#options.shouldReconnectAutomatically &&
      !this.#state.doNotReconnect
    ) {
      this.reconnect();
    }
  }

  private handleWebSocketError(event: WebSocket.ErrorEvent): void {
    this.#state.errorHandlers.forEach((listener) => listener(event));
  }

  private handleWebSocketMessage(event: WebSocket.MessageEvent): void {
    if (this.terminated) {
      return;
    }

    if (!event || !event.data) {
      throw new Error('Malformed response data'); // Shouldn't happen
    }

    const message = transformWebsocketShortResponseMessage(
      JSON.parse(String(event.data)),
    );

    this.#state.messageHandlers.forEach((listener) => listener(message));
  }

  private cancelReconnect() {
    clearTimeout(this.#state.reconnectTimeoutId);
    this.#state.isReconnecting = false;
    this.#state.reconnectTimeoutId = undefined;
  }

  private reconnect(): void {
    // Reconnect with exponential backoff
    if (
      !this.#state.isReconnecting &&
      !this.#state.doNotReconnect &&
      !this.terminated
    ) {
      this.disconnect();
      this.#state.doNotReconnect = false;
      this.#state.isReconnecting = true;

      const backoffSeconds = 2 ** this.#state.reconnectAttempt;
      this.#state.reconnectAttempt += 1;
      this.log('info', `Reconnecting after ${backoffSeconds} seconds...`);

      this.#state.reconnectTimeoutId = setTimeout(() => {
        this.#state.reconnectTimeoutId = undefined;
        this.connect(false);
        this.#state.isReconnecting = false;
      }, backoffSeconds * 1000);
    }
  }

  private log(
    level: 'warn' | 'error' | 'log' | 'info',
    ...args: Parameters<typeof console.log>
  ) {
    if (this.#options.logger) {
      this.#options.logger(
        `[WebSocketClient] | ${level.toUpperCase()} | clientId:${this.#options.clientId} | `,
        ...args,
      );
    }
  }

  private resetReconnectionState(): void {
    this.#state.reconnectAttempt = 0;
  }

  private sendMessage(payload: WebSocketRequest): this {
    const { ws } = this;

    this.throwIfDisconnected(ws);

    ws.send(JSON.stringify(payload));

    return this;
  }

  private throwIfDisconnected(
    _webSocket: WebSocket | null,
  ): asserts _webSocket is WebSocket {
    if (!this.isConnected) {
      throw new Error(
        'Websocket not yet connected, await connect() method first',
      );
    }
  }
}

/**
 * @internal
 */
function createDefaultWebSocketTokenFetcher({
  auth,
  baseRestApiURL,
  sandbox,
  wallet,
}: WebSocketClientOptionsWithAPIKey & WebSocketClientOptionsInitialized) {
  const client = new RestAuthenticatedClient({
    apiKey: auth.apiKey,
    apiSecret: auth.apiSecret,
    baseURL: baseRestApiURL,
    sandbox,
  });

  return async function autoWebSocketTokenFetcher() {
    return client.getWsToken({
      nonce: uuidv1(),
      wallet: auth.wallet ?? wallet,
    });
  };
}
