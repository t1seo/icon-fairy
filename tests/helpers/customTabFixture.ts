import { vi } from "vitest";
import type { CustomIcon, IconMapping } from "../../src/types";
import { CustomTab } from "../../src/ui/CustomTab";
import { createOwnerClock, createPickerWindow } from "./pickerDom";

export function libraryIcon(id: string, name: string): CustomIcon {
	return { id, name, path: `icons/${id}.png`, createdAt: 1 };
}

export function createLibraryPicker(
	icons = [
		libraryIcon("fairy", "Fairy"),
		libraryIcon("moon", "Moon"),
		libraryIcon("night", "Moonlight"),
	],
	path = "Notes/Target.md",
) {
	const owner = createPickerWindow();
	const clock = createOwnerClock(owner.ownerWindow);
	const iconMap: IconMapping = {
		"Notes/Target.md": { type: "custom", value: "fairy" },
		"Notes/Second.md": { type: "custom", value: "moon" },
		Folder: { type: "custom", value: "moon" },
	};
	const library = {
		getAll: () => [...icons],
		search: vi.fn((query: string) =>
			icons.filter((icon) => icon.name.toLowerCase().includes(query.toLowerCase())),
		),
		getIconUrl: (id: string) => `app://icons/${id}.png`,
		rename: vi.fn((id: string, name: string) => {
			const icon = icons.find((entry) => entry.id === id);
			if (icon) icon.name = name;
			return Promise.resolve();
		}),
		remove: vi.fn((id: string) => {
			const index = icons.findIndex((entry) => entry.id === id);
			if (index >= 0) icons.splice(index, 1);
			return Promise.resolve();
		}),
	};
	const selectIcon = vi.fn();
	const removeIcon = vi.fn((target: string) => {
		delete iconMap[target];
	});
	const tab = new CustomTab(
		{ iconLibrary: library, iconMap, removeIcon },
		{ selectIcon, getTargetPath: () => path, setRandomEnabled: vi.fn() },
	);
	const container = owner.doc.body.createDiv({ cls: "custom-icon-picker-content" });
	tab.render(container);
	return { ...owner, clock, tab, library, iconMap, removeIcon, selectIcon, container };
}

export function namedButton(doc: Document, name: string): HTMLButtonElement {
	const button = Array.from(doc.querySelectorAll("button")).find(
		(item) => item.getAttribute("aria-label") === name,
	);
	if (!button) throw new Error(`Missing button: ${name}`);
	return button;
}

export function renameInput(doc: Document): HTMLInputElement {
	const input = doc.querySelector<HTMLInputElement>(".custom-icon-rename-input");
	if (!input) throw new Error("Expected rename input");
	return input;
}

export function visibleNames(doc: Document): string[] {
	return Array.from(
		doc.querySelectorAll(".custom-icon-custom-item-btn img"),
		(img) => img.getAttribute("alt") ?? "",
	);
}
