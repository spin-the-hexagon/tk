--!strict

local vide = require(game.ReplicatedStorage.Packages.vide)

local module = {}

local create = vide.create
local source = vide.source
local derive = vide.derive

function module.quick_spring<T>(value: () -> T): () -> T
	return vide.spring(value, 0.25, 0.8)
end

function module.soft_spring<T>(value: () -> T): () -> T
	return vide.spring(value, 0.4, 0.5)
end

function module.Header(text: string)
	return create "TextLabel" {
		BackgroundTransparency = 1,
		TextColor3 = Color3.fromHex "#ffffff",
		TextSize = 32,
		Font = Enum.Font.BuilderSansBold,
		Text = text,
		TextXAlignment = Enum.TextXAlignment.Left,
		AutomaticSize = Enum.AutomaticSize.Y,
		Size = UDim2.fromScale(1, 0),
		TextWrapped = true,
	}
end

function module.Description(text: string)
	return create "TextLabel" {
		BackgroundTransparency = 1,
		TextColor3 = Color3.new(0.368627, 0.368627, 0.368627),
		TextSize = 20,
		Font = Enum.Font.BuilderSans,
		Text = text,
		TextXAlignment = Enum.TextXAlignment.Left,
		AutomaticSize = Enum.AutomaticSize.Y,
		Size = UDim2.fromScale(1, 0),
		TextWrapped = true,
	}
end

local function changed(property: string, callback: (any) -> ())
	return vide.action(function(instance)
		local connection = instance:GetPropertyChangedSignal(property):Connect(function()
			local result = (instance :: any)[property]
			callback(result)
		end)

		vide.cleanup(connection)
	end)
end

local function forceCaps()
	return vide.action(function(instance)
		if not instance:IsA "TextBox" then
			error "not a textbox"
		end

		local connection = instance:GetPropertyChangedSignal("Text"):Connect(function()
			instance.Text = instance.Text:upper()
		end)

		vide.cleanup(connection)
	end)
end

function module.CodeInputBox(props: {
	Value: (() -> string) & ((string) -> string),
	OnSubmit: ((string) -> ()) | nil,
})
	local isHovering = source(false)
	local isFocused = source(false)

	local target_border_thickness = derive(function()
		return if isFocused() then 5 else 1
	end)

	local target_bg_color = derive(function()
		return if isFocused() then Color3.fromHex "#101010" else Color3.fromHex "#000000"
	end)

	local target_border_color = derive(function()
		return if isFocused()
			then Color3.fromRGB(0, 102, 255)
			else if isHovering() then Color3.fromHex "#555555" else Color3.fromHex "#333333"
	end)

	local border_thickness = module.soft_spring(target_border_thickness)
	local bg_color = module.quick_spring(target_bg_color)
	local border_color = module.quick_spring(target_border_color)

	return create "TextBox" {
		Size = UDim2.new(1, 0, 0, 100),
		BackgroundColor3 = bg_color,
		TextSize = 50,
		TextColor3 = Color3.fromHex "#ffffff",
		Font = Enum.Font.RobotoMono,
		PlaceholderText = "ABC123",
		Text = props.Value(),
		PlaceholderColor3 = Color3.fromHex "#2f2f2f",
		changed("Text", function(next: string)
			props.Value(next)
		end),
		forceCaps(),
		create "UICorner" {
			CornerRadius = UDim.new(0, 8),
		},
		create "UIStroke" {
			Thickness = border_thickness,
			Transparency = 0.5,
			Color = border_color,
			ApplyStrokeMode = Enum.ApplyStrokeMode.Border,
		},
		MouseEnter = function()
			isHovering(true)
		end,
		MouseLeave = function()
			isHovering(false)
		end,
		Focused = function()
			isFocused(true)
		end,
		FocusLost = function(enter_pressed)
			isFocused(false)
			if enter_pressed then
				if props.OnSubmit then
					props.OnSubmit(props.Value())
				end
			end
		end,
	}
end

function module.YSpacer(height: number)
	return create "Frame" {
		BackgroundTransparency = 1,
		Size = UDim2.new(1, 0, 0, height),
	}
end

function module.Button(props: {
	Text: string,
	OnClick: () -> (),
})
	local isHovering = source(false)
	local isPressed = source(false)

	local target_bg_color = derive(function()
		return if isPressed()
			then Color3.new(0.12549, 0.223529, 0.780392)
			else if isHovering() then Color3.new(0.219608, 0.337255, 1) else Color3.new(0.137255, 0.266667, 1)
	end)

	local bg_color = module.quick_spring(target_bg_color)

	return create "TextButton" {
		Text = props.Text,
		BackgroundColor3 = bg_color,
		TextColor3 = Color3.fromHex "#ffffff",
		AutomaticSize = Enum.AutomaticSize.XY,
		TextSize = 20,
		Font = Enum.Font.BuilderSansMedium,
		create "UIPadding" {
			PaddingTop = UDim.new(0, 10),
			PaddingBottom = UDim.new(0, 10),
			PaddingLeft = UDim.new(0, 20),
			PaddingRight = UDim.new(0, 20),
		},
		create "UICorner" {
			CornerRadius = UDim.new(0, 8),
		},
		Activated = props.OnClick,
		MouseEnter = function()
			isHovering(true)
		end,
		MouseLeave = function()
			isHovering(false)
		end,
		MouseButton1Down = function()
			isPressed(true)
		end,
		MouseButton1Up = function()
			isPressed(false)
		end,
	}
end

function module.ScreenStack(props: { Instance })
	return create "Frame" {
		Size = UDim2.fromScale(1, 1),
		BackgroundTransparency = 1,
		create "UIListLayout" {},
		props,
	}
end

return module
