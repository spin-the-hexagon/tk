import type { PluginMetadata } from "../plugin/schema";

import { TK_VERSION } from "../constants";
import { Instance } from "../sync/rodom";
import { fs } from "../utils/fastfs";

export function pluginMedia(): PluginMetadata {
	return {
		name: "Media",
		id: "media",
		version: TK_VERSION,
		fileFormats: [
			{
				extension: ".png",
				type: "model",
			},
			{
				extension: ".jpg",
				type: "model",
			},
			{
				extension: ".jpeg",
				type: "model",
			},
		],
		async transpileModel(props) {
			const src = await fs.read(props.model.path);

			const { id } = await props.assets.getAsset({
				data: src,
				fileName: props.model.path,
				type: "Image",
			});

			const instance = new Instance();

			instance.className = "Texture";
			instance.data.ColorMap = "rbxassetid://" + id;

			return instance;
		},
	};
}
