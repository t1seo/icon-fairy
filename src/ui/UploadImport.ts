import { ICONS_DIR } from "../constants";
import { isSvgFile, processImage, processSvg } from "../services/ImageProcessor";
import type { CustomIcon, IconData } from "../types";
import type { BatchEntry, ProcessedFile, UploadPlugin } from "./UploadTypes";

class UploadDirectoryError extends Error {
	readonly name = "UploadDirectoryError";
	constructor() {
		super("The plugin directory is unavailable.");
	}
}

async function prepareIconsDirectory(plugin: UploadPlugin): Promise<string> {
	const pluginDir = plugin.manifest.dir;
	if (!pluginDir) throw new UploadDirectoryError();
	const iconsDir = `${pluginDir}/${ICONS_DIR}`;
	const adapter = plugin.app.vault.adapter;
	if (!(await adapter.exists(iconsDir))) await adapter.mkdir(iconsDir);
	return iconsDir;
}

export async function processUpload(file: File): Promise<ProcessedFile> {
	const isSvg = isSvgFile(file);
	const result = isSvg ? await processSvg(file) : await processImage(file);
	return { data: result.data, dataUrl: result.dataUrl, ext: isSvg ? "svg" : "png" };
}

export async function saveUpload(
	plugin: UploadPlugin,
	processed: ProcessedFile,
	name: string,
	saveToLibrary: boolean,
): Promise<IconData> {
	const id = `custom-${Date.now()}`;
	const iconsDir = await prepareIconsDirectory(plugin);
	await plugin.app.vault.adapter.writeBinary(`${iconsDir}/${id}.${processed.ext}`, processed.data);
	if (saveToLibrary) {
		await plugin.iconLibrary.add({
			id,
			name,
			path: `${ICONS_DIR}/${id}.${processed.ext}`,
			createdAt: Date.now(),
			tags: [],
			ext: processed.ext,
		});
	}
	return { type: "custom", value: id };
}

export async function importUploadBatch(
	plugin: UploadPlugin,
	entries: readonly BatchEntry[],
	onProgress: (count: number) => void,
): Promise<number> {
	const iconsDir = await prepareIconsDirectory(plugin);
	const now = Date.now();
	const icons: CustomIcon[] = [];
	let failed = 0;
	for (const [index, entry] of entries.entries()) {
		try {
			const result = await processUpload(entry.file);
			const id = `custom-${now}-${index}`;
			await plugin.app.vault.adapter.writeBinary(`${iconsDir}/${id}.${entry.ext}`, result.data);
			icons.push({
				id,
				name: entry.name,
				path: `${ICONS_DIR}/${id}.${entry.ext}`,
				createdAt: now,
				tags: [],
				ext: entry.ext,
			});
		} catch {
			failed++;
		}
		onProgress(index + 1);
	}
	if (icons.length > 0) await plugin.iconLibrary.addBatch(icons);
	return entries.length - failed;
}
