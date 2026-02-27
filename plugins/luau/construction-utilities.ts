// smol' lil utils for creating luau asts

import type { Luau } from "./ast";

export type Locatable = {
	location?: Luau.Location;
};

export type LocateUtils<T extends Locatable> = T & {
	loc(location: Luau.Location): LocateUtils<T>;
};

export function withLocateUtils<T extends Locatable>(obj: T): LocateUtils<T> {
	//@ts-expect-error
	return {
		...obj,
		loc(location) {
			this.location = location;
			return this;
		},
	};
}

export const lu = {
	str(value: string) {
		return withLocateUtils<Luau.ConstantStringExpression>({
			type: "AstExprConstantString",
			value,
		});
	},
	global(id: string) {
		return withLocateUtils<Luau.GlobalExpression>({
			type: "AstExprGlobal",
			global: id,
		});
	},
	exprStatement(expr: Luau.Expression) {
		return withLocateUtils<Luau.ExpressionStatement>({
			type: "AstStatExpr",
			expr,
		});
	},
	bool(value: boolean) {
		return withLocateUtils<Luau.ConstantBooleanExpression>({
			type: "AstExprConstantBool",
			value,
		});
	},
	number(value: number) {
		return withLocateUtils<Luau.ConstantNumberExpression>({
			type: "AstExprConstantNumber",
			value,
		});
	},
	index(expr: Luau.Expression, index: Luau.Expression) {
		return withLocateUtils<Luau.IndexExpressionExpression>({
			type: "AstExprIndexExpr",
			expr,
			index,
		});
	},
	call(func: Luau.Expression, self: boolean, ...args: Luau.Expression[]) {
		return withLocateUtils<Luau.CallExpression>({
			type: "AstExprCall",
			self,
			func,
			args,
		});
	},
	binary(op: Luau.BinaryOp, left: Luau.Expression, right: Luau.Expression) {
		return withLocateUtils<Luau.BinaryExpression>({
			type: "AstExprBinary",
			op,
			left,
			right,
		});
	},
	block(body: Luau.Statement[], hasEnd = true) {
		return withLocateUtils<Luau.BlockStatement>({
			type: "AstStatBlock",
			body,
			hasEnd,
		});
	},
	defineLocal(id: string, value: Luau.Expression) {
		return withLocateUtils<Luau.LocalStatement>({
			type: "AstStatLocal",
			vars: [
				{
					type: "AstLocal",
					name: id,
				},
			],
			values: [value],
		});
	},
	getLocal(id: string) {
		return withLocateUtils<Luau.LocalExpression>({
			type: "AstExprLocal",
			local: {
				type: "AstLocal",
				name: id,
			},
		});
	},
	or(left: Luau.Expression, right: Luau.Expression) {
		return withLocateUtils<Luau.BinaryExpression>({
			type: "AstExprBinary",
			left,
			right,
			op: "Or",
		});
	},
	return(...list: Luau.Expression[]) {
		return withLocateUtils<Luau.ReturnStatement>({
			type: "AstStatReturn",
			list,
		});
	},
	assign(left: Luau.Expression, right: Luau.Expression) {
		return withLocateUtils<Luau.AssignStatement>({
			type: "AstStatAssign",
			vars: [left],
			values: [right],
		});
	},
	tuple(...items: Luau.Expression[]) {
		return withLocateUtils<Luau.TableExpression>({
			type: "AstExprTable",
			items: items.map(x => ({
				type: "AstExprTableItem",
				kind: "item",
				value: x,
			})),
		});
	},
};
