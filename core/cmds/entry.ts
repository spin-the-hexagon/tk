import { run, subcommands } from "cmd-ts";

import { dev } from "./dev";
import { init } from "./init";

export function cliMain() {
	const app = subcommands({
		name: "tk",
		description: "A Roblox Toolkit",
		cmds: { init, dev },
	});

	run(app, process.argv.slice(2));
}
