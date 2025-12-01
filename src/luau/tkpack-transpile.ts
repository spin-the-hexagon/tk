import { walk } from "zimmerframe";
import type { Cache } from "../compiler/cache";
import { action } from "../scheduler/action";
import { resolveDataModelPath } from "../utils/datamodel";
import { evaluateExpressionType } from "./analysis";
import type { Luau } from "./ast";

async function _transpileToTKPack({
	ast,
	cache,
	pathDM,
}: {
	ast: Luau.Document;
	cache: Cache;
	pathDM: string[];
}): Promise<Luau.Document> {
	walk(
		ast.root as Luau.Node,
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

	return ast;
}

export async function transpileToTKPack({
	ast,
	cache,
	pathDM,
}: {
	ast: Luau.Document;
	cache: Cache;
	pathDM: string[];
}): Promise<Luau.Document> {
	return await action({
		name: `Transpile ${pathDM.join(".")} to TKPack`,
		id: "tkpack:transpile",
		args: [{ ast, pathDM }],
		phase: "parse",
		cache,
		async impl() {
			return await _transpileToTKPack({ pathDM, ast, cache });
		},
	});
}
