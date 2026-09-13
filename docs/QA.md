# Folder Fairy QA history

## Icon Studio 2.0.0 — 2026-09-13

QA date: 2026-09-13. Scope: new installation identity, folder-fairy branding, sample consistency, and migration from `custom-icon`. Runtime TypeScript and CSS are unchanged from 1.3.1. The [August 19 report](QA-1.3.1.md) preserves the broader historical UI and mobile tests; those results are not presented as new tests.

## Environment and method

Two disposable vaults were used on macOS: **Icon Studio Fresh QA** and **Icon Studio Migration QA**. Initial fresh-install checks ran in Obsidian 1.12.7; independent fresh checks and migration checks ran in 1.13.7 after the application restarted. The installer was 1.10.6. The user's working vault was not used for plugin tests.

The real Obsidian application was driven through its CLI, DOM events, and desktop controls. PNG import used the actual upload file-input handler and **Save to library → Apply**. Folder/note assignment and annotation persistence were additionally exercised through the loaded plugin's methods. Screenshots and DOM image-load checks verified the rendered results. This was not a full mouse-only repeat of every 1.3.1 UI flow.

## Automated checks

- `npm ci` and `npm run verify`: passed formatting, Obsidian lint, 9 test files / 76 tests, TypeScript, build, and release validation.
- Configured unit-coverage scope: 100%; this does not mean all Obsidian UI code is covered.
- Separate assertions: root/sample manifests, package/lock versions, new ID, sole `versions.json` entry, seven sample icons, and identical selected/sample PNG.
- `npm audit --omit=dev`: zero production vulnerabilities. Existing development-dependency advisories remain outside this metadata/branding change.
- Five independent review scopes passed: goal/constraints, QA, code quality, security, and project history. The independent local QA report covered 25 scenarios, including the checks below.

## Observed results

| Scenario | Result |
| --- | --- |
| Empty vault installs `icon-studio` 2.0.0 | Pass; only the new plugin was loaded and its library started empty |
| Command identity | Pass; exactly `icon-studio:change-icon`, `icon-studio:remove-icon`, and `icon-studio:insert-inline-icon` were registered |
| Folder-fairy PNG import | Pass; image processed, saved to the library, and loaded from the new plugin directory |
| Folder, note, tab, and title assignments | Pass; real rendered images loaded successfully |
| Inline settings | Pass; enabled the initially disabled inline option through the settings control |
| Fresh Live Preview and Reading view | Pass; inline PNG and annotation marker rendered in both modes |
| Fresh persistence after application restart | Pass; library item, two assignments, settings, annotation, and three commands remained intact |
| Fresh legacy-directory isolation | Pass; no `custom-icon` directory was created |
| Migration from preserved legacy fixture | Pass; copied only data, library, and icons into the new installation before opening the vault |
| Migrated settings and library | Pass; seven icons, seven assignments, 24 px / `ci` settings, and the existing TypeScript annotation loaded |
| Migrated Live Preview and Reading view | Pass; five visible inline images loaded, including the annotated TypeScript icon |
| Migrated annotation write and reload | Pass; edited annotation persisted under `icon-studio` and survived plugin reload |
| Legacy preservation | Pass; every file in the old plugin directory remained byte-identical to its backup, and all six Markdown notes were unchanged |
| No duplicate plugin activation | Pass; only `icon-studio` was loaded after migration and reload |

## Visual evidence

- [Fresh Live Preview](../assets/qa-2.0.0/fresh-live.png)
- [Fresh Reading view](../assets/qa-2.0.0/fresh-reading.png)
- [Migrated Reading view](../assets/qa-2.0.0/migration-reading.png)

The migrated screenshot intentionally retains the old library's logo: migration preserves a user's existing images. The committed new sample uses the folder-fairy PNG.

GitHub publication and Community approval are separate from local QA. Their verified status is recorded in [the release audit](research/obsidian-community-release.md).

## Folder Fairy 2.0.1 follow-up — 2026-09-13

The directory rejected the occupied **Icon Studio** name even after the old listing was archived, so the display name changed to **Folder Fairy**. ID `icon-studio`, runtime bundle, data formats, and artwork remain unchanged. The published 2.0.0 tag is preserved.

`npm run verify` passed again with 76 tests. Root and sample metadata match Folder Fairy 2.0.1. Reloading the real fresh QA installation showed the new name/version, exactly three commands prefixed **Folder Fairy**, and the existing library/settings unchanged. The 2.0.0 downloaded files were also installed and smoke-tested; all three anonymous downloads matched the locally verified files.

## Folder Fairy 2.0.2 compatibility metadata — 2026-09-13

The Community scanner identified the existing `Vault.getFileByPath` call as newer than the declared minimum. The official API marks it available since 1.5.7, so the root/sample minimum was corrected to 1.5.7 in a new 2.0.2 release. Historical compatibility entries remain unchanged. This is a declaration correction; Obsidian 1.5.7 itself was not run in this session.

`npm run verify` passed all 76 tests again. Runtime bundle and CSS were byte-identical to the published 2.0.1 downloads. Independent queries of both real Obsidian 1.13.7 QA vaults after reload confirmed Folder Fairy 2.0.2 / minimum 1.5.7, only the new plugin loaded, three commands, and preserved fresh/migrated library, mappings, settings, and annotations. All five bounded review scopes passed. Public installation remains a separate gate in the release audit.

After publication, all three anonymous 2.0.2 downloads matched the verified files and attestation verification passed. The Community scan completed without blocking errors, its public install link enabled, and the primary directory feed included the new ID. The tested in-app catalog and GitHub mirror had not synchronized: actual Community search returned no result, and the Community install command reported the ID missing. After backing up the disposable fresh vault, the downloaded 2.0.2 files were installed manually and confirmed to load the saved library, three commands, and inline PNGs. This verifies manual distribution, not successful in-app catalog installation.

## Folder Fairy 2.0.3 warning fixes — 2026-09-13

The current official Obsidian lint rules pass with zero warnings. `npm run verify` passed 18 test files / 150 tests, formatting, strict TypeScript, production build, and release validation. The configured utility/service coverage remains 100%; UI behavior is also covered by focused regression tests and actual app checks. Development dependencies were updated and `npm audit` reported zero vulnerabilities, including development packages.

Browser-only ES2020 library declarations resolve the unsafe `matchAll` and `fromEntries` diagnostics without changing their algorithms or the ES2018 output target. Searchable settings use custom rendering and the existing persistence envelope, preserving assignments and annotations. Window ownership and cleanup now cover explorer observers, tab/title icons, modal focus, paste listeners, and moved inline hover previews. CSS uses scoped selectors and explicit tab state without `!important` or `:has()`.

Actual Obsidian 1.13.7 checks passed all 37 planned scenarios in the two disposable vaults. The final production bundle matches the bundle used for those checks byte for byte.

| Area | Verified behavior |
| --- | --- |
| Settings | Three native search results; toggle, size, and prefix save/reload without replacing assignments or annotations; invalid prefix normalizes to `ci` |
| Workspace icons | Visible tab images, retained folder chevrons, assignment removal/restoration, and note rename/delete mapping updates |
| Inline icons | Reading and Live Preview rendering; only the chosen repeated token receives an annotation; stale-source saves preserve source and stored annotations |
| Popouts | The same Reading DOM can move windows and show/dismiss its preview in the destination; title/tab icons and size changes follow the correct window |
| Picker | Owner-window search and keyboard navigation; Escape and modal close cancel unfinished renames; Enter and ordinary blur save once |
| Import | PNG preview/save, exact SVG pass-through, malformed-image recovery, owner-document paste cleanup, and batch-name preservation |
| Lifecycle | Pending search/RAF/hover work is cancelled; disable removes plugin nodes and window state; re-enable restores one instance |
| Layout | Actual light/dark windows and a 390 px desktop popout retain usable controls without horizontal clipping |
| Data preservation | Fresh baseline five files and migration baseline 24 files restored byte for byte, including legacy images/data; temporary notes and imports removed |

All five review scopes passed, including bounded follow-up reviews for issues found during actual app QA. The user's working vault was not used for testing. The 390 px check is a desktop narrow-layout test, not a physical mobile-device test. Minimum Obsidian 1.5.7 compatibility was checked through API declarations and legacy-settings tests; that application version was not run.

All six original folder-fairy images are available in the [logo comparison gallery](../assets/logo-candidates/index.html). A1 remains the selected artwork.

### Published assets and Community installation

The 2.0.3 CI and release workflows passed at commit `3c8c5cb22ffafe4c902ebcb3caff41c6ba67ad18`. All three anonymous release downloads matched the local files and their GitHub attestations verified. The released `main.js` SHA256 is `1a344dea784b29027f7761aef4d9e9526f5c623f1b36da04500f023deb6ed48c`, matching the actual-app QA candidate.

At 08:12 UTC, the disposable fresh vault's plugin was backed up and uninstalled through Obsidian. After confirming its directory was absent, the official `plugin:install id=icon-studio enable` command downloaded and enabled Folder Fairy 2.0.3 with an empty library and exactly three commands. This confirms actual Community catalog installation; the earlier 2.0.2 propagation failure is historical.

The installed manifest and stylesheet are byte-identical to their release assets. The installed JavaScript contains the complete, unchanged release file followed only by the 18-byte `\n/* nosourcemap */` comment added during installation. No release files were manually copied for this installation check.

The original QA data, library, and icon files were then restored while the plugin was unloaded. The catalog-installed plugin reloaded one library icon, two assignments, the original settings and annotation, and five loaded PNG elements. All five restored baseline files match their backup. Hosted review status is recorded separately in [the release audit](research/obsidian-community-release.md).

At 08:17 UTC, the hosted automated review for 2.0.3 / `3c8c5cb` completed with zero errors and zero warnings, including successful byte-for-byte build reproduction. The public page shows **Review: Passed**, **Health: Excellent**, and an enabled installation link. The earlier failed review belongs to 2.0.1. QA windows were closed and the temporarily enabled CLI was restored to its original disabled state.
