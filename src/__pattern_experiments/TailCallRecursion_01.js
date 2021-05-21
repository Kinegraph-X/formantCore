/**
 * @constructor TailCallRecursion
 */



var TailCallRecursion = function() {
	
}
TailCallRecursion.prototype = {};

TailCallRecursion.prototype.getRecursiveTest = function(exp, argCount, iteratorFunctions) {
	
	exp = exp || 'false';
	argCount = argCount || 1;

	this.iteratorFunctions = Array.isArray(iteratorFunctions) ? iteratorFunctions.slice(0) : ['decrement'];
	
	var doCallTest  = this.getExpAsFunc(exp, argCount);
	var testFunction = this.getTestFunction();
	var branches = this.getBranches(testFunction);
	
	return testFunction.bind(this, branches, doCallTest);
}

TailCallRecursion.prototype.shouldCallTest = function(branches, doCallTest, ...args) {
	return branches[+(!!doCallTest(...args))];
}

TailCallRecursion.prototype.test = function(branches, doCallTest, ...args) {
	return this.shouldCallTest(branches, doCallTest, ...args).call(this, branches, doCallTest, ...args);
}

TailCallRecursion.prototype.getBranches = function(callable) {
	return [
		this.noOp,
		callable//.bind(this)
	];
}

TailCallRecursion.prototype.getExpAsFunc = function(exp, argCount) {
	var args = [];
	for (var i = 0, l = argCount; i < l; i++) {
		args.push('arg' + i);
	}
	args.push('return ' + exp + ';');
	
	return new Function(...args);
}

TailCallRecursion.prototype.getTestFunction = function() {

	return function(branches, doCallTest, ...args) {
		var iteratorFunctionsIdx = this.iteratorFunctions.length - 1;
		return args[0] > 0
			&& this.test(
				branches,
				doCallTest,
				...(args.map(function(arg) {
						return iteratorFunctionsIdx >= 0
								? this[this.iteratorFunctions[iteratorFunctionsIdx--]](arg)
								: arg;
					}, this))
				);
	}
}

TailCallRecursion.prototype.noOp = function() {}
TailCallRecursion.prototype.decrement = function(arg) {return --arg;}
TailCallRecursion.prototype.increment = function(arg) {return ++arg;}




















module.exports = TailCallRecursion;