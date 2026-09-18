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

The release checkout now uses `origin` for `https://github.com/t1seo/icon-fairy.git`. Its previous remote aliases are preserved as `legacy-custom-icon` (`t1seo/obsidian-icon-studio`) and `legacy-folder-fairy` (`t1seo/icon-studio`). Only local aliases changed; neither previous repository nor its refs were modified. Confirm `git remote -v` before pushing, use the canonical `origin`, and do not push to a legacy remote or use `--tags`.

## Published 3.0.0 release

[Icon Fairy 3.0.0](https://github.com/t1seo/icon-fairy/releases/tag/3.0.0) was published from commit `2521d51704c26801321d9bb0c0d518dd47837f19` on September 13, 2026. CI and the attesting release workflow passed, and anonymous downloads match the app-tested candidate. The actual Community submission uses **Icon Fairy / icon-fairy / t1seo/icon-fairy**; the exact 3.0.0 automated review completed with zero errors and warnings. Native Community search, installation, and activation succeeded after catalog synchronization. The superseded Folder Fairy listing was then archived. See the [release audit](research/obsidian-community-release.md) for the evidence and timeline.

The tag exactly matches `manifest.json`, without a `v` prefix. The release contains:

- `main.js`
- `manifest.json`
- `styles.css`

Never move or replace the published 3.0.0 tag. Fix any subsequent problem in an incremented release. Later tag pushes start the same workflow, verify the plugin, attest the three artifacts, and create the matching GitHub release.

## Prepare later versions

On a release branch, update `CHANGELOG.md`, then use npm's version command so `package.json`, `manifest.json`, and `versions.json` stay aligned. Synchronize the committed sample manifest and stylesheet too:

```sh
npm version patch --no-git-tag-version # or: minor
cp manifest.json examples/programming-languages-vault/.obsidian/plugins/icon-fairy/manifest.json
cp styles.css examples/programming-languages-vault/.obsidian/plugins/icon-fairy/styles.css
git add package.json package-lock.json manifest.json versions.json CHANGELOG.md examples/programming-languages-vault/.obsidian/plugins/icon-fairy/manifest.json examples/programming-languages-vault/.obsidian/plugins/icon-fairy/styles.css
npm run verify
git commit -m "🔖 chore: prepare release"
git push -u origin HEAD
```

Open a pull request to `main`, complete review, and wait for all six CI checks to pass before merging. Fetch the merged commit, confirm its runtime files match the app-tested candidate, then tag that commit with the new manifest version and push only that tag to `origin`. Keep existing compatibility entries intact. The repository `.npmrc` keeps npm's tag prefix empty. Confirm that `origin` points to `t1seo/icon-fairy` in every checkout.

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

Describe Icon Fairy as the same maintainer's successor to both Folder Fairy (`icon-studio`) and Custom Icon / Icon Studio (`custom-icon`). A new ID does not replace review or guarantee approval. Keep the listing’s white `folder-heart` glyph and orange-to-purple tile consistent with the [current SVG/PNG mark](BRAND.md). Use actual light-mode Icon Fairy screenshots in the overview. Branding and documentation updates do not replace the published 3.0.0 tag or its release assets.

Later versions are discovered from GitHub releases. Record separately whether the GitHub release exists, the new entry was accepted, the exact release's automated review passed with zero errors and warnings, and catalog installation works. Automated review does not mean manual approval by Obsidian staff. Keep pending status explicit until each check is complete.

The superseded Folder Fairy entry was archived through **More actions → Archive → Yes, archive** only after Icon Fairy was publicly discoverable, passed review, and installed and enabled successfully. Both previous GitHub repositories and releases are preserved; the previously archived `custom-icon` entry remains unchanged. Archiving does not free an old display name; do not repeat the previous archive-and-retry experiment.
