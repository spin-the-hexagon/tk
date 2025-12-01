import { resolveSync } from "bun";
import { join } from "node:path";
import { warn } from "../cli/logger";
import type { Cache } from "../compiler/cache";
import type { CodeFileEntry } from "../compiler/scan-files";
import { TK_VERSION } from "../constants";
import type { Analysis } from "../plugin/analysis";
import type {
	PluginMetadata,
	PluginTransformProps,
	PluginTransformResult,
} from "../plugin/schema";
import { fs } from "../utils/fastfs";

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
			const src = await fs.readText(file.path);
			const transpiler = new Bun.Transpiler({
				loader: "tsx",
			});
			const imports = transpiler.scanImports(src);
			const dependencies: string[] = [];
			for (const imp of imports) {
				try {
					const resolvedPath = resolveSync(
						join(file.path, ".."),
						imp.path,
					);
					dependencies.push(resolvedPath);
				} catch {
					warn(`Failed to resolve ${imp.path} from ${file.path}`);
				}
			}
			return {
				imports: dependencies.map((x) => ({
					type: "absolute-path",
					path: x,
				})),
			};
		},
		transform(props: PluginTransformProps): Promise<PluginTransformResult> {
			throw new Error("Typescript transpilation is not a thing yet.");
		},
	};
}
