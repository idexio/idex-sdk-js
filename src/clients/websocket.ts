import WebSocket from 'ws';

import * as types from '../types';

/**
 * Websocket API client
 *
 * ```typescript
 * import * as idex from '@idexio/idex-node';
 *
 * const config = {
 *   baseURL: 'wss://ws.idex.io',
 * }
 * const websocketClient = new idex.Websocket(config.baseURL);
 * ```
 */

export default class WebsocketClient {
  private baseURL: string;

  private ws: WebSocket;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.ws = new WebSocket(baseURL);
    this.registerWsEventHandlers();
  }

  private registerWsEventHandlers() {
    this.ws.on('error', (error: Error) => {
      console.log(`Connection Error: ${error.toString()}`);
    });

    this.ws.on('message', (message: string) => {
      console.log('Incoming message: ', message);
    });

    this.ws.on('close', () => {
      console.log('Connection Closed');
    });
  }

  private sendMessage(payload: unknown) {
    this.ws.send(JSON.stringify(payload));
  }

  private subscribe(name: types.websocket.SubscriptionName, markets: string[]) {
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

  private unsubscribe(
    subscriptionName: types.websocket.SubscriptionName,
    markets: string[],
  ) {
    this.sendMessage({
      method: 'unsubscribe',
      markets,
      subscriptions: [subscriptionName],
    });
  }

  public listSubscriptions() {
    this.sendMessage({ method: 'subscriptions' });
  }

  public unsubscribeFromTickers(markets: string[]) {
    this.unsubscribe('tickers', markets);
  }

  public subscribeToTickers(markets: string[]) {
    this.subscribe('tickers', markets);
  }
}
