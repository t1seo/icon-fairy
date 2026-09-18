import { setIcon } from "obsidian";
import { CSS_PREFIX } from "../constants";
import { isSvgFile } from "../services/ImageProcessor";
import type { BatchEntry } from "./UploadTypes";

export class UploadBatchReview {
	private readonly objectUrls = new Set<string>();

	constructor(
		private readonly container: HTMLElement,
		files: readonly File[],
		private readonly onBack: () => void,
		private readonly onImport: (entries: readonly BatchEntry[]) => void,
	) {
		this.renderBatchEntries(
			files.map((file) => ({
				file,
				name: file.name.replace(/\.[^.]+$/, ""),
				ext: isSvgFile(file) ? "svg" : "png",
			})),
		);
	}

	destroy(): void {
		for (const url of this.objectUrls) URL.revokeObjectURL(url);
		this.objectUrls.clear();
	}

	private renderBatchEntries(entries: readonly BatchEntry[]): void {
		this.destroy();
		this.container.empty();
		const count = `${entries.length} ${entries.length === 1 ? "icon" : "icons"}`;
		const header = this.container.createDiv({ cls: `${CSS_PREFIX}-batch-header` });
		header.createEl("strong", { text: `${count} ready to add` });
		header.createSpan({ text: "Review their library names before adding them." });
		const list = this.container.createDiv({ cls: `${CSS_PREFIX}-batch-list` });
		const nameInputs = new Map<BatchEntry, HTMLInputElement>();
		const currentEntries = () =>
			entries.map((entry) => ({
				...entry,
				name: nameInputs.get(entry)?.value ?? entry.name,
			}));
		entries.forEach((entry, index) => {
			const row = list.createDiv({ cls: `${CSS_PREFIX}-batch-row` });
			row.createDiv({ text: `${index + 1}`, cls: `${CSS_PREFIX}-batch-row-index` });
			const thumb = row.createEl("img", { cls: `${CSS_PREFIX}-batch-row-thumb` });
			const objectUrl = URL.createObjectURL(entry.file);
			this.objectUrls.add(objectUrl);
			thumb.src = objectUrl;
			thumb.alt = `${entry.name} preview`;
			row.createDiv({ text: entry.ext.toUpperCase(), cls: `${CSS_PREFIX}-batch-row-ext` });
			const nameInput = row.createEl("input", {
				type: "text",
				value: entry.name,
				cls: `${CSS_PREFIX}-batch-row-name`,
				attr: { "aria-label": `Library name for ${entry.file.name}` },
			});
			nameInput.value = entry.name;
			nameInputs.set(entry, nameInput);
			const remove = row.createEl("button", {
				cls: `${CSS_PREFIX}-batch-row-remove`,
				attr: {
					type: "button",
					"aria-label": `Remove ${entry.name} from import`,
					title: `Remove ${entry.name}`,
				},
			});
			setIcon(remove, "x");
			remove.addEventListener("click", () => {
				const remaining = currentEntries().filter((_, candidateIndex) => candidateIndex !== index);
				if (remaining.length === 0) this.onBack();
				else this.renderBatchEntries(remaining);
			});
		});
		const bottomBar = this.container.createDiv({ cls: `${CSS_PREFIX}-upload-bottom` });
		bottomBar
			.createEl("button", { text: "Back", cls: `${CSS_PREFIX}-cancel-btn` })
			.addEventListener("click", this.onBack);
		bottomBar
			.createEl("button", {
				text: `Add ${count} to library`,
				cls: `${CSS_PREFIX}-save-btn mod-cta`,
			})
			.addEventListener("click", () => {
				this.onImport(
					currentEntries().map((entry) => ({
						...entry,
						name: entry.name.trim() || entry.file.name.replace(/\.[^.]+$/, ""),
					})),
				);
			});
	}
}

export function renderBatchResult(
	container: HTMLElement,
	imported: number,
	total: number,
	onDone: () => void,
	onBack: () => void,
): void {
	const result = container.createDiv({ cls: `${CSS_PREFIX}-batch-result` });
	setIcon(
		result.createDiv({ cls: `${CSS_PREFIX}-batch-result-icon` }),
		imported === total ? "circle-check" : "triangle-alert",
	);
	result.createDiv({
		text: `Added ${imported} of ${total} ${total === 1 ? "icon" : "icons"} to library.`,
		cls: `${CSS_PREFIX}-upload-zone-text`,
	});
	if (imported < total) {
		result.createEl("p", {
			text: "Some images could not be added. Choose files again to retry.",
			cls: `${CSS_PREFIX}-upload-help`,
			attr: { role: "alert" },
		});
		result
			.createEl("button", { text: "Back", cls: `${CSS_PREFIX}-cancel-btn` })
			.addEventListener("click", onBack);
	}
	result
		.createEl("button", { text: "Done", cls: `${CSS_PREFIX}-save-btn mod-cta` })
		.addEventListener("click", onDone);
}
