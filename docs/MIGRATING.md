# Move to Icon Fairy 3.0.0

Icon Fairy is the same maintainer's successor, with plugin ID `icon-fairy` and repository [t1seo/icon-fairy](https://github.com/t1seo/icon-fairy). It requires Obsidian 1.5.7 or later. It is a separate installation from both previous plugin identities; data and BRAT subscriptions do not transfer automatically.

## Choose one source installation

Use **exactly one** of these source directories for the entire migration:

| Previous installation | Source directory in your vault | Preserved repository |
| --- | --- | --- |
| Folder Fairy 2.x | `.obsidian/plugins/icon-studio/` | [t1seo/icon-studio](https://github.com/t1seo/icon-studio) |
| Custom Icon / Icon Studio 1.x | `.obsidian/plugins/custom-icon/` | [t1seo/obsidian-icon-studio](https://github.com/t1seo/obsidian-icon-studio) |

If both are present, choose the installation containing the library and assignments you want to keep. Do not combine files from the two sources. The destination is always `.obsidian/plugins/icon-fairy/`.

## Preserve your existing data

1. Back up the vault, including the chosen source directory and any existing `icon-fairy` directory.
2. Disable both previous plugins if installed. Install **Icon Fairy** using the [installation instructions](../README.md#installation), and keep the new plugin disabled too.
3. Fully quit Obsidian before copying data.
4. Confirm that the destination contains no existing `data.json`, `icon-library.json`, or `icons/` directory. If it has any of these, move them together to a separate backup first. The destination must have no user data before this copy; retain its new `manifest.json`, `main.js`, and `styles.css`.
5. Copy only the following items, when present, from your **one chosen source** into `.obsidian/plugins/icon-fairy/`:
   - `data.json`: settings, file/folder assignments, and inline annotations.
   - `icon-library.json`: icon names, IDs, and relative image paths.
   - `icons/`: the complete image directory.
6. Leave the source files untouched. Do not copy old plugin binaries, rename library icon IDs, edit note shortcodes, or merge another installation's data into the destination.
7. Open Obsidian and enable only **Icon Fairy**. Verify the library, assigned icons, inline icons, and annotations. Assign hotkeys to the new commands manually.

The existing `:ci-...:` note syntax and annotation suffixes remain valid, as do custom prefixes and library icon IDs. Full command IDs now begin with `icon-fairy:`; previous `icon-studio:` or `custom-icon:` hotkey assignments do not activate the new commands. Existing BRAT subscriptions also need to be replaced manually if you continue using BRAT.

Keep the old folders and backups until verification is complete. Do not enable the previous and new plugins together because they render the same note syntax and icon locations. To return to the previous installation, disable Icon Fairy and enable only the chosen old plugin; this copy process leaves its data intact.

## 한국어 안내

**Icon Fairy(아이콘 요정) 3.0.0**은 새 ID `icon-fairy`로 별도 설치되며 Obsidian 1.5.7 이상이 필요합니다. 데이터·BRAT 구독·단축키가 자동으로 옮겨지지는 않습니다.

이관 원본은 **정확히 하나만** 선택해 주세요. Folder Fairy 2.x는 `.obsidian/plugins/icon-studio/`, Custom Icon / Icon Studio 1.x는 `.obsidian/plugins/custom-icon/`에 저장됩니다. 둘 다 있으면 유지할 라이브러리와 지정 정보가 들어 있는 설치 하나를 선택하고, 서로 다른 원본의 파일을 섞지 마세요. 대상 경로는 `.obsidian/plugins/icon-fairy/`입니다.

1. 선택한 원본과 기존 `icon-fairy` 폴더를 포함하여 볼트를 백업합니다.
2. 설치되어 있는 이전 플러그인을 모두 비활성화합니다. [설치 안내](../README.ko.md#설치)에 따라 **Icon Fairy**를 설치하고 새 플러그인도 비활성화해 둡니다.
3. Obsidian을 완전히 종료합니다.
4. 대상에 `data.json`, `icon-library.json`, `icons/`가 없는지 확인합니다. 이미 있으면 세 항목을 함께 별도 백업 위치로 옮겨 사용자 데이터가 없는 상태로 준비합니다. 새 `manifest.json`, `main.js`, `styles.css`는 그대로 둡니다.
5. **선택한 원본 하나**에서 존재하는 `data.json`, `icon-library.json`, `icons/`만 새 `icon-fairy` 폴더로 복사합니다.
6. 원본은 변경하지 않습니다. 이전 실행 파일을 복사하거나, 라이브러리 아이콘 ID와 노트 shortcode를 바꾸거나, 다른 설치의 데이터를 합치지 마세요.
7. Obsidian을 열어 **Icon Fairy만** 활성화합니다. 라이브러리·지정 아이콘·인라인 아이콘·주석을 확인한 뒤 새 명령에 단축키를 직접 지정합니다.

기존 `:ci-...:` 문법, 주석 접미사, 사용자 접두사와 라이브러리 아이콘 ID는 유지됩니다. 명령 ID 접두사는 `icon-fairy:`로 바뀌므로 이전 `icon-studio:` 또는 `custom-icon:` 단축키는 새 명령에 다시 지정해야 합니다. BRAT를 계속 사용하신다면 구독 저장소도 직접 바꿔 주세요.

확인을 마칠 때까지 이전 폴더와 백업을 보관하고, 이전 플러그인과 새 플러그인을 동시에 활성화하지 마세요. 이전 설치로 돌아가려면 Icon Fairy를 비활성화하고 선택한 이전 플러그인만 다시 활성화하면 됩니다. 복사 과정에서 원본 데이터는 그대로 남습니다.
