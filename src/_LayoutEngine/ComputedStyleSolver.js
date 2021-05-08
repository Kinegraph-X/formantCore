/**
 * constructor ComputedStyleSolver
 */

var TypeManager = require('src/core/TypeManager');
var MemoryBufferStack= require('src/core/MemoryBufferStack');


var ComputedStyleSolver = function(naiveDOM, collectedSWrappers) {
	
	this.objectType = 'ComputedStyleSolver';
	
	this.CSSRulesBuffers = this.aggregateRules(naiveDOM, collectedSWrappers)
}

ComputedStyleSolver.prototype = {}
ComputedStyleSolver.prototype.objectType = 'ComputedStyleSolver';

ComputedStyleSolver.viewTypes = [
	'masterNode',
	'subViews',
	'memberViews'
]

ComputedStyleSolver.prototype.aggregateRules = function(naiveDOM, collectedSWrappers) {
	
	var rulesBuffers = [
		new MemoryBufferStack(8)
	];
	var rootRulesBuffer, currentRulesBuffer, currentBufferIdx = 0;
	
	rootRulesBuffer = rulesBuffers[currentBufferIdx];
	collectedSWrappers.forEach(function(sWrapper) {
		rootRulesBuffer.append(this.getOptimizedSelectorFromSWrapper(sWrapper));
	}, this);
	
	rulesBuffers.push(new MemoryBufferStack(8));
	currentRulesBuffer = rulesBuffers[currentBufferIdx];
	currentRulesBuffer.append(this.getOptimizedSelectorFromNode(naiveDOM));
	
	naiveDOM.children.forEach(function(node) {
		
		rulesBuffers.push(new MemoryBufferStack(8));
		currentRulesBuffer = rulesBuffers[currentBufferIdx];
		
		// TODO: recurse...
		node.startIdx = currentRulesBuffer._byteLength;
		currentRulesBuffer.append(this.getOptimizedSelectorFromNode(node));
		
		currentBufferIdx++;
	}, this);
	
	return rulesBuffers;
}

ComputedStyleSolver.prototype.getOptimizedSelectorFromSWrapper = function(sWrapper) {
	var rulesBuffer = new ArrayBuffer(0);
	
	for (var rule in sWrapper.rules) {
		rulesBuffer.append(sWrapper.rules[rule].styleIFace.compactedViewOnSelector.buffer);
	}
	
	return new Uint8Array(rulesBuffer);
}

ComputedStyleSolver.prototype.getOptimizedSelectorFromNode = function(node) {
	var rulesBuffer = new ArrayBuffer(0);
	
	if (!node.styleDataStucture)
		return rulesBuffer;
		
	for (var rule in node.styleDataStucture.rules) {
		rulesBuffer.append(node.styleDataStucture.rules[rule].styleIFace.compactedViewOnSelector.buffer);
	}
	
	return new Uint8Array(rulesBuffer);
}

ComputedStyleSolver.prototype.traverseDOM = function(naiveDOM) {
	var matches = [];
	
	naiveDOM.forEach(function(node) {
		this.testNodeAgainstSelectors(matches, node)
	}, this);
	
	return matches;
}

ComputedStyleSolver.prototype.testNodeAgainstSelectors = function(matches, node) {
	var view, typeIdx = 0, currentViewType = ComputedStyleSolver.viewTypes[typeIdx];
	
	while (currentViewType) {
		// node.views.masterNode is flat
		if (typeIdx === 0) {
			view = node.views[currentViewType];
			this.matchingFunction(view, matches);
		}
		else {
			node.views[currentViewType].forEach(function(view) {
				this.matchingFunction(view, matches);	
			});
		}
		
		typeIdx++;
		currentViewType = ComputedStyleSolver.viewTypes[typeIdx];
	} 
	
	node.children.forEach(this.testNodeAgainstSelectors.bind(this, matches), this);

}

ComputedStyleSolver.prototype.matchingFunction = function(view, matches) {
	var match, testType, testValue;
	
	if (testValue = view.nodeId) {
		testType = 1;
		if (match = this.iterateOnRulesAndMatchSelector(testType, testValue))
			matches.push(match);
	}
	if (view.classNames.length) {
		testType = 2;
		view.classNames.forEach(function(className) {
			testValue = className;
			if (match = this.iterateOnRulesAndMatchSelector(testType, testValue))
				matches.push(match);
		}, this);
	}
	
	testType = 3;
	testValue = view.nodeName;
	if (match = this.iterateOnRulesAndMatchSelector(testType, testValue))
		matches.push(match);
}

ComputedStyleSolver.prototype.iterateOnRulesAndMatchSelector = function(testType, testValue) {
	
	for (var i = 0, l = this.rulesBuffer.byteLength; i < l; i + 8) {
		console.log(
			String.fromCharCode([
					this.rulesBuffer[i + 1],
					this.rulesBuffer[i + 2], 
					this.rulesBuffer[i + 3], 
					this.rulesBuffer[i + 4]
				]
			)
		);
	}
	
}









module.exports = ComputedStyleSolver;