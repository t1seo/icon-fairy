# Icon Fairy 3.1.0 UI verification

Date: 2026-09-19 (Asia/Seoul). Baseline: `f64cf528` / 3.0.0.
Scope: the [UI audit](research/icon-fairy-ui-audit-2026-09-19.md) and
[implementation workflow](../plans/icon-fairy-ui-polish.md).

## Environment and method

A separate worktree and disposable **Icon Fairy UI QA** vault are used on macOS
with Obsidian 1.13.7 (installer 1.10.6), default Light and Dark themes. The actual
application is driven through its CLI, DOM events and native macOS menu controls.
Mobile checks use Obsidian desktop mobile emulation; they are not physical iOS or
Android device tests. The user's working vault is not used for plugin testing.

## Automated verification

Baseline: 18 test files / 150 tests passed. The integrated candidate passes
`npm run verify`: 29 test files / 241 tests, Biome, official Obsidian ESLint with
zero warnings, TypeScript, production build and release checks. Utility/service
coverage remains 100% within the existing configured scope; this is not a UI
coverage claim. Changed TypeScript modules are at most 237 nonblank/noncomment
lines. No runtime dependency or data-schema change was introduced.

New behavior tests were observed failing before implementation. Focused gates:
picker 67 tests; upload/image processing 44; annotation/settings/context 49.
A negative packaging fixture proves that stale sample CSS fails release validation.
The sample stylesheet is byte-identical to the release stylesheet.

Independent quality review reproduced a new overlapping-edit regression: a delayed
rename completion discarded the draft on another card. Two failing-first tests
cover delayed rename and delete. The fix retains unaffected card elements and
focus; both regressions and the complete verification suite now pass.

## Actual application observations

| Area | Observed result |
| --- | --- |
| Library sizes 0 / 1 / 7 / 80 | Initial search focus, loaded images, correct empty/no-results states, no horizontal overflow |
| Search stability | All four sizes: 0 CSS px height change across empty/matching/nonmatching/cleared queries |
| Desktop 1100 × 820 | Modal heights 416.39 / 416.39 / 476.39 / 576.39 px; within viewport |
| Mobile 390 × 820 | Modal heights 460.03 / 460.03 / 660.03 / 660.03 px; within viewport; menu targets 44 × 44 px |
| Short mobile 390 × 480 | All modal heights 448 px; content scrolls within the viewport; search height delta 0 |
| Current assignment | Accent border, check and Current label identify the target's saved library ID |
| Native card menu | macOS menu exposes Rename and Delete from library; no icon is applied by opening the menu |
| Rename | Native Rename focuses the input; Enter persists the new name while retaining the query and focus; Escape discards the edit |
| Overlapping edits | Delayed rename or deletion of one card preserves another card's exact input, draft and focus; the second name can then be saved |
| Menu dismissal | Native Escape dismisses the menu and restores the Manage button with aria-expanded=false |
| Library deletion | Native Delete removes the temporary icon and its two assignments; unrelated assignment and query remain; focus returns to search and Random is disabled |
| Single PNG | Optional-save default preserved; Apply assigns without adding to the reusable library |
| Inline PNG | Insert is disabled until Save to library is selected; then a saved entry and shortcode are produced |
| SVG | Library save remains mandatory; valid vector file is preserved and assigned |
| Batch | Editing first/last names and removing the middle item preserves both names; Add 2 icons adds only those entries and leaves the assignment unchanged |
| Preview and invalid raster | Sidebar/note-title images load; malformed PNG displays a recoverable error and Choose another file returns to upload |
| Annotation | 5 rows, 112 px initial editor, vertical resize, Mac shortcut hint, separate Remove, primary Save; cancel preserves and save persists content |
| Prefix settings | ci → art updates both descriptions without replacing/focusing away from the input; invalid punctuation normalizes to ci; assignments and annotation envelope remain unchanged |

Obsidian's desktop Escape handler closes the picker while cancelling an unfinished
rename, preserving the earlier cancel-before-close behavior. SVG processing remains
the existing byte-preserving pass-through; structural SVG validation was not added.
Windows/Linux shortcut text is covered by unit tests, not a native OS run. Minimum
Obsidian 1.5.7 compatibility is checked against public API annotations and official
lint rules; this session does not claim a runtime test on that older version.

## Candidate asset hashes

```text
e0187bb4fa0457fa97a0e248c28e4b6b1054b20d9af246e039aa8e1b49df1758  main.js
12f6e59a5b6942d052969147d505f847cd9fa735d566abc9f3b7ee2175c90414  manifest.json
183d38941e2c74e83c4059e82c14a0a4c6384c72dd55544473bfa0d739384d0f  styles.css
```

All nine current README screenshots were recaptured from actual Obsidian in Light
mode. Native macOS menu overlays were captured from the exact QA window screen
region; other screenshots use Obsidian/Electron capture. No UI was composited.
The candidate app reported no captured errors after the exercised flows. Dark-theme
checks also passed with body.theme-dark verified before capture.

## Independent reviews

All five review scopes pass the exact candidate above: goal/preservation, code
quality, security, actual application execution, and context/history. The quality
reviewer's original overlapping-edit reproduction and 14 surrounding scenarios
pass after the fix, including serialized storage of the second edit. The actual-app
reviewer independently confirms the same rename/delete cases and normal UI flows.

The final disposable vault has seven library icons and seven assignments; its
data, library JSON and icon files match the original fixture. It is restored to
Light desktop mode, with no test notes, open modals or captured app errors.
Physical mobile devices, Windows/Linux and Obsidian 1.5.7 were not run.

CI and publication results are recorded separately in the
[Community release audit](research/obsidian-community-release.md).
