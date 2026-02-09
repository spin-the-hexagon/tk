import { ResolverFactory } from "oxc-resolver";
import { walk } from "zimmerframe";

import type { Cache } from "../compiler/cache";
import type { FileEntry } from "../compiler/scan-files";
import type { Luau } from "./ast";

import { warn } from "../cli/logger";
import { action } from "../scheduler/action";
import { resolveDataModelPath } from "../utils/datamodel";
import { evaluateExpressionType } from "./analysis";

const resolver = new ResolverFactory({
	extensions: [".js", ".ts", ".luau", ".lua", ".mjs", ".mts"],
});

async function _transpileToTKPack({
	ast,
	cache,
	pathDM,
	filePath,
	files,
}: {
	ast: Luau.Document;
	cache: Cache;
	pathDM: string[];
	filePath: string;
	files: FileEntry[];
}): Promise<Luau.BlockStatement> {
	const result = walk(
		ast.root as Luau.Node,
		{},
		{
			AstExprCall(node, { next }) {
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
						index: "include",
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
				} else if (returnType.type === "imported_module_path") {
					let resolvedPath = returnType.path;

					const resolveResult = resolver.resolveFileSync(filePath, resolvedPath);

					if (resolveResult.path) {
						resolvedPath = resolveResult.path;
					} else {
						if (!resolvedPath.startsWith("virtual:")) {
							warn(`Failed to resolve ${resolvedPath}`, resolveResult);
						}
					}
					const file = files.find(x => x.path === resolvedPath);

					if (!file) {
						warn(`Failed to find data-model of path ${resolvedPath}`);
						return;
					}

					const loc = node.location;

					return {
						type: "AstExprCall",
						self: false,
						func: {
							type: "AstExprIndexName",
							location: loc,
							index: "include",
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
						},
						args: [
							{
								type: "AstExprConstantString",
								location: loc,
								value: file.dataModelPath.join("."),
							},
						],
					};
				}

				next();
			},
		},
	) as Luau.BlockStatement;

	result.hasEnd = false;

	return result;
}

export async function transpileToTKPack({
	ast,
	cache,
	pathDM,
	filePath,
	files,
}: {
	ast: Luau.Document;
	cache: Cache;
	pathDM: string[];
	filePath: string;
	files: FileEntry[];
}): Promise<Luau.BlockStatement> {
	return await action({
		name: `Transpile ${pathDM.join(".")} to TKPack`,
		id: "tkpack:transpile",
		args: [{ ast, pathDM, filePath }],
		phase: "parse",
		cache,
		async impl() {
			return await _transpileToTKPack({
				pathDM,
				ast,
				cache,
				filePath,
				files,
			});
		},
	});
}
