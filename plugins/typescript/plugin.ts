import type { Cache } from "@core/compiler/cache";
import type { CodeFileEntry } from "@core/compiler/scan-files";
import type { Analysis } from "@core/plugin/analysis";
import type { PluginMetadata, PluginTransformProps, PluginTransformResult } from "@core/plugin/schema";
import type { Luau } from "@plugins/luau/ast";

import { warn } from "@core/cli/logger";
import { TK_VERSION } from "@core/constants";
import { fs } from "@core/utils/fastfs";
import { lu } from "@plugins/luau/construction-utilities";
import { resolveSync } from "bun";
import { join } from "node:path";
import { parse } from "oxc-parser";

import { TypescriptTranspiler } from "./transpiler";

export function pluginTypescript(): PluginMetadata {
	return {
		name: "TypeScript",
		id: "typescript",
		version: TK_VERSION,
		fileFormats: [
			{
				extension: ".server.ts",
				mode: "server",
				type: "code",
			},
			{
				extension: ".client.ts",
				mode: "client",
				type: "code",
			},
			{
				extension: ".ts",
				mode: "module",
				type: "code",
			},
		],
		async analyze(file: CodeFileEntry, cache: Cache): Promise<Analysis> {
			const src = await fs.readText(file.forceSrc ?? file.path);
			const transpiler = new Bun.Transpiler({
				loader: "tsx",
			});
			const imports = transpiler.scanImports(src);
			const dependencies: string[] = [];
			for (const imp of imports) {
				try {
					const resolvedPath = resolveSync(imp.path, join(file.path, ".."));
					dependencies.push(resolvedPath);
				} catch {
					warn(`Failed to resolve ${imp.path} from ${file.path}`);
				}
			}
			return {
				imports: dependencies.map(x => ({
					type: "absolute-path",
					path: x,
				})),
			};
		},
		async transform(props: PluginTransformProps): Promise<PluginTransformResult> {
			const parsed = await parse(props.path, props.src);
			const program = parsed.program;
			const transpiler = new TypescriptTranspiler();
			const topLevelBlock = lu.block([]);
			using _ab = transpiler.blockContext(topLevelBlock);

			transpiler.addPrelude();

			for (const item of program.body) {
				transpiler.translateStatement(item);
			}

			transpiler.addPostlude();

			const luaDocument: Luau.Document = {
				commentLocations: [],
				root: topLevelBlock,
			};
			return {
				ast: luaDocument,
			};
		},
	};
}
