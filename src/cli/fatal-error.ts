import chalk from "chalk";
import { createPrinter } from "./printer";

export type FatalErrorFact = string | string[];

export interface FatalError {
	what: FatalErrorFact;
	why?: FatalErrorFact;
	hint?: FatalErrorFact;
}

export function getFatalErrorFactInfo(fact: FatalErrorFact | undefined) {
	if (!fact) return [];
	if (Array.isArray(fact)) return fact;
	return [fact];
}

const leftEdge = 12;

function alignLine(left: string, right: string) {
	let text = left;

	while (Bun.stringWidth(text) < leftEdge) {
		text = " " + text;
	}

	const padding = 2;

	text += " ".repeat(padding);

	const lines = right.split("\n");
	const [first, ...rest] = lines;

	if (first) {
		text += first;
	}

	for (const line of rest) {
		text += `\n${" ".repeat(leftEdge + padding)}${line}`;
	}

	return text;
}

export function fatalError(error: FatalError): never {
	const printer = createPrinter();
	printer.gap();
	printer.indent();
	printer.write(alignLine("", chalk.red("a fatal error occurred")));
	for (const what of getFatalErrorFactInfo(error.what)) {
		printer.gap();
		printer.write(alignLine(chalk.yellow("what:"), what));
	}
	for (const why of getFatalErrorFactInfo(error.why)) {
		printer.gap();
		printer.write(alignLine(chalk.magenta("why:"), why));
	}
	for (const hint of getFatalErrorFactInfo(error.hint)) {
		printer.gap();
		printer.write(alignLine(chalk.blue("hint:"), hint));
	}
	printer.dedent();
	printer.gap();
	console.log(printer.text);
	process.exit(1);
}
