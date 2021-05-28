



// var objFromInnerIFrame = JSON.stringify(temp0);

var TypedArrayNamesRegExp = new RegExp(
	'(\
\
_buffer":\s|\
\
occupancy":\s)\
\
(\{[^\}]+?\})\
'
	,
	'g'
);

function formatObjFromConsoleLog(strFromConsole) {
	
	return JSON.parse(
		strFromConsole
			.replace('\\"', '"')
			.replace('\\\\n', '\\n')
			.replace(
				TypedArraysNamesRegExp,
				'"REMOVE\1 new Uint8Array(Object.values(\2))"REMOVE'
			)
	);
}

module.exports = formatObjFromConsoleLog;