# Icon Fairy brand

## Positioning

Icon Fairy turns a user's own PNG, JPG, WebP, and SVG images into icons for an Obsidian vault. It combines an icon library with file, folder, tab, note-title, and inline placements, including per-instance Markdown annotations.

**Tagline:** Your images. Your icons. Your vault.

## Naming

- Product name: **Icon Fairy**
- Korean name: **아이콘 요정**
- Repository: `t1seo/icon-fairy`
- npm package metadata: `obsidian-icon-fairy`
- Plugin ID from 3.0.0: `icon-fairy`
- Minimum Obsidian version: **1.5.7**
- Default inline syntax: `:ci-NAME:`

The name covers the full range of icon placements. The folder-heart mark expresses care for a personal vault. Version 3.0.0 introduced a separate installation identity; the [migration guide](MIGRATING.md) explains how to preserve data from either previous identity. The shortcode syntax and existing library icon IDs stay the same.

## Voice

Use plain, concrete language. Lead with the user's action and the visible result. Prefer “upload an icon” and “assign it to a folder” over abstract descriptions of customization.

## Current visual direction

The selected mark matches the folder-heart tile on the [Icon Fairy Community listing](https://community.obsidian.md/plugins/icon-fairy): a white folder and heart outline on an orange-to-purple gradient, inside a rounded square.

- Orange base: `#E9973F`
- Purple radial gradient: `#8B5CF6`
- Glyph: white `#FFFFFF`
- Listing tile reference: 80 × 80, with a 16 px corner radius
- Centered glyph reference: 40 × 40, retaining the original SVG's 24-unit viewBox and 2-unit stroke

The [SVG mark](../assets/icon-fairy-mark.svg) reproduces the listing's extracted glyph and tile styling. The [1024 × 1024 PNG](../assets/icon-fairy-mark.png) was rasterized directly from that SVG in Chromium, with transparent outer corners. The READMEs and sample library use the same PNG. Keep its proportions, gradient, white strokes, and rounded corners together when resizing. The sample continues to store it at `icons/icon-fairy.png` under the existing `icon-fairy` library ID.

The glyph comes from Lucide's [folder-heart.svg at commit 05dd5fc](https://github.com/lucide-icons/lucide/blob/05dd5fcfde07c36f6f113c6bc690802dcce8da15/icons/folder-heart.svg). Its [ISC license](../assets/licenses/lucide.txt) is retained with the artwork and copied into the [sample plugin directory](../examples/programming-languages-vault/.obsidian/plugins/icon-fairy/LICENSE.lucide.txt). The tile's colors and geometry reproduce the existing Community page appearance selected by the maintainer. This mark was reproduced from vector paths and styling; it was not generated from the earlier character prompts.

Use this mark consistently in the repository, sample, and listing overview. Current README screenshots show the real sample vault in Obsidian's light appearance; the mobile capture uses official desktop mobile emulation. Historical QA captures retain the artwork and appearance present when those checks ran.

## Previous logo candidates

The [logo gallery](../assets/logo-candidates/index.html) shows the current folder-heart mark separately from six earlier folder-character candidates. All six original PNGs, prompts, and generation records are preserved. None is the current mark.

A1 was used for Folder Fairy 2.x, and A2 was selected for the initial Icon Fairy 3.0.0 presentation. The unchanged [A2 generation prompt](icon-fairy-prompt.txt) and [A1 generation prompt](folder-fairy-prompt.txt) remain historical records. Those characters were generated with the built-in image_gen tool using the `ip-as-logo` workflow; the provider did not expose a model identifier. Their original 1254 × 1254 images and previous SVG artwork remain available.

## Rename and artwork history

The project started as Custom Icon and briefly used Vault Icon Studio. Version 1.3.1 adopted Icon Studio. Those releases used plugin ID `custom-icon` and remain in [t1seo/obsidian-icon-studio](https://github.com/t1seo/obsidian-icon-studio).

Version 2.0.0 introduced plugin ID `icon-studio`, repository [t1seo/icon-studio](https://github.com/t1seo/icon-studio), and A1 artwork. Version 2.0.1 adopted **Folder Fairy** because the directory rejected the already-used Icon Studio display name even after the old entry was archived. The 2.x ID and repository stayed unchanged.

Version 3.0.0 adopted **Icon Fairy (아이콘 요정)** with ID and repository slug `icon-fairy` and the user-selected A2 artwork. After that release, the maintainer chose the Community listing's folder-heart tile as the common mark and requested light-mode screenshots. This presentation update keeps the Icon Fairy identity and the published 3.0.0 release unchanged. Earlier repositories, releases, artwork, and user data are preserved.
