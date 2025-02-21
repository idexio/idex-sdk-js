/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  ContractRunner,
  ContractMethod,
  Listener,
} from 'ethers';
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedListener,
  TypedContractMethod,
} from '../../../../common';

export interface IMessagingContextInterface extends Interface {
  getFunction(
    nameOrSignature: 'getSendContext' | 'isSendingMessage',
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: 'getSendContext',
    values?: undefined,
  ): string;
  encodeFunctionData(
    functionFragment: 'isSendingMessage',
    values?: undefined,
  ): string;

  decodeFunctionResult(
    functionFragment: 'getSendContext',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'isSendingMessage',
    data: BytesLike,
  ): Result;
}

export interface IMessagingContext extends BaseContract {
  connect(runner?: ContractRunner | null): IMessagingContext;
  waitForDeployment(): Promise<this>;

  interface: IMessagingContextInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined,
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined,
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>,
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>,
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>,
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>,
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent,
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent,
  ): Promise<this>;

  getSendContext: TypedContractMethod<
    [],
    [[bigint, string] & { dstEid: bigint; sender: string }],
    'view'
  >;

  isSendingMessage: TypedContractMethod<[], [boolean], 'view'>;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment,
  ): T;

  getFunction(
    nameOrSignature: 'getSendContext',
  ): TypedContractMethod<
    [],
    [[bigint, string] & { dstEid: bigint; sender: string }],
    'view'
  >;
  getFunction(
    nameOrSignature: 'isSendingMessage',
  ): TypedContractMethod<[], [boolean], 'view'>;

  filters: {};
}
