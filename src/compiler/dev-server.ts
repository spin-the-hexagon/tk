import { resolve } from "node:path";
import type { Config } from "../config/schema";
import { analyzeImports } from "../luau/analysis";
import { createLuauPlugin } from "../luau/plugin";
import type { PluginMetadata } from "../plugin/schema";
import { waitForEventLoop } from "../scheduler/scheduler";
import { fs } from "../utils/fastfs";
import { createSourcemapFromFiles } from "../utils/sourcemaps";
import { Bundle } from "./bundle";
import { Cache, cacheFileName } from "./cache";
import { scanFiles, type CodeFileEntry, type FileEntry } from "./scan-files";

export class DevServer {
	path: string;
	config: Config;
	isUpdateQueued = false;
	cache: Cache;
	plugins: PluginMetadata[] = [];

	constructor(opts: { path: string; config: Config }) {
		fs.addWatchPath(opts.path);
		fs.addOnUpdate(() => {
			this.isUpdateQueued = true;
		});

		this.path = resolve(opts.path);
		this.config = opts.config;

		this.isUpdateQueued = true;

		this.cache = new Cache(resolve(this.path, cacheFileName));

		this.updateLoop();

		this.plugins.push(createLuauPlugin());
	}

	async init() {
		await this.cache.loadFromFS();
	}

	async updateLoop() {
		await this.init();
		while (true) {
			await waitForEventLoop();
			if (this.isUpdateQueued) {
				this.isUpdateQueued = false;
				await this.update();
			}
		}
	}

	async scanFiles() {
		const index: Promise<FileEntry[]>[] = [];
		for (const portal of this.config.portals ?? []) {
			index.push(
				scanFiles({
					path: resolve(this.path, portal.project),
					robloxPath: portal.roblox.split("."),
					plugins: this.plugins,
				}),
			);
		}
		const entries = (await Promise.all(index)).flat();

		return entries;
	}

	async update() {
		const entries = await this.scanFiles();

		const src = `local module = require(script.Child)`;

		const entrypoints = entries.filter(
			(x) => x.type === "code" && x.mode !== "module",
		) as CodeFileEntry[];

		for (const entry of entrypoints) {
			const bundle = new Bundle({
				cache: this.cache,
				allEntries: entries,
				files: [entry],
				plugins: this.plugins,
			});

			await bundle.sweep();

			const code = await bundle.generateText();
		}

		await analyzeImports(src, this.cache);

		// Update sourcemap
		const sourcemap = createSourcemapFromFiles({
			config: this.config,
			files: entries,
			projectPath: this.path,
		});

		await Bun.write(
			resolve(this.path, "sourcemap.json"),
			JSON.stringify(sourcemap),
		);
	}
}
