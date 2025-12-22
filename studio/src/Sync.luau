--!strict

local HttpService = game:GetService "HttpService"
local ServerStorage = game:GetService "ServerStorage"
local Codecs = require(script.Parent.Codecs)
local module = {}

function module.get_blob_store(): StringValue
	local KEY = "tkStudio - [INTERNAL] - Blob Store"
	local blob_store = ServerStorage:FindFirstChild(KEY) :: StringValue

	if not blob_store then
		blob_store = Instance.new "StringValue"
		blob_store.Parent = ServerStorage
		blob_store.Name = KEY
	end

	return blob_store
end

function module.get_old_blob(): { Codecs.BlobEntry }?
	local json = module.get_blob_store().Value

	if json == "" then
		return nil
	end

	local data = HttpService:JSONDecode(json)

	return data
end

function module.set_old_blob(blob: { Codecs.BlobEntry })
	module.get_blob_store().Value = HttpService:JSONEncode(blob)
end

-- https://github.com/luau-lang/luau/issues/395
local function slice<T>(arr: { T }, from: number?, to: number?): { T }
	local from_r: number = if from == nil then 1 else from
	local to_r: number = if to == nil then #arr else to
	local copy: { T } = table.create(to_r - from_r + 1)
	table.move(arr, from_r, to_r, 1, copy)
	return copy
end

function module.find_from_path(path: { string }): Instance?
	local result = game

	for _, segment in path do
		result = result:FindFirstChild(segment)

		if not result then
			return nil
		end
	end

	return result
end

function module.set_key(object: Instance, key: string, value: string)
	(object :: any)[key] = value
end

function module.push_blob_unto_datamodel(blob: { Codecs.BlobEntry })
	-- Decommission old entries
	do
		local old = module.get_old_blob()

		if old ~= nil then
			for idx = #old, 1, -1 do
				local entry = old[idx]

				if entry.type == "object" then
					if not table.find(old, entry) then
						local obj = module.find_from_path(entry.dataModelPath)
						if obj then
							obj.Parent = nil
						end
					end
				end

				if entry.type == "attribute" then
					-- FIXME: ATTRIBUTE CHANGES ARE NOT REVERSIBLE
				end
			end
		end
	end

	module.set_old_blob(blob)

	do
		for _, entry in blob do
			if entry.type == "attribute" then
				local object = module.find_from_path(entry.dataModelPath)

				if object then
					module.set_key(object, entry.key, entry.value)
				end
			end
			if entry.type == "object" then
				local start = slice(entry.dataModelPath, 1, #entry.dataModelPath - 1)
				local name = entry.dataModelPath[#entry.dataModelPath]
				local parent = module.find_from_path(start)

				if not parent then
					continue
				end

				local exists = false

				for _, child in parent:GetChildren() do
					if child.Name == name and child.ClassName == entry.objectType then
						exists = true
					end
				end

				if not exists then
					local inst = Instance.new(entry.objectType)

					inst.Parent = parent
					inst.Name = name
				end
			end
		end
	end
end

return module
