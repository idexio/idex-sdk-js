// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyObj = { [key: string]: any };

type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

export type XOR<T, U> = T | U extends AnyObj
  ? (Without<T, U> & U) | (Without<U, T> & T)
  : T | U;

export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

export type Optional<T extends AnyObj, K extends keyof T = keyof T> = Expand<
  T extends T ? Omit<T, K> & Partial<Pick<T, K>> : never
>;

export type UnionToIntersection<U> = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  U extends any
    ? (k: U) => void
    : never
) extends (k: infer I) => void
  ? I extends I
    ? I
    : never
  : never;
