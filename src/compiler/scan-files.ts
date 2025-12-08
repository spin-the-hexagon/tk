import { resolve } from "node:path";
import type { PluginMetadata } from "../plugin/schema";
import { schedulePromise } from "../scheduler/scheduler";
import { resolveDataModelPath } from "../utils/datamodel";
import { fs, type FileType } from "../utils/fastfs";
import { mainName } from "./paths";

export type CodeFileEntry = {
	dataModelPath: string[];
	path: string;
	type: "code";
	mode: "module" | "client" | "server";
	pluginId: string;
	forceSrc?: string;
};

export type FileEntry =
	| {
			dataModelPath: string[];
			path: string;
			type: FileType;
	  }
	| CodeFileEntry;

export async function scanFiles({
	path,
	robloxPath,
	plugins,
}: {
	path: string;
	robloxPath: string[];
	plugins: PluginMetadata[];
}): Promise<FileEntry[]> {
	const type = await fs.getType(path);

	if (type === "file") {
		for (const plug of plugins) {
			for (const fmt of plug.fileFormats) {
				if (fmt.type !== "code") continue;
				if (!path.endsWith(fmt.extension)) continue;
				return [
					{
						dataModelPath: resolveDataModelPath(robloxPath),
						path,
						type: "code",
						mode: fmt.mode,
						pluginId: plug.id,
					},
				];
			}
		}

		return [
			{
				dataModelPath: resolveDataModelPath(robloxPath),
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
					const childPath = resolve(path, child);
					const main = mainName(childPath);
					const toAdd = main === "init" ? [] : [main];

					return scanFiles({
						plugins,
						path: childPath,
						robloxPath: [...robloxPath, ...toAdd],
					});
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
			dataModelPath: resolveDataModelPath(robloxPath),
			type: "directory",
		},
	];
}

export function getDataModelPath(files: FileEntry[], fsPath: string): string[] {
	const entry = files.find(x => x.path === fsPath);

	if (!entry) {
		throw new Error(`Failed to find file at path ${fsPath} in entry table!`);
	}

	return entry.dataModelPath;
}
