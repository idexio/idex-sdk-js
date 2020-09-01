// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyObj = { [key: string]: any };

type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

export type XOR<T, U> = T | U extends AnyObj
  ? (Without<T, U> & U) | (Without<U, T> & T)
  : T | U;

// Unwraps a given type so it is represented in an easier to understand
// way to the user
export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

// Set the provided keys as optional in an object
export type AugmentedOptional<
  T extends AnyObj,
  K extends keyof T = keyof T
> = Expand<T extends T ? Omit<T, K> & Partial<Pick<T, K>> : never>;

// Set the provided keys as required in an object
export type AugmentedRequired<
  T extends AnyObj,
  K extends keyof T = keyof T
> = Expand<T extends T ? Omit<T, K> & Required<Pick<T, K>> : never>;
