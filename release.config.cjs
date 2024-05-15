// @ts-check

/** @type {import('semantic-release').Options} */
const config = {
  branches: [
    'main',
    { name: 'beta', prerelease: true },
    { name: 'alpha', prerelease: true },
  ],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'conventionalcommits',
      },
    ],
    // if the github action freezes
    // on this step, comment it out for
    // the release as there is likely
    // something causing it to fail
    //
    // it should work again after
    [
      '@semantic-release/release-notes-generator',
      {
        preset: 'conventionalcommits',
      },
    ],
    // set package.json version based on commits then publish
    '@semantic-release/npm',
    [
      // commits the changed files to git
      '@semantic-release/git',
      {
        assets: ['package.json', 'README.md'],
      },
    ],
    // creates the github release
    '@semantic-release/github',
    [
      '@qiwi/semantic-release-gh-pages-plugin',
      {
        msg: 'docs: update docs to <%= nextRelease.gitTag %>',
        branches: [['beta', 'docs']],
      },
    ],
  ],
};

module.exports = config;
