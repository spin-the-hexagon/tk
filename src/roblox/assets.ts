import { resolve } from "node:path";
import TOML from "smol-toml";

import type { Config } from "../config/schema";

import { debug } from "../cli/logger";
import { setRobloxToken, uploadAsset } from "./api";
import { getRobloxToken } from "./auth";

export type AssetType = "Audio" | "Model" | "Image" | "Video" | "Mesh";

export type AssetCollectionData = {
	version: 1000;
	uploaded_assets: AssetCollectionDataUploadedAsset[];
};

export type AssetCollectionDataUploadedAsset = {
	id: string;
	content_hash: string;
	type: AssetType;
};

export class AssetCollection {
	data: AssetCollectionData = {
		version: 1000,
		uploaded_assets: [],
	};
	initPromise: Promise<void>;
	projectPath: string;
	config: Config;
	blockedHashes: string[] = [];

	get storagePath() {
		return resolve(this.projectPath, "assets.toml");
	}

	constructor(props: { projectPath: string; config: Config }) {
		this.projectPath = props.projectPath;
		this.config = props.config;
		this.initPromise = this.init();
		debug("assets");
	}

	private async init() {
		try {
			this.data = TOML.parse(await Bun.file(this.storagePath).text()) as any;
			debug(`Loaded ${this.storagePath}`);
		} catch {}
	}

	async save() {
		await Bun.write(this.storagePath, TOML.stringify(this.data));
	}

	async getAsset({ type, fileName, data }: { type: AssetType; fileName: string; data: Uint8Array }) {
		const hash = Bun.hash(data).toString(36);

		debug("UPLOADED");

		const current = this.data.uploaded_assets.find(x => x.content_hash === hash && x.type === type);

		if (current) {
			debug("CURRENT");
			return current;
		}

		if (this.blockedHashes.includes(hash)) {
			debug("DOUBLE HASH");
			throw new Error("Double-hash-creation, this is an issue, maybe a race condition.");
		}

		this.blockedHashes.push(hash);

		setRobloxToken(await getRobloxToken(this.config));

		const { id } = await uploadAsset({
			blob: data,
			assetName: "asset",
			type,
			fileName,
		});

		debug(id);

		const asset: AssetCollectionDataUploadedAsset = {
			content_hash: hash,
			id: id.toString(),
			type,
		};

		this.data.uploaded_assets.push(asset);

		await this.save();

		return asset;
	}
}
