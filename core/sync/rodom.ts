import type { BundledItem } from "../compiler/dev-server";
import type { BlobEntry } from "./codec";

import { serviceNames } from "../utils/datamodel";

export class Instance {
	className = "Folder";
	name = "Instance";
	private _children: Instance[] = [];
	data: Record<string, any> = {};
	private _parent?: Instance;

	get children() {
		return this._children;
	}
	set children(value) {
		this._children = value;
		this.updateChildren();
	}

	get parent() {
		return this._parent;
	}
	set parent(value) {
		if (this._parent) {
			this._parent._children = this._parent._children.filter(x => x !== this);
		}
		value?.children.push(this);
		value?.updateChildren();
	}

	updateChildren() {
		for (const child of this.children) {
			child._parent = this;
		}
	}

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
			if (key === "Name") continue;
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

		if (bundle.mode === "model") {
			instance.className = bundle.data.className;
			instance.data = bundle.data.data;
			instance.children = bundle.data.children;
		} else {
			instance.className = "Script";
			instance.data.RunContext = bundle.mode === "server" ? "Server" : "Client";
			instance.data.Source = bundle.src;
		}
	}
}
