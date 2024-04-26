import { createHmac } from 'node:crypto';

import { ethers } from 'ethers';
import { v1 as uuidv1 } from 'uuid';

import * as constants from '#constants';

import type { AnyObj } from '#types/utils';

const UUIDV1_REGEX =
  /^[0-9A-F]{8}-[0-9A-F]{4}-1[0-9A-F]{3}-[0-9A-F]{4}-[0-9A-F]{12}$/i;

export const isNode =
  typeof process !== 'undefined' &&
  process.versions != null &&
  process.versions.node != null;

export function createHmacRestRequestSignatureHeader(
  payload: string,
  secret: string,
): { [constants.REST_HMAC_SIGNATURE_HEADER]: string } {
  const hmacRestRequestSignature = createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return { [constants.REST_HMAC_SIGNATURE_HEADER]: hmacRestRequestSignature };
}

/**
 * Creates a random ethers wallet.
 *
 * @internal
 */
function generateRandomWallet(): ethers.HDNodeWallet {
  return ethers.Wallet.createRandom();
}

/**
 * Creates a new wallet and nonce to use for delegated keys
 *
 * @internal
 */
export function createDelegatedKeyWalletAndNonce(): readonly [
  ethers.HDNodeWallet,
  string,
] {
  const wallet = generateRandomWallet();
  const nonce = uuidv1();

  return [wallet, nonce] as const;
}

/**
 * - For use internally at IDEX and may be removed or changed anywhere it is implemented without warning.
 *
 * @internal
 */
export const INTERNAL_SYMBOL = Symbol.for('@idex/internal');

/**
 * Asserts that the provided nonce is a uuid v1 string.
 *
 * @internal
 */
export function assertNonceIsValid(nonce: string): asserts nonce is string {
  if (!nonce) {
    throw new Error(
      'A nonce must be provided with your request but none was provided.',
    );
  }
  if (UUIDV1_REGEX.test(nonce) === false) {
    throw new Error(
      'The provided nonce is not a valid uuid v1 string. Please provide a valid uuid v1 string.',
    );
  }
}

export function deriveBaseURL(options: {
  sandbox?: boolean;
  overrideBaseURL?: string;
  api: 'rest' | 'websocket';
  baseRestApiURL?: string;
  baseWebSocketURL?: string;
}): string {
  const { overrideBaseURL, sandbox, api = 'rest' } = options;

  if (
    !overrideBaseURL &&
    (options.baseRestApiURL || options.baseWebSocketURL)
  ) {
    switch (api) {
      case 'rest': {
        if (options.baseRestApiURL) {
          return options.baseRestApiURL;
        }
        if (options.baseWebSocketURL) {
          const wsUrl = new URL(options.baseWebSocketURL);
          return `https://${wsUrl.hostname.replace('websocket', 'api')}${
            wsUrl.pathname
          }`;
        }
        break;
      }
      case 'websocket': {
        if (options.baseWebSocketURL) {
          return options.baseWebSocketURL;
        }
        if (options.baseRestApiURL) {
          const apiUrl = new URL(options.baseRestApiURL);
          return `wss://${apiUrl.hostname.replace('api', 'websocket')}${
            apiUrl.pathname
          }`;
        }
        break;
      }
      default:
        break;
    }
  }

  const baseURL =
    overrideBaseURL ??
    constants.URLS[sandbox ? 'sandbox' : 'production'].v4[api];

  if (!baseURL) {
    throw new Error(
      `Invalid configuration, baseURL could not be derived (sandbox? ${String(
        options.sandbox,
      )})`,
    );
  }

  return baseURL;
}

/**
 * URLSearchParams encodes undefined and null as strings, we remove them as a
 * precaution if this happens.
 */
export function sanitizeSearchParams(
  searchParams: URLSearchParams | AnyObj | undefined = {},
) {
  const sanitizedSearchParams = new URLSearchParams(searchParams);

  for (const [key, value] of sanitizedSearchParams) {
    // if a user had a key in the obj they set to undefined
    // url search params might serialize it to 'undefined'
    if (value === 'undefined' || value === 'null') {
      sanitizedSearchParams.delete(key, value);
    }
  }

  return sanitizedSearchParams;
}

/**
 * By using this in default switch case, we can enforce exhaustive check of all case cases.
 *
 * @example
 * ```typescript
 *  switch (prop) {
 *    // ...
 *    default:
 *      throw new UnreachableCaseError(prop);
 *  }
 * ```
 *
 * @internal
 */
export class UnreachableCaseError extends Error {
  /**
   *
   * @param value The value being switched that caused the default case to be reached.
   * @param info Optionally the name of the fn or switch that caused the error for logging.
   */
  constructor(value: never, info = 'switch') {
    super(
      `Unreachable Case: Must handle all cases in "${info}" but did not handle: ${value}`,
    );
  }
}
