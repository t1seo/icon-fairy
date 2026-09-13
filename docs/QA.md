# Icon Studio 2.0.0 QA

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
