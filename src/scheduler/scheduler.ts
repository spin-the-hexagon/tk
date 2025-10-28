import chalk from "chalk";
import { getTerminalWidth } from "../utils/get-width";
import { unreachable } from "../utils/unreachable";

export interface SchedulerBlock {
	tasks: SchedulerTask[];
	add(task: SchedulerTask): void;
	process(): Promise<void>;
	done: boolean;
	begun: number;
}

export function wait(ms = 10) {
	const { promise, resolve } = Promise.withResolvers();

	setTimeout(resolve, ms);

	return promise;
}

export function waitForEventLoop() {
	const { promise, resolve } = Promise.withResolvers();

	setImmediate(resolve);

	return promise;
}

const scheduler = {
	currentBlock: block(),
};

export interface SchedulerTask {
	exec(): Promise<void>;
	hasBegun: boolean;
	name: string;
	phase: SchedulerPhase;
	done: boolean;
}

export type SchedulerPhase = "index" | "parse" | "mark" | "build" | "commit";

export function getSchedulerPhaseOrdinal(s: SchedulerPhase): number {
	if (s === "index") {
		return 0;
	} else if (s === "parse") {
		return 1;
	} else if (s === "mark") {
		return 2;
	} else if (s === "build") {
		return 3;
	} else if (s === "commit") {
		return 4;
	}

	unreachable(s);
}

export function getSchedulerPhaseText(s: SchedulerPhase): string {
	if (s === "build") {
		return chalk.blue("build");
	} else if (s === "commit") {
		return chalk.green("commit");
	} else if (s === "mark") {
		return chalk.magenta("mark");
	} else if (s === "index") {
		return chalk.yellow("index");
	} else if (s === "parse") {
		return chalk.red("parse");
	}

	unreachable(s);
}

export function block(): SchedulerBlock {
	return {
		begun: performance.now(),
		tasks: [],
		async process() {
			let lastUpdateTime = 0;

			while (true) {
				const tasks = this.tasks
					.filter((x) => !x.done)
					.toSorted(
						(a, b) =>
							getSchedulerPhaseOrdinal(a.phase) -
							getSchedulerPhaseOrdinal(b.phase),
					);

				if (tasks.length === 0) break;

				let minPhase = tasks[0]!.phase;

				for (const task of tasks) {
					if (task.hasBegun) continue;
					if (task.phase !== minPhase) continue;

					const result = task.exec();

					result.then((x) => {
						task.done = true;
					});

					task.hasBegun = true;
					break;
				}

				const now = performance.now();

				if (now > lastUpdateTime + 10) {
					showSchedulerBlockState(this);
					lastUpdateTime = now;
				}

				await waitForEventLoop();
			}
			this.done = true;
			showBlockCompletedLine(this);
			scheduler.currentBlock = block();
		},
		done: false,
		add(task) {
			this.tasks.push(task);
			if (this.done) {
				throw new Error("Attempted to add task to completed chunk");
			}
		},
	};
}

export async function startRunLoop() {
	while (true) {
		await waitForEventLoop();
		const block = getCurrentBlock();
		if (block.tasks.length > 0) {
			block.process();
		}
	}
}

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

	Bun.stdout.write(`\r${text}`);
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

export type InputSchedulerTask = Omit<SchedulerTask, "done" | "hasBegun">;

export function queue(task: InputSchedulerTask) {
	scheduler.currentBlock.add({
		...task,
		done: false,
		hasBegun: false,
	});
}

export function getCurrentBlock() {
	return scheduler.currentBlock;
}

export function beginNewBlock() {
	scheduler.currentBlock = block();
}

export function schedulePromise<T>({
	name,
	phase,
	impl,
}: {
	name: string;
	phase: SchedulerPhase;
	impl: () => Promise<T>;
}): Promise<T> {
	const { promise, resolve, reject } = Promise.withResolvers<T>();

	queue({
		name,
		phase,
		exec: async () => {
			try {
				resolve(await impl());
			} catch (err) {
				reject(err);
			}
		},
	});

	return promise;
}
