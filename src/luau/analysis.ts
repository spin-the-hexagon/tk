import type { Luau } from "./ast";

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
