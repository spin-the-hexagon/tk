import { $ } from "bun";
import type { Cache } from "../compiler/cache";
import { action } from "../scheduler/action";
import type { Luau } from "./ast";
import { downloadLuau } from "./download";

async function _parseLuauDocument(
	source: string,
	cache: Cache,
): Promise<Luau.Document> {
	const luauFolder = await downloadLuau(cache);
	const hash = Bun.hash(source).toString(36);
	const temporaryFile = cache.artifactPath(`src-${hash}.luau`);
	await Bun.write(temporaryFile, source);
	const ast = await $.cwd(luauFolder)`./luau-ast ${temporaryFile}`.json();
	await Bun.file(temporaryFile).delete();
	return ast;
}

export async function parseLuauDocument(source: string, cache: Cache) {
	return await action({
		name: "Parse Luau document",
		id: "parse:luau",
		args: [source],
		async impl(source: string) {
			return await _parseLuauDocument(source, cache);
		},
		phase: "parse",
		cache,
	});
}
