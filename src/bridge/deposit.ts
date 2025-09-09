import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';

import { multiplyPips } from '#pipmath';

import { StargateV2Config } from '#bridge/config';
import { IOFT__factory } from '#typechain-types/index';
import { StargateV2Target } from '#types/enums/request';

import {
  getStargateV2TargetConfig,
  loadExchangeLayerZeroAddressFromApiIfNeeded,
  loadStargateBridgeForwarderContractAddressFromApiIfNeeded,
} from './utils';

/**
 * Deposit funds cross-chain into the Exchange using Stargate
 */
export async function depositViaStargateV2(
  parameters: {
    exchangeLayerZeroAdapterAddress?: string;
    minimumForwardQuantityMultiplierInPips: bigint;
    quantityInAssetUnits: bigint;
    sourceStargateTarget: StargateV2Target;
    stargateBridgeForwarderContractAddress?: string;
    wallet: string;
  },
  providers: {
    // If the source chain is Berachain then both these params should be for
    // the same provider
    berachain: ethers.Provider;
    sourceChain: ethers.Provider;
  },
  sourceSigner: ethers.Signer,
  sandbox: boolean,
): Promise<string> {
  const [{ sendParam, sourceConfig }, { gasFee }] = await Promise.all(
    parameters.sourceStargateTarget === StargateV2Target.STARGATE_BERACHAIN ?
      [
        getDepositFromBerachainSendParamAndSourceConfig(parameters, sandbox),
        estimateDepositFromBerachainFees(parameters, providers, sandbox),
      ]
    : [
        getDepositViaForwarderSendParamAndSourceConfig(
          parameters,
          providers,
          sandbox,
        ),
        estimateDepositViaForwarderFees(parameters, providers, sandbox),
      ],
  );

  let gasLimit: number = StargateV2Config.settings.depositSourceChainGasLimit;
  const oft = IOFT__factory.connect(
    sourceConfig.stargateOFTAddress,
    sourceSigner,
  );

  try {
    // Estimate gas
    const estimatedGasLimit = await oft.send.estimateGas(
      sendParam,
      { nativeFee: gasFee, lzTokenFee: 0 },
      parameters.wallet, // Refund address - extra gas (if any) is returned to this address
      {
        from: parameters.wallet,
        // Native gas to pay for the cross chain message fee
        value: gasFee,
      },
    );
    // Add 20% buffer for safety
    gasLimit = Number(
      new BigNumber(estimatedGasLimit.toString())
        .times(new BigNumber(1.2))
        .toFixed(0),
    );
  } catch (error) {
    // ethers.js will perform the estimation at the block gas limit, which is much higher than the
    // gas actually needed by the tx. If the wallet does not have the funds to cover the tx at this
    // high gas limit then the RPC will throw an INSUFFICIENT_FUNDS error; however the wallet may
    // still have enough funds to successfully bridge at the actual gas limit. In this case simply
    // fall through and use the configured default gas limit. The wallet software in use should
    // still show if that limit is insufficient, which is only an issue for blockchains with
    // variable gas costs such as Arbitrum One
    if (!error.code || error.code !== 'INSUFFICIENT_FUNDS') {
      throw error;
    }
  }

  const response = await oft.send(
    sendParam,
    { nativeFee: gasFee, lzTokenFee: 0 },
    parameters.wallet, // Refund address - extra gas (if any) is returned to this address
    {
      from: parameters.wallet,
      gasLimit,
      value: gasFee,
    }, // Native gas to pay for the cross chain message fee
  );

  return response.hash;
}

/**
 * Estimate native gas fee needed to deposit USDC cross-chain into the Exchange
 */
export async function estimateDepositFees(
  parameters: {
    exchangeLayerZeroAdapterAddress?: string;
    minimumForwardQuantityMultiplierInPips: bigint;
    quantityInAssetUnits: bigint;
    sourceStargateTarget: StargateV2Target;
    stargateBridgeForwarderContractAddress?: string;
    wallet: string;
  },
  providers: {
    // If the source chain is Berachain then both these params should be for
    // the same provider
    berachain: ethers.Provider;
    sourceChain: ethers.Provider;
  },
  sandbox: boolean,
): Promise<{
  gasFee: bigint;
  quantityDeliveredInAssetUnits: bigint;
}> {
  if (parameters.sourceStargateTarget === StargateV2Target.STARGATE_BERACHAIN) {
    return estimateDepositFromBerachainFees(parameters, providers, sandbox);
  }

  return estimateDepositViaForwarderFees(parameters, providers, sandbox);
}

async function estimateDepositViaForwarderFees(
  parameters: {
    exchangeLayerZeroAdapterAddress?: string;
    minimumForwardQuantityMultiplierInPips: bigint;
    quantityInAssetUnits: bigint;
    sourceStargateTarget: StargateV2Target;
    stargateBridgeForwarderContractAddress?: string;
    wallet: string;
  },
  providers: {
    berachain: ethers.Provider;
    sourceChain: ethers.Provider;
  },
  sandbox: boolean,
): Promise<{
  gasFee: bigint;
  quantityDeliveredInAssetUnits: bigint;
}> {
  const { sendParam, sourceConfig } =
    await getDepositViaForwarderSendParamAndSourceConfig(
      parameters,
      providers,
      sandbox,
    );

  const stargate = IOFT__factory.connect(
    sourceConfig.stargateOFTAddress,
    providers.sourceChain,
  );
  const [{ nativeFee: gasFee }, [, , receipt]] = await Promise.all([
    stargate.quoteSend(sendParam, false, {
      from: parameters.wallet,
    }),
    stargate.quoteOFT(sendParam),
  ]);

  // Once we obtain the quantity delivered after slippage to Berachain, calculate
  // the quantity subsequently delivered to XCHAIN after any additional slippage
  const { quantityDeliveredInAssetUnits } =
    await estimateDepositFromBerachainFees(
      { ...parameters, quantityInAssetUnits: receipt.amountReceivedLD },
      providers,
      sandbox,
    );

  return {
    gasFee,
    quantityDeliveredInAssetUnits,
  };
}

/**
 * Estimate native gas fee needed to deposit USDC cross-chain into the Exchange
 * from Berachain using the Kuma OFT pathway
 */
async function estimateDepositFromBerachainFees(
  parameters: {
    exchangeLayerZeroAdapterAddress?: string;
    minimumForwardQuantityMultiplierInPips: bigint;
    quantityInAssetUnits: bigint;
    wallet: string;
  },
  providers: {
    berachain: ethers.Provider;
  },
  sandbox: boolean,
): Promise<{
  gasFee: bigint;
  quantityDeliveredInAssetUnits: bigint;
}> {
  const { sendParam, sourceConfig } =
    await getDepositFromBerachainSendParamAndSourceConfig(parameters, sandbox);

  const oft = IOFT__factory.connect(
    sourceConfig.stargateOFTAddress,
    providers.berachain,
  );
  const [[gasFee], [, , receipt]] = await Promise.all([
    oft.quoteSend(sendParam, false, {
      from: parameters.wallet,
    }),
    oft.quoteOFT(sendParam),
  ]);

  return {
    gasFee,
    quantityDeliveredInAssetUnits: receipt.amountReceivedLD,
  };
}

function getSourceAndDestinationConfigs(
  sourceTarget: StargateV2Target,
  destinationTarget: StargateV2Target,
  sandbox: boolean,
) {
  const sourceConfig = getStargateV2TargetConfig(sourceTarget, sandbox);
  const destinationConfig = getStargateV2TargetConfig(
    destinationTarget,
    sandbox,
  );

  return { sourceConfig, destinationConfig };
}

async function getDepositFromBerachainSendParamAndSourceConfig(
  parameters: {
    exchangeLayerZeroAdapterAddress?: string;
    minimumForwardQuantityMultiplierInPips: bigint;
    quantityInAssetUnits: bigint;
    wallet: string;
  },
  sandbox: boolean,
) {
  const { sourceConfig, destinationConfig } = getSourceAndDestinationConfigs(
    StargateV2Target.STARGATE_BERACHAIN,
    StargateV2Target.XCHAIN_XCHAIN,
    sandbox,
  );

  const exchangeLayerZeroAdapterAddress =
    await loadExchangeLayerZeroAddressFromApiIfNeeded(
      parameters.exchangeLayerZeroAdapterAddress,
    );

  const sendParam = {
    dstEid: destinationConfig.layerZeroEndpointId, // Destination endpoint ID
    to: ethers.zeroPadValue(exchangeLayerZeroAdapterAddress, 32), // Recipient address
    amountLD: parameters.quantityInAssetUnits, // Amount to send in local decimals
    minAmountLD: multiplyPips(
      parameters.quantityInAssetUnits,
      parameters.minimumForwardQuantityMultiplierInPips,
    ), // Minimum amount to send in local decimals
    extraOptions: '0x',
    composeMsg: ethers.AbiCoder.defaultAbiCoder().encode(
      ['uint32', 'address'],
      [sourceConfig.layerZeroEndpointId, parameters.wallet],
    ), // Additional options supplied by the caller to be used in the LayerZero message
    oftCmd: '0x', // The OFT command to be executed, unused in default OFT implementations
  };

  return { sendParam, sourceConfig };
}

async function getDepositViaForwarderSendParamAndSourceConfig(
  parameters: {
    minimumForwardQuantityMultiplierInPips: bigint;
    quantityInAssetUnits: bigint;
    sourceStargateTarget: StargateV2Target;
    stargateBridgeForwarderContractAddress?: string;
    wallet: string;
  },
  providers: {
    berachain: ethers.Provider;
  },
  sandbox: boolean,
) {
  const { sourceConfig, destinationConfig: berachainConfig } =
    getSourceAndDestinationConfigs(
      parameters.sourceStargateTarget,
      StargateV2Target.STARGATE_BERACHAIN,
      sandbox,
    );

  const { gasFee: berachainGasFee } = await estimateDepositFromBerachainFees(
    parameters,
    providers,
    sandbox,
  );
  // Add 20% buffer for safety
  const additionalNativeDrop = new BigNumber(berachainGasFee.toString())
    .times(new BigNumber(1.2))
    .toFixed(0);

  const stargateBridgeForwarderContractAddress =
    await loadStargateBridgeForwarderContractAddressFromApiIfNeeded(
      parameters.stargateBridgeForwarderContractAddress,
    );

  // FIXME CJS dynamic import
  const { Options } = await import('@layerzerolabs/lz-v2-utilities');
  const extraOptions = Options.newOptions()
    // Native drop is specified in BERA wei
    .addExecutorComposeOption(
      0,
      StargateV2Config.settings.stargateBridgeForwarderGasLimit,
      additionalNativeDrop,
    )
    .toHex();

  const sendParam = {
    dstEid: berachainConfig.layerZeroEndpointId, // Destination endpoint ID
    to: ethers.zeroPadValue(stargateBridgeForwarderContractAddress, 32), // Recipient address
    amountLD: parameters.quantityInAssetUnits, // Amount to send in local decimals
    minAmountLD: multiplyPips(
      parameters.quantityInAssetUnits,
      parameters.minimumForwardQuantityMultiplierInPips,
    ), // Minimum amount to send in local decimals
    extraOptions,
    composeMsg: ethers.AbiCoder.defaultAbiCoder().encode(
      ['uint8', 'tuple(address)'],
      [
        0, //  ComposeMessageType.DepositToXchain
        [
          parameters.wallet, // Destination wallet
        ],
      ],
    ),
    oftCmd: '0x', // The OFT command to be executed, unused in default OFT implementations
  };

  return { sendParam, sourceConfig };
}
