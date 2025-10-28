import AdmZip from "adm-zip";
import { mkdir, readdir } from "node:fs/promises";
import { platform } from "node:process";
import type { Cache } from "../compiler/cache";

export function getLuauDownloadURL() {
	let platformId =
		platform === "win32"
			? "windows"
			: platform === "darwin"
				? "macos"
				: "ubuntu";

	return `https://github.com/luau-lang/luau/releases/download/0.697/luau-${platformId}.zip`;
}

export async function downloadLuau(cache: Cache): Promise<string> {
	const url = getLuauDownloadURL();
	const artifactId = "luau-" + Bun.hash(url).toString(36) + ".zip";
	const path = cache.artifactPath(artifactId);
	const extractedPath = cache.artifactPath(
		"luau-" + Bun.hash(url).toString(36),
	);
	let dirExists = false;

	try {
		await readdir(extractedPath);
		dirExists = true;
	} catch {}

	if (!dirExists) {
		const response = await fetch(url);
		await Bun.write(path, response);

		const zip = new AdmZip(path);

		await mkdir(extractedPath, { recursive: true });

		zip.extractAllTo(extractedPath);
	}

	return extractedPath;
}
