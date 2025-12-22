--!strict
local globalCleanupKey = "TK_CLEANUP"

if _G[globalCleanupKey] then
	for _, cleanup in _G[globalCleanupKey] do
		cleanup()
	end
end

_G[globalCleanupKey] = {}

local module = {}

function module.onCleanup(cb: () -> ())
	table.insert(_G[globalCleanupKey], cb)
end

return module
