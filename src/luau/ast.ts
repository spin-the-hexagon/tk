export namespace Luau {
	export interface Document {
		root: BlockStatement;
		commentLocations: Comment[];
	}

	export interface Comment {
		type: "Comment" | "BlockComment";
		location?: Location;
	}

	export type Location = `${number},${number} - ${number},${number}`;

	export type Statement =
		| BlockStatement
		| LocalStatement
		| IfStatement
		| LocalFunctionStatement
		| ForInStatement
		| ForStatement
		| ExpressionStatement
		| AssignStatement
		| ContinueStatement
		| WhileStatement
		| ReturnStatement
		| FunctionStatement
		| InlineStatement
		| TypeAliasStatement
		| CompoundAssignStatement
		| BreakStatement
		| RepeatStatement;

	export type Expression =
		| IndexNameExpression
		| GlobalExpression
		| CallExpression
		| FunctionExpression
		| LocalExpression
		| TableExpression
		| UnaryExpression
		| IndexExpressionExpression
		| BinaryExpression
		| ConstantStringExpression
		| ConstantBooleanExpression
		| ConstantNilExpression
		| ConstantNumberExpression
		| VarargsExpression
		| IfElseExpression
		| TypeAssertionExpression
		| GroupExpression
		| InterpolatedStringExpression;

	export interface InterpolatedStringExpression {
		type: "AstExprInterpString";
		strings: string[];
		expressions: Expression[];
	}

	export interface BreakStatement {
		type: "AstStatBreak";
		location?: Location;
	}

	export interface RepeatStatement {
		type: "AstStatRepeat";
		condition: Expression;
		body: BlockStatement;
	}

	export interface CompoundAssignStatement {
		type: "AstStatCompoundAssign";
		var: Expression;
		value: Expression;
		op: BinaryOp;
		location?: Location;
	}

	export interface GroupExpression {
		type: "AstExprGroup";
		expr: Expression;
	}

	export interface TypeAssertionExpression {
		type: "AstExprTypeAssertion";
		expr: Expression;
		annotation: Type;
	}

	export interface InlineStatement {
		// Spec break, just makes some things easier
		type: "AstStatInline";
		body: Statement[];
	}

	export interface BlockStatement {
		type: "AstStatBlock";
		location?: Location;
		hasEnd: boolean;
		hasDo?: boolean; // SPEC BREAK: Exists to make block recursive printing work
		body: Statement[];
	}

	export interface LocalStatement {
		type: "AstStatLocal";
		location?: Location;
		vars: Local[];
		values: Expression[];
	}

	export interface Local {
		type: "AstLocal";
		name: string;
		location?: Location;
		luauType?: Type | null;
	}

	export interface IndexNameExpression {
		type: "AstExprIndexName";
		location?: Location;
		index: string;
		indexLocation?: Location;
		op: "." | ":";
		expr: Expression;
	}

	export interface GlobalExpression {
		type: "AstExprGlobal";
		location?: Location;
		global: string;
	}

	export interface CallExpression {
		type: "AstExprCall";
		location?: Location;
		self: boolean;
		argLocation?: Location;
		func: Expression;
		args: Expression[];
	}

	export interface FunctionExpression {
		type: "AstExprFunction";
		location?: Location;
		self?: Local;
		attributes: unknown[];
		generics: unknown[];
		genericPacks: unknown[];
		args: Local[];
		vararg: boolean;
		varargLocation?: Location;
		varargAnnotation?: Type;
		functionDepth: number;
		debugname: string;
		body: BlockStatement;
	}

	export interface IfStatement {
		type: "AstStatIf";
		location?: Location;
		hasIf?: boolean; // SPEC BREAK: a thing that only exists for printer
		hasThen: boolean;
		condition: Expression;
		thenbody: BlockStatement;
		elsebody?: Statement;
	}

	export interface LocalExpression {
		type: "AstExprLocal";
		location?: Location;
		local: Local;
	}

	export interface IfElseExpression {
		type: "AstExprIfElse";
		condition: Expression;
		hasThen: boolean;
		trueExpr: Expression;
		hasElse: boolean;
		falseExpr: Expression;
		location?: Location;
	}

	export interface LocalFunctionStatement {
		type: "AstStatLocalFunction";
		location?: Location;
		name: Local;
		func: FunctionExpression;
	}

	export interface TableExpression {
		type: "AstExprTable";
		location?: Location;
		items: TableItem[];
	}
	export interface ForInStatement {
		type: "AstStatForIn";
		location?: Location;
		hasIn: boolean;
		hasDo: boolean;
		vars: Local[];
		values: Expression[];
		body: BlockStatement;
	}
	export interface ForStatement {
		type: "AstStatFor";
		location?: Location;
		var: Local;
		from: Expression;
		to: Expression;
		step?: Expression;
		body: BlockStatement;
		hasDo: boolean;
	}

	export interface UnaryExpression {
		type: "AstExprUnary";
		location?: Location;
		op: "Not" | "Len" | "Minus";
		expr: Expression;
	}

	export type TableItem =
		| {
				type: "AstExprTableItem";
				kind: "record" | "general";
				key: Expression;
				value: Expression;
		  }
		| {
				type: "AstExprTableItem";
				kind: "item";
				value: Expression;
		  };

	export interface ExpressionStatement {
		type: "AstStatExpr";
		location?: Location;
		expr: Expression;
	}

	export interface TypeAliasStatement {
		type: "AstStatTypeAlias";
		name: string;
		nameLocation?: Location;
		location?: Location;
	}

	export interface IndexExpressionExpression {
		type: "AstExprIndexExpr";
		location?: Location;
		expr: Expression;
		index: Expression;
	}

	export interface AssignStatement {
		type: "AstStatAssign";
		location?: Location;
		vars: Expression[];
		values: Expression[];
	}

	export interface BinaryExpression {
		type: "AstExprBinary";
		location?: Location;
		op: BinaryOp;
		left: Expression;
		right: Expression;
	}

	export type BinaryOp =
		| "CompareEq"
		| "CompareNe"
		| "Or"
		| "And"
		| "Concat"
		| "Add"
		| "CompareGe"
		| "CompareLe"
		| "CompareGt"
		| "CompareLt"
		| "Sub"
		| "Div"
		| "Mul"
		| "Mod"
		| "Pow";

	export interface ContinueStatement {
		type: "AstStatContinue";
		location?: Location;
	}

	export interface WhileStatement {
		type: "AstStatWhile";
		location?: Location;
		hasDo: boolean;
		condition: Expression;
		body: BlockStatement;
	}

	export interface ConstantStringExpression {
		type: "AstExprConstantString";
		value: string;
		location?: Location;
	}

	export interface ConstantBooleanExpression {
		type: "AstExprConstantBool";
		value: boolean;
		location?: Location;
	}

	export interface ConstantNumberExpression {
		type: "AstExprConstantNumber";
		value: number;
		location?: Location;
	}

	export interface ConstantNilExpression {
		type: "AstExprConstantNil";
		location?: Location;
	}

	export interface ReturnStatement {
		type: "AstStatReturn";
		location?: Location;
		list: Expression[];
	}

	export interface FunctionStatement {
		type: "AstStatFunction";
		location?: Location;
		name: Expression;
		func: FunctionExpression;
	}

	export interface VarargsExpression {
		type: "AstExprVarargs";
		location?: Location;
	}

	export type Type = PackVariadicType | ReferenceType;

	export interface PackVariadicType {
		type: "AstTypePackVariadic";
		location?: Location;
		variadicType: Type;
	}

	export interface ReferenceType {
		type: "AstTypeReference";
		location?: Location;
		name: string;
		nameLocation?: Location;
		parameters: Type[];
	}

	export type Node = Expression | Statement | Type | Local | TableItem;
}
