--!strict
export type BlobEntryObject = {
	type: "object",
	dataModelPath: { string },
	objectType: string,
}

export type BlobEntryAttribute = {
	type: "attribute",
	dataModelPath: { string },
	key: string,
	value: any,
}

export type BlobEntry = BlobEntryObject | BlobEntryAttribute

export type S2CPushBlobMessage = {
	type: "push_blob",
	entries: { BlobEntry },
}

export type AuthMode = "code_input" | "authenticated" | "check_id" | "project_synced_to_different"

export type S2CSetAuthState = {
	type: "set_auth",
	mode: AuthMode,
	projectId: string,
}

export type S2CSyncMessage = S2CPushBlobMessage | S2CSetAuthState

export type C2SProceedAuth = {
	type: "proceed_auth",
	requestedMode: "code_input",
}

export type C2SCode = {
	type: "verification_code",
	code: string,
}

export type C2SSyncMessage = C2SProceedAuth | C2SCode

return {}
