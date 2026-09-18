import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	createLibraryPicker,
	libraryIcon,
	namedButton,
	visibleNames,
} from "./helpers/customTabFixture";
import { installPickerDom } from "./helpers/pickerDom";

vi.mock("obsidian", async () => ({ ...(await import("./helpers/pickerMenu")), setIcon: vi.fn() }));
beforeEach(() => installPickerDom(document));
afterEach(() => {
	vi.restoreAllMocks();
	document.body.replaceChildren();
});

describe("library target and query state", () => {
	it("marks only the target's currently assigned custom icon", () => {
		// Given a target assigned Fairy and other files assigned Moon.
		const picker = createLibraryPicker();
		// When the library is rendered for that target.
		const current = picker.doc.querySelectorAll(".custom-icon-custom-item-btn.is-current");
		// Then one card exposes both its current state and its regular action name.
		expect(current).toHaveLength(1);
		expect(current[0]).toBe(namedButton(picker.doc, "Use Fairy"));
		expect(current[0].getAttribute("aria-current")).toBe("true");
		const card = current[0].closest(".custom-icon-custom-item");
		expect(card?.querySelector(".custom-icon-current-badge")?.textContent).toContain("Current");
		expect(card?.lastElementChild?.className).toBe("custom-icon-current-badge");
	});

	it("does not show assignment markers for inline insertion", () => {
		// Given the same library opened without a target path.
		const picker = createLibraryPicker(undefined, "");
		// When the inline picker is rendered.
		const current = picker.doc.querySelectorAll(".is-current, .custom-icon-current-badge");
		// Then no file assignment is implied.
		expect(current).toHaveLength(0);
	});

	it.each([0, 1, 7, 8, 9, 80])(
		"keeps its %i-item library size class through filtering",
		(count) => {
			// Given the unfiltered library count.
			const icons = Array.from({ length: count }, (_, i) => libraryIcon(`icon-${i}`, `Icon ${i}`));
			const picker = createLibraryPicker(icons);
			const sizeClass = count <= 8 ? "is-library-compact" : "is-library-full";
			expect(picker.container.classList.contains(sizeClass)).toBe(true);
			expect(picker.container.classList.contains("is-library-small")).toBe(count <= 1);
			// When filtering yields no matches.
			picker.tab.onSearch("missing");
			picker.clock.flush();
			// Then content sizing still reflects the original library.
			expect(visibleNames(picker.doc)).toEqual([]);
			expect(picker.container.classList.contains(sizeClass)).toBe(true);
			expect(picker.container.classList.contains("is-library-small")).toBe(count <= 1);
			expect(picker.container.getAttribute("style")).toBeNull();
		},
	);

	it("explains how to start when the saved library is empty", () => {
		// Given a library with no saved icons.
		const picker = createLibraryPicker([]);
		// When its empty status is rendered.
		const status = picker.doc.querySelector('[role="status"]');
		// Then the guidance points to uploading the first icon.
		expect(status?.textContent).toContain("Your library is empty");
		expect(status?.textContent).toContain("Upload");
	});

	it("gives search-specific guidance when the library has no matches", () => {
		// Given a populated library.
		const picker = createLibraryPicker();
		// When the search matches nothing.
		picker.tab.onSearch("missing");
		picker.clock.flush();
		// Then the empty result explains the query without suggesting the library is empty.
		const status = picker.doc.querySelector('[role="status"]');
		expect(status?.textContent).toContain("No matching icons");
		expect(status?.textContent).toContain("Try another search");
	});

	it("selects a visible icon from Random and ignores Random after destruction", () => {
		// Given exactly one visible search match.
		const picker = createLibraryPicker();
		picker.tab.onSearch("fairy");
		picker.clock.flush();
		// When Random is activated and a late action arrives after destruction.
		picker.tab.onRandom();
		picker.tab.destroy();
		picker.tab.onRandom();
		// Then only the live, visible card can be applied.
		expect(picker.selectIcon).toHaveBeenCalledExactlyOnceWith({ type: "custom", value: "fairy" });
	});
});
