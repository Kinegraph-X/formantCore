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
	
	this.traverseDOMAndGetOptimizedSelectors(naiveDOM);
}

CSSRulesBufferManager.prototype.getOptimizedSelectorFromSWrapper = function(sWrapper) {
	
	Object.values(sWrapper.rules).forEach(function(rule) {
		this.CSSRulesBuffer.append(rule.styleIFace.compactedViewOnSelector);	
	}, this);
}

CSSRulesBufferManager.prototype.getOptimizedSelectorFromNode = function(node) {
	
	if (!node.styleDataStructure)
		return;
	
	Object.values(node.styleDataStructure.rules).forEach(function(rule) {
		this.CSSRulesBuffer.append(rule.styleIFace.compactedViewOnSelector);
	}, this);
}

CSSRulesBufferManager.prototype.traverseDOMAndGetOptimizedSelectors = function(node) {
	
	node.styleRefStartIdx = this.CSSRulesBuffer._byteLength;
	this.getOptimizedSelectorFromNode(node);
	node.styleRefLength = this.CSSRulesBuffer._byteLength - node.styleRefstartIdx; 
		
	node.children.forEach(function(childNode) {
		this.traverseDOMAndGetOptimizedSelectors(childNode);
	}, this);
	
}








module.exports = CSSRulesBufferManager;