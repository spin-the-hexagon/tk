import * as v from "valibot";

const PortalSchema = v.object({
	roblox: v.string(),
	project: v.string(),
});

export const ConfigSchema = v.object({
	name: v.string(),
	portals: v.optional(v.array(PortalSchema)),
	version: v.literal(0),
});

export type Config = v.InferOutput<typeof ConfigSchema>;
