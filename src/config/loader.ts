import chalk from "chalk";
import { resolve } from "path";
import TOML from "smol-toml";
import * as v from "valibot";

import { createPrinter, type Printer } from "../cli/printer";
import { ConfigSchema, type Config } from "./schema";

function formatColonMessage(message: string) {
	if (!message.includes(":")) {
		return message;
	}

	const focal = message.split(":").at(-1) as string;
	const nonFocal = message.slice(0, -focal.length);

	return chalk.italic.gray(nonFocal) + chalk.bold.red(focal);
}

function formatValibotError(issue: v.BaseIssue<any>, printer: Printer, starterPath: string = "") {
	let path = starterPath;

	for (const segment of issue.path ?? []) {
		if (segment.type === "object") {
			path += `.${segment.key}`;
		} else if (segment.type === "array") {
			path += `[${segment.key}]`;
		} else {
			path += `.{unknown}`;
		}
	}

	printer.write(chalk.cyan(path));
	printer.indent();
	printer.write(formatColonMessage(issue.message));
	if (issue.issues) {
		for (const sub of issue.issues) {
			printer.gap();
			formatValibotError(sub, printer, path);
		}
	}

	printer.dedent();
}

export async function loadConfig(configPath: string): Promise<Config | null> {
	const absolutePath = resolve(configPath);

	// Check if file exists
	if (!(await Bun.file(absolutePath).exists())) {
		console.error(chalk.red.bold("Configuration file not found"), "\n", chalk.gray(`  Path: ${absolutePath}`));
		process.exit(1);
	}

	const fileContent = await Bun.file(absolutePath).text();
	let parsedToml;

	try {
		parsedToml = TOML.parse(fileContent);
	} catch {
		const printer = createPrinter();

		printer.gap();
		printer.indent();
		printer.write(chalk.red("Failed to parse config file"));
		printer.gap();
		printer.write("There was a TOML syntax error");
		printer.gap();

		console.log(printer.text);

		return null;
	}

	const result = v.safeParse(ConfigSchema, parsedToml);

	if (result.issues) {
		const printer = createPrinter();

		printer.gap();
		printer.indent();
		printer.write(chalk.red("Failed to parse config file"));

		for (const issue of result.issues) {
			printer.gap();
			formatValibotError(issue, printer);
		}

		printer.gap();

		console.log(printer.text);

		return null;
	}

	return result.output;
}
