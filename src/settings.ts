import { type App, PluginSettingTab, Setting, type SettingDefinitionItem } from "obsidian";
import { DEFAULT_SETTINGS } from "./constants";
import type IconFairyPlugin from "./main";

type InlineSetting = {
	readonly name: string;
	readonly desc: string;
	readonly render: (setting: Setting) => void;
};

export class IconFairySettingTab extends PluginSettingTab {
	private readonly renderedDescriptions = new Map<Setting, () => string>();

	constructor(
		app: App,
		private plugin: IconFairyPlugin,
	) {
		super(app, plugin);
	}

	getSettingDefinitions(): SettingDefinitionItem[] {
		return this.getInlineSettings();
	}

	display(): void {
		const { containerEl } = this;
		this.renderedDescriptions.clear();
		containerEl.empty();
		new Setting(containerEl).setName("Inline icons").setHeading();
		for (const definition of this.getInlineSettings()) {
			definition.render(new Setting(containerEl).setName(definition.name).setDesc(definition.desc));
		}
	}

	private getInlineSettings(): InlineSetting[] {
		const enableDescription = () =>
			`Allow :${this.plugin.settings.inlineIconPrefix}-name: shortcodes in note content.`;
		const prefixDescription = () =>
			`Syntax: :${this.plugin.settings.inlineIconPrefix}-icon-name:. Use letters, numbers, or hyphens.`;
		return [
			{
				name: "Enable inline icons",
				get desc() {
					return enableDescription();
				},
				render: (setting) => {
					this.renderedDescriptions.set(setting, enableDescription);
					setting.setDesc(enableDescription());
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
				get desc() {
					return prefixDescription();
				},
				render: (setting) => {
					this.renderedDescriptions.set(setting, prefixDescription);
					setting.setDesc(prefixDescription());
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
							this.updateDescriptions();
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

	private updateDescriptions(): void {
		for (const [setting, describe] of this.renderedDescriptions) {
			if (setting.settingEl.isConnected) {
				setting.setDesc(describe());
			} else {
				this.renderedDescriptions.delete(setting);
			}
		}
	}
}
