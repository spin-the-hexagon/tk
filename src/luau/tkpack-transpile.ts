import { resolve } from "node:path";
import { walk } from "zimmerframe";
import { debug } from "../cli/logger";
import type { Cache } from "../compiler/cache";
import type { FileEntry } from "../compiler/scan-files";
import { action } from "../scheduler/action";
import { resolveDataModelPath } from "../utils/datamodel";
import { evaluateExpressionType } from "./analysis";
import type { Luau } from "./ast";

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
				} else if (returnType.type === "imported_module_path") {
					const resolvedPath = resolve(filePath, returnType.path);
					const file = files.find(x => x.path === resolvedPath);

					if (!file) {
						debug(`Failed to find data-model of path ${resolvedPath}`);
						return;
					}

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
							value: file.dataModelPath.join("."),
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
	filePath,
	files,
}: {
	ast: Luau.Document;
	cache: Cache;
	pathDM: string[];
	filePath: string;
	files: FileEntry[];
}): Promise<Luau.Document> {
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
