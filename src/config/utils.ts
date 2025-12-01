import * as v from "valibot";
import type { Config, ExperimentalFlagSchema } from "./schema";

export function isExperimentEnabled(
	config: Config,
	experiment: v.InferOutput<typeof ExperimentalFlagSchema>,
) {
	return config?.experimental?.[experiment] ?? false;
}
