import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createLibraryPicker, namedButton, renameInput } from "./helpers/customTabFixture";
import { installPickerDom } from "./helpers/pickerDom";
import { chooseMenuAction } from "./helpers/pickerMenu";

vi.mock("obsidian", async () => ({ ...(await import("./helpers/pickerMenu")), setIcon: vi.fn() }));
beforeEach(() => installPickerDom(document));
afterEach(() => {
	vi.restoreAllMocks();
	document.body.replaceChildren();
});

describe("library focus after edits", () => {
	it.each(["rename", "remove"] as const)(
		"preserves a newer draft when a pending %s finishes on another card",
		async (operation) => {
			const picker = createLibraryPicker();
			let finishSave = () => {};
			const pending = new Promise<void>((resolve) => {
				finishSave = resolve;
			});
			if (operation === "rename") {
				picker.library.rename.mockImplementationOnce((id, name) => {
					const icon = picker.library.getAll().find((entry) => entry.id === id);
					if (icon) icon.name = name;
					return pending;
				});
			} else {
				const remove = picker.library.remove.getMockImplementation();
				picker.library.remove.mockImplementationOnce((id) => {
					void remove?.(id);
					return pending;
				});
			}
			namedButton(picker.doc, "Manage Fairy").click();
			chooseMenuAction(operation === "rename" ? "Rename" : "Delete from library");
			if (operation === "rename") {
				const input = renameInput(picker.doc);
				input.value = "Saved Fairy";
				input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
			}
			namedButton(picker.doc, "Manage Moon").click();
			chooseMenuAction("Rename");
			const draft = renameInput(picker.doc);
			draft.value = "Unsaved Moon";
			finishSave();
			await pending;
			await Promise.resolve();
			expect(renameInput(picker.doc)).toBe(draft);
			expect(draft.value).toBe("Unsaved Moon");
			expect(picker.doc.activeElement).toBe(draft);
			if (operation === "remove") {
				expect(picker.library.getAll().some((icon) => icon.id === "fairy")).toBe(false);
			}
			draft.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
			await Promise.resolve();
			expect(picker.library.rename).toHaveBeenLastCalledWith("moon", "Unsaved Moon");
			expect(picker.library.getAll().find((icon) => icon.id === "moon")?.name).toBe("Unsaved Moon");
			expect(picker.doc.activeElement).toBe(namedButton(picker.doc, "Manage Unsaved Moon"));
		},
	);

	it("focuses the next card after a middle card is deleted", async () => {
		const picker = createLibraryPicker();
		namedButton(picker.doc, "Manage Moon").click();
		chooseMenuAction("Delete from library");
		await Promise.resolve();
		expect(picker.doc.activeElement).toBe(namedButton(picker.doc, "Manage Moonlight"));
	});

	it("keeps search focus when a name commits by leaving the editor", async () => {
		const picker = createLibraryPicker();
		const search = picker.doc.body.createEl("input", { cls: "custom-icon-search-input" });
		namedButton(picker.doc, "Manage Fairy").click();
		chooseMenuAction("Rename");
		renameInput(picker.doc).value = "Sparkle";
		search.focus();
		await Promise.resolve();
		expect(picker.library.rename).toHaveBeenCalledExactlyOnceWith("fairy", "Sparkle");
		expect(picker.doc.activeElement).toBe(search);
	});
});
