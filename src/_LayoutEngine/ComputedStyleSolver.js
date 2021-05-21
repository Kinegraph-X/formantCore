/**
 * constructor ComputedStyleSolver
 */

var TypeManager = require('src/core/TypeManager');
var MemoryBufferStack= require('src/core/MemoryBufferStack');
var Style = require('src/editing/Style');


var ComputedStyleSolver = function(naiveDOM, collectedSWrappers) {
	
	this.objectType = 'ComputedStyleSolver';
	
	this.CSSRulesBuffer = this.aggregateRules(naiveDOM, collectedSWrappers);
	
}

ComputedStyleSolver.prototype = {}
ComputedStyleSolver.prototype.objectType = 'ComputedStyleSolver';

ComputedStyleSolver.viewTypes = [
	'masterView',
	'subSections',
	'memberViews'
]

ComputedStyleSolver.prototype.aggregateRules = function(naiveDOM, collectedSWrappers) {
	
	// TODO: define an explicit type for the flat-type-tree
//	var rulesBuffers = [
//		new MemoryBufferStack(8)
//	];
//	var rootRulesBuffer, currentRulesBuffer, currentBufferIdx = 0;
	
	var rulesBuffer = new MemoryBufferStack(8);
	
//	rootRulesBuffer = rulesBuffers[currentBufferIdx];
	collectedSWrappers.forEach(function(sWrapper) {
		rulesBuffer.append(this.getOptimizedSelectorFromSWrapper(sWrapper));
	}, this);
	
//	rulesBuffers.push(new MemoryBufferStack(8));
//	currentBufferIdx++;
//	currentRulesBuffer = rulesBuffers[currentBufferIdx];
	this.traverseAndGetOptimizedSelectors(rulesBuffer, naiveDOM);
	
//	performance.mark('rootRulesBuffer.traverse');
//	var toMatch = 1 + 4;
//	var value;
//	rootRulesBuffer.traverse(
//		function(buffer, startOffset, length) {
//			value = buffer[startOffset + toMatch];
//		}
//	);
//	performance.measure('bench_style_datastructures_traversal', 'rootRulesBuffer.traverse');
//	console.log('bench_style_datastructures_traversal',  performance.getEntriesByName('bench_style_datastructures_traversal')[0].duration, 'ms');
	
	this.CSSRulesBuffer = rulesBuffer;
	this.traverseAndMatchDOM(naiveDOM);
	
//	console.log(rulesBuffer);
	
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
//		console.log(node.views.masterView.nodeName, node.styleDataStructure.rules[rule].styleIFace.compactedViewOnSelector._buffer);
		rulesBuffer = rulesBuffer.append(node.styleDataStructure.rules[rule].styleIFace.compactedViewOnSelector._buffer.buffer);
	}
	
	return new Uint8Array(rulesBuffer);
}

ComputedStyleSolver.prototype.traverseAndGetOptimizedSelectors = function(currentRulesBuffer, node) {
	var bufferFromSelectors = this.getOptimizedSelectorFromNode(node);
//	if (!(bufferFromSelectors = this.getOptimizedSelectorFromNode(node)).byteLength)
//		return;
		
//	console.log(node.views.masterView.nodeName, bufferFromSelectors	);
	node.styleRefstartIdx = currentRulesBuffer._byteLength;
	currentRulesBuffer.append(bufferFromSelectors);
	node.styleRefLength = bufferFromSelectors.byteLength;
		
	node.children.forEach(function(childNode) {
//		console.log(childNode.children);
//		currentRulesBuffer.append(this.getOptimizedSelectorFromNode(childNode));
		this.traverseAndGetOptimizedSelectors(currentRulesBuffer, childNode)
	}, this);
	
	
}

ComputedStyleSolver.prototype.traverseAndMatchDOM = function(naiveDOM) {
	var matches = [];
	
	naiveDOM.children.forEach(function(node) {
		this.testNodeAgainstSelectors(matches, node)
	}, this);
	
	return matches;
}

ComputedStyleSolver.prototype.testNodeAgainstSelectors = function(matches, node) {
	var view, typeIdx = 0, currentViewType = ComputedStyleSolver.viewTypes[typeIdx];
//	console.log(node);
	while (currentViewType) {
//		console.log(currentViewType);
		
		// node.views.masterNode is ALWAYS flat
		if (typeIdx === 0) {
			view = node.views[currentViewType];
			this.matchingFunction(matches, view);
		}
		else {
			node.views[currentViewType].forEach(function(view) {
				this.matchingFunction(matches, view);	
			}, this);
		}
		
		typeIdx++;
		currentViewType = ComputedStyleSolver.viewTypes[typeIdx];
	} 
	
	node.children.forEach(function(childNode) {
//		console.log(childNode);
//		console.log(childNode.views.masterView.nodeName);
		this.testNodeAgainstSelectors(matches, childNode);
	}, this);
		

}

ComputedStyleSolver.prototype.matchingFunction = function(matches, view) {
	var match, testType, testValue;
	
	if (testValue = view.nodeId.toLowerCase()) {
		testType = Style.constants['idIsProof'];
		if (match = this.iterateOnRulesAndMatchSelector(testType, testValue))
			matches.push(match);
	}
	if (view.classNames.length) {
		testType = Style.constants['classIsProof'];
		view.classNames.forEach(function(className) {
			testValue = className.toLowerCase();
			if (match = this.iterateOnRulesAndMatchSelector(testType, testValue))
				matches.push(match);
		}, this);
	}
	
	// May loop twice cause there's always a  tagName...
	testType = Style.constants['tagIsProof'];
	testValue = view.nodeName;
	if (match = this.iterateOnRulesAndMatchSelector(testType, testValue))
		matches.push(match);
}

ComputedStyleSolver.prototype.iterateOnRulesAndMatchSelector = function(testType, testValue) {
	var self = this;
//	console.log('Matching ' + testValue + '... as ' + testType);
//	for (var i = 0, l = this.rulesBuffer.byteLength; i < l; i + 8) {
//		console.log(
//			String.fromCharCode([
//					this.rulesBuffer[i + 1],
//					this.rulesBuffer[i + 2], 
//					this.rulesBuffer[i + 3], 
//					this.rulesBuffer[i + 4]
//				]
//			)
//		);
//	}

//	var matchChar = this.matchCharFunction;
//	var noOp = this.noOp;

	var optimizedSampleLength;
	var traversingMatchFunctions = [
		this.noOp,
		this.matchCharFunction
	];
	var resultMatchFunctions = [
		this.noOp,
		Array.prototype.push
	];
//	var branchlessExitCondition = this.branchlessExitCondition;
	var testValueIdx = 0;
	var toMatchIdx = 0;
	var match = 0;
	var matches = [];
//	var limit = 100, iteration = 0;

	var matchCharFunction = this.matchCharFunction.bind(this);

	this.CSSRulesBuffer.traverse(
		function(buffer, startOffset, length) {
//			console.log(buffer[startOffset + 4]);
//			var shouldMatch;
//			while (
//				iteration < limit
//					&& (
//						shouldMatch = self.shouldMatch(
//							testValueIdx,
//							toMatchIdx,
//							testValue,
//							buffer,
//							traversingMatchFunctions,
//							buffer[startOffset]
//						)
//					)
//				) {
//				console.log(shouldMatch);
//				if (self.matchCharFunction(testValueIdx, toMatchIdx, testValue, buffer)) {
//					match++;
//				}
//				iteration++;
//			}

			optimizedSampleLength = buffer[startOffset + 1];
			toMatchIdx = startOffset + optimizedSampleLength;
			
			// buffer[startOffset] holds the length of the pattern to match
			// Won't work
			// We must be able to identify if the data-structure holds a zero-based offset or a 4-based offset
			testValueIdx = buffer[startOffset] + optimizedSampleLength - 1;
			
//			if (!testValue[testValueIdx])
//				console.log(optimizedSampleLength, testValue, buffer[startOffset], optimizedSampleLength);

//			console.log(startOffset, buffer[startOffset], testValue, String.fromCharCode(buffer[startOffset + 2]) + String.fromCharCode(buffer[startOffset + 3]) + String.fromCharCode(buffer[startOffset + 4]), testValueIdx, optimizedSampleLength);
			
			// That won't match, for sure...
//			if (testValueIdx >= testValue.length)
//				return;
//			else if (!testValueIdx || !testValue[testValueIdx]) {
//				console.warn('No char in testValue at the offset -', testValueIdx, '- referenced by the optimized buffer for the CSS selectors : ' + Object.keys(Style.constants)[testType] + ' -> "' + testValue + '".', 'Returning...');
//				console.log('[debug] The startOffset is ' + startOffset, '. The first 2 bytes of the buffer are:', buffer[startOffset], optimizedSampleLength)
//				return;
//			}
			
			// AND : we must know the kind of testValue we were passed (id, class, or tag),
			// in order not to match against a selector we didn't bufferize
			
			match = matchCharFunction(
					testType,
					buffer[startOffset + 5],	// Style.constants are proofIsId, proofIsClass, proofIsTag, etc...
					testValueIdx,
					toMatchIdx,
					testValue,
					buffer,
					traversingMatchFunctions,
					optimizedSampleLength
				);
			
//			console.log(match);
			
			self.getArrayPushFunction(
				resultMatchFunctions,
				match !== false
			).call(
				matches,
				new matchedValue(testValue, buffer, startOffset)
			);
			
//			console.log(!self.matchCharFunction(
//				testType,
//				buffer[startOffset + 5],	// Style.constants are proofIsId, proofIsClass, proofIsTag, etc...
//				testValueIdx,
//				toMatchIdx,
//				testValue,
//				buffer,
//				traversingMatchFunctions,
//				buffer[startOffset]
//			) ? [testValue, testValueIdx, (testValue[testValueIdx] && testValue[testValueIdx].charCodeAt(0)), toMatchIdx, buffer[toMatchIdx]].join(', ') : true);
			
//			if (match === buffer[0])
//				matches.push(
//					parseInt(
//						buffer[startOffset + length - 1].toString(2) + 
//							buffer[startOffset + length - 2].toString(2),
//						2
//					)
//				);
//			match = 0;
		}
	);
	
//	console.log(matches);
}

//ComputedStyleSolver.prototype.branchlessExitCondition = function(branches, currentOffset, sampleLength) {
//	console.log(currentOffset); //branches[Number(currentOffset < sampleLength)]);
//	return branches[Number(++currentOffset < sampleLength)];
//}

ComputedStyleSolver.prototype.shouldMatch = function(branches, sampleLength) {
//	console.log(sampleLength);
	return branches[Number(sampleLength > 0)];
}

ComputedStyleSolver.prototype.matchCharFunction = function(testType, typeOfSelector, testValueIdx, toMatchIdx, testValue, buffer, branches, sampleLength) {
//	console.log(testValueIdx, testValue[testValueIdx] ? testValue[testValueIdx].charCodeAt(0) : testValue + ' : ' + testValueIdx, toMatchIdx, buffer[toMatchIdx]);
//	console.log(Object.keys(Style.constants)[testType], testValue, testValue[testValueIdx] ? testValue[testValueIdx] : testValue, String.fromCharCode(buffer[toMatchIdx]), testValue[testValueIdx] ? testValue[testValueIdx].charCodeAt(0) === buffer[toMatchIdx] : 'testValueIdx outOfBounds', testValueIdx);
//	console.log(
//			testType === typeOfSelector,
//			testValue[testValueIdx] ? testValue[testValueIdx].charCodeAt(0) === buffer[toMatchIdx] : 'testValueIdx outOfBounds',
//			testValueIdx,
//			toMatchIdx,
////			testValue,
////			testValue[testValueIdx],
////			buffer.slice(toMatchIdx, toMatchIdx + sampleLength),
////			Array.from(buffer.slice(toMatchIdx, toMatchIdx + sampleLength)),
////			String.fromCharCode.apply(null, Array.from(buffer.slice(toMatchIdx, toMatchIdx + sampleLength))), 
////			testType, typeOfSelector,
////			testValue[testValueIdx].charCodeAt(0),
////			buffer[toMatchIdx]
//		);
	return testType === typeOfSelector
		&& testValue[testValueIdx]
		&& testValue[testValueIdx].charCodeAt(0) === buffer[toMatchIdx]
		&& this.shouldMatch(branches, --sampleLength).call(this, testType, typeOfSelector, testValueIdx--, toMatchIdx--, testValue, buffer, branches, sampleLength);
}

ComputedStyleSolver.prototype.getArrayPushFunction = function(branches, res) {
	return branches[Number(res)];
}

ComputedStyleSolver.prototype.noOp = function() {}






var matchedValue = function(against, buffer, startOffset) {
	this.matchedValue = against;
	this.UUID = new Uint16Array(buffer, startOffset, startOffset + 4)[3];
}
matchedValue.protoype = {};













ComputedStyleSolver.prototype.refineMatches = function() {
	
}





























module.exports = ComputedStyleSolver;