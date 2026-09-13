import { App, Setting, SettingGroup } from "obsidian";
import { beforeEach, describe, expect, it, vi } from "vitest";
import IconFairyPlugin from "../src/main";
import { IconFairySettingTab } from "../src/settings";
import type { IconFairyData } from "../src/types";

vi.mock("obsidian", () => import("./helpers/settingsObsidian"));

const seed: IconFairyData = {
	settings: { enableInlineIcons: true, inlineIconSize: 24, inlineIconPrefix: "ci" },
	iconMap: { "QA.md": { type: "custom", value: "fairy" } },
	inlineIconAnnotations: {
		"note-qa": { id: "note-qa", markdown: "Keep me", createdAt: 1, updatedAt: 1 },
	},
};

async function fixture() {
	const app = new App();
	const plugin = new IconFairyPlugin(app, {
		id: "icon-fairy",
		name: "Icon Fairy",
		version: "3.0.0",
		minAppVersion: "1.5.7",
		description: "Test",
		author: "Test",
	});
	const saved: string[] = [];
	const updated = new Promise<void>((resolve) => {
		vi.spyOn(app.workspace, "updateOptions").mockImplementation(() => resolve());
	});
	vi.spyOn(plugin, "loadData").mockResolvedValue(structuredClone(seed));
	vi.spyOn(plugin, "saveData").mockImplementation((data: unknown) => {
		saved.push(JSON.stringify(data));
		return Promise.resolve();
	});
	const resize = vi.spyOn(plugin, "updateInlineSizeCSSVar").mockImplementation(() => {});
	await plugin.loadSettings();
	const tab = new IconFairySettingTab(app, plugin);
	return { app, plugin, tab, saved, resize, updated };
}

function input(container: HTMLElement, type: string): HTMLInputElement {
	const element = container.querySelector(`input[type="${type}"]`);
	if (!(element instanceof HTMLInputElement)) throw new Error(`Missing ${type} control`);
	return element;
}

function render(tab: IconFairySettingTab, mode: "legacy" | "searchable"): void {
	if (mode === "legacy") {
		tab.display();
		return;
	}
	tab.containerEl.replaceChildren();
	for (const definition of tab.getSettingDefinitions()) {
		if (!("render" in definition) || !definition.render) {
			throw new Error("Expected a custom settings renderer");
		}
		const setting = new Setting(tab.containerEl).setName(definition.name);
		if (definition.desc) setting.setDesc(definition.desc);
		definition.render(setting, new SettingGroup(tab.containerEl));
	}
}

beforeEach(() => document.body.replaceChildren());

describe.each(["legacy", "searchable"] as const)("%s settings", (mode) => {
	it("preserves the full data envelope when the toggle changes", async () => {
		const { app, plugin, tab, saved, updated } = await fixture();
		render(tab, mode);
		const toggle = input(tab.containerEl, "checkbox");
		toggle.checked = false;
		toggle.dispatchEvent(new Event("change"));
		await updated;
		expect(saved).toEqual([
			JSON.stringify({ ...seed, settings: { ...seed.settings, enableInlineIcons: false } }),
		]);
		expect(app.workspace.updateOptions).toHaveBeenCalledTimes(1);
		const serialized = saved[0];
		if (!serialized) throw new Error("Settings were not persisted");
		const persisted: unknown = JSON.parse(serialized);
		vi.spyOn(plugin, "loadData").mockResolvedValue(persisted);
		await plugin.loadSettings();
		render(tab, mode);
		expect(input(tab.containerEl, "checkbox").checked).toBe(false);
		expect(plugin.iconMap).toEqual(seed.iconMap);
		expect(plugin.inlineAnnotations.toJSON()).toEqual(seed.inlineIconAnnotations);
	});

	it("updates size effects within the original slider limits", async () => {
		const { app, tab, saved, resize, updated } = await fixture();
		render(tab, mode);
		const slider = input(tab.containerEl, "range");
		expect([slider.min, slider.max, slider.step, slider.value]).toEqual(["12", "64", "1", "24"]);
		slider.value = "32";
		slider.dispatchEvent(new Event("input"));
		await updated;
		expect(saved).toEqual([
			JSON.stringify({ ...seed, settings: { ...seed.settings, inlineIconSize: 32 } }),
		]);
		expect(resize).toHaveBeenCalledTimes(1);
		expect(app.workspace.updateOptions).toHaveBeenCalledTimes(1);
	});

	it("waits for change before committing a typed prefix", async () => {
		const { app, tab, saved, updated } = await fixture();
		render(tab, mode);
		const text = input(tab.containerEl, "text");
		text.value = "fairy";
		text.dispatchEvent(new Event("input"));
		await Promise.resolve();
		expect(saved).toEqual([]);
		text.dispatchEvent(new Event("change"));
		await updated;
		expect(saved).toEqual([
			JSON.stringify({ ...seed, settings: { ...seed.settings, inlineIconPrefix: "fairy" } }),
		]);
		expect(app.workspace.updateOptions).toHaveBeenCalledTimes(1);
	});

	it.each([
		["  !!!  ", "ci"],
		["", "ci"],
		["  fairy  ", "fairy"],
		["폴더요정", "ci"],
		["Fai_ry!42-", "Fairy42-"],
	])("normalizes malformed prefix %j to %j without losing data", async (raw, expected) => {
		const { plugin, tab, saved, updated } = await fixture();
		render(tab, mode);
		const text = input(tab.containerEl, "text");
		text.value = raw;
		text.dispatchEvent(new Event("change"));
		if (expected !== "ci") await updated;
		expect(text.value).toBe(expected);
		expect(plugin.settings.inlineIconPrefix).toBe(expected);
		expect(saved).toEqual(
			expected === "ci"
				? []
				: [JSON.stringify({ ...seed, settings: { ...seed.settings, inlineIconPrefix: expected } })],
		);
		expect(plugin.iconMap).toEqual(seed.iconMap);
		expect(plugin.inlineAnnotations.toJSON()).toEqual(seed.inlineIconAnnotations);
	});

	it("keeps one control and one commit listener after repeated renders", async () => {
		const { app, tab, saved, updated } = await fixture();
		for (let iteration = 0; iteration < 3; iteration++) render(tab, mode);
		expect(tab.containerEl.querySelectorAll("input")).toHaveLength(3);
		const text = input(tab.containerEl, "text");
		text.value = "fairy";
		text.dispatchEvent(new Event("change"));
		await updated;
		expect(saved).toHaveLength(1);
		expect(app.workspace.updateOptions).toHaveBeenCalledTimes(1);
	});

	it("persists the default when invalid input replaces a custom prefix", async () => {
		const { plugin, tab, saved, updated } = await fixture();
		plugin.settings.inlineIconPrefix = "fairy";
		render(tab, mode);
		const text = input(tab.containerEl, "text");
		text.value = "  !!!  ";
		text.dispatchEvent(new Event("change"));
		await updated;
		expect(saved).toEqual([JSON.stringify(seed)]);
		expect(text.value).toBe("ci");
	});
});

it("exposes the three searchable names without creating controls or saving data", async () => {
	const { tab, saved } = await fixture();
	const definitions = tab.getSettingDefinitions();
	expect(
		definitions.map((definition) => ("name" in definition ? definition.name : undefined)),
	).toEqual(["Enable inline icons", "Inline icon size", "Inline icon prefix"]);
	expect(
		definitions.every(
			(definition) => "render" in definition && typeof definition.render === "function",
		),
	).toBe(true);
	expect(tab.containerEl.childElementCount).toBe(0);
	expect(saved).toEqual([]);
});
