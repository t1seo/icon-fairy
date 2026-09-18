import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { IconPickerModal } from "../src/ui/IconPickerModal";
import { createPickerWindow, installPickerDom } from "./helpers/pickerDom";

vi.mock("obsidian", () => ({ Modal: class {}, setIcon: vi.fn() }));

const navigationMethod = "navigateGrid";
const activationMethod = "activateFocused";
const navigateGrid = IconPickerModal.prototype[navigationMethod];
const activateFocused = IconPickerModal.prototype[activationMethod];

function createPicker(location: "main" | "popout") {
	const doc = location === "main" ? document : createPickerWindow().doc;
	const contentEl = doc.body.createDiv();
	const searchEl = contentEl.createEl("input", { type: "search" });
	const tabButton = contentEl.createEl("button", { cls: "custom-icon-tab-btn" });
	const tabContentEl = contentEl.createDiv();
	const grid = tabContentEl.createDiv({ cls: "custom-icon-custom-grid" });
	const items = ["Fairy", "Moon", "Cloud", "Sun"].map((name, index) => {
		const card = grid.createDiv({ cls: "custom-icon-custom-item" });
		Object.defineProperty(card, "offsetTop", { value: Math.floor(index / 2) * 100 });
		const button = card.createEl("button", {
			cls: "custom-icon-custom-item-btn",
			text: name,
		});
		Object.defineProperty(button, "scrollIntoView", { value: vi.fn() });
		return button;
	});
	const menuButton = grid.createEl("button", { cls: "custom-icon-custom-item-actions" });
	const renameInput = grid.createEl("input", { cls: "custom-icon-rename-input" });
	const context = { contentEl, searchEl, tabContentEl };
	return {
		doc,
		searchEl,
		tabButton,
		menuButton,
		renameInput,
		items,
		navigate(direction: "up" | "down" | "left" | "right") {
			const event = new KeyboardEvent("keydown", { cancelable: true });
			navigateGrid.call(context, event, direction);
			return event;
		},
		activate() {
			const event = new KeyboardEvent("keydown", { key: "Enter", cancelable: true });
			activateFocused.call(context, event);
			return event;
		},
	};
}

beforeEach(() => installPickerDom(document));
afterEach(() => {
	vi.restoreAllMocks();
	document.body.replaceChildren();
});

describe.each(["main", "popout"] as const)("picker keyboard in %s window", (location) => {
	it.each(["menuButton", "renameInput"] as const)("leaves arrow keys with %s", (control) => {
		const picker = createPicker(location);
		picker[control].focus();
		const event = picker.navigate("right");
		expect(picker.doc.activeElement).toBe(picker[control]);
		expect(event.defaultPrevented).toBe(false);
	});

	it.each([
		["down", 0, 2],
		["up", 3, 1],
	] as const)("moves %s using the rendered card columns", (direction, from, to) => {
		const picker = createPicker(location);
		picker.items[from].focus();
		picker.navigate(direction);
		expect(picker.doc.activeElement).toBe(picker.items[to]);
	});

	it("preserves search input focus when ArrowDown is pressed", () => {
		// Given the search input has focus in its own document.
		const picker = createPicker(location);
		picker.searchEl.focus();
		expect(picker.doc.activeElement).toBe(picker.searchEl);
		// When the modal receives ArrowDown.
		const event = picker.navigate("down");
		// Then search editing retains focus and the key is not intercepted.
		expect(picker.doc.activeElement).toBe(picker.searchEl);
		expect(event.defaultPrevented).toBe(false);
	});

	it("leaves tab navigation to the tab controls", () => {
		// Given a source tab has focus in its own document.
		const picker = createPicker(location);
		picker.tabButton.focus();
		// When the modal grid handler receives ArrowRight.
		const event = picker.navigate("right");
		// Then the grid does not steal the tab's keyboard event.
		expect(picker.doc.activeElement).toBe(picker.tabButton);
		expect(event.defaultPrevented).toBe(false);
	});

	it.each([
		["right", 0, 1],
		["left", 2, 1],
	] as const)("moves %s from the focused icon", (direction, from, to) => {
		// Given a specific library icon is focused in its own document.
		const picker = createPicker(location);
		picker.items[from].focus();
		// When the user navigates horizontally.
		const event = picker.navigate(direction);
		// Then focus moves relative to the actual focused icon.
		expect(picker.doc.activeElement).toBe(picker.items[to]);
		expect(event.defaultPrevented).toBe(true);
	});

	it("activates only the focused icon on Enter", () => {
		// Given the second library icon has focus.
		const picker = createPicker(location);
		const selected = vi.fn();
		for (const item of picker.items) {
			item.addEventListener("click", () => selected(item.textContent));
		}
		picker.items[1].focus();
		// When Enter is handled by this picker.
		const event = picker.activate();
		// Then exactly that icon is activated.
		expect(selected).toHaveBeenCalledExactlyOnceWith("Moon");
		expect(event.defaultPrevented).toBe(true);
	});

	it("does not activate an icon while the search input is focused", () => {
		// Given focus is in the picker search field.
		const picker = createPicker(location);
		const selected = vi.fn();
		for (const item of picker.items) item.addEventListener("click", selected);
		picker.searchEl.focus();
		// When Enter is handled by this picker.
		const event = picker.activate();
		// Then editing the search does not select an icon.
		expect(selected).not.toHaveBeenCalled();
		expect(event.defaultPrevented).toBe(false);
	});
});

it("ignores an icon focused in another document", () => {
	// Given a popout picker and an unrelated focused icon in the main window.
	const picker = createPicker("popout");
	const foreignIcon = document.body.createEl("button", { cls: "custom-icon-custom-item-btn" });
	const selected = vi.fn();
	foreignIcon.addEventListener("click", selected);
	foreignIcon.focus();
	// When this picker's Enter handler runs.
	const event = picker.activate();
	// Then it cannot activate the foreign icon.
	expect(selected).not.toHaveBeenCalled();
	expect(event.defaultPrevented).toBe(false);
});
