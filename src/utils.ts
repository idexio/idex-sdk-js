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

export function deepObjectFreeze<A extends AnyObj | unknown[]>(obj: A): A {
  Object.entries(obj).forEach(([, value]) => {
    if (typeof value === 'object' && value !== null) {
      deepObjectFreeze(obj);
    }
  });
  if (!Object.isFrozen(obj)) {
    Object.freeze(obj);
  }
  return obj;
}
