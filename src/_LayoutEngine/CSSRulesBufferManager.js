/**
 * @constructor CSSRulesBufferManager
 */


var TypeManager = require('src/core/TypeManager');
var Style = require('src/editing/Style');


var CSSRulesBufferManager = function(instanciatedBuffer) {
	this.objectType = "CSSRulesBufferManager";
	this.CSSRulesBuffer = instanciatedBuffer;
}
CSSRulesBufferManager.prototype = {};
CSSRulesBufferManager.prototype.objectType = 'CSSRulesBufferManager';

CSSRulesBufferManager.prototype.rebuildCSSRulesBuffer = function(naiveDOM, collectedSWrappers) {
	this.aggregateRules(
			naiveDOM,
			collectedSWrappers
		);
}

CSSRulesBufferManager.prototype.aggregateRules = function(naiveDOM, collectedSWrappers) {
	collectedSWrappers.forEach(function(sWrapper) {
		this.getOptimizedSelectorFromSWrapper(sWrapper);
	}, this);
	this.CSSRulesBufferInitialLength = this.CSSRulesBuffer._byteLength;
	this.traverseDOMAndGetOptimizedSelectors(naiveDOM, false);
}

CSSRulesBufferManager.prototype.getOptimizedSelectorFromSWrapper = function(sWrapper) {
	Object.values(sWrapper.rules).forEach(function(rule) {
		this.CSSRulesBuffer.append(rule.styleIFace.compactedViewOnSelectorsList);	
	}, this);
}

CSSRulesBufferManager.prototype.getOptimizedSelectorFromNode = function(node) {
	
	if (!node.styleDataStructure)
		return;
	else if (node.styleDataStructure  && !node.isShadowHost) {
		console.warn('CSSRulesBufferManager:', 'Trying to append rules from an inline styleElem altough the component was not defined as shadowHost.');
		return;
	}	
	
	Object.values(node.styleDataStructure.rules).forEach(function(rule) {
		this.CSSRulesBuffer.append(rule.styleIFace.compactedViewOnSelectorsList);
	}, this);
}

CSSRulesBufferManager.prototype.traverseDOMAndGetOptimizedSelectors = function(node, isShadowingActive, styleRefStartIdx, styleRefLength) {

	// FIXME... that can't cover all the use cases.
	//  	=> case of randomly inserted style elements (represented here as styleDataStructure):
	// 		if the node isn't shadowed, the structure must be added to the buffer at the current step,
	//		as we're back upward after having dug in a shadowed tree (visible in the else clause)
	//		But our buffer is flat, then appending a non-shadowed stylesheet
	// 		after some shadowed ones will provoque a discontinuity.
	//		(That flat buffer is used here like as an optimization
	//		strategy for a tree data-structure).
	
	// For now, we're only able to handle the already seen stylesheets (see below)
	
	// ==> node.styleRefIdx is more probably an array of start/length pairs
	
	if (node.isShadowHost || isShadowingActive) {
		isShadowingActive = true;
		
		// We shall for now handle a pretty rare side-case by assigning 
		// the last-seen CSS scope to the node. 
		// It corresponds to the case where a non-shadowed node would exist
		// in a shadowed scope without having been assigned a concrete sWrapper
		
		// ==> node.styleRefIdx is more probably an array of start/length pairs
		node.styleRefStartIdx = styleRefStartIdx;
		node.styleRefLength = styleRefLength;
		
		// And after that, handle the concrete case of an explictly shadowed node
		if (node.isShadowHost) {
			
			// ==> node.styleRefIdx is more probably an array of start/length pairs
			node.styleRefStartIdx = this.CSSRulesBuffer._byteLength;
			this.getOptimizedSelectorFromNode(node);
			// We shall fallback on the last seen bufferLength if the node doesn't have a styleDataStructure
			node.styleRefLength = (this.CSSRulesBuffer._byteLength - node.styleRefStartIdx) || styleRefLength;
		}
	}
	// NOTE: could we set a permanent test-case for some obvious shadow & non-shadow mixed cases ?
	// and then only test once, getting the current CSS scope (range) for the non-shadowed case
	// and also in the case of style absence, and getting a new scope if a styleDataStructure
	// has been referenced on the currrently handled node...	
	else {
		isShadowingActive = false;
		
		// ==> node.styleRefIdx is more probably an array of start/length pairs
		
		// For now, we're only able to handle the already seen stylesheets.
		// But there is very little probability to encounter an isolated stylesheet that
		// would have been defined during the JS runtime.
		// 			=> Let's try to think those rarities and to handle those:
		// 			we may want to demo our kind of magical approach on absolutely weird and unknown pages...
		node.styleRefStartIdx = 0;
		this.getOptimizedSelectorFromNode(node);
		node.styleRefLength = this.CSSRulesBufferInitialLength;
	}
	
	node.children.forEach(function(childNode) {
		this.traverseDOMAndGetOptimizedSelectors(childNode, isShadowingActive, node.styleRefStartIdx, node.styleRefLength);
	}, this);
	
}








module.exports = CSSRulesBufferManager;