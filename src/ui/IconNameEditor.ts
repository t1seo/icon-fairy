import { CSS_PREFIX } from "../constants";

export class IconNameEditor {
	private cancelEdit: (() => void) | null = null;

	constructor(
		private readonly label: HTMLElement,
		private readonly name: string,
		private readonly onCommit: (name: string) => void,
		private readonly restoreFocus: () => void,
	) {}

	start(): void {
		this.cancel();
		this.label.empty();
		this.label.removeAttribute("title");
		const input = this.label.createEl("input", {
			cls: `${CSS_PREFIX}-rename-input`,
			attr: { type: "text", "aria-label": `Rename ${this.name}` },
		});
		input.value = this.name;
		let finished = false;
		const finish = (commit: boolean, focus: boolean) => {
			if (finished) return;
			finished = true;
			input.removeEventListener("blur", onBlur);
			this.cancelEdit = null;
			const name = input.value.trim();
			this.label.textContent = this.name;
			this.label.setAttribute("title", "Double-click to rename");
			if (commit && name && name !== this.name) {
				this.onCommit(name);
			} else if (focus) {
				this.restoreFocus();
			}
		};
		const onBlur = () => finish(true, false);
		this.cancelEdit = () => finish(false, false);
		input.addEventListener("blur", onBlur, { once: true });
		input.addEventListener("keydown", (event) => {
			if (event.key !== "Enter" && event.key !== "Escape") return;
			event.preventDefault();
			event.stopPropagation();
			finish(event.key === "Enter", true);
		});
		input.focus();
		input.select();
	}

	cancel(): void {
		this.cancelEdit?.();
	}
}
