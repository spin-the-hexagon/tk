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

function tkpack.indexOf(array: { any }, item: any)
	for real, index in array do
		if item == real then
			return index
		end
	end

	return -1
end

function tkpack.declare(modulePath: string, init: () -> any)
	tkpack.moduleTable[modulePath] = init
end

function tkpack.include(modulePath: string)
	if tkpack.indexOf(tkpack.includedModules, modulePath) ~= -1 then
		return tkpack.moduleReturns[modulePath]
	end

	tkpack.includedModules[#tkpack.includedModules] = modulePath

	tkpack.moduleReturns[modulePath] = tkpack.moduleTable[modulePath]()

	return tkpack.moduleReturns[modulePath]
end

-- [/tkpack]
