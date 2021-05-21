/**
 * @constructor TailCallRecursion
 */



var TailCallRecursion = function() {
	
}
TailCallRecursion.prototype = {};

TailCallRecursion.prototype.getRecursiveTest = function(exp) {
	
	// If no exp, or exp is undefined, default to false to prevent any infinite recursion
	exp = exp || 'false';
	
	// Get curry-jam (hopefully this implemmentation doesn't demonstrate too much of a Yakari-style...)
	var doCallTest  = this.getExpAsFunc(exp);
	var testFunction = this.getTestFunction();
	var branches = this.getBranches(testFunction);
	
	return testFunction.bind(this, branches, doCallTest);
}

TailCallRecursion.prototype.shouldCallTest = function(branches, doCallTest, arg) {
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
	return branches[+(!!doCallTest(arg))];
}

TailCallRecursion.prototype.test = function(branches, doCallTest, arg) {
	return this.shouldCallTest(branches, doCallTest, arg)(branches, doCallTest, arg);
}

TailCallRecursion.prototype.getBranches = function(callable) {
	return [
		this.noOp,
		callable.bind(this)
	];
}

TailCallRecursion.prototype.getExpAsFunc = function(exp) {
	
	return new Function('arg0', 'return ' + exp + ';');
}

TailCallRecursion.prototype.getTestFunction = function() {
	return function(branches, doCallTest, arg) {
//		console.log(arg);
		return arg >= 0 
				&& this.test(
					branches,
					doCallTest,
					--arg
					);
	}
}

TailCallRecursion.prototype.noOp = function() {}




















module.exports = TailCallRecursion;