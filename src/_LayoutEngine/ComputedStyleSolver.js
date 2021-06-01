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
	this.iteratorCallback = this.getIteratorCallback();
	
	// For now, let's scale the CSS memoryBuffer to a size big enough to handle 3000 rules
	this.CSSRulesBuffer = this.scaleCSSBuffer(naiveDOM, collectedSWrappers);
	
	this.aggregateRules(
			naiveDOM,
			collectedSWrappers
		);
		
	this.tmpRes = this.matches.reduce(function(acc, val) {
		return acc += val + ', ';
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

ComputedStyleSolver.prototype.getOffsettedMatcher = function(collectedSWrappers) {
	if (!collectedSWrappers.length)
		return;

	// TODO: put the binarySchema on the prototype of the sWrapper (and access it without pointing to the first rule)
	var rules = collectedSWrappers[0].rules;
	var firstRuleKey = Object.keys(rules)[0];
	
	// is currently 0
	var standardOffsetForStartingOffsetInString = rules[firstRuleKey].styleIFace.compactedViewOnSelector.binarySchema.startingOffsetInString.start;
	
	var standardOffsetForSelector = rules[firstRuleKey].styleIFace.compactedViewOnSelector.binarySchema.stringBinaryEncoding.start;
	var standardOffsetForProofType = rules[firstRuleKey].styleIFace.compactedViewOnSelector.binarySchema.selectorProofingPartType.start;
	
	var getStartingOffsetInString = function(bufferPointerPosition, testBuffer) {
		return testBuffer[bufferPointerPosition + standardOffsetForStartingOffsetInString]; //idem: standardOffsetForStartingOffsetInString is currently 0
	}
	
	// testBuffer is an Uint8Array: TODO: observe a consistent style and type it as MemoryBuffer
	// 	(and then, we shall call testBuffer.get)
	var getNextCharToMatch = function(testBuffer, bufferPointerPosition, currentOffset) {
//		console.log(bufferPointerPosition, standardOffsetForSelector, length, testBuffer[bufferPointerPosition + standardOffsetForSelector + length]);
		return testBuffer[bufferPointerPosition + standardOffsetForSelector + currentOffset];
	}
	
	return function providePossibleMatchCandidate(testType, testValue, bufferPointerPosition, testBuffer, currentOffset) {
//		console.log(testType, testValue, bufferPointerPosition, currentOffset, testBuffer[bufferPointerPosition + standardOffsetForProofType]);
//		(testType === testBuffer[bufferPointerPosition + standardOffsetForProofType]
//			&& console.log(
//				testType, testBuffer[bufferPointerPosition + standardOffsetForProofType],
//				bufferPointerPosition,
//				currentOffset,
//				getStartingOffsetInString(bufferPointerPosition, testBuffer) + currentOffset,
//				testValue[getStartingOffsetInString(bufferPointerPosition, testBuffer) + currentOffset],
//				testValue.charCodeAt(getStartingOffsetInString(bufferPointerPosition, testBuffer) + currentOffset),
//				String.fromCharCode(testBuffer[bufferPointerPosition + standardOffsetForSelector]),
//				testBuffer[bufferPointerPosition + standardOffsetForSelector + currentOffset],
//				getNextCharToMatch(testBuffer, bufferPointerPosition, currentOffset)
//			)
//		);
		return testType === testBuffer[bufferPointerPosition + standardOffsetForProofType]
			&& getNextCharToMatch(
					testBuffer,
					bufferPointerPosition,
					currentOffset
				) === testValue.charCodeAt(
					getStartingOffsetInString(
						bufferPointerPosition, testBuffer
					) + currentOffset
				);
	};
}

ComputedStyleSolver.prototype.getSelfExitingMatcher = function(branches, matcher) {
	
	var storeMatches = this.storeMatches.bind(this);
	
	return function(testType, testValue, bufferPointerPosition, testBuffer, currentOffset) {
//		console.log(testType, testValue, bufferPointerPosition, currentOffset);
		return storeMatches(
				branches[
						+(currentOffset > -1
							&& matcher(
								testType,
								testValue,
								bufferPointerPosition,
								testBuffer,
								currentOffset
							)
						)
					](
						testType,
						testValue,
						bufferPointerPosition,
						testBuffer,
						--currentOffset
					),
				testValue,
				testBuffer
		);
	}
}

ComputedStyleSolver.prototype.scaleCSSBuffer = function(naiveDOM, collectedSWrappers) {
	return new MemoryBufferStack(8, 3000);
}

ComputedStyleSolver.prototype.aggregateRules = function(naiveDOM, collectedSWrappers) {
	
//	var rulesBuffer = new MemoryBufferStack(8);
	var rulesBuffer = this.CSSRulesBuffer;
	
	collectedSWrappers.forEach(function(sWrapper) {
//		rulesBuffer.append(this.getOptimizedSelectorFromSWrapper(sWrapper));
		this.getOptimizedSelectorFromSWrapper(sWrapper);
	}, this);
	
	this.traverseAndGetOptimizedSelectors(naiveDOM);
	
//	this.CSSRulesBuffer = rulesBuffer;
//	console.log(this.CSSRulesBuffer);
	this.traverseAndMatchDOM(naiveDOM);
	
//	return rulesBuffer;
}

ComputedStyleSolver.prototype.getOptimizedSelectorFromSWrapper = function(sWrapper) {
//	var rulesBuffer = new ArrayBuffer(0);
	
	Object.values(sWrapper.rules).forEach(function(rule) {
		this.CSSRulesBuffer.append(rule.styleIFace.compactedViewOnSelector);	
	}, this);
	
//	return new Uint8Array(rulesBuffer);
}

ComputedStyleSolver.prototype.getOptimizedSelectorFromNode = function(node) {
//	var rulesBuffer = new ArrayBuffer(0);
	
	if (!node.styleDataStructure)
		return //rulesBuffer;
	
	Object.values(node.styleDataStructure.rules).forEach(function(rule) {
		this.CSSRulesBuffer.append(rule.styleIFace.compactedViewOnSelector);
	}, this);
	
//	return new Uint8Array(rulesBuffer);
}

ComputedStyleSolver.prototype.traverseAndGetOptimizedSelectors = function(node) {
//	var bufferFromSelectors = this.getOptimizedSelectorFromNode(node);
	
	node.styleRefstartIdx = this.CSSRulesBuffer._byteLength;
	this.getOptimizedSelectorFromNode(node);
//	this.currentRulesBuffer.append(bufferFromSelectors);
	node.styleRefLength = this.CSSRulesBuffer._byteLength;
		
	node.children.forEach(function(childNode) {
		this.traverseAndGetOptimizedSelectors(childNode)
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
//	console.log(testValue);
	this.iterateOnRulesAndMatchSelector(testType, testValue);
//	if (match = this.iterateOnRulesAndMatchSelector(testType, testValue))
//		matches.push(match);
}

ComputedStyleSolver.prototype.iterateOnRulesAndMatchSelector = function(testType, testValue) {
//	var self = this;
	
//	console.log('iterateOnRulesAndMatchSelector');
	this.CSSRulesBuffer.branchlessLoop(
		this.iteratorCallback.bind(null, testType, testValue),
		0,
		this.CSSRulesBuffer._byteLength / this.CSSRulesBuffer.itemSize - 1
	);
}

ComputedStyleSolver.prototype.getIteratorCallback = function() {
	return function (testType, testValue, testBuffer, bufferPointerPosition) {
//		console.log(bufferPointerPosition, testBuffer[bufferPointerPosition + 1]);
		this.optimizedMatcher(
			testType,
			testValue,
			bufferPointerPosition,
			testBuffer,
			// TODO: encapsulate the actualStringLength for it to be legible here
			testBuffer[bufferPointerPosition + 1] - 1	// actualOffsetInTestString = actualStringLength - 1
		);
	}.bind(this);
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