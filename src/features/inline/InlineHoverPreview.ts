import { Component, MarkdownRenderer } from "obsidian";
import type IconStudioPlugin from "../../main";

const previewHiders = new WeakMap<HTMLElement, () => void>();

export function hideInlineHoverPreviews(container: HTMLElement): void {
	container.querySelectorAll<HTMLElement>(".custom-icon-inline-icon").forEach((icon) => {
		previewHiders.get(icon)?.();
	});
}

export function attachHoverPreview(
	span: HTMLElement,
	plugin: Pick<IconStudioPlugin, "app" | "inlineAnnotations">,
	iconUrl: string,
	iconName: string,
	annotationId: string | undefined,
	getSourcePath: () => string,
): () => void {
	let ownerDocument = span.doc;
	let ownerWindow = span.win;
	let tooltip: HTMLElement | null = null;
	let tooltipComponent: Component | null = null;
	let hideTimer: number | null = null;

	const cancelScheduledRemoval = () => {
		if (hideTimer !== null) {
			ownerWindow.clearTimeout(hideTimer);
			hideTimer = null;
		}
	};

	const removeTooltip = () => {
		cancelScheduledRemoval();
		tooltipComponent?.unload();
		tooltipComponent = null;
		if (tooltip) {
			tooltip.removeEventListener("mouseenter", cancelScheduledRemoval);
			tooltip.removeEventListener("mouseleave", scheduleRemove);
			tooltip.remove();
			tooltip = null;
		}
		ownerDocument.removeEventListener("keydown", removeTooltip);
	};

	const scheduleRemove = () => {
		cancelScheduledRemoval();
		hideTimer = ownerWindow.setTimeout(removeTooltip, 120);
	};

	const showTooltip = () => {
		if (tooltip && ownerDocument !== span.doc) removeTooltip();
		cancelScheduledRemoval();
		if (tooltip) return;
		ownerDocument = span.doc;
		ownerWindow = span.win;
		tooltip = ownerDocument.body.createDiv({ cls: "custom-icon-inline-preview" });
		const annotation = annotationId ? plugin.inlineAnnotations.get(annotationId) : undefined;

		const header = tooltip.createDiv({ cls: "custom-icon-inline-preview-header" });

		const img = header.createEl("img");
		img.src = iconUrl;
		img.alt = iconName;

		header.createDiv({ cls: "custom-icon-inline-preview-label", text: iconName });

		if (annotation) {
			tooltip.classList.add("has-annotation");
			const content = tooltip.createDiv({
				cls: "custom-icon-inline-preview-content markdown-rendered",
			});
			const component = new Component();
			component.load();
			tooltipComponent = component;
			void MarkdownRenderer.render(
				plugin.app,
				annotation.markdown,
				content,
				getSourcePath(),
				component,
			).catch((error) => console.error("Failed to render inline icon annotation", error));
			tooltip.addEventListener("mouseenter", cancelScheduledRemoval);
			tooltip.addEventListener("mouseleave", scheduleRemove);
		}

		const rect = span.getBoundingClientRect();
		tooltip.style.left = `${rect.left + rect.width / 2}px`;
		tooltip.style.top = `${rect.top - 8}px`;

		ownerDocument.addEventListener("keydown", removeTooltip);
	};

	span.addEventListener("mouseenter", showTooltip);
	span.addEventListener("mouseleave", scheduleRemove);
	span.addEventListener("focus", showTooltip);
	span.addEventListener("blur", scheduleRemove);
	previewHiders.set(span, removeTooltip);

	return () => {
		removeTooltip();
		span.removeEventListener("mouseenter", showTooltip);
		span.removeEventListener("mouseleave", scheduleRemove);
		span.removeEventListener("focus", showTooltip);
		span.removeEventListener("blur", scheduleRemove);
		previewHiders.delete(span);
	};
}
