import { describe, expect, it, vi } from "vitest";
import {
	chooseFiles,
	control,
	createUploadTab,
	imageFile,
	imageProcessor,
	pngResult,
} from "./helpers/uploadFixture";

describe("batch upload review and import", () => {
	it("imports edited names after removing the middle row without assigning an icon", async () => {
		// Given three files with edited first and last names.
		const { doc, library, writes, modal } = createUploadTab();
		chooseFiles(doc, [imageFile(), imageFile("moon.png"), imageFile("sun.svg")]);
		const inputs = doc.querySelectorAll<HTMLInputElement>(".custom-icon-batch-row-name");
		inputs.forEach((input, index) => {
			input.value = ["My fairy", "Moon", "My sun"][index] ?? "";
			input.dispatchEvent(new Event("input", { bubbles: true }));
		});
		doc.querySelectorAll<HTMLButtonElement>(".custom-icon-batch-row-remove")[1]?.click();
		// When the remaining files are added to the library.
		control<HTMLButtonElement>(doc, ".custom-icon-save-btn").click();
		await vi.waitFor(() => expect(doc.querySelector(".custom-icon-batch-result")).not.toBeNull());
		// Then both names and formats survive and no target assignment occurs.
		expect(library.map(({ name, ext }) => ({ name, ext }))).toEqual([
			{ name: "My fairy", ext: "png" },
			{ name: "My sun", ext: "svg" },
		]);
		expect(writes.size).toBe(2);
		expect(modal.selectIcon).not.toHaveBeenCalled();
		expect(modal.close).not.toHaveBeenCalled();
	});

	it("describes the library-only result of a batch action", () => {
		// Given two uploaded images.
		const { doc } = createUploadTab();
		// When the review screen opens.
		chooseFiles(doc, [imageFile(), imageFile("moon.png")]);
		// Then the action describes its exact count and destination.
		expect(control<HTMLButtonElement>(doc, ".custom-icon-save-btn").textContent).toBe(
			"Add 2 icons to library",
		);
	});

	it("keeps a one-row remainder in the library-only batch flow", async () => {
		// Given a two-file batch with one row removed.
		const { doc, library, modal } = createUploadTab();
		chooseFiles(doc, [imageFile(), imageFile("moon.png")]);
		control<HTMLButtonElement>(doc, ".custom-icon-batch-row-remove").click();
		const add = control<HTMLButtonElement>(doc, ".custom-icon-save-btn");
		expect(add.textContent).toBe("Add 1 icon to library");
		// When the remaining row is added.
		add.click();
		await vi.waitFor(() => expect(doc.querySelector(".custom-icon-batch-result")).not.toBeNull());
		// Then it is stored without becoming a single-file assignment.
		expect(library.map(({ name }) => name)).toEqual(["moon"]);
		expect(modal.selectIcon).not.toHaveBeenCalled();
	});

	it("keeps successful entries when a neighboring image cannot be processed", async () => {
		// Given one valid image and one image that fails processing.
		const { doc, writes, library, modal } = createUploadTab();
		imageProcessor
			.mockResolvedValueOnce(pngResult)
			.mockRejectedValueOnce(new Error("Broken image"));
		chooseFiles(doc, [imageFile(), imageFile("broken.png")]);
		// When the batch is imported.
		control<HTMLButtonElement>(doc, ".custom-icon-save-btn").click();
		await vi.waitFor(() => expect(doc.querySelector(".custom-icon-batch-result")).not.toBeNull());
		// Then only the successful image is saved and the partial result is reported.
		expect(library.map(({ name }) => name)).toEqual(["fairy"]);
		expect(writes.size).toBe(1);
		expect(doc.querySelector(".custom-icon-batch-result")?.textContent).toContain("1 of 2");
		expect(modal.selectIcon).not.toHaveBeenCalled();
	});

	it.each(["back", "remove", "close"])("releases batch preview URLs on %s", (action) => {
		// Given two live batch thumbnails.
		const { doc, tab, writes, library } = createUploadTab();
		chooseFiles(doc, [imageFile(), imageFile("moon.png")]);
		const urls = Array.from(doc.querySelectorAll("img"), (img) => img.src);
		// When the user leaves or clears the review.
		if (action === "back") control<HTMLButtonElement>(doc, ".custom-icon-cancel-btn").click();
		if (action === "remove") {
			control<HTMLButtonElement>(doc, ".custom-icon-batch-row-remove").click();
			control<HTMLButtonElement>(doc, ".custom-icon-batch-row-remove").click();
		}
		if (action === "close") tab.destroy();
		// Then every old thumbnail is released without importing.
		urls.forEach((url) => expect(URL.revokeObjectURL).toHaveBeenCalledWith(url));
		expect(writes.size).toBe(0);
		expect(library).toHaveLength(0);
	});
});
