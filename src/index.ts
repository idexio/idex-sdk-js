import AuthenticatedClient from './clients/authenticated';
import PublicClient from './clients/public';
// TODO eslint doesn't yet understand the syntax export * as ns
/* eslint-disable-next-line */
import { enums, request, response } from './types';
import { signHashWithPrivateKey } from './ethers/sign';

export {
  AuthenticatedClient,
  PublicClient,
  enums,
  request,
  response,
  signHashWithPrivateKey,
};
