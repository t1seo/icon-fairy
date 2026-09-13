import { App, MarkdownView, TFile, WorkspaceLeaf } from "obsidian";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ExplorerIcons } from "../src/features/ExplorerIcons";
import { TabIcons } from "../src/features/TabIcons";
import { TitleIcons } from "../src/features/TitleIcons";
import IconFairyPlugin from "../src/main";
import { IconLibraryService } from "../src/services/IconLibraryService";
import { installWorkspaceDom, secondaryDocument } from "./helpers/workspaceDom";

vi.mock("obsidian", async () => (await import("./helpers/workspaceHarness")).workspaceObsidianMock);
vi.mock("../src/features/InlineIcons", () => ({
	InlineIcons: class {
		enable() {}
	},
}));
vi.mock("../src/features/InlineIconSuggest", () => ({ InlineIconSuggest: class {} }));
vi.mock("../src/features/ContextMenu", () => ({
	ContextMenu: class {
		enable() {}
	},
}));
vi.mock("../src/settings", () => ({ IconFairySettingTab: class {} }));
vi.mock("../src/ui/IconPickerModal", () => ({ IconPickerModal: class {} }));
vi.mock("../src/services/IconLibraryService", () => ({
	IconLibraryService: class {
		getIconUrl(id: string) {
			return `https://icons.invalid/${id}.png`;
		}
		load() {
			return Promise.resolve();
		}
	},
}));

function fixture() {
	const app = new App();
	const plugin = new IconFairyPlugin(app, {
		id: "icon-fairy",
		name: "Icon Fairy",
		version: "3.0.0",
		minAppVersion: "1.5.7",
		author: "Test",
		description: "Test",
		dir: "test",
	});
	plugin.iconMap = {
		"QA.md": { type: "custom", value: "fairy" },
		Folder: { type: "custom", value: "fairy" },
	};
	plugin.settings = { enableInlineIcons: true, inlineIconSize: 24, inlineIconPrefix: "ci" };
	plugin.iconLibrary = new IconLibraryService(app.vault.adapter, "test");
	vi.spyOn(plugin, "saveSettings").mockResolvedValue();
	return { app, plugin };
}

function explorer(doc: Document) {
	const leaf = new WorkspaceLeaf();
	leaf.view = new MarkdownView(leaf);
	leaf.view.containerEl = doc.createElement("div");
	leaf.view.containerEl.innerHTML = `<div class="nav-files-container"><div class="nav-file-title" data-path="QA.md"><span class="tree-item-icon"></span></div><div class="nav-folder-title" data-path="Folder"><span class="tree-item-icon nav-folder-collapse-indicator"></span></div></div>`;
	doc.body.appendChild(leaf.view.containerEl);
	return leaf;
}
function note(doc: Document) {
	const leaf = new WorkspaceLeaf();
	const view = new MarkdownView(leaf);
	view.file = new TFile();
	view.file.path = "QA.md";
	view.containerEl = doc.createElement("div");
	view.containerEl.innerHTML = `<div class="inline-title">QA</div>`;
	doc.body.appendChild(view.containerEl);
	leaf.view = view;
	const tabHeaderEl = doc.createElement("div");
	tabHeaderEl.innerHTML = `<div class="workspace-tab-header-inner-icon"><svg></svg></div>`;
	doc.body.appendChild(tabHeaderEl);
	return Object.assign(leaf, { tabHeaderEl });
}
function leaves(app: App, explorerLeaves: WorkspaceLeaf[], markdownLeaves: WorkspaceLeaf[] = []) {
	vi.mocked(app.workspace.getLeavesOfType).mockImplementation((type) =>
		type === "file-explorer" ? explorerLeaves : markdownLeaves,
	);
	vi.mocked(app.workspace.iterateAllLeaves).mockImplementation((callback) => {
		for (const leaf of [...explorerLeaves, ...markdownLeaves]) callback(leaf);
	});
}

beforeEach(() => {
	installWorkspaceDom(document);
	vi.useFakeTimers();
	vi.stubGlobal("CSS", { escape: (path: string) => path });
});
afterEach(() => {
	vi.useRealTimers();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
	document.body.replaceChildren();
});

describe("workspace icons", () => {
	it("preserves the folder chevron and restores the file glyph when disabled", () => {
		const { app, plugin } = fixture();
		const leaf = explorer(document);
		leaves(app, [leaf]);
		const feature = new ExplorerIcons(plugin);
		feature.enable();
		expect(document.querySelector(".nav-folder-collapse-indicator.custom-icon-hidden")).toBeNull();
		expect(document.querySelector(".nav-file-title .custom-icon-hidden")).not.toBeNull();
		feature.disable();
		expect(document.querySelector(".custom-icon-explorer-icon")).toBeNull();
		expect(document.querySelector(".custom-icon-hidden")).toBeNull();
	});
	it("renders every explorer in its owning document", () => {
		const { app, plugin } = fixture();
		const other = secondaryDocument();
		leaves(app, [explorer(document), explorer(other)]);
		const feature = new ExplorerIcons(plugin);
		feature.enable();
		expect(document.querySelectorAll(".custom-icon-explorer-icon")).toHaveLength(2);
		expect(other.querySelectorAll(".custom-icon-explorer-icon")).toHaveLength(2);
		feature.disable();
		expect(other.querySelector(".custom-icon-explorer-icon")).toBeNull();
	});
	it("cancels pending animation work before disable can reinsert icons", async () => {
		const { app, plugin } = fixture();
		const leaf = explorer(document);
		leaves(app, [leaf]);
		const feature = new ExplorerIcons(plugin);
		feature.enable();
		leaf.view.containerEl
			.querySelector(".nav-files-container")
			?.appendChild(document.createTextNode("update"));
		await Promise.resolve();
		vi.advanceTimersByTime(50);
		feature.disable();
		vi.runAllTimers();
		expect(document.querySelector(".custom-icon-explorer-icon")).toBeNull();
	});
	it("reconciles replacement explorers and cancels detached-container work", async () => {
		const { app, plugin } = fixture();
		const oldLeaf = explorer(document);
		const current = [oldLeaf];
		leaves(app, current);
		const feature = new ExplorerIcons(plugin);
		feature.enable();
		oldLeaf.view.containerEl.querySelector(".nav-files-container")?.append("new row");
		await Promise.resolve();
		vi.advanceTimersByTime(50);
		oldLeaf.view.containerEl.remove();
		const replacement = explorer(document);
		current.splice(0, 1, replacement);
		app.workspace.trigger("layout-change");
		vi.runAllTimers();
		expect(oldLeaf.view.containerEl.querySelector(".custom-icon-explorer-icon")).toBeNull();
		expect(
			replacement.view.containerEl.querySelectorAll(".custom-icon-explorer-icon"),
		).toHaveLength(2);
		feature.disable();
	});
	it("keeps assignments through rename and restores the glyph after deletion", () => {
		const { app, plugin } = fixture();
		const leaf = explorer(document);
		leaves(app, [leaf]);
		const feature = new ExplorerIcons(plugin);
		feature.enable();
		const row = leaf.view.containerEl.querySelector<HTMLElement>(".nav-file-title");
		if (!row) throw new Error("Fixture file row missing");
		row.dataset.path = "Renamed.md";
		const file = Object.assign(new TFile(), { path: "Renamed.md" });
		app.vault.trigger("rename", file, "QA.md");
		expect(plugin.iconMap["Renamed.md"]).toEqual({ type: "custom", value: "fairy" });
		expect(plugin.iconMap["QA.md"]).toBeUndefined();
		expect(row.querySelectorAll(".custom-icon-explorer-icon")).toHaveLength(1);
		app.vault.trigger("delete", file);
		expect(plugin.iconMap["Renamed.md"]).toBeUndefined();
		expect(row.querySelector(".custom-icon-hidden")).toBeNull();
		expect(row.querySelector(".custom-icon-explorer-icon")).toBeNull();
		feature.disable();
		app.workspace.trigger("layout-change");
		expect(document.querySelector(".custom-icon-explorer-icon")).toBeNull();
	});
	it("cleans tab host state in a second window when an assignment is removed", () => {
		const { app, plugin } = fixture();
		const other = secondaryDocument();
		const leaf = note(other);
		leaves(app, [], [leaf]);
		const feature = new TabIcons(plugin);
		feature.enable();
		expect(other.querySelector(".custom-icon-has-tab-icon")).not.toBeNull();
		plugin.iconMap = {};
		feature.refresh();
		expect(other.querySelector(".custom-icon-has-tab-icon")).toBeNull();
		expect(other.querySelector(".custom-icon-hidden")).toBeNull();
	});
	it("puts the active note title in its own window", () => {
		const { app, plugin } = fixture();
		note(document);
		const other = secondaryDocument();
		const leaf = note(other);
		leaves(app, [], [leaf]);
		vi.mocked(app.workspace.getActiveFile).mockReturnValue(
			Object.assign(new TFile(), { path: "QA.md" }),
		);
		vi.mocked(app.workspace.getActiveViewOfType).mockReturnValue(leaf.view);
		const feature = new TitleIcons(plugin);
		feature.enable();
		expect(other.querySelector(".custom-icon-title-icon")).not.toBeNull();
		expect(document.querySelector(".custom-icon-title-icon")).toBeNull();
		feature.disable();
		expect(other.querySelector(".custom-icon-title-icon")).toBeNull();
	});
	it("syncs inline size to all Markdown documents and removes it on unload", () => {
		const { app, plugin } = fixture();
		const other = secondaryDocument();
		leaves(app, [], [note(document), note(other)]);
		plugin.updateInlineSizeCSSVar();
		expect(other.body.style.getPropertyValue("--custom-icon-inline-size")).toBe("24px");
		plugin.onunload();
		expect(document.body.style.getPropertyValue("--custom-icon-inline-size")).toBe("");
		expect(other.body.style.getPropertyValue("--custom-icon-inline-size")).toBe("");
	});
	it("initializes new windows and clears a closed window's inline size", async () => {
		const { app, plugin } = fixture();
		leaves(app, []);
		await plugin.onload();
		plugin.settings.inlineIconSize = 32;
		const other = secondaryDocument();
		const win = other.defaultView;
		if (!win) throw new Error("Fixture window missing");
		app.workspace.trigger("window-open", undefined, win);
		expect(other.body.style.getPropertyValue("--custom-icon-inline-size")).toBe("32px");
		app.workspace.trigger("window-close", undefined, win);
		expect(other.body.style.getPropertyValue("--custom-icon-inline-size")).toBe("");
		plugin.updateInlineSizeCSSVar();
		expect(other.body.style.getPropertyValue("--custom-icon-inline-size")).toBe("");
		plugin.onunload();
	});
});
