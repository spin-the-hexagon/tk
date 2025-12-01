import * as v from "valibot";
import type { Luau } from "../luau/ast";

export const ImportInfoSchema = v.union([
	v.object({
		type: v.literal("classic"),
		path: v.array(v.string()),
		origin: v.union([v.literal("script"), v.literal("game")]),
		location: v.string() as v.BaseSchema<Luau.Location, Luau.Location, any>,
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
