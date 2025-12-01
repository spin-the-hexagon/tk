import * as v from "valibot";
import type { Cache } from "../compiler/cache";
import { schedulePromise, type SchedulerPhase } from "./scheduler";

export async function action<PromiseType, ArgsType extends unknown[]>(props: {
	name: string;
	id: string;
	args: ArgsType;
	cache?: Cache;
	impl(...args: ArgsType): Promise<PromiseType>;
	phase: SchedulerPhase;
}): Promise<PromiseType> {
	const argsHash = Bun.hash(JSON.stringify(props.args)).toString(36);

	if (props.cache) {
		const result = props.cache.query(
			v.object({
				type: v.literal(props.id),
				argsHash: v.literal(argsHash),
				result: v.string(),
			}),
		);

		if (result) {
			return JSON.parse(result.result);
		}
	}

	return await schedulePromise({
		name: props.name,
		phase: props.phase,
		async impl() {
			const result = await props.impl(...props.args);
			props.cache?.save({
				type: props.id,
				argsHash,
				result: JSON.stringify(result),
			});
			return result;
		},
	});
}
