import { vi } from "vitest";
import { installPickerDom } from "./pickerDom";

export class Modal {
	static ownerDocument: Document;
	readonly modalEl: HTMLElement;
	readonly contentEl: HTMLElement;
	readonly titleEl: HTMLElement;
	readonly scope = { register: vi.fn() };

	constructor() {
		const doc = Modal.ownerDocument ?? document;
		installPickerDom(doc);
		const prototype = Object.getPrototypeOf(Object.getPrototypeOf(doc.createElement("div")));
		Object.defineProperty(prototype, "toggleClass", {
			configurable: true,
			value(this: HTMLElement, name: string, enabled: boolean) {
				this.classList.toggle(name, enabled);
			},
		});
		this.modalEl = doc.body.createDiv({ cls: "modal" });
		this.titleEl = this.modalEl.createEl("h2");
		this.contentEl = this.modalEl.createDiv();
	}

	setTitle(title: string): void {
		this.titleEl.textContent = title;
	}
	onOpen(): void {}
	onClose(): void {}
	open(): void {
		this.onOpen();
		this.contentEl.querySelector<HTMLButtonElement>("button")?.focus();
	}
	close(): void {
		this.contentEl.querySelector<HTMLInputElement>(".custom-icon-rename-input")?.blur();
		this.onClose();
		this.modalEl.remove();
	}
}
