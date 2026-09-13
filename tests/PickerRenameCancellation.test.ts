import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CustomIcon, PickerTab } from "../src/types";
import { CustomTab } from "../src/ui/CustomTab";
import { IconPickerModal, type TabRenderer } from "../src/ui/IconPickerModal";
import { createPickerWindow, installPickerDom } from "./helpers/pickerDom";

vi.mock("obsidian", () => ({
	setIcon: vi.fn(),
	Modal: class {
		constructor(
			readonly contentEl: HTMLElement,
			readonly onClose: () => void,
		) {}
		close() {
			this.contentEl.querySelector<HTMLInputElement>(".custom-icon-rename-input")?.blur();
			this.onClose();
		}
	},
}));

function createRenamingPicker() {
	const { doc } = createPickerWindow();
	const icon: CustomIcon = { id: "fairy", name: "Fairy", path: "icons/fairy.png", createdAt: 1 };
	const rename = vi.fn((_id: string, name: string) => {
		icon.name = name;
		return Promise.resolve();
	});
	const tab = new CustomTab(
		{
			iconMap: {},
			removeIcon: vi.fn(),
			iconLibrary: {
				getAll: () => [icon],
				getIconUrl: () => "app://icons/fairy.png",
				search: () => [icon],
				rename,
				remove: () => Promise.resolve(),
			},
		},
		{ selectIcon: vi.fn() },
	);
	const context = {
		contentEl: doc.body,
		tabRenderers: new Map<PickerTab, TabRenderer>([["custom", tab]]),
		tabButtons: new Map<PickerTab, HTMLButtonElement>(),
		onClose() {
			IconPickerModal.prototype.onClose.call(context);
		},
	};
	const close = () => IconPickerModal.prototype.close.call(context);
	tab.render(doc.body);
	const label = doc.querySelector(".custom-icon-custom-item-label");
	if (!label) throw new Error("Missing library label");
	label.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
	const input = label.querySelector("input");
	if (!input) throw new Error("Missing rename input");
	return { doc, tab, icon, rename, label, input, close };
}

beforeEach(() => installPickerDom(document));
afterEach(() => {
	vi.restoreAllMocks();
	document.body.replaceChildren();
});

describe("rename cancellation at the modal close boundary", () => {
	it("cancels when modal Escape handling closes before the input receives the key", async () => {
		// Given modal scope handling runs before the input's keydown listener.
		const picker = createRenamingPicker();
		const inputKeydown = vi.fn();
		picker.input.addEventListener("keydown", inputKeydown);
		picker.doc.addEventListener(
			"keydown",
			(event) => {
				if (event.key !== "Escape") return;
				picker.close();
				event.preventDefault();
			},
			{ capture: true, once: true },
		);
		picker.input.value = "Must not be saved";
		// When Escape closes the modal and would blur the edited input first.
		picker.input.dispatchEvent(
			new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }),
		);
		await Promise.resolve();
		// Then the late input Escape handler cannot persist the canceled edit.
		expect(inputKeydown).toHaveBeenCalledOnce();
		expect(picker.rename).not.toHaveBeenCalled();
		expect(picker.icon.name).toBe("Fairy");
		expect(picker.doc.body.childElementCount).toBe(0);
	});

	it("cancels an unfinished rename before other modal close paths blur it", async () => {
		// Given an unfinished name edit.
		const picker = createRenamingPicker();
		picker.input.value = "Discard on close";
		// When the modal closes without an input Escape event.
		picker.close();
		await Promise.resolve();
		// Then no rename is persisted.
		expect(picker.rename).not.toHaveBeenCalled();
		expect(picker.icon.name).toBe("Fairy");
	});

	it("detaches the rename commit handler when its renderer is destroyed", async () => {
		// Given a pending rename in a tab being removed.
		const picker = createRenamingPicker();
		picker.input.value = "Discard after destroy";
		// When the renderer is destroyed before a delayed blur arrives.
		picker.tab.destroy();
		picker.input.dispatchEvent(new FocusEvent("blur"));
		await Promise.resolve();
		// Then the stale input cannot save a canceled edit.
		expect(picker.rename).not.toHaveBeenCalled();
		expect(picker.label.textContent).toBe("Fairy");
	});

	it.each(["Enter", "blur"] as const)(
		"commits once on %s before subsequent close",
		async (action) => {
			// Given a name that should be explicitly committed.
			const picker = createRenamingPicker();
			picker.input.value = "  Renamed  ";
			// When Enter or ordinary blur commits, followed by modal close and another blur.
			if (action === "Enter") {
				picker.input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
			} else {
				picker.input.blur();
			}
			picker.close();
			picker.input.dispatchEvent(new FocusEvent("blur"));
			await Promise.resolve();
			// Then the trimmed value is saved exactly once and is not canceled retroactively.
			expect(picker.rename).toHaveBeenCalledExactlyOnceWith("fairy", "Renamed");
			expect(picker.icon.name).toBe("Renamed");
		},
	);
});
