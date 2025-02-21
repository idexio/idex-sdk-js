/**
 * `/v1/time`
 *
 * @see [API Documentation](https://api-docs-v1.kuma.bid/#get-time)
 *
 * @category Kuma - Get Time
 */
export interface RestResponseGetTime {
  /**
   * Current server time in `UTC`
   */
  serverTime: number;
}
