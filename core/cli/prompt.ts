import chalk from "chalk";

import { canShowSchedulerUpdates, leadingLength } from "./logger";

export interface PromptProps {
	question: string;
	validate?(str: string): boolean;
	symbol?: string;
}

export async function prompt(props: PromptProps): Promise<string> {
	canShowSchedulerUpdates.value = false;

	function showPrefix() {
		console.log(chalk.blue(" ".repeat(leadingLength) + props.question));
		Bun.stdout.write(chalk.green(`${props.symbol ?? ">>"} `.padStart(leadingLength)));
		Bun.stdout.write("\x07");
	}

	showPrefix();

	const validator = props.validate ?? (it => true);

	for await (const line of console) {
		if (!validator(line)) {
			showPrefix();
		} else {
			canShowSchedulerUpdates.value = true;
			return line;
		}
	}

	process.exit();
}

const yesTerms = ["y", "yes", "yeah", "yep", "allow", "true"];

const noTerms = ["n", "no", "nope", "nah", "deny", "disallow", "false"];

function coreTerm(str: string) {
	return str.trim().toLowerCase();
}

function getYNValue(str: string): boolean | undefined {
	const core = coreTerm(str);

	if (yesTerms.includes(core)) {
		return true;
	}

	if (noTerms.includes(core)) {
		return false;
	}
}

export async function confirm(props: Omit<PromptProps, "validate">) {
	const result = await prompt({
		question: props.question,
		symbol: props.symbol ?? "y/n",
		validate(it) {
			return getYNValue(it) !== undefined;
		},
	});

	return getYNValue(result) ?? false;
}
