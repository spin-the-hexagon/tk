import { ResolverFactory } from "oxc-resolver";

const resolver = new ResolverFactory({
	extensions: [".ts", ".js", ".luau", ".lua"],
});

export function resolveImport(from: string, to: string) {
	return resolver.resolveFileSync(from, to).path;
}
