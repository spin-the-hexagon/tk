import { resolve } from "node:path";
import type { Config } from "../config/schema";
import { analyzeImports } from "../luau/analysis";
import { waitForEventLoop } from "../scheduler/scheduler";
import { fs } from "../utils/fastfs";
import { Cache, cacheFileName } from "./cache";
import { scanFiles, type FileEntry } from "./scan-files";

export class DevServer {
	path: string;
	config: Config;
	isUpdateQueued = false;
	cache: Cache;

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
				scanFiles(
					resolve(this.path, portal.project),
					portal.roblox.split("."),
				),
			);
		}
		const entries = (await Promise.all(index)).flat();

		return entries;
	}

	async update() {
		const entries = await this.scanFiles();

		const src = `local module = require(script.Child)`;

		await analyzeImports(src, this.cache);
	}
}
