import { App, Platform } from "obsidian";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InlineAnnotationModal } from "../src/ui/InlineAnnotationModal";
import { installPickerDom } from "./helpers/pickerDom";

vi.mock("obsidian", () => ({
	App: class {},
	Platform: { isMacOS: true },
	Modal: class {
		contentEl = document.createElement("div");
		modalEl = document.createElement("div");
		scope = {
			register: (modifiers: string[], key: string, callback: () => void) => {
				this.contentEl.addEventListener("keydown", (event) => {
					const mod = Platform.isMacOS ? event.metaKey : event.ctrlKey;
					if (modifiers.includes("Mod") && mod && event.key === key) callback();
				});
			},
		};
		constructor(readonly app: unknown) {}
		setTitle = vi.fn();
		onClose() {}
		close = vi.fn(() => this.onClose());
	},
	Component: class {
		load() {}
		unload() {}
	},
	MarkdownRenderer: { render: () => Promise.resolve() },
	Notice: class {},
	ButtonComponent: class {
		readonly buttonEl: HTMLButtonElement;
		constructor(container: HTMLElement) {
			this.buttonEl = container.createEl("button");
		}
		setButtonText(value: string) {
			this.buttonEl.textContent = value;
			return this;
		}
		setDisabled(value: boolean) {
			this.buttonEl.disabled = value;
			return this;
		}
		setCta() {
			this.buttonEl.classList.add("mod-cta");
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

function fixture(canRemove = true) {
	const onSave = vi.fn<(markdown: string) => Promise<void>>().mockResolvedValue();
	const onRemove = vi.fn<() => Promise<void>>().mockResolvedValue();
	const modal = new InlineAnnotationModal(
		{
			iconName: "Fairy",
			markdown: "Existing context",
			sourcePath: "QA.md",
			canRemove,
			onSave,
			onRemove,
		},
		new App(),
	);
	document.body.append(modal.contentEl);
	modal.onOpen();
	const editor = modal.contentEl.querySelector("textarea");
	if (!editor) throw new Error("Missing annotation editor");
	const button = (label: string) => {
		const element = [...modal.contentEl.querySelectorAll("button")].find(
			(item) => item.textContent === label,
		);
		if (!element) throw new Error(`Missing ${label}`);
		return element;
	};
	return { modal, editor, button, onSave, onRemove };
}

beforeEach(() => {
	vi.useFakeTimers();
	Platform.isMacOS = true;
	installPickerDom(document);
});

afterEach(() => {
	vi.restoreAllMocks();
	vi.useRealTimers();
	document.body.replaceChildren();
});

describe("annotation editing actions", () => {
	it.each([true, false])("saves trimmed Markdown through Mod+Enter on Mac=%s", async (isMacOS) => {
		// Given an edited annotation on the current platform.
		Platform.isMacOS = isMacOS;
		const { modal, editor, onSave, onRemove } = fixture();
		editor.value = "  **Context** [[Note]] ![[Image.png]]  ";
		// When the registered platform shortcut is pressed from the editor.
		editor.dispatchEvent(
			new KeyboardEvent("keydown", {
				key: "Enter",
				bubbles: true,
				metaKey: isMacOS,
				ctrlKey: !isMacOS,
			}),
		);
		await Promise.resolve();
		// Then only saving runs and the editor closes after completion.
		expect(onSave).toHaveBeenCalledExactlyOnceWith("**Context** [[Note]] ![[Image.png]]");
		expect(onRemove).not.toHaveBeenCalled();
		expect(modal.close).toHaveBeenCalledOnce();
	});

	it("cancels edited Markdown without changing the saved annotation", () => {
		// Given unsaved changes in an existing annotation.
		const { modal, editor, button, onSave, onRemove } = fixture();
		editor.value = "Discard these edits";
		// When Cancel is clicked.
		button("Cancel").click();
		// Then the modal closes without saving or removing anything.
		expect(modal.close).toHaveBeenCalledOnce();
		expect(onSave).not.toHaveBeenCalled();
		expect(onRemove).not.toHaveBeenCalled();
	});

	it("blocks blank saves while preserving explicit removal", async () => {
		// Given whitespace-only editor content.
		const { modal, editor, button, onSave, onRemove } = fixture();
		editor.value = " \n ";
		editor.dispatchEvent(new Event("input"));
		// When the save shortcut is pressed.
		editor.dispatchEvent(
			new KeyboardEvent("keydown", { key: "Enter", metaKey: true, bubbles: true }),
		);
		await Promise.resolve();
		// Then no write occurs, while explicit removal remains available.
		expect(button("Save annotation").disabled).toBe(true);
		expect(button("Remove annotation").disabled).toBe(false);
		expect(onSave).not.toHaveBeenCalled();
		expect(onRemove).not.toHaveBeenCalled();
		expect(modal.close).not.toHaveBeenCalled();
		modal.onClose();
	});

	it("omits removal when adding a new annotation", () => {
		// Given a new annotation, when its actions render.
		const { modal } = fixture(false);
		// Then only Save and Cancel are available.
		expect(
			[...modal.contentEl.querySelectorAll("button")].map((button) => button.textContent),
		).toEqual(["Cancel", "Save annotation"]);
		modal.onClose();
	});
});

describe.each(["Save annotation", "Remove annotation"])("%s persistence", (action) => {
	it("waits for the pending operation and prevents duplicate writes", async () => {
		// Given a persistence operation that has not completed.
		const { modal, editor, button, onSave, onRemove } = fixture();
		const operation = action === "Save annotation" ? onSave : onRemove;
		let complete = () => {};
		operation.mockReturnValue(
			new Promise<void>((resolve) => {
				complete = resolve;
			}),
		);
		// When an action is activated repeatedly while saving.
		button(action).click();
		button(action).click();
		editor.dispatchEvent(
			new KeyboardEvent("keydown", { key: "Enter", metaKey: true, bubbles: true }),
		);
		// Then only the intended operation runs and controls wait for it.
		expect(operation).toHaveBeenCalledOnce();
		expect(action === "Save annotation" ? onRemove : onSave).not.toHaveBeenCalled();
		expect(editor.disabled).toBe(true);
		expect(button("Save annotation").disabled).toBe(true);
		expect(button("Remove annotation").disabled).toBe(true);
		expect(modal.close).not.toHaveBeenCalled();
		complete();
		await Promise.resolve();
		expect(modal.close).toHaveBeenCalledOnce();
	});

	it("keeps the editor available when persistence fails", async () => {
		// Given a storage failure for the selected action.
		const { modal, editor, button, onSave, onRemove } = fixture();
		const operation = action === "Save annotation" ? onSave : onRemove;
		operation.mockRejectedValue(new Error("Storage unavailable"));
		vi.spyOn(console, "error").mockImplementation(() => {});
		// When the action is attempted.
		button(action).click();
		await Promise.resolve();
		// Then content remains editable and both actions can be retried.
		expect(modal.close).not.toHaveBeenCalled();
		expect(editor.value).toBe("Existing context");
		expect(editor.disabled).toBe(false);
		expect(button("Save annotation").disabled).toBe(false);
		expect(button("Remove annotation").disabled).toBe(false);
		modal.onClose();
	});
});
