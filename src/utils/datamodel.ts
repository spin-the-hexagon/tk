export const serviceNames = [
	"ReplicatedStorage",
	"Workspace",
	"Lighting",
	"ServerStorage",
	"ServerScriptService",
	"StarterPlayers",
	"Players",
	"RunService",
	"SoundService",
	"ReplicatedFirst",
]; // FIXME: This is *exceedingly* incomplete, in the future, we should probably fetch API documentation @ build time

export function resolveDataModelPath(...paths: string[][]) {
	let path: string[] = [];

	for (const pth of paths) {
		for (const segment of pth) {
			if (segment === "Parent") {
				path.pop();
			} else if (segment === "game") {
				path = ["game"];
			} else if (serviceNames.includes(segment)) {
				path = ["game", segment];
			} else {
				path.push(segment);
			}
		}
	}

	return path;
}
