import { describe, expect, it, vi } from "vitest";
import type { ProcessedImage } from "../src/services/ImageProcessor";
import {
	chooseFiles,
	control,
	createUploadTab,
	imageFile,
	imageProcessor,
	pasteImage,
	pngResult,
} from "./helpers/uploadFixture";

function pendingImage() {
	let resolve: (value: ProcessedImage) => void = () => {};
	let reject: (reason: Error) => void = () => {};
	const promise = new Promise<ProcessedImage>((onResolve, onReject) => {
		resolve = onResolve;
		reject = onReject;
	});
	return { promise, resolve, reject };
}

describe("upload async lifecycle", () => {
	it.each(["resolve", "reject"] as const)(
		"ignores processing %s after the view is destroyed",
		async (outcome) => {
			// Given image processing that outlives a tab switch.
			const { tab, doc, writes, modal } = createUploadTab();
			const pending = pendingImage();
			imageProcessor.mockReturnValueOnce(pending.promise);
			chooseFiles(doc, [imageFile()]);
			tab.destroy();
			doc.body.textContent = "Library content";
			// When the old processor finishes.
			if (outcome === "resolve") pending.resolve(pngResult);
			else pending.reject(new Error("Broken image"));
			await pending.promise.catch(() => undefined);
			// Then the replacement view is untouched and no icon is applied.
			expect(doc.body.textContent).toBe("Library content");
			expect(writes.size).toBe(0);
			expect(modal.selectIcon).not.toHaveBeenCalled();
		},
	);

	it("keeps a newer clipboard preview when an older file finishes later", async () => {
		// Given a slow file followed by a newer clipboard image.
		const { doc } = createUploadTab();
		const pending = pendingImage();
		imageProcessor.mockReturnValueOnce(pending.promise);
		chooseFiles(doc, [imageFile("old.png")]);
		pasteImage(doc, imageFile("new.png"));
		await vi.waitFor(() => expect(doc.querySelectorAll("img")).toHaveLength(2));
		// When the older upload finishes processing.
		pending.resolve({ data: new ArrayBuffer(2), dataUrl: "data:image/png;base64,OLD" });
		await pending.promise;
		// Then the visible image and editable name remain those of the newer upload.
		expect(control<HTMLInputElement>(doc, ".custom-icon-upload-name-input").value).toBe("new");
		expect(control<HTMLImageElement>(doc, "img").src).toBe(pngResult.dataUrl);
	});

	it("finishes an in-flight batch without replacing a reopened upload view", async () => {
		// Given a started batch whose first image is still processing.
		const { tab, doc, library, modal } = createUploadTab();
		const pending = pendingImage();
		imageProcessor.mockReturnValueOnce(pending.promise);
		chooseFiles(doc, [imageFile(), imageFile("moon.png")]);
		control<HTMLButtonElement>(doc, ".custom-icon-save-btn").click();
		await vi.waitFor(() => expect(imageProcessor).toHaveBeenCalledOnce());
		tab.destroy();
		doc.body.replaceChildren();
		tab.render(doc.body);
		// When the existing import completes.
		pending.resolve(pngResult);
		await vi.waitFor(() => expect(library).toHaveLength(2));
		// Then persistence completes but the new tab stays on its own upload screen.
		expect(doc.querySelector('input[type="file"]')).not.toBeNull();
		expect(doc.querySelector(".custom-icon-batch-result")).toBeNull();
		expect(modal.selectIcon).not.toHaveBeenCalled();
	});
});
