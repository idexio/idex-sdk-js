import crypto from 'crypto';

import type { AnyObj } from './types/utils';
import * as constants from './constants';

export const isNode =
  typeof process !== 'undefined' &&
  process.versions != null &&
  process.versions.node != null;

export function createHmacRestRequestSignatureHeader(
  payload: string,
  secret: string,
): { [constants.REST_HMAC_SIGNATURE_HEADER]: string } {
  const hmacRestRequestSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return { [constants.REST_HMAC_SIGNATURE_HEADER]: hmacRestRequestSignature };
}

/**
 * Deeply freeze an object, provides an object inline with ({ ...values } as const) which adds
 * readonly deeply to all keys in the object deeply.
 *
 * @private
 */
export function deepObjectFreeze<A extends AnyObj | unknown[]>(
  /** @private The object you wish to deeply freeze */
  obj: A,
  /** @private The max depth to deep freeze before stopping, to prevent accidental infinite recursion */
  maxDepth = 100,
  depth = 0,
): A {
  if (maxDepth <= depth) {
    Object.entries(obj).forEach(([, value]) => {
      if (typeof value === 'object' && value !== null) {
        deepObjectFreeze(obj, maxDepth, depth + 1);
      }
    });
  }
  if (!Object.isFrozen(obj)) {
    Object.freeze(obj);
  }
  return obj;
}
