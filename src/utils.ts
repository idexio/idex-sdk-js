import crypto from 'crypto';

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
