import { buildContext } from "@core/context";
import chalk from "chalk";
import { command, flag, optional, positional } from "cmd-ts";
import { Directory } from "cmd-ts/batteries/fs";
import { resolve } from "node:path";

import { loadConfig } from "../config/loader";
import { startRunLoop } from "../scheduler/scheduler";

export const dev = command({
	args: {
		path: positional({ type: optional(Directory) }),
		noCache: flag({ long: "no-cache" }),
	},
	name: "dev",
	description: "Start the development server",
	async handler({ path }) {
		const realPath = path ?? ".";
		const tkTomlPath = resolve(realPath, "tk.toml");

		const config = await loadConfig(tkTomlPath);

		if (!config) return;

		const experimentalFeatures = config.experimental
			? Object.entries(config.experimental)
					.filter(([_, v]) => v)
					.map(([k]) => k)
			: [];

		if (experimentalFeatures.length > 0) {
			console.log(
				chalk.red(
					`WARNING: You're rolling experimental features; specifically, ${experimentalFeatures.join(", ")}. Things are going to break.`,
				),
			);
		}

		startRunLoop();

		const context = buildContext(config, path!);

		context.devServer();
	},
});
