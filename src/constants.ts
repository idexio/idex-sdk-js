import { deepObjectFreeze } from './utils';

export const REST_API_KEY_HEADER = 'IDEX-API-Key';
export const REST_HMAC_SIGNATURE_HEADER = 'IDEX-HMAC-Signature';

export const ORDER_BOOK_MAX_L2_LEVELS = 500;

export const ORDER_BOOK_FIRST_LEVEL_MULTIPLIER_IN_PIPS = BigInt(110000000); // 1.1x

export const ORDER_BOOK_HYBRID_SLIPPAGE = 100; // 0.1%

export const ORDER_SIGNATURE_HASH_VERSION_MATIC = 4;

export const ORDER_SIGNATURE_HASH_VERSION_MATIC_SANDBOX = 104;

/**
 * The URI that will be used based on the configuration given.  This includes
 * sandbox vs production as well as the multi-verse chain that should be used
 * (eth default for all clients).
 *
 * @private
 * @see https://api-docs-v3.idex.io/#websocket-api-interaction
 * @see https://api-docs-v3.idex.io/#rest-api-interaction
 * @see https://api-docs-v3.idex.io/#sandbox
 */
export const URLS = deepObjectFreeze({
  sandbox: {
    matic: {
      rest: 'https://api-sandbox-matic.idex.io/v1',
      websocket: 'wss://websocket-sandbox-matic.idex.io/v1',
    },
  },
  production: {
    matic: {
      rest: 'https://api-matic.idex.io/v1',
      websocket: 'wss://websocket-matic.idex.io/v1',
    },
  },
} as const);
