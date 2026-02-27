-- tkts runtime libs: core

local module = {}

function module.plus(left, right)
	if type(left) == "number" and type(right) == "number" then
		return left + right
	end

	return tostring(left) .. tostring(right)
end

function module.concatTuple(a, b)
	local result = {}
	for i = 1, #a do
		result[#result + 1] = a[i]
	end
	for i = 1, #b do
		result[#result + 1] = b[i]
	end
	return result
end

function module.call(object, key, ...)
	local method = object[key]

	-- As sad as this makes me, we have to try to call it twice
	-- We could try doing some stupid stuff with debug.getinfo, but alas, ROBLOX sandboxing screws us over
	local self_result, self_err = pcall(method, module.concatTuple({ object }, ...))

	if not self_err then
		return self_result
	end

	local result, err = pcall(method, ...)

	if err then
		error(err)
	end

	return result
end

return module
