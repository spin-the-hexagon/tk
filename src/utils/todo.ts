export function TODO(type: string = "This"): never {
	throw new Error(`${type} is not implemented.`);
}
