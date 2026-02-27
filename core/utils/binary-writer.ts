export class BinaryWriter {
	buffer = new ArrayBuffer(1024 * 1024 * 32); // I dont wanna deal with resizing the buffer so for now it's statically sized to 32mb LOLOLOLOL
	data = new DataView(this.buffer);
	ptr = 0;
	isLittleEndian = true;

	get trimmedData() {
		return new Uint8Array(this.buffer.slice(0, this.ptr));
	}

	writeU8(value: number) {
		this.data.setUint8(this.ptr, value);
		this.ptr += 2;
	}

	writeU16(value: number) {
		this.data.setUint16(this.ptr, value, this.isLittleEndian);
		this.ptr += 2;
	}

	writeU32(value: number) {
		this.data.setUint32(this.ptr, value, this.isLittleEndian);
		this.ptr += 4;
	}

	// much to my chagrin, roblox does in fact use i8's :sob:
	writeI8(value: number) {
		this.data.setInt8(this.ptr, value);
		this.ptr += 2;
	}

	writeF32(value: number) {
		this.data.setFloat32(this.ptr, value, this.isLittleEndian);
		this.ptr += 2;
	}

	writeMagic(magic: string) {
		const binary = new TextEncoder().encode(magic);

		new Uint8Array(this.buffer).set(binary, this.ptr);
		this.ptr += binary.length;
	}
}
