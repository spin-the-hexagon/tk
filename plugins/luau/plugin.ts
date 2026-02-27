import type { PluginMetadata } from "@core/plugin/schema";

import { TK_VERSION } from "@core/constants";
import { fs } from "@core/utils/fastfs";

import { analyzeImports } from "./analysis";
import { parseLuauDocument } from "./parser";

export function pluginLuau(): PluginMetadata {
	return {
		name: "Luau",
		id: "luau",
		version: TK_VERSION,
		fileFormats: [
			{
				type: "code",
				extension: ".client.lua",
				mode: "client",
			},
			{
				type: "code",
				extension: ".server.lua",
				mode: "server",
			},
			{
				type: "code",
				extension: ".lua",
				mode: "module",
			},
			{
				type: "code",
				extension: ".client.luau",
				mode: "client",
			},
			{
				type: "code",
				extension: ".server.luau",
				mode: "server",
			},
			{
				type: "code",
				extension: ".luau",
				mode: "module",
			},
		],
		async analyze(file, cache) {
			return {
				imports: await analyzeImports(file.forceSrc ?? (await fs.readText(file.path)), file.path, cache),
			};
		},
		async transform(props) {
			return {
				ast: await parseLuauDocument(props.src, props.cache),
			};
		},
	};
}
