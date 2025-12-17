import type { Luau } from "../luau/ast";

export type TextControl = { type: "indent" | "undent" | "line" | "semi" | "whitespace" };

export type TextSegment = string | LocationTag | TextControl;

export type CodeString = TextSegment[];

export type LocationTag = {
	type: "location";
	id: string;
	file: string;
	line: number;
	col: number;
};

export const idToTagCache: Record<string, LocationTag> = {};

export type PartialLocationTag = Omit<LocationTag, "id" | "type">;

const openingTag = "<:$:";
const closingTag = ":$:>";

export function getLocationTag(location: PartialLocationTag) {
	const id = `${openingTag}${JSON.stringify(location)}${closingTag}`;
	const full = {
		...location,
		id,
		type: "location" as const,
	};

	idToTagCache[id] = full;

	return full;
}

//FIXME: This is a bad name. Underscores are not alphanumberic.
export function isAlphanumeric(char: string) {
	return (char >= "a" && char <= "z") || (char >= "A" && char <= "Z") || (char >= "0" && char <= "9") || char === "_";
}

export function isWhitespace(char: string) {
	return char === " " || char === "\r" || char === "\n" || char === "\t";
}

export function codeStringToRawText(codestring: CodeString): string {
	let text = "";
	let lastChar = "";
	let indent = 0;
	let justWroteWs = true;
	for (const segment of codestring) {
		if (typeof segment === "string") {
			if (segment.length === 0) continue;
			if (text.length > 0 && isAlphanumeric(segment[0]!) && isAlphanumeric(lastChar)) {
				text += " ";
			}
			lastChar = segment[segment.length - 1]!;
			text += segment;
			justWroteWs = false;
		} else if (segment.type === "line") {
			text += `\r\n${"    ".repeat(indent)}`;
		} else if (segment.type === "indent") {
			indent++;
		} else if (segment.type === "undent") {
			indent--;
		} else if (segment.type === "semi") {
			if (lastChar !== ";") {
				text += ";";
				lastChar = ";";
				justWroteWs = false;
			}
		} else if (segment.type === "whitespace") {
			if (!justWroteWs) {
				text += " ";
				justWroteWs = true;
			}
		}
	}

	return text;
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
