/**
 * Decoded Stargate Payload
 */
export type DecodedStargatePayload = {
  targetChainId: number;
  sourcePoolId: number;
  targetPoolId: number;
};

/**
 * Decoded Stargate v2 Payload
 */
export type DecodedStargateV2Payload = {
  layerZeroEndpointId: number;
};

/**
 * Encoded Stargate Payload
 */
export type EncodedStargatePayload = string;
