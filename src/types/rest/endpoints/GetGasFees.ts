import type { BridgeTarget } from '@idexio/idex-sdk-ikon/types';

/**
 * Estimated gas fees by bridge and target chain
 *
 * @see docs [API Documentation](https://api-docs-v4.idex.io/#get-gas-fees)
 * @see response {@link RestResponseGetGasFees}
 *
 * @category IDEX - Get Gas Fees
 * @category IDEX Interfaces
 */
export interface IDEXGasFees {
  withdrawal: {
    [K in BridgeTarget]?: string;
  };
}

/**
 * @see docs [API Documentation](https://api-docs-v4.idex.io/#get-gas-fees)
 * @see type {@link IDEXGasFees}
 *
 * @category IDEX - Get Gas Fees
 */
export type RestResponseGetGasFees = IDEXGasFees;
