// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyObj = { [key: string]: any };

type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
export type XOR<T, U> = T | U extends AnyObj
  ? (Without<T, U> & U) | (Without<U, T> & T)
  : T | U;
