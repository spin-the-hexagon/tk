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
