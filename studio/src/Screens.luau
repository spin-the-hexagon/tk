--!strict

local vide = require(game.ReplicatedStorage.Packages.vide)
local Connection = require(script.Parent.Connection)
local UI = require(script.Parent.UI)
local module = {}

local create = vide.create
local source = vide.source

export type ScreenState = {
	Connection: Connection.Connection,
}

export type Screen = {
	Id: string,
	Component: (ScreenState) -> Instance,
	Size: UDim2,
	ForceOpen: boolean,
	Hero: string | nil,
}

local Heros = {
	Connected = "rbxassetid://84581057222648",
}

local VerificationCodeScreen: Screen = {
	Id = "code_input",
	Component = function(state: ScreenState)
		local code = source ""

		return UI.ScreenStack {
			UI.Header "Enter verification code",
			UI.YSpacer(6),
			UI.Description "A verification code protects your code and assets from malicious actors. It can be seen in the terminal running the 'tk dev' command.",
			UI.YSpacer(24),
			UI.CodeInputBox {
				Value = code,
				OnSubmit = function(val)
					state.Connection.send_code(val)
				end,
			},
			UI.YSpacer(24),
			create "Frame" {
				BackgroundTransparency = 1,
				AutomaticSize = Enum.AutomaticSize.Y,
				Size = UDim2.fromScale(1, 0),
				create "UIListLayout" {
					FillDirection = Enum.FillDirection.Horizontal,
					HorizontalAlignment = Enum.HorizontalAlignment.Right,
				},

				UI.Button {
					Text = "Submit Code",
					OnClick = function()
						state.Connection.send_code(code())
					end,
				},
			},
		}
	end,
	Size = UDim2.fromOffset(600, 400),
	ForceOpen = true,
}

local ConnectingScreen: Screen = {
	Id = "check_id",
	Component = function(state)
		return UI.ScreenStack {
			UI.Header "No connection",
			UI.YSpacer(6),
			UI.Description "tk has no connection to the development server.",
		}
	end,
	Size = UDim2.fromOffset(400, 400),
	ForceOpen = false,
}

local ConnectedScreen: Screen = {
	Id = "authenticated",
	Component = function(state)
		return UI.ScreenStack {
			UI.Header "Connected and syncing",
			UI.YSpacer(6),
			UI.Description "Changes made to code are now automatically synced to Roblox Studio.",
		}
	end,
	Hero = Heros.Connected,
	Size = UDim2.fromOffset(400, 300),
	ForceOpen = false,
}

local ErrorScreen: Screen = {
	Id = "error",
	Component = function(state)
		return UI.ScreenStack {
			UI.Header "Screen not found",
			UI.YSpacer(6),
			UI.Description "tk tried to show a screen that doesnt exist. This is not intended.",
		}
	end,
	Size = UDim2.fromOffset(400, 400),
	ForceOpen = false,
}

local SyncedToDifferentScreen: Screen = {
	Id = "project_synced_to_different",
	Component = function(state)
		return UI.ScreenStack {
			UI.Header "Project ID mismatch",
			UI.YSpacer(6),
			UI.Description "This project has been synced with a different tk project in the past. Sync has been stopped.",
		}
	end,
	Size = UDim2.fromOffset(400, 400),
	ForceOpen = false,
}

module.Screens = {
	VerificationCodeScreen,
	ErrorScreen,
	ConnectingScreen,
	ConnectedScreen,
	SyncedToDifferentScreen,
}

module.ErrorScreen = ErrorScreen

return module
