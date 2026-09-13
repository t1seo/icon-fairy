import { vi } from "vitest";

class Events {
	private handlers = new Map<string, ((...args: unknown[]) => void)[]>();
	on(name: string, callback: (...args: unknown[]) => void) {
		const handlers = this.handlers.get(name) ?? [];
		handlers.push(callback);
		this.handlers.set(name, handlers);
		return { name, callback };
	}
	trigger(name: string, ...args: unknown[]) {
		for (const handler of this.handlers.get(name) ?? []) handler(...args);
	}
}

class Workspace extends Events {
	containerEl = document.body;
	getLeavesOfType = vi.fn(() => []);
	getActiveFile = vi.fn();
	getActiveViewOfType = vi.fn();
	iterateAllLeaves = vi.fn();
	onLayoutReady(callback: () => void) {
		callback();
	}
}
class App {
	workspace = new Workspace();
	vault = new Events();
}
class Plugin {
	registerEvent = vi.fn();
	register = vi.fn();
	loadData = vi.fn(() => Promise.resolve(null));
	saveData = vi.fn(() => Promise.resolve());
	addSettingTab = vi.fn();
	registerEditorSuggest = vi.fn();
	addCommand = vi.fn();
	constructor(
		readonly app: App,
		readonly manifest: object,
	) {}
}
class WorkspaceLeaf {}
class TFile {
	path = "";
}
class MarkdownView {
	containerEl = document.createElement("div");
	file = new TFile();
}
export const workspaceObsidianMock = { App, Plugin, WorkspaceLeaf, TFile, MarkdownView };
