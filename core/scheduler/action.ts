import type { Cache } from "../compiler/cache";

import { schedulePromise, type SchedulerPhase } from "./scheduler";

export async function action<PromiseType, ArgsType extends unknown[]>(props: {
	name: string;
	id: string;
	description: string;
	args: ArgsType;
	cache?: Cache;
	forceCache?: boolean;
	impl(...args: ArgsType): Promise<PromiseType>;
	phase: SchedulerPhase;
}): Promise<PromiseType> {
	const argsHash = Bun.hash(
		JSON.stringify({
			args: props.args,
			id: props.id,
		}),
	).toString(36);

	if (props.cache && (props.cache.enabled || props.forceCache)) {
		const result = props.cache.fastCache[argsHash];

		if (result) {
			return JSON.parse(result);
		}
	}

	return await schedulePromise({
		name: props.name,
		phase: props.phase,
		description: props.description,
		async impl() {
			const result = await props.impl(...props.args);
			if (props.cache) {
				props.cache.fastCache[argsHash] = JSON.stringify(result);
				props.cache.isDirty = true;
			}
			return result;
		},
		typeId: props.id,
	});
}
