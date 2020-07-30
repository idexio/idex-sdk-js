module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.eslint.json',
  },
  extends: [
    'airbnb-base',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/typescript',
    'prettier',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
  ],
  globals: { BigInt: true },
  rules: {
    '@typescript-eslint/no-use-before-define': 'off',
    'comma-dangle': ['error', 'always-multiline'],
    'consistent-return': 'off',
    curly: ['error', 'all'],
    'no-restricted-syntax': 'off',
    'no-multi-assign': 'off',
    'no-use-before-define': 'off',
    'no-console': 'off',
    'no-underscore-dangle': 'off',

    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        ts: 'never',
      },
    ],
    // typescript type imports suffer from this
    'import/no-cycle': 'off',
    'import/prefer-default-export': 'off',
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: ['dev/**'],
      },
    ],
    'prettier/prettier': ['error'],
    quotes: ['error', 'single'],
  },
  plugins: ['import', 'promise', 'prettier', '@typescript-eslint'],
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
        project: './tsconfig.eslint.json',
      },
    },
  },
};
