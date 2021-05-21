/**
 * @constructor TailCallRecursion
 */



var TailCallRecursion = function() {
	
}
TailCallRecursion.prototype = {};

TailCallRecursion.prototype.getRecursiveTest = function(exp, argCount, iteratorFunctions) {
	
	// If no exp, or exp is undefined, default to false to prevent any infinite recursion
	exp = exp || 'false';
	argCount = argCount || 1;
	// If iteratorFunction is undefined, let's be conservative and aim at leading the args to 0 (no perf impact due to test and copy)
	this.iteratorFunctions = Array.isArray(iteratorFunctions) ? iteratorFunctions.slice(0) : ['decrement'];
	
	// Get curry-jam (this implemmentation is a demonstrative recipe...)
	var doCallTest  = this.getExpAsFunc(exp, argCount);
	var testFunction = this.getTestFunction();
	var branches = this.getBranches(testFunction);
	
	return testFunction.bind(this, branches, doCallTest);
}

TailCallRecursion.prototype.shouldCallTest = function(branches, doCallTest, ...args) {
	// the test returns a bool which must be cast to int
	//		Note on the origin of a really nasty unconfort: 
	//			arbitrary expressions are subject to BAD native loose type coercion...
	//			and then, we may find ourselves trying to cast undefined or NaN to int,
	//			and get the silly NaN.
	// 		For example ((['value'])[Number(undefined)] === undefined), cause Number(undefined) === NaN...
	//		=> an obvious way of securing it: test (typeof doCallTest() === 'boolean').
	//			There may be a way to test that implicitly, but an additional cast also does the job:
	//			/!\ HACKY, but to my eyes, ELEGANT: Number(!!undefined)) /!\
	//			casting undefined to bool is false
	//			casting NaN to bool is false
	//			casting 0 to bool is false
	//			casting 1 to bool is true
	//				=> any value except true shall be cast to false, then cast to 0
	//			(but please don't use a constructor nor a function to cast a boolean to Number: use the unary operator)
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