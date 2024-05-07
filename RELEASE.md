# Release Documentation

We use [semantic-release](https://semantic-release.gitbook.io/semantic-release) for handling our release process with some automated scripts on top of it to make it easier for us to release new versions of the SDK.

> **CRITICALLY** , a manual release must never be done via `npm public` or the release process will break (see semantic release docs for more details)

Specifically, we have `idex-bot` which will automatically open PR's to handle the transitions into the `main` release branch as we transition from `beta`, and `alpha` pre-releases.

- When adding a commit to `beta` or `alpha`, the bot will check if a PR already exists to transition the pre-release to the next stage and open one if it doesn't exist (see [Example PR](https://github.com/idexio/idex-sdk-js/pull/311)

## Versioning

Follows [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)

- `fix:` prefixed commits will increment `patch` `vx.x.N`
- `feat:` prefixed commits will increment `minor` `vx.N.0`
- `BREAKING CHANGE(S)` in the commit message body will increment `major` `vN.x.x`
- `chore`, `docs`, `style`, `perf`, `test` and `build` commits will not trigger a release

## Release Notes

Release notes are automatically generated and added to the release PR based on the commit using conventional commits.

> **NOTE**: There is a bug in the generator at times where the `generateNotes` step will fail silently, causing a release to not be created. You can see an example by looking at the `Semantic Release` step in github actions (see [Example](https://github.com/idexio/idex-sdk-js/actions/runs/8963899307/job/24614859968)) where it simply stops silently after it gets to the `generateNotes`.  
> It is not known what causes this but seems related to [this issue](https://github.com/semantic-release/release-notes-generator/issues/459)
>
> The solution if this comes up as of now is seen in the release.config.cjs file, we have to comment out release notes generator plugin and do a release then uncomment it out after. I have posted in the linked issue hoping to help with a solution.
