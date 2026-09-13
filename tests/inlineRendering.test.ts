import { App } from "obsidian";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as hoverPreviews from "../src/features/inline/InlineHoverPreview";
import { attachHoverPreview } from "../src/features/inline/InlineHoverPreview";
import { InlineAnnotationStore } from "../src/services/InlineAnnotationStore";

const rendered = vi.hoisted(() => {
	const components: Array<{ loaded: boolean }> = [];
	return { components };
});

vi.mock("obsidian", () => {
	class Component {
		loaded = false;
		constructor() {
			rendered.components.push(this);
		}
		load() {
			this.loaded = true;
		}
		unload() {
			this.loaded = false;
		}
	}
	return {
		App: class {},
		Component,
		MarkdownRenderer: {
			render: (_app: unknown, markdown: string, target: HTMLElement) => {
				target.textContent = markdown;
				return Promise.resolve();
			},
		},
	};
});

function installElementHelpers(element: HTMLElement): void {
	const ownerWindow = element.ownerDocument.defaultView;
	if (!ownerWindow) throw new Error("The test document requires a window.");
	Object.defineProperties(element, {
		doc: { get: () => element.ownerDocument, configurable: true },
		win: { get: () => element.ownerDocument.defaultView, configurable: true },
	});
	element.createEl = (tag, options) => {
		const child = element.ownerDocument.createElement(tag);
		if (typeof options === "string") child.className = options;
		else if (options) {
			if (options.cls) {
				child.className = Array.isArray(options.cls) ? options.cls.join(" ") : options.cls;
			}
			if (options.text) child.textContent = String(options.text);
		}
		installElementHelpers(child);
		element.appendChild(child);
		return child;
	};
	element.createDiv = (options) => element.createEl("div", options);
}

const cleanups: Array<() => void> = [];

function makePreview(ownerDocument = document, annotated = true) {
	installElementHelpers(ownerDocument.body);
	const button = ownerDocument.body.createEl("button");
	button.className = "custom-icon-inline-icon";
	const inlineAnnotations = new InlineAnnotationStore();
	if (annotated) inlineAnnotations.set("note-qa", "Keep this annotation", 1);
	const cleanup = attachHoverPreview(
		button,
		{ app: new App(), inlineAnnotations },
		"data:image/png;base64,aWNvbg==",
		"Fairy",
		annotated ? "note-qa" : undefined,
		() => "QA.md",
	);
	cleanups.push(cleanup);
	return { button, cleanup };
}

function makePopout() {
	const iframe = document.createElement("iframe");
	document.body.appendChild(iframe);
	const ownerDocument = iframe.contentDocument;
	const ownerWindow = iframe.contentWindow;
	if (!ownerDocument || !ownerWindow) throw new Error("The test iframe did not open.");
	installElementHelpers(ownerDocument.body);
	return { ownerDocument, ownerWindow };
}

afterEach(() => {
	for (const cleanup of cleanups.splice(0)) cleanup();
	document.body.replaceChildren();
	rendered.components.splice(0);
	vi.restoreAllMocks();
});

describe("inline icon hover previews", () => {
	it("renders annotation content and its accessible icon name on hover", () => {
		// Given
		const { button } = makePreview();
		// When
		button.dispatchEvent(new Event("mouseenter"));
		// Then
		const tooltip = document.querySelector(".custom-icon-inline-preview");
		expect(tooltip?.textContent).toBe("FairyKeep this annotation");
		expect(tooltip?.querySelector("img")?.alt).toBe("Fairy");
		expect(rendered.components.filter((component) => component.loaded)).toHaveLength(1);
	});

	it("renders a plain icon preview without allocating an annotation component", () => {
		// Given
		const { button } = makePreview(document, false);
		// When
		button.dispatchEvent(new Event("focus"));
		// Then
		expect(document.querySelector(".custom-icon-inline-preview")?.textContent).toBe("Fairy");
		expect(rendered.components).toHaveLength(0);
	});

	it("inserts a popout preview into the icon's own document", () => {
		// Given
		const { ownerDocument } = makePopout();
		const { button } = makePreview(ownerDocument);
		// When
		button.dispatchEvent(new Event("mouseenter"));
		// Then
		expect(ownerDocument.querySelector(".custom-icon-inline-preview")?.textContent).toContain(
			"Fairy",
		);
		expect(document.querySelector(".custom-icon-inline-preview")).toBeNull();
	});

	it("dismisses a popout preview from the same document's keyboard events", () => {
		// Given
		const { ownerDocument } = makePopout();
		const { button } = makePreview(ownerDocument);
		button.dispatchEvent(new Event("mouseenter"));
		// When
		ownerDocument.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
		// Then
		expect(rendered.components.every((component) => !component.loaded)).toBe(true);
		expect(ownerDocument.querySelector(".custom-icon-inline-preview")).toBeNull();
	});

	it("cancels the owning window's pending hide timer during cleanup", () => {
		// Given
		const { ownerDocument, ownerWindow } = makePopout();
		const schedule = vi.spyOn(ownerWindow, "setTimeout").mockReturnValue(41);
		const cancel = vi.spyOn(ownerWindow, "clearTimeout");
		const { button, cleanup } = makePreview(ownerDocument);
		button.dispatchEvent(new Event("mouseenter"));
		button.dispatchEvent(new Event("mouseleave"));
		// When
		cleanup();
		// Then
		expect(schedule).toHaveBeenCalledWith(expect.any(Function), 120);
		expect(cancel).toHaveBeenCalledWith(41);
		expect(rendered.components.every((component) => !component.loaded)).toBe(true);
	});

	it("cannot reopen a preview from a destroyed reading child or editor widget", () => {
		// Given
		const { button, cleanup } = makePreview();
		button.dispatchEvent(new Event("mouseenter"));
		cleanup();
		// When
		button.dispatchEvent(new Event("focus"));
		button.dispatchEvent(new Event("mouseenter"));
		// Then
		expect(document.querySelector(".custom-icon-inline-preview")).toBeNull();
		expect(rendered.components.every((component) => !component.loaded)).toBe(true);
	});

	it("unloads previews in the changed editor without dismissing another window's preview", () => {
		// Given
		const main = makePreview();
		const { ownerDocument } = makePopout();
		const popout = makePreview(ownerDocument);
		main.button.dispatchEvent(new Event("mouseenter"));
		popout.button.dispatchEvent(new Event("mouseenter"));
		// When
		hoverPreviews.hideInlineHoverPreviews(document.body);
		// Then
		expect(document.querySelector(".custom-icon-inline-preview")).toBeNull();
		expect(ownerDocument.querySelector(".custom-icon-inline-preview")?.textContent).toContain(
			"Fairy",
		);
		expect(rendered.components.filter((component) => component.loaded)).toHaveLength(1);
	});

	it("removes tooltip hover listeners when its owning child is unloaded", () => {
		// Given
		const ownerWindow: Window = window;
		const schedule = vi.spyOn(ownerWindow, "setTimeout").mockReturnValue(43);
		const { button, cleanup } = makePreview();
		button.dispatchEvent(new Event("mouseenter"));
		const tooltip = document.querySelector(".custom-icon-inline-preview");
		cleanup();
		// When
		tooltip?.dispatchEvent(new Event("mouseleave"));
		// Then
		expect(schedule).not.toHaveBeenCalled();
	});

	it("renders the same adopted icon in its new document and handles that document's Escape", () => {
		// Given
		const { button } = makePreview();
		const { ownerDocument } = makePopout();
		ownerDocument.body.appendChild(ownerDocument.adoptNode(button));
		expect(button.doc).toBe(ownerDocument);
		// When
		button.dispatchEvent(new Event("mouseenter"));
		// Then
		expect(document.querySelectorAll(".custom-icon-inline-preview")).toHaveLength(0);
		expect(ownerDocument.querySelectorAll(".custom-icon-inline-preview")).toHaveLength(1);
		ownerDocument.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
		expect(ownerDocument.querySelectorAll(".custom-icon-inline-preview")).toHaveLength(0);
		expect(rendered.components.every((component) => !component.loaded)).toBe(true);
	});

	it("replaces an open preview after adoption and cancels its timer in the previous window", () => {
		// Given
		const mainWindow: Window = window;
		vi.spyOn(mainWindow, "setTimeout").mockReturnValue(47);
		const cancelMain = vi.spyOn(mainWindow, "clearTimeout");
		const { button, cleanup } = makePreview();
		button.dispatchEvent(new Event("mouseenter"));
		button.dispatchEvent(new Event("mouseleave"));
		const { ownerDocument, ownerWindow } = makePopout();
		vi.spyOn(ownerWindow, "setTimeout").mockReturnValue(53);
		const cancelPopout = vi.spyOn(ownerWindow, "clearTimeout");
		ownerDocument.body.appendChild(ownerDocument.adoptNode(button));
		// When
		button.dispatchEvent(new Event("mouseenter"));
		// Then
		expect(cancelMain).toHaveBeenCalledWith(47);
		expect(document.querySelectorAll(".custom-icon-inline-preview")).toHaveLength(0);
		expect(ownerDocument.querySelectorAll(".custom-icon-inline-preview")).toHaveLength(1);
		expect(rendered.components.filter((component) => component.loaded)).toHaveLength(1);
		button.dispatchEvent(new Event("mouseleave"));
		document.body.appendChild(document.adoptNode(button));
		cleanup();
		expect(cancelPopout).toHaveBeenCalledWith(53);
		expect(ownerDocument.querySelectorAll(".custom-icon-inline-preview")).toHaveLength(0);
		expect(rendered.components.every((component) => !component.loaded)).toBe(true);
	});
});
