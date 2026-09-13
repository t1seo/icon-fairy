import { vi } from "vitest";

export class App {
	workspace = { updateOptions: vi.fn() };
}

export class Plugin {
	constructor(readonly app: App) {}
	loadData = vi.fn<() => Promise<unknown>>().mockResolvedValue({});
	saveData = vi.fn<(data: unknown) => Promise<void>>().mockResolvedValue();
}

export class PluginSettingTab {
	readonly containerEl = document.createElement("div");
	constructor() {
		Object.defineProperty(this.containerEl, "empty", {
			value: () => this.containerEl.replaceChildren(),
		});
	}
}

export class SettingGroup {}

class Toggle {
	readonly inputEl = document.createElement("input");
	constructor(container: HTMLElement) {
		this.inputEl.type = "checkbox";
		container.append(this.inputEl);
	}
	setValue(value: boolean): this {
		this.inputEl.checked = value;
		return this;
	}
	onChange(callback: (value: boolean) => void): this {
		this.inputEl.addEventListener("change", () => callback(this.inputEl.checked));
		return this;
	}
}

class Slider {
	readonly inputEl = document.createElement("input");
	constructor(container: HTMLElement) {
		this.inputEl.type = "range";
		container.append(this.inputEl);
	}
	setLimits(min: number, max: number, step: number): this {
		this.inputEl.min = String(min);
		this.inputEl.max = String(max);
		this.inputEl.step = String(step);
		return this;
	}
	setValue(value: number): this {
		this.inputEl.value = String(value);
		return this;
	}
	onChange(callback: (value: number) => void): this {
		this.inputEl.addEventListener("input", () => callback(this.inputEl.valueAsNumber));
		return this;
	}
}

class Text {
	readonly inputEl = document.createElement("input");
	constructor(container: HTMLElement) {
		this.inputEl.type = "text";
		container.append(this.inputEl);
	}
	setPlaceholder(value: string): this {
		this.inputEl.placeholder = value;
		return this;
	}
	setValue(value: string): this {
		this.inputEl.value = value;
		return this;
	}
	getValue(): string {
		return this.inputEl.value;
	}
}

export class Setting {
	readonly settingEl = document.createElement("div");
	private readonly nameEl = document.createElement("div");
	private readonly descEl = document.createElement("div");
	constructor(container: HTMLElement) {
		this.settingEl.className = "setting-item";
		this.nameEl.className = "setting-item-name";
		this.descEl.className = "setting-item-description";
		this.settingEl.append(this.nameEl, this.descEl);
		container.append(this.settingEl);
	}
	setName(value: string): this {
		this.nameEl.textContent = value;
		return this;
	}
	setDesc(value: string | DocumentFragment): this {
		this.descEl.replaceChildren(value);
		return this;
	}
	setHeading(): this {
		this.settingEl.setAttribute("role", "heading");
		return this;
	}
	addToggle(callback: (toggle: Toggle) => void): this {
		callback(new Toggle(this.settingEl));
		return this;
	}
	addSlider(callback: (slider: Slider) => void): this {
		callback(new Slider(this.settingEl));
		return this;
	}
	addText(callback: (text: Text) => void): this {
		callback(new Text(this.settingEl));
		return this;
	}
}

export class Modal {}
export class EditorSuggest {}
export class Component {}
export class MarkdownRenderChild {}
