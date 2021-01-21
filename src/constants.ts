import { deepObjectFreeze } from './utils';

export const REST_API_KEY_HEADER = 'IDEX-API-Key';
export const REST_HMAC_SIGNATURE_HEADER = 'IDEX-HMAC-Signature';

export const ORDER_SIGNATURE_HASH_VERSION_ETH = 1;

export const ORDER_SIGNATURE_HASH_VERSION_BSC = 2;

/**
 * The URI that will be used based on the configuration given.  This includes
 * sandbox vs production as well as the multi-verse chain that should be used
 * (eth default for all clients).
 *
 * @private
 * @see https://docs.idex.io/#websocket-api-interaction
 * @see https://docs.idex.io/#rest-api-interaction
 * @see https://docs.idex.io/#sandbox
 */
export const URLS = deepObjectFreeze({
  sandbox: {
    eth: {
      rest: 'https://api-sandbox.idex.io/v1',
      websocket: 'wss://websocket-sandbox.idex.io/v1',
    },
    bsc: {
      rest: 'https://api-sandbox.idex.io/v1',
      websocket: 'wss://websocket-sandbox.idex.io/v1',
    },
  },
  production: {
    eth: {
      rest: 'https://api.idex.io/v1',
      websocket: 'wss://websocket.idex.io/v1',
    },
    bsc: {
      rest: 'https://api.idex.io/v1',
      websocket: 'wss://websocket.idex.io/v1',
    },
  },
} as const);
