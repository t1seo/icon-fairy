import { CSS_PREFIX } from "../constants";
import type { ProcessedFile } from "./UploadTypes";

type PreviewOptions = {
	readonly processed: ProcessedFile;
	readonly defaultName: string;
	readonly targetPath: string;
	readonly onBack: () => void;
	readonly onApply: (name: string, saveToLibrary: boolean) => void;
};

export function renderUploadPreview(container: HTMLElement, options: PreviewOptions): void {
	const { processed, defaultName, targetPath, onBack, onApply } = options;
	const isSvg = processed.ext === "svg";
	const isInline = targetPath.length === 0;
	const targetName = targetPath.split("/").pop()?.replace(/\.md$/i, "") || "Your note";
	const section = container.createDiv({ cls: `${CSS_PREFIX}-preview-section` });
	const row = section.createDiv({ cls: `${CSS_PREFIX}-preview-row` });
	for (const [label, kind] of [
		["Sidebar", "row"],
		["Note title", "heading"],
	] as const) {
		const column = row.createDiv({ cls: `${CSS_PREFIX}-preview-col` });
		const context = column.createDiv({
			cls: `${CSS_PREFIX}-upload-preview-context ${CSS_PREFIX}-upload-preview-${kind}`,
		});
		const image = context.createEl("img");
		image.src = processed.dataUrl;
		image.alt = `${label} icon preview`;
		context.createSpan({ text: targetName });
		column.createDiv({ text: label, cls: `${CSS_PREFIX}-preview-card-label` });
	}

	const bottomBar = container.createDiv({ cls: `${CSS_PREFIX}-upload-bottom` });
	const leftGroup = bottomBar.createDiv({ cls: `${CSS_PREFIX}-upload-bottom-left` });
	const checkboxRow = leftGroup.createDiv({ cls: `${CSS_PREFIX}-upload-checkbox-row` });
	const checkbox = checkboxRow.createEl("input", {
		type: "checkbox",
		cls: `${CSS_PREFIX}-upload-checkbox`,
		attr: {
			id: `${CSS_PREFIX}-save-to-library`,
			"aria-describedby": `${CSS_PREFIX}-upload-save-help`,
		},
	});
	checkbox.checked = isSvg;
	checkbox.disabled = isSvg;
	checkboxRow.createEl("label", {
		text: "Save to library",
		cls: `${CSS_PREFIX}-upload-checkbox-label`,
		attr: { for: checkbox.id },
	});
	leftGroup.createEl("p", {
		text: isSvg
			? "SVG icons must be saved to the library so they can be displayed and reused."
			: isInline
				? "Save to the library to insert this icon and reuse it in other notes."
				: "Save to reuse this icon in other files and notes.",
		cls: `${CSS_PREFIX}-upload-help`,
		attr: { id: `${CSS_PREFIX}-upload-save-help` },
	});
	const nameGroup = leftGroup.createDiv({ cls: `${CSS_PREFIX}-upload-name-group` });
	nameGroup.classList.toggle(`${CSS_PREFIX}-hidden`, !isSvg);
	const nameInput = nameGroup.createEl("input", {
		type: "text",
		placeholder: "Icon name",
		cls: `${CSS_PREFIX}-upload-name-input`,
		value: defaultName,
		attr: { "aria-label": "Library icon name" },
	});
	nameInput.value = defaultName;
	const actions = bottomBar.createDiv({ cls: `${CSS_PREFIX}-upload-actions` });
	actions
		.createEl("button", { text: "Back", cls: `${CSS_PREFIX}-cancel-btn` })
		.addEventListener("click", onBack);
	const apply = actions.createEl("button", {
		text: isInline ? "Insert icon" : "Apply icon",
		cls: `${CSS_PREFIX}-save-btn mod-cta`,
		attr: { "aria-describedby": `${CSS_PREFIX}-upload-save-help` },
	});
	apply.disabled = isInline && !checkbox.checked;
	checkbox.addEventListener("change", () => {
		nameGroup.classList.toggle(`${CSS_PREFIX}-hidden`, !checkbox.checked);
		apply.disabled = isInline && !checkbox.checked;
	});
	apply.addEventListener("click", () => {
		onApply(nameInput.value.trim() || defaultName, isSvg || checkbox.checked);
	});
}
