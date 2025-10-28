import { resolve } from "node:path";
import TOML from "smol-toml";
import { safeParse, type BaseSchema, type InferOutput } from "valibot";
import { wait } from "../scheduler/scheduler";

export const cacheFileName = ".tk/cache";

export class Cache {
	entries: any[] = [];
	path: string;
	isDirty = true;

	get tomlPath() {
		return resolve(this.path, "cache.toml");
	}

	artifactPath(id: string) {
		return resolve(this.path, "artifact", id);
	}

	constructor(path: string) {
		this.path = path;
		this.loadFromFS();
		this.startSaveLoop();
	}

	async startSaveLoop() {
		while (true) {
			if (!this.isDirty) continue;
			this.isDirty = false;
			await wait(1000);
			await this.saveToFS();
		}
	}

	async loadFromFS() {
		try {
			this.entries.push(
				...(TOML.parse(await Bun.file(this.tomlPath).text())
					.entries as any[]),
			);
		} catch {}
	}

	async saveToFS() {
		while (this.entries.length > 200) {
			this.entries.shift();
		}
		await Bun.write(
			this.tomlPath,
			TOML.stringify({
				entries: this.entries,
			}),
		);
	}

	save(entry: any) {
		this.isDirty = true;
		this.entries.push(entry);
	}

	query<Schema extends BaseSchema<any, any, any>>(
		schema: Schema,
	): InferOutput<Schema> | null {
		for (const entry of this.entries) {
			const parsed = safeParse<Schema>(schema, entry);
			if (parsed.success) {
				return parsed.output;
			}
		}
		return null;
	}
}
