import * as v from "valibot";
import type { Luau } from "../luau/ast";

export const ImportInfoSchema = v.object({
	path: v.array(v.string()),
	origin: v.union([v.literal("script"), v.literal("game")]),
	location: v.string() as v.BaseSchema<Luau.Location, Luau.Location, any>,
});

export type ImportInfo = v.InferOutput<typeof ImportInfoSchema>;

export interface Analysis {
	imports: ImportInfo[];
}
