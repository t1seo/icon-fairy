# Programming Languages sample vault

This repository includes the sample vault used for the Icon Fairy README screenshots and manual QA.

## Open the sample

1. Run `npm ci` and `npm run build` from the repository root.
2. Copy `main.js`, `manifest.json`, and `styles.css` into `examples/programming-languages-vault/.obsidian/plugins/icon-fairy/`.
3. In Obsidian, choose **Open folder as vault** and select `examples/programming-languages-vault`.
4. If Obsidian prompts about Restricted Mode, trust the vault and enable **Icon Fairy**.

The committed sample contains only local Markdown, SVG/PNG icons, and plugin configuration. The generated `main.js` bundle is deliberately not committed. Its seven library icons include the selected A2 artwork as **Icon Fairy**; the other six represent the programming collection and its languages.

## What to try

- Expand **Programming Languages** and compare the folder and language-note icons.
- Open each language note and confirm the same icon appears in the tab and note title.
- Open **Welcome to Icon Fairy** in Live Preview and Reading view to compare inline rendering and the A2 logo.
- Right-click the annotated TypeScript icon. Confirm that its Markdown annotation contains a working wiki link.
- Open the command palette and search for **Icon Fairy**. All three commands should appear.
- Right-click a file, choose **Change icon…**, and browse both the **Icons** and **Upload** tabs.

## Sample layout

```text
Welcome to Icon Fairy.md
Programming Languages/
├── TypeScript.md
├── Python.md
├── Rust.md
├── Go.md
└── Swift.md
```

The sample uses plugin directory and ID `icon-fairy`. For an existing `icon-studio` or `custom-icon` installation, follow the [migration guide](MIGRATING.md) before enabling the new plugin. Keep the sample in a separate vault when trying the plugin; it is an example library, not a source to merge into an existing installation.
