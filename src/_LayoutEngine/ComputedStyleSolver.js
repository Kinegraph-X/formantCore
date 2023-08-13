/**
 * constructor ComputedStyleSolver
 */

var TypeManager = require('src/core/TypeManager');
var MemoryBufferStack= require('src/core/MemoryBufferStack');
var CSSSelectorsList = require('src/editing/CSSSelectorsList');

var CSSRulesBufferManager = require('src/_LayoutEngine/CSSRulesBufferManager');
var CSSSelectorsMatcher = require('src/_LayoutEngine/CSSSelectorsMatcher');
var CSSSelectorsMatcherRefiner = require('src/_LayoutEngine/CSSSelectorsMatcherRefiner');

var Style = require('src/editing/Style');


var ComputedStyleSolver = function(naiveDOM, collectedSWrappers) {
	
//	console.log(naiveDOM.toDebugString(), collectedSWrappers.toDebugString());
	this.objectType = 'ComputedStyleSolver';
	
	this.CSSSelectorsMatcher = new CSSSelectorsMatcher();
	this.CSSSelectorsMatcherRefiner = new CSSSelectorsMatcherRefiner();
	
	// For now, let's scale the CSS memoryBuffer to a size big enough to handle 2000 rules
	//		=> Benchmarks showed that allocating buffers bigger than 16 KB causes instabilities in perf
	//			(3000 items / 8 Bytes) = 24 KB, was seemingly too big for TurboFan.
	// HINT: https://meiert.com/en/blog/70-percent-css-repetition
	// "The average number of declarations is 6121 [...]"
	// "the average number of unique declarations is 1,698"
	//		=> TODO: we should think of optimizing the stylesheet before matching or computing anything...
	// "The website with the most declarations, Kickstarter, uses 33,938 declarations [...]"
	this.CSSRulesBuffer = this.scaleCSSBuffer();
	this.CSSRulesBufferManager = new CSSRulesBufferManager(this.CSSRulesBuffer);
	this.CSSRulesBufferManager.rebuildCSSRulesBuffer(naiveDOM, collectedSWrappers);
	
		
//	this.tmpRes = this.matches.reduce(function(acc, val) {
//		return acc += val + ', ';
//	}, '')
	
//	console.log();
}

ComputedStyleSolver.prototype = {}
ComputedStyleSolver.prototype.objectType = 'ComputedStyleSolver';


ComputedStyleSolver.prototype.scaleCSSBuffer = function() {
	return new MemoryBufferStack(CSSSelectorsList.prototype.optimizedSelectorBufferSchema.size, 1500);
}










module.exports = ComputedStyleSolver;