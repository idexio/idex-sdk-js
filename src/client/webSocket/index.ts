import WebSocket, { CONNECTING, OPEN } from 'isomorphic-ws';

import type {
  AuthTokenWebSocketRequestAuthenticatedSubscription,
  AuthTokenWebSocketRequestSubscription,
  MultiverseChain,
  WebSocketRequest,
  WebSocketRequestSubscription,
  WebSocketRequestUnauthenticatedSubscription,
  WebSocketRequestUnsubscribeShortNames,
  WebSocketRequestUnsubscribeSubscription,
  WebSocketResponse,
} from '../../types';
import { isWebSocketAuthenticatedSubscription } from '../../types';
import * as constants from '../../constants';
import { isNode } from '../../utils';

import { transformWebsocketShortResponseMessage } from './transform';
import { removeWalletFromSdkSubscription } from './utils';

export { transformWebsocketShortResponseMessage };

export type WebSocketListenerConnect = () => unknown;

export type WebSocketListenerDisconnect = (
  code: number,
  reason: string,
) => unknown;

export type WebSocketListenerError = (error: Error) => unknown;

export type WebSocketListenerResponse = (
  response: WebSocketResponse,
) => unknown;

const NODE_USER_AGENT = 'idex-sdk-js';

// custom ping timeout in ms - how often do we ping the server
// to check for liveness?
const PING_TIMEOUT = 30000;

/**
 * WebSocket API client options
 *
 * @typedef {Object} WebSocketClientOptions
 * @property {boolean} [sandbox] - <br />
 *  Should the WebSocket connect to the {@link https://docs.idex.io/#sandbox|Sandbox Environment}?
 *  **Note**: This must be set to `true` during the Sandbox preview.
 * @property {function} [websocketAuthTokenFetch] - <br />
 *  Authenticated Rest API client fetch token call (`/wsToken`)
 *  SDK Websocket client will then automatically handle Websocket token generation and refresh.
 *  You can omit this when using only public websocket subscription.
 *  Example `wallet => authenticatedClient.getWsToken(uuidv1(), wallet)`
 *  See [API specification](https://docs.idex.io/#websocket-authentication-endpoints)
 * @property {boolean} [shouldReconnectAutomatically] -
 *  If true, automatically reconnects when connection is closed by the server or network errors
 * @property {string} [pathSubscription] -
 *  Path subscriptions are a quick and easy way to start receiving push updates. Eg. {market}@{subscription}_{option}
 * @property {number} [connectTimeout] -
 *  A timeout (in milliseconds) before failing while trying to connect to the WebSocket. Defaults to 5000.
 */
export interface WebSocketClientOptions {
  sandbox?: boolean;
  baseURL?: string;
  pathSubscription?: string;
  websocketAuthTokenFetch?: (wallet: string) => Promise<string>;
  shouldReconnectAutomatically?: boolean;
  connectTimeout?: number;
  multiverseChain?: MultiverseChain;
}

/**
 * WebSocket API client
 *
 * @example
 * import * as idex from '@idexio/idex-sdk';
 *
 * const webSocketClient = new idex.WebSocketClient({
 *  sandbox: true,
 *  shouldReconnectAutomatically: true,
 *  websocketAuthTokenFetch: authenticatedClient.getWsToken(uuidv1(), wallet),
 * });
 *
 * await webSocketClient.connect();
 *
 * @param {WebSocketClientOptions} options
 */
export class WebSocketClient<
  C extends WebSocketClientOptions = WebSocketClientOptions
> {
  private state = {
    /**
     * Set to true when the reconnect logic should not be run.
     * @private
     */
    doNotReconnect: false,
    /**
     * Used to track the number of reconnect attempts for exponential backoff
     * @private
     */
    reconnectAttempt: 0,
    connectTimeout: 5000,
    /**
     * When the ping timeout is scheduled, it saves its id to this property.  Since
     * the type from Node & dom are not compatible, using it may require casting
     *
     * @example
     * clearTimeout(this.state.pingTimeoutId as number);
     *
     * @private
     */
    pingTimeoutId: undefined as undefined | number | NodeJS.Timeout,
    connectListeners: new Set<WebSocketListenerConnect>(),
    disconnectListeners: new Set<WebSocketListenerDisconnect>(),
    errorListeners: new Set<WebSocketListenerError>(),
    responseListeners: new Set<WebSocketListenerResponse>(),
  };

  public readonly config: Readonly<{
    multiverseChain: C['multiverseChain'] extends MultiverseChain
      ? C['multiverseChain']
      : 'eth';
    baseURL: string;
    sandbox: boolean;
    connectTimeout: number;
    pathSubscription?: string | null;
    websocketAuthTokenFetch?: WebSocketClientOptions['websocketAuthTokenFetch'];
  }>;

  public shouldReconnectAutomatically = false;

  private ws: null | WebSocket = null;

  constructor(options: WebSocketClientOptions) {
    const { multiverseChain = 'eth', sandbox = false } = options;

    const baseURL =
      options.baseURL ??
      constants.URLS[options.sandbox ? 'sandbox' : 'production']?.[
        multiverseChain
      ]?.websocket;

    if (!baseURL) {
      throw new Error(
        `Invalid configuration, baseURL could not be derived (sandbox? ${String(
          sandbox,
        )}) (chain: ${multiverseChain})`,
      );
    }

    this.config = Object.freeze({
      sandbox,
      baseURL,
      multiverseChain: multiverseChain as this['config']['multiverseChain'],
      connectTimeout:
        typeof options.connectTimeout === 'number'
          ? options.connectTimeout
          : 5000,
      pathSubscription: options.pathSubscription ?? null,
      websocketAuthTokenFetch: options.websocketAuthTokenFetch,
    } as const);

    if (options.shouldReconnectAutomatically) {
      this.shouldReconnectAutomatically = true;
    }
  }

  /* Connection management */

  public async connect(awaitConnected = true): Promise<this> {
    if (this.isConnected()) {
      return this;
    }

    this.state.doNotReconnect = false;

    // connect and await connection to succeed
    await this.createWebSocketIfNeeded(awaitConnected);

    this.state.connectListeners.forEach((listener) => listener());

    return this;
  }

  public disconnect(): this {
    this.stopPinging();

    if (!this.ws) {
      return this; // Already disconnected
    }

    this.state.doNotReconnect = true;
    this.ws.close();
    this.ws = null;

    return this;
  }

  public isConnected(): boolean {
    return this.ws?.readyState === OPEN;
  }

  /* Event listeners */

  public onConnect(listener: WebSocketListenerConnect): this {
    this.state.connectListeners.add(listener);
    return this;
  }

  public onDisconnect(listener: WebSocketListenerDisconnect): this {
    this.state.disconnectListeners.add(listener);
    return this;
  }

  public onError(listener: WebSocketListenerError): this {
    this.state.errorListeners.add(listener);
    return this;
  }

  public onResponse(listener: WebSocketListenerResponse): this {
    this.state.responseListeners.add(listener);
    return this;
  }

  /* Subscription management */

  public listSubscriptions(): this {
    return this.sendMessage({ method: 'subscriptions' });
  }

  /**
   * Subscribe to a given set of subscriptions, optionally providing a list of top level
   * markets or a cid property.
   *
   * @see {@link https://docs.idex.io/#websocket-subscriptions|WebSocket Subscriptions}
   *
   * @param {AuthTokenWebSocketRequestAuthenticatedSubscription[]} subscriptions
   * @param {string[]} [markets] - Optionally provide top level markets
   * @param {string} [cid] - A custom identifier to identify the matching response
   */
  public subscribe(
    subscriptions: Array<
      | AuthTokenWebSocketRequestSubscription
      | WebSocketRequestUnauthenticatedSubscription['name']
    >,
    markets?: string[],
    cid?: string,
  ): this {
    this.subscribeRequest(subscriptions, markets, cid).catch((error) => {
      this.handleWebSocketError(error);
    });
    return this;
  }

  /**
   * Strictly typed subscribe which only can be used on authenticated subscriptions.
   *
   * For this methods you need to pass `websocketAuthTokenFetch` to the websocket constructor.
   * Library will automatically refresh user's wallet auth tokens for you.
   *
   * See {@link https://docs.idex.io/#get-authentication-token|API specification}
   *
   * @param {AuthTokenWebSocketRequestAuthenticatedSubscription[]} subscriptions
   * @param {string[]} [markets] - Optionally provide top level markets
   * @param {string} [cid] - A custom identifier to identify the matching response
   */
  public subscribeAuthenticated(
    subscriptions: AuthTokenWebSocketRequestAuthenticatedSubscription[],
    markets?: string[],
    cid?: string,
  ): this {
    this.subscribe(subscriptions, markets, cid);
    return this;
  }

  /**
   * Subscribe which only can be used on non-authenticated subscriptions
   *
   * @param {WebSocketRequestUnauthenticatedSubscription[]} subscriptions
   * @param {string[]} [markets] - Optionally provide top level markets
   * @param {string} [cid] - A custom identifier to identify the matching response
   */
  public subscribeUnauthenticated(
    subscriptions: WebSocketRequestUnauthenticatedSubscription[],
    markets?: string[],
    cid?: string,
  ): this {
    this.subscribe(subscriptions, markets, cid);
    return this;
  }

  public unsubscribe(
    subscriptions?: Array<
      | WebSocketRequestUnsubscribeSubscription
      | WebSocketRequestUnsubscribeShortNames
    >,
    markets?: string[],
    cid?: string,
  ): this {
    return this.sendMessage({
      cid,
      method: 'unsubscribe',
      markets,
      subscriptions,
    });
  }

  /* Private */

  private async subscribeRequest(
    subscriptions: Array<
      | AuthTokenWebSocketRequestSubscription
      | WebSocketRequestUnauthenticatedSubscription['name']
    >,
    markets?: string[],
    cid?: string,
  ): Promise<this> {
    const authSubscriptions = subscriptions.filter(
      isWebSocketAuthenticatedSubscription,
    );

    // Public subscriptions can be subscribed all at once
    if (authSubscriptions.length === 0) {
      return this.sendMessage({
        cid,
        method: 'subscribe',
        markets,
        subscriptions,
      });
    }

    const { websocketAuthTokenFetch } = this.config;

    // For authenticated, we do require token manager
    if (!websocketAuthTokenFetch) {
      throw new Error(
        'WebSocket: `websocketAuthTokenFetch` is required for authenticated subscriptions',
      );
    }

    const uniqueWallets = Array.from(
      authSubscriptions.reduce((wallets, subscription) => {
        if (subscription.wallet) {
          wallets.add(subscription.wallet);
        }
        return wallets;
      }, new Set<string>()),
    );

    if (!uniqueWallets.length) {
      throw new Error(
        'WebSocket: Missing `wallet` for authenticated subscription',
      );
    }

    // For single wallet, send all subscriptions at once (also unauthenticated)
    if (uniqueWallets.length === 1) {
      return this.sendMessage({
        cid,
        method: 'subscribe',
        markets,
        subscriptions: subscriptions.map(removeWalletFromSdkSubscription),
        token: await websocketAuthTokenFetch(uniqueWallets[0]),
      });
    }

    // In specific case when user subscribed with more than 1 wallet...

    // Subscribe public subscriptions all at once
    const publicSubscriptions = subscriptions.filter(isPublicSubscription);

    if (publicSubscriptions.length > 0) {
      this.sendMessage({
        cid,
        method: 'subscribe',
        markets,
        subscriptions: publicSubscriptions,
      });
    }

    // Now prepare all auth tokens, so we can subscribe all authenticated at "once"
    const preparedTokensByWalletIndex = await Promise.all(
      uniqueWallets.map((wallet) => websocketAuthTokenFetch(wallet)),
    );

    // Send multiple wallets subscriptions grouped by wallet
    uniqueWallets.forEach((wallet, walletIndex) => {
      this.sendMessage({
        cid,
        method: 'subscribe',
        markets,
        subscriptions: authSubscriptions
          .filter((item) => item.wallet === wallet)
          .map(removeWalletFromSdkSubscription),
        token: preparedTokensByWalletIndex[walletIndex],
      });
    });

    return this;
  }

  private async createWebSocketIfNeeded(
    awaitConnect = false,
  ): Promise<WebSocket> {
    try {
      this.state.doNotReconnect = false;

      if (this.ws) {
        return this.ws;
      }

      this.ws = new WebSocket(
        this.config.pathSubscription
          ? `${this.config.baseURL}/${this.config.pathSubscription}`
          : this.config.baseURL,
        isNode
          ? {
              headers: { 'User-Agent': NODE_USER_AGENT },
            }
          : undefined,
      );

      this.ws.addEventListener(
        'message',
        this.handleWebSocketMessage.bind(this),
      );
      this.ws.addEventListener('close', this.handleWebSocketClose.bind(this));
      this.ws.addEventListener('error', this.handleWebSocketError.bind(this));
      this.ws.addEventListener('open', this.handleWebSocketConnect.bind(this));

      if (awaitConnect) {
        await this.resolveWhenConnected();
      }

      return this.ws;
    } catch (err) {
      if (this.shouldReconnectAutomatically) {
        this.reconnect();
        throw new Error(
          `Failed to connect: "${err.message}" - a reconnect attempt will be scheduled automatically`,
        );
      }
      throw err;
    }
  }

  /**
   * Waits until the WebSocket is connected before returning
   */
  private async resolveWhenConnected(
    timeout = this.config.connectTimeout,
  ): Promise<void> {
    const { ws } = this;

    if (!ws) {
      throw new Error(
        'Can not wait for WebSocket to connect, no WebSocket was found',
      );
    }

    if (ws.readyState === OPEN) {
      return;
    }

    if (ws.readyState !== CONNECTING) {
      throw new Error(
        'Can not wait for WebSocket to connect that is not open or connecting',
      );
    }

    await new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        if (this.ws === ws) {
          this.disconnect();
        }
        reject(new Error('timed out while waiting for WebSocket to connect'));
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

    if (!this.isConnected()) {
      return;
    }

    try {
      const { ws } = this;

      if (!ws) {
        return;
      }

      if (typeof ws.ping === 'function') {
        ws.ping(JSON.stringify({ method: 'ping' }));
      } else {
        ws.send(JSON.stringify({ method: 'ping' }));
      }
    } finally {
      if (this.isConnected()) {
        this.state.pingTimeoutId = setTimeout(
          this.startPinging.bind(this),
          PING_TIMEOUT,
        );
      }
    }
  }

  private stopPinging() {
    if (this.state.pingTimeoutId !== undefined) {
      clearTimeout(this.state.pingTimeoutId as number);
    }

    this.state.pingTimeoutId = undefined;
  }

  private handleWebSocketClose(event: WebSocket.CloseEvent): void {
    this.stopPinging();
    this.ws = null;
    this.state.disconnectListeners.forEach((listener) =>
      listener(event.code, event.reason),
    );

    if (this.shouldReconnectAutomatically && !this.state.doNotReconnect) {
      this.reconnect();
    }
  }

  private handleWebSocketError(event: WebSocket.ErrorEvent): void {
    this.state.errorListeners.forEach((listener) => listener(event.error));
  }

  private handleWebSocketMessage(event: WebSocket.MessageEvent): void {
    if (!event || !event.data) {
      throw new Error('Malformed response data'); // Shouldn't happen
    }

    const message = transformWebsocketShortResponseMessage(
      JSON.parse(String(event.data)),
    );
    this.state.responseListeners.forEach((listener) => listener(message));
  }

  private reconnect(): void {
    this.disconnect();
    this.state.doNotReconnect = false;
    // Reconnect with exponential backoff
    const backoffSeconds = 2 ** this.state.reconnectAttempt;
    this.state.reconnectAttempt += 1;
    console.log(`Reconnecting after ${backoffSeconds} seconds...`);
    setTimeout(this.connect.bind(this), backoffSeconds * 1000);
  }

  private resetReconnectionState(): void {
    this.state.reconnectAttempt = 0;
  }

  private sendMessage(payload: WebSocketRequest): this {
    const { ws } = this;

    this.throwIfDisconnected(ws);

    ws.send(JSON.stringify(payload));

    return this;
  }

  private throwIfDisconnected(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    webSocket: WebSocketClient['ws'],
  ): asserts webSocket is WebSocket {
    if (!this.isConnected()) {
      throw new Error(
        'Websocket not yet connected, await connect() method first',
      );
    }
  }
}

// We use this instead of the other type guards to account for unhandled subscription
// types
function isPublicSubscription(
  subscription:
    | WebSocketRequestUnauthenticatedSubscription['name']
    | WebSocketRequestSubscription,
): boolean {
  return !isWebSocketAuthenticatedSubscription(subscription);
}
