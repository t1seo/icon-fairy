# Icon Studio brand

## Positioning

Icon Studio turns a user's own PNG, JPG, WebP, and SVG images into a visual navigation system for an Obsidian vault. It combines an icon library with file, folder, tab, note-title, and inline placements, including per-instance Markdown annotations.

**Tagline:** Your images. Your icons. Your vault.

## Naming

- Product name: **Icon Studio**
- Repository: `t1seo/icon-studio`
- npm package metadata: `obsidian-icon-studio`
- Plugin ID from 2.0.0: `icon-studio`
- Default inline syntax: `:ci-NAME:`

The product name is short and literal: an Obsidian user should understand the main job before reading its description. The package name retains the `obsidian-` qualifier. Version 2.0.0 deliberately introduces a new installation identity; the [migration guide](MIGRATING.md) explains how to preserve old data. The shortcode syntax stays the same.

## Voice

Use plain, concrete language. Lead with the user's action and the visible result. Prefer “upload an icon” and “assign it to a folder” over abstract descriptions of customization.

## Visual direction

- Character body: lavender `#9166D9`
- Character pocket and eyes: deep plum `#352047`
- Background: peach `#EFC9B9`

The mark is a friendly folder fairy: a rounded folder body, broad front pocket, and small eyes, emerging from the lower-left. It represents a personal, approachable vault. `assets/icon-studio-mark.png` is the unmodified 1254 × 1254 original from candidate A1, generated with the built-in image_gen tool using the `ip-as-logo` workflow. The provider did not expose a model identifier. The requested colors describe semantic color families; the original includes the generator's tonal variation.

Use the PNG in documentation and directory listings. Keep the generated original unchanged; the previous SVG image-tile mark is retained only as historical artwork. Exact generation instructions are recorded in [folder-fairy-prompt.txt](folder-fairy-prompt.txt).

## Rename history

The project started as Custom Icon and briefly used Vault Icon Studio. Version 1.3.1 adopts Icon Studio because it is easier to read, say, and find in Obsidian settings. This is a product naming decision, not legal trademark clearance.

Version 2.0.0 is the same maintainer's successor with a new plugin ID, repository, and folder-fairy artwork. The original repository and its release history remain available. The new Community submission must disclose this continuity and pass the normal review process.
