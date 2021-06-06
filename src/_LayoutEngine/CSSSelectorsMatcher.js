/**
 * @constructor CSSSelectorsMatcher
 */

var TypeManager = require('src/core/TypeManager');

var BranchesAsArray = require('src/core/BranchesAsArray');
var Style = require('src/editing/Style');

var CSSRulesBufferManager = require('src/_LayoutEngine/CSSRulesBufferManager');
var CSSSelector = require('src/_LayoutEngine/CSSSelector');

var CSSSelectorsMatcher = function() {
	this.objectType = 'CSSSelectorsMatcher';
	this.CSSRulesBuffer = new CSSRulesBufferManager();		// Dummy instance to avoid "late" hidden class transition
	this.matches = new MatcherResult();
	
	var offsettedMatcher = this.getOffsettedMatcher();
	var branches = new BranchesAsArray(
			offsettedMatcher
		);
	this.optimizedMatcher = this.getSelfExitingMatcher(
			branches,
			offsettedMatcher
		);
	this.iteratorCallback = this.getIteratorCallback();
}
CSSSelectorsMatcher.prototype = {};
CSSSelectorsMatcher.prototype.objectType = 'CSSSelectorsMatcher';

CSSSelectorsMatcher.prototype.traverseDOMAndMatchSelectors = function(naiveDOM, CSSRulesBuffer) {
	this.CSSRulesBuffer = CSSRulesBuffer;
	this.traverseAndMatchDOM(naiveDOM);
}

CSSSelectorsMatcher.prototype.viewTypes = [
	'masterView',
	'subSections',
	'memberViews'
];

CSSSelectorsMatcher.prototype.getOffsettedMatcher = function() {

	// The binarySchema is held on the prototype of the Style type (we access it without pointing to any contextual object)
	var standardOffsetForStartingOffsetInString =		// is currently 0 
		Style.prototype.optimizedSelectorBufferSchema.startingOffsetInString.start;	
	var standardOffsetForSelector =
		Style.prototype.optimizedSelectorBufferSchema.stringBinaryEncoded.start;
	var standardOffsetForProofType =
		Style.prototype.optimizedSelectorBufferSchema.selectorProofingPartType.start;
	
	var getStartingOffsetInString = function(bufferPointerPosition, testBuffer) {
		return testBuffer[bufferPointerPosition + standardOffsetForStartingOffsetInString]; //idem: standardOffsetForStartingOffsetInString is currently 0
	}
	
	// testBuffer is an Uint8Array: TODO: observe a consistent style and type it as MemoryBuffer
	// 	(and then, we shall call testBuffer.get)
	var getNextCharToMatch = function(testBuffer, bufferPointerPosition, currentOffset) {
		return testBuffer[bufferPointerPosition + standardOffsetForSelector + currentOffset];
	}
	
	return function providePossibleMatchCandidate(testType, testValue, bufferPointerPosition, testBuffer, currentOffset) {
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

CSSSelectorsMatcher.prototype.getSelfExitingMatcher = function(branches, matcher) {
	
	var storeMatches = this.storeMatches.bind(this);
	
	return function(testType, testValue, viewUID, bufferPointerPosition, testBuffer, currentOffset) {
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
				viewUID,
				bufferPointerPosition,
				testBuffer
		);
	}
}

CSSSelectorsMatcher.prototype.traverseAndMatchDOM = function(naiveDOM) {
	this.matches.reset();
	
	naiveDOM.children.forEach(function(node) {
		this.testNodeAgainstSelectors(node)
	}, this);
	
//	this.tmpRes = this.matches.reduce(function(acc, val) {
//		return acc += val + ', ';
//	}, '')
}

CSSSelectorsMatcher.prototype.testNodeAgainstSelectors = function(node) {
	var view, typeIdx = 0, currentViewType = CSSSelectorsMatcher.prototype.viewTypes[typeIdx];
	
	while (currentViewType) {
		// node.views.masterNode is ALWAYS flat
		if (typeIdx === 0) {
			view = node.views[currentViewType];
			this.matchingFunction(view, view._UID);
		}
		else {
			node.views[currentViewType].forEach(function(view) {
				this.matchingFunction(view, view._UID);	
			}, this);
		}
		
		typeIdx++;
		currentViewType = CSSSelectorsMatcher.prototype.viewTypes[typeIdx];
	} 
	
	node.children.forEach(function(childNode) {
		this.testNodeAgainstSelectors(childNode);
	}, this);
}

CSSSelectorsMatcher.prototype.matchingFunction = function(view, viewUID) {
	var match, testType, testValue;
	
	if (testValue = view.nodeId.toLowerCase()) {
		testType = CSSSelector.prototype.constants.idIsProof;
		this.iterateOnRulesAndMatchSelector(testType, testValue, viewUID);
	}
	if (view.classNames.length) {
		testType = CSSSelector.prototype.constants.classIsProof;
		view.classNames.forEach(function(className) {
			testValue = className.toLowerCase();
			this.iterateOnRulesAndMatchSelector(testType, testValue, viewUID);
		}, this);
	}
	
	// May loop twice cause there's always a  tagName...
	testType = CSSSelector.prototype.constants.tagIsProof;
	
	testValue = view.nodeName;
	this.iterateOnRulesAndMatchSelector(testType, testValue, viewUID);
	
	// Should do an additional loop to handle the shadowDOM case
//	if (this.isShadowHost(view)) {
//		testValue = ':host';
//		this.iterateOnRulesAndMatchSelector(testType, testValue, viewUID);
//	}
}

CSSSelectorsMatcher.prototype.iterateOnRulesAndMatchSelector = function(testType, testValue, viewUID) {
	this.CSSRulesBuffer.branchlessLoop(
		this.iteratorCallback.bind(null, testType, testValue, viewUID),
		0,
		this.CSSRulesBuffer._byteLength / this.CSSRulesBuffer.itemSize - 1
	);
}

CSSSelectorsMatcher.prototype.getIteratorCallback = function() {
	return function (testType, testValue, viewUID, testBuffer, bufferPointerPosition) {
		this.optimizedMatcher(
			testType,
			testValue,
			viewUID,
			bufferPointerPosition,
			testBuffer,
			// TODO: encapsulate the actualStringLength for it to be legible here
			testBuffer[bufferPointerPosition + 1] - 1	// actualOffsetInTestString = actualStringLength - 1
		);
	}.bind(this);
}

CSSSelectorsMatcher.prototype.storeMatches = function(isMatch, matchedViewUID, bufferPointerPosition, matchedBuffer) {
	// Let's pretend we haven't seen the below magic numbers (and solve that when a better approach is more obvious)...
	
	isMatch
		&& this.matches.addResult(
				matchedViewUID,
				((matchedBuffer[bufferPointerPosition + 7] << 8) | matchedBuffer[bufferPointerPosition + 6]).toString()
			);
}











var MatcherResult = function() {
	this.objectType = 'MatcherResult';
	this.results = [];
}
MatcherResult.prototype = {};
MatcherResult.prototype.objectType = 'MatcherResult';

MatcherResult.prototype.reset = function(testedValue, bufferUID) {
	this.results = [];
}

MatcherResult.prototype.addResult = function(testedValue, bufferUID) {
	this.results.push(this.newResult(testedValue, bufferUID));
}

MatcherResult.prototype.newResult = function(testedValue, bufferUID) {
	return [testedValue, bufferUID];
}














module.exports = CSSSelectorsMatcher;