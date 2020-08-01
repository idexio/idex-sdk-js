import * as webSocket from './webSocket';

const isNode =
  typeof process !== 'undefined' &&
  process.versions != null &&
  process.versions.node != null;

export { isNode, webSocket };
