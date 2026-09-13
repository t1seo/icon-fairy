import { CSS_PREFIX, EXPLORER_ICON_SIZE } from "../constants";
import type IconStudioPlugin from "../main";
import type { IconData } from "../types";
import { ExplorerObserver } from "./explorer/ExplorerObserver";

/** Injects custom icons into every file explorer without replacing folder chevrons. */
export class ExplorerIcons {
	private readonly observers = new Map<HTMLElement, ExplorerObserver>();
	private enabled = false;
	private eventsRegistered = false;

	constructor(private plugin: IconStudioPlugin) {}

	enable() {
		if (this.enabled) return;
		this.enabled = true;
		this.refresh();
		if (this.eventsRegistered) return;
		this.eventsRegistered = true;
		this.plugin.registerEvent(this.plugin.app.workspace.on("layout-change", () => this.refresh()));
		this.plugin.registerEvent(
			this.plugin.app.vault.on("rename", (file, oldPath) => {
				if (this.enabled && this.plugin.iconMap[oldPath]) {
					this.plugin.iconMap[file.path] = this.plugin.iconMap[oldPath];
					delete this.plugin.iconMap[oldPath];
					void this.plugin.saveSettings();
					this.refresh();
				}
			}),
		);
		this.plugin.registerEvent(
			this.plugin.app.vault.on("delete", (file) => {
				if (this.enabled && this.plugin.iconMap[file.path]) {
					delete this.plugin.iconMap[file.path];
					void this.plugin.saveSettings();
					this.refresh();
				}
			}),
		);
	}

	disable() {
		this.enabled = false;
		for (const [container, observer] of this.observers) {
			observer.stop();
			this.removeIcons(container);
		}
		this.observers.clear();
	}

	refresh() {
		if (!this.enabled) return;
		const containers = this.getExplorerContainers();
		for (const [container, observer] of this.observers) {
			if (!containers.has(container) || container.win !== observer.win) {
				observer.stop();
				this.removeIcons(container);
				this.observers.delete(container);
			}
		}
		for (const container of containers) {
			if (!this.observers.has(container)) {
				this.observers.set(
					container,
					new ExplorerObserver(container, () => this.applyAllIcons(container)),
				);
			}
			this.removeIcons(container);
			this.applyAllIcons(container);
		}
	}

	applyIcon(path: string, icon: IconData) {
		if (!this.enabled) return;
		for (const container of this.getExplorerContainers())
			this.applyIconInContainer(container, path, icon);
	}

	private applyAllIcons(container: HTMLElement) {
		for (const [path, icon] of Object.entries(this.plugin.iconMap)) {
			this.applyIconInContainer(container, path, icon);
		}
	}

	private applyIconInContainer(container: HTMLElement, path: string, icon: IconData) {
		const items = container.querySelectorAll<HTMLElement>(
			`.nav-file-title[data-path="${CSS.escape(path)}"], .nav-folder-title[data-path="${CSS.escape(path)}"]`,
		);
		for (const el of Array.from(items)) {
			el.querySelector(`.${CSS_PREFIX}-explorer-icon`)?.remove();
			const iconEl = this.createIconElement(el, icon);
			if (el.classList.contains("nav-folder-title")) {
				const collapseEl =
					el.querySelector(":scope > .nav-folder-collapse-indicator") ??
					el.querySelector(":scope > .tree-item-icon");
				if (collapseEl) collapseEl.after(iconEl);
				else el.prepend(iconEl);
			} else {
				el.prepend(iconEl);
				el.querySelector(":scope > .tree-item-icon")?.classList.add("custom-icon-hidden");
			}
		}
	}

	private removeIcons(container: HTMLElement) {
		container.querySelectorAll(`.${CSS_PREFIX}-explorer-icon`).forEach((el) => el.remove());
		container
			.querySelectorAll(".tree-item-icon.custom-icon-hidden")
			.forEach((el) => el.classList.remove("custom-icon-hidden"));
	}

	private getExplorerContainers(): Set<HTMLElement> {
		const containers = new Set<HTMLElement>();
		for (const leaf of this.plugin.app.workspace.getLeavesOfType("file-explorer")) {
			leaf.view.containerEl
				.querySelectorAll<HTMLElement>(".nav-files-container")
				.forEach((container) => {
					if (container.isConnected) containers.add(container);
				});
		}
		return containers;
	}

	private createIconElement(parent: HTMLElement, icon: IconData): HTMLElement {
		const wrapper = parent.createSpan({ cls: `${CSS_PREFIX}-explorer-icon is-img` });
		const img = wrapper.createEl("img");
		img.width = EXPLORER_ICON_SIZE;
		img.height = EXPLORER_ICON_SIZE;
		img.src = this.plugin.iconLibrary.getIconUrl(icon.value);
		img.alt = "";
		wrapper.dataset.customIconActive = "true";
		return wrapper;
	}
}
