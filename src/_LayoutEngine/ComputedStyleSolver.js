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
	
	var offsettedMatcher = this.getOffsettedMatcher(
			collectedSWrappers
		);
	var branches = new BranchesAsArray(
			offsettedMatcher
		);
	this.optimizedMatcher = this.getSelfExitingMatcher(
			branches,
			offsettedMatcher
		);
	
	this.CSSRulesBuffer = this.aggregateRules(
			naiveDOM,
			collectedSWrappers
		);
	
//	console.log(this.matches.reduce(function(acc, val) {
//		return acc += val + ', ';
//	}, ''));
}

ComputedStyleSolver.prototype = {}
ComputedStyleSolver.prototype.objectType = 'ComputedStyleSolver';

ComputedStyleSolver.viewTypes = [
	'masterView',
	'subSections',
	'memberViews'
];

ComputedStyleSolver.prototype.getOffsettedMatcher = function(collectedSWrappers) {
	if (!collectedSWrappers.length)
		return;

	var rules = collectedSWrappers[0].rules;
	var firstRuleKey = Object.keys(rules)[0];
	var standardOffsetForSelector = rules[firstRuleKey].styleIFace.compactedViewOnSelector.binarySchema.stringBinaryEncoding.start;
	var standardOffsetForProofType = rules[firstRuleKey].styleIFace.compactedViewOnSelector.binarySchema.selectorProofingPartType.start;
	
	// testBuffer is an Uint8Array: TODO: observe a consistent style and type it as MemoryBuffer
	// 	(and then, we shall call testBuffer.get)
	var getNextCharToMatch = function(testBuffer, length) {
		return testBuffer[standardOffsetForSelector + length];
	}
	
	return function providePossibleMatchCandidate(testType, testValue, testBuffer, length) {
		return testType === testBuffer[standardOffsetForProofType]
			&& getNextCharToMatch(testBuffer, length) === testValue.charCodeAt(length);
	};
}

ComputedStyleSolver.prototype.getSelfExitingMatcher = function(branches, matcher) {
	
	var storeMatches = this.storeMatches.bind(this);
	
	return function(testType, testValue, testBuffer, length) {
		return storeMatches(
				branches[
					+(
						length > 0
						&& matcher(testType, testValue, testBuffer, length - 1)
					)
					](testType, testValue, testBuffer, --length),
				testValue,
				testBuffer
		);
	}
}

ComputedStyleSolver.prototype.aggregateRules = function(naiveDOM, collectedSWrappers) {
	
	var rulesBuffer = new MemoryBufferStack(8);
	collectedSWrappers.forEach(function(sWrapper) {
		rulesBuffer.append(this.getOptimizedSelectorFromSWrapper(sWrapper));
	}, this);
	
	this.traverseAndGetOptimizedSelectors(rulesBuffer, naiveDOM);
	
	this.CSSRulesBuffer = rulesBuffer;
	this.traverseAndMatchDOM(naiveDOM);
	
	return rulesBuffer;
}

ComputedStyleSolver.prototype.getOptimizedSelectorFromSWrapper = function(sWrapper) {
	var rulesBuffer = new ArrayBuffer(0);
	
	for (var rule in sWrapper.rules) {
		rulesBuffer = rulesBuffer.append(sWrapper.rules[rule].styleIFace.compactedViewOnSelector._buffer.buffer);	
	}
	
	return new Uint8Array(rulesBuffer);
}

ComputedStyleSolver.prototype.getOptimizedSelectorFromNode = function(node) {
	var rulesBuffer = new ArrayBuffer(0);
	
	if (!node.styleDataStructure)
		return rulesBuffer;
	
	for (var rule in node.styleDataStructure.rules) {
		rulesBuffer = rulesBuffer.append(node.styleDataStructure.rules[rule].styleIFace.compactedViewOnSelector._buffer.buffer);
	}
	
	return new Uint8Array(rulesBuffer);
}

ComputedStyleSolver.prototype.traverseAndGetOptimizedSelectors = function(currentRulesBuffer, node) {
	var bufferFromSelectors = this.getOptimizedSelectorFromNode(node);
	
	node.styleRefstartIdx = currentRulesBuffer._byteLength;
	currentRulesBuffer.append(bufferFromSelectors);
	node.styleRefLength = bufferFromSelectors.byteLength;
		
	node.children.forEach(function(childNode) {
		this.traverseAndGetOptimizedSelectors(currentRulesBuffer, childNode)
	}, this);
	
	
}

ComputedStyleSolver.prototype.traverseAndMatchDOM = function(naiveDOM) {
//	var matches = [];
//	console.log('traverseAndMatchDOM');
	naiveDOM.children.forEach(function(node) {
		this.testNodeAgainstSelectors(node)
	}, this);
	
//	return matches;
}

ComputedStyleSolver.prototype.testNodeAgainstSelectors = function(node) {
	var view, typeIdx = 0, currentViewType = ComputedStyleSolver.viewTypes[typeIdx];
	
	while (currentViewType) {
		
		// node.views.masterNode is ALWAYS flat
		if (typeIdx === 0) {
			view = node.views[currentViewType];
			this.matchingFunction(view);
		}
		else {
			node.views[currentViewType].forEach(function(view) {
				this.matchingFunction(view);	
			}, this);
		}
		
		typeIdx++;
		currentViewType = ComputedStyleSolver.viewTypes[typeIdx];
	} 
	
	node.children.forEach(function(childNode) {
		this.testNodeAgainstSelectors(childNode);
	}, this);
		

}

ComputedStyleSolver.prototype.matchingFunction = function(view) {
	var match, testType, testValue;
	
	if (testValue = view.nodeId.toLowerCase()) {
		testType = Style.constants['idIsProof'];
		this.iterateOnRulesAndMatchSelector(testType, testValue);
//		if (match = this.iterateOnRulesAndMatchSelector(testType, testValue))
//			matches.push(match);
	}
	if (view.classNames.length) {
		testType = Style.constants['classIsProof'];
		view.classNames.forEach(function(className) {
			testValue = className.toLowerCase();
			this.iterateOnRulesAndMatchSelector(testType, testValue);
//			if (match = this.iterateOnRulesAndMatchSelector(testType, testValue))
//				matches.push(match);
		}, this);
	}
	
	// May loop twice cause there's always a  tagName...
	testType = Style.constants['tagIsProof'];
	testValue = view.nodeName;
	this.iterateOnRulesAndMatchSelector(testType, testValue);
//	if (match = this.iterateOnRulesAndMatchSelector(testType, testValue))
//		matches.push(match);
}

ComputedStyleSolver.prototype.iterateOnRulesAndMatchSelector = function(testType, testValue) {
	var self = this;
//	console.log('iterateOnRulesAndMatchSelector');
	this.CSSRulesBuffer.branchlessLoop(
		(bufferIdx, buffer) => {
			self.storeMatches(
				self.optimizedMatcher(testType, testValue, buffer, buffer[1]),
				testValue,
				bufferIdx
			);
			// return true in order not to block the loop
			return true;
		},
		0,
		this.CSSRulesBuffer._byteLength / this.CSSRulesBuffer.itemSize
	);
}

ComputedStyleSolver.prototype.noOp = function() {}

ComputedStyleSolver.prototype.storeMatches = function(isMatch, matchedValue, matchedBuffer) {
	// Let's pretend we haven't seen the below magic numbers (and solve that when a better approach is more obvious)...
	
	isMatch
		&& this.matches.push(
				matchedValue + 
				' - ' +
				((matchedBuffer[7] << 8) | matchedBuffer[6])
			);
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