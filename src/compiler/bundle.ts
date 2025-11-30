import { warn } from "../cli/logger";
import { transpileToTKPack } from "../luau/tkpack-transpile";
import { findPlugin, type PluginMetadata } from "../plugin/schema";
import { CodePrinter } from "../utils/code-printer";
import { resolveDataModelPath } from "../utils/datamodel";
import { fs } from "../utils/fastfs";
import type { Cache } from "./cache";
import { type CodeFileEntry, type FileEntry } from "./scan-files";
// @ts-ignore
import tkpack from "./tkpack.lib.luau" with { type: "text" };

export class Bundle {
	files: CodeFileEntry[];
	allEntries: FileEntry[];
	plugins: PluginMetadata[];
	cache: Cache;

	constructor(props: {
		plugins: PluginMetadata[];
		cache: Cache;
		allEntries: FileEntry[];
		files: CodeFileEntry[];
	}) {
		this.plugins = props.plugins;
		this.cache = props.cache;
		this.allEntries = props.allEntries;
		this.files = props.files;
	}

	addFilePath(path: string) {
		if (this.files.find((x) => x.path === path)) return;

		const entry = this.allEntries.find((x) => x.path === path);

		if (entry?.type !== "code") return;

		this.files.push(entry);
	}

	addFileDataModel(dm: string[]) {
		const entry = this.allEntries.find(
			(x) => x.dataModelPath.join(".") === dm.join("."),
		);

		if (entry) {
			this.addFilePath(entry.path);
		} else {
			warn(`Couldn't find datamodel ${dm.join(".")}`);
		}
	}

	async sweep() {
		let p = 0;

		while (p < this.files.length) {
			const file = this.files[p]!;
			const plugin = findPlugin(this.plugins, file.pluginId);
			const analysis = await plugin.analyze(file, this.cache);

			for (const imp of analysis.imports) {
				let dmPath = [...file.dataModelPath];

				if (imp.origin === "game") {
					dmPath.push("game");
				}

				dmPath.push(...imp.path);

				dmPath = resolveDataModelPath(dmPath);

				this.addFileDataModel(dmPath);
			}

			p++;
		}
	}

	async generateText(): Promise<string> {
		const cp = new CodePrinter();

		cp.comment(
			"bundled with tk (pronounced tick) by 'spin the hexagon'",
			"rights are reserved, but not by us",
			"you can mess around as much as you want, we (STH) don't care, the game devs might.",
			"https://github.com/spin-the-hexagon/tk",
		);

		cp.gap();

		cp.add(tkpack);

		for (const file of this.files) {
			cp.gap();
			cp.comment(file.path);
			cp.add(
				`tkpack.declare(${cp.escapeString(file.dataModelPath.join("."))},function()`,
			);
			cp.gap();

			// Step 1: Generate lua code with plugin (bleh)
			let src = await fs.readText(file.path);

			const plugin = findPlugin(this.plugins, file.pluginId);

			const transformPrinter = new CodePrinter();

			plugin.transform({
				codeprinter: transformPrinter,
				path: file.path,
				pathDatamodel: file.dataModelPath,
				src,
			});

			src = transformPrinter.text;

			// Step 2: Run it through the transpiler to turn require statements into tkpack.import :3
			src = await transpileToTKPack({
				src: src,
				cache: this.cache,
				pathDM: file.dataModelPath,
			});

			cp.add(src);

			cp.gap();
			cp.add("end)()");
		}

		for (const entrypoint of this.files.filter(
			(x) => x.mode !== "module",
		)) {
			cp.add(
				`tkpack.include(${cp.escapeString(entrypoint.dataModelPath.join("."))});`,
			);
		}

		return cp.text;
	}
}
