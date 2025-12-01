import * as v from "valibot";
import type { Cache } from "../compiler/cache";
import type { CodeFileEntry } from "../compiler/scan-files";
import type { Luau } from "../luau/ast";
import type { Analysis } from "./analysis";

export const PluginFileIdentificationSchema = v.union([
	v.literal("module"),
	v.literal("client"),
	v.literal("server"),
]);

export const PluginCodeFormatSchema = v.object({
	type: v.literal("code"),
	extension: v.string(),
	mode: PluginFileIdentificationSchema,
});

export const PluginFileFormatSchema = v.union([PluginCodeFormatSchema]);

export interface PluginTransformProps {
	src: string;
	path: string;
	pathDatamodel: string[];
	cache: Cache;
}

export interface PluginTransformResult {
	ast: Luau.Document;
}

export const PluginMetadataSchema = v.object({
	name: v.string(),
	id: v.string(),
	version: v.number(),
	fileFormats: v.array(PluginFileFormatSchema),
	analyze: v.custom<(file: CodeFileEntry, cache: Cache) => Promise<Analysis>>(
		(x) => true,
	),
	transform: v.custom<
		(props: PluginTransformProps) => Promise<PluginTransformResult>
	>((x) => true),
});

export type PluginMetadata = v.InferOutput<typeof PluginMetadataSchema>;

export function findPlugin(plugins: PluginMetadata[], pluginId: string) {
	const plug = plugins.find((x) => x.id === pluginId);

	if (plug) return plug;

	throw new Error(`Failed to find plugin ${pluginId}. This is a bug in TK`);
}
