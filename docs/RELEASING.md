# Releasing Icon Fairy

## Quality gate

Run:

```sh
npm ci
npm run verify
```

`verify` checks formatting, current Obsidian lint rules with zero warnings, unit coverage, TypeScript, the production bundle, canonical identity, version consistency, sample configuration and assets, required release assets, and the CSS review rules for `!important` and `:has()`. Check development dependencies with `npm audit` when updating the toolchain.

## Installation identity

Starting with 3.0.0, the product name is **Icon Fairy**, the plugin ID is `icon-fairy`, and releases belong to `t1seo/icon-fairy`. The minimum Obsidian version remains 1.5.7. The previous repositories and releases are preserved:

| Previous identity | Repository | Plugin ID |
| --- | --- | --- |
| Folder Fairy 2.x | `t1seo/icon-studio` | `icon-studio` |
| Custom Icon / Icon Studio 1.x | `t1seo/obsidian-icon-studio` | `custom-icon` |

Users of either previous identity need the [migration guide](MIGRATING.md). The new `versions.json` begins with 3.0.0 and only lists versions released from `t1seo/icon-fairy`. Historical changelog entries and git history remain available; do not publish previous release tags to the new repository.

In the transition checkout, `origin` points to `t1seo/obsidian-icon-studio`, `relaunch` points to `t1seo/icon-studio`, and **`fairy` must point to `t1seo/icon-fairy`**. Every push from this checkout must explicitly use `fairy`. Do not push to either previous remote or use `--tags`.

After the new release and Community installation are verified, the local remote names can be aligned for ordinary development: preserve the previous remotes as `legacy-custom-icon` and `legacy-folder-fairy`, and rename `fairy` to `origin`. This changes local aliases only; it does not rename or modify either previous GitHub repository or its refs. Verify the resulting URLs and use the canonical `origin` for subsequent releases once that transition is complete.

## Prepare the first 3.0.0 release

The 3.0.0 release and new Community entry are being prepared. Before publishing, confirm that the version in `package.json`, `package-lock.json`, `manifest.json`, `versions.json`, and the committed sample manifest is 3.0.0. Verify that the A2 mark, sample logo, README screenshots, and current product name agree.

After the public `t1seo/icon-fairy` repository exists and the `fairy` remote is configured, commit the verified product files and push the default branch:

```sh
git remote get-url fairy
npm run verify
git push fairy HEAD:main
```

Confirm that `main` is the default branch and its CI passed. Check that 3.0.0 has not already been tagged or released, then publish exactly that new tag:

```sh
git tag 3.0.0
git push fairy 3.0.0
```

The tag must exactly match `manifest.json`, without a `v` prefix. Pushing it starts the release workflow, verifies the plugin, attests the artifacts, and publishes a GitHub release containing:

- `main.js`
- `manifest.json`
- `styles.css`

After a version has been published, never move or replace its tag. Fix any subsequent problem in an incremented release.

## Prepare later versions

Update `CHANGELOG.md`, then use npm's version command so `package.json`, `manifest.json`, and `versions.json` stay aligned. Synchronize the committed sample manifest too:

```sh
npm version patch --no-git-tag-version # or: minor
cp manifest.json examples/programming-languages-vault/.obsidian/plugins/icon-fairy/manifest.json
git add package.json package-lock.json manifest.json versions.json CHANGELOG.md examples/programming-languages-vault/.obsidian/plugins/icon-fairy/manifest.json
npm run verify
git commit -m "🔖 chore: prepare release"
git push fairy HEAD:main
```

Wait for CI to pass on the pushed commit, then tag the new manifest version and push only that tag to `fairy`. Keep existing compatibility entries intact. The repository `.npmrc` keeps npm's tag prefix empty. A fresh clone of `t1seo/icon-fairy` can use its own `origin`, but confirm the remote URL first; that is a different remote arrangement from this transition checkout.

## Verify the release

Confirm that the release tag matches `manifest.json`, download all three assets anonymously, compare them to the verified build, and verify their GitHub attestations against `t1seo/icon-fairy`. Install through Obsidian Community Plugins in a backed-up disposable vault and exercise the changed behavior in both Live Preview and Reading view before announcing the release. Record Community installation separately from BRAT or manual copying. Obsidian may append a `/* nosourcemap */` comment to installed `main.js`; account for that exact suffix when comparing installed files to release assets.

For 3.0.0, verify a fresh installation plus separate migrations from each previous identity. Confirm that the new plugin is the only active renderer, existing source data remains unchanged, and the user can assign a hotkey to an `icon-fairy:` command. Do not merge the two migration sources.

## Community directory

Initial submission happens through [community.obsidian.md](https://community.obsidian.md), not through a pull request to `obsidianmd/obsidian-releases`.

1. Sign in with an Obsidian account.
2. Connect the GitHub account that owns `t1seo/icon-fairy` so the directory can verify repository access.
3. Open **Plugins**, select **New plugin**, and enter `https://github.com/t1seo/icon-fairy`.
4. Select the Community directory **Owner**: either the signed-in submitter or an eligible organization they belong to.
5. Review and accept the Developer policies, then confirm continued support or removal/transfer if support can no longer be provided.
6. Submit the entry, run the preview scan or request review, and resolve scanner errors and warnings with a new incremented release.

Describe Icon Fairy as the same maintainer's successor to both Folder Fairy (`icon-studio`) and Custom Icon / Icon Studio (`custom-icon`). A new ID does not replace review or guarantee approval. The listing icon selector supports built-in glyphs; choose one that suits the A2 folder character, and use the original A2 PNG and actual Icon Fairy screenshots in the overview.

Later versions are discovered from GitHub releases. Record separately whether the GitHub release exists, the new entry was accepted, the exact release's automated review passed with zero errors and warnings, and catalog installation works. Automated review does not mean manual approval by Obsidian staff. Keep pending status explicit until each check is complete.

Only after the Icon Fairy entry is publicly discoverable, installs and enables successfully, and passes review, archive the superseded Folder Fairy entry through **More actions → Archive → Yes, archive**. Preserve both previous GitHub repositories and releases, and leave the already archived `custom-icon` entry unchanged. Archiving does not free an old display name; do not repeat the previous archive-and-retry experiment.
