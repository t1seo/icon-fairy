# Archived: Icon Studio new-ID relaunch

This is the historical plan and execution record from September 13, 2026. Its names, repositories, commands, and release status describe that earlier launch and are superseded by **Icon Fairy** (`icon-fairy`, `t1seo/icon-fairy`). See the [current release procedure](../docs/RELEASING.md) and [verified Community release status](../docs/research/obsidian-community-release.md) for current instructions. The active logo is the [folder-heart mark](../docs/BRAND.md).

## TL;DR

- Publish the maintainer-owned successor as `t1seo/icon-studio`, plugin ID `icon-studio`, version `2.0.0`, with a folder-fairy logo.
- Preserve `t1seo/obsidian-icon-studio`, its releases, and users' legacy data. Archive the old Community entry through its supported UI; do not delete GitHub history or user data.
- Effort: Medium. Parallel: metadata/sample preparation and logo preparation; release/submission follow verified assets.
- Critical path: new identity and assets → local and Obsidian QA → new GitHub release → Community submission/review → verified installation status.

## Context and decisions

The user explicitly requested a fresh Obsidian launch with a different plugin ID, and a folder-fairy logo using `ip-as-logo`. Root selected a separate new repository after confirming `t1seo/icon-studio` was absent. The old `custom-icon` entry has a failed automated review and an open manual request concerning the earlier product-name change. This history must be disclosed in the successor submission; changing IDs does not waive reviews or guarantee approval.

- Keep the product name **Icon Studio** and npm package name `obsidian-icon-studio`; the release checker derives that package name from the display name.
- Use local branch `release/icon-studio-new-id` and additional remote `relaunch`. Keep `origin` unchanged. Publish the new branch as the new remote's `main`; do not push changes or new tags to the old remote.
- Use `2.0.0` with no `v` prefix. New `versions.json` lists only `2.0.0: 1.4.0`, because old release assets will not exist in the new repository. Preserve prior history in Git and historical changelog entries.
- Leave CSS/DOM identifiers `custom-icon-*`, `CSS_PREFIX`, relative command names, and `:ci-...:` note syntax unchanged.
- No automatic data migration is required. Document and verify a backup-first copy of `data.json`, `icon-library.json`, and `icons/` between plugin directories. Old and new plugins must not be enabled together. Existing hotkeys require reassignment because their full command IDs change.
- Root owns portal actions and the selected logo decision; logo workers own `assets/logo-candidates/`. The default candidate is A1 if no later user selection supersedes it.

### Metis review incorporated

- The new repository name is independent from the npm package name expected by `scripts/check-release.mjs`.
- CI only triggers for the remote `main` branch. Explicitly create and verify the new repository's default `main` branch before tagging.
- Public registry absence is not proof that the portal ID or display name is available. Treat submission validation as the authoritative availability check.
- Actual Obsidian interaction is required: jsdom tests exclude the plugin entrypoint and most Obsidian UI.

## Objectives and guardrails

Deliver: updated metadata, current English/Korean setup and migration instructions, a consistent sample vault and logo, an attested `2.0.0` GitHub release, and the most advanced valid Community submission state the portal allows.

Completion evidence must distinguish **GitHub release available**, **Community submission accepted**, **review approved**, and **public installation working**. A pending administrator review is an external dependency, not successful public availability.

Do not delete the old repository/releases or user data; bulk-replace `custom-icon`; amend/rewrite old tags; claim the plugin is unrelated to its predecessor; fabricate approval; push historical tags to the new repository; or send Slack/email/Discord messages without explicit authorization. Avoid feature work and runtime refactors unless a real scanner failure blocks this release.

## Verification strategy

- Existing automated gate: `npm ci` then `npm run verify` (Biome, Obsidian ESLint, Vitest coverage, TypeScript, production build, release checks).
- No new test infrastructure or implementation-mirroring tests for metadata/logo changes. Use targeted read-only metadata assertions and real Obsidian QA.
- Store dated QA output and screenshots in an isolated evidence directory, and update `docs/QA.md` with new results without presenting the August 19 QA as current.
- Use disposable vault copies only; never the user's working vault. Compare legacy data hashes before/after migration and startup.

## Execution and dependencies

| Task | Depends on | Responsibility |
|---|---|---|
| 1. Establish release branch and new identity | none | Root/metadata executor |
| 2. Apply folder-fairy branding | candidate assets | Logo owner plus root integration |
| 3. Update sample and migration instructions | 1; selected logo for sample | Root/documentation executor |
| 4. Verify package and Obsidian behavior | 1–3 | Root/QA executor |
| 5. Publish new repository and release | 4 | Root |
| 6. Submit successor and retire old listing | 5 | Root, authenticated portal |
| 7. Record verified status | 5–6 | Root |

## TODOs

- [x] 1. Establish the release branch and consistent new identity.

  **Do:** Before moving sample files, snapshot the legacy sample's data/library/icons outside the repo and record hashes. Create `release/icon-studio-new-id` without discarding in-progress logo files. Set root manifest ID/version to `icon-studio`/`2.0.0`; synchronize package and lockfile versions; keep package name; set versions map to the sole new release; add a dated 2.0.0 changelog section explaining the breaking installation identity and repository. Preserve historical sections and old issue links.

  **References:** `manifest.json:2`, `package.json:2`, `package-lock.json:2`, `versions.json`, `CHANGELOG.md:9`, `scripts/check-release.mjs:24`, `src/main.ts:30`.

  **Acceptance/QA:** Read all metadata as JSON and assert the selected ID, matching versions, package name, and sole versions-map entry. Confirm `git remote get-url origin` still points to the old repo and `git tag --list 2.0.0` is empty before creating the new tag. Edge: do not overwrite an existing branch/tag or conflicting user changes; inspect and choose a non-destructive existing equivalent. Save identity assertions and legacy hashes as evidence. Commit with tasks 2–3 after QA.

- [x] 2. Apply the selected folder-fairy mark.

  **Do:** Integrate the user-selected candidate, otherwise root's stated A1 default. Use the raster as `assets/icon-studio-mark.png` and change current README logo links accordingly. Update `docs/BRAND.md` to describe the real chosen character/colors. Make the sample's `icon-studio` library icon a PNG with matching metadata; retain its logical icon ID. Preserve provenance/candidates according to their owning workers; do not fabricate a vector version.

  **References:** `README.md:4`, `README.ko.md:4`, `docs/BRAND.md:22`, `assets/logo-candidates/A1.png`, `examples/programming-languages-vault/.obsidian/plugins/custom-icon/icon-library.json:4` (moves in task 3).

  **Acceptance/QA:** Open the mark at full and small display sizes; confirm an identifiable folder fairy, uncropped intended composition, and working README image path. Open the new sample library and its Welcome note to verify the same mark renders. Edge: verify the PNG `ext`/`path` is correct and the old SVG path is not still the active logo reference. Capture logo and sample screenshots. Commit with tasks 1/3.

- [x] 3. Update sample paths and new-install/migration documentation.

  **Do:** Move the tracked sample plugin directory to `.obsidian/plugins/icon-studio/`, copy the root manifest into it, set sample community plugin ID, and update `.gitignore` data/library/icons exceptions including PNG. Update both READMEs' active CI/release/issues/BRAT links to `t1seo/icon-studio`, new install/data paths, and accurate pending-publication status. Update `docs/SAMPLE-VAULT.md`, `docs/BRAND.md`, and `docs/RELEASING.md` for the new remote/main/2.0.0 procedure. Append dated successor context to release research records instead of rewriting old events.

  **Migration instructions:** Back up the vault and old `.obsidian/plugins/custom-icon/` first. Disable the old plugin; install the new plugin from the new repo, then fully close Obsidian. Into a fresh new plugin directory, copy only old `data.json`, `icon-library.json`, and `icons/`; preserve the new `manifest.json`, `main.js`, and `styles.css`. Do not overwrite existing new-ID user data; resolve that as a separate manual merge. Reopen, enable only the new ID, verify content, and rebind hotkeys. Explain old BRAT subscriptions do not migrate: add the new repository. Keep the old folder and notes intact.

  **References:** `.gitignore:24`, `README.md:120`, `README.ko.md:120`, `docs/SAMPLE-VAULT.md:8`, `docs/RELEASING.md:14`, `docs/BRAND.md:14`, `docs/research/obsidian-community-release.md:7`, `docs/research/github-feedback.md:28`, `src/services/IconLibraryService.ts:107`.

  **Acceptance/QA:** Assert sample folder name/root manifest/sample manifest/community JSON ID agree and all seven library entries resolve to nonempty files. Inspect `git ls-files`/`git check-ignore` to ensure sample data and PNG will be tracked. Search active docs for obsolete install/update guarantees; historical references may remain when labeled. Edge: explain fresh installs start empty and old hotkeys/BRAT do not automatically transfer. Save assertions and documentation review evidence. Commit with tasks 1/2.

- [x] 4. Verify the new package and both installation paths.

  **Do:** Run `npm ci` and `npm run verify`; separately assert sample consistency because the release checker does not cover it. Use one empty disposable vault for a new install and a second legacy-fixture copy for documented migration. Record actual results in `docs/QA.md`, preserving the historical 1.3.1 evidence as dated history.

  **References:** `package.json:17`, `vitest.config.ts:11`, `docs/QA.md:9`, `docs/SAMPLE-VAULT.md:14`, `src/main.ts:84`, `src/main.ts:96`.

  **Happy QA:** Fresh vault: install under `icon-studio`, enable it, see exactly three Icon Studio commands, import a specific SVG/PNG, assign a folder and note, insert `:ci-...:`, add an annotation, view Live Preview and Reading view, close/reopen and verify persistence. Migrated vault: copy the preserved legacy data subset with Obsidian closed, enable new ID only, verify all seven legacy library items, language folder/note/tab/title assignments, 24px/ci settings, and existing TypeScript annotation; edit/reload an annotation to prove writes use the new folder.

  **Edge QA:** In a fresh vault, the old folder must not be created. In a migrated vault, legacy data/library/image hashes must equal their pre-test snapshot and notes must not be rewritten by installation. Disable/re-enable the new plugin and confirm there are no duplicate commands/icons. Do not try simultaneous old/new activation. Save gate logs, hashes, and real screenshots. Commit verified changes before release.

- [x] 5. Publish the new repository and attested 2.0.0 assets.

  **Do:** Create public `t1seo/icon-studio` without a README-initialization commit. Add `relaunch` remote; push the verified release branch to `main`, confirm default branch and CI. Tag that verified commit `2.0.0` and push only this tag to `relaunch`. Monitor the existing release workflow through completion. Make release notes explicit about new ID, new install, legacy backup/migration, and old repository preservation.

  **References:** `.github/workflows/ci.yml:5`, `.github/workflows/release.yml:19`, `.github/workflows/release.yml:37`, `.github/workflows/release.yml:40`, `.github/workflows/release.yml:48`, `docs/RELEASING.md` after task 3.

  **Acceptance/QA:** Anonymous downloads of `main.js`, `manifest.json`, `styles.css` succeed, are nonempty, and asset manifest is `icon-studio`/`2.0.0`; tag points to reviewed commit and release attestation succeeds. Install the downloaded files into a disposable vault and smoke-test enable/library/inline rendering. Edge: confirm new repo has only the intended tag/release and old remote main/tags/releases are unchanged. Save URLs, SHA, checksums, workflow result. Never retag after a failure; fix and use the next version if a release has been published.

- [x] 6. Submit the successor and archive the old directory entry.

  **Do:** In the authenticated Community portal choose New plugin and submit `https://github.com/t1seo/icon-studio` with the existing owner. Explicitly describe it as the same maintainer's successor to `custom-icon` and disclose the old failed automated scan/manual rename request. Set the chosen folder-fairy icon and accurate listing content. Observe availability/validation and every scan section; fix concrete repository/release errors rather than assuming the new ID removes them.

  **Ordering:** Prepare and verify task 5 first. Prefer accepting the new submission before archiving the old entry. If portal evidence shows the old entry must be archived to free the display name, capture that evidence and use supported Archive/Yes archive, then retry once. Archive is reversible; if successor submission still fails, restore the previous archived/unarchived state unless that would conflict with a successfully created successor. Never permanently delete the old GitHub repository or invent an alternate product name/ID without root/user direction.

  **References:** official set-up-and-claim, manage-entry, FAQ and Manifest pages listed below; `docs/research/obsidian-community-release.md:11` preserves old submission history.

  **Acceptance/QA:** Capture new entry ID/URL, repository, version, icon, review statuses, and old entry archive result. Happy path: automated review approves and Add to Obsidian enables. Edge: reserved ID/name, pending admin review, or scanner outage is recorded verbatim with completed publication work; no repeated identity churn or claim of approval. A real source finding requires a bounded fix and the relevant regression/QA before new release. Commit only truthful status docs.

- [x] 7. Verify and report the exact public availability state.

  **Do:** Check the public new listing and official plugin registry; if approved, install from the actual Community Plugins UI into a disposable vault and exercise the plugin. Update both READMEs and dated release research with observed state and new links. Retain BRAT/manual directions while approval is pending.

  **References:** `README.md:120`, `README.ko.md:120`, `docs/research/obsidian-community-release.md`, `docs/QA.md`, https://github.com/obsidianmd/obsidian-releases/blob/master/community-plugins.json.

  **Acceptance/QA:** Approved case: public search/listing, Add to Obsidian, install folder ID, and runtime enable all succeed. Pending case: public docs say submitted/pending and provide a working anonymous GitHub release; final report names the exact administrator dependency and does not say the store launch is complete. Save public URLs and install evidence. Commit factual documentation updates to the new repo only.

## Final verification wave

- [x] Plan compliance: new ID/repository/version are consistent, all active docs point to the new release, historical links remain accurate.
- [x] Code quality: existing gate is green; new runtime changes, if required by real findings, receive LSP diagnostics and meaningful regression checks.
- [x] Real manual QA: fresh and migrated installations render and persist data correctly, with hashes proving legacy files were untouched.
- [x] Scope fidelity: review diff and remote refs; original repository and releases remain intact; no unrelated files or candidate workers' assets were reverted.
- [x] Post-implementation review: apply the required `omo:review-work` review workflow for significant implementation and resolve material findings before final reporting.

## Commit and release strategy

Use a Gitmoji-style commit on the release branch, for example `✨ feat: relaunch Icon Studio with a new plugin identity`. Stage intended files explicitly; do not stage every candidate or unrelated work by accident. Preserve current authorship history and do not add `Co-Authored-By: Claude`.

Create the public repository without an autogenerated README/license commit; push the verified release branch to `relaunch/main`, set and confirm remote default `main`, then push only tag `2.0.0` to `relaunch`. Existing `.github/workflows/release.yml` verifies the exact tag, rebuilds, attests, and publishes three assets. Never use `--tags` or push to `origin` for this launch.

## Success criteria

The new release is downloadable without authentication and installs as `icon-studio`. Legacy data remains intact and documented migration works. The selected folder-fairy mark is visible in current branding and listing. Community submission/review state is recorded with direct URLs and observed evidence; public availability is claimed only after the installation surface succeeds. If administrator action is required, report that specific dependency and the completed publish/submission work accurately.

## Official references checked on 2026-09-13

- https://docs.obsidian.md/community-directory/set-up-and-claim — new plugin submission and repository ownership.
- https://docs.obsidian.md/community-directory/manage-entry — release review, listing edits, archive/unarchive.
- https://docs.obsidian.md/community-directory/faq — immutable published identifiers, reinstall impact, scanning rules.
- https://docs.obsidian.md/Reference/Manifest — ID, unique display name, folder identity.
- https://docs.obsidian.md/community-directory/developer-policies — full review requirements remain applicable.

## Execution update — 2026-09-13

2.0.0 was published at 37a9763. The directory rejected the occupied Icon Studio name both before and after archiving the old entry, so the old entry was restored. After the optional naming question remained unanswered for more than 60 seconds, Folder Fairy was selected and announced. Version 2.0.1 changes only display/package naming and documentation, preserving ID icon-studio, repository, runtime, and data. All 76 tests and five bounded review scopes passed. This supersedes the assumption that the Icon Studio name could be reused.

The new Folder Fairy entry was accepted and published, then the old entry was archived. The 2.0.1 scan completed with one unsupported-API error: getFileByPath requires Obsidian 1.5.7. Version 2.0.2 at 493e6c6 corrects the minimum version without runtime changes; 76 tests, five review scopes, CI, attested release workflow, and anonymous download checks passed. A new scan is queued. Public install availability remains the final check.


Final observed state: 2.0.2 automated review Completed with no blocking errors; public Add to Obsidian enabled; primary directory feed contains the new ID. The feed discloses that Obsidian staff have not manually reviewed it. The GitHub mirror and actual Obsidian 1.13.7 catalog had not synchronized, so Community installation remains unverified. A real install attempt returned plugin-not-found; anonymous manual installation succeeded after restoring the disposable vault backup. This is a catalog propagation dependency, not a request to bypass review. All available publication/status work is complete; docs commit 91da40f records the limitation. CLI was returned to its initially disabled state, and the temporary Documents permission decision was reset.
