import extract from "extract-zip";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { platform } from "node:process";

import type { Cache } from "../compiler/cache";

import { debug } from "../cli/logger";
import { action } from "../scheduler/action";

export function getLuauDownloadURL() {
	let platformId = platform === "win32" ? "windows" : platform === "darwin" ? "macos" : "ubuntu";

	return `https://github.com/luau-lang/luau/releases/download/0.697/luau-${platformId}.zip`;
}

export async function downloadLuau(cache: Cache): Promise<string> {
	const url = getLuauDownloadURL();
	return action({
		name: "Download Luau",
		id: "luau:download",
		args: [url],
		cache,
		async impl(): Promise<string> {
			const extractedPath = cache.artifactPath("luau-" + Bun.hash(url).toString(36));

			if (!(await Bun.file(resolve(extractedPath, "luau-ast.exe")).exists())) {
				const response = await fetch(url);

				await mkdir(extractedPath, { recursive: true });

				const filePath = resolve(extractedPath, "data.zip");

				const bytes = await response.bytes();

				await Bun.write(filePath, bytes);

				await extract(filePath, { dir: extractedPath });
			}

			return extractedPath;
		},
		phase: "download",
	});
}
