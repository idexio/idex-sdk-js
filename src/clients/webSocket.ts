import WebSocket from 'isomorphic-ws';

import * as types from '../types';

/**
 * WebSocket API client
 *
 * ```typescript
 * import * as idex from '@idexio/idex-node';
 *
 * const config = {
 *   baseURL: 'webSockets://webSocket.idex.io',
 * }
 * const webSocketClient = new idex.WebSocketClient(config.baseURL);
 * ```
 */

export type ConnectListener = () => unknown;
export type DisconnectListener = () => unknown;
export type ErrorListener = (errorEvent: WebSocket.ErrorEvent) => unknown;
export type ResponseListener = (response: types.webSocket.Response) => unknown;

export default class WebSocketClient {
  private baseURL: string;

  private reconnectAttempt: number;

  private connectListeners: Set<ConnectListener>;

  private disconnectListeners: Set<DisconnectListener>;

  private errorListeners: Set<ErrorListener>;

  private responseListeners: Set<ResponseListener>;

  private webSocket: WebSocket;

  constructor(baseURL: string) {
    this.baseURL = baseURL;

    this.reconnectAttempt = 0;

    this.connectListeners = new Set();
    this.disconnectListeners = new Set();
    this.errorListeners = new Set();
    this.responseListeners = new Set();
  }

  /* Connection management */

  public async connect(): Promise<void> {
    try {
      if (this.webSocket) {
        // Sanity check, should never happen
        if (!this.isConnected()) {
          throw new Error('Unexpected internal state');
        }

        return; // Already connected
      }

      this.createWebSocket();

      // Add a one-time listener for the open event
      await new Promise(resolve => {
        this.webSocket.onopen = (): void => {
          this.webSocket.onopen = undefined;
          resolve();
        };
      });
    } finally {
      if (this.isConnected()) {
        this.resetReconnectionState();
        this.connectListeners.forEach(listener => listener());
      }
    }
  }

  public disconnect(): void {
    if (!this.webSocket) {
      return; // Already disconnected
    }

    // TODO wait for buffer to flush
    this.destroyWebSocket();
    this.disconnectListeners.forEach(listener => listener());
  }

  public isConnected(): boolean {
    return this.webSocket && this.webSocket.readyState === WebSocket.OPEN;
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

  public unsubscribeFromTickers(markets: string[]): void {
    this.unsubscribe('tickers', markets);
  }

  public subscribeToTickers(markets: string[]): void {
    this.subscribe('tickers', markets);
  }

  /* Private */

  private createWebSocket(): void {
    this.webSocket = new WebSocket(this.baseURL);
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
    this.disconnectListeners.forEach(listener => listener());

    this.reconnect();
  }

  private handleWebSocketError(event: WebSocket.ErrorEvent): void {
    this.errorListeners.forEach(listener => listener(event));
  }

  private handleWebSocketMessage(event: WebSocket.MessageEvent): void {
    if (typeof event.data !== 'string') {
      throw new Error('Malformed response data'); // Shouldn't happen
    }
    const message = JSON.parse(event.data);
    this.responseListeners.forEach(listener => listener(message));
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

  private sendMessage(payload: types.webSocket.Request): void {
    this.throwIfDisconnected();

    this.webSocket.send(JSON.stringify(payload));
  }

  private subscribe(
    name: types.webSocket.SubscriptionName,
    markets: string[],
  ): void {
    this.sendMessage({
      method: 'subscribe',
      subscriptions: [
        {
          markets,
          name,
        },
      ],
    });
  }

  private throwIfDisconnected(): void {
    if (!this.isConnected()) {
      throw new Error(
        'Websocket not yet connected, await connect() method first',
      );
    }
  }

  private unsubscribe(
    subscriptionName: types.webSocket.SubscriptionName,
    markets: string[],
  ): void {
    this.sendMessage({
      method: 'unsubscribe',
      markets,
      subscriptions: [subscriptionName],
    });
  }
}
