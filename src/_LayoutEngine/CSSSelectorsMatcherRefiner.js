/**
 * @constructor CSSSelectorsMatcherRefiner
 */

var TypeManager = require('src/core/TypeManager');
var CSSSelector = require('src/_LayoutEngine/CSSSelector');


var CSSSelectorsMatcherRefiner = function() {
	this.objectType = 'CSSSelectorsMatcherRefiner';
	
}
CSSSelectorsMatcherRefiner.prototype = {};
CSSSelectorsMatcherRefiner.prototype.objectType = 'CSSSelectorsMatcherRefiner';

// HACK: importedNaiveDOMRegistry is needed when we get the naiveDOM from an outer IFrame
//CSSSelectorsMatcherRefiner.prototype.refineMatches = function(matchResult) {
CSSSelectorsMatcherRefiner.prototype.refineMatches = function(matchResult, importedNaiveDOMRegistry, importedMasterStyleRegistry) {
	return matchResult.results.filter(function(match) {
		return this.validateMatch(
				match[0],											// match[0] is a node UID
//				TypeManager.masterStyleRegistry.getItem(match[1]),	// match[1] is a selectorBuffer's UID
				importedMasterStyleRegistry.getItem(match[1]),		// importedMasterStyleRegistry is needed when we get the sWrappers from an outer IFrame
				importedNaiveDOMRegistry							// importedNaiveDOMRegistry is needed when we get the naiveDOM from an outer IFrame
			)
				&& this.publishToBeComputedStyle(
					match[0],											// match[0] is a node UID
//					TypeManager.masterStyleRegistry.getItem(match[1]),	// match[1] is a selectorBuffer's UID
					importedMasterStyleRegistry.getItem(match[1]),		// importedMasterStyleRegistry is needed when we get the sWrappers from an outer IFrame
					importedNaiveDOMRegistry							// importedNaiveDOMRegistry is needed when we get the naiveDOM from an outer IFrame
				);
//				&& this.appendStyleToComputedStyle(
//					match[0],											// match[0] is a node UID
////					TypeManager.masterStyleRegistry.getItem(match[1]),	// match[1] is a selectorBuffer's UID
//					importedMasterStyleRegistry.getItem(match[1]),		// importedMasterStyleRegistry is needed when we get the sWrappers from an outer IFrame
//					importedNaiveDOMRegistry							// importedNaiveDOMRegistry is needed when we get the naiveDOM from an outer IFrame
//				);
		
	}, this);
}

CSSSelectorsMatcherRefiner.prototype.validateMatch = function(viewUID, refToStyle, importedNaiveDOMRegistry) {
//	var view = TypeManager.naiveDOMRegistry.getItem(viewUID);
	var view = importedNaiveDOMRegistry.getItem(viewUID);
	
	// if isActualMatch return true
	if (refToStyle.selector.components.length === 1) {
		return true;
	}
	else if (refToStyle.selector.components.length) {
		return this.isActualMatch(refToStyle.selector.components, refToStyle.selector.components.length - 1, view);
	}
}

CSSSelectorsMatcherRefiner.prototype.isActualMatch = function(componentsList, index, view) {
	switch(componentsList[index].relation) {
		case CSSSelector.prototype.relationConstants.descendant :
			if (view._parentNode && index >= 0 && !this.isActualMatch(componentsList, --index, view._parentNode))
				return false;
			break;
		
		default:
			return true;
	}
	return true;
}

/**
 * 
 * @param String viewUID : The UID stored on the view type we defined in our naiveDOM experiment
 * @param sWrapper refToStyle : The sWrapper instance we retrieved from the masterStyleRegistry (see CSSSelectorsMatcherRefiner.refineMatches)  
 */
CSSSelectorsMatcherRefiner.prototype.appendStyleToComputedStyle = function(viewUID, refToStyle, importedNaiveDOMRegistry) {
	var view = importedNaiveDOMRegistry.getItem(viewUID);
	
	// TODO: improve the case where we don't have yet a computedStyle object (defaulted to null in the ctor)
//	view.computedStyle = view.computedStyle
//		? refToStyle.copyAndMergeWithStyle(view.computedStyle)
//		: refToStyle.copyAndMergeWithStyle(refToStyle);
	
//	console.log(view.computedStyle);
	return true;
}

/**
 * 
 * @param String viewUID : The UID stored on the view type we defined in our naiveDOM experiment
 * @param sWrapper refToStyle : The sWrapper instance we retrieved from the masterStyleRegistry (see CSSSelectorsMatcherRefiner.refineMatches)  
 */
CSSSelectorsMatcherRefiner.prototype.publishToBeComputedStyle = function(viewUID, refToStyle) {
//	console.log(refToStyle);
	TypeManager.pendingStyleRegistry.setItem(viewUID, refToStyle);

	return true;
}












module.exports = CSSSelectorsMatcherRefiner;