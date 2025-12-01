import { resolveSync as bunResolve } from "bun";
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
			const imports = transpiler.scanImports(src); // We're using Bun.Transpiler instead of OXC because Bun-native APIs are faster
			const dependencies: string[] = [];
			for (const imp of imports) {
				dependencies.push(bunResolve(imp.path, file.path));
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
