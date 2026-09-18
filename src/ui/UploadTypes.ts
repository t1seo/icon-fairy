import type IconFairyPlugin from "../main";
import type { IconData } from "../types";

export type UploadPlugin = {
	readonly app: {
		readonly vault: {
			readonly adapter: Pick<
				IconFairyPlugin["app"]["vault"]["adapter"],
				"exists" | "mkdir" | "writeBinary"
			>;
		};
	};
	readonly manifest: Pick<IconFairyPlugin["manifest"], "dir">;
	readonly iconLibrary: Pick<IconFairyPlugin["iconLibrary"], "add" | "addBatch">;
};

export interface UploadHost {
	getTargetPath(): string;
	selectIcon(icon: IconData): void;
	close(): void;
}

export type ProcessedFile = {
	readonly data: ArrayBuffer;
	readonly dataUrl: string;
	readonly ext: "png" | "svg";
};

export type BatchEntry = {
	readonly file: File;
	readonly name: string;
	readonly ext: "png" | "svg";
};
