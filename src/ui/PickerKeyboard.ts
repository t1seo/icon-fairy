import { CSS_PREFIX } from "../constants";

export type GridDirection = "up" | "down" | "left" | "right";

interface PickerGrid {
	readonly contentEl: HTMLElement;
	readonly tabContentEl: HTMLElement;
}

export function navigatePickerGrid(
	picker: PickerGrid,
	event: KeyboardEvent,
	direction: GridDirection,
): void {
	const active = picker.contentEl.doc.activeElement;
	const items = Array.from(
		picker.tabContentEl.querySelectorAll<HTMLElement>(`.${CSS_PREFIX}-custom-item-btn`),
	);
	const index = items.findIndex((item) => item === active);
	if (index < 0) return;
	event.preventDefault();
	const firstRow = items[0].parentElement?.offsetTop;
	const nextRow = items.findIndex((item) => item.parentElement?.offsetTop !== firstRow);
	const columns = nextRow > 0 ? nextRow : items.length;
	const offsets: Readonly<Record<GridDirection, number>> = {
		left: -1,
		right: 1,
		up: -columns,
		down: columns,
	};
	const target = Math.max(0, Math.min(items.length - 1, index + offsets[direction]));
	if (target === index) return;
	items[target].focus();
	items[target].scrollIntoView({ block: "nearest" });
}

export function activatePickerIcon(picker: PickerGrid, event: KeyboardEvent): void {
	const active = picker.contentEl.doc.activeElement;
	const items = picker.tabContentEl.querySelectorAll<HTMLElement>(`.${CSS_PREFIX}-custom-item-btn`);
	items.forEach((item) => {
		if (item !== active) return;
		event.preventDefault();
		item.click();
	});
}
