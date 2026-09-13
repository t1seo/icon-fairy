# Obsidian Community release research

Research date: 2026-08-19

## Decision

Icon Studio keeps the existing `custom-icon` plugin ID, publishes version `1.3.1` with the required release assets, and uses the account-based Obsidian Community directory submission flow.

## Submission outcome

- The existing `custom-icon` directory entry was connected to the repository owner's GitHub account on 2026-08-19.
- Checking for new releases queued version 1.3.1 at commit `e10239a016a2d9ff8c8c1bad7cce1b03efada03c` and updated the entry's display name to **Icon Studio**.
- The 1.3.1 preview scan reported only the expected mismatch between the former **Custom Icon** name and the new **Icon Studio** manifest name.
- A manual review request was submitted explaining the intentional rebrand, stable plugin ID, repository rename, fixed prior source-code finding, and attested release assets.
- The request is currently open for administrator review. The [public listing](https://community.obsidian.md/plugins/custom-icon) shows Icon Studio 1.3.1, while **Add to Obsidian** remains disabled until approval.

## Findings

- The repository root must contain `README.md`, `LICENSE`, and `manifest.json`.
- The release tag must exactly match the semantic version in `manifest.json`.
- Each release must attach `main.js`, `manifest.json`, and optionally `styles.css`.
- The default branch manifest is used to find the latest version, while actual installs come from the matching GitHub release.
- The plugin ID must be unique, lowercase, hyphenated, exclude `obsidian`, and not end in `plugin`.
- The display name must be short, unique, Basic Latin, and exclude `Obsidian` and `Plugin`.
- The description must be no longer than 250 characters and end with punctuation.
- Initial submission now happens at `community.obsidian.md` after the owner connects an Obsidian account to GitHub.
- Automated review checks the manifest, release assets, source code, and whether the published build matches the source.

## Sources

- [Submit your plugin](https://docs.obsidian.md/plugins/releasing/submit-plugin)
- [Manifest reference](https://docs.obsidian.md/Reference/Manifest)
- [Submission requirements for plugins](https://docs.obsidian.md/community-directory/submission-requirements-for-plugins)
- [Developer policies](https://docs.obsidian.md/community-directory/developer-policies)
- [Set up and claim](https://docs.obsidian.md/community-directory/set-up-and-claim)
- [Manage a directory entry](https://docs.obsidian.md/community-directory/manage-entry)
- [Release with GitHub Actions](https://docs.obsidian.md/Plugins/Releasing/Release+your+plugin+with+GitHub+Actions)

## Successor preparation — 2026-09-13

The maintainer chose a separate installation identity, `icon-studio`, version 2.0.0, in `t1seo/icon-studio`, with a folder-fairy logo. This supersedes the August 19 decision to retain `custom-icon`; that decision and its review history are preserved above.

The old account page still reported that the automated review could not be completed and an administrator would investigate. Its August 19 manual rename request remained open, and public installation remained unavailable. The successor is the same maintainer's continuation and must pass the normal review process. A new ID does not itself grant approval.

Local automated checks, real fresh/migrated Obsidian checks, and five review scopes passed. See [2.0.0 QA](../QA.md) and the [migration guide](../MIGRATING.md). The original repository and releases are preserved. Publication and directory results will be recorded separately after submission.

## Publication and name validation — 2026-09-13

The public successor repository [t1seo/icon-studio](https://github.com/t1seo/icon-studio) and [2.0.0 release](https://github.com/t1seo/icon-studio/releases/tag/2.0.0) were published at commit `37a9763b76dab04113699fe74a43e5b8c7371c51`. CI and the release workflow passed. Anonymous downloads of all three assets matched the locally verified files byte for byte.

The new submission was rejected with `An entry with this name already exists.` The old `custom-icon` entry was archived through the supported UI and the submission was retried once; the same validation error remained. The old entry was then unarchived, restoring its prior state. Archiving does not free this display name for a new entry. The original repository and 1.3.1 release were unchanged.

The successor display name was changed to **Folder Fairy** in 2.0.1, matching the folder-fairy artwork. The new ID `icon-studio` and repository `t1seo/icon-studio` remain unchanged. The 2.0.0 release is preserved rather than retagged. This is still the same maintainer's successor and requires normal review.

## New entry published and compatibility finding — 2026-09-13

The [2.0.1 release](https://github.com/t1seo/icon-studio/releases/tag/2.0.1) was published at `0306cadb8814d297387f35d48bb0d446a82a1170`. CI and release automation passed. All three anonymously downloaded assets matched the local files, and GitHub artifact attestation verification passed.

The [Folder Fairy listing](https://community.obsidian.md/plugins/icon-studio) was created and published with a successor/migration disclosure, Icons/Appearance/Images categories, Free payment type, and an actual desktop screenshot. The directory only supports built-in glyphs for the small icon, so it uses purple `folder-heart`; the overview and screenshot show the original folder-fairy PNG. The old `custom-icon` entry was archived again after the successor was accepted. The original repository and releases remain unchanged.

The new automated review completed instead of reporting the old entry's incomplete-review condition. Release attestations, network analysis, production dependencies, and byte-for-byte build reproduction passed. Its one blocking error was `obsidianmd/no-unsupported-api` at `src/features/InlineIcons.ts:455`: `Vault.getFileByPath` was used with `minAppVersion: 1.4.0`, although the [official API declares it available since 1.5.7](https://github.com/obsidianmd/obsidian-api/blob/cc1744324150c632416857c98964f87b1574a5fc/obsidian.d.ts). Source/style warnings were nonblocking. The public page remained visible with **Add to Obsidian** disabled.

Version 2.0.2 corrects the root/sample minimum version to 1.5.7 and adds its compatibility entry, preserving historical versions. Runtime source, bundle, CSS, and data formats are unchanged. Approval and public installation will be recorded after the new scan.

## Completed review and catalog synchronization — 2026-09-13

The [2.0.2 release](https://github.com/t1seo/icon-studio/releases/tag/2.0.2) was published at `493e6c6fbcfe53c82c155d419dad4aae9f3d8fa2`. CI run `34742638616` and release run `34742677499` passed. Anonymous downloads of all three files matched local assets; artifact attestation verification passed. The new scan reached **Completed** with no blocking errors. Existing source/CSS warnings remain; build reproduction, release attestations, network analysis, and production dependencies passed.

At 06:30–06:33 UTC, the public page showed version 2.0.2 and an enabled `obsidian://show-plugin?id=icon-studio` installation link. Its health label was **Excellent** and its review label **Caution**, reflecting warnings rather than an incomplete scan. The [primary directory feed](https://community.obsidian.md/assets/community-plugins.json) now included Folder Fairy / `icon-studio` / `t1seo/icon-studio`. The feed also states that Obsidian staff have not manually reviewed this plugin; automated completion is not a claim of manual review.

The [GitHub catalog mirror](https://github.com/obsidianmd/obsidian-releases/blob/master/community-plugins.json) had not yet included the entry. The primary endpoint advertised a one-hour server cache, and the [official mirror workflow](https://github.com/obsidianmd/obsidian-releases/blob/master/.github/workflows/mirror-community-json.yml) is scheduled hourly at minute 17, subject to GitHub scheduling delay. This supports catalog propagation as the remaining dependency; no delivery time is guaranteed.

Actual Obsidian 1.13.7 Community search in the disposable fresh vault returned no Folder Fairy results, and its `plugin:install id=icon-studio` command returned `Plugin "icon-studio" not found in community plugins.` Therefore **installation from the in-app catalog is not yet verified**. The fresh vault was backed up before that attempt, then restored with the anonymously downloaded 2.0.2 files. Manual installation loaded the correct identity, three commands, the saved library, and rendered inline images. BRAT/manual distribution is available now. The old directory entry remains archived, and the old repository's main and 1.3.1 tag are unchanged.
