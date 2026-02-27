import { type ColorName } from "chalk";
import { atom } from "jotai";

import { store } from "../ui/react";

let lastLineWritten: undefined | string = undefined;
export let canShowSchedulerUpdates = {
	value: true,
};

export const leadingLength = 10;

export interface Log {
	type: string;
	color: ColorName;
	message: string;
	timestamp: number;
	id: string;
}

export const logs = atom<Log[]>([]);

export function logger(type: string, color: ColorName) {
	return function (...args: any[]) {
		const formatted = args.map(x => (typeof x === "string" ? x : Bun.inspect(x, { colors: true }))).join(" ");
		store.set(logs, it => [
			...it,
			{
				type,
				color,
				message: formatted,
				timestamp: Date.now(),
				id: crypto.randomUUID(),
			},
		]);
	};
}

export const debug = logger("debug", "blue");
export const warn = logger("warn", "yellow");
export const info = logger("info", "green");
export const nfError = logger("error", "red");
