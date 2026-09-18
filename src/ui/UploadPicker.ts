import { setIcon } from "obsidian";
import { CSS_PREFIX } from "../constants";

type ReceiveFiles = (files: readonly File[]) => void;

export function renderUploadZone(container: HTMLElement, onFiles: ReceiveFiles): void {
	const fileInput = container.createEl("input", {
		cls: `${CSS_PREFIX}-file-input`,
		attr: {
			type: "file",
			accept: ".png,.jpg,.jpeg,.svg,.webp",
			multiple: "true",
			tabindex: "-1",
			"aria-hidden": "true",
		},
	});
	fileInput.addEventListener("change", () => {
		if (fileInput.files?.length) onFiles(Array.from(fileInput.files));
	});
	const openFilePicker = () => {
		fileInput.value = "";
		fileInput.click();
	};

	const zone = container.createDiv({
		cls: `${CSS_PREFIX}-upload-zone`,
		attr: {
			role: "button",
			tabindex: "0",
			"aria-label": "Choose icon images to upload",
			"aria-describedby": `${CSS_PREFIX}-upload-formats ${CSS_PREFIX}-upload-methods`,
		},
	});
	setIcon(zone.createDiv({ cls: `${CSS_PREFIX}-upload-zone-icon` }), "upload-cloud");
	zone.createDiv({ text: "Drop icon images here", cls: `${CSS_PREFIX}-upload-zone-text` });
	zone.createDiv({
		text: "PNG, JPG, WebP, or SVG · multiple files supported",
		cls: `${CSS_PREFIX}-upload-zone-hint`,
		attr: { id: `${CSS_PREFIX}-upload-formats` },
	});
	zone.createSpan({ text: "Browse files", cls: `${CSS_PREFIX}-upload-browse` });
	zone.createDiv({
		text: "You can also paste an image from the clipboard",
		cls: `${CSS_PREFIX}-upload-zone-hint is-secondary`,
		attr: { id: `${CSS_PREFIX}-upload-methods` },
	});
	zone.addEventListener("click", openFilePicker);
	zone.addEventListener("keydown", (event) => {
		if (event.key !== "Enter" && event.key !== " ") return;
		event.preventDefault();
		openFilePicker();
	});
	zone.addEventListener("dragover", (event) => {
		event.preventDefault();
		zone.addClass("is-dragover");
	});
	zone.addEventListener("dragleave", () => zone.removeClass("is-dragover"));
	zone.addEventListener("drop", (event) => {
		event.preventDefault();
		zone.removeClass("is-dragover");
		if (event.dataTransfer?.files.length) onFiles(Array.from(event.dataTransfer.files));
	});
}

export function listenForUploadPaste(doc: Document, onFiles: ReceiveFiles): () => void {
	const handler = (event: ClipboardEvent) => {
		const items = event.clipboardData?.items;
		if (!items) return;
		for (const item of Array.from(items)) {
			if (!item.type.startsWith("image/")) continue;
			const file = item.getAsFile();
			if (!file) continue;
			event.preventDefault();
			onFiles([file]);
			return;
		}
	};
	doc.addEventListener("paste", handler);
	return () => doc.removeEventListener("paste", handler);
}

export function renderUploadError(
	container: HTMLElement,
	message: string,
	onBack?: () => void,
): void {
	container.querySelector(`.${CSS_PREFIX}-upload-error`)?.remove();
	const error = container.createDiv({
		cls: `${CSS_PREFIX}-upload-error`,
		attr: { role: "alert" },
	});
	setIcon(error.createSpan(), "triangle-alert");
	error.createSpan({ text: message });
	if (onBack) {
		error
			.createEl("button", { text: "Choose another file", cls: `${CSS_PREFIX}-cancel-btn` })
			.addEventListener("click", onBack);
	}
}
