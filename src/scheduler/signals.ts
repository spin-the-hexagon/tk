import { schedulePromise, type SchedulerPhase } from "./scheduler";

export interface Signal<T> {
	valueInternal: Promise<T>;
	hook(callback: () => void): DirtyHook;
	markDirty(): void;
}

export interface Value<T> extends Signal<T> {
	set(next: T): void;
}

export interface DirtyHook {
	close(): void;
	onDirty(): void;
}

export function value<T>(initial: T): Value<T> {
	let hooks: DirtyHook[] = [];

	return {
		valueInternal: Promise.resolve(initial),
		set(next) {
			this.valueInternal = Promise.resolve(next);
		},
		markDirty() {
			for (const hook of hooks) {
				hook.onDirty();
			}
		},
		hook(callback) {
			const hook: DirtyHook = {
				onDirty: callback,
				close() {
					hooks = hooks.filter(x => x !== hook);
				},
			};
			return hook;
		},
	};
}

export interface SignalGetter {
	<T>(signal: Signal<T>): Promise<T>;
}

export function derived<Output>(
	name: string,
	phase: SchedulerPhase,
	evaluate: (getter: SignalGetter) => Output | Promise<Output>,
): Signal<Output> {
	let hooks: DirtyHook[] = [];
	let dependencies: [DirtyHook, Signal<any>][] = [];
	let isDirty = true;

	let value: Promise<Output> = new Promise(() => {});

	const signal: Signal<Output> = {
		hook(onDirty) {
			const hook: DirtyHook = {
				onDirty,
				close() {
					hooks = hooks.filter(x => x !== hook);
				},
			};
			return hook;
		},
		markDirty() {
			isDirty = true;
			for (const hook of hooks) {
				hook.onDirty();
			}
		},
		get valueInternal() {
			if (isDirty) {
				update();
				isDirty = false;
			}
			return value;
		},
	};

	function update() {
		const evaluator = schedulePromise({
			name,
			phase,
			impl: async () => {
				return await evaluate(async sig => {
					if (dependencies.some(([_, s]) => s === sig)) return sig.valueInternal;

					const hook = sig.hook(signal.markDirty);

					dependencies.push([hook, sig]);

					return sig.valueInternal;
				});
			},
		});

		value = Promise.resolve(evaluator);
	}

	return signal;
}

export function waitForValue<T>(signal: Signal<T>) {
	return signal.valueInternal;
}
