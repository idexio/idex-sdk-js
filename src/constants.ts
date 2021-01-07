export const REST_API_KEY_HEADER = 'IDEX-API-Key';
export const REST_HMAC_SIGNATURE_HEADER = 'IDEX-HMAC-Signature';

export const ORDER_SIGNATURE_HASH_VERSION_ETH = 1;

export const ORDER_SIGNATURE_HASH_VERSION_BSC = 2;

/**
 * The URI for the sandbox REST API.
 *
 * @private
 * @see https://docs.idex.io/#sandbox
 */
export const SANDBOX_REST_API_BASE_URL = 'https://api-sandbox.idex.io/v1';

/**
 * The URI for the sandbox WebSocket API.
 *
 * @private
 * @see https://docs.idex.io/#sandbox
 */
export const SANDBOX_WEBSOCKET_API_BASE_URL =
  'wss://websocket-sandbox.idex.io/v1';

/**
 * The URI for the live WebSocket REST API.
 *
 * @private
 * @see https://docs.idex.io/#rest-api-interaction
 */
export const LIVE_REST_API_BASE_URL = 'https://api.idex.io/v1';

/**
 * The URI for the live WebSocket API.
 *
 * @private
 * @see https://docs.idex.io/#websocket-api-interaction
 */
export const LIVE_WEBSOCKET_API_BASE_URL = 'wss://websocket.idex.io/v1';
