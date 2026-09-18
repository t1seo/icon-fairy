import { App, type Command } from "obsidian";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ContextMenu } from "../src/features/ContextMenu";
import IconFairyPlugin from "../src/main";

class MenuItem {
	title = "";
	icon = "";
	activate: () => void = () => {};
	setTitle(value: string) {
		this.title = value;
		return this;
	}
	setIcon(value: string) {
		this.icon = value;
		return this;
	}
	onClick(callback: () => void) {
		this.activate = callback;
		return this;
	}
}

class Menu {
	readonly items: MenuItem[] = [];
	addItem(callback: (item: MenuItem) => void) {
		const item = new MenuItem();
		callback(item);
		this.items.push(item);
	}
}

const registered = vi.hoisted(() => {
	const state: {
		fileMenu: ((menu: Menu, file: { readonly path: string }) => void) | null;
		commands: Command[];
	} = { fileMenu: null, commands: [] };
	return state;
});

vi.mock("obsidian", async () => {
	const existing = await import("./helpers/settingsObsidian");
	return {
		...existing,
		App: class {
			workspace = {
				on: (_event: string, callback: NonNullable<typeof registered.fileMenu>) => {
					registered.fileMenu = callback;
				},
				getActiveFile: vi.fn(() => ({ path: "QA.md" })),
			};
		},
		Plugin: class extends existing.Plugin {
			registerEvent = vi.fn();
			addCommand(command: Command) {
				registered.commands.push(command);
			}
		},
	};
});

vi.mock("../src/ui/IconPickerModal", () => ({ IconPickerModal: class {} }));

function fixture(assigned = true) {
	const app = new App();
	const plugin = new IconFairyPlugin(app, {
		id: "icon-fairy",
		name: "Icon Fairy",
		version: "3.0.0",
		minAppVersion: "1.5.7",
		description: "Test",
		author: "Test",
	});
	plugin.iconMap = assigned ? { "QA.md": { type: "custom", value: "fairy" } } : {};
	const remove = vi.spyOn(plugin, "removeIcon").mockImplementation(() => {});
	new ContextMenu(plugin).enable();
	return { app, remove };
}

beforeEach(() => {
	registered.fileMenu = null;
	registered.commands = [];
});

describe("assigned icon actions", () => {
	it("labels file unassignment separately from deleting a library icon", () => {
		// Given a file with an assigned icon.
		const { remove } = fixture();
		const menu = new Menu();
		// When its context menu opens.
		registered.fileMenu?.(menu, { path: "QA.md" });
		// Then the explicit removal item targets that file's assignment.
		expect(menu.items.map((item) => item.title)).toEqual(["Change icon…", "Remove assigned icon"]);
		menu.items.find((item) => item.title === "Remove assigned icon")?.activate();
		expect(remove).toHaveBeenCalledExactlyOnceWith("QA.md");
	});

	it("omits removal when a file has no assigned icon", () => {
		// Given a file without an assigned icon.
		fixture(false);
		const menu = new Menu();
		// When its context menu opens.
		registered.fileMenu?.(menu, { path: "QA.md" });
		// Then only changing the icon is offered.
		expect(menu.items.map((item) => item.title)).toEqual(["Change icon…"]);
	});

	it("keeps command identifiers and removes only on execution", () => {
		// Given the existing file commands.
		const { remove } = fixture();
		const command = registered.commands.find((item) => item.id === "remove-icon");
		expect(registered.commands.map((item) => item.id)).toEqual(["change-icon", "remove-icon"]);
		expect(command?.name).toBe("Remove assigned icon from current file");
		expect(command?.checkCallback?.(true)).toBe(true);
		expect(remove).not.toHaveBeenCalled();
		// When the removal command is executed.
		command?.checkCallback?.(false);
		// Then it removes only the active file assignment.
		expect(remove).toHaveBeenCalledExactlyOnceWith("QA.md");
	});

	it("disables removal when no assignment exists", () => {
		// Given a file without an assignment.
		const { remove } = fixture(false);
		const command = registered.commands.find((item) => item.id === "remove-icon");
		// When command availability is checked and execution attempted.
		expect(command?.checkCallback?.(true)).toBe(false);
		expect(command?.checkCallback?.(false)).toBe(false);
		// Then no removal occurs.
		expect(remove).not.toHaveBeenCalled();
	});

	it("disables both file commands when no file is active", () => {
		// Given an empty workspace.
		const { app, remove } = fixture();
		vi.spyOn(app.workspace, "getActiveFile").mockReturnValue(null);
		// When command availability is checked.
		const availability = registered.commands.map((command) => command.checkCallback?.(true));
		// Then neither command is available or changes an assignment.
		expect(availability).toEqual([false, false]);
		expect(remove).not.toHaveBeenCalled();
	});
});
