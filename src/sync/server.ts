import chalk from "chalk";
import figlet from "figlet";
import { Hono, type Context } from "hono";
import { upgradeWebSocket } from "hono/bun";
import { poweredBy } from "hono/powered-by";
import type { WSContext, WSEvents } from "hono/ws";
import { match } from "ts-pattern";
import * as v from "valibot";
import { info } from "../cli/logger";
import type { DevServer } from "../compiler/dev-server";
import { C2SSyncMessage, type S2CSyncMessage } from "./codec";

export type SyncAuthPhase = "check_id" | "code_input" | "authenticated";

export interface WebSocketContext {
	phase: SyncAuthPhase;
	code: string;
}

function generateCode() {
	let code = "";
	const charset = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

	while (code.length < 6) {
		code += charset[Math.floor(Math.random() * charset.length)];
	}

	return code;
}

export async function showCode(code: string) {
	const text = [
		chalk.blue(await figlet(code, "univers")),
		"",
		chalk.blue("Above this message is the code to sync this project to Roblox Studio."),
		chalk.red("Don't share this code with anybody you don't trust."),
	].join("\n");

	info(text);
}

function context(ws: WSContext<WebSocketContext>): WebSocketContext {
	ws.raw ??= { phase: "check_id", code: generateCode() };

	return ws.raw;
}

export class SyncServer {
	hono = new Hono();
	devServer: DevServer;

	constructor(devServer: DevServer) {
		this.devServer = devServer;

		this.hono.get(
			"/sync",
			poweredBy({ serverName: "Love and Code" }),
			upgradeWebSocket(it => this.createWebsocketHandler(it)),
		);

		Bun.serve({
			port: 1114,
			fetch: this.hono.fetch,
		});
	}

	message(ws: WSContext<WebSocketContext>, message: v.InferOutput<typeof S2CSyncMessage>) {
		return ws.send(JSON.stringify(message));
	}

	sendPhase(ws: WSContext<WebSocketContext>) {
		const { phase } = context(ws);

		this.message(ws, {
			type: "set_auth",
			mode: phase,
			projectId: this.devServer.config.name,
		});
	}

	createWebsocketHandler(ctx: Context): WSEvents<WebSocketContext> {
		const self = this;

		return {
			onOpen(evt, ws) {
				self.sendPhase(ws);
			},
			onMessage(evt, ws) {
				v.assert(v.string(), evt.data);
				const message = JSON.parse(evt.data);
				v.assert(C2SSyncMessage, message);

				match(message)
					.with({ type: "proceed_auth" }, message => {
						context(ws).phase = message.requestedMode;

						if (message.requestedMode === "code_input") {
						}
						self.sendPhase(ws);
					})
					.with({ type: "verification_code" }, message => {
						if (context(ws).code === message.code) {
							context(ws).phase = "authenticated";
						}
						self.sendPhase(ws);
					})
					.exhaustive();
			},
		};
	}
}
