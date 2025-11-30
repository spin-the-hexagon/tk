import chalk, { type ChalkInstance } from "chalk";
import {
	type SchedulerBlock,
	getSchedulerPhaseOrdinal,
	getSchedulerPhaseText,
} from "../scheduler/scheduler";
import { getTerminalWidth } from "../utils/get-width";

let lastLineWritten: undefined | string = undefined;

export function showSchedulerBlockState(block: SchedulerBlock) {
	const completedTasks = block.tasks.filter((x) => x.done).length;
	const totalTasks = block.tasks.length;
	const progress = completedTasks / totalTasks;
	const task = block.tasks
		.filter((x) => !x.done)
		.toSorted(
			(a, b) =>
				getSchedulerPhaseOrdinal(a.phase) -
				getSchedulerPhaseOrdinal(b.phase),
		)[0];
	let rightStr = `${chalk.magenta(completedTasks)}/${totalTasks}`;

	// if (task) {
	// 	rightStr += ` (${task.name})`;
	// }

	const phase = task?.phase ?? "build";

	const leftStr = getSchedulerPhaseText(phase);

	let text = "";

	const width = getTerminalWidth();

	text += leftStr;

	const progressBarWidth = Math.round(width * 0.6);

	while (Bun.stringWidth(text) < width * 0.2) {
		text += " ";
	}

	for (let x = 0; x < progressBarWidth; x++) {
		const progressBarPercent = x / progressBarWidth;

		if (progressBarPercent <= progress) {
			text += chalk.cyan("━");
		} else {
			text += chalk.gray("─");
		}
	}

	while (Bun.stringWidth(text) < width - Bun.stringWidth(rightStr)) {
		text += " ";
	}

	text += rightStr;

	Bun.stdout.write(
		`${lastLineWritten === "scheduler_block" ? "\r" : ""}${text}`,
	);

	lastLineWritten = "scheduler_block";
}

export function showBlockCompletedLine(block: SchedulerBlock) {
	let text = "";

	text += `Executed `;
	text += chalk.magenta(block.tasks.length);
	text += ` tasks in `;
	text += chalk.cyan(Math.round(performance.now() - block.begun));
	text += `ms`;

	const width = getTerminalWidth();

	while (Bun.stringWidth(text) < width) text += " ";

	Bun.stdout.write(`\r${text}`);
}

export function logger(type: string, color: ChalkInstance) {
	return function (...args: any[]) {
		const formatted = args
			.map((x) =>
				typeof x === "string" ? x : Bun.inspect(x, { colors: true }),
			)
			.join(" ");
		let prefix = color(type.padStart(8) + ": ");

		for (const line of formatted.split("\n")) {
			console.log(prefix + line);
			lastLineWritten = "log";
			prefix = " ".repeat(Bun.stringWidth(prefix));
		}
	};
}

export const debug = logger("debug", chalk.blue);
export const warn = logger("warn", chalk.yellow);
