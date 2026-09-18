import { Menu, setIcon } from "obsidian";
import { CSS_PREFIX } from "../constants";
import type { CustomIcon } from "../types";
import { IconNameEditor } from "./IconNameEditor";

interface CardActions {
	readonly select: () => void;
	readonly rename: (name: string) => void;
	readonly remove: () => void;
	readonly beforeRename: () => void;
}

export class LibraryIconCard {
	readonly element: HTMLElement;
	readonly manageButton: HTMLButtonElement;
	private readonly editor: IconNameEditor;
	private menu: Menu | null = null;
	private active = true;

	constructor(
		grid: HTMLElement,
		icon: CustomIcon,
		url: string,
		isCurrent: boolean,
		private readonly actions: CardActions,
	) {
		const item = grid.createDiv({
			cls: `${CSS_PREFIX}-custom-item`,
			attr: { role: "listitem" },
		});
		this.element = item;
		const button = item.createEl("button", {
			cls: `${CSS_PREFIX}-custom-item-btn`,
			attr: { type: "button", "aria-label": `Use ${icon.name}`, title: `Use ${icon.name}` },
		});
		const image = button.createEl("img");
		image.src = url;
		image.alt = icon.name;
		image.width = 40;
		image.height = 40;
		button.addEventListener("click", () => {
			if (this.active) this.actions.select();
		});
		const caption = item.createDiv({ cls: `${CSS_PREFIX}-custom-item-caption` });
		const label = caption.createDiv({
			cls: `${CSS_PREFIX}-custom-item-label`,
			text: icon.name,
			attr: { title: "Double-click to rename" },
		});
		this.manageButton = caption.createEl("button", {
			cls: `${CSS_PREFIX}-custom-item-actions`,
			attr: {
				type: "button",
				"aria-label": `Manage ${icon.name}`,
				title: `Manage ${icon.name}`,
				"aria-haspopup": "menu",
				"aria-expanded": "false",
			},
		});
		setIcon(this.manageButton, "ellipsis");
		if (isCurrent) {
			button.addClass("is-current");
			button.setAttribute("aria-current", "true");
			const badge = item.createSpan({ cls: `${CSS_PREFIX}-current-badge` });
			setIcon(badge.createSpan({ attr: { "aria-hidden": "true" } }), "check");
			badge.createSpan({ text: "Current" });
		}
		this.editor = new IconNameEditor(label, icon.name, actions.rename, () => this.focus());
		label.addEventListener("dblclick", (event) => {
			event.stopPropagation();
			this.startRename();
		});
		this.manageButton.addEventListener("click", (event) => {
			event.stopPropagation();
			if (this.active) this.openMenu(item);
		});
	}

	focus(): void {
		if (this.active) this.manageButton.focus();
	}

	cancelEditing(): void {
		this.editor.cancel();
	}

	destroy(): void {
		this.active = false;
		this.cancelEditing();
		this.menu?.hide();
		this.menu = null;
	}

	private startRename(): void {
		if (!this.active) return;
		this.actions.beforeRename();
		this.editor.start();
	}

	private openMenu(parent: HTMLElement): void {
		this.menu?.hide();
		const menu = new Menu();
		this.menu = menu;
		let handled = false;
		const run = (action: () => void) => {
			if (!this.active || handled) return;
			handled = true;
			action();
		};
		menu.setParentElement(parent);
		menu.addItem((item) =>
			item
				.setTitle("Rename")
				.setIcon("pencil")
				.onClick(() => run(() => this.startRename())),
		);
		menu.addItem((item) =>
			item
				.setTitle("Delete from library")
				.setIcon("trash-2")
				.onClick(() => run(this.actions.remove)),
		);
		this.manageButton.setAttribute("aria-expanded", "true");
		menu.onHide(() => {
			if (this.menu === menu) this.menu = null;
			this.manageButton.setAttribute("aria-expanded", "false");
			if (!handled) this.focus();
		});
		const bounds = this.manageButton.getBoundingClientRect();
		menu.showAtPosition({ x: bounds.left, y: bounds.bottom }, parent.doc);
	}
}
