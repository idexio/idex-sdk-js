/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Contract,
  ContractFactory,
  ContractTransactionResponse,
  Interface,
} from 'ethers';
import type { Signer, ContractDeployTransaction, ContractRunner } from 'ethers';
import type { NonPayableOverrides } from '../../../common';
import type {
  PythErrors,
  PythErrorsInterface,
} from '../../../@pythnetwork/pyth-sdk-solidity/PythErrors';

const _abi = [
  {
    inputs: [],
    name: 'InsufficientFee',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidArgument',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidGovernanceDataSource',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidGovernanceMessage',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidGovernanceTarget',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidUpdateData',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidUpdateDataSource',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidWormholeVaa',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NoFreshUpdate',
    type: 'error',
  },
  {
    inputs: [],
    name: 'OldGovernanceMessage',
    type: 'error',
  },
  {
    inputs: [],
    name: 'PriceFeedNotFound',
    type: 'error',
  },
  {
    inputs: [],
    name: 'PriceFeedNotFoundWithinRange',
    type: 'error',
  },
  {
    inputs: [],
    name: 'StalePrice',
    type: 'error',
  },
] as const;

const _bytecode =
  '0x60808060405234601757603a9081601d823930815050f35b600080fdfe600080fdfea2646970667358221220b15feae9b8f975c557c54f842333b8e05aeb3a7ec59c3bc1ddbe18dfe44d56ea64736f6c63430008120033';

type PythErrorsConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: PythErrorsConstructorParams,
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class PythErrors__factory extends ContractFactory {
  constructor(...args: PythErrorsConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    overrides?: NonPayableOverrides & { from?: string },
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(overrides || {});
  }
  override deploy(overrides?: NonPayableOverrides & { from?: string }) {
    return super.deploy(overrides || {}) as Promise<
      PythErrors & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): PythErrors__factory {
    return super.connect(runner) as PythErrors__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): PythErrorsInterface {
    return new Interface(_abi) as PythErrorsInterface;
  }
  static connect(address: string, runner?: ContractRunner | null): PythErrors {
    return new Contract(address, _abi, runner) as unknown as PythErrors;
  }
}