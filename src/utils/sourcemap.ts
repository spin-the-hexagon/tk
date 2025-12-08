import type { Luau } from "../luau/ast";

export type TextSegment = string | LocationTag;

export type CodeString = TextSegment[];

export type LocationTag = {
	id: string;
	file: string;
	line: number;
	col: number;
};

export type PartialLocationTag = Omit<LocationTag, "id">;

export const locationTagRegistry: LocationTag[] = [];

export function getLocationTag(location: PartialLocationTag) {
	const existing = locationTagRegistry.find(
		x => x.file === location.file && x.line === location.line && x.col === location.col,
	);

	if (existing) return existing;

	const id = `<::${crypto.randomUUID()}::>`;
	const full = {
		...location,
		id,
	};

	locationTagRegistry.push(full);

	return full;
}

export function encodeCodeString(codestring: CodeString): string {
	let result = "";

	for (const segment of codestring) {
		if (typeof segment === "string") {
			result += segment;
			continue;
		}

		result += getLocationTag(segment);
	}

	return result;
}

export function decodeCodeString(str: string): CodeString {
	let result: CodeString = [];

	outer: for (let i = 0; i < str.length; i++) {
		for (const locTag of locationTagRegistry) {
			if (str.slice(i).startsWith(locTag.id)) {
				result.push(locTag);
				i += locTag.id.length - 1;
				continue outer;
			}
		}
		if (typeof result.at(-1) === "string") {
			result[result.length - 1] += str[i]!;
		} else {
			result.push(str[i]!);
		}
	}

	return result;
}

export function createPartialLocationTagFromPartialLuauLocation(part: string, file: string): PartialLocationTag {
	const [line, idx] = part.split(",");

	return {
		file,
		line: Number.parseInt(line!),
		col: Number.parseInt(idx!),
	};
}

export function createPartialLocationTagFromLuauLocation(
	loc: Luau.Location,
	file: string,
): [PartialLocationTag, PartialLocationTag] {
	const [start, end] = loc.split(" - ");

	return [
		createPartialLocationTagFromPartialLuauLocation(start!, file),
		createPartialLocationTagFromPartialLuauLocation(end!, file),
	];
}
