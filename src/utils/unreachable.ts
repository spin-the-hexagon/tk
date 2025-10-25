export function unreachable(_value: never): never {
	throw new Error("UNREACHABLE");
}
