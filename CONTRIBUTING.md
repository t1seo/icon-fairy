# Contributing to Icon Fairy

Thank you for helping improve Icon Fairy. Use the [issue tracker](https://github.com/t1seo/icon-fairy/issues) for bug reports and feature requests, and open pull requests against `main` in `t1seo/icon-fairy`.

## Report a bug

Include your Icon Fairy version, Obsidian version, operating system, steps to reproduce, and the expected and actual result. A small example note or image is more useful than an entire vault. Mention whether the problem occurs in Live Preview, Reading view, or a separate window.

For a feature request, describe the task you want to accomplish and an example of the proposed behavior.

## Develop locally

```sh
git clone https://github.com/t1seo/icon-fairy.git
cd icon-fairy
npm ci
npm run verify
```

`npm run verify` runs formatting checks, Obsidian lint rules with zero warnings, tests, TypeScript, the production build, and release/sample consistency checks. See the [sample vault guide](docs/SAMPLE-VAULT.md) to try the build in a disposable Obsidian vault.

Keep each change focused. Follow the existing TypeScript, formatting, and lint configuration. Include a regression test for a behavior change and exercise the affected UI in Obsidian. For documentation or artwork changes, check the links and inspect the rendered result. Explain the change and the verification performed in the pull request.

## Compatibility and releases

The current plugin ID is `icon-fairy`. Preserve existing icon libraries, assignments, settings, annotations, and note shortcodes when changing behavior. The `custom-icon-*` CSS namespace and `ci` shortcode prefix remain intentional compatibility details. See the [migration guide](docs/MIGRATING.md) for the two previous plugin identities.

Keep the sample vault consistent with the plugin metadata and assets. Do not commit generated `main.js`, personal vault contents, or local QA evidence. Release tags are managed through the [release workflow](docs/RELEASING.md); published tags must not be replaced.

Contributions are distributed under the repository's [MIT license](LICENSE).
