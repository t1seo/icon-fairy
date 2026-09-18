import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UploadBatchReview } from "../src/ui/UploadBatchReview";
import { renderUploadZone } from "../src/ui/UploadPicker";
import { namedButton } from "./helpers/customTabFixture";
import { createOwnerClock, installPickerDom } from "./helpers/pickerDom";
import { latestMenu } from "./helpers/pickerMenu";
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
	vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:preview");
	vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
});
afterEach(() => {
	vi.restoreAllMocks();
	document.body.replaceChildren();
});

describe("icon picker UX regressions", () => {
	it("closes the previous picker when another picker opens", () => {
		const first = createModal();
		first.modal.open();
		const second = createModal();
		second.modal.open();
		expect(first.modal.modalEl.isConnected).toBe(false);
		expect(first.modal.contentEl.childElementCount).toBe(0);
		expect(second.modal.modalEl.isConnected).toBe(true);
		second.modal.close();
	});

	it("applies a card exactly once and closes the picker", () => {
		const { modal, selected } = createModal();
		modal.open();
		const button = namedButton(document, "Use Fairy");
		button.click();
		button.click();
		expect(selected).toHaveBeenCalledExactlyOnceWith({ type: "custom", value: "fairy" });
		expect(modal.modalEl.isConnected).toBe(false);
	});

	it("selects a visible search result through the Random toolbar action", () => {
		const clock = createOwnerClock(window);
		const { modal, selected } = createModal();
		modal.open();
		const search = modal.contentEl.querySelector<HTMLInputElement>('input[type="search"]');
		if (!search) throw new Error("Missing search field");
		search.value = "fairy";
		search.dispatchEvent(new Event("input"));
		clock.flush();
		namedButton(document, "Choose a random icon").click();
		expect(selected).toHaveBeenCalledExactlyOnceWith({ type: "custom", value: "fairy" });
		expect(modal.modalEl.isConnected).toBe(false);
	});

	it("hides the menu on modal close and rejects queued destructive callbacks", () => {
		const { modal, selected, plugin } = createModal();
		modal.open();
		namedButton(document, "Manage Fairy").click();
		const menu = latestMenu();
		const callback = menu.items.find((item) => item.title === "Delete from library")?.callback;
		modal.close();
		callback?.();
		expect(menu.hidden).toBe(true);
		expect(selected).not.toHaveBeenCalled();
		expect(plugin.iconLibrary.remove).not.toHaveBeenCalled();
	});

	it("preserves edited batch entries when a neighboring row is removed", () => {
		const files = ["fairy", "moon", "sun"].map((name) => new File([name], `${name}.png`));
		const review = new UploadBatchReview(document.body, files, vi.fn(), vi.fn());
		const inputs = document.querySelectorAll<HTMLInputElement>(".custom-icon-batch-row-name");
		inputs[0].value = "Edited fairy";
		inputs[2].value = "Edited sun";
		namedButton(document, "Remove moon from import").click();
		expect(
			Array.from(
				document.querySelectorAll<HTMLInputElement>(".custom-icon-batch-row-name"),
				(input) => input.value,
			),
		).toEqual(["Edited fairy", "Edited sun"]);
		review.destroy();
	});

	it.each(["Enter", " "])("opens the upload picker with %s", (key) => {
		renderUploadZone(document.body, vi.fn());
		const zone = document.querySelector<HTMLElement>('[role="button"]');
		const input = document.querySelector<HTMLInputElement>('input[type="file"]');
		if (!zone || !input) throw new Error("Missing upload controls");
		const open = vi.spyOn(input, "click");
		zone.focus();
		zone.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
		expect(open).toHaveBeenCalledOnce();
		expect(zone.getAttribute("aria-label")).toBe("Choose icon images to upload");
	});
});
