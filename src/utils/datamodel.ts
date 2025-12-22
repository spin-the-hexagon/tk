export const serviceNames = [
	"ReplicatedStorage",
	"Workspace",
	"Lighting",
	"ServerStorage",
	"ServerScriptService",
	"StarterPlayer",
	"Players",
	"RunService",
	"SoundService",
	"ReplicatedFirst",
	"TweenService",
	"MarketplaceService",
	"SoundService",
	"CollectionService",
	"DataStoreService",
	"MemoryStoreService",
	"MessagingService",
	"CoreGui",
	"MaterialSerice",
	"NetworkClient",
	"PluginDebugService",
	"PluginGuiService",
	"RobloxPluginGuiService",
	"StarterGui",
	"StarterPack",
	"Teams",
	"SoundService",
	"TextChatService",
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
