// @ts-check
const { FlatCompat } = require('@eslint/eslintrc');
const eslint = require('@eslint/js');
const globals = require('globals');
const tseslint = require('typescript-eslint');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: undefined,
  allConfig: undefined,
});

const config = tseslint.config(
  {
    // config with just ignores is the replacement for `.eslintignore`
    ignores: [
      '**/node_modules/**',
      '**/build/**',
      '**/dist/**',
      '.DS_Store',
      '.eslintcache',
      '**/typechain-types/**',
      '**/debug/**',
    ],
  },

  eslint.configs.recommended,
  ...compat.extends('eslint-config-airbnb-base', 'plugin:import/typescript'),

  {
    linterOptions: {
      reportUnusedDisableDirectives: 'warn',
    },
    files: ['**/*.ts', '**/*.cjs', '**/*.js'],
    extends: [...tseslint.configs.recommended],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: __dirname,
      },
    },
    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts'],
      },
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
    rules: {
      camelcase: 'off',
      'default-param-last': 'off',
      'no-console': 'off',
      'import/no-cycle': 'warn',
      'no-nested-ternary': 'off',
      'no-multi-assign': 'off',
      'no-restricted-exports': 'off',
      'no-restricted-syntax': 'off',
      'no-shadow': 'off',
      'no-underscore-dangle': 'off',
      'no-use-before-define': 'off',
      'no-empty-function': 'off',
      'no-useless-constructor': 'off',
      'class-methods-use-this': 'off',
      'consistent-return': 'off',
      // prefers => value over => { return value }
      'arrow-body-style': 'off',
      'prefer-arrow-callback': 'off',
      // 'no-only-tests/no-only-tests': 'error',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/default-param-last': 'error',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/ban-types': [
        'error',
        {
          types: {
            // `{} & Type` is more usable version of NonNullable<Type>
            '{}': false,
          },
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          disallowTypeAnnotations: false,
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-shadow': 'error',
      'import/prefer-default-export': 'off',
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            'dev/**',
            'src/tests/**/*',
            'eslint.config.cjs',
            '.prettierc.cjs',
            'release.config.cjs',
          ],
        },
      ],
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'never',
          jsx: 'never',
          ts: 'never',
          tsx: 'never',
          mjs: 'never',
          cjs: 'always',
        },
      ],
      'import/order': [
        'error',
        {
          // warnOnUnassignedImports: true,
          'newlines-between': 'always',
          groups: [
            'unknown',
            'builtin',
            'external',

            'internal',

            'parent',
            'sibling',
            'index',

            'object',

            'type',
          ],
          pathGroupsExcludedImportTypes: ['type'],
          alphabetize: {
            order:
              'asc' /* sort in ascending order. Options: ['ignore', 'asc', 'desc'] */,
            caseInsensitive: true /* ignore case. Options: [true, false] */,
          },
          pathGroups: [
            {
              pattern: '#*',
              group: 'internal',
              position: 'before',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.cjs', '**/*.js'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.commonjs,
      },
    },
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
    },
  },

  {
    files: ['src/tests/**/*.ts'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      globals: {
        ...globals.mocha,
      },
    },
    rules: {
      // 'no-only-tests/no-only-tests': 'error',
      'no-unused-expressions': 'off',
      'no-await-in-loop': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  ...compat.extends('eslint-config-prettier'),
);

module.exports = config;
