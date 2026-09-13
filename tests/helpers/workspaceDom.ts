export function installWorkspaceDom(doc: Document) {
	const prototype: object = Object.getPrototypeOf(doc.createElement("div"));
	const createElement = function <K extends keyof HTMLElementTagNameMap>(
		this: HTMLElement,
		tag: K,
		options?: string | DomElementInfo,
	): HTMLElementTagNameMap[K] {
		const el = this.ownerDocument.createElement(tag);
		const cls = typeof options === "string" ? options : options?.cls;
		if (cls) el.className = Array.isArray(cls) ? cls.join(" ") : cls;
		this.appendChild(el);
		return el;
	};
	const htmlPrototype: object = Object.getPrototypeOf(prototype);
	Object.defineProperties(htmlPrototype, {
		createEl: { configurable: true, value: createElement },
		createSpan: {
			configurable: true,
			value(this: HTMLElement, options?: string | DomElementInfo) {
				return createElement.call(this, "span", options);
			},
		},
		createDiv: {
			configurable: true,
			value(this: HTMLElement, options?: string | DomElementInfo) {
				return createElement.call(this, "div", options);
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
	const elementPrototype: object = Object.getPrototypeOf(htmlPrototype);
	const nodePrototype: object = Object.getPrototypeOf(elementPrototype);
	Object.defineProperty(nodePrototype, "instanceOf", {
		configurable: true,
		value(this: Node, elementType: { name: string }) {
			const win = this.ownerDocument?.defaultView;
			const ownerType: unknown = win && Reflect.get(win, elementType.name);
			return typeof ownerType === "function" && this instanceof ownerType;
		},
	});
}

export function secondaryDocument(): Document {
	const frame = document.createElement("iframe");
	document.body.appendChild(frame);
	const doc = frame.contentDocument;
	if (!doc) throw new Error("Fixture iframe has no document");
	installWorkspaceDom(doc);
	return doc;
}
