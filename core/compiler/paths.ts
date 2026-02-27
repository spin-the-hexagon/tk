import { basename } from "node:path";

export function nameSegments(path: string): [string, string] {
	const name = basename(path);

	const segments = name.split(".");

	let extStart = Math.max(segments.length - 1, 1);

	while (segments[extStart] === "client" || segments[extStart] === "server") {
		extStart--;
	}

	return [segments.slice(0, extStart).join("."), segments.slice(extStart).join(".")];
}

export function extName(path: string) {
	return nameSegments(path)[1];
}

export function mainName(path: string) {
	return nameSegments(path)[0];
}
