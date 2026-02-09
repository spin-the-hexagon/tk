import type { WSContext, WSEvents } from "hono/ws";

import chalk from "chalk";
import figlet from "figlet";
import { Hono, type Context } from "hono";
import { upgradeWebSocket, websocket } from "hono/bun";
import { poweredBy } from "hono/powered-by";
import { match } from "ts-pattern";
import * as v from "valibot";

import type { DevServer } from "../compiler/dev-server";

import { debug, info } from "../cli/logger";
import { C2SSyncMessage, type BlobEntry, type S2CSyncMessage } from "./codec";

export type SyncAuthPhase = "check_id" | "code_input" | "authenticated";

export interface WebSocketContext {
	phase: SyncAuthPhase;
	code: string;
}

export interface WebSocketShellContext {
	ctx?: WebSocketContext;
}

function generateCode() {
	let code = "";
	const charset = "ABCDEFGHJKLMNPQRSTUVWXYZ";

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
		chalk.blue(`Copy-pasting ${chalk.italic.italic("weaklings")} may copy the following: ${code}`),
		chalk.red("Don't share this code with anybody you don't trust."),
	].join("\n");

	info(text);
}

function context(ws: WSContext<WebSocketShellContext>): WebSocketContext {
	ws.raw ??= {};

	ws.raw.ctx ??= {
		phase: "check_id",
		code: generateCode(),
	};

	return ws.raw.ctx!;
}

export class SyncServer {
	hono = new Hono();
	devServer: DevServer;
	currentBlob: BlobEntry[] = [];
	websockets: WSContext<WebSocketShellContext>[] = [];

	setCurrentBlob(blob: BlobEntry[]) {
		this.currentBlob = blob;

		for (const ws of this.websockets) {
			const ctx = context(ws);

			if (ctx.phase === "authenticated") {
				this.message(ws, {
					type: "push_blob",
					entries: this.currentBlob,
				});
				debug("push");
			}
		}
	}

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
			websocket,
		});
	}

	message(ws: WSContext<WebSocketShellContext>, message: v.InferOutput<typeof S2CSyncMessage>) {
		return ws.send(JSON.stringify(message));
	}

	sendPhase(ws: WSContext<WebSocketShellContext>) {
		const { phase } = context(ws);

		this.message(ws, {
			type: "set_auth",
			mode: phase,
			projectId: this.devServer.config.name,
		});
	}

	createWebsocketHandler(ctx: Context): WSEvents<WebSocketShellContext> {
		const self = this;

		return {
			onOpen(evt, ws) {
				self.sendPhase(ws);
				self.websockets.push(ws);
			},
			onClose(evt, ws) {
				self.websockets = self.websockets.filter(x => x !== ws);
			},
			onMessage(evt, ws) {
				v.assert(v.string(), evt.data);
				const message = JSON.parse(evt.data);
				v.assert(C2SSyncMessage, message);

				match(message)
					.with({ type: "proceed_auth" }, message => {
						if (message.requestedMode === "code_input") {
							context(ws).phase = message.requestedMode;
							showCode(context(ws).code);
						}
						self.sendPhase(ws);
					})
					.with({ type: "verification_code" }, message => {
						if (context(ws).code.toUpperCase() === message.code.toUpperCase()) {
							context(ws).phase = "authenticated";
							self.message(ws, {
								type: "push_blob",
								entries: self.currentBlob,
							});
						} else {
							showCode(context(ws).code);
						}
						self.sendPhase(ws);
					})
					.exhaustive();
			},
		};
	}
}
