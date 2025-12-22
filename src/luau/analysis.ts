import { walk } from "zimmerframe";
import type { Cache } from "../compiler/cache";
import { type ImportInfo } from "../plugin/analysis";
import { action } from "../scheduler/action";
import { serviceNames } from "../utils/datamodel";
import { resolveImport } from "../utils/resolver";
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
			type: "get_child_funct";
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
	  }
	| {
			type: "const_str";
			value: string;
	  }
	| {
			type: "imported_module_path";
			path: string;
	  };

const getChildFuncs = ["WaitForChild", "FindFirstChild"];

export function evaluateExpressionType(expr: Luau.Expression): LuauAnalysisType {
	if (expr.type === "AstExprGlobal" || expr.type === "AstExprLocal") {
		const id = expr.type === "AstExprGlobal" ? expr.global : expr.local.name;
		if (id === "require") return { type: "require" };
		if (id === "game") return { type: "datamodel", path: [], origin: "game" };
		if (id === "script") return { type: "datamodel", path: [], origin: "script" };
		if (serviceNames.includes(id)) return { type: "datamodel", path: [id], origin: "game" };
	}

	if (expr.type === "AstExprConstantString") {
		return {
			type: "const_str",
			value: expr.value,
		};
	}

	if (expr.type === "AstExprIndexName") {
		const innerType = evaluateExpressionType(expr.expr);

		if (innerType.type === "datamodel") {
			if (getChildFuncs.includes(expr.index)) {
				return {
					type: "get_child_funct",
					origin: innerType.origin,
					path: innerType.path,
				};
			}

			return {
				type: "datamodel",
				origin: innerType.origin,
				path: [...innerType.path, expr.index],
			};
		}
	}

	if (expr.type === "AstExprIndexExpr") {
		const innerType = evaluateExpressionType(expr.expr);

		if (innerType.type === "datamodel") {
			const indexType = evaluateExpressionType(expr.index);

			if (indexType.type === "const_str") {
				return {
					type: "datamodel",
					origin: innerType.origin,
					path: [...innerType.path, indexType.value],
				};
			}
		}
	}

	if (expr.type === "AstExprCall") {
		if (expr.func.type === "AstExprIndexName" && !getChildFuncs.includes(expr.func.index)) {
			return { type: "unknown" };
		}

		const funcType = evaluateExpressionType(expr.func);

		if (funcType.type === "require" && expr.args.length >= 1) {
			const module = evaluateExpressionType(expr.args[0]!);

			if (module.type === "datamodel") {
				return {
					...module,
					type: "imported_module",
				};
			} else if (module.type === "const_str") {
				return {
					type: "imported_module_path",
					path: module.value.replaceAll("@self", "."),
				};
			}
		}

		if (funcType.type === "get_child_funct" && expr.args.length >= 1) {
			const index = evaluateExpressionType(expr.args[0]!);

			if (index.type === "const_str") {
				return {
					type: "datamodel",
					origin: funcType.origin,
					path: [...funcType.path, index.value],
				};
			}
		}
	}

	return { type: "unknown" };
}

async function _analyzeImports(source: string, path: string, cache: Cache): Promise<ImportInfo[]> {
	const ast = await parseLuauDocument(source, cache);
	const imports: ImportInfo[] = [];

	walk(
		ast.root as Luau.Node,
		{},
		{
			AstExprCall(node, { next }) {
				const returnType = evaluateExpressionType(node);

				if (returnType.type === "imported_module") {
					imports.push({
						path: returnType.path,
						origin: returnType.origin,
						location: node.location,
						type: "classic",
					});
				}

				if (returnType.type === "imported_module_path") {
					const resolved = resolveImport(returnType.path, path);

					if (resolved) {
						imports.push({
							type: "absolute-path",
							path: resolved,
						});
					}
				}

				next();
			},
		},
	);

	return imports;
}

export async function analyzeImports(source: string, path: string, cache: Cache): Promise<ImportInfo[]> {
	return action({
		id: "luau:analyze_imports",
		name: "Analyze file imports",
		phase: "mark",
		args: [source],
		cache,
		impl(source) {
			return _analyzeImports(source, path, cache);
		},
	});
}
