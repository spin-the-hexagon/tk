import type {
	BindingPattern,
	Expression,
	IdentifierName,
	IdentifierReference,
	PrivateIdentifier,
	Statement,
	StringLiteral,
} from "oxc-parser";

import { match, P } from "ts-pattern";

import type { Luau } from "../luau/ast";

import { lu } from "../luau/construction-utilities";
import { TODO } from "../utils/todo";

const internalPrefix = "tkts__";

export class TypescriptTranspiler {
	private _activeBlock: Luau.BlockStatement | undefined;
	usedSymbols: Set<string> = new Set();
	moduleId = this.getSymbolName("module");
	libs: Record<string, string> = {};

	getLib(id: string): string {
		if (this.libs[id]) return this.libs[id];

		this.libs[id] ??= this.getSymbolName(`lib_${id}`);

		return this.libs[id]!;
	}

	addPrelude() {
		this.pushStatement(lu.defineLocal(this.moduleId, { type: "AstExprTable", items: [] }));
	}

	addPostlude() {
		for (const lib in this.libs) {
			this.activeBlock.body.unshift(
				lu.defineLocal(this.libs[lib]!, lu.call(lu.global("require"), false, lu.str(`virtual:${lib}`))),
			);
		}
		this.pushStatement(lu.return(lu.getLocal(this.moduleId)));
	}

	*getSymbolNamesInternal(id: string) {
		yield `${internalPrefix}${id}`;

		let i = 1;

		while (true) {
			yield `${id}_${i}`;
			i++;
		}
	}

	getSymbolName(id: string): string {
		let cleanedId = "";

		for (const char of id) {
			if (/^[a-zA-Z0-9]$/.test(char)) {
				cleanedId += char;
			} else {
				cleanedId += "_";
			}
		}

		for (const symbol of this.getSymbolNamesInternal(cleanedId)) {
			if (!this.usedSymbols.has(symbol)) {
				this.usedSymbols.add(symbol);
				return symbol;
			}
		}
		throw new Error("FAILED TO GENERATE SYMBOL");
	}

	get activeBlock() {
		if (this._activeBlock) {
			return this._activeBlock;
		}

		throw new Error(`Invalid state: No active block mounted`);
	}

	mountBindingPattern(id: string, pattern: BindingPattern) {
		match(pattern)
			.with({ type: "Identifier" }, pattern => {
				this.pushStatement(lu.defineLocal(pattern.name, lu.getLocal(id)));
			})
			.with({ type: "ArrayPattern" }, pattern => {
				let index = 0;

				for (const part of pattern.elements) {
					if (!part) continue;

					if (part.type === "RestElement") {
						TODO("RestElement in ArrayPattern");
					}

					const subIdent = this.getSymbolName(`idx_${index}_pattern`);

					this.pushStatement(lu.defineLocal(subIdent, lu.index(lu.getLocal(id), lu.number(index + 1))));

					this.mountBindingPattern(subIdent, part);

					index++;
				}
			})
			.with({ type: "AssignmentPattern" }, pattern => {
				const valueId = this.getSymbolName("pattern_value");

				this.pushStatement(
					lu.defineLocal(valueId, lu.or(lu.getLocal(id), this.translateExpression(pattern.right))),
				);

				this.mountBindingPattern(valueId, pattern.left);
			})
			.with({ type: "ObjectPattern" }, pattern => {
				for (const entry of pattern.properties) {
					if (entry.type === "RestElement") {
						TODO("RestElement in ObjectPattern");
					}
					if (entry.key.type !== "Identifier") {
						TODO("Non-Identifier keys in ObjectPattern");
					}
					if (entry.shorthand) {
						const key = entry.key.name;
						this.pushStatement(lu.defineLocal(key, lu.index(lu.getLocal(id), lu.str(key))));
					} else {
						const key = entry.key.name;
						const subId = this.getSymbolName("pattern_key_" + key);
						this.pushStatement(lu.defineLocal(subId, lu.index(lu.getLocal(id), lu.str(key))));
						this.mountBindingPattern(subId, entry.value);
					}
				}
			})
			.exhaustive();
	}

	blockContext(block: Luau.BlockStatement) {
		const current = this._activeBlock;

		this._activeBlock = block;

		const self = this;

		return {
			[Symbol.dispose]() {
				self._activeBlock = current;
			},
		};
	}

	pushStatement(stat: Luau.Statement) {
		this.activeBlock.body.push(stat);
	}

	translateStatement(stat: Statement) {
		return match(stat)
			.with({ type: "ImportDeclaration" }, stat => {
				const importPath = stat.source.value;
				const importId = this.getSymbolName(`import_${importPath}`);
				this.pushStatement(lu.defineLocal(importId, lu.call(lu.global("require"), false, lu.str(importPath))));
				for (const spec of stat.specifiers) {
					const imported = lu.getLocal(importId);
					this.pushStatement(
						lu.defineLocal(
							spec.local.name,
							match(spec)
								.with({ type: "ImportDefaultSpecifier" }, spec => lu.index(imported, lu.str("default")))
								.with({ type: "ImportNamespaceSpecifier" }, spec => imported)
								.with({ type: "ImportSpecifier" }, spec =>
									lu.index(imported, lu.str(getStrValue(spec.imported))),
								)
								.exhaustive(),
						),
					);
				}
			})
			.with({ type: "ExpressionStatement" }, stat => {
				this.pushStatement(lu.exprStatement(this.translateExpression(stat.expression)));
			})
			.with({ type: "ReturnStatement" }, stat => {
				if (!stat.argument) {
					this.pushStatement(lu.return());
				} else {
					this.pushStatement(lu.return(this.translateExpression(stat.argument)));
				}
			})
			.with({ type: "ExportNamedDeclaration" }, decl => {
				if (!decl.declaration) return; // type-only

				this.translateStatement(decl.declaration);

				const name = match(decl.declaration)
					.with({ type: "ClassDeclaration" }, decl => decl.id?.name)
					.with({ type: "ClassExpression" }, decl => decl.id?.name)
					.with({ type: "FunctionDeclaration" }, decl => decl.id?.name)
					.with({ type: "FunctionExpression" }, decl => decl.id?.name)
					.with(
						{ type: "VariableDeclaration", declarations: [{ id: { type: "Identifier" } }] },
						decl => decl.declarations[0]?.id?.name,
					)
					.otherwise(() => undefined);

				if (!name) {
					if (decl.declaration.type.startsWith("TS")) return;
					TODO(decl.declaration.type);
				}

				this.pushStatement(lu.assign(lu.index(lu.getLocal(this.moduleId), lu.str(name)), lu.getLocal(name)));
			})
			.with({ type: "FunctionDeclaration" }, decl => {
				if (!decl.body) return; // type-only
				if (decl.async) TODO("async functions");

				const body = lu.block([]);
				const argLocals: Luau.Local[] = [];

				{
					using _ctx = this.blockContext(body);

					for (const arg of decl.params.map(x => (x.type === "TSParameterProperty" ? x.parameter : x))) {
						if (arg.type === "RestElement") TODO("RestElement in FunctionDeclaration");
						if (arg.type === "Identifier") {
							argLocals.push({
								type: "AstLocal",
								name: arg.name,
							});
							continue;
						}

						const id = this.getSymbolName("arg");

						argLocals.push({
							type: "AstLocal",
							name: id,
						});

						this.mountBindingPattern(id, arg);
					}

					for (const stat of decl.body.body) {
						this.translateStatement(stat);
					}
				}

				const name = decl.id?.name;

				if (!name) TODO("FunctionDeclaration without name");

				this.pushStatement({
					type: "AstStatLocalFunction",
					name: {
						type: "AstLocal",
						name,
					},
					func: {
						type: "AstExprFunction",
						attributes: [],
						generics: [],
						genericPacks: [],
						args: argLocals,
						vararg: false,
						functionDepth: 0,
						debugname: name,
						body,
					},
				});
			})
			.otherwise(stat => TODO(stat.type));
	}

	getExprValue(property: Expression | IdentifierName | PrivateIdentifier) {
		if (property.type === "Identifier") {
			return lu.str(property.name);
		}
		if (property.type === "PrivateIdentifier") {
			TODO("PrivateIdentifier in getExprValue");
		}
		return this.translateExpression(property);
	}

	translateExpression(expr: Expression): Luau.Expression {
		return match(expr)
			.returnType<Luau.Expression>()
			.with({ type: "CallExpression", callee: { type: "MemberExpression" } }, expr =>
				lu.call(
					lu.index(lu.getLocal(this.getLib("core")), lu.str("call")),
					false,
					this.translateExpression(expr.callee.object),
					this.getExprValue(expr.callee.property),
					...expr.arguments.map(arg =>
						arg.type === "SpreadElement"
							? TODO("SpreadElement in CallExpression")
							: this.translateExpression(arg),
					),
				),
			)
			.with({ type: "CallExpression" }, expr =>
				lu.call(
					this.translateExpression(expr.callee),
					false,
					...expr.arguments.map(arg =>
						arg.type === "SpreadElement"
							? TODO("SpreadElement in CallExpression")
							: this.translateExpression(arg),
					),
				),
			)
			.with({ type: "Identifier" }, expr => lu.global(expr.name))
			.with({ type: "Literal", value: P.string }, expr => lu.str(expr.value))
			.with({ type: "Literal", value: P.number }, expr => lu.number(expr.value))
			.with({ type: "Literal", value: P.boolean }, expr => lu.bool(expr.value))
			.with({ type: "BinaryExpression" }, expr => {
				if (expr.left.type === "PrivateIdentifier") TODO("V8 weirdness");

				if (expr.operator === "+") {
					return lu.call(
						lu.index(lu.getLocal(this.getLib("core")), lu.str("plus")),
						false,
						this.translateExpression(expr.left),
						this.translateExpression(expr.right),
					);
				}

				return lu.binary(
					match(expr.operator)
						.returnType<Luau.BinaryOp>()
						.with("!=", () => "CompareNe")
						.otherwise(it => TODO(`BinaryExpr ${it}`)),
					this.translateExpression(expr.left),
					this.translateExpression(expr.right),
				);
			})
			.otherwise(expr => TODO(expr.type));
	}
}

function getStrValue(imported: IdentifierName | IdentifierReference | StringLiteral): string {
	return match(imported)
		.with({ type: "Identifier" }, imp => imp.name)
		.with({ type: "Literal" }, imp => imp.value)
		.exhaustive();
}
