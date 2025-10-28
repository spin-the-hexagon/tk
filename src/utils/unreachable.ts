export function unreachable(ty: never): never {
	throw new Error(`UNREACHABLE: ${ty}`);
}
