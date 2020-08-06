import WebSocket from 'isomorphic-ws';

import * as types from '../../types';

import * as constants from '../../constants';
import WebsocketTokenManager from './tokenManager';
import { transformMessage } from './transform';
import { WebSocketRequestAuthenticatedSubscription } from '../../types';

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
 * @property {boolean} sandbox - Must be set to true
 * @property {function} websocketAuthTokenFetch - Authenticated Rest API client fetch token call (`/wsToken`)
 *  SDK Websocket client will then automatically handle Websocket token generation and refresh.
 *  You can omit this when using only public websocket subscription.
 *  Example `wallet => authenticatedClient.getWsToken(uuidv1(), wallet)`
 *  See [API specification](https://docs.idex.io/#websocket-authentication-endpoints)
 * @property {boolean} shouldReconnectAutomatically - If true, automatically reconnects when connection is closed by the server or network errors
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
 * import * as idex from '@idexio/idex-node';
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
export default class WebSocketClient {
  private baseURL: string;

  private shouldReconnectAutomatically: boolean;

  private reconnectAttempt: number;

  private connectListeners: Set<ConnectListener>;

  private disconnectListeners: Set<DisconnectListener>;

  private errorListeners: Set<ErrorListener>;

  private responseListeners: Set<ResponseListener>;

  private webSocket: WebSocket;

  private webSocketTokenManager?: WebsocketTokenManager;

  constructor(options: WebSocketClientOptions) {
    const baseURL = options.sandbox
      ? constants.SANDBOX_WEBSOCKET_API_BASE_URL
      : options.baseURL;
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

    if (!this.webSocket) {
      this.createWebSocket();
    }

    await new Promise((resolve) => {
      (function waitForOpen(ws: WebSocket): void {
        if (ws.readyState === WebSocket.OPEN) {
          return resolve();
        }
        setTimeout(() => waitForOpen(ws), 100);
      })(this.webSocket);
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

    const uniqueWallets = Array.from(
      new Set(
        authSubscriptions
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .filter((subscription) => (subscription as any).wallet)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((subscription) => (subscription as any).wallet),
      ),
    );

    if (authSubscriptions.length && !this.webSocketTokenManager) {
      throw new Error(
        '`websocketAuthTokenFetch` is required for authenticated subscriptions',
      );
    }

    if (authSubscriptions.length && !uniqueWallets.length) {
      throw new Error(
        'WebSocket: Missing wallet for authenticated subscription',
      );
    }

    if (authSubscriptions.length === 0) {
      this.sendMessage({
        cid,
        method: 'subscribe',
        subscriptions,
      });
      return;
    }

    // Prepare all auth tokens for subscriptions
    await Promise.all(
      uniqueWallets.map((wallet) =>
        this.webSocketTokenManager.getToken(wallet),
      ),
    );

    if (uniqueWallets.length === 1) {
      this.sendMessage({
        cid,
        method: 'subscribe',
        subscriptions,
        token: this.webSocketTokenManager.getLastCachedToken(uniqueWallets[0]),
      });
      return;
    }

    // For more wallets we need to split subscriptions
    subscriptions.forEach((subscription) => {
      // TODO: Does this need to be any?
      this.sendMessage({
        cid,
        method: 'subscribe',
        subscriptions: [subscription],
        token: isAuthenticatedSubscription(subscription)
          ? this.webSocketTokenManager.getLastCachedToken(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (subscription as any).wallet,
            )
          : undefined,
      });
    });
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

  private createWebSocket(): void {
    this.webSocket = new WebSocket(this.baseURL, {
      headers: { 'User-Agent': userAgent },
    });
    this.webSocket.onmessage = this.handleWebSocketMessage.bind(this);
    this.webSocket.onclose = this.handleWebSocketClose.bind(this);
    this.webSocket.onerror = this.handleWebSocketError.bind(this);
  }

  private destroyWebSocket(): void {
    // TODO wait for buffer to flush
    this.webSocket.onclose = null; // Do not reconnect
    this.webSocket.close();
    this.webSocket = null;
  }

  private handleWebSocketClose(): void {
    this.webSocket = null;
    this.disconnectListeners.forEach((listener) => listener());

    if (this.shouldReconnectAutomatically) {
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
    this.throwIfDisconnected();

    this.webSocket.send(JSON.stringify(payload));
  }

  private throwIfDisconnected(): void {
    if (!this.isConnected()) {
      throw new Error(
        'Websocket not yet connected, await connect() method first',
      );
    }
  }
}

/**
 * Take in subscriptions and return array split by authenticated or unauthenticated
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
