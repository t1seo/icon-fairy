import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CustomIcon } from "../src/types";
import { CustomTab } from "../src/ui/CustomTab";
import { createOwnerClock, createPickerWindow, installPickerDom } from "./helpers/pickerDom";

vi.mock("obsidian", () => ({ setIcon: vi.fn() }));

function createLibrary() {
	const icons: CustomIcon[] = [
		{ id: "fairy", name: "Fairy", path: "icons/fairy.png", createdAt: 1 },
		{ id: "moon", name: "Moon", path: "icons/moon.png", createdAt: 2 },
	];
	return {
		getAll: () => icons,
		search: vi.fn((query: string) =>
			icons.filter((icon) => icon.name.toLowerCase().includes(query.toLowerCase())),
		),
		getIconUrl: (id: string) => `app://icons/${id}.png`,
		rename: vi.fn((id: string, name: string) => {
			const icon = icons.find((entry) => entry.id === id);
			if (icon) icon.name = name;
			return Promise.resolve();
		}),
		remove: vi.fn(() => Promise.resolve()),
	};
}

function createTab() {
	const owner = createPickerWindow();
	const clock = createOwnerClock(owner.ownerWindow);
	const library = createLibrary();
	const tab = new CustomTab(
		{ iconLibrary: library, iconMap: {}, removeIcon: vi.fn() },
		{ selectIcon: vi.fn(), getTargetPath: () => "", setRandomEnabled: vi.fn() },
	);
	tab.render(owner.doc.body);
	return { ...owner, clock, library, tab };
}

beforeEach(() => {
	vi.useFakeTimers();
	installPickerDom(document);
});

afterEach(() => {
	vi.restoreAllMocks();
	vi.useRealTimers();
	document.body.replaceChildren();
});

describe("CustomTab owner window lifecycle", () => {
	it("shows only the final query when the owning window runs the debounce", () => {
		// Given a picker rendered in a separate window.
		const { tab, clock, doc, library } = createTab();
		// When the user types two searches before the owner window's timer fires.
		tab.onSearch("fair");
		tab.onSearch("moon");
		clock.flush();
		// Then only the final matching icon is visible.
		expect(Array.from(doc.querySelectorAll("img"), (img) => img.alt)).toEqual(["Moon"]);
		expect(library.search).toHaveBeenCalledExactlyOnceWith("moon");
		tab.destroy();
	});

	it("cancels pending searches when the tab is destroyed", () => {
		// Given a search waiting in the picker window.
		const { tab, clock, library } = createTab();
		tab.onSearch("fair");
		expect(clock.pending()).toBe(1);
		// When the user closes the picker before its timer fires.
		tab.destroy();
		clock.flush();
		// Then no search work remains or runs after close.
		expect(clock.pending()).toBe(0);
		expect(library.search).not.toHaveBeenCalled();
	});

	it("ignores searches received after destruction", () => {
		// Given a picker that has been closed.
		const { tab, clock, library } = createTab();
		tab.destroy();
		// When a queued search event arrives late.
		tab.onSearch("fair");
		clock.flush();
		vi.runAllTimers();
		// Then it cannot render or query the library.
		expect(library.search).not.toHaveBeenCalled();
	});

	it.each([
		["Enter", "  Renamed  ", "Renamed", 1],
		["Escape", "Discard me", "Fairy", 0],
	] as const)("preserves rename semantics for %s", async (key, text, name, calls) => {
		// Given a rename field in the same document as its icon label.
		const { tab, doc, library } = createTab();
		const label = doc.querySelector(".custom-icon-custom-item-label");
		if (!label) throw new Error("Missing icon label");
		label.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
		const input = label.querySelector("input");
		if (!input) throw new Error("Missing rename input");
		expect(input.ownerDocument).toBe(doc);
		input.value = text;
		// When the user commits or cancels the rename.
		input.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
		await Promise.resolve();
		// Then the visible name and saved library reflect that action.
		expect(doc.querySelector(".custom-icon-custom-item-label")?.textContent).toBe(name);
		expect(library.rename).toHaveBeenCalledTimes(calls);
		tab.destroy();
	});
});
