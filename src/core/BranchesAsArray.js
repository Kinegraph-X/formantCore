/**
 * @constructor BranchesAsArray
 */

var _fStyleHepers = require('src/core/_functionalStyleHelpers');





var BranchesAsArray = {};


BranchesAsArray.withNoOpCombinator = function(ifCallClause) {
	return [
		_fStyleHepers.noOp,
		ifCallClause
	];
}
BranchesAsArray.withFalseCombinator = function(ifCallClause) {
	return [
		_fStyleHepers.falseCombinator,
		ifCallClause
	];
}







module.exports = BranchesAsArray;