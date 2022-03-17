/**
 * @constructor CSSSelector
 */

var TypeManager = require('src/core/TypeManager');


var CSSSelector = function(selectorAsStr) {
	//TODO: A CSS selector may be a list of selectors
	//		=> instanciate a list by default
	
	this.selectorStr = selectorAsStr;
	this.components = new CSSSelectorComponentList();	// Dummy object to avoid hidden-class transition
	this.selectorProofingPartType = 0;
	this.rightMost = this.extractMostSpecificPartFromSelector();
}
CSSSelector.prototype = {};
CSSSelector.prototype.objectType = 'CSSSelector';

CSSSelector.prototype.toString = function() {
	return this.selectorStr;
}

CSSSelector.prototype.extractMostSpecificPartFromSelector = function() {
	this.components = new CSSSelectorComponentList(this.selectorStr);

	return this.cascadeOnSpecificity(this.components[this.components.length - 1].value);
}

CSSSelector.prototype.cascadeOnSpecificity = function(rightMost) {
	var match;
	
	match = rightMost.match(this.typeIsId);
//	(rightMost === ':host' && console.log(rightMost, match));
	if (match) {
		this.selectorProofingPartType = this.constants.idIsProof;
		return match[1];
	}
	else {
		match = rightMost.match(this.typeIsClass);
//		(rightMost === ':host' && console.log(rightMost, match));
		if (match) {
			this.selectorProofingPartType = this.constants.classIsProof;
			return match[1] || match[2];
		}
		else {
			match = rightMost.match(this.typeIsHost);
//			(rightMost === ':host' && console.log(rightMost, match));
			if (match) {
				this.selectorProofingPartType = this.constants.hostIsProof;
				return match[0];
			}
			else {
			match = rightMost.match(this.typeIsTag);
//			(rightMost === ':host' && console.log(rightMost, match));
			if (match) {
				this.selectorProofingPartType = this.constants.tagIsProof;
				return match[0];
			}
		}
		}
	}
	
	return rightMost;
}

CSSSelector.prototype.constants = {
	rawSelectorIsProof : 0,
	idIsProof : 1,
	classIsProof : 2,
	tagIsProof : 3,
	hostIsProof : 4
}







var CSSSelectorComponentList = function(selectorAsStr) {
	if (!selectorAsStr)
		return;
	this.captureRelationship(selectorAsStr);
	if (!this.length)
		console.warn('CSSSelectorComponentList:', 'selectorAsStr => [' + selectorAsStr + ']', 'instanciation of the CSSSelectorComponentList failed.')
}
CSSSelectorComponentList.prototype = Object.create(Array.prototype);

Object.defineProperty(CSSSelectorComponentList.prototype, 'objectType', {
	value : 'CSSSelectorComponentList'
});

Object.defineProperty(CSSSelectorComponentList.prototype, 'captureRelationship', {
	value : function(selectorAsStr) {
		// FIXME: if we encounter a coma, that's a list of identical rules
		// CURRENTLY NOT SUPPORTED
		var leftSibbling;
		var splitted = selectorAsStr.trim().split(CSSSelectorComponent.prototype.splitter);
		
//		if (!Array.isArray(splitted))
//			this.push(new CSSSelectorComponent(selectorAsStr));
//		else
			splitted.forEach(function(rawComponent) {
//				console.log(rawComponent);
				this.push(new CSSSelectorComponent(rawComponent, leftSibbling));
				leftSibbling = rawComponent;
			}, this);
	}
});














var CSSSelectorComponent = function(componentAsStr, leftSibbling) {
	this.objectType = 'CSSSelectorComponent';
	
	this.value = componentAsStr;
	this.type = this.getType(componentAsStr);
	this.relation = this.getRelation(leftSibbling);
	
	return (this.type && this.relation) || undefined;
}
CSSSelectorComponent.prototype = {};
CSSSelectorComponent.prototype.objectType = 'CSSSelectorComponent';

CSSSelectorComponent.prototype.typeIsUniversal = /^\*$/;
CSSSelectorComponent.prototype.typeIsId = /#(\w+)/;
CSSSelectorComponent.prototype.typeIsClass = /\.([\w_-]+)|\[class.?="([\w_-]+)"\]/;
CSSSelectorComponent.prototype.typeIsHost = /:host/;
CSSSelectorComponent.prototype.typeIsTag = /[^\.#\:][-s\w_]+/;

CSSSelectorComponent.prototype.getType = function(componentAsStr) {
	// TODO: we have very few means to identify the case of an "attribute" qualifying a component
	// TODO: Nor have we a good solution to bind an isolate "attribute" to a universal component
	if (this.typeIsId.test(componentAsStr))
		return this.typeConstants.idType;
	else if (this.typeIsClass.test(componentAsStr))
		return this.typeConstants.classType;
	else if (this.typeIsTag.test(componentAsStr))
		return this.typeConstants.tagType;
	else if (this.typeIsHost.test(componentAsStr))
		return this.typeConstants.hostType;
	else if (this.typeIsUniversal.test(componentAsStr))
		return this.typeConstants.universalType;
	else {
//		console.warn('CSSSelectorComponent:', 'unknown type case should not be reachable.');
		return this.relationConstants.unknownType;
	}
}

CSSSelectorComponent.prototype.getRelation = function(leftSibbling) {
	if (!leftSibbling)
		return this.relationConstants.none;
	else if (this.isValidComponent(leftSibbling))
		return this.relationConstants.descendant;
	else if (leftSibbling === this.interestingTokens.immediateDescendantToken)
		return this.relationConstants.immediateDescendant;
	else if (leftSibbling === this.interestingTokens.adjacentSibblingToken)
		return this.relationConstants.adjacentSibbling;
	else if (leftSibbling === this.interestingTokens.generalSibblingToken)
		return this.relationConstants.generalSibbling;
	else {
		console.warn('CSSSelectorComponent:', 'leftSibbling => [' + leftSibbling + ']', 'unknown relation case should not be reachable.');
		return this.relationConstants.unknown;
	}
}

CSSSelectorComponent.prototype.isValidComponent = function(leftSibbling) {
	// HACK: could we really rely on the fact that a component
	// is valid if it can be resolved to a known type ? 
	return this.getType(leftSibbling);
}

CSSSelectorComponent.prototype.interestingTokens = {
	immediateDescendantToken : '>',
	adjacentSibblingToken : '+',
	generalSibblingToken : '~'
}

CSSSelectorComponent.prototype.typeConstants = {
	unknownType : 0,
	universalType : 1,
	idType : 2,
	classType : 3,
	tagType : 4,
	hostType : 5
}

CSSSelectorComponent.prototype.relationConstants = {
	unknown : 0,
	none : 1,
	descendant : 2,
	immediateDescendant : 3,
	adjacentSibbling : 4,
	generalSibbling : 5
}

CSSSelectorComponent.prototype.splitter = /,|\s/;

CSSSelectorComponent.prototype.shadowDOMHostSpecialKeyword = ':host';



















CSSSelector.prototype.typeIsUniversal = CSSSelectorComponent.prototype.typeIsUniversal;
CSSSelector.prototype.typeIsId = CSSSelectorComponent.prototype.typeIsId;
CSSSelector.prototype.typeIsClass = CSSSelectorComponent.prototype.typeIsClass;
CSSSelector.prototype.typeIsTag = CSSSelectorComponent.prototype.typeIsTag;
CSSSelector.prototype.typeIsHost = CSSSelectorComponent.prototype.typeIsHost;

CSSSelector.prototype.interestingTokens = CSSSelectorComponent.prototype.interestingTokens;
CSSSelector.prototype.typeConstants = CSSSelectorComponent.prototype.typeConstants;
CSSSelector.prototype.relationConstants = CSSSelectorComponent.prototype.relationConstants;

CSSSelector.prototype.shadowDOMHostSpecialKeyword = CSSSelectorComponent.prototype.shadowDOMHostSpecialKeyword;

module.exports = CSSSelector;