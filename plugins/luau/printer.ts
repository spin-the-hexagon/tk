import { hotpatch, printer, subref, when, type CodePrinter } from "@core/utils/code-printer";
import { unreachable } from "@core/utils/unreachable";
import { match } from "ts-pattern";

import type { Luau } from "./ast";

function binaryOpToText(op: Luau.BinaryOp) {
	return match(op)
		.with("Add", () => "+")
		.with("Sub", () => "-")
		.with("Div", () => "/")
		.with("Mul", () => "*")
		.with("Mod", () => "%")
		.with("CompareEq", () => "==")
		.with("CompareGe", () => ">=")
		.with("CompareLe", () => "<=")
		.with("CompareNe", () => "~=")
		.with("CompareGt", () => ">")
		.with("CompareLt", () => "<")
		.with("And", () => "and")
		.with("Concat", () => "..")
		.with("Or", () => "or")
		.with("Pow", () => "^")
		.exhaustive();
}

export function integrateLuauPrinter(codeprinter: CodePrinter) {
	codeprinter.integratePrinters<Luau.Node>({
		AstExprIndexName: printer("@expr", "$op", "$index"),
		AstExprGlobal: printer("$global"),
		AstExprCall: printer("@func", "(", "comma:args", ")"),
		AstExprFunction: printer(
			"function",
			"(",
			"comma:args",
			when(
				"vararg",
				when(it => it.args.length > 0, ","),
				"...",
			),
			")",
			"@body",
		),
		AstExprLocal: printer("@local"),
		AstExprTable: printer("{", "comma:items", "}"),
		AstExprTableItem: {
			print(cp, node) {
				if (node.kind === "item") {
					cp.printNode(node.value);
				} else if (node.kind === "record" || node.kind === "general") {
					cp.push("[");
					cp.printNode(node.key);
					cp.push("]");
					cp.push("=");
					cp.printNode(node.value);
				}
			},
		},
		AstExprInterpString: {
			print(cp, node) {
				let strIdx = 0;
				let exprIdx = 0;

				cp.push("`");
				while (strIdx < node.strings.length || exprIdx < node.expressions.length) {
					if (strIdx < node.strings.length) {
						cp.push(cp.escapeLuaStringBody(node.strings[strIdx]!));

						strIdx++;
					}
					if (exprIdx < node.expressions.length) {
						cp.push("{");
						cp.printNode(node.expressions[exprIdx]!);
						cp.push("}");

						exprIdx++;
					}
				}
				cp.push("`");
			},
		},
		AstStatBreak: printer("break"),
		AstExprUnary: {
			print(cp, node) {
				switch (node.op) {
					case "Not":
						cp.push("not");
						break;
					case "Len":
						cp.push("#");
						break;
					case "Minus":
						cp.push("-");
						break;
					default:
						unreachable(node.op);
				}
				cp.push("(");
				cp.printNode(node.expr);
				cp.push(")");
			},
		},
		AstExprIndexExpr: printer("@expr", "[", "@index", "]"),
		AstExprBinary: {
			print(cp, node) {
				cp.push("(");
				cp.printNode(node.left);
				cp.push(")");
				cp.push(binaryOpToText(node.op));
				cp.push("(");
				cp.printNode(node.right);
				cp.push(")");
			},
		},
		AstStatCompoundAssign: {
			print(cp, node) {
				cp.printNode(node.var);
				cp.push(binaryOpToText(node.op));
				cp.push("=");
				cp.printNode(node.value);
			},
		},
		AstExprConstantString: {
			print(cp, node) {
				cp.push(cp.escapeString(node.value));
			},
		},
		AstExprConstantBool: {
			print(cp, node) {
				cp.push(node.value ? "true" : "false"); // could concievably use bool.toString() here, but ternary feels clearer
			},
		},
		AstExprConstantNil: printer("nil"),
		AstExprConstantNumber: {
			print(cp, node) {
				cp.push(node.value.toString());
			},
		},
		AstExprVarargs: printer("..."),
		AstStatBlock: printer(
			when(it => it.hasDo ?? false, "do"),
			"'indent",
			hotpatch(it => {
				for (const child of it.body) {
					if (child.type == "AstStatBlock") {
						child.hasDo = true;
					}
				}
			}),
			"semi:body",
			"'undent",
			when("hasEnd", "end"),
		),
		AstStatLocal: printer(
			"local",
			"comma:vars",
			when(it => it.values.length > 0, "="),
			"comma:values",
		),
		AstStatIf: printer(
			when(it => it.hasIf ?? true, "if"),
			"@condition",
			"then",
			hotpatch(it => {
				if (it.elsebody !== undefined) {
					it.thenbody.hasEnd = false;
					if (it.elsebody.type === "AstStatIf") {
						it.elsebody.hasIf = false;
					}
				}
			}),
			"@thenbody",
			when(
				it => it.elsebody !== undefined,
				when(it => it.elsebody?.type === "AstStatIf", "elseif"),
				when(it => it.elsebody?.type !== "AstStatIf", "else"),
				"@elsebody",
			),
		),
		AstExprIfElse: printer(
			"if",
			"@condition",
			when("hasThen", "then", "@trueExpr"),
			when("hasElse", "else", "@falseExpr"),
		),
		AstStatForIn: printer("for", "comma:vars", when("hasIn", "in"), "comma:values", when("hasDo", "do"), "@body"),
		AstStatFor: printer(
			"for",
			"@var",
			"=",
			"@from",
			",",
			"@to",
			when(it => it.step !== undefined, ",", "@step"),
			when("hasDo", "do"),
			"@body",
		),
		AstStatExpr: printer("@expr"),
		AstStatAssign: printer("comma:vars", "=", "comma:values"),
		AstStatContinue: printer("continue"),
		AstStatWhile: printer("while", "@condition", when("hasDo", "do"), "@body"),
		AstStatReturn: printer("return", "comma:list"),
		AstStatFunction: printer(
			"function",
			"@name",
			"(",
			subref("func", "comma:args"),
			subref(
				"func",
				when(
					"vararg",
					when(it => it.args.length > 0, ","),
					"...",
				),
			),
			")",
			subref("func", "@body"),
		),
		AstStatLocalFunction: printer(
			"local",
			"function",
			"@name",
			"(",
			subref("func", "comma:args"),
			subref(
				"func",
				when(
					"vararg",
					when(it => it.args.length > 0, ","),
					"...",
				),
			),
			")",
			subref("func", "@body"),
		),
		AstTypePackVariadic: printer("@variadicType"), // FIXME: For the sake of my sanity, we aren't printing types
		AstTypeReference: printer(), // FIXME: For the sake of my sanity, we aren't printing types
		AstStatTypeAlias: printer('type("not printable... yet")'), // FIXME: For the sake of my sanity, we aren't printing types
		AstExprTypeAssertion: printer("@expr"), // FIXME: For the sake of my sanity, we aren't printing types
		AstLocal: printer("$name"),
		AstStatInline: printer("lines:body"),
		AstExprGroup: printer("(", "@expr", ")"),
		AstStatRepeat: printer(
			"repeat",
			hotpatch(it => {
				it.body.hasEnd = false;
			}),
			"@body",
			"until",
			"@condition",
		),
	});
}
