import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	createLibraryPicker,
	namedButton,
	renameInput,
	visibleNames,
} from "./helpers/customTabFixture";
import { installPickerDom } from "./helpers/pickerDom";
import { Menu, chooseMenuAction, latestMenu } from "./helpers/pickerMenu";

vi.mock("obsidian", async () => ({ ...(await import("./helpers/pickerMenu")), setIcon: vi.fn() }));

beforeEach(() => {
	installPickerDom(document);
	Menu.instances = [];
});
afterEach(() => {
	vi.restoreAllMocks();
	document.body.replaceChildren();
});

describe("library card management", () => {
	it("opens labelled actions in the owner window without applying the icon", () => {
		// Given a library card in a separate window.
		const picker = createLibraryPicker();
		const trigger = namedButton(picker.doc, "Manage Fairy");
		// When the card's management button is activated.
		trigger.click();
		// Then its menu is owned by that document and selection is untouched.
		expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
		expect(latestMenu().doc).toBe(picker.doc);
		expect(latestMenu().parent?.ownerDocument).toBe(picker.doc);
		expect(latestMenu().items.map((item) => item.title)).toEqual(["Rename", "Delete from library"]);
		expect(picker.selectIcon).not.toHaveBeenCalled();
	});

	it("restores the management button's focus when its menu is dismissed", () => {
		// Given an open card menu.
		const picker = createLibraryPicker();
		const trigger = namedButton(picker.doc, "Manage Fairy");
		trigger.click();
		// When the menu closes without an action.
		latestMenu().hide();
		// Then focus returns to its own trigger.
		expect(picker.doc.activeElement).toBe(trigger);
		expect(picker.selectIcon).not.toHaveBeenCalled();
	});

	it("renames once and updates the label, image and both accessible button names", async () => {
		// Given a rename opened through the card menu.
		const picker = createLibraryPicker();
		namedButton(picker.doc, "Manage Fairy").click();
		chooseMenuAction("Rename");
		const input = renameInput(picker.doc);
		expect(picker.doc.activeElement).toBe(input);
		input.value = "  Sparkle  ";
		// When Enter commits and a late blur follows.
		input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
		input.dispatchEvent(new FocusEvent("blur"));
		await Promise.resolve();
		// Then the new name is consistently exposed and persisted once.
		expect(picker.library.rename).toHaveBeenCalledExactlyOnceWith("fairy", "Sparkle");
		expect(namedButton(picker.doc, "Use Sparkle").querySelector("img")?.alt).toBe("Sparkle");
		expect(picker.doc.activeElement).toBe(namedButton(picker.doc, "Manage Sparkle"));
		expect(visibleNames(picker.doc)).toContain("Sparkle");
		expect(picker.selectIcon).not.toHaveBeenCalled();
	});

	it("cancels menu rename on Escape and restores the management focus", async () => {
		// Given an edited name from a menu action.
		const picker = createLibraryPicker();
		namedButton(picker.doc, "Manage Fairy").click();
		chooseMenuAction("Rename");
		const input = renameInput(picker.doc);
		input.value = "Discard";
		// When Escape cancels before a late blur.
		input.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
		input.dispatchEvent(new FocusEvent("blur"));
		await Promise.resolve();
		// Then the original name and focus are restored without persisting.
		expect(picker.library.rename).not.toHaveBeenCalled();
		expect(visibleNames(picker.doc)).toContain("Fairy");
		expect(picker.doc.activeElement).toBe(namedButton(picker.doc, "Manage Fairy"));
	});

	it("deletes only matching references and preserves the visible search scope", async () => {
		// Given a filtered library and multiple assignments to Moon.
		const picker = createLibraryPicker();
		picker.tab.onSearch("moon");
		picker.clock.flush();
		namedButton(picker.doc, "Manage Moon").click();
		// When Moon is deleted from the library.
		chooseMenuAction("Delete from library");
		await Promise.resolve();
		// Then only Moon references are removed and unrelated filtered-out cards stay hidden.
		expect(picker.library.remove).toHaveBeenCalledExactlyOnceWith("moon");
		expect(picker.removeIcon.mock.calls).toEqual([["Notes/Second.md"], ["Folder"]]);
		expect(picker.iconMap).toEqual({ "Notes/Target.md": { type: "custom", value: "fairy" } });
		expect(visibleNames(picker.doc)).toEqual(["Moonlight"]);
		expect(picker.doc.activeElement).toBe(namedButton(picker.doc, "Manage Moonlight"));
	});

	it("reapplies the query when a renamed card no longer matches", async () => {
		// Given a rename within a filtered library.
		const picker = createLibraryPicker();
		picker.tab.onSearch("moon");
		picker.clock.flush();
		namedButton(picker.doc, "Manage Moon").click();
		chooseMenuAction("Rename");
		const input = renameInput(picker.doc);
		input.value = "Sun";
		// When the edited name is committed.
		input.blur();
		await Promise.resolve();
		// Then only remaining query matches can be selected randomly.
		expect(visibleNames(picker.doc)).toEqual(["Moonlight"]);
		picker.tab.onRandom();
		expect(picker.selectIcon).toHaveBeenCalledExactlyOnceWith({ type: "custom", value: "night" });
	});

	it.each(["Rename", "Delete from library"])("ignores stale %s callbacks after close", (action) => {
		// Given callbacks from an open menu.
		const picker = createLibraryPicker();
		namedButton(picker.doc, "Manage Fairy").click();
		const menu = latestMenu();
		const callback = menu.items.find((item) => item.title === action)?.callback;
		// When the tab closes before a queued menu callback runs.
		picker.tab.destroy();
		callback?.();
		// Then the native menu is hidden and cannot mutate or edit the closed picker.
		expect(menu.hidden).toBe(true);
		expect(picker.library.remove).not.toHaveBeenCalled();
		expect(picker.library.rename).not.toHaveBeenCalled();
		expect(picker.doc.querySelector(".custom-icon-rename-input")).toBeNull();
	});
});
