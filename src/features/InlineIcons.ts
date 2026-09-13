import {
	Decoration,
	type DecorationSet,
	type EditorView,
	type PluginValue,
	ViewPlugin,
	type ViewUpdate,
	WidgetType,
} from "@codemirror/view";
import {
	type MarkdownPostProcessorContext,
	MarkdownRenderChild,
	MarkdownView,
	Menu,
	editorInfoField,
} from "obsidian";
import type IconStudioPlugin from "../main";
import { InlineAnnotationModal } from "../ui/InlineAnnotationModal";
import { removeInlineIconAnnotation } from "../utils/inlineAnnotationTransactions";
import {
	buildInlineIconRegex,
	replaceInlineIconInSection,
	setInlineIconAnnotation,
} from "../utils/inlineIconSyntax";
import { attachHoverPreview, hideInlineHoverPreviews } from "./inline/InlineHoverPreview";

/** Resolve a captured value to an actual icon ID by checking ID first, then name */
function resolveIconId(value: string, plugin: IconStudioPlugin): string | null {
	const lib = plugin.iconLibrary;
	if (lib.getById(value)) return value;
	const byName = lib.getAll().find((i) => i.name === value);
	return byName ? byName.id : null;
}

/** Attach a hover preview tooltip to an inline icon span. Returns a cleanup function. */
interface InlineIconTarget {
	shortcode: string;
	annotationId?: string;
	sourcePath: string;
	replaceShortcode: (nextShortcode: string) => Promise<void>;
}

function createAnnotationId(plugin: IconStudioPlugin): string {
	let id: string;
	do {
		id = `note-${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
	} while (plugin.inlineAnnotations.get(id));
	return id;
}

function openAnnotationModal(plugin: IconStudioPlugin, iconName: string, target: InlineIconTarget) {
	const annotationId = target.annotationId ?? createAnnotationId(plugin);
	const annotation = plugin.inlineAnnotations.get(annotationId);

	new InlineAnnotationModal(
		{
			iconName,
			markdown: annotation?.markdown ?? "",
			sourcePath: target.sourcePath,
			canRemove: annotation !== undefined,
			onSave: async (markdown) => {
				await plugin.saveInlineAnnotation(annotationId, markdown);
				if (target.annotationId) return;
				try {
					await target.replaceShortcode(setInlineIconAnnotation(target.shortcode, annotationId));
				} catch (error) {
					try {
						await plugin.removeInlineAnnotation(annotationId);
					} catch (rollbackError) {
						console.error("Failed to roll back inline icon annotation", rollbackError);
					}
					throw error;
				}
			},
			onRemove: async () => {
				const annotationId = target.annotationId;
				if (!annotationId || !annotation) return;
				await removeInlineIconAnnotation({
					annotatedShortcode: target.shortcode,
					replaceShortcode: target.replaceShortcode,
					removeAnnotation: () => plugin.removeInlineAnnotation(annotationId),
				});
			},
		},
		plugin.app,
	).open();
}

function attachAnnotationMenu(
	span: HTMLElement,
	plugin: IconStudioPlugin,
	iconName: string,
	target: InlineIconTarget,
) {
	span.addEventListener("click", (event) => {
		event.preventDefault();
		openAnnotationModal(plugin, iconName, target);
	});

	span.addEventListener("keydown", (event) => {
		if (event.key !== "Enter" && event.key !== " ") return;
		event.preventDefault();
		openAnnotationModal(plugin, iconName, target);
	});

	span.addEventListener("contextmenu", (event) => {
		event.preventDefault();
		event.stopPropagation();
		const hasAnnotation = target.annotationId
			? plugin.inlineAnnotations.get(target.annotationId) !== undefined
			: false;
		new Menu()
			.addItem((item) =>
				item
					.setTitle(hasAnnotation ? "Edit icon annotation" : "Add icon annotation")
					.setIcon(hasAnnotation ? "message-square-text" : "message-square-plus")
					.onClick(() => openAnnotationModal(plugin, iconName, target)),
			)
			.showAtMouseEvent(event);
	});
}

function createInlineIconElement(
	ownerDocument: Document,
	plugin: IconStudioPlugin,
	iconId: string,
	annotationId: string | undefined,
	target: InlineIconTarget,
): { span: HTMLElement; cleanup: () => void } {
	const span = ownerDocument.adoptNode(createEl("button"));
	span.type = "button";
	span.className = "custom-icon-inline-icon is-img";
	span.tabIndex = 0;

	const iconUrl = plugin.iconLibrary.getIconUrl(iconId);
	const iconMeta = plugin.iconLibrary.getById(iconId);
	const iconName = iconMeta?.name ?? iconId;
	const img = span.createEl("img");
	img.src = iconUrl;
	img.alt = "";

	const annotation = annotationId ? plugin.inlineAnnotations.get(annotationId) : undefined;
	span.setAttribute("aria-label", annotation ? `${iconName}, annotated` : iconName);
	if (annotation) span.classList.add("has-annotation");
	attachAnnotationMenu(span, plugin, iconName, target);
	const cleanup = attachHoverPreview(
		span,
		plugin,
		iconUrl,
		iconName,
		annotationId,
		() => target.sourcePath,
	);
	return { span, cleanup };
}

/** CM6 Widget that renders an inline custom icon image */
class InlineCustomIconWidget extends WidgetType {
	private removeTooltip?: () => void;

	constructor(
		private iconId: string,
		private annotationId: string | undefined,
		private shortcode: string,
		private from: number,
		private to: number,
		private plugin: IconStudioPlugin,
	) {
		super();
	}

	toDOM(view: EditorView): HTMLElement {
		const sourcePath = view.state.field(editorInfoField).file?.path ?? "";
		let currentShortcode = this.shortcode;
		const { span, cleanup } = createInlineIconElement(
			view.dom.doc,
			this.plugin,
			this.iconId,
			this.annotationId,
			{
				shortcode: this.shortcode,
				annotationId: this.annotationId,
				sourcePath,
				replaceShortcode: (nextShortcode) => {
					const currentTo = this.from + currentShortcode.length;
					const current = view.state.doc.sliceString(this.from, currentTo);
					if (current !== currentShortcode) {
						throw new Error("The inline icon changed before the annotation was saved.");
					}
					view.dispatch({
						changes: { from: this.from, to: currentTo, insert: nextShortcode },
					});
					currentShortcode = nextShortcode;
					return Promise.resolve();
				},
			},
		);
		this.removeTooltip = cleanup;
		return span;
	}

	eq(other: InlineCustomIconWidget): boolean {
		return (
			this.iconId === other.iconId &&
			this.annotationId === other.annotationId &&
			this.shortcode === other.shortcode &&
			this.from === other.from &&
			this.to === other.to
		);
	}

	destroy(_dom: HTMLElement) {
		this.removeTooltip?.();
	}
}

/** Build decorations for all visible :PREFIX-ICONID: matches */
function buildDecorations(view: EditorView, plugin: IconStudioPlugin): DecorationSet {
	if (!plugin.settings.enableInlineIcons) return Decoration.none;

	const widgets: Array<{ from: number; to: number; deco: Decoration }> = [];

	for (const { from, to } of view.visibleRanges) {
		const text = view.state.doc.sliceString(from, to);

		for (const match of text.matchAll(buildInlineIconRegex(plugin.settings.inlineIconPrefix))) {
			const iconId = resolveIconId(match[1], plugin);
			if (!iconId) continue;
			const matchFrom = from + match.index;
			const matchTo = matchFrom + match[0].length;
			const widget = new InlineCustomIconWidget(
				iconId,
				match[2],
				match[0],
				matchFrom,
				matchTo,
				plugin,
			);

			widgets.push({
				from: matchFrom,
				to: matchTo,
				deco: Decoration.replace({ widget }),
			});
		}
	}

	if (widgets.length === 0) return Decoration.none;

	widgets.sort((a, b) => a.from - b.from);
	return Decoration.set(widgets.map((w) => w.deco.range(w.from, w.to)));
}

/** Create the CM6 ViewPlugin for inline icon decoration */
function createInlineIconPlugin(plugin: IconStudioPlugin) {
	return ViewPlugin.fromClass(
		class implements PluginValue {
			decorations: DecorationSet;

			constructor(view: EditorView) {
				this.decorations = buildDecorations(view, plugin);
			}

			update(update: ViewUpdate) {
				if (update.docChanged) {
					hideInlineHoverPreviews(update.view.dom);
				}
				this.decorations = buildDecorations(update.view, plugin);
			}
		},
		{ decorations: (v) => v.decorations },
	);
}

/**
 * Registers inline icon support for both editor and reading mode.
 * Supports custom icons via the configured prefix, such as :ci-ICONID:.
 */
export class InlineIcons {
	constructor(private plugin: IconStudioPlugin) {}

	enable() {
		// Editor mode: CM6 extension
		this.plugin.registerEditorExtension([createInlineIconPlugin(this.plugin)]);

		// Reading mode: Markdown post processor
		this.plugin.registerMarkdownPostProcessor(
			(el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
				this.processElement(el, ctx);
			},
		);
	}

	private processElement(el: HTMLElement, ctx: MarkdownPostProcessorContext) {
		if (!this.plugin.settings.enableInlineIcons) return;

		const ownerDocument = el.doc;
		const walker = ownerDocument.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
		const occurrenceCounts = new Map<string, number>();

		const replacements: {
			node: Text;
			matches: {
				index: number;
				length: number;
				iconId: string;
				annotationId?: string;
				shortcode: string;
				occurrenceIndex: number;
			}[];
		}[] = [];

		let textNode = walker.nextNode() as Text | null;
		while (textNode) {
			const text = textNode.textContent ?? "";
			const matches: {
				index: number;
				length: number;
				iconId: string;
				annotationId?: string;
				shortcode: string;
				occurrenceIndex: number;
			}[] = [];

			for (const match of text.matchAll(
				buildInlineIconRegex(this.plugin.settings.inlineIconPrefix),
			)) {
				const resolved = resolveIconId(match[1], this.plugin);
				if (!resolved) continue;
				const occurrenceIndex = occurrenceCounts.get(match[0]) ?? 0;
				occurrenceCounts.set(match[0], occurrenceIndex + 1);
				matches.push({
					index: match.index,
					length: match[0].length,
					iconId: resolved,
					annotationId: match[2],
					shortcode: match[0],
					occurrenceIndex,
				});
			}

			if (matches.length > 0) {
				replacements.push({ node: textNode, matches });
			}
			textNode = walker.nextNode() as Text | null;
		}

		for (const { node, matches } of replacements) {
			const text = node.textContent ?? "";
			const parent = node.parentNode;
			if (!parent) continue;

			const fragment = ownerDocument.adoptNode(createFragment());
			let lastIndex = 0;

			for (const m of matches) {
				if (m.index > lastIndex) {
					fragment.appendChild(ownerDocument.createTextNode(text.slice(lastIndex, m.index)));
				}

				let currentShortcode = m.shortcode;
				let currentSourceIndex: number | null = null;
				const { span, cleanup } = createInlineIconElement(
					ownerDocument,
					this.plugin,
					m.iconId,
					m.annotationId,
					{
						shortcode: m.shortcode,
						annotationId: m.annotationId,
						sourcePath: ctx.sourcePath,
						replaceShortcode: async (nextShortcode) => {
							const section = ctx.getSectionInfo(el);
							if (!section) {
								throw new Error("The rendered note section is no longer available.");
							}
							const file = this.plugin.app.vault.getFileByPath(ctx.sourcePath);
							if (!file) throw new Error("The note file is no longer available.");
							await this.plugin.app.vault.process(file, (source) => {
								if (currentSourceIndex !== null) {
									const current = source.slice(
										currentSourceIndex,
										currentSourceIndex + currentShortcode.length,
									);
									if (current !== currentShortcode) {
										throw new Error("The inline icon changed before the annotation was saved.");
									}
									const nextSource = `${source.slice(0, currentSourceIndex)}${nextShortcode}${source.slice(
										currentSourceIndex + currentShortcode.length,
									)}`;
									currentShortcode = nextShortcode;
									return nextSource;
								}
								const nextSource = replaceInlineIconInSection(
									source,
									section.lineStart,
									section.lineEnd,
									m.shortcode,
									nextShortcode,
									m.occurrenceIndex,
								);
								if (nextSource === null) {
									throw new Error("The inline icon changed before the annotation was saved.");
								}
								const linesBeforeSection = source.split("\n").slice(0, section.lineStart);
								const sectionOffset = linesBeforeSection.reduce(
									(length, line) => length + line.length + 1,
									0,
								);
								const sectionSource = source
									.split("\n")
									.slice(section.lineStart, section.lineEnd + 1)
									.join("\n");
								let matchIndex = -1;
								let searchFrom = 0;
								for (let index = 0; index <= m.occurrenceIndex; index += 1) {
									matchIndex = sectionSource.indexOf(currentShortcode, searchFrom);
									searchFrom = matchIndex + currentShortcode.length;
								}
								currentSourceIndex = sectionOffset + matchIndex;
								currentShortcode = nextShortcode;
								return nextSource;
							});
							for (const leaf of this.plugin.app.workspace.getLeavesOfType("markdown")) {
								if (
									leaf.view instanceof MarkdownView &&
									leaf.view.file?.path === ctx.sourcePath &&
									leaf.view.getMode() === "preview"
								) {
									leaf.view.previewMode.rerender(true);
								}
							}
						},
					},
				);
				const child = new MarkdownRenderChild(span);
				child.register(cleanup);
				ctx.addChild(child);
				fragment.appendChild(span);

				lastIndex = m.index + m.length;
			}

			if (lastIndex < text.length) {
				fragment.appendChild(ownerDocument.createTextNode(text.slice(lastIndex)));
			}

			parent.replaceChild(fragment, node);
		}
	}
}
