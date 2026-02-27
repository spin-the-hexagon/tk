import { watch } from "chokidar";
import { debug } from "node:console";
import { readdir } from "node:fs/promises";
import { relative, resolve } from "node:path";

export type FileType = "file" | "directory";

export type FastFile = {
	contents?: Promise<Uint8Array>;
	children?: Promise<string[]>;
	type?: Promise<FileType>;
};

const td = new TextDecoder();

/**
 * A small little filesystem cache that respects when things update
 */
export class FastFS {
	private watchingPaths = new Set<string>();
	private watcher = watch([], {
		depth: 99,
		ignored: [x => x.includes(".tk")],
	});
	private files = new Map<string, FastFile>();
	private updateHooks = new Set<() => void>();

	addOnUpdate(hook: () => void) {
		const uh = this.updateHooks;
		uh.add(hook);

		return {
			close() {
				uh.delete(hook);
			},
		};
	}

	private invalidateChildren(path: string) {
		const file = this.files.get(path);

		if (!file) return;

		file.children = undefined;
	}

	private invalidateContents(path: string) {
		const file = this.files.get(path);

		if (!file) return;

		file.contents = undefined;
	}

	private invalidateType(path: string) {
		const file = this.files.get(path);

		if (!file) return;

		file.type = undefined;
	}

	constructor() {
		this.watcher.on("add", path => {
			this.invalidateChildren(resolve(path, ".."));
			this.invalidateType(resolve(path));
			this.updateHooks.forEach(x => x());
		});
		this.watcher.on("unlink", path => {
			this.invalidateChildren(resolve(path, ".."));
			this.invalidateType(resolve(path));
			this.updateHooks.forEach(x => x());
		});
		this.watcher.on("change", path => {
			this.invalidateContents(resolve(path));
			this.updateHooks.forEach(x => x());
		});
	}

	read(path: string): Promise<Uint8Array> {
		const absPath = resolve(path);
		let file = this.files.get(absPath);

		if (!file) {
			file = {};
		}

		file.contents ??= Bun.file(path).bytes();

		if (this.shouldCacheFile(absPath)) {
			this.files.set(absPath, file);
		}

		return file.contents;
	}

	async readText(path: string): Promise<string> {
		const bytes = await this.read(path);
		return td.decode(bytes);
	}

	readDir(path: string): Promise<string[]> {
		const absPath = resolve(path);
		let file = this.files.get(absPath);

		if (!file) {
			file = {};
		}

		file.children ??= readdir(path);

		if (this.shouldCacheFile(absPath)) {
			this.files.set(absPath, file);
		}

		return file.children;
	}

	getType(path: string): Promise<FileType> {
		const absPath = resolve(path);
		let file = this.files.get(absPath);

		if (!file) {
			file = {};
		}

		file.type ??= Bun.file(path)
			.stat()
			.then(x => (x.isDirectory() ? "directory" : "file"));

		if (this.shouldCacheFile(absPath)) {
			this.files.set(absPath, file);
		}

		return file.type;
	}

	private shouldCacheFile(filePath: string) {
		for (const watchPath of this.watchingPaths) {
			if (!relative(watchPath, filePath).includes("..")) {
				return true;
			}
		}
		return false;
	}

	addWatchPath(path: string) {
		const abs = resolve(path);
		if (this.watchingPaths.has(abs)) return;
		this.watchingPaths.add(abs);
		this.watcher.add(path);
	}
}

export const fs = new FastFS();
