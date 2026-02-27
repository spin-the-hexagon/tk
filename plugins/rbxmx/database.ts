import type { Cache } from "@core/compiler/cache";

import { action } from "@core/scheduler/action";

const reflectionDatabaseUrl =
	"https://raw.githubusercontent.com/rojo-rbx/rbx-dom/refs/heads/master/rbx_dom_lua/src/database.json";

// Note: these types are super incomplete, they only exist for our purposes
export interface ReflectionDatabase {
	Classes: Record<string, ReflectionDatabaseClass>;
}

export interface ReflectionDatabaseClass {
	Name: string;
	Properties: Record<string, ReflectionDatabaseProperty>;
	Superclass?: string;
}

export interface ReflectionDatabaseProperty {
	Name: string;
	Kind: ReflectionDatabasePropertyKind;
}

export type ReflectionDatabasePropertyKind =
	| {
			Canonical: {};
	  }
	| {
			Alias: {
				AliasFor: string;
			};
	  };

export function downloadReflectionDatabase(cache: Cache) {
	return action({
		name: "Download reflection database",
		id: "rbxmx:reflection_db_download",
		description: "Downloading the names that map XML keys into Roblox Studio keys",
		cache,
		forceCache: true,
		args: [reflectionDatabaseUrl],
		async impl(url: string): Promise<ReflectionDatabase> {
			return (await (await fetch(url)).json()) as ReflectionDatabase;
		},
		phase: "download",
	});
}

export async function getNameMapTable(cache: Cache, className: string): Promise<Record<string, string>> {
	const database = await downloadReflectionDatabase(cache);
	const nameMapTable: Record<string, string> = {};

	const classInfo = database.Classes[className]!;
	for (const key in classInfo.Properties) {
		const kind = classInfo.Properties[key]!.Kind;
		if ("Canonical" in kind) {
			nameMapTable[key] = key;
		} else if ("Alias" in kind) {
			nameMapTable[key] = kind.Alias.AliasFor;
		}
	}

	if (classInfo.Superclass) {
		return {
			...nameMapTable,
			...(await getNameMapTable(cache, classInfo.Superclass)),
		};
	}

	return nameMapTable;
}
