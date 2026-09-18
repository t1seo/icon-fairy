import { setIcon } from "obsidian";
import { CSS_PREFIX } from "../constants";
import type IconFairyPlugin from "../main";
import type { CustomIcon } from "../types";
import type { IconPickerModal, TabRenderer } from "./IconPickerModal";
import { LibraryIconCard } from "./LibraryIconCard";

type CustomTabPlugin = Pick<IconFairyPlugin, "iconMap" | "removeIcon"> & {
	readonly iconLibrary: Pick<
		IconFairyPlugin["iconLibrary"],
		"getAll" | "search" | "getIconUrl" | "rename" | "remove"
	>;
};

export class CustomTab implements TabRenderer {
	private gridContainer: HTMLElement | null = null;
	private container: HTMLElement | null = null;
	private visibleIcons: readonly CustomIcon[] = [];
	private cards = new Map<string, LibraryIconCard>();
	private searchTimeout: number | null = null;
	private searchWindow: Window | null = null;
	private query = "";

	constructor(
		private readonly plugin: CustomTabPlugin,
		private readonly modal: Pick<
			IconPickerModal,
			"selectIcon" | "getTargetPath" | "setRandomEnabled"
		>,
	) {}

	render(container: HTMLElement): void {
		this.destroy();
		this.container = container;
		this.searchWindow = container.win;
		this.query = "";
		const icons = this.plugin.iconLibrary.getAll();
		container.classList.add(`is-library-${icons.length <= 8 ? "compact" : "full"}`);
		container.classList.toggle("is-library-small", icons.length <= 1);
		this.gridContainer = container.createDiv({ cls: `${CSS_PREFIX}-custom-grid-area` });
		this.renderIcons(icons);
	}

	onSearch(query: string): void {
		const ownerWindow = this.searchWindow;
		if (!ownerWindow) return;
		this.query = query;
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
		for (const card of this.cards.values()) card.destroy();
		this.cards.clear();
		if (this.searchTimeout !== null) this.searchWindow?.clearTimeout(this.searchTimeout);
		this.searchTimeout = null;
		this.searchWindow = null;
		this.visibleIcons = [];
		this.gridContainer = null;
		this.container?.classList.remove("is-library-small", "is-library-compact", "is-library-full");
		this.container = null;
	}

	cancelEditing(): void {
		for (const card of this.cards.values()) card.cancelEditing();
	}

	private async rename(id: string, name: string): Promise<void> {
		const container = this.gridContainer;
		await this.plugin.iconLibrary.rename(id, name);
		if (container === this.gridContainer) this.refresh(id);
	}

	private async remove(id: string): Promise<void> {
		const container = this.gridContainer;
		await this.plugin.iconLibrary.remove(id);
		for (const [path, data] of Object.entries(this.plugin.iconMap)) {
			if (data.type === "custom" && data.value === id) this.plugin.removeIcon(path);
		}
		if (container === this.gridContainer) this.refresh(id);
	}

	private refresh(focusId: string): void {
		const focused = this.container?.doc.activeElement;
		const preserveFocus =
			focused?.isConnected &&
			focused !== this.container?.doc.body &&
			!this.cards.get(focusId)?.element.contains(focused);
		const previousIndex = Math.max(
			0,
			this.visibleIcons.findIndex((icon) => icon.id === focusId),
		);
		this.renderIcons(this.plugin.iconLibrary.search(this.query), focusId);
		if (preserveFocus && focused?.isConnected) return;
		const fallback = this.visibleIcons[Math.min(previousIndex, this.visibleIcons.length - 1)];
		const card = this.cards.get(focusId) ?? (fallback ? this.cards.get(fallback.id) : undefined);
		if (card) card.focus();
		else
			this.container?.parentElement
				?.querySelector<HTMLInputElement>(`.${CSS_PREFIX}-search-input`)
				?.focus();
	}

	private renderIcons(icons: readonly CustomIcon[], changedId?: string): void {
		const container = this.gridContainer;
		if (!container) return;
		const visibleIds = new Set(icons.map((icon) => icon.id));
		for (const [id, card] of this.cards) {
			if (changedId !== undefined && id !== changedId && visibleIds.has(id)) continue;
			card.destroy();
			card.element.remove();
			this.cards.delete(id);
		}
		this.visibleIcons = icons;
		this.modal.setRandomEnabled(icons.length > 0);

		if (icons.length === 0) {
			container.empty();
			const empty = container.createDiv({
				cls: `${CSS_PREFIX}-empty-state`,
				attr: { role: "status" },
			});
			const emptyIcon = empty.createDiv({ cls: `${CSS_PREFIX}-empty-state-icon` });
			setIcon(emptyIcon, "image-off");
			const hasLibrary = this.plugin.iconLibrary.getAll().length > 0;
			empty.createEl("strong", {
				text: hasLibrary ? "No matching icons" : "Your library is empty",
			});
			empty.createEl("p", {
				text: hasLibrary
					? "Try another search or clear the search field."
					: "Open Upload to add your first icon.",
			});
			return;
		}

		let grid = container.querySelector<HTMLElement>(`.${CSS_PREFIX}-custom-grid`);
		if (!grid) {
			container.empty();
			grid = container.createDiv({
				cls: `${CSS_PREFIX}-custom-grid`,
				attr: { role: "list", "aria-label": "Icon library" },
			});
		}

		const path = this.modal.getTargetPath();
		const current = path ? this.plugin.iconMap[path] : undefined;
		for (const [index, icon] of icons.entries()) {
			let card = this.cards.get(icon.id);
			if (!card) {
				card = new LibraryIconCard(
					grid,
					icon,
					this.plugin.iconLibrary.getIconUrl(icon.id),
					current?.type === "custom" && current.value === icon.id,
					{
						select: () => this.modal.selectIcon({ type: "custom", value: icon.id }),
						rename: (name) => {
							void this.rename(icon.id, name);
						},
						remove: () => {
							void this.remove(icon.id);
						},
						beforeRename: () => this.cancelEditing(),
					},
				);
				this.cards.set(icon.id, card);
			}
			const position = grid.children.item(index);
			if (position !== card.element) grid.insertBefore(card.element, position);
		}
	}
}
