import { resolve } from "node:path";
import { schedulePromise } from "../scheduler/scheduler";
import { fs, type FileType } from "../utils/fastfs";
import { mainName } from "./paths";

export interface FileEntry {
	dataModelPath: string[];
	path: string;
	type: FileType;
}

export async function scanFiles(
	path: string,
	robloxPath: string[],
): Promise<FileEntry[]> {
	const type = await fs.getType(path);

	if (type === "file") {
		return [
			{
				dataModelPath: robloxPath,
				path,
				type: "file",
			},
		];
	}

	const children = await fs.readDir(path);
	const promises: Promise<FileEntry[]>[] = [];

	for (const child of children) {
		promises.push(
			schedulePromise({
				impl() {
					const main = mainName(path);
					const toAdd = main === "init" ? [] : [main];

					return scanFiles(resolve(path, child), [
						...robloxPath,
						...toAdd,
					]);
				},
				name: `Index ${path}`,
				phase: "index",
			}),
		);
	}

	const descendants = (await Promise.all(promises)).flat();

	return [
		...descendants,
		{
			path,
			dataModelPath: robloxPath,
			type: "directory",
		},
	];
}
