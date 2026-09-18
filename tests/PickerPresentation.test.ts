import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createOwnerClock, createPickerWindow, installPickerDom } from "./helpers/pickerDom";
import { Modal, createModal } from "./helpers/pickerModal";

vi.mock("obsidian", async () => ({
	...(await import("./helpers/pickerMenu")),
	Modal: (await import("./helpers/pickerModalRuntime")).Modal,
	App: class {},
	setIcon: vi.fn(),
}));
beforeEach(() => {
	installPickerDom(document);
	Modal.ownerDocument = document;
});
afterEach(() => {
	vi.restoreAllMocks();
	document.body.replaceChildren();
});

describe("picker presentation", () => {
	it("disables Random when the library is empty", () => {
		const { modal, plugin } = createModal();
		vi.spyOn(plugin.iconLibrary, "getAll").mockReturnValue([]);
		modal.open();
		expect(
			modal.contentEl.querySelector<HTMLButtonElement>(".custom-icon-random-btn")?.disabled,
		).toBe(true);
		modal.close();
	});

	it("disables Random for an empty query result and restores it for visible icons", () => {
		const clock = createOwnerClock(window);
		const { modal } = createModal();
		modal.open();
		const search = modal.contentEl.querySelector<HTMLInputElement>('input[type="search"]');
		const random = modal.contentEl.querySelector<HTMLButtonElement>(".custom-icon-random-btn");
		if (!search || !random) throw new Error("Missing search controls");
		search.value = "missing";
		search.dispatchEvent(new Event("input"));
		clock.flush();
		expect(random.disabled).toBe(true);
		search.value = "fairy";
		search.dispatchEvent(new Event("input"));
		clock.flush();
		expect(random.disabled).toBe(false);
		modal.close();
	});

	it.each([
		["Notes/Target.md", "For Target.md"],
		["", "Insert into note"],
	])("shows concise target context for %s", (path, copy) => {
		const { modal } = createModal(path);
		modal.open();
		expect(modal.contentEl.querySelector(".custom-icon-picker-description")?.textContent).toBe(
			copy,
		);
		modal.close();
	});

	it("groups the search field separately from the Random button", () => {
		const { modal } = createModal();
		modal.open();
		const toolbar = modal.contentEl.querySelector(".custom-icon-picker-search");
		const field = toolbar?.querySelector(".custom-icon-search-field");
		expect(field?.querySelector("input")?.placeholder).toBe("Search icons");
		expect(field?.querySelector(".custom-icon-search-icon")).not.toBeNull();
		expect(toolbar?.querySelector(".custom-icon-random-btn")?.parentElement).toBe(toolbar);
		modal.close();
	});

	it("exposes Library and Upload as keyboard-operable tabs", () => {
		const { modal } = createModal();
		modal.open();
		const tabs = modal.contentEl.querySelectorAll<HTMLButtonElement>('[role="tab"]');
		expect(Array.from(tabs, (tab) => tab.textContent)).toEqual(["Library", "Upload"]);
		tabs[0].dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
		expect(document.activeElement).toBe(tabs[1]);
		expect(tabs[1].getAttribute("aria-selected")).toBe("true");
		expect(
			modal.contentEl.querySelector('[role="tabpanel"]')?.getAttribute("aria-labelledby"),
		).toBe(tabs[1].id);
		tabs[1].dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
		expect(document.activeElement).toBe(tabs[0]);
		modal.close();
	});

	it("focuses search after host autofocus using the picker window's timer", () => {
		const owner = createPickerWindow();
		Modal.ownerDocument = owner.doc;
		const clock = createOwnerClock(owner.ownerWindow);
		const { modal } = createModal();
		modal.open();
		clock.flush();
		expect(owner.doc.activeElement).toBe(modal.contentEl.querySelector("input[type=search]"));
		modal.close();
	});

	it("cancels pending initial focus when the picker closes", () => {
		const owner = createPickerWindow();
		Modal.ownerDocument = owner.doc;
		const clock = createOwnerClock(owner.ownerWindow);
		const { modal } = createModal();
		modal.open();
		expect(clock.pending()).toBe(1);
		modal.close();
		expect(clock.pending()).toBe(0);
	});
});
