import BigNumberJs from 'bignumber.js';

// There is bug which prevents creating instances
// https://github.com/MikeMcl/bignumber.js/issues/251

const createInstance = (params: string | number) => new BigNumberJs(params);

export const BigNumber = createInstance;

export const BigNumberClass = BigNumberJs;
