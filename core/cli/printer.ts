export function createPrinter() {
	let indent = 0;
	const lines: string[] = [];
	let wroteGap = false;

	return {
		indent() {
			indent += 4;
		},
		dedent() {
			indent -= 4;
		},
		write(text: string) {
			for (const line of text.split("\n")) {
				lines.push(" ".repeat(indent) + line);
				wroteGap = false;
			}
		},
		gap() {
			if (wroteGap) return;

			wroteGap = true;
			lines.push("");
		},
		get text() {
			return lines.join("\n");
		},
	};
}

export type Printer = ReturnType<typeof createPrinter>;
