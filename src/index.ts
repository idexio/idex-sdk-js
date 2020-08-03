import AuthenticatedClient from './clients/rest/authenticated';
import PublicClient from './clients/rest/public';
import WebSocketClient from './clients/webSocket';
import { enums, rest as restTypes, webSocket as webSocketTypes } from './types';

const rest = Object.freeze({
  client: {
    AuthenticatedClient,
    PublicClient,
  },
  types: restTypes,
} as const);

const webSocket = Object.freeze({
  Client: WebSocketClient,
  types: webSocketTypes,
} as const);

export { enums, rest, webSocket };
