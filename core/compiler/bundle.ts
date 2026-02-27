import type { Luau } from "@plugins/luau/ast";

import { integrateLuauPrinter } from "@plugins/luau/printer";
import { transpileToTKPack } from "@plugins/luau/tkpack-transpile";
import { typescriptRuntimeLibs } from "@plugins/typescript/runlimelibs/listing";
import { basename } from "node:path";

import type { Cache } from "./cache";

import { warn } from "../cli/logger";
import { findPlugin, type PluginMetadata } from "../plugin/schema";
import { action } from "../scheduler/action";
import { waitForEventLoop } from "../scheduler/scheduler";
import { CodePrinter } from "../utils/code-printer";
import { resolveDataModelPath } from "../utils/datamodel";
import { fs } from "../utils/fastfs";
import { type CodeString } from "../utils/sourcemap";
import { unreachable } from "../utils/unreachable";
import { type CodeFileEntry, type FileEntry } from "./scan-files";
// @ts-ignore
import tkpack from "./tkpack.lib.luau" with { type: "text" };

function printAst(node: Luau.BlockStatement, fileName: string, cache: Cache) {
	return action({
		name: "Print AST",
		description: "Converting my internal representation of your code into text.",
		id: "bundler:print_ast",
		args: [node, fileName] as const,
		phase: "build",
		cache,
		async impl(node, fileName) {
			const cp = new CodePrinter();

			cp.sourceFile = fileName;

			integrateLuauPrinter(cp);

			cp.printNode(node);

			return cp.segments;
		},
	});
}

export class Bundle {
	files: CodeFileEntry[];
	allEntries: FileEntry[];
	plugins: PluginMetadata[];
	cache: Cache;
	entrypoints: CodeFileEntry[];

	constructor(props: {
		plugins: PluginMetadata[];
		cache: Cache;
		allEntries: FileEntry[];
		files: CodeFileEntry[];
		entrypoints: CodeFileEntry[];
	}) {
		this.plugins = props.plugins;
		this.cache = props.cache;
		this.allEntries = props.allEntries;
		this.files = props.files;
		this.entrypoints = props.entrypoints;

		// Add corelibs
		for (const lib in typescriptRuntimeLibs) {
			const src = (typescriptRuntimeLibs as Record<string, string>)[lib]!;

			this.allEntries.push({
				dataModelPath: ["virtual", lib],
				path: `virtual:${lib}`,
				type: "code",
				mode: "module",
				pluginId: "luau",
				forceSrc: src,
			});
		}
	}

	addFilePath(path: string) {
		if (this.files.find(x => x.path === path)) return;

		const entry = this.allEntries.find(x => x.path === path);

		if (entry?.type !== "code") return;

		this.files.push(entry);
	}

	addFileDataModel(dm: string[]) {
		const entry = this.allEntries.find(x => x.dataModelPath.join(".") === dm.join("."));

		if (entry) {
			this.addFilePath(entry.path);
		} else {
			warn(`Couldn't find datamodel ${dm.join(".")}`);
		}
	}

	async sweep() {
		const self = this;
		await action({
			name: "Sweep bundle",
			id: "bundle:sweep",
			description: "Finding what files I need to include in the final version of your code.",
			args: [],
			phase: "mark",
			async impl() {
				let p = 0;

				while (p < self.files.length) {
					const file = self.files[p]!;
					const plugin = findPlugin(self.plugins, file.pluginId);
					const analysis = await plugin.analyze!(file, self.cache);

					for (const imp of analysis.imports) {
						if (imp.type === "classic") {
							let dmPath = [...file.dataModelPath];

							if (imp.origin === "game") {
								dmPath.push("game");
							}

							dmPath.push(...imp.path);

							dmPath = resolveDataModelPath(dmPath);

							self.addFileDataModel(dmPath);
						} else if (imp.type === "absolute-path") {
							self.addFilePath(imp.path);
						} else {
							unreachable(imp);
						}
					}

					p++;
				}
			},
		});
	}

	private async _generateText(): Promise<CodeString> {
		const cp = new CodePrinter();

		cp.comment(
			"bundled with tk (pronounced tick) by 'spin the hexagon'",
			"rights are reserved, but not by us",
			"you can mess around as much as you want, we (STH) don't care, the game devs might.",
			"https://github.com/spin-the-hexagon/tk",
		);

		cp.add(tkpack);

		integrateLuauPrinter(cp);

		const cache = this.cache;

		for (const file of this.files) {
			cp.comment(file.path);
			cp.add(`tkpack.declare(${cp.escapeString(file.dataModelPath.join("."))},function()`);

			// Step 1: Generate lua code with plugin (bleh)
			let src = file.forceSrc ?? (await fs.readText(file.path));

			const plugin = findPlugin(this.plugins, file.pluginId);

			const { ast } = await action({
				name: `Transpile ${basename(file.path)} with ${plugin.id}`,
				id: `${plugin.id}:transpile_to_luau`,
				description: `Turn ${plugin.name} into a form we want`,
				args: [
					{
						path: file.path,
						dataModelPath: file.dataModelPath,
						src,
						version: plugin.version,
					},
				],
				cache,
				phase: "build",
				async impl() {
					return await plugin.transform!({
						path: file.path,
						pathDatamodel: file.dataModelPath,
						src,
						cache,
					});
				},
			});

			// Step 2: Run it through the transpiler to turn require statements into tkpack.import :3
			ast.root = await transpileToTKPack({
				ast,
				cache,
				pathDM: file.dataModelPath,
				files: this.allEntries,
				filePath: file.path,
			});

			cp.segments.push(...(await printAst(ast.root, file.path, this.cache)));

			cp.add("end)");

			await waitForEventLoop();
		}

		for (const entrypoint of this.entrypoints) {
			cp.add(`tkpack.include(${cp.escapeString(entrypoint.dataModelPath.join("."))});`);
		}

		return cp.segments;
	}

	async generateText(): Promise<CodeString> {
		const self = this;
		const str = await action({
			name: "Generate bundle text",
			id: "bundle:generate_text",
			description: "Turning all your files into one script.",
			args: [],
			impl() {
				return self._generateText();
			},
			phase: "build",
		});
		return str;
	}
}
