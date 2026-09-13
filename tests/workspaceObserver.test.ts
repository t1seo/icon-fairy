import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ExplorerObserver } from "../src/features/explorer/ExplorerObserver";
import { installWorkspaceDom, secondaryDocument } from "./helpers/workspaceDom";

function ownerClock(win: Window) {
	let next = 0;
	const timers = new Map<number, () => void>();
	const frames = new Map<number, FrameRequestCallback>();
	vi.spyOn(win, "setTimeout").mockImplementation((handler) => {
		if (typeof handler !== "function") throw new Error("Unexpected timer string");
		const id = ++next;
		timers.set(id, () => handler());
		return id;
	});
	vi.spyOn(win, "clearTimeout").mockImplementation((id) => {
		if (id !== undefined) timers.delete(id);
	});
	vi.spyOn(win, "requestAnimationFrame").mockImplementation((callback) => {
		const id = ++next;
		frames.set(id, callback);
		return id;
	});
	vi.spyOn(win, "cancelAnimationFrame").mockImplementation((id) => {
		frames.delete(id);
	});
	return {
		timers,
		frames,
		fireTimers() {
			for (const callback of timers.values()) callback();
			timers.clear();
		},
		fireFrames() {
			for (const callback of frames.values()) callback(0);
			frames.clear();
		},
	};
}

beforeEach(() => installWorkspaceDom(document));
afterEach(() => {
	vi.restoreAllMocks();
	document.body.replaceChildren();
});

describe("explorer observer ownership", () => {
	it("schedules in the secondary window and cancels its queued frame on stop", async () => {
		const doc = secondaryDocument();
		const win = doc.defaultView;
		if (!win) throw new Error("Fixture window missing");
		const clock = ownerClock(win);
		const update = vi.fn();
		const container = doc.body.createDiv();
		const observer = new ExplorerObserver(container, update);
		container.appendChild(doc.createTextNode("new row"));
		await Promise.resolve();
		expect(clock.timers.size).toBe(1);
		clock.fireTimers();
		expect(clock.frames.size).toBe(1);
		observer.stop();
		expect(clock.frames.size).toBe(0);
		clock.fireFrames();
		expect(update).not.toHaveBeenCalled();
	});
	it("ignores its own icons even when constructors belong to another window", async () => {
		const doc = secondaryDocument();
		const win = doc.defaultView;
		if (!win) throw new Error("Fixture window missing");
		const clock = ownerClock(win);
		const container = doc.body.createDiv();
		const observer = new ExplorerObserver(container, vi.fn());
		const icon = container.createSpan({ cls: "custom-icon-explorer-icon" });
		icon.appendChild(doc.createTextNode("own content"));
		await Promise.resolve();
		expect(icon instanceof Element).toBe(false);
		expect(clock.timers.size).toBe(0);
		observer.stop();
	});
	it("does not update a detached explorer when a queued frame fires", async () => {
		const clock = ownerClock(window);
		const update = vi.fn();
		const container = document.body.createDiv();
		const observer = new ExplorerObserver(container, update);
		container.createDiv();
		await Promise.resolve();
		clock.fireTimers();
		container.remove();
		clock.fireFrames();
		expect(update).not.toHaveBeenCalled();
		observer.stop();
	});
	it("cancels the old window's timer when stopped before migration", async () => {
		const clock = ownerClock(window);
		const other = secondaryDocument();
		const container = document.body.createDiv();
		const observer = new ExplorerObserver(container, vi.fn());
		container.createDiv();
		await Promise.resolve();
		expect(clock.timers.size).toBe(1);
		other.body.appendChild(container);
		observer.stop();
		expect(clock.timers.size).toBe(0);
		expect(clock.frames.size).toBe(0);
	});
});
