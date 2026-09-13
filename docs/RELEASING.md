# Releasing Folder Fairy

## Quality gate

Run:

```sh
npm ci
npm run verify
```

`verify` checks formatting, current Obsidian lint rules with zero warnings, unit coverage, TypeScript, the production bundle, manifest rules, version consistency, required release assets, and the CSS review rules for `!important` and `:has()`. Check development dependencies with `npm audit` when updating the toolchain.

## New installation identity

Starting with 2.0.0, the plugin ID is `icon-studio` and releases are published from `t1seo/icon-studio`. The old `t1seo/obsidian-icon-studio` repository and its `custom-icon` releases remain intact. Users of the previous identity need the [migration guide](MIGRATING.md).

`versions.json` only lists versions published from the new repository. Historical changelog entries describe releases in the old repository; do not push their tags to the new one.

## Published 2.0.3 release

Version 2.0.3 was published from commit `3c8c5cb22ffafe4c902ebcb3caff41c6ba67ad18`. Its CI and release workflow passed. In the transition checkout, `origin` still points to the previous repository and `relaunch` points to the new repository. Future pushes from this checkout must explicitly use `relaunch`.

For future releases, verify that the new repository's default branch is `main` and its CI passed before pushing a new tag. The tag must exactly match `manifest.json`, without a `v` prefix. Pushing it starts the release workflow, verifies the plugin, attests the artifacts, and publishes a GitHub release containing:

- `main.js`
- `manifest.json`
- `styles.css`

Versions 2.0.0 through 2.0.3 are already published and must not be retagged. Version 2.0.1 changed the display name to Folder Fairy after the directory rejected the occupied Icon Studio name. Version 2.0.2 corrected `minAppVersion` to 1.5.7. Version 2.0.3 resolves review warnings and fixes window ownership and cleanup, while retaining that minimum version and the existing data format. Keep historical compatibility entries intact when adding a new version.

## Prepare a future version

In a fresh clone of `t1seo/icon-studio`, update `CHANGELOG.md`, then use npm's version command so `package.json`, `manifest.json`, and `versions.json` stay aligned. Synchronize the committed sample manifest too:

```sh
npm version patch --no-git-tag-version # or: minor
cp manifest.json examples/programming-languages-vault/.obsidian/plugins/icon-studio/manifest.json
git add package.json package-lock.json manifest.json versions.json CHANGELOG.md examples/programming-languages-vault/.obsidian/plugins/icon-studio/manifest.json
npm run verify
git commit -m "🔖 chore: prepare release"
git tag <new-version>
git push origin main
git push origin <new-version>
```

The repository `.npmrc` keeps npm's tag prefix empty. In the transition checkout, use `relaunch` in place of `origin`. Never use `--tags`, which would publish legacy tags into the new repository.

## Verify the release

Confirm that the release tag matches `manifest.json`, download all three assets anonymously, compare them to the verified build, and verify their GitHub attestations. Install through Obsidian Community Plugins in a backed-up disposable vault and exercise the changed behavior in both Live Preview and Reading view before announcing the release. Record Community installation separately from BRAT or manual copying. Obsidian may append a `/* nosourcemap */` comment to installed `main.js`; account for that exact suffix when comparing installed files to release assets.

## Community directory

Initial submission happens through [community.obsidian.md](https://community.obsidian.md), not through a pull request to `obsidianmd/obsidian-releases`.

1. Sign in with an Obsidian account.
2. Connect the GitHub account that owns `t1seo/icon-studio` so the directory can verify repository access.
3. Open **Plugins**, select **New plugin**, and enter `https://github.com/t1seo/icon-studio`.
4. Select the Community directory **Owner**: either the signed-in submitter or an eligible organization they belong to.
5. Review and accept the Developer policies, then confirm continued support or removal/transfer if support can no longer be provided.
6. Submit the entry, run the preview scan or request review, and resolve any blocking scanner errors with a new incremented release.

Describe this as the same maintainer's successor to `custom-icon`, including the old incomplete automated review and manual rename request. A new ID does not replace review or guarantee approval. The listing icon selector only supports built-in glyphs, so use the purple `folder-heart` glyph; use the folder-fairy PNG in the overview and screenshots.

The first listing requires an Obsidian account connected to the repository owner's GitHub account. Later versions are discovered from GitHub releases. Record separately whether the GitHub release exists, the new entry was accepted, review passed, and installation is enabled. While review is pending, keep BRAT/manual installation instructions available.

The supported way to retire the old directory entry is **More actions → Archive → Yes, archive**. Preserve the original GitHub repository and releases. The September 13 attempt confirmed that archiving does not free the old display name. Use the new Folder Fairy name; do not repeat the archive/retry experiment. Archive the old entry after the successor is accepted.
