import { command, optional, positional } from "cmd-ts";
import { Directory } from "cmd-ts/batteries/fs";
import { resolve } from "node:path";
import { DevServer } from "../compiler/dev-server";
import { loadConfig } from "../config/loader";
import { startRunLoop } from "../scheduler/scheduler";

export const dev = command({
	args: {
		path: positional({ type: optional(Directory) }),
	},
	name: "dev",
	description: "Start the development server",
	async handler({ path }) {
		const realPath = path ?? ".";
		const tkTomlPath = resolve(realPath, "tk.toml");

		const config = await loadConfig(tkTomlPath);

		if (!config) return;

		startRunLoop();

		const devServer = new DevServer({
			path: realPath,
			config,
		});
	},
});
