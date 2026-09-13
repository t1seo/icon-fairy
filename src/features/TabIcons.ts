import { MarkdownView, type WorkspaceLeaf } from "obsidian";
import { CSS_PREFIX, TAB_ICON_SIZE } from "../constants";
import type IconStudioPlugin from "../main";
import type { IconData } from "../types";

/** Internal Obsidian tab DOM; the public API does not expose the header element. */
interface LeafWithTabHeader extends WorkspaceLeaf {
	readonly tabHeaderEl?: HTMLElement;
}

/** Replaces tab header icons in their own windows. */
export class TabIcons {
	private readonly hosts = new Set<HTMLElement>();
	private enabled = false;
	private eventsRegistered = false;

	constructor(private plugin: IconStudioPlugin) {}

	enable() {
		if (this.enabled) return;
		this.enabled = true;
		this.applyAllTabIcons();
		if (this.eventsRegistered) return;
		this.eventsRegistered = true;
		this.plugin.registerEvent(
			this.plugin.app.workspace.on("layout-change", () => this.applyAllTabIcons()),
		);
		this.plugin.registerEvent(
			this.plugin.app.workspace.on("active-leaf-change", () => this.applyAllTabIcons()),
		);
	}

	disable() {
		this.enabled = false;
		this.removeAllTabIcons();
	}

	refresh() {
		this.applyAllTabIcons();
	}

	private applyAllTabIcons() {
		if (!this.enabled) return;
		this.removeAllTabIcons();
		const leaves: LeafWithTabHeader[] = this.plugin.app.workspace.getLeavesOfType("markdown");
		for (const leaf of leaves) {
			if (!(leaf.view instanceof MarkdownView)) continue;
			const file = leaf.view.file;
			const iconEl = leaf.tabHeaderEl?.querySelector<HTMLElement>(
				".workspace-tab-header-inner-icon",
			);
			if (!file || !iconEl) continue;
			const icon = this.plugin.iconMap[file.path];
			if (icon) this.applyTabIcon(iconEl, icon);
		}
	}

	private cleanTabIcon(iconEl: HTMLElement) {
		iconEl.classList.remove("custom-icon-has-tab-icon");
		iconEl.querySelectorAll(`.${CSS_PREFIX}-tab-icon`).forEach((el) => el.remove());
		iconEl
			.querySelectorAll("svg.custom-icon-hidden")
			.forEach((svg) => svg.classList.remove("custom-icon-hidden"));
	}

	private applyTabIcon(iconEl: HTMLElement, icon: IconData) {
		const wrapper = iconEl.createSpan({ cls: `${CSS_PREFIX}-tab-icon` });
		const img = wrapper.createEl("img");
		img.width = TAB_ICON_SIZE;
		img.height = TAB_ICON_SIZE;
		img.src = this.plugin.iconLibrary.getIconUrl(icon.value);
		img.alt = "";
		iconEl.querySelectorAll("svg").forEach((svg) => svg.classList.add("custom-icon-hidden"));
		iconEl.prepend(wrapper);
		iconEl.classList.add("custom-icon-has-tab-icon");
		this.hosts.add(iconEl);
	}

	private removeAllTabIcons() {
		for (const host of this.hosts) this.cleanTabIcon(host);
		this.hosts.clear();
	}
}
