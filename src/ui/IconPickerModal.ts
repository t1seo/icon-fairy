import { type App, Modal, setIcon } from "obsidian";
import { CSS_PREFIX } from "../constants";
import type { IconData, IconSelectCallback, PickerTab } from "../types";
import { CustomTab } from "./CustomTab";
import { type GridDirection, activatePickerIcon, navigatePickerGrid } from "./PickerKeyboard";
import { UploadTab } from "./UploadTab";

/** Tab definition for the picker */
interface TabDef {
	readonly key: PickerTab;
	readonly label: string;
}

const TABS: readonly TabDef[] = [
	{ key: "custom", label: "Library" },
	{ key: "upload", label: "Upload" },
];

type PickerPlugin = ConstructorParameters<typeof CustomTab>[0] &
	ConstructorParameters<typeof UploadTab>[0];

/**
 * Main icon picker modal with 2 tabs: Custom | Upload
 */
export class IconPickerModal extends Modal {
	private static activeModal: IconPickerModal | null = null;
	private activeTab: PickerTab = "custom";
	private tabContentEl!: HTMLElement;
	private searchEl!: HTMLInputElement;
	private searchBarEl!: HTMLElement;
	private randomButtonEl: HTMLButtonElement | null = null;
	private tabButtons = new Map<PickerTab, HTMLButtonElement>();
	private onSelect: IconSelectCallback;
	private currentPath: string;
	private cancelInitialFocus: (() => void) | null = null;

	/** Tab renderers registered by each tab module */
	private tabRenderers = new Map<PickerTab, TabRenderer>();

	constructor(
		app: App,
		private readonly plugin: PickerPlugin,
		path: string,
		onSelect: IconSelectCallback,
	) {
		super(app);
		this.currentPath = path;
		this.onSelect = onSelect;
	}

	onOpen() {
		const previousModal = IconPickerModal.activeModal;
		IconPickerModal.activeModal = this;
		if (previousModal && previousModal !== this) previousModal.close();

		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass(`${CSS_PREFIX}-picker`);
		this.modalEl.addClass(`${CSS_PREFIX}-modal`);
		this.setTitle("Choose an icon");

		// Register tabs
		this.registerTab("custom", new CustomTab(this.plugin, this));
		this.registerTab("upload", new UploadTab(this.plugin, this));

		this.buildHeader(contentEl);
		this.buildSearchBar(contentEl);
		this.buildTabContent(contentEl);

		this.switchTab(this.activeTab);

		this.cancelInitialFocus?.();
		const ownerWindow = contentEl.win;
		const focusTimeout = ownerWindow.setTimeout(() => {
			this.cancelInitialFocus = null;
			if (this.activeTab === "custom" && this.searchEl.isConnected) this.searchEl.focus();
		}, 0);
		this.cancelInitialFocus = () => ownerWindow.clearTimeout(focusTimeout);

		// Keyboard navigation
		this.scope.register([], "ArrowDown", (e) => this.navigateGrid(e, "down"));
		this.scope.register([], "ArrowUp", (e) => this.navigateGrid(e, "up"));
		this.scope.register([], "ArrowLeft", (e) => this.navigateGrid(e, "left"));
		this.scope.register([], "ArrowRight", (e) => this.navigateGrid(e, "right"));
		this.scope.register([], "Enter", (e) => this.activateFocused(e));
	}

	close(): void {
		for (const renderer of this.tabRenderers.values()) renderer.cancelEditing?.();
		super.close();
	}

	onClose() {
		this.cancelInitialFocus?.();
		this.cancelInitialFocus = null;
		if (IconPickerModal.activeModal === this) IconPickerModal.activeModal = null;
		for (const renderer of this.tabRenderers.values()) {
			renderer.destroy?.();
		}
		this.tabRenderers.clear();
		this.tabButtons.clear();
		this.contentEl.empty();
	}

	registerTab(tab: PickerTab, renderer: TabRenderer) {
		this.tabRenderers.set(tab, renderer);
	}

	getSearchQuery(): string {
		return this.searchEl?.value ?? "";
	}

	getTargetPath(): string {
		return this.currentPath;
	}

	setRandomEnabled(enabled: boolean): void {
		if (this.randomButtonEl) this.randomButtonEl.disabled = !enabled;
	}

	selectIcon(icon: IconData) {
		this.onSelect(icon);
		this.close();
	}

	removeIcon() {
		this.onSelect(null);
		this.close();
	}

	// ─── Private builders ───────────────────────────────

	private buildHeader(parent: HTMLElement) {
		const header = parent.createDiv({ cls: `${CSS_PREFIX}-picker-header` });
		header.createEl("p", {
			cls: `${CSS_PREFIX}-picker-description`,
			text: this.currentPath
				? `For ${this.currentPath.split("/").pop() ?? this.currentPath}`
				: "Insert into note",
		});

		const tabs = header.createDiv({
			cls: `${CSS_PREFIX}-picker-tabs`,
			attr: { role: "tablist", "aria-label": "Icon source" },
		});
		for (const { key, label } of TABS) {
			const btn = tabs.createEl("button", {
				text: label,
				cls: `${CSS_PREFIX}-tab-btn`,
				attr: {
					id: `${CSS_PREFIX}-tab-${key}`,
					role: "tab",
					"aria-controls": `${CSS_PREFIX}-tabpanel`,
					"aria-selected": String(key === this.activeTab),
					tabindex: key === this.activeTab ? "0" : "-1",
				},
			});
			if (key === this.activeTab) btn.addClass("is-active");
			this.tabButtons.set(key, btn);
			btn.addEventListener("click", () => this.switchTab(key));
			btn.addEventListener("keydown", (event) => this.navigateTabs(event, key));
		}
	}

	private buildSearchBar(parent: HTMLElement) {
		const bar = parent.createDiv({ cls: `${CSS_PREFIX}-picker-search` });
		this.searchBarEl = bar;
		const field = bar.createDiv({ cls: `${CSS_PREFIX}-search-field` });
		const searchIcon = field.createSpan({ cls: `${CSS_PREFIX}-search-icon` });
		setIcon(searchIcon, "search");
		searchIcon.setAttribute("aria-hidden", "true");

		this.searchEl = field.createEl("input", {
			cls: `${CSS_PREFIX}-search-input`,
			attr: {
				type: "search",
				placeholder: "Search icons",
				"aria-label": "Search icons",
			},
		});
		this.searchEl.addEventListener("input", () => {
			const renderer = this.tabRenderers.get(this.activeTab);
			renderer?.onSearch?.(this.searchEl.value);
		});

		const randomBtn = bar.createEl("button", {
			cls: `${CSS_PREFIX}-random-btn`,
			attr: {
				type: "button",
				"aria-label": "Choose a random icon",
				title: "Choose a random icon",
			},
		});
		this.randomButtonEl = randomBtn;
		setIcon(randomBtn, "shuffle");
		randomBtn.createSpan({ text: "Random" });
		randomBtn.addEventListener("click", () => {
			const renderer = this.tabRenderers.get(this.activeTab);
			renderer?.onRandom?.();
		});
	}

	private buildTabContent(parent: HTMLElement) {
		this.tabContentEl = parent.createDiv({
			cls: `${CSS_PREFIX}-picker-content`,
			attr: {
				id: `${CSS_PREFIX}-tabpanel`,
				role: "tabpanel",
				"aria-labelledby": `${CSS_PREFIX}-tab-${this.activeTab}`,
			},
		});
	}

	private navigateGrid(event: KeyboardEvent, direction: GridDirection): void {
		navigatePickerGrid(
			{ contentEl: this.contentEl, tabContentEl: this.tabContentEl },
			event,
			direction,
		);
	}

	private activateFocused(event: KeyboardEvent): void {
		activatePickerIcon({ contentEl: this.contentEl, tabContentEl: this.tabContentEl }, event);
	}

	private navigateTabs(event: KeyboardEvent, currentTab: PickerTab) {
		if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
		event.preventDefault();
		event.stopPropagation();
		const currentIndex = TABS.findIndex(({ key }) => key === currentTab);
		let nextIndex = currentIndex;
		if (event.key === "Home") nextIndex = 0;
		if (event.key === "End") nextIndex = TABS.length - 1;
		if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + TABS.length) % TABS.length;
		if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % TABS.length;
		const nextTab = TABS[nextIndex].key;
		this.switchTab(nextTab);
		this.tabButtons.get(nextTab)?.focus();
	}

	private switchTab(tab: PickerTab) {
		this.activeTab = tab;

		// Update tab button active states
		for (const { key } of TABS) {
			const button = this.tabButtons.get(key);
			if (!button) continue;
			const isActive = key === tab;
			button.toggleClass("is-active", isActive);
			button.setAttribute("aria-selected", String(isActive));
			button.tabIndex = isActive ? 0 : -1;
		}

		// Show/hide search bar (hide for Upload tab)
		this.searchBarEl.classList.toggle(`${CSS_PREFIX}-hidden`, tab === "upload");

		// Destroy previous tab renderers (cleanup timers)
		for (const [key, r] of this.tabRenderers) {
			if (key !== tab) r.destroy?.();
		}

		// Clear and re-render tab content
		this.tabContentEl.empty();
		this.tabContentEl.setAttribute("aria-labelledby", `${CSS_PREFIX}-tab-${tab}`);
		this.searchEl.value = "";

		const renderer = this.tabRenderers.get(tab);
		if (renderer) {
			renderer.render(this.tabContentEl);
		}
	}
}

/** Interface that each tab module implements */
export interface TabRenderer {
	render(container: HTMLElement): void;
	onSearch?(query: string): void;
	onRandom?(): void;
	cancelEditing?(): void;
	destroy?(): void;
}
