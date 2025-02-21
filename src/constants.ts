export const REST_API_KEY_HEADER = 'kuma-api-key';
export const REST_HMAC_SIGNATURE_HEADER = 'kuma-hmac-signature';

export const EIP_712_DOMAIN_NAME = 'Kuma';

export const EIP_712_DOMAIN_VERSION = '1.0.0';

export const EIP_712_DOMAIN_VERSION_SANDBOX = '1.0.0-sandbox';

// sdk-js-docs-v1.kuma.bid
// api-docs-v1.kuma.bid

export const WALLET_SIGNATURE_MESSAGE =
  'Sign this free message to prove you control this wallet';

/**
 * The URI that will be used based on the configuration given.  This includes
 * sandbox vs production as well as the multi-verse chain that should be used
 * (eth default for all clients).
 *
 * @see docs [Websocket API Interaction Docs](https://api-docs-v1.kuma.bid/#websocket-api-interaction)
 * @see docs [REST API Interaction Docs](https://api-docs-v1.kuma.bid/#rest-api-interaction)
 * @see docs [Sandbox API Docs](https://api-docs-v1.kuma.bid/#sandbox)
 *
 * @internal
 */
export const URLS = Object.freeze({
  sandbox: {
    v1: {
      rest: 'https://api-sandbox.kuma.bid/v1',
      websocket: 'wss://websocket-sandbox.kuma.bid/v1',
    },
  },
  production: {
    v1: {
      rest: 'https://api.kuma.bid/v1',
      websocket: 'wss://websocket.kuma.bid/v1',
    },
  },
} as const);
