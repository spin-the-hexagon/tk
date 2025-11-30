import { $ } from "bun";
import * as v from "valibot";
import { debug } from "../cli/logger";
import type { Cache } from "../compiler/cache";
import { schedulePromise } from "../scheduler/scheduler";
import type { Luau } from "./ast";
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
	debug(source);

	const hash = Bun.hash(source).toString(36);

	const cacheHit = cache.query(
		v.object({
			type: v.literal("luau:parse"),
			src: v.literal(hash),
			ast: v.any(),
		}),
	);

	if (cacheHit) {
		return cacheHit.ast as Luau.Document;
	}

	return schedulePromise({
		name: `ParseLUA ${hash}`,
		phase: "parse",
		async impl() {
			const ast = JSON.parse(
				await _parseLuauDocument(source, cache),
			) as Luau.Document;
			ast.root.hasEnd = false;
			cache.save({
				type: "luau:parse",
				src: hash,
				ast,
			});
			return ast;
		},
	});
}
