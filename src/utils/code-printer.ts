import type { Luau } from "../luau/ast";
import {
	codeStringToRawText,
	createPartialLocationTagFromLuauLocation,
	getLocationTag,
	type CodeString,
	type PartialLocationTag,
} from "./sourcemap";
import { unreachable } from "./unreachable";

export class CodePrinter {
	mode: "lua" | "ts" = "lua";
	segments: CodeString = [];
	nodePrinters: Record<string, NodePrinter<any>> = {};
	sourceFile = "source.lua"; // Required to create proper source tags for Luau printing

	getRawText() {
		return codeStringToRawText(this.segments);
	}

	addIndent() {
		this.segments.push({ type: "indent" });
		const unindent = this.unindent;

		return {
			[Symbol.dispose]() {
				unindent();
			},
		};
	}

	unindent() {
		this.segments.push({ type: "undent" });
	}

	push(str: string) {
		this.segments.push(str);
	}

	semi() {
		this.segments.push({ type: "semi" });
	}

	whitespace() {
		this.segments.push({ type: "whitespace" });
	}

	add(text: string) {
		for (const line of text.split("\n")) {
			this.segments.push({ type: "line" });
			this.push(line);
		}
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
			let result = "";
			const quote = '"';

			result += quote;

			result += this.escapeLuaStringBody(str);

			result += quote;

			return result;
		}
		unreachable(this.mode);
	}

	escapeLuaStringBody(str: string): string {
		let result = "";
		const validChars =
			"1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ~!@%^&*()_+-=`{}|[]\\;':\",./<>? ";

		for (const char of str) {
			if (!validChars.includes(char)) {
				result += `\\x${char.charCodeAt(0).toString(16).padStart(2, "0")}`;
			} else if (char === '"' || char === "`" || char === "\\") {
				result += `\\${char}`;
			} else {
				result += char;
			}
		}
		return result;
	}

	printNode(node: { type: string }) {
		const printer = this.nodePrinters[node.type];

		if (!printer) {
			throw new Error(
				`No printer found for node type ${node.type}. This is a bug in TK. Node looks like: ${JSON.stringify(node)}`,
			);
		}

		let startTag: PartialLocationTag | undefined;
		let endTag: PartialLocationTag | undefined;

		if ("location" in node && typeof node.location === "string") {
			const luauLocation = node.location as Luau.Location;
			let [nStartTag, nEndTag] = createPartialLocationTagFromLuauLocation(luauLocation, this.sourceFile);
			startTag = nStartTag;
			endTag = nEndTag;
		}

		if (startTag) this.locate(startTag);
		printer.print(this, node);
		if (endTag) this.locate(endTag);
	}

	locate(tag: PartialLocationTag) {
		this.segments.push(getLocationTag(tag));
	}

	integratePrinters<NodeType extends { type: string }>(props: {
		[key in NodeType["type"]]: NodePrinter<NodeType & { type: key }>;
	}) {
		for (const typ in props) {
			this.nodePrinters[typ] = (props as any)[typ];
		}
	}

	newline() {
		this.segments.push({ type: "line" });
	}
}

export interface NodePrinter<T> {
	print(cp: CodePrinter, node: T): void;
}

export type NodePrinterSegment<T> =
	| (string & {})
	| `@${KeysOfType<T, { type: string } | undefined> & string}`
	| `${"comma" | "semi" | "lines"}:${KeysOfType<T, { type: string }[]> & string}`
	| `$${KeysOfType<T, string> & string}`
	| "!"
	| "'indent"
	| "'undent"
	| "'line"
	| NodePrinter<T>;

export type KeysOfType<T, KeyType> = {
	[K in keyof T]: T[K] extends KeyType ? K : never;
}[keyof T];

export function printer<Node>(...segments: NodePrinterSegment<Node>[]): NodePrinter<Node> {
	return {
		print(cp, node) {
			for (const segment of segments) {
				if (typeof segment === "object" && "print" in segment) {
					segment.print(cp, node);
				} else if (segment === "!") {
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
						throw new Error(`Node child is not a string. This is a bug in tk.`);
					}

					cp.push(child);
				} else if (
					segment.startsWith("comma:") ||
					segment.startsWith("semi:") ||
					segment.startsWith("lines:")
				) {
					const preface = segment.split(":")[0]!;
					const rest = segment.slice(preface.length + 1) as keyof Node & string;
					const joiner =
						preface === "comma" ? "," : preface === "semi" ? ";" : preface === "lines" ? "\n" : "";
					const children = node[rest] as any;

					let writeJoiner = false;
					for (const child of children) {
						if (writeJoiner) {
							if (joiner === ";") {
								cp.semi();
							} else if (joiner !== "\n") {
								cp.push(joiner);
							}

							if (joiner === "\n" || joiner === ";") {
								cp.newline();
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

export function when<Node>(
	condition: ((node: Node) => boolean) | (KeysOfType<Node, boolean> & string),
	...segments: NodePrinterSegment<Node>[]
): NodePrinter<Node> {
	const core = printer(...segments);

	return {
		print(cp, node) {
			if (typeof condition === "string" ? node[condition] : condition(node)) {
				core.print(cp, node);
			}
		},
	};
}

export function subref<Node, Subkey extends KeysOfType<Node, { type: string }> & string>(
	subnode: Subkey,
	...segments: NodePrinterSegment<Node[Subkey]>[]
): NodePrinter<Node> {
	const core = printer(...segments);

	return {
		print(cp, node) {
			core.print(cp, node[subnode]!);
		},
	};
}

export function hotpatch<Node>(callback: (node: Node) => void): NodePrinter<Node> {
	return {
		print(cp, node) {
			callback(node);
		},
	};
}
