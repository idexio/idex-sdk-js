// @ts-check

/** @type {import('prettier').Options} */
const config = {
  bracketSpacing: true,
  singleQuote: true,
  trailingComma: 'all',
  plugins: ['prettier-plugin-package'],
  experimentalTernaries: true,
};

module.exports = config;
