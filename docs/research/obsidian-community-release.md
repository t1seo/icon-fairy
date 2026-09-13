# Obsidian Community release audit

Dated history from 2026-08-19 onward. Later sections supersede earlier submission and synchronization results.

**Latest verified status — 2026-09-13 10:39 UTC:** [Icon Fairy 3.0.0](https://community.obsidian.md/plugins/icon-fairy) is published from `t1seo/icon-fairy`, and its automated review completed with zero errors and warnings. The public listing shows **Review: Passed**, **Health: Excellent**, and the correct `icon-fairy` installation link. Actual Community installation is awaiting catalog synchronization; manual release downloads are verified. The previous Folder Fairy listing remains available until the new catalog installation succeeds. Automated review is not a claim of manual staff approval.

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

## Warning fixes and successful Community installation — 2026-09-13

The [2.0.3 release](https://github.com/t1seo/icon-studio/releases/tag/2.0.3) was published at `3c8c5cb22ffafe4c902ebcb3caff41c6ba67ad18`. [CI run 34747001583](https://github.com/t1seo/icon-studio/actions/runs/34747001583) and [release run 34747055652](https://github.com/t1seo/icon-studio/actions/runs/34747055652) passed. Anonymous downloads of all three assets matched the verified local build and each GitHub attestation verified.

Current official source lint reports zero warnings. The changes address all 14 warning groups in the completed 2.0.2 review, including browser library declarations, Obsidian DOM/window helpers, searchable settings, the obsolete build dependency, and CSS selectors. Actual app checks also identified and corrected native tab specificity, moved hover-preview ownership, popout keyboard focus, and Escape rename cancellation. All 150 automated tests and 37 actual-app scenarios passed; see [the QA report](../QA.md).

The catalog propagation issue is resolved. At 08:12 UTC, the official Community install command downloaded and enabled Folder Fairy 2.0.3 in the disposable fresh vault after an uninstall and verified removal of its plugin directory. It loaded an empty library and exactly three commands. This test used the Community catalog, without manually copying release assets. Its installed manifest and CSS exactly match the downloaded release; JavaScript matches the entire release followed only by Obsidian's `\n/* nosourcemap */` comment. Restoring the backed-up QA data then recovered the original library, assignments, settings, annotation, and rendered images.

The six original logo candidates are published in the [HTML comparison gallery](../../assets/logo-candidates/index.html). A1 remains applied. The old `custom-icon` repository's main and 1.3.1 tag are unchanged. Test vault windows were closed and temporary CLI enablement was restored to its original disabled state.

At 08:17 UTC, the new hosted review explicitly identified **2.0.3 / 3c8c5cb** and reached **Completed** with **zero error groups and zero warning groups**. Release attestations, network analysis, dependencies, and byte-for-byte build reproduction passed; the previous source/CSS findings no longer appear in this review. The old 2.0.1 **Failed** and 2.0.2 warning results remain visible as historical rows.

The [public listing](https://community.obsidian.md/plugins/icon-studio) now shows current version **2.0.3**, **Review: Passed**, **Health: Excellent**, and an enabled `obsidian://show-plugin?id=icon-studio` link. Both the primary directory feed and GitHub mirror contain the entry. Their manual-review disclaimer remains, so this audit does not claim staff approval.

## Icon Fairy identity alignment — 2026-09-13

The maintainer subsequently chose **Icon Fairy (아이콘 요정)** and original logo **A2**, and requested consistent product, repository, and installation-page naming. The canonical identity is now `icon-fairy` in `t1seo/icon-fairy`, version 3.0.0.

The [official Community FAQ](https://docs.obsidian.md/community-directory/faq) says that published identifiers cannot be changed through the normal edit flow; identifier changes require users to reinstall. Moving an entry to another GitHub location requires administrator assistance. The actual Folder Fairy edit form also exposes neither an identifier nor repository field. The existing 2.0.3 repository and release remain intact alongside the separate canonical entry, so its installed users are not sent a release with a different manifest ID. No external administrator message was sent.

GitHub repository renames redirect most existing traffic, but the existing 2.0.3 attestation is signed for `t1seo/icon-studio`. Preserving that repository also preserves its original release provenance. The new repository publishes only its own 3.0.0 compatibility entry and attested release. See [GitHub repository rename documentation](https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository) and [attestation verification](https://docs.github.com/en/actions/how-tos/secure-your-work/use-artifact-attestations/verify-attestations-offline).

The Folder Fairy listing will be archived only after the replacement passes review and actual Community catalog installation. Migration selects one prior installation, preserves its data/library/icons, and requires reassignment of hotkeys to `icon-fairy` commands. Historical results above continue to refer to their original names and IDs.

### Submitted identity and release verification

Before submission, the actual form contained `https://github.com/t1seo/icon-fairy` and owner **Myself**. The default-branch and anonymously downloaded release manifests both matched **Icon Fairy / icon-fairy / 3.0.0 / minimum 1.5.7**. After submission, the owner page showed **Icon Fairy**, repository **t1seo/icon-fairy**, and the 3.0.0 review at exact commit `2521d51704c26801321d9bb0c0d518dd47837f19`. This checks the submitted record itself, not just local naming.

The [source CI](https://github.com/t1seo/icon-fairy/actions/runs/34752012188) and [release workflow](https://github.com/t1seo/icon-fairy/actions/runs/34752071342) passed. All three anonymous [3.0.0 downloads](https://github.com/t1seo/icon-fairy/releases/tag/3.0.0) match the app-tested files and their attestations verify against the new repository. Hosted review is Completed with zero errors and warnings, including build reproduction. The listing was then published with the same-maintainer migration disclosure, Icons/Images/Appearance categories, Free payment type, and an actual A2 screenshot. Its small glyph is orange `folder-heart`; the overview displays the original A2 artwork.

The public page confirms current version 3.0.0, minimum 1.5.7, Review Passed, Health Excellent, and `obsidian://show-plugin?id=icon-fairy`. A2 and all nine new README screenshots load successfully. At 10:39 UTC, both directory feeds and actual in-app search still used the previous catalog: the new ID was absent, and installation into the emptied disposable target did not create its directory. The primary feed advertises a one-hour server cache; the [official mirror workflow](https://github.com/obsidianmd/obsidian-releases/blob/master/.github/workflows/mirror-community-json.yml) runs hourly. Actual Community installation remains a separate pending check.
