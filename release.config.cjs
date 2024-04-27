// @ts-check

// const { chunkifyString } = require('semantic-release-slack-bot/lib/chunkifier');
// const slackifyMarkdown = require('slackify-markdown');

// const onSuccessFunction = (
//   pluginConfig,
//   /** @type {import('semantic-release').SuccessContext} */
//   context,
// ) => {
//   const releaseNotes =
//     context.nextRelease?.notes ?
//       slackifyMarkdown(context.nextRelease.notes)
//     : '';
//   const text = `Updates have been released to *${context.branch.name}*`;
//   const headerBlock = {
//     type: 'section',
//     text: {
//       type: 'mrkdwn',
//       text,
//     },
//   };

//   try {
//     return {
//       text,
//       blocks: [
//         headerBlock,
//         ...(releaseNotes.length >= 2000 ?
//           chunkifyString(releaseNotes, 2900).map((chunk) => {
//             return {
//               type: 'section',
//               text: {
//                 type: 'mrkdwn',
//                 text: chunk,
//               },
//             };
//           })
//         : releaseNotes ?
//           [
//             {
//               type: 'section',
//               text: {
//                 type: 'mrkdwn',
//                 text: releaseNotes,
//               },
//             },
//           ]
//         : []),
//       ],
//     };
//   } catch (err) {
//     return {
//       text,
//       blocks: [
//         headerBlock,
//         {
//           type: 'section',
//           text: {
//             type: 'mrkdwn',
//             text: '- Failed to chunkify release notes!',
//           },
//         },
//       ],
//     };
//   }
// };

/** @type {import('semantic-release').Options} */
const config = {
  branches: [
    '+([0-9])?(.{+([0-9]),x}).x',
    'main',
    'next',
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
    // [
    //   '@semantic-release/release-notes-generator',
    //   {
    //     preset: 'conventionalcommits',
    //   },
    // ],
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
        branches: [['main', 'docs']],
      },
    ],
    // [
    //   'semantic-release-slack-bot',
    //   {
    //     notifyOnSuccess: true,
    //     notifyOnFail: true,
    //     // onSuccessFunction,
    //   },
    // ],
  ],
};

module.exports = config;
