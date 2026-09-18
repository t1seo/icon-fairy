export class MenuItem {
	title = "";
	callback: () => void = () => {};
	setTitle(title: string): this {
		this.title = title;
		return this;
	}
	setIcon(_icon: string): this {
		return this;
	}
	setWarning(_warning: boolean): this {
		return this;
	}
	onClick(callback: () => void): this {
		this.callback = callback;
		return this;
	}
}

export class Menu {
	static instances: Menu[] = [];
	readonly items: MenuItem[] = [];
	parent: HTMLElement | null = null;
	doc: Document | null = null;
	element: HTMLElement | null = null;
	hidden = false;
	private hideCallback: () => void = () => {};

	constructor() {
		Menu.instances.push(this);
	}
	addItem(build: (item: MenuItem) => void): this {
		const item = new MenuItem();
		build(item);
		this.items.push(item);
		return this;
	}
	setParentElement(parent: HTMLElement): this {
		this.parent = parent;
		return this;
	}
	showAtPosition(_position: { x: number; y: number }, doc = document): this {
		this.doc = doc;
		this.element = doc.body.createDiv({ attr: { role: "menu" } });
		for (const item of this.items) {
			const button = this.element.createEl("button", {
				text: item.title,
				attr: { role: "menuitem" },
			});
			button.addEventListener("click", () => {
				item.callback();
				this.hide();
			});
		}
		this.element.querySelector("button")?.focus();
		return this;
	}
	onHide(callback: () => void): void {
		this.hideCallback = callback;
	}
	hide(): this {
		if (this.hidden) return this;
		this.hidden = true;
		this.element?.remove();
		this.hideCallback();
		return this;
	}
}

export function latestMenu(): Menu {
	const menu = Menu.instances[Menu.instances.length - 1];
	if (!menu) throw new Error("Expected an open library menu");
	return menu;
}

export function chooseMenuAction(title: string): void {
	const button = Array.from(latestMenu().element?.querySelectorAll("button") ?? []).find(
		(item) => item.textContent === title,
	);
	if (!button) throw new Error(`Missing menu action: ${title}`);
	button.click();
}
