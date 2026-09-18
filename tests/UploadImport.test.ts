import { describe, expect, it, vi } from "vitest";
import {
	chooseFiles,
	control,
	createUploadTab,
	imageFile,
	pngResult,
	setSaveToLibrary,
	svgResult,
} from "./helpers/uploadFixture";

describe("single upload persistence", () => {
	it("applies a PNG file without adding an unchecked upload to the library", async () => {
		// Given a PNG preview with library saving unchecked.
		const { doc, writes, library, modal } = createUploadTab();
		chooseFiles(doc, [imageFile()]);
		await vi.waitFor(() => expect(doc.querySelectorAll("img")).toHaveLength(2));
		// When the user applies the icon.
		control<HTMLButtonElement>(doc, ".custom-icon-save-btn").click();
		await vi.waitFor(() => expect(modal.selectIcon).toHaveBeenCalledOnce());
		// Then the processed PNG is persisted and selected without a library entry.
		const selection = modal.selectIcon.mock.calls[0]?.[0];
		expect(writes.get(`.obsidian/plugins/icon-fairy/icons/${selection?.value}.png`)).toBe(
			pngResult.data,
		);
		expect(writes.size).toBe(1);
		expect(library).toHaveLength(0);
		expect(selection?.type).toBe("custom");
	});

	it("saves the edited name before inline selection and retains PNG bytes", async () => {
		// Given an inline PNG upload with saving enabled and an edited name.
		const { doc, writes, library, modal } = createUploadTab("");
		chooseFiles(doc, [imageFile()]);
		await vi.waitFor(() => expect(doc.querySelectorAll("img")).toHaveLength(2));
		setSaveToLibrary(doc, true);
		control<HTMLInputElement>(doc, ".custom-icon-upload-name-input").value = "  My fairy  ";
		modal.selectIcon.mockImplementation((icon) => {
			expect(library.find((entry) => entry.id === icon.value)?.name).toBe("My fairy");
		});
		// When the user inserts the uploaded icon.
		control<HTMLButtonElement>(doc, ".custom-icon-save-btn").click();
		await vi.waitFor(() => expect(modal.selectIcon).toHaveBeenCalledOnce());
		// Then selection refers to the persisted library entry and exact processed bytes.
		expect(library).toHaveLength(1);
		expect(library[0]).toMatchObject({ name: "My fairy", tags: [], ext: "png" });
		expect(writes.get(`.obsidian/plugins/icon-fairy/${library[0]?.path}`)).toBe(pngResult.data);
	});

	it("always saves SVG uploads with their original processed bytes and extension", async () => {
		// Given an SVG preview whose fixed library option is checked.
		const { doc, writes, library, modal } = createUploadTab();
		chooseFiles(doc, [imageFile("moon.svg")]);
		await vi.waitFor(() => expect(doc.querySelectorAll("img")).toHaveLength(2));
		// When the user applies the SVG.
		control<HTMLButtonElement>(doc, ".custom-icon-save-btn").click();
		await vi.waitFor(() => expect(modal.selectIcon).toHaveBeenCalledOnce());
		// Then the selected icon points at the SVG library entry without rasterization.
		expect(library).toHaveLength(1);
		expect(library[0]).toMatchObject({ name: "moon", ext: "svg" });
		expect(library[0]?.path.endsWith(".svg")).toBe(true);
		expect(writes.get(`.obsidian/plugins/icon-fairy/${library[0]?.path}`)).toBe(svgResult.data);
	});

	it("uses the original filename when a saved icon name is left blank", async () => {
		// Given a saved PNG upload with a whitespace-only name.
		const { doc, library, modal } = createUploadTab();
		chooseFiles(doc, [imageFile("night.sky.png")]);
		await vi.waitFor(() => expect(doc.querySelectorAll("img")).toHaveLength(2));
		setSaveToLibrary(doc, true);
		control<HTMLInputElement>(doc, ".custom-icon-upload-name-input").value = "  ";
		// When the user applies the icon.
		control<HTMLButtonElement>(doc, ".custom-icon-save-btn").click();
		await vi.waitFor(() => expect(modal.selectIcon).toHaveBeenCalledOnce());
		// Then the filename stem remains the library fallback name.
		expect(library[0]?.name).toBe("night.sky");
	});

	it("returns from the preview without selecting or persisting the upload", async () => {
		// Given a processed image ready for application.
		const { doc, writes, library, modal } = createUploadTab();
		chooseFiles(doc, [imageFile()]);
		await vi.waitFor(() => expect(doc.querySelectorAll("img")).toHaveLength(2));
		// When the user goes back.
		control<HTMLButtonElement>(doc, ".custom-icon-cancel-btn").click();
		// Then the file picker is restored without side effects.
		expect(doc.querySelector('input[type="file"]')).not.toBeNull();
		expect(doc.querySelectorAll("img")).toHaveLength(0);
		expect(writes.size).toBe(0);
		expect(library).toHaveLength(0);
		expect(modal.selectIcon).not.toHaveBeenCalled();
	});
});
