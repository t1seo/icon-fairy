import { App, Platform } from "obsidian";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InlineAnnotationModal } from "../src/ui/InlineAnnotationModal";
import { createOwnerClock, createPickerWindow, installPickerDom } from "./helpers/pickerDom";

const rendering = vi.hoisted(() => ({
	render: vi.fn((_app: unknown, markdown: string, element: HTMLElement) => {
		element.textContent = markdown;
		return Promise.resolve();
	}),
	unload: vi.fn(),
}));

vi.mock("obsidian", () => ({
	App: class {},
	Platform: { isMacOS: true },
	Modal: class {
		contentEl = document.createElement("div");
		modalEl = document.createElement("div");
		scope = { register: vi.fn() };
		constructor(readonly app: unknown) {}
		setTitle = vi.fn();
		close = vi.fn();
	},
	Component: class {
		load = vi.fn();
		unload = rendering.unload;
	},
	MarkdownRenderer: { render: rendering.render },
	Notice: class {},
	ButtonComponent: class {
		readonly buttonEl: HTMLButtonElement;
		constructor(container: HTMLElement) {
			this.buttonEl = container.createEl("button");
		}
		setButtonText(text: string) {
			this.buttonEl.textContent = text;
			return this;
		}
		setDisabled(disabled: boolean) {
			this.buttonEl.disabled = disabled;
			return this;
		}
		setCta() {
			this.buttonEl.addClass("mod-cta");
			return this;
		}
		onClick(callback: () => unknown) {
			this.buttonEl.addEventListener("click", () => {
				void callback();
			});
			return this;
		}
	},
	TextAreaComponent: class {
		readonly inputEl: HTMLTextAreaElement;
		constructor(container: HTMLElement) {
			this.inputEl = container.createEl("textarea");
		}
		setPlaceholder(value: string) {
			this.inputEl.placeholder = value;
		}
		setValue(value: string) {
			this.inputEl.value = value;
		}
		getValue() {
			return this.inputEl.value;
		}
		setDisabled(value: boolean) {
			this.inputEl.disabled = value;
		}
		onChange(callback: (value: string) => void) {
			this.inputEl.addEventListener("input", () => callback(this.inputEl.value));
		}
	},
}));

function createModal(canRemove = false) {
	const owner = createPickerWindow();
	const clock = createOwnerClock(owner.ownerWindow);
	const modal = new InlineAnnotationModal(
		{
			iconName: "Fairy",
			markdown: "Keep this annotation",
			sourcePath: "Fairy.md",
			canRemove,
			onSave: () => Promise.resolve(),
			onRemove: () => Promise.resolve(),
		},
		new App(),
	);
	modal.contentEl = owner.doc.body;
	modal.modalEl = owner.doc.createElement("div");
	modal.onOpen();
	return { ...owner, clock, modal };
}

beforeEach(() => {
	vi.useFakeTimers();
	Platform.isMacOS = true;
	installPickerDom(document);
	vi.stubGlobal("createDiv", () => document.createElement("div"));
	rendering.render.mockClear();
	rendering.unload.mockClear();
});

afterEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
	vi.useRealTimers();
	document.body.replaceChildren();
});

describe("InlineAnnotationModal presentation", () => {
	it.each([
		{ isMacOS: true, hint: "⌘ Enter to save" },
		{ isMacOS: false, hint: "Ctrl Enter to save" },
	])("shows $hint for the current platform", ({ isMacOS, hint }) => {
		// Given the platform used by Obsidian's Mod shortcut.
		Platform.isMacOS = isMacOS;
		// When the editor opens.
		const { modal, doc } = createModal();
		// Then the visible shortcut matches that platform.
		expect(doc.querySelector("kbd")?.textContent).toBe(hint);
		modal.onClose();
	});

	it("starts with five rows when editing a short annotation", () => {
		// Given a short existing annotation, when the editor opens.
		const { modal, doc } = createModal();
		// Then the editor keeps its content in a compact initial area.
		expect(doc.querySelector("textarea")?.rows).toBe(5);
		expect(doc.querySelector("textarea")?.value).toBe("Keep this annotation");
		modal.onClose();
	});

	it("keeps removal separate without a filled warning button", () => {
		// Given a removable annotation, when its actions render.
		const { modal, doc } = createModal(true);
		const remove = doc.querySelector(".custom-icon-annotation-destructive-actions button");
		// Then removal remains explicit and only saving uses the primary fill.
		expect(remove?.textContent).toBe("Remove annotation");
		expect(remove?.classList.contains("mod-warning")).toBe(false);
		expect(remove?.classList.contains("mod-cta")).toBe(false);
		expect(doc.querySelector(".mod-cta")?.textContent).toBe("Save annotation");
		modal.onClose();
	});
});

describe("InlineAnnotationModal owner window lifecycle", () => {
	it("renders previews when the owning window runs its timer", async () => {
		// Given an annotation editor in a separate window.
		const { modal, clock, doc } = createModal();
		// When that window executes the queued preview.
		clock.flush();
		await Promise.resolve();
		// Then Markdown renders in the owner document and is visible there.
		expect(rendering.render).toHaveBeenCalledOnce();
		expect(rendering.render.mock.calls[0]?.[2].ownerDocument).toBe(doc);
		expect(doc.querySelector(".custom-icon-annotation-preview")?.textContent).toBe(
			"Keep this annotation",
		);
		modal.onClose();
	});

	it("cancels a pending preview when the modal closes", () => {
		// Given an annotation preview waiting on the owning window.
		const { modal, clock } = createModal();
		expect(clock.pending()).toBe(1);
		// When the modal closes before the preview starts.
		modal.onClose();
		clock.flush();
		// Then no Markdown component is created after close.
		expect(clock.pending()).toBe(0);
		expect(rendering.render).not.toHaveBeenCalled();
	});

	it("unloads the rendered Markdown component on close", async () => {
		// Given an annotation preview already rendered.
		const { modal, clock, doc } = createModal();
		clock.flush();
		await Promise.resolve();
		// When the modal closes.
		modal.onClose();
		// Then its Markdown component and DOM are removed.
		expect(rendering.unload).toHaveBeenCalledOnce();
		expect(doc.body.childElementCount).toBe(0);
	});
});
