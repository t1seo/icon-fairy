import { afterEach, beforeEach, vi } from "vitest";
import { processImage, processSvg } from "../../src/services/ImageProcessor";
import type { CustomIcon, IconData } from "../../src/types";
import { UploadTab } from "../../src/ui/UploadTab";
import { createPickerWindow, installPickerDom } from "./pickerDom";

vi.mock("obsidian", () => ({ setIcon: vi.fn() }));
vi.mock("../../src/services/ImageProcessor", () => ({
	isSvgFile: (file: File) =>
		file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg"),
	processImage: vi.fn(),
	processSvg: vi.fn(),
}));

export const pngResult = { data: new ArrayBuffer(4), dataUrl: "data:image/png;base64,AAAA" };
export const svgResult = { data: new ArrayBuffer(8), dataUrl: "data:image/svg+xml;base64,AAAA" };
export const imageProcessor = vi.mocked(processImage);
export const svgProcessor = vi.mocked(processSvg);
const activeTabs = new Set<UploadTab>();

export function makeFileList(files: readonly File[]): FileList & Iterable<File> {
	return {
		...files,
		length: files.length,
		item: (index: number) => files[index] ?? null,
		[Symbol.iterator]: function* () {
			yield* files;
		},
	};
}

export function imageFile(name = "fairy.png"): File {
	return new File([name], name, { type: name.endsWith(".svg") ? "image/svg+xml" : "image/png" });
}

export function pasteImage(doc: Document, file = imageFile()) {
	const event = new Event("paste", { bubbles: true, cancelable: true });
	Object.defineProperty(event, "clipboardData", {
		value: { items: [{ type: file.type, getAsFile: () => file }] },
	});
	doc.dispatchEvent(event);
	return event;
}

export function control<E extends Element>(doc: Document, selector: string): E {
	const element = doc.querySelector<E>(selector);
	if (!element) throw new Error(`Missing upload control: ${selector}`);
	return element;
}

export function chooseFiles(doc: Document, files: readonly File[]): void {
	const input = control<HTMLInputElement>(doc, 'input[type="file"]');
	Object.defineProperty(input, "files", { configurable: true, value: makeFileList(files) });
	input.dispatchEvent(new Event("change", { bubbles: true }));
}

export function setSaveToLibrary(doc: Document, checked: boolean): void {
	const checkbox = control<HTMLInputElement>(doc, 'input[type="checkbox"]');
	checkbox.checked = checked;
	checkbox.dispatchEvent(new Event("change", { bubbles: true }));
}

export function createUploadTab(targetPath = "Notes/Trip.md") {
	const owner = createPickerWindow();
	const writes = new Map<string, ArrayBuffer>();
	const library: CustomIcon[] = [];
	const plugin = {
		app: {
			vault: {
				adapter: {
					exists: vi.fn(() => Promise.resolve(true)),
					mkdir: vi.fn(() => Promise.resolve()),
					writeBinary: vi.fn((path: string, data: ArrayBuffer) => {
						writes.set(path, data);
						return Promise.resolve();
					}),
				},
			},
		},
		manifest: { dir: ".obsidian/plugins/icon-fairy" },
		iconLibrary: {
			add: vi.fn((icon: CustomIcon) => {
				library.push(icon);
				return Promise.resolve();
			}),
			addBatch: vi.fn((icons: CustomIcon[]) => {
				library.push(...icons);
				return Promise.resolve();
			}),
		},
	};
	const modal = {
		getTargetPath: () => targetPath,
		selectIcon: vi.fn<(icon: IconData) => void>(),
		close: vi.fn(),
	};
	const tab = new UploadTab(plugin, modal);
	activeTabs.add(tab);
	tab.render(owner.doc.body);
	return { ...owner, tab, plugin, modal, library, writes };
}

beforeEach(() => {
	installPickerDom(document);
	vi.stubGlobal(
		"DataTransfer",
		class {
			private entries: File[] = [];
			items = { add: (file: File) => this.entries.push(file) };
			get files() {
				return makeFileList(this.entries);
			}
		},
	);
	let nextObjectUrl = 0;
	vi.spyOn(URL, "createObjectURL").mockImplementation(() => `blob:preview-${++nextObjectUrl}`);
	vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
	vi.mocked(processImage).mockReset().mockResolvedValue(pngResult);
	vi.mocked(processSvg).mockReset().mockResolvedValue(svgResult);
});

afterEach(() => {
	activeTabs.forEach((tab) => tab.destroy());
	activeTabs.clear();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
	document.body.replaceChildren();
});
