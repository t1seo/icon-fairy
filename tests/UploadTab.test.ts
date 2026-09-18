import { describe, expect, it, vi } from "vitest";
import {
	createUploadTab as createTab,
	makeFileList,
	pasteImage,
	imageProcessor as processImage,
} from "./helpers/uploadFixture";

describe("UploadTab document ownership", () => {
	it("previews clipboard images pasted into its owning window", async () => {
		// Given an upload picker in a separate window.
		const { tab, doc } = createTab();
		// When an image is pasted into that window.
		const event = pasteImage(doc);
		await vi.waitFor(() => expect(doc.querySelectorAll("img")).toHaveLength(2));
		// Then the image is processed and previewed in that document.
		expect(event.defaultPrevented).toBe(true);
		expect(processImage).toHaveBeenCalledOnce();
		expect(doc.querySelectorAll("img")).toHaveLength(2);
		tab.destroy();
	});

	it("leaves clipboard events in other windows untouched", () => {
		// Given an upload picker owned by a different document.
		const { tab } = createTab();
		// When an image is pasted into the main window.
		const event = pasteImage(document);
		// Then this picker does not intercept or process the paste.
		expect(event.defaultPrevented).toBe(false);
		expect(processImage).not.toHaveBeenCalled();
		tab.destroy();
	});

	it("removes the paste listener from the same document on close", () => {
		// Given an upload picker that has been closed.
		const { tab, doc } = createTab();
		tab.destroy();
		// When the user pastes into its former window.
		const event = pasteImage(doc);
		// Then no closed picker consumes that image.
		expect(event.defaultPrevented).toBe(false);
		expect(processImage).not.toHaveBeenCalled();
	});

	it("retains an edited batch name when another row is removed", () => {
		// Given two batch images and an edited first name.
		const { tab, doc } = createTab();
		const files = ["fairy", "moon"].map(
			(name) => new File([name], `${name}.png`, { type: "image/png" }),
		);
		const fileInput = doc.querySelector<HTMLInputElement>('input[type="file"]');
		if (!fileInput) throw new Error("Missing file input");
		Object.defineProperty(fileInput, "files", { value: makeFileList(files) });
		fileInput.dispatchEvent(new Event("change", { bubbles: true }));
		const name = doc.querySelector<HTMLInputElement>(".custom-icon-batch-row-name");
		const remove = doc.querySelectorAll<HTMLButtonElement>(".custom-icon-batch-row-remove")[1];
		if (!name || !remove) throw new Error("Missing batch review controls");
		name.value = "My fairy";
		name.dispatchEvent(new Event("input", { bubbles: true }));
		// When the neighboring image is removed.
		remove.click();
		// Then the retained image keeps the edited name and old previews are released.
		expect(doc.querySelector<HTMLInputElement>(".custom-icon-batch-row-name")?.value).toBe(
			"My fairy",
		);
		expect(doc.querySelectorAll(".custom-icon-batch-row")).toHaveLength(1);
		expect(URL.revokeObjectURL).toHaveBeenCalled();
		tab.destroy();
	});
});
