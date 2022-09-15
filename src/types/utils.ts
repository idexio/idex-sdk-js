/* eslint-disable @typescript-eslint/no-explicit-any */

export type AnyObj = { [key: string]: any };

type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

export type XOR<T, U> = T | U extends AnyObj
  ? (Without<T, U> & U) | (Without<U, T> & T)
  : T | U;

/**
 * Expand will expand an object type by rebuilding the object
 * which can be useful when the type is obscured due to utility types and you want
 * to see the underlying type that is expected.
 */
export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

// expands object types recursively when they are skewed with extensive
// utility helpers
// second param is an optional unions of keys to not expand
// Pick<{ one: string, two: string }, 'one'> --> { one: string }
export type ExpandDeep<T, E extends string = never> = T extends {
  [key: string]: any;
}
  ? T extends infer O
    ? { [K in keyof O]: K extends E ? O[K] : ExpandDeep<O[K], E> }
    : never
  : T;

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
