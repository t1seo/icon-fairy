import { MarkdownView } from "obsidian";
import { CSS_PREFIX, TITLE_ICON_SIZE } from "../constants";
import type IconFairyPlugin from "../main";
import { IconPickerModal } from "../ui/IconPickerModal";

/** Displays an editable icon above the active note's inline title. */
export class TitleIcons {
	private readonly containers = new Set<HTMLElement>();
	private enabled = false;
	private eventsRegistered = false;

	constructor(private plugin: IconFairyPlugin) {}

	enable() {
		if (this.enabled) return;
		this.enabled = true;
		this.applyTitleIcon();
		if (this.eventsRegistered) return;
		this.eventsRegistered = true;
		this.plugin.registerEvent(
			this.plugin.app.workspace.on("active-leaf-change", () => this.applyTitleIcon()),
		);
		this.plugin.registerEvent(
			this.plugin.app.workspace.on("layout-change", () => this.applyTitleIcon()),
		);
	}

	disable() {
		this.enabled = false;
		this.removeAllTitleIcons();
	}

	refresh() {
		this.applyTitleIcon();
	}

	private applyTitleIcon() {
		if (!this.enabled) return;
		this.removeAllTitleIcons();
		const view = this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
		const file = view?.file;
		if (!view || !file) return;
		const titleEl = view.containerEl.querySelector(".inline-title");
		const parent = titleEl?.parentElement;
		const icon = this.plugin.iconMap[file.path];
		if (!titleEl || !parent || !icon) return;

		const wrapper = parent.createDiv({ cls: `${CSS_PREFIX}-title-icon` });
		wrapper.addEventListener("click", () => {
			new IconPickerModal(this.plugin.app, this.plugin, file.path, (newIcon) => {
				if (newIcon) this.plugin.setIcon(file.path, newIcon);
				else this.plugin.removeIcon(file.path);
				this.refresh();
			}).open();
		});
		const img = wrapper.createEl("img");
		img.width = TITLE_ICON_SIZE;
		img.height = TITLE_ICON_SIZE;
		img.src = this.plugin.iconLibrary.getIconUrl(icon.value);
		img.alt = "";
		parent.insertBefore(wrapper, titleEl);
		this.containers.add(view.containerEl);
	}

	private removeAllTitleIcons() {
		for (const leaf of this.plugin.app.workspace.getLeavesOfType("markdown")) {
			this.containers.add(leaf.view.containerEl);
		}
		for (const container of this.containers) {
			container.querySelectorAll(`.${CSS_PREFIX}-title-icon`).forEach((el) => el.remove());
		}
		this.containers.clear();
	}
}
