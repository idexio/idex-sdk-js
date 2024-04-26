// @ts-check

// https://typedoc.org/guides/options/
/** @type {Partial<import('typedoc').TypeDocOptions>} */
const config = {
  name: 'IDEX SDK Reference',
  entryPoints: ['../src'],
  githubPages: true,
  out: '../docs',
  includeVersion: false,
  excludePrivate: true,
  excludeProtected: true,
  excludeInternal: true,
  excludeExternals: true,
  hideGenerator: false,
  excludeNotDocumented: true,
  hideParameterTypesInTitle: false,
  // this would be ideal but it makes the behavior
  // diverge from standard IDE handling of links.
  preserveLinkText: false,
  categorizeByGroup: false,
  searchInComments: true,
  useTsLinkResolution: true,
  media: '../assets/',
  customCss: '../dev/css-includes/docs.css',
  entryPointStrategy: 'resolve',
  navigation: {
    includeCategories: true,
    includeGroups: true,
    includeFolders: true,
  },
  favicon: 'assets/favicon.ico',
  customDescription: `IDEX v4's TypeScript/Javascript Developer SDK Reference, designed for low-latency and guaranteed execution in a secure trading environment. This documentation outlines a platform where control and transparency are paramount, offering gas-free settlements and Ethereum-backed security. Ensuring only you have the power to move funds, it exemplifies a commitment to security and efficiency for developers seeking robust integration solutions`,
  footerLastModified: true,
  sort: ['required-first', 'source-order'],
  // navigationLinks: {},
  sidebarLinks: {
    'IDEX Home': 'https://idex.io',
    'IDEX API Docs': 'https://api-docs-v4.idex.io',
    'SDK GitHub': 'https://github.com/idexio/idex-sdk-js',
    'Exchange Sandbox': 'https://exchange-sandbox.idex.io',
  },
  visibilityFilters: {
    protected: false,
    private: false,
    inherited: true,
    external: false,
    '@deprecated': false,
  },
  // internalModule: 'unexported / internal',
  // theme: 'default-modern',
  // theme: 'navigation',
  plugin: [
    'typedoc-plugin-missing-exports',
    'typedoc-plugin-mdn-links',
    'typedoc-plugin-extras',
    // 'typedoc-plugin-coverage',
    // 'typedoc-plugin-markdown',
    // '../dev/custom-plugins/plugin.mjs',
    // 'typedoc-plugin-external-resolver',
    // "typedoc-umlclass"
    // 'typedoc-theme-category-nav',
    // "typedoc-plugin-merge-modules"
  ],

  // include base types and other last
  categoryOrder: ['API Clients', '*', 'Signatures', 'Base Types', 'Other'],
  includes: '../dev/doc-includes',
  cacheBust: true,

  searchCategoryBoosts: {
    'API Clients': 1.5,
    'Enums - Request Parameters': 1.4,
    'Enums - Response Properties': 1.3,
    'IDEX Interfaces': 1.2,
    'WebSocket - Message Types': 1.2,
  },

  // sortEntryPoints: false,
  externalSymbolLinkMappings: {
    ethers: {
      Provider: 'https://docs.ethers.org/v6/api/providers/#Provider',
      JsonRpcProvider:
        'https://docs.ethers.org/v6/api/providers/jsonrpc/#JsonRpcProvider',
      JsonRpcSigner:
        'https://docs.ethers.org/v6/api/providers/jsonrpc/#JsonRpcSigner',
      Signer: 'https://docs.ethers.org/v6/api/providers/#Signer',
      TypedDataDomain:
        'https://docs.ethers.org/v6/api/hashing/#TypedDataDomain',
      TypedDataField: 'https://docs.ethers.org/v6/api/hashing/#TypedDataField',
      '*': 'https://docs.ethers.org/v6/api/',
    },
  },
};

module.exports = config;
