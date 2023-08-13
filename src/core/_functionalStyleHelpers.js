/**
 * @helpers _functionalStyleHelpers
 */


function noOp() {}


function falseCombinator() {
	return false;
}

function zeroOrOneCombinator(value) {
	return +(value >= 0) || 0;
}







module.exports = {
	noOp : noOp,
	falseCombinator : falseCombinator,
	zeroOrOneCombinator : zeroOrOneCombinator
}