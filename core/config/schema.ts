import * as v from "valibot";

export const PortalSchema = v.object({
	roblox: v.pipe(v.string(), v.regex(/game\..*/)),
	project: v.string(),
	external: v.optional(v.boolean()),
});

export const ExperimentalFlagSchema = v.union([
	v.literal("typescript"),
	v.literal("profiling"),
	v.literal("rbxmx"),
	v.literal("models"),
	v.literal("media"),
]);

export const GameSchema = v.object({
	type: v.optional(v.literal("game")),
});

export const PluginSchema = v.object({
	type: v.literal("plugin"),
	entry: v.string(),
});

export const ConfigSchema = v.intersect([
	v.object({
		name: v.string(),
		version: v.literal(0),
		experimental: v.optional(v.record(ExperimentalFlagSchema, v.boolean())),
		portals: v.array(PortalSchema),
	}),
	v.union([PluginSchema, GameSchema]),
]);

export type Config = v.InferOutput<typeof ConfigSchema>;

export type Portal = v.InferOutput<typeof PortalSchema>;
