import { CSS_PREFIX } from "../../constants";

/** Owns pending work for one explorer, including the window that scheduled it. */
export class ExplorerObserver {
	readonly win: Window;
	private readonly observer: MutationObserver;
	private timeout: number | null = null;
	private frame: number | null = null;
	private stopped = false;

	constructor(
		private readonly container: HTMLElement,
		private readonly update: () => void,
	) {
		this.win = container.win;
		this.observer = new MutationObserver((mutations) => {
			const addedContent = mutations.some((mutation) =>
				Array.from(mutation.addedNodes).some((node) => {
					if (node.instanceOf(Element) && node.closest(`.${CSS_PREFIX}-explorer-icon`)) {
						return false;
					}
					return !node.parentElement?.closest(`.${CSS_PREFIX}-explorer-icon`);
				}),
			);
			if (addedContent) this.schedule();
		});
		this.observer.observe(container, { childList: true, subtree: true });
	}

	stop() {
		this.stopped = true;
		this.observer.disconnect();
		this.cancelPending();
	}

	private cancelPending() {
		if (this.timeout !== null) this.win.clearTimeout(this.timeout);
		if (this.frame !== null) this.win.cancelAnimationFrame(this.frame);
		this.timeout = null;
		this.frame = null;
	}

	private schedule() {
		this.cancelPending();
		this.timeout = this.win.setTimeout(() => {
			this.timeout = null;
			this.frame = this.win.requestAnimationFrame(() => {
				this.frame = null;
				if (this.stopped || !this.container.isConnected || this.container.win !== this.win) {
					return;
				}
				this.update();
			});
		}, 50);
	}
}
