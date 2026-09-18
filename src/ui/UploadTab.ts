import { CSS_PREFIX } from "../constants";
import type { TabRenderer } from "./IconPickerModal";
import { UploadBatchReview, renderBatchResult } from "./UploadBatchReview";
import { importUploadBatch, processUpload, saveUpload } from "./UploadImport";
import { listenForUploadPaste, renderUploadError, renderUploadZone } from "./UploadPicker";
import { renderUploadPreview } from "./UploadPreview";
import type { BatchEntry, ProcessedFile, UploadHost, UploadPlugin } from "./UploadTypes";

type UploadView = {
	readonly container: HTMLElement;
	readonly version: number;
};

export class UploadTab implements TabRenderer {
	private container: HTMLElement | null = null;
	private viewVersion = 0;
	private stopPasteListener: (() => void) | null = null;
	private batchReview: UploadBatchReview | null = null;

	constructor(
		private readonly plugin: UploadPlugin,
		private readonly modal: UploadHost,
	) {}

	render(container: HTMLElement): void {
		this.destroy();
		this.container = container;
		this.stopPasteListener = listenForUploadPaste(container.ownerDocument, (files) => {
			this.handleFiles(files);
		});
		this.showUploadZone();
	}

	destroy(): void {
		this.viewVersion++;
		this.stopPasteListener?.();
		this.stopPasteListener = null;
		this.batchReview?.destroy();
		this.batchReview = null;
		this.container = null;
	}

	private startView(): UploadView | null {
		if (!this.container) return null;
		this.batchReview?.destroy();
		this.batchReview = null;
		this.container.empty();
		return { container: this.container, version: ++this.viewVersion };
	}

	private isCurrent(view: UploadView): boolean {
		return this.container === view.container && this.viewVersion === view.version;
	}

	private showUploadZone(): void {
		const view = this.startView();
		if (!view) return;
		renderUploadZone(view.container, (files) => {
			if (this.isCurrent(view)) this.handleFiles(files);
		});
	}

	private handleFiles(files: readonly File[]): void {
		if (!this.container) return;
		const images = files.filter(
			(file) => file.type.startsWith("image/") || file.name.toLowerCase().endsWith(".svg"),
		);
		const first = images[0];
		if (!first) {
			renderUploadError(this.container, "Choose a PNG, JPG, WebP, or SVG image.");
			return;
		}
		if (images.length === 1) {
			void this.handleSingleFile(first);
			return;
		}
		const view = this.startView();
		if (!view) return;
		this.batchReview = new UploadBatchReview(
			view.container,
			images,
			() => {
				if (this.isCurrent(view)) this.showUploadZone();
			},
			(entries) => {
				if (this.isCurrent(view)) void this.executeBatchImport(entries);
			},
		);
	}

	private async handleSingleFile(file: File): Promise<void> {
		const view = this.startView();
		if (!view) return;
		this.renderStatus(view.container, "Processing image...");
		try {
			const processed = await processUpload(file);
			if (!this.isCurrent(view)) return;
			view.container.empty();
			renderUploadPreview(view.container, {
				processed,
				defaultName: file.name.replace(/\.[^.]+$/, ""),
				targetPath: this.modal.getTargetPath(),
				onBack: () => {
					if (this.isCurrent(view)) this.showUploadZone();
				},
				onApply: (name, saveToLibrary) => {
					if (this.isCurrent(view)) void this.applyIcon(processed, name, saveToLibrary);
				},
			});
		} catch {
			if (!this.isCurrent(view)) return;
			view.container.empty();
			renderUploadError(
				view.container,
				"This image could not be processed. Try another file.",
				() => this.showUploadZone(),
			);
		}
	}

	private async applyIcon(
		processed: ProcessedFile,
		name: string,
		saveToLibrary: boolean,
	): Promise<void> {
		const view = this.startView();
		if (!view) return;
		this.renderStatus(view.container, "Saving icon...");
		try {
			const icon = await saveUpload(this.plugin, processed, name, saveToLibrary);
			if (this.isCurrent(view)) this.modal.selectIcon(icon);
		} catch {
			this.showSaveError(view, "This icon could not be saved. Choose the file again to retry.");
		}
	}

	private async executeBatchImport(entries: readonly BatchEntry[]): Promise<void> {
		const view = this.startView();
		if (!view) return;
		const status = this.renderStatus(view.container, `Adding 0/${entries.length}...`);
		try {
			const imported = await importUploadBatch(this.plugin, entries, (count) => {
				if (this.isCurrent(view)) status.textContent = `Adding ${count}/${entries.length}...`;
			});
			if (!this.isCurrent(view)) return;
			view.container.empty();
			renderBatchResult(
				view.container,
				imported,
				entries.length,
				() => this.modal.close(),
				() => this.showUploadZone(),
			);
		} catch {
			this.showSaveError(
				view,
				"These icons could not be added to the library. Choose the files again to retry.",
			);
		}
	}

	private showSaveError(view: UploadView, message: string): void {
		if (!this.isCurrent(view)) return;
		view.container.empty();
		renderUploadError(view.container, message, () => this.showUploadZone());
	}

	private renderStatus(container: HTMLElement, text: string): HTMLParagraphElement {
		return container.createEl("p", {
			text,
			cls: `${CSS_PREFIX}-placeholder`,
			attr: { role: "status", "aria-live": "polite" },
		});
	}
}
