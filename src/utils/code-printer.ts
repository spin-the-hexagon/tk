import { unreachable } from "./unreachable";

export type TextSegment =
	| string
	| {
			type: "location";
			line: number;
			col: number;
	  };

export function isAlphanumeric(char: string) {
	return (
		(char >= "a" && char <= "z") ||
		(char >= "A" && char <= "Z") ||
		(char >= "0" && char <= "9")
	);
}

export class CodePrinter {
	mode: "lua" | "ts" = "lua";
	indent = 0;
	segments: TextSegment[] = [];
	gapWasJustWritten = false;
	whitespaceWasJustWritten = false;
	nodePrinters: Record<string, NodePrinter<any>> = {};

	get text() {
		return this.segments.filter((x) => typeof x === "string").join("");
	}

	addIndent() {
		this.indent++;
		const unindent = this.unindent;

		return {
			[Symbol.dispose]() {
				unindent();
			},
		};
	}

	unindent() {
		this.indent--;
	}

	push(text: string) {
		if (
			isAlphanumeric(text[0]!) &&
			isAlphanumeric(
				[
					...this.segments
						.filter((x) => typeof x === "string")
						.join(""),
				].at(-1)!,
			)
		) {
			this.segments.push(" ");
		}
		this.segments.push(text);
		this.gapWasJustWritten = false;
		this.whitespaceWasJustWritten = false;
	}

	add(text: string) {
		const indentation = "   ".repeat(this.indent);

		for (const line of text.split("\n")) {
			this.segments.push(`${indentation}${line}\n`);
		}

		this.gapWasJustWritten = false;
		this.whitespaceWasJustWritten = false;
	}

	gap() {
		if (this.gapWasJustWritten) return;

		this.gapWasJustWritten = true;
		this.whitespaceWasJustWritten = true;

		this.segments.push("\n");
	}

	whitespace() {
		if (this.whitespaceWasJustWritten) return;
		this.whitespaceWasJustWritten = true;
		this.segments.push(" ");
	}

	comment(...text: string[]) {
		const prefix = this.mode === "lua" ? "--" : "//";

		for (const line of text.join("\n").split("\n")) {
			this.add(`${prefix} ${line}`);
		}
	}

	escapeString(str: string): string {
		if (this.mode == "ts") {
			return JSON.stringify(str);
		}
		if (this.mode === "lua") {
			return JSON.stringify(str); // FIXME: this is probably a bad idea, but shush :3
		}
		unreachable(this.mode);
	}

	printNode(node: { type: string }) {
		const printer = this.nodePrinters[node.type];

		if (!printer) {
			throw new Error(
				`No printer found for node type ${node.type}. This is a bug in TK.`,
			);
		}

		printer.print(this, node);
	}

	integratePrinters<NodeType extends { type: string }>(props: {
		[key in NodeType["type"]]: NodePrinter<NodeType & { type: key }>;
	}) {
		for (const typ in props) {
			this.nodePrinters[typ] = (props as any)[typ];
		}
	}

	newline() {
		this.push("\n");
		const indentation = "   ".repeat(this.indent);
		this.push(indentation);
	}
}

export interface NodePrinter<T> {
	print(cp: CodePrinter, node: T): void;
}

export type NodePrinterSegment<T> =
	| (string & {})
	| `@${KeysOfType<T, { type: string } | undefined> & string}`
	| `${"comma" | "semi"}:${KeysOfType<T, { type: string }[]> & string}`
	| `$${KeysOfType<T, string> & string}`
	| "!"
	| "'indent"
	| "'undent"
	| "'line";

export type KeysOfType<T, KeyType> = {
	[K in keyof T]: T[K] extends KeyType ? K : never;
}[keyof T];

export function printer<Node>(
	...segments: NodePrinterSegment<Node>[]
): NodePrinter<Node> {
	return {
		print(cp, node) {
			for (const segment of segments) {
				if (segment === "!") {
					cp.whitespace();
				} else if (segment.startsWith("@")) {
					const rest = segment.slice(1) as keyof Node & string;
					const child = node[rest];

					if (child) {
						cp.printNode(child as unknown as { type: string });
					}
				} else if (segment.startsWith("$")) {
					const rest = segment.slice(1) as keyof Node & string;
					const child = node[rest];

					if (typeof child !== "string") {
						throw new Error(
							`Node child is not a string. This is a bug in tk.`,
						);
					}

					cp.push(child);
				} else if (
					segment.startsWith("comma:") ||
					segment.startsWith("semi:") ||
					segment.startsWith("lines:")
				) {
					const preface = segment.split(":")[0]!;
					const rest = segment.slice(
						preface.length + 1,
					) as keyof Node & string;
					const joiner =
						segment === "comma"
							? ","
							: segment === "semi"
								? ";"
								: segment === "lines"
									? "\n"
									: "";
					const children = node[rest] as any;

					let writeJoiner = false;
					for (const child of children) {
						if (writeJoiner) {
							if (joiner === "\n") {
								cp.newline();
							} else {
								cp.push(joiner);
							}
						}
						writeJoiner = true;
						cp.printNode(child);
					}
				} else if (segment === "'indent") {
					cp.addIndent();
					cp.newline();
				} else if (segment === "'undent") {
					cp.unindent();
					cp.newline();
				} else if (segment === "'line") {
					cp.newline();
				} else {
					cp.push(segment);
				}
			}
		},
	};
}
