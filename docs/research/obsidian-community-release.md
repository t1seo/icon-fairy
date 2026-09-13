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
