/**
 * [[include:base.md]]
 *
 * @see related {@link RestRequestByWallet}
 * @category Base Types
 */
export interface RestRequestByWalletOptional {
  /**
   * User data and trade endpoints requests must include a nonce.
   *
   * - **MUST** be a [version 1 UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_1_(date-time_and_MAC_address))
   * - Nonces may be supplied `with` or `without` hyphens.
   *
   * @remarks Version 1 UUIDs encode a timestamp in addition to other unique information, and thus serve both
   *          to prevent replay attacks as well as to enforce request timing. As a result, nonces **MUST** be generated
   *          at the time of a request.
   *
   */
  nonce: string;
  /**
   * The wallet address to use for the request.
   */
  wallet?: string;
}

/**
 * [[include:base.md]]
 *
 * @see related {@link RestRequestByWalletOptional}
 * @category Base Types
 * @interface
 */
export type RestRequestByWallet = Required<RestRequestByWalletOptional>;

/**
 * [[include:base.md]]
 *
 * @see related {@link RestRequestByMarket}
 * @category Base Types
 */
export interface RestRequestByMarketOptional {
  /**
   * Base-quote pair e.g. 'ETH-USD'
   */
  market?: string;
}

/**
 * [[include:base.md]]
 *
 * @see related {@link RestRequestByMarketOptional}
 * @category Base Types
 * @interface
 */
export type RestRequestByMarket = Required<RestRequestByMarketOptional>;

/**
 * [[include:base.md]]
 *
 * Any combination of `start`, `end`, `limit` are valid, but **certain values
 * take precedence over others.** For example,
 *
 * - if {@link start} and {@link end} **ARE** specified and **NOT** {@link limit}:
 *   - the response will include objects starting at {@link start} and ending either at
 *     {@link end} or the maximum {@link limit} of 1,000 objects.
 * - If {@link end} is specified alone:
 *   - returns `50` objects closest to, but **EARLIER** (older) than {@link end}.
 * - Specifying **NONE** of the pagination parameters returns
 *   the _50 most recent objects_.
 *
 * Response data is returned in ascending time order, with oldest objects first and newest objects last.
 *
 * @see related {@link RestRequestPaginationWithFromId}
 *
 * @category Base Types
 */
export interface RestRequestPagination {
  /**
   * If provided, indicates the earliest (oldest) timestamp of an object
   * to include in the response.
   *
   * - This value is **inclusive**, meaning objects with timestamps that exactly
   *   match `start` are included in the response.
   * - `start` **MUST** be earlier than {@link end} if provided.
   */
  start?: number;
  /**
   * If provided, indicates the latest (newest) timestamp of an object to include
   * the response.
   *
   * - This value is **inclusive**, meaning objects with timestamps that exactly
   *   match `end` are included in the response.
   * - `end` **MUST** be a later timestamp than {@link start}.
   */
  end?: number;
  /**
   * Maximum number to return of the requested type.
   */
  limit?: number;
  /**
   * - This is an internal undocumented parameter and is not available using the public API.
   * - Using this parameter will likely result in your request returning an error.
   *
   * @internal
   */
  page?: number;
}

/**
 * @inheritDoc
 *
 * @see related {@link RestRequestPagination}
 * @category Base Types
 */
export interface RestRequestPaginationWithFromId extends RestRequestPagination {
  /**
   * Identifier of the earliest (oldest) of the requested type.
   *
   * - {@link fromId}, takes precedence over {@link start}.
   */
  fromId?: string;
}
