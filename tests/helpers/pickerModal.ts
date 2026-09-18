import { App } from "obsidian";
import { vi } from "vitest";
import type { CustomIcon } from "../../src/types";
import { IconPickerModal } from "../../src/ui/IconPickerModal";
export { Modal } from "./pickerModalRuntime";

export function createModal(path = "Notes/Target.md") {
	const icons: CustomIcon[] = [
		{ id: "fairy", name: "Fairy", path: "icons/fairy.png", createdAt: 1 },
	];
	const plugin = {
		app: {
			vault: {
				adapter: {
					exists: () => Promise.resolve(true),
					mkdir: () => Promise.resolve(),
					writeBinary: () => Promise.resolve(),
				},
			},
		},
		manifest: { dir: ".obsidian/plugins/icon-fairy" },
		iconMap: {},
		removeIcon: vi.fn(),
		iconLibrary: {
			getAll: () => icons,
			search: (query: string) =>
				icons.filter((icon) => icon.name.toLowerCase().includes(query.toLowerCase())),
			getIconUrl: () => "app://icons/fairy.png",
			rename: vi.fn((_id: string, name: string) => {
				icons[0].name = name;
				return Promise.resolve();
			}),
			remove: vi.fn(() => Promise.resolve()),
			add: () => Promise.resolve(),
			addBatch: () => Promise.resolve(),
		},
	};
	const selected = vi.fn();
	const modal = new IconPickerModal(new App(), plugin, path, selected);
	return { modal, selected, plugin };
}
