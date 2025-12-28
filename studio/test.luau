
-- bundled with tk (pronounced tick) by 'spin the hexagon'
-- rights are reserved, but not by us
-- you can mess around as much as you want, we (STH) don't care, the game devs might.
-- https://github.com/spin-the-hexagon/tk
-- [tkpack]
-- basically the webpack runtime, but TK
-- made with <3 by spin-the-hexagon
--
-- no rights reserved
-- do whatever you want

 local tkpack = {}

tkpack.moduleTable = {}
tkpack.includedModules = {}
tkpack.moduleReturns = {}

function tkpack.declare(modulePath: string, init: () -> any)
	tkpack.moduleTable[modulePath] = init
 end

 function tkpack.include(modulePath: string)
	if table.find(tkpack.includedModules, modulePath) then
		return tkpack.moduleReturns[modulePath]
	end

	table.insert(tkpack.includedModules, modulePath)

	tkpack.moduleReturns[modulePath] = tkpack.moduleTable[modulePath]()

	return tkpack.moduleReturns[modulePath]
end

-- [/tkpack]

-- D:\Programming\toolkit\studio\src\index.luau
 tkpack.declare("game.ReplicatedStorage.TK",function()
    local CoreGui=game:GetService("CoreGui");
    local Connection=tkpack.include("game.ReplicatedStorage.TK.Connection");
    local Icons=tkpack.include("game.ReplicatedStorage.TK.Icons");
    local Screens=tkpack.include("game.ReplicatedStorage.TK.Screens");
    local vide=tkpack.include("game.ReplicatedStorage.Packages.vide");
    local UI=tkpack.include("game.ReplicatedStorage.TK.UI");
    local create=vide.create;
    local source=vide.source;
    local derive=vide.derive;
    local function App()
        local conn=Connection();
        local hovering=source(false);
        local active_screen=derive(function()
            for _,screen in Screens.Screens do
                 if(screen.Id)==(conn.phase())then
                     return screen
                 end
             end;
            return Screens.ErrorScreen
         end);
        local big_size=derive(function()
            return active_screen().Size
         end);
        local target_size=derive(function()
            local screen=active_screen();
            if(hovering())or(screen.ForceOpen)then
                 return screen.Size
             end;
            return UDim2.fromOffset(40,40)
        end);
        local hero=derive(function()
            return active_screen().Hero
         end);
        local size=UI.quick_spring(target_size);
        local screenTable={};
        for _,screen in Screens.Screens do
             screenTable[screen.Id]=screen.Component({["Connection"]=conn})
        end;
        local content=derive(function()
            local result=screenTable[conn.phase()];
            if result then
                 return result
             end;
            print(("NO SCREEN ")..(conn.phase()));
            return screenTable["error"]
        end);
        return create("ScreenGui")({["Name"]="tkStudio",create("Frame")({["Position"]=UDim2.new(1,-(12),1,-(12)),["AnchorPoint"]=Vector2.one,["Size"]=size,["ClipsDescendants"]=true,["BackgroundColor3"]=Color3.fromHex("\x23000000"),create("UICorner")({["CornerRadius"]=UDim.new(0,8)}),create("ImageLabel")({["Image"]=Icons.TKIcon,["BackgroundTransparency"]=1,["Size"]=UDim2.fromOffset(40,40),["AnchorPoint"]=Vector2.one,["Position"]=UDim2.fromScale(1,1)}),create("Frame")({["BackgroundTransparency"]=1,["AnchorPoint"]=Vector2.new(1,1),["Position"]=UDim2.fromScale(1,1),["Size"]=big_size,create("UIListLayout")({["SortOrder"]=Enum.SortOrder.Name}),vide.show(hero,function()
            return create("ImageLabel")({["Name"]="1",["Image"]=hero(),["Size"]=UDim2.fromScale(1,0.4033333333),["SizeConstraint"]=Enum.SizeConstraint.RelativeXX})
        end),create("Frame")({["Name"]="2",["BackgroundTransparency"]=1,["AutomaticSize"]=Enum.AutomaticSize.XY,create("UIPadding")({["PaddingTop"]=UDim.new(0,24),["PaddingBottom"]=UDim.new(0,24),["PaddingLeft"]=UDim.new(0,24),["PaddingRight"]=UDim.new(0,24)}),content})}),["MouseEnter"]=function()
            hovering(true)
        end,["MouseLeave"]=function()
            hovering(false)
        end})})
    end;
    local previous=CoreGui:FindFirstChild("tkStudio");
    if previous then
         previous.Parent=nil
     end;
    vide.mount(App,CoreGui)

end)
-- D:\Programming\toolkit\studio\src\Connection.luau
 tkpack.declare("game.ReplicatedStorage.TK.Connection",function()
    local HttpService=game:GetService("HttpService");
    local Cleanup=tkpack.include("game.ReplicatedStorage.TK.Cleanup");
    local vide=tkpack.include("game.ReplicatedStorage.Packages.vide");
    local Codecs=tkpack.include("game.ReplicatedStorage.TK.Codecs");
    local Sync=tkpack.include("game.ReplicatedStorage.TK.Sync");
    local ID_ATTRIBUTE="TK_PROJECT_ID";
    local function Connection()
        local phase=vide.source("check_id");
        local socket=HttpService:CreateWebStreamClient(Enum.WebStreamClientType.WebSocket,{["Url"]="ws://localhost:1114/sync"});
        local function setup_socket(passed_socket)
            passed_socket.MessageReceived:Connect(function(message)
                local parsed=HttpService:JSONDecode(message);
                if(parsed.type)==("set_auth")then
                     phase(parsed.mode)
                end;
                if((parsed.type)==("set_auth"))and((parsed.mode)==("check_id"))then
                     local id=parsed.projectId;
                    local currentId=workspace:GetAttribute(ID_ATTRIBUTE);
                    if((currentId)==(nil))or((currentId)==(id))then
                         workspace:SetAttribute(ID_ATTRIBUTE,id);
                        passed_socket:Send(HttpService:JSONEncode({["type"]="proceed_auth",["requestedMode"]="code_input"}))
                    else
                         phase("project_synced_to_different")
                    end
                 end;
                if(parsed.type)==("push_blob")then
                     Sync.push_blob_unto_datamodel(parsed.entries)
                end
             end);
            local function reconnect()
                phase("check_id");
                socket=HttpService:CreateWebStreamClient(Enum.WebStreamClientType.WebSocket,{["Url"]="ws://localhost:1114/sync"});
                passed_socket:Close();
                setup_socket(socket)
            end;
            passed_socket.Error:Connect(function(error,message)
                reconnect()
            end);
            Cleanup.onCleanup(function()
                passed_socket:Close()
            end);
            if(passed_socket.ConnectionState)==(Enum.WebStreamClientState.Error)then
                 reconnect()
            end
         end;
        setup_socket(socket);
        local function send_code(code)
            socket:Send(HttpService:JSONEncode({["type"]="verification_code",["code"]=code}))
        end;
        return{["phase"]=phase,["send_code"]=send_code}
    end;
    type("not printable... yet");
    return Connection

 end)
-- D:\Programming\toolkit\studio\src\Icons.luau
 tkpack.declare("game.ReplicatedStorage.TK.Icons",function()
    local TkIcon="rbxassetid://117761877522561";
    return{["TKIcon"]=TkIcon}

end)
-- D:\Programming\toolkit\studio\src\Screens.luau
 tkpack.declare("game.ReplicatedStorage.TK.Screens",function()
    local vide=tkpack.include("game.ReplicatedStorage.Packages.vide");
    local Connection=tkpack.include("game.ReplicatedStorage.TK.Connection");
    local UI=tkpack.include("game.ReplicatedStorage.TK.UI");
    local module={};
    local create=vide.create;
    local source=vide.source;
    type("not printable... yet");
    type("not printable... yet");
    local Heros={["Connected"]="rbxassetid://84581057222648"};
    local VerificationCodeScreen={["Id"]="code_input",["Component"]=function(state)
        local code=source("");
        return UI.ScreenStack({UI.Header("Enter verification code"),UI.YSpacer(6),UI.Description("A verification code protects your code and assets from malicious actors. It can be seen in the terminal running the 'tk dev' command."),UI.YSpacer(24),UI.CodeInputBox({["Value"]=code,["OnSubmit"]=function(val)
            state.Connection.send_code(val)
        end}),UI.YSpacer(24),create("Frame")({["BackgroundTransparency"]=1,["AutomaticSize"]=Enum.AutomaticSize.Y,["Size"]=UDim2.fromScale(1,0),create("UIListLayout")({["FillDirection"]=Enum.FillDirection.Horizontal,["HorizontalAlignment"]=Enum.HorizontalAlignment.Right}),UI.Button({["Text"]="Submit Code",["OnClick"]=function()
            state.Connection.send_code(code())
        end})})})
    end,["Size"]=UDim2.fromOffset(600,400),["ForceOpen"]=true};
    local ConnectingScreen={["Id"]="check_id",["Component"]=function(state)
        return UI.ScreenStack({UI.Header("No connection"),UI.YSpacer(6),UI.Description("tk has no connection to the development server.")})
    end,["Size"]=UDim2.fromOffset(400,400),["ForceOpen"]=false};
    local ConnectedScreen={["Id"]="authenticated",["Component"]=function(state)
        return UI.ScreenStack({UI.Header("Connected and syncing"),UI.YSpacer(6),UI.Description("Changes made to code are now automatically synced to Roblox Studio.")})
    end,["Hero"]=Heros.Connected,["Size"]=UDim2.fromOffset(400,300),["ForceOpen"]=false};
    local ErrorScreen={["Id"]="error",["Component"]=function(state)
        return UI.ScreenStack({UI.Header("Screen not found"),UI.YSpacer(6),UI.Description("tk tried to show a screen that doesnt exist. This is not intended.")})
    end,["Size"]=UDim2.fromOffset(400,400),["ForceOpen"]=false};
    local SyncedToDifferentScreen={["Id"]="project_synced_to_different",["Component"]=function(state)
        return UI.ScreenStack({UI.Header("Project ID mismatch"),UI.YSpacer(6),UI.Description("This project has been synced with a different tk project in the past. Sync has been stopped.")})
    end,["Size"]=UDim2.fromOffset(400,400),["ForceOpen"]=false};
    module.Screens={VerificationCodeScreen,ErrorScreen,ConnectingScreen,ConnectedScreen,SyncedToDifferentScreen};
    module.ErrorScreen=ErrorScreen;
    return module

 end)
-- D:\Programming\toolkit\studio\packages\vide.lua
 tkpack.declare("game.ReplicatedStorage.Packages.vide",function()
    return tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide")

end)
-- D:\Programming\toolkit\studio\src\UI.luau
 tkpack.declare("game.ReplicatedStorage.TK.UI",function()
    local vide=tkpack.include("game.ReplicatedStorage.Packages.vide");
    local module={};
    local create=vide.create;
    local source=vide.source;
    local derive=vide.derive;
    function module.quick_spring(value)
        return vide.spring(value,0.25,0.8)
    end;
    function module.soft_spring(value)
        return vide.spring(value,0.4,0.5)
    end;
    function module.Header(text)
        return create("TextLabel")({["BackgroundTransparency"]=1,["TextColor3"]=Color3.fromHex("\x23ffffff"),["TextSize"]=32,["Font"]=Enum.Font.BuilderSansBold,["Text"]=text,["TextXAlignment"]=Enum.TextXAlignment.Left,["AutomaticSize"]=Enum.AutomaticSize.Y,["Size"]=UDim2.fromScale(1,0),["TextWrapped"]=true})
    end;
    function module.Description(text)
        return create("TextLabel")({["BackgroundTransparency"]=1,["TextColor3"]=Color3.new(0.368627,0.368627,0.368627),["TextSize"]=20,["Font"]=Enum.Font.BuilderSans,["Text"]=text,["TextXAlignment"]=Enum.TextXAlignment.Left,["AutomaticSize"]=Enum.AutomaticSize.Y,["Size"]=UDim2.fromScale(1,0),["TextWrapped"]=true})
    end;
    local function changed(property,callback)
        return vide.action(function(instance)
            local connection=instance:GetPropertyChangedSignal(property):Connect(function()
                local result=(instance)[property];
                callback(result)
            end);
            vide.cleanup(connection)
        end)
    end;
    local function forceCaps()
        return vide.action(function(instance)
            if not(instance:IsA("TextBox"))then
                 error("not a textbox")
            end;
            local connection=instance:GetPropertyChangedSignal("Text"):Connect(function()
                instance.Text=instance.Text:upper()
            end);
            vide.cleanup(connection)
        end)
    end;
    function module.CodeInputBox(props)
        local isHovering=source(false);
        local isFocused=source(false);
        local target_border_thickness=derive(function()
            return if isFocused()then 5 else 1
         end);
        local target_bg_color=derive(function()
            return if isFocused()then Color3.fromHex("\x23101010")else Color3.fromHex("\x23000000")
        end);
        local target_border_color=derive(function()
            return if isFocused()then Color3.fromRGB(0,102,255)else if isHovering()then Color3.fromHex("\x23555555")else Color3.fromHex("\x23333333")
        end);
        local border_thickness=module.soft_spring(target_border_thickness);
        local bg_color=module.quick_spring(target_bg_color);
        local border_color=module.quick_spring(target_border_color);
        return create("TextBox")({["Size"]=UDim2.new(1,0,0,100),["BackgroundColor3"]=bg_color,["TextSize"]=50,["TextColor3"]=Color3.fromHex("\x23ffffff"),["Font"]=Enum.Font.RobotoMono,["PlaceholderText"]="ABC123",["Text"]=props.Value(),["PlaceholderColor3"]=Color3.fromHex("\x232f2f2f"),changed("Text",function(next)
            props.Value(next)
        end),forceCaps(),create("UICorner")({["CornerRadius"]=UDim.new(0,8)}),create("UIStroke")({["Thickness"]=border_thickness,["Transparency"]=0.5,["Color"]=border_color,["ApplyStrokeMode"]=Enum.ApplyStrokeMode.Border}),["MouseEnter"]=function()
            isHovering(true)
        end,["MouseLeave"]=function()
            isHovering(false)
        end,["Focused"]=function()
            isFocused(true)
        end,["FocusLost"]=function(enter_pressed)
            isFocused(false);
            if enter_pressed then
                 if props.OnSubmit then
                     props.OnSubmit(props.Value())
                end
             end
         end})
    end;
    function module.YSpacer(height)
        return create("Frame")({["BackgroundTransparency"]=1,["Size"]=UDim2.new(1,0,0,height)})
    end;
    function module.Button(props)
        local isHovering=source(false);
        local isPressed=source(false);
        local target_bg_color=derive(function()
            return if isPressed()then Color3.new(0.12549,0.223529,0.780392)else if isHovering()then Color3.new(0.219608,0.337255,1)else Color3.new(0.137255,0.266667,1)
        end);
        local bg_color=module.quick_spring(target_bg_color);
        return create("TextButton")({["Text"]=props.Text,["BackgroundColor3"]=bg_color,["TextColor3"]=Color3.fromHex("\x23ffffff"),["AutomaticSize"]=Enum.AutomaticSize.XY,["TextSize"]=20,["Font"]=Enum.Font.BuilderSansMedium,create("UIPadding")({["PaddingTop"]=UDim.new(0,10),["PaddingBottom"]=UDim.new(0,10),["PaddingLeft"]=UDim.new(0,20),["PaddingRight"]=UDim.new(0,20)}),create("UICorner")({["CornerRadius"]=UDim.new(0,8)}),["Activated"]=props.OnClick,["MouseEnter"]=function()
            isHovering(true)
        end,["MouseLeave"]=function()
            isHovering(false)
        end,["MouseButton1Down"]=function()
            isPressed(true)
        end,["MouseButton1Up"]=function()
            isPressed(false)
        end})
    end;
    function module.ScreenStack(props)
        return create("Frame")({["Size"]=UDim2.fromScale(1,1),["BackgroundTransparency"]=1,create("UIListLayout")({}),props})
    end;
    return module

 end)
-- D:\Programming\toolkit\studio\src\Cleanup.luau
 tkpack.declare("game.ReplicatedStorage.TK.Cleanup",function()
    local globalCleanupKey="TK_CLEANUP";
    if _G[globalCleanupKey]then
         for _,cleanup in _G[globalCleanupKey]do
             cleanup()
        end
     end;
    _G[globalCleanupKey]={};
    local module={};
    function module.onCleanup(cb)
        table.insert(_G[globalCleanupKey],cb)
    end;
    return module

 end)
-- D:\Programming\toolkit\studio\src\Codecs.luau
 tkpack.declare("game.ReplicatedStorage.TK.Codecs",function()
    type("not printable... yet");
    type("not printable... yet");
    type("not printable... yet");
    type("not printable... yet");
    type("not printable... yet");
    type("not printable... yet");
    type("not printable... yet");
    type("not printable... yet");
    type("not printable... yet");
    type("not printable... yet");
    return{}

end)
-- D:\Programming\toolkit\studio\src\Sync.luau
 tkpack.declare("game.ReplicatedStorage.TK.Sync",function()
    local HttpService=game:GetService("HttpService");
    local ServerStorage=game:GetService("ServerStorage");
    local Codecs=tkpack.include("game.ReplicatedStorage.TK.Codecs");
    local module={};
    function module.get_blob_store()
        local KEY="tkStudio - [INTERNAL] - Blob Store";
        local blob_store=ServerStorage:FindFirstChild(KEY);
        if not(blob_store)then
             blob_store=Instance.new("StringValue");
            blob_store.Parent=ServerStorage;
            blob_store.Name=KEY
         end;
        return blob_store
     end;
    function module.get_old_blob()
        local json=module.get_blob_store().Value;
        if(json)==("")then
             return nil
         end;
        local data=HttpService:JSONDecode(json);
        return data
     end;
    function module.set_old_blob(blob)
        module.get_blob_store().Value=HttpService:JSONEncode(blob)
    end;
    local function slice(arr,from,to)
        local from_r=if(from)==(nil)then 1 else from;
        local to_r=if(to)==(nil)then#(arr)else to;
        local copy=table.create(((to_r)-(from_r))+(1));
        table.move(arr,from_r,to_r,1,copy);
        return copy
     end;
    function module.find_from_path(path)
        local result=game;
        for _,segment in path do
             result=result:FindFirstChild(segment);
            if not(result)then
                 return nil
             end
         end;
        return result
     end;
    function module.set_key(object,key,value)
        local current,err=pcall(function()
            return(object)[key]
        end);
        if err then
             return
         end;
        local real_value=value;
        if(typeof(current))==("CFrame")then
             real_value=CFrame.fromMatrix(Vector3.new(value.X,value.Y,value.Z),Vector3.new(value.R00,value.R01,value.R02),Vector3.new(value.R10,value.R11,value.R12),Vector3.new(value.R20,value.R21,value.R22))
        end;
        if(typeof(current))==("Vector3")then
             real_value=Vector3.new(value.X,value.Y,value.Z)
        end;
        if((typeof(current))==("Color3"))and((typeof(real_value))==("number"))then
             local blue=(value)%(256);
            local green=(math.floor((value)/(256)))%(256);
            local red=(math.floor(((value)/(256))/(256)))%(256);
            local alpha=(math.floor((((value)/(256))/(256))/(256)))%(256);
            real_value=Color3.fromRGB(red,green,blue)
        end;
        if((typeof(current))==("PhysicalProperties"))or((key)==("CustomPhysicalProperties"))then
             real_value=PhysicalProperties.new(Enum.Material.Plastic);
            if value.Density then
                 real_value.Density=value.Density
             end;
            if value.Elasticity then
                 real_value.Elasticity=value.Elasticity
             end;
            if value.ElasticityWeight then
                 real_value.ElasticityWeight=value.ElasticityWeight
             end;
            if value.Friction then
                 real_value.Friction=value.Friction
             end;
            if value.FrictionWeight then
                 real_value.FrictionWeight=value.FrictionWeight
             end;
            if(value.CustomPhysics)==(false)then
                 real_value=nil
             end
         end;
        (object)[key]=real_value
     end;
    function module.push_blob_unto_datamodel(blob)
        do
             local old=module.get_old_blob();
            if(old)~=(nil)then
                 for idx=#(old),1,-(1)do
                     local entry=old[idx];
                    if(entry.type)==("object")then
                         if not(table.find(old,entry))then
                             local obj=module.find_from_path(entry.dataModelPath);
                            if obj then
                                 obj.Parent=nil
                             end
                         end
                     end;
                    if(entry.type)==("attribute")then
                        
                     end
                 end
             end
         end;
        module.set_old_blob(blob);
        do
             for _,entry in blob do
                 if(entry.type)==("attribute")then
                     local object=module.find_from_path(entry.dataModelPath);
                    if object then
                         module.set_key(object,entry.key,entry.value)
                    end
                 end;
                if(entry.type)==("object")then
                     local start=slice(entry.dataModelPath,1,(#(entry.dataModelPath))-(1));
                    local name=entry.dataModelPath[#(entry.dataModelPath)];
                    local parent=module.find_from_path(start);
                    if not(parent)then
                         continue
                     end;
                    local exists=false;
                    for _,child in parent:GetChildren()do
                         if((child.Name)==(name))and((child.ClassName)==(entry.objectType))then
                             exists=true
                         end
                     end;
                    if not(exists)then
                         local inst=Instance.new(entry.objectType);
                        inst.Parent=parent;
                        inst.Name=name
                     end
                 end
             end
         end
     end;
    return module

 end)
-- D:\Programming\toolkit\studio\packages\_Index\centau_vide@0.3.1\vide\src\init.luau
 tkpack.declare("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide",function()
    local version={["major"]=0,["minor"]=3,["patch"]=1};
    if not(game)then
         script=require("test/relative-string")
    end;
    local root=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.root");
    local mount=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.mount");
    local create=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.create");
    local apply=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.apply");
    local source=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.source");
    local effect=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.effect");
    local derive=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.derive");
    local cleanup=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.cleanup");
    local untrack=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.untrack");
    local read=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.read");
    local batch=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.batch");
    local context=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.context");
    local switch=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.switch");
    local show=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.show");
    local indexes,values=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.maps")();
    local spring,update_springs=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.spring")();
    local action=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.action")();
    local changed=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.changed");
    local throw=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.throw");
    local flags=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.flags");
    type("not printable... yet");
    type("not printable... yet");
    type("not printable... yet");
    type("not printable... yet");
    local function step(dt)
        if game then
             debug.profilebegin("VIDE STEP");
            debug.profilebegin("VIDE SPRING")
        end;
        update_springs(dt);
        if game then
             debug.profileend();
            debug.profileend()
        end
     end;
    local stepped=(game)and(game:GetService("RunService").Heartbeat:Connect(function(dt)
        task.defer(step,dt)
    end));
    local vide={["version"]=version,["root"]=root,["mount"]=mount,["create"]=create,["source"]=source,["effect"]=effect,["derive"]=derive,["switch"]=switch,["show"]=show,["indexes"]=indexes,["values"]=values,["cleanup"]=cleanup,["untrack"]=untrack,["read"]=read,["batch"]=batch,["context"]=context,["spring"]=spring,["action"]=action,["changed"]=changed,["strict"]=(nil),["apply"]=function(instance)
        return function(props)
            apply(instance,props);
            return instance
         end
     end,["step"]=function(dt)
        if stepped then
             stepped:Disconnect();
            stepped=nil
         end;
        step(dt)
    end};
    setmetatable(vide,{["__index"]=function(_,index)
        if(index)==("strict")then
             return flags.strict
         else
             throw(`{tostring(index)} is not a valid member of vide`)
        end
     end,["__newindex"]=function(_,index,value)
        if(index)==("strict")then
             flags.strict=value
         else
             throw(`{tostring(index)} is not a valid member of vide`)
        end
     end});
    return vide

 end)
-- D:\Programming\toolkit\studio\packages\_Index\centau_vide@0.3.1\vide\src\root.luau
 tkpack.declare("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.root",function()
    if not(game)then
         script=require("test/relative-string")
    end;
    local throw=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.throw");
    local graph=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.graph");
    type("not printable... yet");
    local create_node=graph.create_node;
    local push_scope=graph.push_scope;
    local pop_scope=graph.pop_scope;
    local destroy=graph.destroy;
    local refs={};
    local function root(fn)
        local node=create_node(false,false,false);
        refs[node]=true;
        local destroy=function()
            if not(refs[node])then
                 throw("root already destroyed")
            end;
            refs[node]=nil;
            destroy(node)
        end;
        push_scope(node);
        local function efn(err)
            return debug.traceback(err,3)
        end;
        local result={xpcall(fn,efn,destroy)};
        pop_scope();
        if not(result[1])then
             destroy();
            throw(`error while running root():\x0a\x0a{result[2]}`)
        end;
        return destroy,unpack(result,2)
    end;
    return root

 end)
-- D:\Programming\toolkit\studio\packages\_Index\centau_vide@0.3.1\vide\src\mount.luau
 tkpack.declare("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.mount",function()
    if not(game)then
         script=require("test/relative-string")
    end;
    local root=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.root");
    local apply=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.apply");
    local function mount(component,target)
        return root(function()
            local result=component();
            if target then
                 apply(target,{result})
            end
         end)
    end;
    return mount

 end)
-- D:\Programming\toolkit\studio\packages\_Index\centau_vide@0.3.1\vide\src\create.luau
 tkpack.declare("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.create",function()
    if not(game)then
         script=require("test/relative-string")
    end;
    local typeof=((game)and(typeof))or(require("test/mock").typeof);
    local Instance=((game)and(Instance))or(require("test/mock").Instance);
    local throw=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.throw");
    local defaults=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.defaults");
    local apply=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.apply");
    local ctor_cache={};
    setmetatable(ctor_cache,{["__index"]=function(self,class)
        local ok,instance=pcall(Instance.new,class);
        if not(ok)then
             throw(`invalid class name, could not create instance of class {class}`)
        end;
        local default=defaults[class];
        if default then
             for i,v in next,default do
                (instance)[i]=v
             end
         end;
        local function ctor(properties)
            return apply(instance:Clone(),properties)
        end;
        self[class]=ctor;
        return ctor
     end});
    local function create_instance(class)
        return ctor_cache[class]
    end;
    local function clone_instance(instance)
        return function(properties)
            local clone=instance:Clone();
            if not(clone)then
                 throw("attempt to clone a non-archivable instance")
            end;
            return apply(clone,properties)
        end
     end;
    local function create(class_or_instance)
        if(type(class_or_instance))==("string")then
             return create_instance(class_or_instance)
        elseif(typeof(class_or_instance))==("Instance")then
             return clone_instance(class_or_instance)
        else
             throw(("bad argument \x231, expected string or instance, got ")..(typeof(class_or_instance)));
            return nil
         end
     end;
    type("not printable... yet");
    return(create)

end)
-- D:\Programming\toolkit\studio\packages\_Index\centau_vide@0.3.1\vide\src\apply.luau
 tkpack.declare("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.apply",function()
    if not(game)then
         script=require("test/relative-string")
    end;
    local typeof=((game)and(typeof))or(require("test/mock").typeof);
    local Vector2=((game)and(Vector2))or(require("test/mock").Vector2);
    local UDim2=((game)and(UDim2))or(require("test/mock").UDim2);
    local flags=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.flags");
    local throw=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.throw");
    local bind=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.bind");
    local _,is_action=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.action")();
    local graph=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.graph");
    type("not printable... yet");
    type("not printable... yet");
    type("not printable... yet");
    type("not printable... yet");
    local free_caches;
    local function borrow_caches()
        if free_caches then
             local caches=free_caches;
            free_caches=nil;
            return caches
         else
             return{["events"]={},["actions"]=setmetatable({},{["__index"]=function(self,i)
                self[i]={};
                return self[i]
            end}),["nested_debug"]=setmetatable({},{["__index"]=function(self,i)
                self[i]={};
                return self[i]
            end}),["nested_stack"]={}}
        end
     end;
    local function return_caches(caches)
        free_caches=caches
     end;
    local aggregates={};
    for name,class in{["CFrame"]=CFrame,["Color3"]=Color3,["UDim"]=UDim,["UDim2"]=UDim2,["Vector2"]=Vector2,["Vector3"]=Vector3,["Rect"]=Rect}do
         aggregates[name]=class.new
     end;
    local function apply(instance,properties)
        if not(properties)then
             throw("attempt to call a constructor returned by create() with no properties")
        end;
        local strict=flags.strict;
        local parent=properties.Parent;
        local caches=borrow_caches();
        local events=caches.events;
        local actions=caches.actions;
        local nested_debug=caches.nested_debug;
        local nested_stack=caches.nested_stack;
        local depth=1;
        repeat
             for property,value in properties do
                 if(property)==("Parent")then
                     continue
                 end;
                if(type(property))==("string")then
                     if strict then
                         if nested_debug[depth][property]then
                             throw(`duplicate property {property} at depth {depth}`)
                        end;
                        nested_debug[depth][property]=true
                     end;
                    if(type(value))==("table")then
                         local ctor=aggregates[typeof((instance)[property])];
                        if(ctor)==(nil)then
                             throw(`cannot aggregate type {typeof(value)} for property {property}`)
                        end;
                        (instance)[property]=ctor(unpack(value))
                    elseif(type(value))==("function")then
                         if(typeof((instance)[property]))==("RBXScriptSignal")then
                             events[property]=value
                         else
                             bind.property(instance,property,value)
                        end
                     else
                        (instance)[property]=value
                     end
                 elseif(type(property))==("number")then
                     if(type(value))==("function")then
                         bind.children(instance,value)
                    elseif(type(value))==("table")then
                         if is_action(value)then
                             table.insert(actions[(value).priority],(value).callback)
                        else
                             table.insert(nested_stack,value);
                            table.insert(nested_stack,(depth)+(1))
                        end
                     else
                        (value).Parent=instance
                     end
                 end
             end;
            depth=table.remove(nested_stack);
            properties=table.remove(nested_stack)
        until not(properties);
        for event,listener in next,events do
            (instance)[event]:Connect(listener)
        end;
        for _,queued in next,actions do
             for _,callback in next,queued do
                 callback(instance)
            end
         end;
        if parent then
             if(type(parent))==("function")then
                 bind.parent(instance,parent)
            else
                 instance.Parent=parent
             end
         end;
        table.clear(events);
        for _,queued in next,actions do
             table.clear(queued)
        end;
        if strict then
             table.clear(nested_debug)
        end;
        table.clear(nested_stack);
        return_caches(caches);
        return instance
     end;
    return apply

 end)
-- D:\Programming\toolkit\studio\packages\_Index\centau_vide@0.3.1\vide\src\source.luau
 tkpack.declare("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.source",function()
    if not(game)then
         script=require("test/relative-string")
    end;
    local graph=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.graph");
    type("not printable... yet");
    local create_source_node=graph.create_source_node;
    local push_child_to_scope=graph.push_child_to_scope;
    local update_descendants=graph.update_descendants;
    type("not printable... yet");
    local function source(initial_value)
        local node=create_source_node(initial_value);
        return function(...)
            if(select("\x23",...))==(0)then
                 push_child_to_scope(node);
                return node.cache
             end;
            local v=...;
            if((node.cache)==(v))and((((type(v))~=("table"))or(table.isfrozen(v))))then
                 return v
             end;
            node.cache=v;
            update_descendants(node);
            return v
         end
     end;
    return source

 end)
-- D:\Programming\toolkit\studio\packages\_Index\centau_vide@0.3.1\vide\src\effect.luau
 tkpack.declare("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.effect",function()
    if not(game)then
         script=require("test/relative-string")
    end;
    local graph=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.graph");
    local create_node=graph.create_node;
    local assert_stable_scope=graph.assert_stable_scope;
    local evaluate_node=graph.evaluate_node;
    local function effect(callback,initial_value)
        local node=create_node(assert_stable_scope(),callback,initial_value);
        evaluate_node(node)
    end;
    return effect

 end)
-- D:\Programming\toolkit\studio\packages\_Index\centau_vide@0.3.1\vide\src\derive.luau
 tkpack.declare("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.derive",function()
    if not(game)then
         script=require("test/relative-string")
    end;
    local graph=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.graph");
    local create_node=graph.create_node;
    local push_child_to_scope=graph.push_child_to_scope;
    local assert_stable_scope=graph.assert_stable_scope;
    local evaluate_node=graph.evaluate_node;
    local function derive(source)
        local node=create_node(assert_stable_scope(),source,false);
        evaluate_node(node);
        return function()
            push_child_to_scope(node);
            return node.cache
         end
     end;
    return derive

 end)
-- D:\Programming\toolkit\studio\packages\_Index\centau_vide@0.3.1\vide\src\cleanup.luau
 tkpack.declare("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.cleanup",function()
    if not(game)then
         script=require("test/relative-string")
    end;
    local typeof=((game)and(typeof))or(require("test/mock").typeof);
    local throw=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.throw");
    local graph=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.graph");
    local get_scope=graph.get_scope;
    local push_cleanup=graph.push_cleanup;
    local function helper(obj)
        return if(typeof(obj))==("RBXScriptConnection")then function()
            obj:Disconnect()
        end else if(typeof(obj))==("Instance")then function()
            obj:Destroy()
        end else if obj.destroy then function()
            obj:destroy()
        end else if obj.disconnect then function()
            obj:disconnect()
        end else if obj.Destroy then function()
            obj:Destroy()
        end else if obj.Disconnect then function()
            obj:Disconnect()
        end else throw("cannot cleanup given object")
    end;
    local function cleanup(value)
        local scope=get_scope();
        if not(scope)then
             throw("cannot cleanup outside a stable or reactive scope")
        end;
        assert(scope);
        if(type(value))==("function")then
             push_cleanup(scope,value)
        else
             push_cleanup(scope,helper(value))
        end
     end;
    type("not printable... yet");
    type("not printable... yet");
    return cleanup

 end)
-- D:\Programming\toolkit\studio\packages\_Index\centau_vide@0.3.1\vide\src\untrack.luau
 tkpack.declare("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.untrack",function()
    if not(game)then
         script=require("test/relative-string")
    end;
    local graph=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.graph");
    type("not printable... yet");
    local get_scope=graph.get_scope;
    local function untrack(source)
        local scope=get_scope();
        if scope then
             local effect=scope.effect;
            scope.effect=false;
            local ok,result=pcall(source);
            scope.effect=effect;
            if not(ok)then
                 error(result,0)
            end;
            return result
         else
             return source()
        end
     end;
    return untrack

 end)
-- D:\Programming\toolkit\studio\packages\_Index\centau_vide@0.3.1\vide\src\read.luau
 tkpack.declare("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.read",function()
    if not(game)then
         script=require("test/relative-string")
    end;
    local function read(value)
        return if(type(value))==("function")then value()else value
     end;
    return read

 end)
-- D:\Programming\toolkit\studio\packages\_Index\centau_vide@0.3.1\vide\src\batch.luau
 tkpack.declare("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.batch",function()
    if not(game)then
         script=require("test/relative-string")
    end;
    local flags=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.flags");
    local throw=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.throw");
    local graph=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.graph");
    local function batch(setter)
        local already_batching=flags.batch;
        local from;
        if not(already_batching)then
             flags.batch=true;
            from=graph.get_update_queue_length()
        end;
        local ok,err=pcall(setter);
        if not(already_batching)then
             flags.batch=false;
            graph.flush_update_queue(from)
        end;
        if not(ok)then
             throw(`error occured while batching updates: {err}`)
        end
     end;
    return batch

 end)
-- D:\Programming\toolkit\studio\packages\_Index\centau_vide@0.3.1\vide\src\context.luau
 tkpack.declare("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.context",function()
    if not(game)then
         script=require("test/relative-string")
    end;
    local throw=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.throw");
    local graph=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.graph");
    type("not printable... yet");
    local create_node=graph.create_node;
    local get_scope=graph.get_scope;
    local push_scope=graph.push_scope;
    local pop_scope=graph.pop_scope;
    local set_context=graph.set_context;
    type("not printable... yet");
    local nil_symbol=newproxy();
    local count=0;
    local function context(...)
        count+=1;
        local id=count;
        local has_default=(select("\x23",...))>(0);
        local default_value=...;
        return function(...)
            local scope=get_scope();
            if(select("\x23",...))==(0)then
                 while scope do
                     local ctx=scope.context;
                    if not(ctx)then
                         scope=scope.owner;
                        continue
                     end;
                    local value=(ctx)[id];
                    if(value)==(nil)then
                         scope=scope.owner;
                        continue
                     end;
                    return(if(value)~=(nil_symbol)then value else nil)
                end;
                if(has_default)~=(nil)then
                     return default_value
                 else
                     throw("attempt to get context when no context is set and no default context is set")
                end
             else
                 if not(scope)then
                     return throw("attempt to set context outside of a vide scope")
                end;
                local value,component=...;
                local new_scope=create_node(scope,false,false);
                set_context(new_scope,id,if(value)==(nil)then nil_symbol else value);
                push_scope(new_scope);
                local function efn(err)
                    return debug.traceback(err,3)
                end;
                local ok,result=xpcall(component,efn);
                pop_scope();
                if not(ok)then
                     throw(`error while running context:\x0a\x0a{result}`)
                end;
                return result
             end;
            return nil
         end
     end;
    return context

 end)
-- D:\Programming\toolkit\studio\packages\_Index\centau_vide@0.3.1\vide\src\switch.luau
 tkpack.declare("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.switch",function()
    if not(game)then
         script=require("test/relative-string")
    end;
    local throw=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.throw");
    local graph=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.graph");
    type("not printable... yet");
    type("not printable... yet");
    local create_node=graph.create_node;
    local evaluate_node=graph.evaluate_node;
    local push_child_to_scope=graph.push_child_to_scope;
    local destroy=graph.destroy;
    local assert_stable_scope=graph.assert_stable_scope;
    local push_scope=graph.push_scope;
    local pop_scope=graph.pop_scope;
    type("not printable... yet");
    local function switch(source)
        local owner=assert_stable_scope();
        return function(map)
            local last_scope;
            local last_component;
            local function update(cached)
                local component=map[source()];
                if(component)==(last_component)then
                     return cached
                 end;
                last_component=component;
                if last_scope then
                     destroy(last_scope);
                    last_scope=nil
                 end;
                if(component)==(nil)then
                     return nil
                 end;
                if(type(component))~=("function")then
                     throw("map must map a value to a function")
                end;
                local new_scope=create_node(owner,false,false);
                last_scope=new_scope;
                push_scope(new_scope);
                local ok,result=pcall(component);
                pop_scope();
                if not(ok)then
                     error(result,0)
                end;
                return result
             end;
            local node=create_node(owner,update,nil);
            evaluate_node(node);
            return function()
                push_child_to_scope(node);
                return node.cache
             end
         end
     end;
    return switch

 end)
-- D:\Programming\toolkit\studio\packages\_Index\centau_vide@0.3.1\vide\src\show.luau
 tkpack.declare("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.show",function()
    if not(game)then
         script=require("test/relative-string")
    end;
    local switch=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.switch");
    local function show(source,component,fallback)
        local function truthy()
            return not(not(source()))
        end;
        return switch(truthy)({[true]=component,[false]=fallback})
    end;
    return show

 end)
-- D:\Programming\toolkit\studio\packages\_Index\centau_vide@0.3.1\vide\src\maps.luau
 tkpack.declare("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.maps",function()
    if not(game)then
         script=require("test/relative-string")
    end;
    local throw=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.throw");
    local flags=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.flags");
    local graph=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.graph");
    type("not printable... yet");
    type("not printable... yet");
    local create_node=graph.create_node;
    local create_source_node=graph.create_source_node;
    local push_child_to_scope=graph.push_child_to_scope;
    local update_descendants=graph.update_descendants;
    local assert_stable_scope=graph.assert_stable_scope;
    local push_scope=graph.push_scope;
    local pop_scope=graph.pop_scope;
    local evaluate_node=graph.evaluate_node;
    local destroy=graph.destroy;
    type("not printable... yet");
    local function check_primitives(t)
        if not(flags.strict)then
             return
         end;
        for _,v in next,t do
             if(((type(v))==("table"))or((type(v))==("userdata")))or((type(v))==("function"))then
                 continue
             end;
            throw("table source map cannot return primitives")
        end
     end;
    local function indexes(input,transform)
        local owner=assert_stable_scope();
        local subowner=create_node(owner,false,false);
        local input_cache={};
        local output_cache={};
        local input_nodes={};
        local remove_queue={};
        local scopes={};
        local function update_children(data)
            for i in next,input_cache do
                 if(data[i])==(nil)then
                     table.insert(remove_queue,i)
                end
             end;
            for _,i in next,remove_queue do
                 destroy(scopes[i]);
                input_cache[i]=nil;
                output_cache[i]=nil;
                input_nodes[i]=nil;
                scopes[i]=nil
             end;
            table.clear(remove_queue);
            push_scope(subowner);
            for i,v in next,data do
                 local cv=input_cache[i];
                if(cv)~=(v)then
                     if(cv)==(nil)then
                         local scope=create_node(subowner,false,false);
                        scopes[i]=scope;
                        local node=create_source_node(v);
                        push_scope(scope);
                        local ok,result=pcall(transform,function()
                            push_child_to_scope(node);
                            return node.cache
                         end,i);
                        pop_scope();
                        if not(ok)then
                             pop_scope();
                            error(result,0)
                        end;
                        input_nodes[i]=node;
                        output_cache[i]=result
                     else
                         input_nodes[i].cache=v;
                        update_descendants(input_nodes[i])
                    end;
                    input_cache[i]=v
                 end
             end;
            pop_scope();
            local output_array=table.create(#(scopes));
            for _,v in next,output_cache do
                 table.insert(output_array,v)
            end;
            check_primitives(output_array);
            return output_array
         end;
        local node=create_node(owner,function()
            return update_children(input())
        end,false);
        evaluate_node(node);
        return function()
            push_child_to_scope(node);
            return node.cache
         end
     end;
    local function values(input,transform)
        local owner=assert_stable_scope();
        local subowner=create_node(owner,false,false);
        local cur_input_cache_up={};
        local new_input_cache_up={};
        local output_cache={};
        local input_nodes={};
        local scopes={};
        local function update_children(data)
            local cur_input_cache,new_input_cache=cur_input_cache_up,new_input_cache_up;
            if flags.strict then
                 local cache={};
                for _,v in next,data do
                     if(cache[v])~=(nil)then
                         throw("duplicate table value detected")
                    end;
                    cache[v]=true
                 end
             end;
            push_scope(subowner);
            for i,v in next,data do
                 new_input_cache[v]=i;
                local cv=cur_input_cache[v];
                if(cv)==(nil)then
                     local scope=create_node(subowner,false,false);
                    scopes[v]=scope;
                    local node=create_source_node(i);
                    push_scope(scope);
                    local ok,result=pcall(transform,v,function()
                        push_child_to_scope(node);
                        return node.cache
                     end);
                    pop_scope();
                    if not(ok)then
                         pop_scope();
                        error(result,0)
                    end;
                    input_nodes[v]=node;
                    output_cache[v]=result
                 else
                     if(cv)~=(i)then
                         input_nodes[v].cache=i;
                        update_descendants(input_nodes[v])
                    end;
                    cur_input_cache[v]=nil
                 end
             end;
            pop_scope();
            for v in next,cur_input_cache do
                 destroy(scopes[v]);
                output_cache[v]=nil;
                input_nodes[v]=nil;
                scopes[v]=nil
             end;
            table.clear(cur_input_cache);
            cur_input_cache_up,new_input_cache_up=new_input_cache,cur_input_cache;
            local output_array=table.create(#(scopes));
            for _,v in next,output_cache do
                 table.insert(output_array,v)
            end;
            check_primitives(output_array);
            return output_array
         end;
        local node=create_node(owner,function()
            return update_children(input())
        end,false);
        evaluate_node(node);
        return function()
            push_child_to_scope(node);
            return node.cache
         end
     end;
    return function()
        return indexes,values
     end

 end)
-- D:\Programming\toolkit\studio\packages\_Index\centau_vide@0.3.1\vide\src\spring.luau
 tkpack.declare("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.spring",function()
    if not(game)then
         script=require("test/relative-string")
    end;
    local Vector3=((game)and(Vector3))or(require("test/mock").Vector3);
    local throw=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.throw");
    local graph=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.graph");
    type("not printable... yet");
    type("not printable... yet");
    local create_node=graph.create_node;
    local create_source_node=graph.create_source_node;
    local assert_stable_scope=graph.assert_stable_scope;
    local evaluate_node=graph.evaluate_node;
    local update_descendants=graph.update_descendants;
    local push_child_to_scope=graph.push_child_to_scope;
    local UPDATE_RATE=120;
    local TOLERANCE=0.0001;
    type("not printable... yet");
    local function Vec3(x,y,z)
        return Vector3.new(x,y,z)
    end;
    local ZERO=Vec3(0,0,0);
    type("not printable... yet");
    type("not printable... yet");
    type("not printable... yet");
    type("not printable... yet");
    local type_to_vec6={["number"]=function(v)
        return Vec3(v,0,0),ZERO
     end,["CFrame"]=function(v)
        return v.Position,Vec3(v:ToEulerAnglesXYZ())
    end,["Color3"]=function(v)
        return Vec3(v.R,v.G,v.B),ZERO
     end,["UDim"]=function(v)
        return Vec3(v.Scale,v.Offset,0),ZERO
     end,["UDim2"]=function(v)
        return Vec3(v.X.Scale,v.X.Offset,v.Y.Scale),Vec3(v.Y.Offset,0,0)
    end,["Vector2"]=function(v)
        return Vec3(v.X,v.Y,0),ZERO
     end,["Vector3"]=function(v)
        return v,ZERO
     end,["Rect"]=function(v)
        return Vec3(v.Min.X,v.Min.Y,v.Max.X),Vec3(v.Max.Y,0,0)
    end};
    local vec6_to_type={["number"]=function(a,b)
        return a.X
     end,["CFrame"]=function(a,b)
        return(CFrame.new(a))*(CFrame.fromEulerAnglesXYZ(b.X,b.Y,b.Z))
    end,["Color3"]=function(v)
        return Color3.new(math.clamp(v.X,0,1),math.clamp(v.Y,0,1),math.clamp(v.Z,0,1))
    end,["UDim"]=function(v)
        return UDim.new(v.X,math.round(v.Y))
    end,["UDim2"]=function(a,b)
        return UDim2.new(a.X,math.round(a.Y),a.Z,math.round(b.X))
    end,["Vector2"]=function(v)
        return Vector2.new(v.X,v.Y)
    end,["Vector3"]=function(v)
        return v
     end,["Rect"]=function(a,b)
        return Rect.new(a.X,a.Y,a.Z,b.X)
    end};
    local invalid_type={["__index"]=function(_,t)
        throw(`cannot spring type {t}`)
    end};
    setmetatable(type_to_vec6,invalid_type);
    setmetatable(vec6_to_type,invalid_type);
    local springs={};
    setmetatable(springs,{["__mode"]="v"});
    local function spring(source,period,damping_ratio)
        local owner=assert_stable_scope();
        local w_n=((2)*(math.pi))/(((period)or(1)));
        local z=(damping_ratio)or(1);
        local k=(w_n)^(2);
        local c_c=(2)*(w_n);
        local c=(z)*(c_c);
        if(c)>((UPDATE_RATE)*(2))then
             throw("spring damping too high, consider reducing damping or increasing period")
        end;
        local data={["k"]=k,["c"]=c,["x0_123"]=ZERO,["x1_123"]=ZERO,["v_123"]=ZERO,["x0_456"]=ZERO,["x1_456"]=ZERO,["v_456"]=ZERO,["source_value"]=false};
        local output=create_source_node(false);
        local function updater_effect()
            local value=source();
            data.x1_123,data.x1_456=type_to_vec6[typeof(value)](value);
            data.source_value=value;
            springs[data]=output;
            return value
         end;
        local updater=create_node(owner,updater_effect,false);
        evaluate_node(updater);
        data.x0_123,data.x0_456=data.x1_123,data.x1_456;
        output.cache=data.source_value;
        return function(...)
            if(select("\x23",...))==(0)then
                 push_child_to_scope(output);
                return output.cache
             end;
            local v=...;
            data.x0_123,data.x0_456=type_to_vec6[typeof(v)](v);
            data.v_123=ZERO;
            data.v_456=ZERO;
            springs[data]=output;
            output.cache=v;
            return v
         end
     end;
    local function step_springs(dt)
        for data in next,springs do
             local k,c,x0_123,x1_123,u_123,x0_456,x1_456,u_456=data.k,data.c,data.x0_123,data.x1_123,data.v_123,data.x0_456,data.x1_456,data.v_456;
            local dx_123=(x0_123)-(x1_123);
            local dx_456=(x0_456)-(x1_456);
            local fs_123=(dx_123)*(-(k));
            local fs_456=(dx_456)*(-(k));
            local ff_123=(u_123)*(-(c));
            local ff_456=(u_456)*(-(c));
            local dv_123=(((fs_123)+(ff_123)))*(dt);
            local dv_456=(((fs_456)+(ff_456)))*(dt);
            local v_123=(u_123)+(dv_123);
            local v_456=(u_456)+(dv_456);
            local x_123=(x0_123)+((v_123)*(dt));
            local x_456=(x0_456)+((v_456)*(dt));
            data.x0_123,data.x0_456=x_123,x_456;
            data.v_123,data.v_456=v_123,v_456
         end
     end;
    local remove_queue={};
    local function update_spring_sources()
        for data,output in next,springs do
             local x0_123,x1_123,v_123,x0_456,x1_456,v_456=data.x0_123,data.x1_123,data.v_123,data.x0_456,data.x1_456,data.v_456;
            local dx_123,dx_456=(x0_123)-(x1_123),(x0_456)-(x1_456);
            if(((((v_123)+(v_456))+(dx_123))+(dx_456)).Magnitude)<(TOLERANCE)then
                 table.insert(remove_queue,data);
                output.cache=data.source_value
             else
                 output.cache=vec6_to_type[typeof(data.source_value)](x0_123,x0_456)
            end;
            update_descendants(output)
        end;
        for _,data in next,remove_queue do
             springs[data]=nil
         end;
        table.clear(remove_queue)
    end;
    return function()
        local time_elapsed=0;
        return spring,function(dt)
            time_elapsed+=dt;
            while(time_elapsed)>((1)/(UPDATE_RATE))do
                 time_elapsed-=(1)/(UPDATE_RATE);
                step_springs((1)/(UPDATE_RATE))
            end;
            update_spring_sources()
        end
     end

 end)
-- D:\Programming\toolkit\studio\packages\_Index\centau_vide@0.3.1\vide\src\action.luau
 tkpack.declare("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.action",function()
    type("not printable... yet");
    local ActionMT=table.freeze({});
    local function is_action(v)
        return(getmetatable(v))==(ActionMT)
    end;
    local function action(callback,priority)
        local a={["priority"]=(priority)or(1),["callback"]=callback};
        setmetatable(a,ActionMT);
        return table.freeze(a)
    end;
    return function()
        return action,is_action
     end

 end)
-- D:\Programming\toolkit\studio\packages\_Index\centau_vide@0.3.1\vide\src\changed.luau
 tkpack.declare("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.changed",function()
    if not(game)then
         script=require("test/relative-string")
    end;
    local action=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.action")();
    local cleanup=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.cleanup");
    local function changed(property,callback)
        return action(function(instance)
            local con=instance:GetPropertyChangedSignal(property):Connect(function()
                callback((instance)[property])
            end);
            cleanup(function()
                con:Disconnect()
            end);
            callback((instance)[property])
        end)
    end;
    return changed

 end)
-- D:\Programming\toolkit\studio\packages\_Index\centau_vide@0.3.1\vide\src\throw.luau
 tkpack.declare("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.throw",function()
    if not(game)then
         script=require("test/relative-string")
    end;
    local function VIDE_ASSERT(msg)
        error(msg,0)
    end;
    return VIDE_ASSERT

 end)
-- D:\Programming\toolkit\studio\packages\_Index\centau_vide@0.3.1\vide\src\flags.luau
 tkpack.declare("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.flags",function()
    local function inline_test()
        return debug.info(1,"n")
    end;
    local is_O2=(inline_test())~=("inline_test");
    return{["strict"]=not(is_O2),["batch"]=false}

end)
-- D:\Programming\toolkit\studio\packages\_Index\centau_vide@0.3.1\vide\src\graph.luau
 tkpack.declare("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.graph",function()
    if not(game)then
         script=require("test/relative-string")
    end;
    local throw=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.throw");
    local flags=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.flags");
    type("not printable... yet");
    type("not printable... yet");
    local scopes={["n"]=0};
    local function ycall(fn,arg)
        local thread=coroutine.create(xpcall);
        local function efn(err)
            return debug.traceback(err,3)
        end;
        local resume_ok,run_ok,result=coroutine.resume(thread,fn,efn,arg);
        assert(resume_ok);
        if(coroutine.status(thread))~=("dead")then
             return false,debug.traceback(thread,"attempt to yield in reactive scope")
        end;
        return run_ok,result
     end;
    local function get_scope()
        return scopes[scopes.n]
    end;
    local function assert_stable_scope()
        local scope=get_scope();
        if not(scope)then
             local caller_name=debug.info(2,"n");
            return throw(`cannot use {caller_name}() outside a stable or reactive scope`)
        elseif scope.effect then
             throw("cannot create a new reactive scope inside another reactive scope")
        end;
        return scope
     end;
    local function push_child(parent,child)
        table.insert(parent,child);
        table.insert(child.parents,parent)
    end;
    local function push_scope(node)
        local n=(scopes.n)+(1);
        scopes.n=n;
        scopes[n]=node
     end;
    local function pop_scope()
        local n=scopes.n;
        scopes.n=(n)-(1);
        scopes[n]=nil
     end;
    local function push_cleanup(node,cleanup)
        if node.cleanups then
             table.insert(node.cleanups,cleanup)
        else
             node.cleanups={cleanup}
        end
     end;
    local function flush_cleanups(node)
        if node.cleanups then
             for _,fn in next,node.cleanups do
                 local ok,err=pcall(fn);
                if not(ok)then
                     throw(`cleanup error: {err}`)
                end
             end;
            table.clear(node.cleanups)
        end
     end;
    local function find_and_swap_pop(t,v)
        local i=table.find(t,v);
        local n=#(t);
        t[i]=t[n];
        t[n]=nil
     end;
    local function unparent(node)
        local parents=node.parents;
        for i,parent in parents do
             find_and_swap_pop(parent,node);
            parents[i]=nil
         end
     end;
    local function destroy(node)
        flush_cleanups(node);
        unparent(node);
        if node.owner then
             find_and_swap_pop(node.owner.owned,node);
            node.owner=false
         end;
        if node.owned then
             local owned=node.owned;
            while owned[1]do
                 destroy(owned[1])
            end
         end
     end;
    local function destroy_owned(node)
        if node.owned then
             local owned=node.owned;
            while owned[1]do
                 destroy(owned[1])
            end
         end
     end;
    local update_queue={["n"]=0};
    local function evaluate_node(node)
        if flags.strict then
             local initial_value=node.cache;
            for i=1,2 do
                 local cur_value=node.cache;
                flush_cleanups(node);
                destroy_owned(node);
                push_scope(node);
                local ok,new_value=ycall(node.effect,cur_value);
                pop_scope();
                if not(ok)then
                     table.clear(update_queue);
                    update_queue.n=0;
                    throw(`effect stacktrace:\x0a{new_value}`)
                end;
                node.cache=new_value
             end;
            return(initial_value)~=(node.cache)
        else
             local cur_value=node.cache;
            flush_cleanups(node);
            destroy_owned(node);
            push_scope(node);
            local ok,new_value=pcall(node.effect,node.cache);
            pop_scope();
            if not(ok)then
                 table.clear(update_queue);
                update_queue.n=0;
                throw(`effect stacktrace:\x0a{new_value}\x0a`)
            end;
            node.cache=new_value;
            return(cur_value)~=(new_value)
        end
     end;
    local function queue_children_for_update(node)
        local i=update_queue.n;
        while node[1]do
             i+=1;
            update_queue[i]=node[1];
            unparent(node[1])
        end;
        update_queue.n=i
     end;
    local function get_update_queue_length()
        return update_queue.n
     end;
    local function flush_update_queue(from)
        local i=(from)+(1);
        while(i)<=(update_queue.n)do
             local node=update_queue[i];
            if(node.owner)and(evaluate_node(node))then
                 queue_children_for_update(node)
            end;
            update_queue[i]=false;
            i+=1
         end;
        update_queue.n=from
     end;
    local function update_descendants(root)
        local n0=update_queue.n;
        queue_children_for_update(root);
        if flags.batch then
             return
         end;
        local i=(n0)+(1);
        while(i)<=(update_queue.n)do
             local node=update_queue[i];
            if(node.owner)and(evaluate_node(node))then
                 queue_children_for_update(node)
            end;
            update_queue[i]=false;
            i+=1
         end;
        update_queue.n=n0
     end;
    local function push_child_to_scope(node)
        local scope=get_scope();
        if(scope)and(scope.effect)then
             push_child(node,scope)
        end
     end;
    local function create_node(owner,effect,value)
        local node={["cache"]=value,["effect"]=effect,["cleanups"]=false,["context"]=false,["owner"]=owner,["owned"]=false,["parents"]={}};
        if owner then
             if owner.owned then
                 table.insert(owner.owned,node)
            else
                 owner.owned={node}
            end
         end;
        return node
     end;
    local function create_source_node(value)
        return{["cache"]=value}
    end;
    local function get_children(node)
        return{unpack(node)}
    end;
    local function set_context(node,key,value)
        if node.context then
             node.context[key]=value
         else
             node.context={[key]=value}
        end
     end;
    return table.freeze({["push_scope"]=push_scope,["pop_scope"]=pop_scope,["evaluate_node"]=evaluate_node,["get_scope"]=get_scope,["assert_stable_scope"]=assert_stable_scope,["push_cleanup"]=push_cleanup,["destroy"]=destroy,["flush_cleanups"]=flush_cleanups,["push_child_to_scope"]=push_child_to_scope,["update_descendants"]=update_descendants,["push_child"]=push_child,["create_node"]=create_node,["create_source_node"]=create_source_node,["get_children"]=get_children,["flush_update_queue"]=flush_update_queue,["get_update_queue_length"]=get_update_queue_length,["set_context"]=set_context,["scopes"]=scopes})

end)
-- D:\Programming\toolkit\studio\packages\_Index\centau_vide@0.3.1\vide\src\defaults.luau
 tkpack.declare("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.defaults",function()
    local Enum=((game)and(Enum))or(require("test/mock").Enum);
    local Color3=((game)and(Color3))or(require("test/mock").Color3);
    local Vector3=((game)and(Vector3))or(require("test/mock").Vector3);
    return{["Part"]={["Material"]=Enum.Material.SmoothPlastic,["Size"]=Vector3.new(1,1,1),["Anchored"]=true},["BillboardGui"]={["ResetOnSpawn"]=false,["ZIndexBehavior"]=Enum.ZIndexBehavior.Sibling},["CanvasGroup"]=nil,["Frame"]={["BackgroundColor3"]=Color3.new(1,1,1),["BorderColor3"]=Color3.new(0,0,0),["BorderSizePixel"]=0},["ImageButton"]={["BackgroundColor3"]=Color3.new(1,1,1),["BorderColor3"]=Color3.new(0,0,0),["BorderSizePixel"]=0,["AutoButtonColor"]=false},["ImageLabel"]={["BackgroundColor3"]=Color3.new(1,1,1),["BorderColor3"]=Color3.new(0,0,0),["BorderSizePixel"]=0},["ScreenGui"]={["ResetOnSpawn"]=false,["ZIndexBehavior"]=Enum.ZIndexBehavior.Sibling},["ScrollingFrame"]={["BackgroundColor3"]=Color3.new(1,1,1),["BorderColor3"]=Color3.new(0,0,0),["BorderSizePixel"]=0,["ScrollBarImageColor3"]=Color3.new(0,0,0)},["SurfaceGui"]={["ResetOnSpawn"]=false,["ZIndexBehavior"]=Enum.ZIndexBehavior.Sibling,["PixelsPerStud"]=50,["SizingMode"]=Enum.SurfaceGuiSizingMode.PixelsPerStud},["TextBox"]={["BackgroundColor3"]=Color3.new(1,1,1),["BorderColor3"]=Color3.new(0,0,0),["BorderSizePixel"]=0,["ClearTextOnFocus"]=false,["Font"]=Enum.Font.SourceSans,["Text"]="",["TextColor3"]=Color3.new(0,0,0)},["TextButton"]={["BackgroundColor3"]=Color3.new(1,1,1),["BorderColor3"]=Color3.new(0,0,0),["BorderSizePixel"]=0,["AutoButtonColor"]=false,["Font"]=Enum.Font.SourceSans,["Text"]="",["TextColor3"]=Color3.new(0,0,0)},["TextLabel"]={["BackgroundColor3"]=Color3.new(1,1,1),["BorderColor3"]=Color3.new(0,0,0),["BorderSizePixel"]=0,["Font"]=Enum.Font.SourceSans,["Text"]="",["TextColor3"]=Color3.new(0,0,0)},["UIListLayout"]={["SortOrder"]=Enum.SortOrder.LayoutOrder},["UIGridLayout"]={["SortOrder"]=Enum.SortOrder.LayoutOrder},["UITableLayout"]={["SortOrder"]=Enum.SortOrder.LayoutOrder},["UIPageLayout"]={["SortOrder"]=Enum.SortOrder.LayoutOrder},["VideoFrame"]={["BackgroundColor3"]=Color3.new(1,1,1),["BorderColor3"]=Color3.new(0,0,0),["BorderSizePixel"]=0},["ViewportFrame"]={["BackgroundColor3"]=Color3.new(1,1,1),["BorderColor3"]=Color3.new(0,0,0),["BorderSizePixel"]=0}}

end)
-- D:\Programming\toolkit\studio\packages\_Index\centau_vide@0.3.1\vide\src\bind.luau
 tkpack.declare("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.bind",function()
    if not(game)then
         script=require("test/relative-string")
    end;
    local graph=tkpack.include("game.ReplicatedStorage.Packages._Index.centau_vide@0.3.1.vide.graph");
    type("not printable... yet");
    local create_node=graph.create_node;
    local assert_stable_scope=graph.assert_stable_scope;
    local evaluate_node=graph.evaluate_node;
    function create_implicit_effect(updater,binding)
        evaluate_node(create_node(assert_stable_scope(),updater,binding))
    end;
    type("not printable... yet");
    local function update_property_effect(p)
        (p.instance)[p.property]=p.source();
        return p
     end;
    type("not printable... yet");
    local function update_parent_effect(p)
        p.instance.Parent=p.parent();
        return p
     end;
    type("not printable... yet");
    type("not printable... yet");
    local function update_children_effect(p)
        local cur_children_set=p.cur_children_set;
        local new_child_set=p.new_children_set;
        local new_children=p.children();
        if(type(new_children))~=("table")then
             new_children={new_children}
        end;
        local function process_child(child)
            if(type(child))==("table")then
                 for _,child in next,child do
                     process_child(child)
                end
             else
                 if new_child_set[child]then
                     return
                 end;
                new_child_set[child]=true;
                if not(cur_children_set[child])then
                     child.Parent=p.instance
                 else
                     cur_children_set[child]=nil
                 end
             end
         end;
        process_child(new_children);
        for child in next,cur_children_set do
             child.Parent=nil
         end;
        table.clear(cur_children_set);
        p.cur_children_set,p.new_children_set=new_child_set,cur_children_set;
        return p
     end;
    return{["property"]=function(instance,property,source)
        return create_implicit_effect(update_property_effect,{["instance"]=instance,["property"]=property,["source"]=source})
    end,["parent"]=function(instance,parent)
        return create_implicit_effect(update_parent_effect,{["instance"]=instance,["parent"]=parent})
    end,["children"]=function(instance,children)
        return create_implicit_effect(update_children_effect,{["instance"]=instance,["cur_children_set"]={},["new_children_set"]={},["children"]=children})
    end}

end)
tkpack.include("game.ReplicatedStorage.TK");