import type { BridgeTarget } from '@idexio/idex-sdk/types';

/**
 * Estimated gas fees by bridge and target chain
 *
 * @see docs [API Documentation](https://api-docs-v1.kuma.bid/#get-gas-fees)
 * @see response {@link RestResponseGetGasFees}
 *
 * @category Kuma - Get Gas Fees
 * @category Kuma Interfaces
 */
export interface KumaGasFees {
  withdrawal: {
    [K in BridgeTarget]?: string;
  };
}

/**
 * @see docs [API Documentation](https://api-docs-v1.kuma.bid/#get-gas-fees)
 * @see type {@link KumaGasFees}
 *
 * @category Kuma - Get Gas Fees
 */
export type RestResponseGetGasFees = KumaGasFees;
