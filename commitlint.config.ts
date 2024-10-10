import type { UserConfig } from '@commitlint/types';

const config: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-max-line-length': [0],
    'body-leading-blank': [0],
    'header-max-length': [0],
  },
};

export default config;
