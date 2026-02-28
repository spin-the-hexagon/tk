import type { PluginMetadata } from "@core/plugin/schema";

import { TK_VERSION } from "@core/constants";
import { fs } from "@core/utils/fastfs";
import { parseXml, XmlElement } from "@rgrove/parse-xml";

import { decodeXMLNodeIntoInstance } from "./decoder";

export function pluginRBXMX(): PluginMetadata {
	return {
		name: "Roblox XML",
		id: "rbxmx",
		version: TK_VERSION,
		fileFormats: [
			{
				extension: ".rbxmx",
				type: "model",
			},
		],
		async transpileModel(props) {
			const src = await fs.readText(props.model.path);
			const xml = parseXml(src);

			if (!xml.root) {
				throw new Error("RBXMX file has no root");
			}

			const root = xml.root.children.find(x => "name" in x && x.name === "Item") as XmlElement;

			if (!root) {
				throw new Error("RBXMX file has no root item");
			}

			return await decodeXMLNodeIntoInstance(props.context.cache(), root);
		},
	};
}
