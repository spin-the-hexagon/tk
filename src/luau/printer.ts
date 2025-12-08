import { printer, type CodePrinter } from "../utils/code-printer";
import { unreachable } from "../utils/unreachable";
import type { Luau } from "./ast";

export function integrateLuauPrinter(codeprinter: CodePrinter) {
	codeprinter.integratePrinters<Luau.Node>({
		AstExprIndexName: printer("@expr", "$op", "$index"),
		AstExprGlobal: printer("$global"),
		AstExprCall: printer("@func", "(", "comma:args", ")"),
		AstExprFunction: {
			print(cp, node) {
				cp.push("function");
				cp.push("(");
				let comma = false;
				for (const arg of node.args) {
					if (comma) cp.push(",");
					comma = true;
					cp.printNode(arg);
				}
				if (node.vararg) {
					if (comma) cp.push(",");
					cp.push("...");
				}
				cp.push(")");
				cp.printNode(node.body);
			},
		},
		AstExprLocal: printer("@local"),
		AstExprTable: printer("{", "comma:items", "}"),
		AstExprTableItem: {
			print(cp, node) {
				if (node.kind === "item") {
					cp.printNode(node.value);
				} else if (node.kind === "record" || node.kind === "general") {
					cp.printNode(node.key);
					cp.push(":");
					cp.printNode(node.value);
				}
			},
		},
		AstExprUnary: {
			print(cp, node) {
				switch (node.op) {
					case "Not":
						cp.push("~");
						break;
					case "Len":
						cp.push("#");
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
				switch (node.op) {
					case "And":
						cp.push("&&");
						break;
					case "CompareEq":
						cp.push("==");
						break;
					case "CompareNe":
						cp.push("~=");
						break;
					case "Concat":
						cp.push("..");
						break;
					case "Or":
						cp.push("||");
						break;
					case "Add":
						cp.push("+");
						break;
					default:
						unreachable(node.op);
				}
				cp.push("(");
				cp.printNode(node.right);
				cp.push(")");
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
		AstStatBlock: {
			print(cp, node) {
				cp.addIndent();
				for (const segment of node.body) {
					cp.newline();
					cp.printNode(segment);
				}
				cp.unindent();
				cp.newline();
				if (node.hasEnd) {
					cp.push("end");
				}
			},
		},
		AstStatLocal: printer("local", "comma:vars", "=", "comma:values"),
		AstStatIf: {
			print(cp, node) {
				cp.push("if");
				cp.printNode(node.condition);
				cp.push("then");
				cp.printNode(node.thenbody);
				if (node.elsebody) {
					cp.push("else");
					cp.printNode(node.elsebody);
				}
			},
		},
		AstStatLocalFunction: printer("local", "@name", "=", "@func"), // FIXME: SPEC BREAK: Due to our current printing architecture, we write an equivalent. The name belongs inside of the function
		AstStatForIn: {
			print(cp, node) {
				cp.push("for");
				let comma = false;
				for (const varr of node.vars) {
					if (comma) {
						cp.push(",");
					}
					comma = true;
					cp.printNode(varr);
				}
				if (node.hasIn) {
					//FIXME: does this ever even equal false, in what case would you have an 'in'less for-in
					cp.push("in");
				}
				comma = false;
				for (const val of node.values) {
					if (comma) {
						cp.push(",");
					}
					comma = true;
					cp.printNode(val);
				}
				if (node.hasDo) {
					cp.push("do");
				}
				cp.printNode(node.body);
			},
		},
		AstStatFor: {
			print(cp, node) {
				// this is the numeric case
				cp.push("for");
				cp.printNode(node.var);
				cp.push("=");
				cp.printNode(node.from);
				cp.push(",");
				cp.printNode(node.to);
				if (node.step) {
					cp.push(",");
					cp.printNode(node.step);
				}
				if (node.hasDo) {
					cp.push("do");
				}
				cp.printNode(node.body);
			},
		},
		AstStatExpr: printer("@expr"),
		AstStatAssign: printer("comma:vars", "=", "comma:values"),
		AstStatContinue: printer("continue"),
		AstStatWhile: {
			print(cp, node) {
				cp.push("while");
				cp.printNode(node.condition);
				if (node.hasDo) {
					cp.push("do");
				}
				cp.printNode(node.body);
			},
		},
		AstStatReturn: printer("return", "!", "comma:list"),
		AstStatFunction: printer("@name", "=", "@func"), // FIXME: SPEC BREAK: Due to our current printing architecture, we write an equivalent. The name belongs inside of the function
		AstTypePackVariadic: printer(), // FIXME: For the sake of my sanity, we aren't printing types
		AstTypeReference: printer(), // FIXME: For the sake of my sanity, we aren't printing types
		AstLocal: printer("$name"),
		AstStatInline: {
			print(cp, node) {
				for (const segment of node.body) {
					cp.newline();
					cp.printNode(segment);
				}
			},
		},
	});
}
