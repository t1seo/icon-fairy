import { describe, expect, it, vi } from "vitest";
import {
	chooseFiles,
	control,
	createUploadTab,
	imageFile,
	imageProcessor,
	pngResult,
	setSaveToLibrary,
} from "./helpers/uploadFixture";

describe("upload preview presentation", () => {
	it("shows the same image beside the target in sidebar and note-title contexts", async () => {
		// Given a file-target upload.
		const { doc } = createUploadTab("Notes/Summer trip.md");
		// When the image is selected.
		chooseFiles(doc, [imageFile()]);
		await vi.waitFor(() => expect(doc.querySelectorAll("img")).toHaveLength(2));
		// Then each context shows the actual target and the same processed image.
		const row = control<HTMLElement>(doc, ".custom-icon-upload-preview-row");
		const heading = control<HTMLElement>(doc, ".custom-icon-upload-preview-heading");
		expect(row.textContent).toContain("Summer trip");
		expect(heading.textContent).toContain("Summer trip");
		expect(row.querySelector("img")?.src).toBe(pngResult.dataUrl);
		expect(heading.querySelector("img")?.src).toBe(pngResult.dataUrl);
		expect(control<HTMLButtonElement>(doc, ".custom-icon-save-btn").textContent).toBe("Apply icon");
	});

	it("keeps inline insertion unavailable until the user chooses library saving", async () => {
		// Given an inline PNG preview with the unchanged unchecked default.
		const { doc, writes, library, modal } = createUploadTab("");
		chooseFiles(doc, [imageFile()]);
		await vi.waitFor(() => expect(doc.querySelectorAll("img")).toHaveLength(2));
		const apply = control<HTMLButtonElement>(doc, ".custom-icon-save-btn");
		const checkbox = control<HTMLInputElement>(doc, 'input[type="checkbox"]');
		// When insertion is attempted without saving.
		apply.click();
		// Then the unavailable action and its explanation match the actual requirement.
		expect(apply.textContent).toBe("Insert icon");
		expect(checkbox.checked).toBe(false);
		expect(apply.disabled).toBe(true);
		expect(control<HTMLElement>(doc, ".custom-icon-upload-help").textContent).toMatch(
			/library.*insert/i,
		);
		expect(writes.size).toBe(0);
		expect(library).toHaveLength(0);
		expect(modal.selectIcon).not.toHaveBeenCalled();
	});

	it("updates inline action availability as library saving is toggled", async () => {
		// Given a checked inline upload.
		const { doc } = createUploadTab("");
		chooseFiles(doc, [imageFile()]);
		await vi.waitFor(() => expect(doc.querySelectorAll("img")).toHaveLength(2));
		setSaveToLibrary(doc, true);
		const apply = control<HTMLButtonElement>(doc, ".custom-icon-save-btn");
		expect(apply.disabled).toBe(false);
		// When saving is unchecked again.
		setSaveToLibrary(doc, false);
		// Then insertion becomes unavailable again.
		expect(apply.disabled).toBe(true);
	});

	it("explains SVG library saving while keeping it checked and fixed", async () => {
		// Given an SVG upload.
		const { doc } = createUploadTab();
		// When it is previewed.
		chooseFiles(doc, [imageFile("fairy.svg")]);
		await vi.waitFor(() => expect(doc.querySelectorAll("img")).toHaveLength(2));
		// Then the fixed setting has a visible explanation.
		const checkbox = control<HTMLInputElement>(doc, 'input[type="checkbox"]');
		expect(checkbox.checked).toBe(true);
		expect(checkbox.disabled).toBe(true);
		expect(control<HTMLElement>(doc, ".custom-icon-upload-help").textContent).toMatch(
			/SVG.*library/i,
		);
		expect(control<HTMLButtonElement>(doc, ".custom-icon-save-btn").disabled).toBe(false);
	});

	it("explains optional reuse without requiring it for a file target", async () => {
		// Given a file-target PNG upload.
		const { doc } = createUploadTab();
		// When it is previewed.
		chooseFiles(doc, [imageFile()]);
		await vi.waitFor(() => expect(doc.querySelectorAll("img")).toHaveLength(2));
		// Then saving remains optional and the helper explains reuse.
		expect(control<HTMLInputElement>(doc, 'input[type="checkbox"]').checked).toBe(false);
		expect(control<HTMLButtonElement>(doc, ".custom-icon-save-btn").disabled).toBe(false);
		expect(control<HTMLElement>(doc, ".custom-icon-upload-help").textContent).toMatch(
			/reuse.*files/i,
		);
	});

	it("offers another file after processing fails without persisting anything", async () => {
		// Given an undecodable image.
		const { doc, writes, library, modal } = createUploadTab();
		imageProcessor.mockRejectedValueOnce(new Error("Cannot decode image"));
		chooseFiles(doc, [imageFile("broken.png")]);
		await vi.waitFor(() => expect(doc.querySelector('[role="alert"]')).not.toBeNull());
		// When the user chooses to retry.
		control<HTMLButtonElement>(doc, ".custom-icon-cancel-btn").click();
		// Then the upload zone returns with no selected or persisted icon.
		expect(doc.querySelector('input[type="file"]')).not.toBeNull();
		expect(doc.querySelector('[role="alert"]')).toBeNull();
		expect(writes.size).toBe(0);
		expect(library).toHaveLength(0);
		expect(modal.selectIcon).not.toHaveBeenCalled();
	});
});
