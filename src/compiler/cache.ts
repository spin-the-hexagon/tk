import { resolve } from "node:path";
import { safeParse, type BaseSchema, type InferOutput } from "valibot";
import { wait } from "../scheduler/scheduler";

export const cacheFileName = ".tk/cache";

export class Cache {
	entries: any[] = [];
	fastCache: Record<string, string> = {};
	path: string;
	isDirty = true;
	enabled = !process.argv.includes("--no-cache");

	get jsonPath() {
		return resolve(this.path, "cache.json");
	}

	artifactPath(id: string) {
		return resolve(this.path, "artifact", id);
	}

	constructor(path: string) {
		this.path = path;
		this.startSaveLoop();
	}

	async startSaveLoop() {
		while (true) {
			await wait(1000);
			if (!this.isDirty) continue;
			this.isDirty = false;
			await this.saveToFS();
		}
	}

	async loadFromFS() {
		try {
			const document = JSON.parse(await Bun.file(this.jsonPath).text());
			this.entries.push(...document.entries);
			this.fastCache = document.fast;
		} catch (err) {}
	}

	async saveToFS() {
		await Bun.write(
			this.jsonPath,
			JSON.stringify({
				entries: this.entries,
				fast: this.fastCache,
			}),
		);
	}

	save(entry: any) {
		this.isDirty = true;
		this.entries.push(entry);
	}

	query<Schema extends BaseSchema<any, any, any>>(schema: Schema): InferOutput<Schema> | null {
		if (!this.enabled) return null;
		for (const entry of this.entries) {
			const parsed = safeParse<Schema>(schema, entry);
			if (parsed.success) {
				return parsed.output;
			}
		}
		return null;
	}
}
