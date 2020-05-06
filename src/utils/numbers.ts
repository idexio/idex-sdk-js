import JSBI from 'jsbi';

import { BigNumber, BigNumberClass } from './BigNumber';

const exchangeDecimals = 8;

export function createRandomNumber(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Returns the given number of pips as a floating point number with 8 decimals.
 * Examples:
 * BigInt(12345678) => '0.12345678'
 * BigInt(123456789) => '1.23456789'
 * BigInt(100000000) => '1.00000000'
 * BigInt(120000000) => '1.20000000'
 * BigInt(1) => '0.00000001'
 */
export const pipToDecimal = function pipToDecimal(pips: JSBI): string {
  const bn = BigNumber(pips.toString());
  return bn.shiftedBy(exchangeDecimals * -1).toFixed(exchangeDecimals);
};

/**
 * The exact inverse of pipToDecimal. Truncates anything beyond 8 decimals.
 */
export const decimalToPip = function decimalToPip(decimal: string): JSBI {
  const bn = BigNumber(decimal);
  return JSBI.BigInt(
    bn
      .shiftedBy(exchangeDecimals)
      .integerValue(BigNumberClass.ROUND_DOWN)
      .toString(),
  );
};

export const maxBigInt = function maxBigInt(bigints: JSBI[]): JSBI | null {
  if (bigints.length === 0) {
    return null;
  }
  return bigints.reduce(
    (max, current) => (JSBI.GT(current, max) ? current : max),
    bigints[0],
  );
};

// Trim to deicmals without rounding
export const trimToXDecimals = (number: number, decimals: number): number => {
  const stringNumber = Number(number)
    .toFixed(decimals + 1)
    .slice(0, -1);
  return Number(stringNumber);
};
