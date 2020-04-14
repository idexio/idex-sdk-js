import { ethers } from 'ethers';

type TypeValuePair =
  | ['string' | 'address', string]
  | ['uint128', string | Buffer] // TODO: test Buffer support on frontend ?
  | ['uint8' | 'uint64', number]
  | ['bool', boolean];

export const solidityHashOfParams = (params: TypeValuePair[]): string => {
  const fields = params.map(param => param[0]);
  const values = params.map(param => param[1]);
  // TODO: we might let lib users to pick their solidityKeccak256 library, eg. web3.soliditySha3()
  return ethers.utils.solidityKeccak256(fields, values);
};
