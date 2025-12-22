--!strict

local CoreGui = game:GetService "CoreGui"
local Connection = require(script.Connection)
local Icons = require(script.Icons)
local Screens = require(script.Screens)
local vide = require(game.ReplicatedStorage.Packages.vide)
local UI = require(script.UI)

local create = vide.create
local source = vide.source
local derive = vide.derive

local function App()
	local conn = Connection()
	local hovering = source(false)
	local active_screen = derive(function()
		for _, screen in Screens.Screens do
			if screen.Id == conn.phase() then
				return screen
			end
		end

		return Screens.ErrorScreen
	end)
	local big_size = derive(function()
		return active_screen().Size
	end)
	local target_size = derive(function()
		local screen = active_screen()

		if hovering() or screen.ForceOpen then
			return screen.Size
		end

		return UDim2.fromOffset(40, 40)
	end)
	local hero = derive(function()
		return active_screen().Hero
	end)

	local size = UI.quick_spring(target_size)
	local screenTable = {}

	for _, screen in Screens.Screens do
		screenTable[screen.Id] = screen.Component {
			Connection = conn,
		}
	end

	local content = derive(function()
		local result = screenTable[conn.phase()]

		if result then
			return result
		end

		print("NO SCREEN " .. conn.phase())

		return screenTable["error"]
	end)

	return create "ScreenGui" {
		Name = "tkStudio",
		create "Frame" {
			Position = UDim2.new(1, -12, 1, -12),
			AnchorPoint = Vector2.one,
			Size = size,
			ClipsDescendants = true,
			BackgroundColor3 = Color3.fromHex "#000000",
			create "UICorner" {
				CornerRadius = UDim.new(0, 8),
			},
			create "ImageLabel" {
				Image = Icons.TKIcon,
				BackgroundTransparency = 1,
				Size = UDim2.fromOffset(40, 40),
				AnchorPoint = Vector2.one,
				Position = UDim2.fromScale(1, 1),
			},
			create "Frame" {
				BackgroundTransparency = 1,
				AnchorPoint = Vector2.new(1, 1),
				Position = UDim2.fromScale(1, 1),
				Size = big_size,
				create "UIListLayout" { SortOrder = Enum.SortOrder.Name },
				vide.show(hero, function()
					return create "ImageLabel" {
						Name = "1",
						Image = hero(),
						Size = UDim2.fromScale(1, 0.4033333333),
						SizeConstraint = Enum.SizeConstraint.RelativeXX,
					}
				end),
				create "Frame" {
					Name = "2",
					BackgroundTransparency = 1,
					AutomaticSize = Enum.AutomaticSize.XY,
					create "UIPadding" {
						PaddingTop = UDim.new(0, 24),
						PaddingBottom = UDim.new(0, 24),
						PaddingLeft = UDim.new(0, 24),
						PaddingRight = UDim.new(0, 24),
					},
					content,
				},
			},
			MouseEnter = function()
				hovering(true)
			end,
			MouseLeave = function()
				hovering(false)
			end,
		},
	}
end

local previous = CoreGui:FindFirstChild "tkStudio"

if previous then
	previous.Parent = nil
end

vide.mount(App, CoreGui)
