/**
 * `/v4/time`
 *
 * @see [API Documentation](https://api-docs-v4.idex.io/#get-time)
 *
 * @category IDEX - Get Time
 */
export interface RestResponseGetTime {
  /**
   * Current server time in `UTC`
   */
  serverTime: number;
}
