import { describe, expect, it, vi } from "vitest";
import {
	chooseFiles,
	control,
	createUploadTab,
	imageFile,
	setSaveToLibrary,
} from "./helpers/uploadFixture";

describe("upload save action recovery", () => {
	it.each(["single", "batch"])(
		"offers recovery when a %s upload write is rejected",
		async (mode) => {
			// Given uploads whose destination rejects file writes.
			const { doc, plugin, library, modal } = createUploadTab();
			plugin.app.vault.adapter.writeBinary.mockRejectedValue(new Error("Write rejected"));
			chooseFiles(doc, mode === "batch" ? [imageFile(), imageFile("moon.png")] : [imageFile()]);
			await vi.waitFor(() => expect(doc.querySelector(".custom-icon-save-btn")).not.toBeNull());
			// When the save action fails.
			control<HTMLButtonElement>(doc, ".custom-icon-save-btn").click();
			await vi.waitFor(() => expect(doc.querySelector('[role="alert"]')).not.toBeNull());
			// Then failure is visible, nothing is selected, and choosing files remains possible.
			expect(doc.querySelector('[role="alert"]')?.textContent).toMatch(/could not|failed/i);
			expect(library).toHaveLength(0);
			expect(modal.selectIcon).not.toHaveBeenCalled();
			control<HTMLButtonElement>(doc, ".custom-icon-cancel-btn").click();
			expect(doc.querySelector('input[type="file"]')).not.toBeNull();
		},
	);

	it("persists and selects only once when Apply is clicked rapidly during a pending save", async () => {
		// Given a preview whose file write remains pending.
		const { doc, plugin, writes, library, modal } = createUploadTab();
		const pending = { finish: () => {} };
		const writeReady = new Promise<void>((resolve) => {
			pending.finish = resolve;
		});
		plugin.app.vault.adapter.writeBinary.mockImplementation(async (path, data) => {
			await writeReady;
			writes.set(path, data);
		});
		chooseFiles(doc, [imageFile()]);
		await vi.waitFor(() => expect(doc.querySelectorAll("img")).toHaveLength(2));
		setSaveToLibrary(doc, true);
		const apply = control<HTMLButtonElement>(doc, ".custom-icon-save-btn");
		// When two clicks arrive before the first save finishes.
		apply.click();
		apply.click();
		await vi.waitFor(() => expect(plugin.app.vault.adapter.writeBinary).toHaveBeenCalled());
		const pendingWrites = plugin.app.vault.adapter.writeBinary.mock.calls.length;
		const busyText = doc.querySelector('[role="status"]')?.textContent;
		pending.finish();
		await vi.waitFor(() => expect(modal.selectIcon).toHaveBeenCalled());
		// Then a visible busy state guards exactly one persistence and selection operation.
		expect(pendingWrites).toBe(1);
		expect(busyText).toMatch(/saving/i);
		expect(writes.size).toBe(1);
		expect(library).toHaveLength(1);
		expect(modal.selectIcon).toHaveBeenCalledOnce();
	});
});
