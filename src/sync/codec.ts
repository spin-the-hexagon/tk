import * as v from "valibot";

export const BlobEntry = v.union([
	v.object({
		type: v.literal("object"),
		dataModelPath: v.array(v.string()),
		objectType: v.string(),
	}),
	v.object({
		type: v.literal("attribute"),
		dataModelPath: v.array(v.string()),
		key: v.string(),
		value: v.any(),
	}),
]);

export const S2CPushBlobMessage = v.object({
	type: v.literal("push_blob"),
	entries: v.array(BlobEntry),
});

export const S2CSetAuthState = v.object({
	type: v.literal("set_auth"),
	mode: v.union([v.literal("code_input"), v.literal("authenticated"), v.literal("check_id")]),
	projectId: v.string(),
});

export const S2CSyncMessage = v.union([S2CPushBlobMessage, S2CSetAuthState]);

export const C2SProceedAuth = v.object({
	type: v.literal("proceed_auth"),
	requestedMode: v.union([v.literal("code_input")]),
});

export const C2SCode = v.object({
	type: v.literal("verification_code"),
	code: v.string(),
});

export const C2SSyncMessage = v.union([C2SProceedAuth, C2SCode]);
