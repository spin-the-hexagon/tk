import { pluginLuau } from "@plugins/luau/plugin";
import { pluginMedia } from "@plugins/media/plugin";
import { pluginModels } from "@plugins/models/plugin";
import { pluginRBXMX } from "@plugins/rbxmx/plugin";
import { AssetCollection } from "@plugins/roblox/assets";
import { pluginTypescript } from "@plugins/typescript/plugin";
import { resolve } from "node:path";

import type { Config } from "./config/schema";
import type { PluginMetadata } from "./plugin/schema";

import { Cache } from "./compiler/cache";
import { DevServer } from "./compiler/dev-server";
import { isExperimentEnabled } from "./config/utils";
import { SyncServer } from "./sync/server";

export function contextProvider<T extends Record<string, () => any>>(props: T): T {
	const result = {} as T;

	for (const key in props) {
		let value: any = undefined;

		result[key] = (() => {
			return (value ??= props[key]!());
		}) as any;
	}

	return result;
}

export function buildContext(config: Config, path: string) {
	const self = contextProvider({
		config() {
			return config;
		},
		path() {
			return path;
		},
		devServer() {
			return new DevServer(self);
		},
		syncServer() {
			return new SyncServer(self);
		},
		plugins() {
			const plugins: PluginMetadata[] = [];

			plugins.push(pluginLuau());
			if (isExperimentEnabled(self.config(), "rbxmx")) {
				plugins.push(pluginRBXMX());
			}

			if (isExperimentEnabled(self.config(), "typescript")) {
				plugins.push(pluginTypescript());
			}

			if (isExperimentEnabled(self.config(), "models")) {
				plugins.push(pluginModels());
			}

			if (isExperimentEnabled(self.config(), "media")) {
				plugins.push(pluginMedia());
			}

			return plugins;
		},
		cache() {
			return new Cache(resolve(self.path(), ".tk", "cache.json"));
		},
		assets() {
			return new AssetCollection({
				config: self.config(),
				projectPath: self.path(),
			});
		},
	});

	return self;
}

export type Context = ReturnType<typeof buildContext>;
