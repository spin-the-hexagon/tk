import * as v from "valibot";
import { walk } from "zimmerframe";
import type { Cache } from "../compiler/cache";
import { schedulePromise } from "../scheduler/scheduler";
import { CodePrinter } from "../utils/code-printer";
import { resolveDataModelPath } from "../utils/datamodel";
import { evaluateExpressionType } from "./analysis";
import type { Luau } from "./ast";
import { parseLuauDocument } from "./parser";
import { integrateLuauPrinter } from "./printer";

async function _transpileToTKPack({
	src,
	cache,
	pathDM,
}: {
	src: string;
	cache: Cache;
	pathDM: string[];
}): Promise<string> {
	const parsed = await parseLuauDocument(src, cache);

	walk(
		parsed.root as Luau.Node,
		{},
		{
			AstExprCall(node) {
				const returnType = evaluateExpressionType(node);
				let path = [...pathDM];

				if (returnType.type === "imported_module") {
					if (returnType.origin === "game") {
						path.push("game");
					}

					path.push(...returnType.path);

					const resolved = resolveDataModelPath(path);

					const loc = node.location;

					node.func = {
						type: "AstExprIndexName",
						location: loc,
						index: "import",
						indexLocation: loc,
						op: ".",
						expr: {
							type: "AstExprLocal",
							location: loc,
							local: {
								location: loc,
								type: "AstLocal",
								name: "tkpack",
							},
						},
					};

					node.args = [
						{
							type: "AstExprConstantString",
							location: loc,
							value: resolved.join("."),
						},
					];
				}
			},
		},
	);

	const printer = new CodePrinter();

	integrateLuauPrinter(printer);

	printer.printNode(parsed.root);

	return printer.text;
}

export async function transpileToTKPack({
	src,
	cache,
	pathDM,
}: {
	src: string;
	cache: Cache;
	pathDM: string[];
}): Promise<string> {
	const hash = Bun.hash(src).toString(36);

	const cacheHit = cache.query(
		v.object({
			type: v.literal("tkpack:transpile"),
			src: v.literal(hash),
			transpiled: v.string(),
			dataModelPath: v.custom((x) => Bun.deepEquals(x, pathDM)),
		}),
	);

	if (cacheHit) {
		return cacheHit.transpiled as string;
	}

	return schedulePromise({
		name: `Transpile module ${pathDM.join(".")}`,
		phase: "parse",
		async impl() {
			const transpiled = await _transpileToTKPack({ src, cache, pathDM });
			cache.save({
				type: "tkpack:transpile",
				src: hash,
				transpiled,
				dataModelPath: pathDM,
			});
			return transpiled;
		},
	});
}
