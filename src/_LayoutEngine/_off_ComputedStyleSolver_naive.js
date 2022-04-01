/**
 * constructor ComputedStyleSolver
 */

var TypeManager = require('src/core/TypeManager');
var MemoryBufferStack= require('src/core/MemoryBufferStack');
var Style = require('src/editing/Style');


var ComputedStyleSolver = function(naiveDOM, collectedSWrappers) {

	this.objectType = 'ComputedStyleSolver';
	this.matches = [];
	
	this.collectedSWrappers = collectedSWrappers;
	this.traverseAndMatchDOM(
			naiveDOM
		);
		
	this.tmpRes = this.matches.reduce(function(acc, val) {
		return acc += val + ',\n';
	}, '')
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
	this.iterateOnGlobalRulesAndMatchSelector(testValueview, view);
//	this.iterateOnShadowRulesAndMatchSelector(testValue, sWrapper);
}

ComputedStyleSolver.prototype.iterateOnGlobalRulesAndMatchSelector = function(testValue) {
	
	this.collectedSWrappers.forEach(function(sWrapper) {
		Object.values(sWrapper.rules).forEach(function(rule) {
			if (this.extractMostSpecificPartFromSelector(rule.selector.value) === testValue)
				this.matches.push([testValue, rule.compactedViewOnSelector.get(6, 2)]);
		}, this);	
	}, this);
	
}

//ComputedStyleSolver.prototype.iterateOnShadowRulesAndMatchSelector = function(testValue, sWrapper) {
//	if (!sWrapper)
//		return;
//	
//	Object.values(sWrapper.rules).forEach(function(rule) {
//		if (this.extractMostSpecificPartFromSelector(rule.selector) === testValue)
//			this.matches.push(testValue + ' / (' + rule.selector + ') - ' + sWrapper.name.slice(0, 9));
//	}, this);
//}

ComputedStyleSolver.prototype.extractMostSpecificPartFromSelector = function(selector) {
	return this.cascadeOnSpecificity(selector.components[selector.components.length - 1]);
}

ComputedStyleSolver.prototype.cascadeOnSpecificity = function(rightMosts) {
	var match;
	
	match = CSSSelectorsList.prototype.typeIsID.test(rightMosts);
	if (match) {
		return match[1];
	}
	else {
		match = CSSSelectorsList.prototype.typeIsClass.test(rightMosts);
		if (match) {
			return match[1] || match[2];
		}
		else {
			//   ':host'.match(/[^\.#:](\w+)/) 	=> 		Array [ "host", "ost"]
			match = CSSSelectorsList.prototype.typeIsTagName.test(rightMosts);
			if (match) {
				return match[0];
			}
		}
	}
	
	return rightMosts;
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