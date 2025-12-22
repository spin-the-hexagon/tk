import chalk, { type ChalkInstance } from "chalk";
import { type SchedulerBlock, getSchedulerPhaseColor, getSchedulerPhaseOrdinal } from "../scheduler/scheduler";
import { getTerminalWidth } from "../utils/get-width";

let lastLineWritten: undefined | string = undefined;

export function showSchedulerBlockState(block: SchedulerBlock) {
	const completedTasks = block.tasks.filter(x => x.done).length;
	const activeTasks = block.tasks.filter(x => x.hasBegun && !x.done).length;
	const totalTasks = block.tasks.length;
	const progress = completedTasks / totalTasks;
	const task = block.tasks
		.filter(x => !x.done)
		.toSorted((a, b) => getSchedulerPhaseOrdinal(a.phase) - getSchedulerPhaseOrdinal(b.phase))[0];

	if (!task) {
		showBlockCompletedLine(block);
		return;
	}

	const rightStr = `${completedTasks}/${activeTasks}/${totalTasks}`;

	const phase = task.phase;

	const width = getTerminalWidth();

	let text = ` + ${task.name} (${task.phase})`;

	text += " ".repeat(Math.max(width - text.length - rightStr.length, 0));

	text += rightStr;

	const characters = Math.round(text.length * progress);

	text = chalk.inverse(text.slice(0, characters)) + text.slice(characters);

	text = getSchedulerPhaseColor(task.phase)(text);

	Bun.stdout.write(`${lastLineWritten === "scheduler_block" ? "\r" : ""}${text}`);

	lastLineWritten = "scheduler_block";
}

export function showBlockCompletedLine(block: SchedulerBlock) {
	let text = "";

	text += ` * Executed `;
	text += chalk.italic(block.tasks.length);
	text += ` tasks in `;
	text += chalk.italic(Math.round(performance.now() - block.begun));
	text += `ms (`;
	text += chalk.italic(((performance.now() - block.begun) / 1000).toFixed(2));
	text += ` seconds)`;

	if (block.failed) {
		text += ` (FAILED)`;
	}

	const width = getTerminalWidth();

	while (Bun.stringWidth(text) < width) text += " ";

	if (block.failed) {
		text = chalk.inverse.red(text);
	} else {
		text = chalk.inverse.green(text);
	}

	Bun.stdout.write(`${lastLineWritten === "scheduler_block" ? "\r" : ""}${text}`);

	lastLineWritten = "completion";
}

export function logger(type: string, color: ChalkInstance) {
	return function (...args: any[]) {
		const formatted = args.map(x => (typeof x === "string" ? x : Bun.inspect(x, { colors: true }))).join(" ");
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
export const info = logger("info", chalk.green);
export const nfError = logger("error", chalk.red);
