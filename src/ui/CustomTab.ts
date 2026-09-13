import { setIcon } from "obsidian";
import { CSS_PREFIX } from "../constants";
import type IconFairyPlugin from "../main";
import type { CustomIcon } from "../types";
import type { IconPickerModal, TabRenderer } from "./IconPickerModal";

type CustomTabPlugin = Pick<IconFairyPlugin, "iconMap" | "removeIcon"> & {
	readonly iconLibrary: Pick<
		IconFairyPlugin["iconLibrary"],
		"getAll" | "search" | "getIconUrl" | "rename" | "remove"
	>;
};

/**
 * Custom tab: displays saved custom icons from the workspace library.
 * Supports search, selection, and removal.
 */
export class CustomTab implements TabRenderer {
	private gridContainer!: HTMLElement;
	private visibleIcons: CustomIcon[] = [];
	private searchTimeout: number | null = null;
	private searchWindow: Window | null = null;
	private cancelRename: (() => void) | null = null;

	constructor(
		private plugin: CustomTabPlugin,
		private modal: Pick<IconPickerModal, "selectIcon">,
	) {}

	render(container: HTMLElement): void {
		this.destroy();
		this.searchWindow = container.win;
		this.gridContainer = container.createDiv({ cls: `${CSS_PREFIX}-custom-grid-area` });
		this.renderIcons(this.plugin.iconLibrary.getAll());
	}

	onSearch(query: string): void {
		const ownerWindow = this.searchWindow;
		if (!ownerWindow) return;
		if (this.searchTimeout !== null) ownerWindow.clearTimeout(this.searchTimeout);

		this.searchTimeout = ownerWindow.setTimeout(() => {
			this.searchTimeout = null;
			const results = this.plugin.iconLibrary.search(query);
			this.renderIcons(results);
		}, 150);
	}

	onRandom(): void {
		if (this.visibleIcons.length === 0) return;
		const icon = this.visibleIcons[Math.floor(Math.random() * this.visibleIcons.length)];
		this.modal.selectIcon({ type: "custom", value: icon.id });
	}

	destroy(): void {
		this.cancelEditing();
		if (this.searchTimeout !== null) this.searchWindow?.clearTimeout(this.searchTimeout);
		this.searchTimeout = null;
		this.searchWindow = null;
	}

	cancelEditing(): void {
		const cancel = this.cancelRename;
		this.cancelRename = null;
		cancel?.();
	}

	// ─── Private ────────────────────────────────────

	private startRename(label: HTMLElement, icon: CustomIcon) {
		this.cancelEditing();
		label.textContent = "";
		label.removeAttribute("title");
		const input = label.createEl("input");
		input.type = "text";
		input.value = icon.name;
		input.className = `${CSS_PREFIX}-rename-input`;

		const commit = () => {
			this.cancelRename = null;
			const newName = input.value.trim();
			if (newName && newName !== icon.name) {
				void (async () => {
					await this.plugin.iconLibrary.rename(icon.id, newName);
					label.textContent = newName;
					label.setAttribute("title", "Double-click to rename");
				})();
			} else {
				label.textContent = icon.name;
				label.setAttribute("title", "Double-click to rename");
			}
		};

		this.cancelRename = () => {
			input.removeEventListener("blur", commit);
			input.value = icon.name;
			label.textContent = icon.name;
			label.setAttribute("title", "Double-click to rename");
		};
		input.addEventListener("blur", commit, { once: true });
		input.addEventListener("keydown", (e) => {
			if (e.key === "Enter") {
				e.preventDefault();
				input.blur();
			} else if (e.key === "Escape") {
				e.preventDefault();
				this.cancelEditing();
			}
		});

		input.focus();
		input.select();
	}

	private renderIcons(icons: CustomIcon[]) {
		this.visibleIcons = icons;
		this.gridContainer.empty();

		if (icons.length === 0) {
			const empty = this.gridContainer.createDiv({
				cls: `${CSS_PREFIX}-empty-state`,
				attr: { role: "status" },
			});
			const emptyIcon = empty.createDiv({ cls: `${CSS_PREFIX}-empty-state-icon` });
			setIcon(emptyIcon, "image-off");
			empty.createEl("strong", { text: "No icons found" });
			empty.createEl("p", {
				text: "Try another search, or upload an image to build your library.",
			});
			return;
		}

		this.gridContainer.createDiv({
			text: "Select an icon to apply it. Double-click a name to rename.",
			cls: `${CSS_PREFIX}-grid-hint`,
		});

		const grid = this.gridContainer.createDiv({
			cls: `${CSS_PREFIX}-custom-grid`,
			attr: { role: "list", "aria-label": "Icon library" },
		});

		for (const icon of icons) {
			const item = grid.createDiv({
				cls: `${CSS_PREFIX}-custom-item`,
				attr: { role: "listitem" },
			});

			const imgBtn = item.createEl("button", {
				cls: `${CSS_PREFIX}-custom-item-btn`,
				attr: { type: "button", "aria-label": `Use ${icon.name}`, title: `Use ${icon.name}` },
			});

			const img = imgBtn.createEl("img");
			img.src = this.plugin.iconLibrary.getIconUrl(icon.id);
			img.alt = icon.name;
			img.width = 40;
			img.height = 40;

			imgBtn.addEventListener("click", () => {
				this.modal.selectIcon({ type: "custom", value: icon.id });
			});

			const label = item.createDiv({
				cls: `${CSS_PREFIX}-custom-item-label`,
				attr: { title: "Double-click to rename" },
			});
			label.textContent = icon.name;

			label.addEventListener("dblclick", (e) => {
				e.stopPropagation();
				this.startRename(label, icon);
			});

			// Remove button
			const removeBtn = item.createEl("button", {
				cls: `${CSS_PREFIX}-custom-item-remove`,
				attr: {
					type: "button",
					"aria-label": `Delete ${icon.name} from library`,
					title: `Delete ${icon.name}`,
				},
			});
			setIcon(removeBtn, "x");
			removeBtn.addEventListener("click", (e) => {
				e.stopPropagation();
				void (async () => {
					await this.plugin.iconLibrary.remove(icon.id);
					// Remove all iconMap references to this deleted icon
					for (const [path, data] of Object.entries(this.plugin.iconMap)) {
						if (data.value === icon.id) {
							this.plugin.removeIcon(path);
						}
					}
					this.renderIcons(this.plugin.iconLibrary.getAll());
				})();
			});
		}
	}
}
