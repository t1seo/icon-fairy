# Icon Fairy 3.1.0 UI polish workflow

## Objective and authorization

Implement the 2026-09-19 UI audit, verify the actual Obsidian experience, commit,
push, merge the pull request and publish an update. The user explicitly requested
the entire workflow, including an isolated worktree and deployment.

- Canonical repository: `t1seo/icon-fairy`; plugin ID: `icon-fairy`.
- Baseline: `f64cf528d99ff4b90a1225ecd3c5ae47e4f9721b` / release `3.0.0`.
- Branch: `t1seo/icon-fairy-ui-polish`; target: `main`; initial release: `3.1.0`;
  final release: `3.1.1` after the hosted CSS compatibility follow-up.
- Orca Run: `run_6b3818a7ece6`.
- Worktree: isolated checkout created by Orca under `icon-fairy-ui-polish/`.
- Preserve folder-heart artwork, data formats, existing icons/assignments,
  minimum Obsidian 1.5.7 compatibility and immediate application of library icons.
- No new runtime dependencies, telemetry, cloud services, branding changes or
  new product features. UI presentation of existing actions/state is in scope.

## Ownership and dependency graph

| Work | Owner | Depends on | Owned files |
| --- | --- | --- | --- |
| Planning/Metis and baseline | Read-only worker + coordinator | None | This plan and audit evidence (coordinator only) |
| Library/picker interactions | Picker worker | Baseline | `CustomTab.ts`, `IconPickerModal.ts`, cohesive new picker modules, picker tests |
| Upload presentation | Upload worker | Baseline | `UploadTab.ts`, cohesive new upload modules, upload tests |
| Annotation/settings/copy | Details worker | Baseline | `InlineAnnotationModal.ts`, `settings.ts`, `ContextMenu.ts`, their tests |
| Shared styles and integration | Coordinator | Parallel with workers; final after all | `styles.css`, release metadata, documentation |
| Actual app QA and screenshots | Coordinator; independent QA reviewer | Integrated build | Disposable vault, QA evidence, current README screenshots |
| Five review gates | Independent read-only workers | Frozen candidate + QA | Verdicts only; fixes owned by coordinator or original implementation owner |
| PR/CI/merge/release | Coordinator | All checks/reviews pass | Canonical GitHub repository and existing Community listing |

Workers must not revert other edits, commit, push, release, or control the shared
desktop. Native Obsidian Menu is preferred over a custom menu implementation.
Runtime tests use Vitest/jsdom with the existing narrow Obsidian fakes. Changes to
existing source need passing baseline tests and meaningful failing-first behavior
tests; CSS/copy changes are primarily verified visually rather than string snapshots.

## Implementation decisions

1. Cards retain immediate apply. Replace per-card destructive `×` with a labelled
   menu trigger offering existing Rename and Delete from library actions. Keep
   double-click rename as an optional shortcut. Preserve cancel-on-Escape/close,
   owner-window timers and cleanup. Menu dismissal must not apply an icon.
2. Highlight the target file/folder's existing library icon with a check and
   Current text. Inline insertion has no current-assignment marker.
3. Use Library/Upload tabs, concise target text, one clear search input with
   visible focus, and a secondary labelled Random action. Separate empty-library
   and no-search-results guidance. Keep random selection limited to visible items.
4. Use content-sized picker height with a bounded scrolling body. Avoid resizing
   on every search result change; preserve a stable minimum for the open library.
   Reduce header duplication without shrinking main selection hit targets.
5. Upload preview uses existing image in sidebar-row and note-title context.
   Apply/Insert versus Add N icons to library labels match their existing effects.
   Explain library reuse and SVG mandatory save. File extensions use neutral badges.
6. Annotation editor starts compact, keeps preview and resizable/scrollable content,
   uses platform-correct Mod+Enter hint, and makes Save the primary visual action.
   Remove stays visibly separate. Settings show the actual shortcode prefix example;
   file unassignment wording is distinct from library deletion.
7. All custom styling is scoped and uses Obsidian theme/font/focus variables.
   Mobile menu hit area targets 44 CSS px; this is a design target, not a compliance
   claim. Preserve native menu, settings and command-palette structure.

## Metis decisions incorporated

- Native menus use `new Menu`, `setParentElement` and
  `showAtPosition(position, ownerDocument)`, not `Menu.forEvent` (since 1.6.0).
- Inline PNG insertion requires an existing library entry. Keep the existing
  unchecked default but disable Insert until Save to library is checked, with
  a clear explanation. File/folder PNG saving remains optional; SVG remains fixed.
- Exclude menu triggers and rename inputs from card-arrow interception. Keep
  cancel-before-blur, focus transfer, stable IDs and query-scoped rerenders.
- Deferred upload completion must not render into a replaced or closed view.
- Search stability target is <=1 CSS px height change at a fixed viewport;
  test 0/1/7/80 items. Utility/service 100% coverage is not a UI coverage claim.
- Sample stylesheet must be synchronized explicitly; release hashes must match
  actual-app QA. Tag only the merged canonical commit, without `--tags`.

## Tasks and acceptance

- [x] Create isolated worktree and run baseline `npm ci && npm run verify`.
  Result: 18 files / 150 tests pass; zero lint warnings; build/release checks pass.
- [x] Complete Metis review and record constraints before implementation dispatch.
- [x] Implement picker actions/state and regression tests.
  Apply Fairy → callback once and closes; menu → rename/cancel without applying;
  delete Moon → only matching assignments removed; filter/Random remains scoped.
- [x] Implement upload presentation and regression tests.
  PNG optional library save, SVG fixed save, three-file import with edited names
  and removal of the middle row retain existing persistence semantics.
- [x] Implement annotation/settings/menu-copy changes and focused tests.
  Save/cancel/remove preserve semantics; prefix `art` produces the matching example;
  Mac versus non-Mac shortcut hint differs correctly.
- [x] Integrate shared styles and run complete `npm run verify`.
  Modified TypeScript modules remain cohesive and below 250 nonblank/noncomment
  lines; existing oversized upload/picker code is split only at relevant boundaries.
- [x] Run real Obsidian QA in disposable vaults and capture current screenshots.
  Test 0/1/7/many icons, long names, matching/nonmatching search, keyboard menus,
  rename save/cancel, delete, current marker, single/batch upload, malformed image,
  annotation and prefix persistence, light/dark and 390px mobile emulation. Assert
  rendered image load, no horizontal clipping, one focus target, bounded modal,
  correct cancellation and no console errors. Mobile emulation is not a physical
  device test. Register and clean every temporary QA resource.
- [x] Obtain all five independent review passes: goal, quality, security, actual
  execution and context/history. Fix blocking findings and reverify affected work.
- [x] Update version/package lock/root+sample manifests/versions/changelog/README
  and QA evidence. Commit and push only intended files; preserve unrelated main
  worktree files. Open PR, require six CI checks passing, merge without bypassing
  protections or force pushing. Verify merged runtime matches the QA candidate.
- [x] Tag merged commit `3.1.0`, let existing Release workflow publish attested
  `main.js`, `manifest.json`, `styles.css`, verify anonymous downloads and attestations.
  PR #1 merged at `f22ac4d`; PR/main CI and release run `35394195865` passed.
  Native 3.0.0 → 3.1.0 update preserved the library and data. The hosted scan then
  flagged mobile `column-gap`; publish a 3.1.1 patch using the equivalent `gap`
  shorthand, preserving the original tag, and recheck hosted results.
- [x] Publish 3.1.1 from merged PR #2 (`4205960`). Its PR/main CI and attesting
  release workflow `35394803996` passed. Anonymous assets match the tested patch,
  and provenance verifies the exact tag and commit. Native 3.1.0 → 3.1.1 update
  preserves plugin data, library JSON and icon files; post-update UI checks pass.
- [x] Use supported Community management flow to detect/review the new release,
  check exact-version results, verify native installation/update in a disposable
  Obsidian vault, and document actual status without conflating GitHub publication,
  catalog propagation, automated review and manual staff approval.
  Exact 3.1.1 / `4205960` review: Completed, zero errors/warnings. Public listing:
  3.1.1, Review Passed, Health Excellent, enabled install link. Both catalog feeds
  retain the canonical identity, and native upgrade with preserved data passes.
- [x] Release workers, close only task-owned QA windows/sessions, restore temporary
  application settings, retain evidence, and report PR/release/review links.

## Evidence and final gates

Durable evidence belongs in `docs/QA-3.1.0.md` and the release audit. Screenshots
that document the current UI replace the corresponding `assets/icon-fairy-*.png`;
dated historical evidence remains untouched. Local automation belongs under a
temporary directory and must not enter the release bundle.

Final gates: local verification, actual app observations, all five review verdicts,
PR CI, merged commit identity, release workflow, anonymous asset hashes, attestations,
exact Community review and a real catalog installation/update. Any external delay is
reported precisely and pursued while independent work remains available.
