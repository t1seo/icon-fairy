import { type App, PluginSettingTab, Setting, type SettingDefinitionItem } from "obsidian";
import { DEFAULT_SETTINGS } from "./constants";
import type IconStudioPlugin from "./main";

type InlineSetting = {
	readonly name: string;
	readonly desc: string;
	readonly render: (setting: Setting) => void;
};

export class IconStudioSettingTab extends PluginSettingTab {
	constructor(
		app: App,
		private plugin: IconStudioPlugin,
	) {
		super(app, plugin);
	}

	getSettingDefinitions(): SettingDefinitionItem[] {
		return this.getInlineSettings();
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		new Setting(containerEl).setName("Inline icons").setHeading();
		for (const definition of this.getInlineSettings()) {
			definition.render(new Setting(containerEl).setName(definition.name).setDesc(definition.desc));
		}
	}

	private getInlineSettings(): InlineSetting[] {
		return [
			{
				name: "Enable inline icons",
				desc: `Allow :${this.plugin.settings.inlineIconPrefix}-name: shortcodes in note content.`,
				render: (setting) => {
					setting.addToggle((toggle) =>
						toggle.setValue(this.plugin.settings.enableInlineIcons).onChange(async (value) => {
							this.plugin.settings.enableInlineIcons = value;
							await this.plugin.saveSettings();
							this.plugin.app.workspace.updateOptions();
						}),
					);
				},
			},
			{
				name: "Inline icon size",
				desc: "Choose a size from 12 to 64 px. Changes are saved automatically.",
				render: (setting) => {
					setting.addSlider((slider) =>
						slider
							.setLimits(12, 64, 1)
							.setValue(this.plugin.settings.inlineIconSize)
							.onChange(async (value) => {
								this.plugin.settings.inlineIconSize = value;
								this.plugin.updateInlineSizeCSSVar();
								await this.plugin.saveSettings();
								this.plugin.app.workspace.updateOptions();
							}),
					);
				},
			},
			{
				name: "Inline icon prefix",
				desc: "Syntax: :ci-icon-name:. Use letters, numbers, or hyphens.",
				render: (setting) => {
					setting.addText((text) => {
						text.setPlaceholder(DEFAULT_SETTINGS.inlineIconPrefix);
						text.setValue(this.plugin.settings.inlineIconPrefix);
						text.inputEl.setAttribute("aria-label", "Inline icon prefix");
						text.inputEl.addEventListener("change", () => {
							const trimmed = text
								.getValue()
								.trim()
								.replace(/[^a-zA-Z0-9-]/g, "");
							const value = trimmed || DEFAULT_SETTINGS.inlineIconPrefix;
							text.setValue(value);
							if (value === this.plugin.settings.inlineIconPrefix) return;
							this.plugin.settings.inlineIconPrefix = value;
							void (async () => {
								await this.plugin.saveSettings();
								this.plugin.app.workspace.updateOptions();
							})();
						});
					});
				},
			},
		];
	}
}
