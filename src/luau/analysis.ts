import { walk } from "zimmerframe";
import type { Cache } from "../compiler/cache";
import { type ImportInfo } from "../plugin/analysis";
import { action } from "../scheduler/action";
import type { Luau } from "./ast";
import { parseLuauDocument } from "./parser";

export type LuauAnalysisType =
	| {
			type: "require";
	  }
	| {
			type: "datamodel";
			origin: "script" | "game";
			path: string[];
	  }
	| {
			type: "unknown";
	  }
	| {
			type: "imported_module";
			origin: "script" | "game";
			path: string[];
	  };

export function evaluateExpressionType(
	expr: Luau.Expression,
): LuauAnalysisType {
	if (expr.type === "AstExprGlobal") {
		if (expr.global === "require") return { type: "require" };
		if (expr.global === "game")
			return { type: "datamodel", path: [], origin: "game" };
		if (expr.global === "script")
			return { type: "datamodel", path: [], origin: "script" };
	}

	if (expr.type === "AstExprIndexName") {
		const innerType = evaluateExpressionType(expr.expr);

		if (innerType.type === "datamodel") {
			return {
				type: "datamodel",
				origin: innerType.origin,
				path: [...innerType.path, expr.index],
			};
		}
	}

	if (expr.type === "AstExprCall") {
		const funcType = evaluateExpressionType(expr.func);

		if (funcType.type === "require" && expr.args.length === 1) {
			const module = evaluateExpressionType(expr.args[0]!);

			if (module.type === "datamodel") {
				return {
					...module,
					type: "imported_module",
				};
			}
		}
	}

	return { type: "unknown" };
}

async function _analyzeImports(
	source: string,
	cache: Cache,
): Promise<ImportInfo[]> {
	const ast = await parseLuauDocument(source, cache);
	const imports: ImportInfo[] = [];

	walk(
		ast.root as Luau.Node,
		{},
		{
			AstExprCall(node) {
				const returnType = evaluateExpressionType(node);

				if (returnType.type === "imported_module") {
					imports.push({
						path: returnType.path,
						origin: returnType.origin,
						location: node.location,
					});
				}
			},
		},
	);

	return imports;
}

export async function analyzeImports(
	source: string,
	cache: Cache,
): Promise<ImportInfo[]> {
	return action({
		id: "luau:analyze_imports",
		name: "Analyze file imports",
		phase: "mark",
		args: [source],
		cache,
		impl(source) {
			return _analyzeImports(source, cache);
		},
	});
}
