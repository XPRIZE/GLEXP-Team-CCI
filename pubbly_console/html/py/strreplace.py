def replaceAll(origStr, replacementList):
	#origStr -- STRING of shit you want to replace other shti with
	#replacementList -- [[STRING, STRING], [REPLACETHIS, WITH THIS]]

	result = origStr

	for r in replacementList:
		if r[0] in origStr:
			result = result.replace(r[0], r[1])

	return result


# Test cases
# Should output replaced 1 -- replaced 2 -- replaced 3-replaced 3-replaced 3

origStr = "rp1 -- rp2 -- rp3-rp3-rp3"
replaceArray = [
	["rp1", "replaced 1"],
	["rp2", "replaced 2"],
	["rp3", "replaced 3"]
]