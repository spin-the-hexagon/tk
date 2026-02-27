import chalk, { type ChalkInstance } from "chalk";

import { currentTasks, startReactApp, status, store } from "../ui/react";
import { unreachable } from "../utils/unreachable";

export interface SchedulerBlock {
	tasks: SchedulerTask[];
	add(task: SchedulerTask): void;
	process(): Promise<void>;
	failed?: any;
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
	typeId: string;
	done: boolean;
	timeTaken: number;
	description: string;
}

export type SchedulerPhase = "download" | "index" | "parse" | "mark" | "build" | "commit";

export function getSchedulerPhaseOrdinal(s: SchedulerPhase): number {
	if (s === "download") {
		return 0;
	} else if (s === "index") {
		return 1;
	} else if (s === "parse") {
		return 2;
	} else if (s === "mark") {
		return 3;
	} else if (s === "build") {
		return 4;
	} else if (s === "commit") {
		return 5;
	}

	unreachable(s);
}

export function getSchedulerPhaseColor(s: SchedulerPhase): ChalkInstance {
	if (s === "build") {
		return chalk.blue;
	} else if (s === "commit") {
		return chalk.green;
	} else if (s === "mark") {
		return chalk.magenta;
	} else if (s === "index") {
		return chalk.yellow;
	} else if (s === "parse") {
		return chalk.red;
	} else if (s === "download") {
		return chalk.yellow;
	}

	unreachable(s);
}

export function getSchedulerPhaseText(s: SchedulerPhase): string {
	if (s === "build") {
		return "build";
	} else if (s === "commit") {
		return "commit";
	} else if (s === "mark") {
		return "mark";
	} else if (s === "index") {
		return "index";
	} else if (s === "parse") {
		return "parse";
	} else if (s === "download") {
		return "download";
	}

	unreachable(s);
}

export function block(): SchedulerBlock {
	return {
		begun: 0,
		tasks: [],
		async process() {
			pushSchedulerBlockStatus(this);

			outer: while (true) {
				const tasks = this.tasks
					.filter(x => !x.done)
					.toSorted((a, b) => getSchedulerPhaseOrdinal(a.phase) - getSchedulerPhaseOrdinal(b.phase));

				if (this.begun === 0) {
					this.begun = performance.now();
				}

				for (let i = 0; tasks.length === 0; i++) {
					if (i > 3) {
						break outer;
					}
					await wait();
				}

				for (const task of tasks) {
					if (task.hasBegun) continue;

					const start = Date.now();
					const result = task.exec();

					result.then(x => {
						task.done = true;
						task.timeTaken = Date.now() - start;
					});

					task.hasBegun = true;
					break;
				}

				store.set(currentTasks, [...tasks]);

				await waitForEventLoop();
			}

			this.done = true;
			pushSchedulerBlockStatus(this);
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
	startReactApp();
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
	typeId,
	description,
}: {
	name: string;
	phase: SchedulerPhase;
	typeId: string;
	impl: () => Promise<T>;
	description: string;
}): Promise<T> {
	const { promise, resolve, reject } = Promise.withResolvers<T>();

	queue({
		name,
		phase,
		timeTaken: 0,
		typeId,
		exec: async () => {
			try {
				resolve(await impl());
			} catch (err) {
				reject(err);
			}
		},
		description,
	});

	return promise;
}

export function pushSchedulerBlockStatus(block: SchedulerBlock) {
	if (block.failed) {
		store.set(status, ["error", block.failed]);
	} else if (block.done) {
		store.set(status, "success");
	} else {
		store.set(status, "pending");
	}
}
