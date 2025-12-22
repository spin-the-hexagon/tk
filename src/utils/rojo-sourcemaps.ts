import { resolve } from "node:path";
import type { FileEntry } from "../compiler/scan-files";
import type { Config } from "../config/schema";
import { serviceNames } from "./datamodel";

export interface SourcemapNode {
	name: string;
	className: string;
	filePaths: string[];
	children: SourcemapNode[];
}

export function getSourcemapNode(node: SourcemapNode, path: string[]) {
	const [child, ...rest] = path;

	if (!child) return node;

	let childNode = node.children.find(x => x.name === child);

	if (!childNode) {
		childNode = {
			name: child,
			className: serviceNames.includes(child) ? child : "Folder",
			filePaths: [],
			children: [],
		};

		node.children.push(childNode);
	}

	return getSourcemapNode(childNode, rest);
}

export function createSourcemapFromFiles({
	files,
	config,
	projectPath,
}: {
	files: FileEntry[];
	config: Config;
	projectPath: string;
}) {
	const configPath = resolve(projectPath, "tk.toml");
	const root: SourcemapNode = {
		name: config.name,
		className: "DataModel",
		children: [],
		filePaths: [configPath],
	};

	for (const file of files) {
		const node = getSourcemapNode(root, file.dataModelPath.slice(1));

		if (file.type === "code") {
			node.className = {
				client: "ClientScript",
				server: "Script",
				module: "ModuleScript",
			}[file.mode];
			node.filePaths.push(file.path);
		}
	}

	return root;
}
