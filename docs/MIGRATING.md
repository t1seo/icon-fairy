# Move from Custom Icon / Icon Studio 1.x

Folder Fairy is the same maintainer's successor, published from [t1seo/icon-studio](https://github.com/t1seo/icon-studio) with plugin ID `icon-studio`. Version 2.0.2 requires Obsidian 1.5.7 or later. The previous repository, [t1seo/obsidian-icon-studio](https://github.com/t1seo/obsidian-icon-studio), continues to hold the `custom-icon` releases.

This is a separate installation. An existing BRAT subscription does not switch repositories automatically. Full command IDs also change, so you must assign your hotkeys again. Notes keep their existing `:ci-...:` syntax, including annotation suffixes.

## Preserve your existing data

1. Back up your vault, including `.obsidian/plugins/custom-icon/`.
2. Disable the old **Icon Studio / Custom Icon** plugin.
3. Install the new plugin from `t1seo/icon-studio` with BRAT, or put its release files in `.obsidian/plugins/icon-studio/`. Keep it disabled while copying data.
4. Fully quit Obsidian before copying the files.
5. From `.obsidian/plugins/custom-icon/`, copy only these items into `.obsidian/plugins/icon-studio/`:
   - `data.json`: settings, file/folder assignments, and inline annotations.
   - `icon-library.json`: icon names, IDs, and relative image paths.
   - `icons/`: the complete image directory.
6. Preserve the new plugin's `manifest.json`, `main.js`, and `styles.css`. Do not replace them with the old versions.
7. Open Obsidian and enable only the new **Folder Fairy** installation. Verify your library, assigned icons, inline icons, and annotations, then assign your hotkeys again.

These steps assume the new installation has no data you want to keep yet. If you have already imported icons or written annotations in it, back up both directories and merge deliberately; do not overwrite its files blindly.

Keep the old folder and its backup until you have verified the new installation. Do not enable both plugins together: they render the same note syntax and icon locations. To return to the old installation, disable the new plugin and re-enable the old one; the copy process leaves the old data intact.

## 한국어 안내

Folder Fairy는 2.0.0에서 도입한 새 ID `icon-studio`로 별도 설치됩니다. 기존 BRAT 구독은 새 저장소로 자동 전환되지 않으며, 단축키도 다시 지정해야 합니다. 노트의 `:ci-...:` 문법과 주석 접미사는 유지됩니다.

1. 볼트와 `.obsidian/plugins/custom-icon/` 폴더를 백업합니다.
2. 기존 플러그인을 비활성화합니다.
3. BRAT에 `t1seo/icon-studio`를 추가하거나, 새 릴리스 파일을 `.obsidian/plugins/icon-studio/`에 넣습니다. 데이터 복사 중에는 새 플러그인도 비활성화해 둡니다.
4. Obsidian을 완전히 종료합니다.
5. 기존 `custom-icon` 폴더의 `data.json`, `icon-library.json`, `icons/`만 새 `icon-studio` 폴더로 복사합니다.
6. 새 플러그인의 `manifest.json`, `main.js`, `styles.css`는 그대로 유지합니다.
7. Obsidian을 열어 새 플러그인만 활성화한 뒤 라이브러리·아이콘·주석을 확인하고 단축키를 다시 지정합니다.

새 플러그인에서 이미 작성한 데이터가 있다면 양쪽을 백업한 후 병합해야 합니다. 위 복사 방법으로 덮어쓰지 마세요. 확인을 마칠 때까지 기존 폴더와 백업은 보관하고, 두 플러그인을 동시에 활성화하지 마세요.
