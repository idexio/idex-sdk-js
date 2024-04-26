import * as chai from 'chai';

const { expect } = chai;

export const assertBigintsEqual = (
  a: unknown,
  b: unknown,
  message = '',
): void => {
  if (typeof a !== 'bigint') {
    throw new Error(`First argument: Expected bigint, got ${String(a)}`);
  }
  if (typeof b !== 'bigint') {
    throw new Error(`Second argument: Expected bigint, got ${String(b)}`);
  }
  expect(a.toString()).to.eql(
    b.toString(),
    `${message}Expected ${b.toString()}, got ${a.toString()}`,
  );
};
