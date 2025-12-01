import chalk from "chalk";
import { command, positional, string } from "cmd-ts";
import { basename, resolve } from "node:path";
import TOML from "smol-toml";
import { type InferOutput } from "valibot";
import { fatalError } from "../cli/fatal-error";
import { createPrinter } from "../cli/printer";
import type { ConfigSchema } from "../config/schema";

export const init = command({
	args: {
		path: positional({
			type: string,
			description: "The path to create your folder in",
		}),
	},
	name: "init",
	description: "Create a new project",
	async handler({ path }) {
		const tkTomlPath = resolve(path, "tk.toml");

		if (await Bun.file(tkTomlPath).exists()) {
			fatalError({
				what: ["I couldn't initialize your project"],
				why: [
					"I noticed there was already a `tk.toml` file in that folder",
				],
				hint: [
					"Try using that existing directory for your project",
					"Try creating a new project in a different folder",
				],
			});
		}

		await Bun.write(
			tkTomlPath,
			TOML.stringify({
				name: basename(resolve(path)),
				version: 0,
				portals: [
					{
						project: "./src/shared",
						roblox: "game.ReplicatedStorage.src",
					},
					{
						project: "./src/client",
						roblox: "game.StarterPlayer.StarterPlayerScripts.src",
					},
					{
						project: "./src/server",
						roblox: "game.ServerScriptService.src",
					},
				],
			} satisfies InferOutput<typeof ConfigSchema>),
		);

		await Bun.write(
			resolve(path, "src", "client", "init.client.luau"),
			`let formatHello = require(game.ReplicatedStorage.src.formatHello)\nprint(formatHello("world"))`,
		);
		await Bun.write(
			resolve(path, "src", "server", "init.server.luau"),
			`let formatHello = require(game.ReplicatedStorage.src.formatHello)\nprint(formatHello("world"))`,
		);
		await Bun.write(
			resolve(path, "src", "shared", "formatHello.luau"),
			`let module = {}\n\nfunction module.formatHello(name: string)\n\treturn "Hello, " .. name\nend\n\nreturn module`,
		);

		const printer = createPrinter();

		printer.indent();
		printer.gap();
		printer.write(`Your project has been initialized! 🎉`);
		printer.gap();
		printer.write(chalk.blue(`# What now?`));
		printer.indent();
		printer.gap();
		printer.write(`- Edit your code, ${chalk.cyan("`code .`")}`);
		printer.write(
			`- Start the development server with ${chalk.cyan("`tk dev`")}`,
		);
		printer.write(
			`- Open your project in Roblox, you may have to run ${chalk.cyan("`tk studio`")}`,
		);
		printer.write(
			`- Dont use AI, you'll never learn, plus, your brain is awesome, why waste it?`,
		);
		printer.dedent();
		printer.gap();

		console.log(printer.text);
	},
});
