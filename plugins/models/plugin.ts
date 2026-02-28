import type { PluginMetadata } from "@core/plugin/schema";
import type { BufferAttribute, Mesh, Object3D } from "three";

import { TK_VERSION } from "@core/constants";
import { Instance } from "@core/sync/rodom";
import { fs } from "@core/utils/fastfs";
import { TODO } from "@core/utils/todo";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { match } from "ts-pattern";

import type { AssetCollection } from "../roblox/assets";

import { writeOBJ, type RFace, type RMesh, type RVert } from "./filemesh";

async function convertThreeObject(obj: Object3D, assets: AssetCollection): Promise<Instance> {
	const inst = await match(obj)
		.with({ type: "Group" }, it => {
			const inst = new Instance();
			return inst;
		})
		.with({ type: "Mesh" }, async it => {
			const mesh = it as Mesh;
			const inst = new Instance();
			inst.className = "MeshPart";
			let geo = mesh.geometry;
			geo = geo.toNonIndexed();

			const positionAttribute: BufferAttribute = geo.attributes.position as any;
			const normalAttribute: BufferAttribute = geo.attributes.normal as any;
			const uvAttribute: BufferAttribute = geo.attributes.uv as any;
			const verts: RVert[] = [];
			const faces: RFace[] = [];

			for (let i = 0; i < positionAttribute.count; i++) {
				verts.push({
					x: positionAttribute.getX(i),
					y: positionAttribute.getY(i),
					z: positionAttribute.getZ(i),
					normX: normalAttribute.getX(i),
					normY: normalAttribute.getY(i),
					normZ: normalAttribute.getZ(i),
					uvU: uvAttribute.getX(i),
					uvV: uvAttribute.getY(i),
				});
			}

			for (let i = 0; i < positionAttribute.count; i += 3) {
				faces.push({
					a: i,
					b: i + 1,
					c: i + 2,
				});
			}

			const rMesh: RMesh = {
				faces,
				verts,
			};

			const encoded = writeOBJ(rMesh);

			const { id } = await assets.getAsset({
				data: new TextEncoder().encode(encoded),
				fileName: "mesh data.obj",
				type: "Mesh",
			});

			inst.data["Content"] = id;

			return inst;
		})
		.otherwise(it => TODO(it.type));

	inst.name = obj.name;
	inst.children = await Promise.all(obj.children.map(it => convertThreeObject(it, assets)));

	inst.data["CFrame"] = {
		X: obj.position.x,
		Y: obj.position.y,
		Z: obj.position.z,
		R00: obj.matrix.elements[0],
		R01: obj.matrix.elements[1],
		R02: obj.matrix.elements[2],
		R10: obj.matrix.elements[4],
		R11: obj.matrix.elements[5],
		R12: obj.matrix.elements[6],
		R13: obj.matrix.elements[7],
		R20: obj.matrix.elements[9],
		R21: obj.matrix.elements[10],
		R22: obj.matrix.elements[11],
		R23: obj.matrix.elements[12],
	};

	return inst;
}

export function pluginModels(): PluginMetadata {
	return {
		name: "3D Models",
		id: "3dm",
		version: TK_VERSION,
		fileFormats: [
			{
				extension: ".gltf",
				type: "model",
			},
			{
				extension: ".glb",
				type: "model",
			},
		],
		async transpileModel(props) {
			const src = await fs.read(props.model.path);
			const loader = new GLTFLoader();
			const buffer = new ArrayBuffer(src.byteLength);
			new Uint8Array(buffer).set(src);
			const data = await loader.parseAsync(buffer, props.model.path);
			const scene = data.scene;

			return await convertThreeObject(scene, props.context.assets());
		},
	};
}
