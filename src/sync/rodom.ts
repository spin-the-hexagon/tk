import type { BundledItem } from "../compiler/dev-server";
import { serviceNames } from "../utils/datamodel";
import type { BlobEntry } from "./codec";

export class Instance {
	className = "Folder";
	name = "Instance";
	children: Instance[] = [];
	data: Record<string, any> = {};

	inferClass() {
		if (["DataModel", ...serviceNames].includes(this.name)) {
			this.className = this.name;
		}
	}

	findChild(path: string[]): Instance {
		const [start, ...rest] = path;

		if (!start) return this;

		let child = this.children.find(it => it.name === start);

		if (!child) {
			child = new Instance();
			child.name = start;
			child.inferClass();
			this.children.push(child);
		}

		return child.findChild(rest);
	}

	asBlobEntries(path: string[]): BlobEntry[] {
		const blobs: BlobEntry[] = [];

		if (path[0] === "game") {
			path.shift();
		}

		if (path.length !== 0) {
			blobs.push({
				type: "object",
				dataModelPath: path,
				objectType: this.className,
			});
		}

		for (const key in this.data) {
			blobs.push({
				type: "attribute",
				key,
				value: this.data[key]!,
				dataModelPath: path,
			});
		}

		for (const child of this.children) {
			blobs.push(...child.asBlobEntries([...path, child.name]));
		}

		return blobs;
	}

	addBundle(bundle: BundledItem) {
		const instance = this.findChild(bundle.dataModelPath);

		instance.className = "Script";
		instance.data.RunContext = bundle.mode === "server" ? "Server" : "Client";
		instance.data.Source = bundle.src;
	}
}
