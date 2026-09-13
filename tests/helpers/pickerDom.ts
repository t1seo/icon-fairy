import { vi } from "vitest";

export function installPickerDom(doc: Document): void {
	const prototype = Object.getPrototypeOf(Object.getPrototypeOf(doc.createElement("div")));
	Object.defineProperties(prototype, {
		createEl: {
			configurable: true,
			value<K extends keyof HTMLElementTagNameMap>(
				this: HTMLElement,
				tag: K,
				options: DomElementInfo | string = {},
			) {
				const el = this.ownerDocument.createElement(tag);
				const info = typeof options === "string" ? { cls: options } : options;
				if (info.cls) el.className = Array.isArray(info.cls) ? info.cls.join(" ") : info.cls;
				if (typeof info.text === "string") el.textContent = info.text;
				for (const [key, value] of Object.entries(info.attr ?? {})) {
					if (value !== null) el.setAttribute(key, String(value));
				}
				for (const key of ["type", "value", "placeholder", "title"] as const) {
					const value = info[key];
					if (value !== undefined) el.setAttribute(key, value);
				}
				this.appendChild(el);
				return el;
			},
		},
		createDiv: {
			configurable: true,
			value(this: HTMLElement, options?: DomElementInfo | string) {
				return this.createEl("div", options);
			},
		},
		createSpan: {
			configurable: true,
			value(this: HTMLElement, options?: DomElementInfo | string) {
				return this.createEl("span", options);
			},
		},
		empty: {
			configurable: true,
			value(this: HTMLElement) {
				this.replaceChildren();
			},
		},
		addClass: {
			configurable: true,
			value(this: HTMLElement, ...classes: string[]) {
				this.classList.add(...classes);
			},
		},
		removeClass: {
			configurable: true,
			value(this: HTMLElement, ...classes: string[]) {
				this.classList.remove(...classes);
			},
		},
		win: {
			configurable: true,
			get(this: HTMLElement) {
				return this.ownerDocument.defaultView;
			},
		},
		doc: {
			configurable: true,
			get(this: HTMLElement) {
				return this.ownerDocument;
			},
		},
	});
}

export function createPickerWindow() {
	const frame = document.createElement("iframe");
	document.body.appendChild(frame);
	const doc = frame.contentDocument;
	const ownerWindow = frame.contentWindow;
	if (!doc || !ownerWindow) throw new Error("Test iframe has no document/window");
	installPickerDom(doc);
	return { frame, doc, ownerWindow };
}

export function createOwnerClock(ownerWindow: Window) {
	const callbacks = new Map<number, () => void>();
	let nextId = 0;
	vi.spyOn(ownerWindow, "setTimeout").mockImplementation((handler, _delay, ...args) => {
		const id = ++nextId;
		if (typeof handler === "function") callbacks.set(id, () => handler(...args));
		return id;
	});
	vi.spyOn(ownerWindow, "clearTimeout").mockImplementation((id) => {
		if (id !== undefined) callbacks.delete(id);
	});
	return {
		pending: () => callbacks.size,
		flush() {
			for (const [id, callback] of callbacks) {
				callbacks.delete(id);
				callback();
			}
		},
	};
}
