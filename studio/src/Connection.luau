--!strict

local HttpService = game:GetService "HttpService"
local Cleanup = require(script.Parent.Cleanup)
local vide = require(game.ReplicatedStorage.Packages.vide)
local Codecs = require(script.Parent.Codecs)
local Sync = require(script.Parent.Sync)

local ID_ATTRIBUTE = "TK_PROJECT_ID"

local function Connection(): Connection
	local phase = vide.source("check_id" :: Codecs.AuthMode)
	local socket = HttpService:CreateWebStreamClient(Enum.WebStreamClientType.WebSocket, {
		Url = "ws://localhost:1114/sync",
	})

	local function setup_socket(passed_socket: WebStreamClient)
		passed_socket.MessageReceived:Connect(function(message)
			local parsed = HttpService:JSONDecode(message) :: Codecs.S2CSyncMessage

			if parsed.type == "set_auth" then
				phase(parsed.mode)
			end

			if parsed.type == "set_auth" and parsed.mode == "check_id" then
				local id = parsed.projectId
				local currentId = workspace:GetAttribute(ID_ATTRIBUTE)

				if currentId == nil or currentId == id then
					workspace:SetAttribute(ID_ATTRIBUTE, id)
					passed_socket:Send(HttpService:JSONEncode({
						type = "proceed_auth",
						requestedMode = "code_input",
					} :: Codecs.C2SSyncMessage))
				else
					phase "project_synced_to_different"
				end
			end

			if parsed.type == "push_blob" then
				Sync.push_blob_unto_datamodel(parsed.entries)
			end
		end)

		local function reconnect()
			phase "check_id"

			socket = HttpService:CreateWebStreamClient(Enum.WebStreamClientType.WebSocket, {
				Url = "ws://localhost:1114/sync",
			})

			passed_socket:Close()

			setup_socket(socket)
		end

		passed_socket.Error:Connect(function(error, message)
			reconnect()
		end)

		Cleanup.onCleanup(function()
			passed_socket:Close()
		end)

		if passed_socket.ConnectionState == Enum.WebStreamClientState.Error then
			reconnect()
		end
	end

	setup_socket(socket)

	local function send_code(code: string)
		socket:Send(HttpService:JSONEncode({
			type = "verification_code",
			code = code,
		} :: Codecs.C2SSyncMessage))
	end

	return { phase = phase, send_code = send_code }
end

export type Connection = {
	phase: () -> Codecs.AuthMode,
	send_code: (code: string) -> (),
}

return Connection
