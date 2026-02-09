// Roblox mesh data might just be the most f'ed up format I've ever had the displeasure of dealing with
// This DOES NOT and WILL NEVER *read* the data, it will only encode the data, so I only have to deal with one format version.
// I am sorry for this atrocity which I have released upon the world.

import { BinaryWriter } from "../utils/binary-writer";

export interface RMesh {
	verts: RVert[];
	faces: RFace[];
}

export interface RVert {
	x: number;
	y: number;
	z: number;
	normX: number;
	normY: number;
	normZ: number;
	uvU: number;
	uvV: number;
	tanX?: number;
	tanY?: number;
	tanZ?: number;
	tanS?: number;
}

export interface RFace {
	a: number;
	b: number;
	c: number;
}

export function writeRBXMesh200(mesh: RMesh) {
	const writer = new BinaryWriter();

	writer.writeMagic("version 2.00\n");

	// header
	writer.writeU16(12); //sizeof(header) == 12
	writer.writeU8(136); //sizeof(vert) == 136
	writer.writeU8(12); //sizeof(face) == 12
	writer.writeU32(mesh.verts.length);
	writer.writeU32(mesh.faces.length);

	for (const vert of mesh.verts) {
		writer.writeF32(vert.x);
		writer.writeF32(vert.y);
		writer.writeF32(vert.z);
		writer.writeF32(vert.normX);
		writer.writeF32(vert.normY);
		writer.writeF32(vert.normZ);
		writer.writeF32(vert.uvU);
		writer.writeF32(vert.uvV);
		writer.writeF32(vert.z);
		writer.writeI8(vert.tanX ?? 0);
		writer.writeI8(vert.tanY ?? 0);
		writer.writeI8(vert.tanZ ?? 0);
		writer.writeI8(vert.tanS ?? 0);
	}

	for (const face of mesh.faces) {
		writer.writeU32(face.a);
		writer.writeU32(face.b);
		writer.writeU32(face.c);
	}

	return writer.trimmedData;
}

export function writeRBXMesh100(mesh: RMesh) {
	const lines: string[] = [];
	lines.push("version 1.01");

	for (const face of mesh.faces) {
		for (const vertIdx of [face.a, face.b, face.c]) {
			const vert = mesh.verts[vertIdx]!;

			lines.push(
				`${vert.x} ${vert.y} ${vert.z} ${vert.normX} ${vert.normY} ${vert.normZ} ${vert.uvU} ${1 - vert.uvV} 0`,
			);
		}
	}

	return lines.join("\n");
}

// Roblox Open Cloud API doesn't support FileMesh upload yet-- FML
export function writeOBJ(mesh: RMesh) {
	const lines: string[] = [];
	lines.push("version 1.01");

	for (const vert of mesh.verts) {
		lines.push(`v ${vert.x} ${vert.y} ${vert.z}`);
		lines.push(`vn ${vert.normX} ${vert.normY} ${vert.normZ}`);
		lines.push(`vp ${vert.uvU} ${vert.uvV}`);
	}

	for (const face of mesh.faces) {
		lines.push(
			`f v${face.a}/vt${face.a}/vn${face.a} v${face.b}/vt${face.b}/vn${face.b} v${face.c}/vt${face.c}/vn${face.c}`,
		);
	}

	return lines.join("\n");
}
