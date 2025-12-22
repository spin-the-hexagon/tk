import { homedir } from "node:os";
import { basename, join, resolve } from "node:path";
import { nfError, warn } from "../cli/logger";
import type { Config } from "../config/schema";
import { isExperimentEnabled } from "../config/utils";
import { pluginLuau } from "../luau/plugin";
import type { PluginMetadata } from "../plugin/schema";
import { printProfileReadout } from "../scheduler/profiler";
import { getCurrentBlock, wait } from "../scheduler/scheduler";
import { Instance } from "../sync/rodom";
import { SyncServer } from "../sync/server";
import { pluginTypescript } from "../typescript/plugin";
import { fs } from "../utils/fastfs";
import { createSourcemapFromFiles } from "../utils/rojo-sourcemaps";
import { codeStringToRawText } from "../utils/sourcemap";
import { TODO } from "../utils/todo";
import { Bundle } from "./bundle";
import { Cache, cacheFileName } from "./cache";
import { scanFiles, type CodeFileEntry, type FileEntry } from "./scan-files";

export interface BundledItem {
	path: string;
	mode: "client" | "server" | "module";
	src: string;
	dataModelPath: string[];
}

export class DevServer {
	path: string;
	config: Config;
	isUpdateQueued = false;
	cache: Cache;
	plugins: PluginMetadata[] = [];
	server?: SyncServer;
	profiles: string[] = [];

	constructor(opts: { path: string; config: Config }) {
		for (const portal of opts.config.portals) {
			fs.addWatchPath(resolve(opts.path, portal.project));
		}
		fs.addOnUpdate(() => {
			this.isUpdateQueued = true;
		});

		if (opts.config.type !== "plugin") {
			this.server = new SyncServer(this);
		}

		this.path = resolve(opts.path);
		this.config = opts.config;

		this.isUpdateQueued = true;

		this.cache = new Cache(resolve(this.path, cacheFileName));

		this.updateLoop();

		this.plugins.push(pluginLuau());

		if (isExperimentEnabled(this.config, "typescript")) {
			this.plugins.push(pluginTypescript());
		}
	}

	async init() {
		await this.cache.loadFromFS();
	}

	async updateLoop() {
		await this.init();
		while (true) {
			await wait(100);
			if (this.isUpdateQueued) {
				this.isUpdateQueued = false;
				try {
					await this.update();
				} catch (err) {
					nfError(err);
					getCurrentBlock().failed = true;
				}
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
					external: portal.external,
				}),
			);
		}

		const entries = (await Promise.all(index)).flat();

		return entries;
	}

	async update() {
		const entries = await this.scanFiles();

		const entrypoints = entries.filter(x => x.type === "code" && x.mode !== "module") as CodeFileEntry[];

		if (this.config.type === "plugin") {
			if (entrypoints.length > 0) {
				warn(
					`Plugins cannot have client or server scripts, thus the files ${entrypoints.map(x => basename(x.path)).join(", ")} are being ignored.`,
				);
			}

			entrypoints.splice(0);

			const entryPath = this.config.entry;
			const entry = entries.find(x => x.path === resolve(this.path, entryPath) && x.type === "code") as
				| CodeFileEntry
				| undefined;

			if (!entry) {
				warn(`Failed to find a file with path ${resolve(this.path, entryPath)}, thus there is no entrypoint`);
			} else {
				entrypoints.push(entry);
			}
		}

		const bundles: BundledItem[] = [];

		for (const entry of entrypoints) {
			const bundle = new Bundle({
				cache: this.cache,
				allEntries: entries,
				files: [entry],
				plugins: this.plugins,
				entrypoints: [entry],
			});

			await bundle.sweep();

			const code = await bundle.generateText();

			bundles.push({
				path: entry.path,
				src: codeStringToRawText(code),
				dataModelPath: entry.dataModelPath,
				mode: entry.mode,
			});
		}

		if (this.config.type === "plugin") {
			await this.savePlugin(bundles);
		} else {
			await this.pushGame(bundles);
		}

		// Update sourcemap
		const sourcemap = createSourcemapFromFiles({
			config: this.config,
			files: entries,
			projectPath: this.path,
		});

		Bun.write(resolve(this.path, "sourcemap.json"), JSON.stringify(sourcemap));

		if (isExperimentEnabled(this.config, "profiling")) {
			this.profiles.push(printProfileReadout(getCurrentBlock()));

			await Bun.write(resolve(this.path, ".tk", "profile.log"), this.profiles.join("\n\n\n"));
		}
	}

	async pushGame(bundles: BundledItem[]) {
		const domRoot = new Instance();

		for (const bundle of bundles) {
			domRoot.addBundle(bundle);
		}

		const blobs = domRoot.asBlobEntries([]);

		this.server?.setCurrentBlob(blobs);
	}

	async savePlugin(bundles: BundledItem[]) {
		if (bundles.length !== 1) throw new Error(`Incorrect number of bundles. Expected 1, got ${bundles.length}`);
		const coreBundle = bundles[0]!;
		const src = coreBundle.src;
		if (process.platform !== "win32") {
			TODO(process.platform);
		}
		const robloxPath = join(homedir(), "AppData", "Local", "Roblox", "Plugins", `${this.config.name}.lua`);

		await Bun.write(robloxPath, src);
		await Bun.write(resolve(this.path, "./test.luau"), src);
	}
}
