//@ts-ignore
import { dlopen } from "bun:ffi";

import dllPath from "../../native/target/debug/tk_native.dll" with { type: "file" };

export const native = dlopen(dllPath, {
	read_credential: {
		args: ["cstring"],
		returns: "cstring",
	},
	free_str: {
		args: ["cstring"],
	},
});

function toBuffer(str: string) {
	return Buffer.from(str, "utf-8");
}

export function readCredential(id: string): string | undefined {
	const buffer = native.symbols.read_credential(toBuffer(id));
	native.symbols.free_str(buffer.ptr);
	const result = buffer.toString();

	if (result === "INVALID") {
		return undefined;
	}

	return result;
}

export function getRBXSECURITYMany(): string | undefined {
	const userId = getCurrentUserId();

	if (!userId) return undefined;

	return readCredential(`https://www.roblox.com:RobloxStudioAuth.ROBLOSECURITY${userId}`);
}

export function getRBXSECURITY(): string | undefined {
	return getRBXSECURITYMany() ?? readCredential(`https://www.roblox.com:RobloxStudioAuth.ROBLOSECURITY`);
}

export function getCurrentUserId(): string | undefined {
	return readCredential("https://www.roblox.com:RobloxStudioAuthuserid");
}
