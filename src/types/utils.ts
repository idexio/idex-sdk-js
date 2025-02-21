/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * An object that can be of any valid values but has string-only keys
 *
 * - Slightly better than using `any` or `object` types as it requires the value to
 *   be a plain object.
 */
export type AnyObj = { [key: string]: any };

// any object with {@link PropertyKey} keys and unknown values to
// be extended by intersection with another type to implement simple protocols
export type UnknownObj = Record<PropertyKey, unknown>;

/**
 * An object of type `{}` , however Typescript defines that as
 * "any non-null value", so this represents the same as
 *
 * @example
 * ```typescript
 * const emptyObj = {}
 * ```
 */
export type EmptyObj = { [key: string]: never };

/**
 * Expand will expand an object type by rebuilding the object at the point it is used.
 * which can be useful when the type is obscured due to utility types and you want
 * to see the underlying type that is expected.
 *
 * - This can be very useful when a type is confusing at first glance, if it is
 *   using utilities like Extract, Pick, Omit, extends, etc then `Expand` will
 *   unwrap that into a coherent/flat type you can understand.
 *
 * @category Type - Utilities
 *
 * @example
 * ```typescript
 *  // the ExpandedCandle can be hovered to see the properties of KumaCandle directly
 *  type ExpandedCandle = Expand<KumaCandle>;
 * ```
 */
export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

// expands object types recursively when they are skewed with extensive
// utility helpers
// second param is an optional unions of keys to not expand
// Pick<{ one: string, two: string }, 'one'> --> { one: string }
export type ExpandDeep<T, E extends string = never> =
  T extends (
    {
      [key: string]: any;
    }
  ) ?
    T extends infer O ?
      { [K in keyof O]: K extends E ? O[K] : ExpandDeep<O[K], E> }
    : never
  : T;

// Set the provided keys as optional in an object
export type AugmentedOptional<
  T extends AnyObj,
  K extends keyof T = keyof T,
> = Expand<T extends T ? Omit<T, K> & Partial<Pick<T, K>> : never>;

/**
 * Augments a type so that the provided keys are all changed to required.
 */
export type AugmentedRequired<
  T extends AnyObj,
  K extends keyof T = keyof T,
> = Expand<T extends T ? Omit<T, K> & Required<Pick<T, K>> : never>;

/**
 * Used to turn a type into the expected type for an actual request with
 * parameters and signature properties.
 *
 * @category Type Utilities
 */
export interface RestRequestWithSignature<T extends AnyObj> {
  readonly parameters: T;
  readonly signature: string;
}

export interface Paginated<I extends AnyObj[]> {
  count: number;
  items: I;
}
