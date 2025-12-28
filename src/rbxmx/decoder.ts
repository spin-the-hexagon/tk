import { XmlElement, XmlText } from "@rgrove/parse-xml";
import { nfError } from "../cli/logger";
import type { Cache } from "../compiler/cache";
import { Instance } from "../sync/rodom";
import { getNameMapTable } from "./database";

function tryMakeNumber(value: string): string | number {
	const asFloat = Number.parseFloat(value);

	if (Number.isFinite(asFloat)) {
		return asFloat;
	}

	return value;
}

export async function decodeXMLNodeIntoInstance(cache: Cache, node: XmlElement): Promise<Instance> {
	const instance = new Instance();

	if (node.name !== "Item") {
		throw new Error(`Expected node type Item, got '${node.type}'`);
	}

	instance.className = node.attributes["class"]!;

	const nameMapTable = await getNameMapTable(cache, instance.className);
	const properties = node.children.find(x => x instanceof XmlElement && x.name === "Properties") as
		| XmlElement
		| undefined;

	if (properties) {
		for (const child of properties.children) {
			if (!(child instanceof XmlElement)) continue;
			const name = nameMapTable[child.attributes["name"]!]!;

			if (!name) {
				nfError(`Could not find good key for ${instance.className}.${child.attributes["name"]}`);
			}

			if (child.children.length === 1 && child.children[0] instanceof XmlText) {
				instance.data[name] = tryMakeNumber(child.children[0].text);
			} else if (child.children.length === 0) {
				instance.data[name] = "";
			} else {
				let fields: Record<string, string | number> = {};

				for (const key of child.children) {
					if (!(key instanceof XmlElement)) continue;
					if (!(key.children[0] instanceof XmlText)) continue;

					fields[key.name] = tryMakeNumber(key.children[0].text);
				}

				instance.data[name] = fields;
			}
		}
	}

	if (typeof instance.data.Name === "string") {
		instance.name = instance.data.Name;
	}

	const children = node.children.filter(x => x instanceof XmlElement && x.name === "Item") as XmlElement[];

	for (const child of children) {
		instance.children.push(await decodeXMLNodeIntoInstance(cache, child));
	}

	return instance;
}
