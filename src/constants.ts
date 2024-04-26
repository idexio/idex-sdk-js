import { ethers } from 'ethers';

export const REST_API_KEY_HEADER = 'idex-api-key';
export const REST_HMAC_SIGNATURE_HEADER = 'idex-hmac-signature';

export const ORDER_BOOK_MAX_L2_LEVELS = 500;

export const ORDER_BOOK_FIRST_LEVEL_MULTIPLIER_IN_PIPS = BigInt(110000000); // 1.1x

export const EIP_712_DOMAIN_NAME = 'IDEX';

export const EIP_712_DOMAIN_VERSION = '4.0.0';

export const EIP_712_DOMAIN_VERSION_SANDBOX = '4.0.0-sandbox';

export const EMPTY_UINT8_ARRAY = ethers.getBytes('0x');

// sdk-js-docs-v4.idex.io
// api-docs-v4.idex.io

export const WALLET_SIGNATURE_MESSAGE =
  'Sign this free message to prove you control this wallet';

/**
 * The URI that will be used based on the configuration given.  This includes
 * sandbox vs production as well as the multi-verse chain that should be used
 * (eth default for all clients).
 *
 * @see docs [Websocket API Interaction Docs](https://api-docs-v4.idex.io/#websocket-api-interaction)
 * @see docs [REST API Interaction Docs](https://api-docs-v4.idex.io/#rest-api-interaction)
 * @see docs [Sandbox API Docs](https://api-docs-v4.idex.io/#sandbox)
 *
 * @internal
 */
export const URLS = Object.freeze({
  sandbox: {
    v4: {
      rest: 'https://api-sandbox.idex.io/v4',
      websocket: 'wss://websocket-sandbox.idex.io/v4',
    },
  },
  production: {
    v4: {
      rest: 'https://api.idex.io/v4',
      websocket: 'wss://websocket.idex.io/v4',
    },
  },
} as const);
