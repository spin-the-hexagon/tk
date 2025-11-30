import type { Luau } from "./ast";

export interface WalkerContext {
	skip: () => void;
	remove: () => void;
	replace: (node: any) => void;
}

export interface AsyncHandler {
	enter?: (
		node: Luau.Node,
		parent: Luau.Node,
		prop: string,
		index: number,
	) => Promise<void>;
	leave?: (
		node: Luau.Node,
		parent: Luau.Node,
		prop: string,
		index: number,
	) => Promise<void>;
}

export async function walk(ast: any, { enter, leave }: AsyncHandler) {
	return walkAsync(ast, enter, leave);
}

async function walkAsync(
	node: any,
	enter?: (
		node: any,
		parent: any,
		prop: string,
		index: number,
	) => Promise<void>,
	leave?: (
		node: any,
		parent: any,
		prop: string,
		index: number,
	) => Promise<void>,
	parent?: any,
	prop = "",
	index = -1,
): Promise<void> {
	if (!node || typeof node !== "object") return;

	let shouldSkip = false;
	let shouldRemove = false;
	let replacement: any = null;

	const context: WalkerContext = {
		skip: () => (shouldSkip = true),
		remove: () => (shouldRemove = true),
		replace: (newNode: any) => (replacement = newNode),
	};

	if (enter) {
		const originalEnter = enter;
		enter = function (
			this: WalkerContext,
			node: any,
			parent: any,
			prop: string,
			index: number,
		) {
			return originalEnter.call(context, node, parent, prop, index);
		};
		await enter.call(context, node, parent, prop, index);
	}

	if (replacement) {
		node = replacement;
		if (parent) {
			if (Array.isArray(parent[prop])) {
				parent[prop][index] = node;
			} else {
				parent[prop] = node;
			}
		}
	}

	if (shouldRemove) {
		if (parent && Array.isArray(parent[prop])) {
			parent[prop].splice(index, 1);
		}
		return;
	}

	if (!shouldSkip && node.type) {
		// Walk all properties that could contain child nodes
		for (const [key, value] of Object.entries(node)) {
			if (key === "type" || key === "location") continue;

			if (Array.isArray(value)) {
				for (let i = 0; i < value.length; i++) {
					const item = value[i];
					if (item && typeof item === "object" && item.type) {
						await walkAsync(item, enter, leave, node, key, i);
					}
				}
			} else if (value && typeof value === "object" && "type" in value) {
				await walkAsync(value, enter, leave, node, key, -1);
			}
		}
	}

	if (leave) {
		const originalLeave = leave;
		leave = function (
			this: WalkerContext,
			node: any,
			parent: any,
			prop: string,
			index: number,
		) {
			return originalLeave.call(context, node, parent, prop, index);
		};
		await leave.call(context, node, parent, prop, index);
	}
}
