import AuthenticatedClient from './clients/authenticated';
import PublicClient from './clients/public';
import WebSocketClient from './clients/webSocket';
// TODO eslint doesn't yet understand the syntax export * as ns
/* eslint-disable-next-line */
import { enums, request, response, webSocket } from './types';
import { getPrivateKeySigner } from './ethers';

export {
  AuthenticatedClient,
  PublicClient,
  WebSocketClient,
  enums,
  request,
  response,
  webSocket,
  getPrivateKeySigner,
};
