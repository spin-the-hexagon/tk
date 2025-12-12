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
export const quickmap: Record<string, LocationTag> = {};
export const idToLocTag: Record<string, LocationTag> = {};

let locCounter = 0;
const idBodyLength = 5;
const idSize = idBodyLength + 6;

export function getLocationTag(location: PartialLocationTag) {
	const key = `${location.file}:${location.line}:${location.col}`;

	const existing = quickmap[key];

	if (existing) return existing;

	const id = `<::${(locCounter++).toString(36).padStart(idBodyLength, "0")}::>`;
	const full = {
		...location,
		id,
	};

	locationTagRegistry.push(full);

	quickmap[key] = full;
	idToLocTag[id] = full;

	return full;
}

export function codeStringToRawText(codestring: CodeString): string {
	let result = "";

	for (const segment of codestring) {
		if (typeof segment === "string") {
			result += segment;
			continue;
		}
	}

	return result;
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
	let append = "";

	for (let i = 0; i < str.length; i++) {
		if (str[i] === "<" && str[i + 1] === ":") {
			const idIfReal = str.slice(i, i + idSize);
			const locTag = idToLocTag[idIfReal];
			if (locTag) {
				if (append) {
					result.push(append);
					append = "";
				}
				result.push(locTag);
				i += idSize - 1;
				continue;
			}
		} else {
			append += str[i];
		}
	}

	if (append) {
		result.push(append);
		append = "";
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
