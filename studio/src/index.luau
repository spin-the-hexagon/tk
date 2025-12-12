local Players = game:GetService("Players")
local React = require(game.Packages.react);
local ReactRoblox = require(game.Packages["react-roblox"]);

function App()
    return React.createElement("TextLabel", {
        Size = UDim2.new(0, 200, 0, 50),
        Position = UDim2.new(0.5, -100, 0.5, -25),
        Text = "Hello, React for Roblox!",
        BackgroundColor3 = Color3.fromRGB(255, 255, 255),
        TextColor3 = Color3.fromRGB(0, 0, 0),
        TextScaled = true,
    })
end

ReactRoblox.createRoot(Players.LocalPlayer.PlayerGui):render(
    React.createElement(App)
)