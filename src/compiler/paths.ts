import { basename } from "node:path";

export function nameSegments(path: string): [string, string] {
	const name = basename(path);

	const [base, ...exts] = name.split(".");

	return [base ?? "", exts.join(".")];
}

export function extName(path: string) {
	return nameSegments(path)[1];
}

export function mainName(path: string) {
	return nameSegments(path)[0];
}
