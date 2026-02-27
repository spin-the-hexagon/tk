import type { Config } from "@core/config/schema";

import { fatalError } from "@core/cli/fatal-error";
import { debug } from "@core/cli/logger";
import { confirm, prompt } from "@core/cli/prompt";
import { getRBXSECURITY } from "@core/native/bindings";
import chalk from "chalk";

import { getUserInfo, setRobloxToken } from "./api";

async function checkIsTokenValid(token: string) {
	setRobloxToken(token);
	try {
		const data = await getUserInfo();
		debug(`Signed in as ${data.displayName}`);
		return true;
	} catch (err) {}

	return false;
}

async function _getRobloxToken(project: Config) {
	let currentToken = await Bun.secrets.get({
		service: "@spin-the-hexagon/tk",
		name: "roblox_token_for_" + project.name,
	});

	if (currentToken && (await checkIsTokenValid(currentToken))) {
		return currentToken;
	}

	if (
		!(await confirm({
			question: `Is it okay if I use your ROBLOX account to upload ${chalk.underline.italic("private")} assets for ${project.name} (y/n)?`,
		}))
	) {
		fatalError({
			what: "I cannot build this project.",
			why: "I dont have permission to upload things to ROBLOX, and if I can't do that, then I can't upload textures, meshes, and sounds.",
			hint: "Give me permission next time.",
		});
	}

	let token: string | undefined = undefined;

	if (
		!token &&
		process.platform === "win32" &&
		(await confirm({
			question: "May I get the token to your ROBLOX account from your ROBLOX Studio sign-in?",
		}))
	) {
		token = getRBXSECURITY();
		if (!token) {
			debug("Looks like ROBLOX Studio doesn't have your token.");
		}
	}

	if (token && !(await checkIsTokenValid(token))) {
		debug("Oops, my current token is bad, I guess I'll have to ask you myself.");
	}

	token ??= await prompt({
		question: "Please enter your .ROBLOSECURITY token",
		validate: it => it.startsWith("_|WARNING:-DO-NOT-SHARE-THIS."),
	});

	Bun.secrets.set({
		service: "@spin-the-hexagon/tk",
		name: "roblox_token_for_" + project.name,
		value: token,
	});

	return token;
}

let cache: Promise<string>;

export function getRobloxToken(project: Config) {
	return (cache ??= _getRobloxToken(project));
}
