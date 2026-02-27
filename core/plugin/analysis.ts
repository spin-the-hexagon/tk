import type { Luau } from "@plugins/luau/ast";

import * as v from "valibot";

export const ImportInfoSchema = v.union([
	v.object({
		type: v.literal("classic"),
		path: v.array(v.string()),
		origin: v.union([v.literal("script"), v.literal("game")]),
		location: v.optional(v.string()) as v.BaseSchema<Luau.Location | undefined, Luau.Location | undefined, any>,
	}),
	v.object({
		type: v.literal("absolute-path"),
		path: v.string(),
	}),
]);

export type ImportInfo = v.InferOutput<typeof ImportInfoSchema>;

export interface Analysis {
	imports: ImportInfo[];
}
