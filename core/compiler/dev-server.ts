import type { Context } from "@core/context";

import { AssetCollection } from "@plugins/roblox/assets";
import { homedir } from "node:os";
import { basename, join, resolve } from "node:path";

import { nfError, warn } from "../cli/logger";
import { isExperimentEnabled } from "../config/utils";
import { findPlugin, type PluginMetadata } from "../plugin/schema";
import { action } from "../scheduler/action";
import { printProfileReadout } from "../scheduler/profiler";
import { getCurrentBlock, pushSchedulerBlockStatus, wait } from "../scheduler/scheduler";
import { Instance } from "../sync/rodom";
import { serverState, store } from "../ui/react";
import { fs } from "../utils/fastfs";
import { createSourcemapFromFiles } from "../utils/rojo-sourcemaps";
import { codeStringToRawText } from "../utils/sourcemap";
import { TODO } from "../utils/todo";
import { Bundle } from "./bundle";
import { scanFiles, type CodeFileEntry, type FileEntry } from "./scan-files";

export type BundledItem =
	| {
			path: string;
			mode: "client" | "server" | "module";
			src: string;
			dataModelPath: string[];
	  }
	| {
			path: string;
			mode: "model";
			data: Instance;
			dataModelPath: string[];
	  };

export class DevServer {
	isUpdateQueued = false;
	plugins: PluginMetadata[] = [];
	context: Context;
	profiles: string[] = [];
	assets: AssetCollection;
	password = "??????";
	url = "";

	constructor(context: Context) {
		this.context = context;

		for (const portal of context.config().portals) {
			fs.addWatchPath(resolve(context.path(), portal.project));
		}
		fs.addOnUpdate(() => {
			this.isUpdateQueued = true;
		});

		this.isUpdateQueued = true;

		this.updateLoop();

		this.assets = new AssetCollection({
			config: this.context.config(),
			projectPath: this.context.path(),
		});
	}

	async init() {
		await this.context.cache().loadFromFS();
	}

	updateUIState() {
		store.set(serverState, {
			password: this.password,
			url: "localhost:1114",
		});
	}

	async updateLoop() {
		await this.init();
		while (true) {
			await wait(100);
			if (this.isUpdateQueued) {
				this.isUpdateQueued = false;
				try {
					const self = this;
					await action({
						id: "dev:build",
						name: "Build",
						description: "Turning your code into a form that I can more easily work with",
						args: [],
						impl() {
							return self.update();
						},
						phase: "build",
					});
				} catch (err) {
					nfError(err);
					getCurrentBlock().failed = err;
					pushSchedulerBlockStatus(getCurrentBlock());
				}
			}
		}
	}

	async scanFiles() {
		const index: Promise<FileEntry[]>[] = [];

		for (const portal of this.context.config().portals ?? []) {
			index.push(
				scanFiles({
					path: resolve(this.context.path(), portal.project),
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

		const cfg = this.context.config();

		if (cfg.type === "plugin") {
			if (entrypoints.length > 0) {
				warn(
					`Plugins cannot have client or server scripts, thus the files ${entrypoints.map(x => basename(x.path)).join(", ")} are being ignored.`,
				);
			}

			entrypoints.splice(0);

			const entryPath = cfg.entry;
			const entry = entries.find(x => x.path === resolve(this.context.path(), entryPath) && x.type === "code") as
				| CodeFileEntry
				| undefined;

			if (!entry) {
				warn(
					`Failed to find a file with path ${resolve(this.context.path(), entryPath)}, thus there is no entrypoint`,
				);
			} else {
				entrypoints.push(entry);
			}
		}

		const bundles: BundledItem[] = [];

		for (const entry of entrypoints) {
			const bundle = new Bundle({
				context: this.context,
				allEntries: entries,
				files: [entry],
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

		for (const file of entries) {
			if (file.type !== "model") continue;

			const plugin = findPlugin(this.plugins, file.pluginId);

			const result = await plugin.transpileModel!({
				model: file,
				context: this.context,
			});

			bundles.push({
				mode: "model",
				dataModelPath: file.dataModelPath,
				path: file.path,
				data: result,
			});
		}

		if (this.context.config().type === "plugin") {
			await this.savePlugin(bundles);
		} else {
			await this.pushGame(bundles);
		}

		// Update sourcemap
		const sourcemap = createSourcemapFromFiles({
			config: this.context.config(),
			files: entries,
			projectPath: this.context.path(),
		});

		Bun.write(resolve(this.context.path(), "sourcemap.json"), JSON.stringify(sourcemap));

		if (isExperimentEnabled(this.context.config(), "profiling")) {
			this.profiles.push(printProfileReadout(getCurrentBlock()));

			await Bun.write(resolve(this.context.path(), ".tk", "profile.log"), this.profiles.join("\n\n\n"));
		}
	}

	async pushGame(bundles: BundledItem[]) {
		const domRoot = new Instance();

		for (const bundle of bundles) {
			domRoot.addBundle(bundle);
		}

		const blobs = domRoot.asBlobEntries([]);

		this.context.syncServer().setCurrentBlob(blobs);
	}

	async savePlugin(bundles: BundledItem[]) {
		if (bundles.length !== 1) throw new Error(`Incorrect number of bundles. Expected 1, got ${bundles.length}`);
		if (bundles[0]?.mode === "model") throw new Error(`Plugins cannot be a model.`);

		const coreBundle = bundles[0]!;
		const src = coreBundle.src;
		if (process.platform !== "win32") {
			TODO(process.platform);
		}
		const robloxPath = join(
			homedir(),
			"AppData",
			"Local",
			"Roblox",
			"Plugins",
			`${this.context.config().name}.lua`,
		);

		await Bun.write(robloxPath, src);
		await Bun.write(resolve(this.context.path(), "./test.luau"), src);
	}
}
