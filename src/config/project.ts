import { resolve } from "node:path";

export interface ProjectJSON {
	name: string;
	tree: ProjectJSONNode;
}

export interface ProjectPortal {
	roblox: string[];
	project: string;
}

export type SpecialKeys = "$className";

export type ProjectJSONNode = {
	$className?: string;
	$properties?: Record<string, any>;
	$path?: string;
} & {
	[key in string]: ProjectJSONNode;
};

export function createPortalsFromProjectNode(props: {
	dataModelPath: string[];
	node: ProjectJSONNode;
	originPath: string;
}): ProjectPortal[] {
	const portals: ProjectPortal[] = [];

	if (props.node.$path) {
		portals.push({
			roblox: props.dataModelPath,
			project: resolve(props.originPath, props.node.$path),
		});
	}

	for (const key in props.node) {
		if (key.startsWith("$")) continue;
		const child = props.node[key]!;

		portals.push(
			...createPortalsFromProjectNode({
				dataModelPath: [...props.dataModelPath, key],
				node: child,
				originPath: props.originPath,
			}),
		);
	}

	return portals;
}
