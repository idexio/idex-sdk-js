import WebSocket from 'isomorphic-ws';

import * as types from '../../types';

import * as constants from '../../constants';
import WebsocketTokenManager from './tokenManager';
import { transformMessage } from './transform';
import { WebSocketRequestAuthenticatedSubscription } from '../../types';
import { isDefinedFilter } from '../../utils';

const userAgent = 'idex-sdk-js';

export type ConnectListener = () => unknown;
export type DisconnectListener = () => unknown;
export type ErrorListener = (errorEvent: WebSocket.ErrorEvent) => unknown;
export type ResponseListener = (
  response: types.WebSocketResponseResponse,
) => unknown;

/**
 * WebSocket API client options
 *
 * @typedef {Object} WebSocketClientOptions
 * @property {boolean} [sandbox] - <br />
 *  Should the WebSocket connect to the {@link https://docs.idex.io/#sandbox | Sandbox environment}?
 *  **Note**: This must be set to `true` during the Sandbox preview.
 * @property {function} [websocketAuthTokenFetch] - <br />
 *  Authenticated Rest API client fetch token call (`/wsToken`)
 *  SDK Websocket client will then automatically handle Websocket token generation and refresh.
 *  You can omit this when using only public websocket subscription.
 *  Example `wallet => authenticatedClient.getWsToken(uuidv1(), wallet)`
 *  See [API specification](https://docs.idex.io/#websocket-authentication-endpoints)
 * @property {boolean} [shouldReconnectAutomatically] -
 *  If true, automatically reconnects when connection is closed by the server or network errors
 */
export interface WebSocketClientOptions {
  sandbox?: boolean;
  baseURL?: string;
  websocketAuthTokenFetch?: (wallet: string) => Promise<string>;
  shouldReconnectAutomatically?: boolean;
}

/**
 * WebSocket API client
 *
 * @example
 * import * as idex from '@idexio/idex-sdk';
 *
 * const config = {
 *   baseURL: 'wss://ws.idex.io',
 *   shouldReconnectAutomatically: true,
 * }
 * const webSocketClient = new idex.WebSocketClient(
 *   config.baseURL,
 *   // Optional, but required for authenticated wallet subscriptions
 *   wallet => authenticatedClient.getWsToken(uuidv1(), wallet),
 *   config.shouldReconnectAutomatically,
 * );
 * await webSocketClient.connect();
 *
 * @param {WebSocketClientOptions} options
 */
export class WebSocketClient {
  private baseURL: string;

  private shouldReconnectAutomatically: boolean;

  private reconnectAttempt: number;

  private connectListeners: Set<ConnectListener>;

  private disconnectListeners: Set<DisconnectListener>;

  private errorListeners: Set<ErrorListener>;

  private responseListeners: Set<ResponseListener>;

  private webSocket: null | WebSocket;

  private webSocketTokenManager?: WebsocketTokenManager;

  /**
   * Set to true when the reconnect logic should not be run.
   * @private
   */
  private doNotReconnect = false;

  constructor(options: WebSocketClientOptions) {
    const baseURL =
      options.baseURL ?? options.sandbox
        ? constants.SANDBOX_WEBSOCKET_API_BASE_URL
        : constants.LIVE_WEBSOCKET_API_BASE_URL;

    if (!baseURL) {
      throw new Error('Must set sandbox to true');
    }

    this.baseURL = baseURL;

    this.shouldReconnectAutomatically =
      options.shouldReconnectAutomatically ?? false;

    this.reconnectAttempt = 0;

    this.connectListeners = new Set();
    this.disconnectListeners = new Set();
    this.errorListeners = new Set();
    this.responseListeners = new Set();

    if (options.websocketAuthTokenFetch) {
      this.webSocketTokenManager = new WebsocketTokenManager(
        options.websocketAuthTokenFetch,
      );
    }
  }

  /* Connection management */

  public async connect(): Promise<void> {
    if (this.isConnected()) {
      return;
    }

    this.doNotReconnect = false;

    const webSocket = this.createWebSocketIfNeeded();

    await new Promise((resolve) => {
      (function waitForOpen(ws: WebSocket): void {
        if (ws.readyState === WebSocket.OPEN) {
          return resolve();
        }
        setTimeout(() => waitForOpen(ws), 100);
      })(webSocket);
    });

    this.resetReconnectionState();
    this.connectListeners.forEach((listener) => listener());
  }

  public disconnect(): void {
    if (!this.webSocket) {
      return; // Already disconnected
    }

    // TODO wait for buffer to flush
    this.destroyWebSocket();
    this.disconnectListeners.forEach((listener) => listener());
  }

  public isConnected(): boolean {
    return this.webSocket?.readyState === WebSocket.OPEN;
  }

  /* Event listeners */

  public onConnect(listener: ConnectListener): void {
    this.connectListeners.add(listener);
  }

  public onDisconnect(listener: ConnectListener): void {
    this.disconnectListeners.add(listener);
  }

  public onError(listener: ErrorListener): void {
    this.errorListeners.add(listener);
  }

  public onResponse(listener: ResponseListener): void {
    this.responseListeners.add(listener);
  }

  /* Subscription management */

  public listSubscriptions(): void {
    this.sendMessage({ method: 'subscriptions' });
  }

  public async subscribe(
    subscriptions: types.WebSocketRequestSubscription[],
    cid?: string,
  ): Promise<void> {
    const [authSubscriptions, publicSubscriptions] = splitSubscriptions(
      subscriptions,
    );

    const { webSocketTokenManager } = this;

    if (publicSubscriptions.length) {
      this.sendMessage({
        cid,
        method: 'subscribe',
        subscriptions: publicSubscriptions,
      });
    }

    if (authSubscriptions.length === 0) {
      return;
    }

    await Promise.all(
      authSubscriptions.map(
        async ({ wallet: walletAddress, ...subscription }) => {
          if (!webSocketTokenManager) {
            throw new Error(
              '`websocketAuthTokenFetch` is required for authenticated subscriptions',
            );
          }

          if (!walletAddress) {
            throw new Error(
              `WebSocket: "${subscription.name}" subscription invalid, authenticated subscriptions require a wallet parameter.`,
            );
          }

          this.sendMessage({
            cid,
            method: 'subscribe',
            subscriptions: [subscription],
            token: await webSocketTokenManager.getToken(walletAddress),
          });
        },
      ),
    );
  }

  /**
   * Strictly typed subscribe which only can be used on authenticated subscriptions.
   *
   * For this methods you need to pass `websocketAuthTokenFetch` to the websocket constructor.
   * Library will automatically refresh user's wallet auth tokens for you.
   *
   * See {@link https://docs.idex.io/#get-authentication-token|API specification}
   */
  public subscribeAuthenticated(
    subscriptions: types.WebSocketRequestAuthenticatedSubscription[],
  ): void {
    this.subscribe(subscriptions);
  }

  /**
   * Subscribe which only can be used on non-authenticated subscriptions
   */
  public subscribeUnauthenticated(
    subscriptions: types.WebSocketRequestUnauthenticatedSubscription[],
  ): void {
    this.subscribe(subscriptions);
  }

  public unsubscribe(
    subscriptions: types.WebSocketRequestUnsubscribeSubscription[],
  ): void {
    this.sendMessage({
      method: 'unsubscribe',
      subscriptions,
    });
  }

  /* Private */

  private createWebSocketIfNeeded(): WebSocket {
    this.doNotReconnect = false;
    if (this.webSocket) {
      return this.webSocket;
    }
    const webSocket = new WebSocket(this.baseURL, {
      headers: { 'User-Agent': userAgent },
    });
    webSocket.onmessage = this.handleWebSocketMessage.bind(this);
    webSocket.onclose = this.handleWebSocketClose.bind(this);
    webSocket.onerror = this.handleWebSocketError.bind(this);
    this.webSocket = webSocket;
    return webSocket;
  }

  private destroyWebSocket(): void {
    if (this.webSocket) {
      // TODO wait for buffer to flush
      this.doNotReconnect = true;
      this.webSocket.close();
      this.webSocket = null;
    }
  }

  private handleWebSocketClose(): void {
    this.webSocket = null;
    this.disconnectListeners.forEach((listener) => listener());

    if (this.shouldReconnectAutomatically && !this.doNotReconnect) {
      // TODO: exponential backoff
      this.reconnect();
    }
  }

  private handleWebSocketError(event: WebSocket.ErrorEvent): void {
    this.errorListeners.forEach((listener) => listener(event));
  }

  private handleWebSocketMessage(event: WebSocket.MessageEvent): void {
    if (typeof event.data !== 'string') {
      throw new Error('Malformed response data'); // Shouldn't happen
    }
    const message = transformMessage(JSON.parse(event.data));
    this.responseListeners.forEach((listener) => listener(message));
  }

  private reconnect(): void {
    this.doNotReconnect = false;
    // Reconnect with exponential backoff
    const backoffSeconds = 2 ** this.reconnectAttempt;
    this.reconnectAttempt += 1;
    console.log(`Reconnecting after ${backoffSeconds} seconds...`);
    setTimeout(this.connect.bind(this), backoffSeconds * 1000);
  }

  private resetReconnectionState(): void {
    this.reconnectAttempt = 0;
  }

  private sendMessage(payload: types.WebSocketRequest): void {
    const { webSocket } = this;

    this.throwIfDisconnected(webSocket);

    webSocket.send(JSON.stringify(payload));
  }

  private throwIfDisconnected(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    webSocket: WebSocketClient['webSocket'],
  ): asserts webSocket is WebSocket {
    if (!this.isConnected()) {
      throw new Error(
        'Websocket not yet connected, await connect() method first',
      );
    }
  }
}

/**
 * Take in subscriptions and return array split by authenticated or unauthenticated
 * @private
 */
function splitSubscriptions(
  subscriptions: types.WebSocketRequestSubscription[],
) {
  return subscriptions.reduce(
    (arr, subscription) => {
      if (isAuthenticatedSubscription(subscription)) {
        arr[0].push(subscription);
      } else {
        arr[1].push(subscription);
      }
      return arr;
    },
    [
      [] as types.WebSocketRequestAuthenticatedSubscription[],
      [] as types.WebSocketRequestUnauthenticatedSubscription[],
    ] as const,
  );
}

function isAuthenticatedSubscription(
  subscription: types.WebSocketRequestSubscription,
): subscription is WebSocketRequestAuthenticatedSubscription {
  return Object.keys(
    types.WebSocketRequestAuthenticatedSubscriptionName,
  ).includes(subscription.name);
}
