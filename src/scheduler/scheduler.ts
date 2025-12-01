import chalk from "chalk";
import { showBlockCompletedLine, showSchedulerBlockState } from "../cli/logger";
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

			outer: while (true) {
				const tasks = this.tasks
					.filter((x) => !x.done)
					.toSorted(
						(a, b) =>
							getSchedulerPhaseOrdinal(a.phase) -
							getSchedulerPhaseOrdinal(b.phase),
					);

				for (let i = 0; tasks.length === 0; i++) {
					if (i > 24) {
						break outer;
					}
					await waitForEventLoop();
				}

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
			beginNewBlock();
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
			await block.process();
		}
	}
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
