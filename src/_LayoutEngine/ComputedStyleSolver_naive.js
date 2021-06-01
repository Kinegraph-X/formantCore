/**
 * constructor ComputedStyleSolver
 */

var TypeManager = require('src/core/TypeManager');
var MemoryBufferStack= require('src/core/MemoryBufferStack');
var Style = require('src/editing/Style');


var ComputedStyleSolver = function(naiveDOM, collectedSWrappers) {
	
//	console.log(naiveDOM.toDebugString(), collectedSWrappers.toDebugString());
	this.objectType = 'ComputedStyleSolver';
	this.matches = [];
	
//	var offsettedMatcher = this.getOffsettedMatcher(
//			collectedSWrappers
//		);
//	var branches = new BranchesAsArray(
//			offsettedMatcher
//		);
//	this.optimizedMatcher = this.getSelfExitingMatcher(
//			branches,
//			offsettedMatcher
//		);
//	this.iteratorCallback = this.getIteratorCallback();
	
	this.collectedSWrappers = collectedSWrappers;
	this.traverseAndMatchDOM(
			naiveDOM
		);
		
	this.tmpRes = this.matches.reduce(function(acc, val) {
		return acc += val + ',\n';
	}, '')
	
//	console.log();
}

ComputedStyleSolver.prototype = {}
ComputedStyleSolver.prototype.objectType = 'ComputedStyleSolver';

ComputedStyleSolver.viewTypes = [
	'masterView',
	'subSections',
	'memberViews'
];





ComputedStyleSolver.prototype.traverseAndMatchDOM = function(naiveDOM) {

	naiveDOM.children.forEach(function(node) {
		this.testNodeAgainstSelectors(node);
	}, this);
	

}

ComputedStyleSolver.prototype.testNodeAgainstSelectors = function(node) {
	var view, typeIdx = 0, currentViewType = ComputedStyleSolver.viewTypes[typeIdx];
	
	while (currentViewType) {
		
		// node.views.masterNode is ALWAYS flat
		if (typeIdx === 0) {
			view = node.views[currentViewType];
			this.matchingFunction(view, node.styleDataStructure);
		}
		else {
			node.views[currentViewType].forEach(function(view) {
				this.matchingFunction(view, node.styleDataStructure);	
			}, this);
		}
		
		typeIdx++;
		currentViewType = ComputedStyleSolver.viewTypes[typeIdx];
	} 
	
	node.children.forEach(function(childNode) {
		this.testNodeAgainstSelectors(childNode);
	}, this);
		

}

ComputedStyleSolver.prototype.matchingFunction = function(view, sWrapper) {
	var match, testType, testValue;
	
	if (testValue = view.nodeId.toLowerCase()) {
		this.iterateOnGlobalRulesAndMatchSelector(testValue);
		this.iterateOnShadowRulesAndMatchSelector(testValue, sWrapper);
	}
	if (view.classNames.length) {
		view.classNames.forEach(function(className) {
			testValue = className.toLowerCase();
			this.iterateOnGlobalRulesAndMatchSelector(testValue);
			this.iterateOnShadowRulesAndMatchSelector(testValue, sWrapper);
		}, this);
	}
	
	// May loop twice cause there's always a  tagName...
	testValue = view.nodeName;
	this.iterateOnGlobalRulesAndMatchSelector(testValue);
	this.iterateOnShadowRulesAndMatchSelector(testValue, sWrapper);
}

ComputedStyleSolver.prototype.iterateOnGlobalRulesAndMatchSelector = function(testValue) {
	
	this.collectedSWrappers.forEach(function(sWrapper) {
		Object.values(sWrapper.rules).forEach(function(rule) {
			if (this.extractMostSpecificPartFromSelector(rule.selector) === testValue)
				this.matches.push(testValue + ' / (' + rule.selector + ') - ' + sWrapper.name.slice(0, 9));
		}, this);	
	}, this);
	
}

ComputedStyleSolver.prototype.iterateOnShadowRulesAndMatchSelector = function(testValue, sWrapper) {
	if (!sWrapper)
		return;
	
	Object.values(sWrapper.rules).forEach(function(rule) {
		if (this.extractMostSpecificPartFromSelector(rule.selector) === testValue)
			this.matches.push(testValue + ' / (' + rule.selector + ') - ' + sWrapper.name.slice(0, 9));
	}, this);
}

ComputedStyleSolver.prototype.extractMostSpecificPartFromSelector = function(selector) {
	var splitted = selector.split(/\,|\s/g);
	if (!splitted)
		splitted = selector;
		
	return this.cascadeOnSpecificity(splitted[splitted.length - 1]);
}

ComputedStyleSolver.prototype.cascadeOnSpecificity = function(rightMost) {
	var match;
	
	match = rightMost.match(/#(\w+)/);
	if (match) {
//		this.selectorProofingPartType = Style.constants.idIsProof;
		return match[1];
	}
	else {
		match = rightMost.match(/\.([\w_-]+)|\[class.?="([\w_-]+)"\]/);
		if (match) {
//			this.selectorProofingPartType = Style.constants.classIsProof;
			return match[1] || match[2];
		}
		else {
			//   ':host'.match(/[^\.#:](\w+)/) 	=> 		Array [ "host", "ost"]
			match = rightMost.match(/[^\.#:][\w_-]+/);
			if (match) {
//				this.selectorProofingPartType = Style.constants.tagIsProof;
				return match[0];
			}
		}
	}
	
	return rightMost;
}
















ComputedStyleSolver.prototype.refineMatches = function() {
	
}



















var BranchesAsArray = function(ifCallClause) {
	return [
		ComputedStyleSolver.prototype.noOp,
		ifCallClause
	];
}
BranchesAsArray.prototype = {};









module.exports = ComputedStyleSolver;