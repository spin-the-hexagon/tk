import { $ } from "bun";
import * as v from "valibot";
import type { Cache } from "../compiler/cache";
import { schedulePromise } from "../scheduler/scheduler";
import { downloadLuau } from "./download";

async function _parseLuauDocument(
	source: string,
	cache: Cache,
): Promise<string> {
	const luauFolder = await downloadLuau(cache);
	const hash = Bun.hash(source).toString(36);
	const temporaryFile = cache.artifactPath(`src-${hash}.luau`);
	await Bun.write(temporaryFile, source);
	const ast = await $.cwd(luauFolder)`./luau-ast ${temporaryFile}`.text();
	await Bun.file(temporaryFile).delete();
	return ast;
}

export async function parseLuauDocument(source: string, cache: Cache) {
	const hash = Bun.hash(source).toString(36);

	const cacheHit = cache.query(
		v.object({
			type: v.literal("luau:parse"),
			src: v.literal(hash),
			ast: v.any(),
		}),
	);

	if (cacheHit) {
		return cacheHit.ast;
	}

	return schedulePromise({
		name: `ParseLUA ${hash}`,
		phase: "parse",
		async impl() {
			const ast = await _parseLuauDocument(source, cache);
			cache.save({
				type: "luau:parse",
				src: hash,
				ast: JSON.parse(ast),
			});
			return JSON.parse(ast);
		},
	});
}
