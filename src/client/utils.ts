import * as constants from '../constants';
import type { MultiverseChain } from '../types';

export function deriveBaseURL(options: {
  sandbox: boolean;
  multiverseChain: MultiverseChain;
  overrideBaseURL?: string;
  api: 'rest' | 'websocket';
}): string {
  const baseURL =
    options.overrideBaseURL ??
    constants.URLS[options.sandbox ? 'sandbox' : 'production']?.[
      options.multiverseChain
    ]?.[options.api];

  if (!baseURL) {
    throw new Error(
      `Invalid configuration, baseURL could not be derived (sandbox? ${String(
        options.sandbox,
      )}) (chain: ${options.multiverseChain})`,
    );
  }

  return baseURL;
}
