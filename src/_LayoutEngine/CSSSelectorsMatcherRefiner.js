/**
 * @constructor CSSSelectorsMatcherRefiner
 */

var TypeManager = require('src/core/TypeManager');
var CSSSelectorsList = require('src/editing/CSSSelectorsList');
var MatchingAlgorithms = require('src/_LayoutEngine/MatchingAlgorithms');


var CSSSelectorsMatcherRefiner = function() {
	this.objectType = 'CSSSelectorsMatcherRefiner';
//	TypeManager.pendingStyleRegistry.cache = {};
}
CSSSelectorsMatcherRefiner.prototype = {};
CSSSelectorsMatcherRefiner.prototype.objectType = 'CSSSelectorsMatcherRefiner';
CSSSelectorsMatcherRefiner.prototype.DHLstr = CSSSelectorsList.prototype.DHLstr;
CSSSelectorsMatcherRefiner.prototype.localDebugLog = CSSSelectorsList.prototype.localDebugLog;

// HACK: importedNaiveDOMRegistry is needed when we get the naiveDOM from an outer IFrame
CSSSelectorsMatcherRefiner.prototype.refineMatches = function(matchResult, importedNaiveDOMRegistry, importedMasterStyleRegistry, isUAMatcher) {
	return matchResult.results.filter(function(match) {
		this.localDebugLog('INITIAL CALL', match[1], importedMasterStyleRegistry.getItem(match[1]).selectorsList[0].selectorStr);
		return this.fastValidateMatch(
				match,
				importedMasterStyleRegistry.getItem(match[1]),		// importedMasterStyleRegistry is needed when we get the sWrappers from an outer IFrame
				importedNaiveDOMRegistry							// importedNaiveDOMRegistry is needed when we get the naiveDOM from an outer IFrame
			)
				&& this.publishToBeComputedStyle(
					match[0],											// match[0] is a node UID
					importedMasterStyleRegistry.getItem(match[1]),		// importedMasterStyleRegistry is needed when we get the sWrappers from an outer IFrame
					isUAMatcher);
	}, this);
}

CSSSelectorsMatcherRefiner.prototype.fastValidateMatch = function(match, refToStyle, importedNaiveDOMRegistry) {
	var DHL = 1;
	if (refToStyle.selectorsList.length === 1 && refToStyle.selectorsList[0].components.length === 1) {
		var viewUID = match[0];
		var view = importedNaiveDOMRegistry.getItem(viewUID);
		this.localDebugLog(this.DHLstr(DHL) + 'OPTIMIZATION', view.nodeName, refToStyle.selectorsList[0].components[0].value);
		return MatchingAlgorithms.BaseClass.prototype.isMatch(
				view,
				refToStyle.selectorsList[0].components,
				0,
				DHL
			);
	}
	else
		return this.validateMatch(
				match,
				refToStyle,
				importedNaiveDOMRegistry,
				DHL
			)
}

CSSSelectorsMatcherRefiner.prototype.validateMatch = function(match, refToStyle, importedNaiveDOMRegistry, DHL) {
	var DHL = 1;
	
	var viewUID = match[0];
	var view = importedNaiveDOMRegistry.getItem(viewUID);
	
	var hasMatched = false;
	refToStyle.selectorsList.forEach(function(selector, key) {
		this.localDebugLog(this.DHLstr(DHL) + 'CASE: Various Selectors or Various Components');
		hasMatched = hasMatched || this.matchOnComponents(match, view, selector.components, DHL);
		
//		if (selector.components[0].compoundValues
//			&& selector.components[0].compoundValues.classPart.indexOf('keyword') !== -1)
//			console.log('key', hasMatched)
		
	}, this);
	
	
	return hasMatched;
}

// FIXME: seems that for now, the matching algorithm MatchOnDescendant is the same as MatchOnImmediateDescendant
// (we only clim one level up in the DOM hierarchy)
CSSSelectorsMatcherRefiner.prototype.matchOnComponents = function(match, view, componentsList, DHL) {
	var hasMatched = false;
//	console.log(componentsList[0], MatchingAlgorithms.BaseClass.prototype.branchOnRelation(view, componentsList, componentsList.length - 1, DHL));
	if (MatchingAlgorithms.BaseClass.prototype.branchOnRelation(view, componentsList, componentsList.length - 1, DHL))
		hasMatched = true;
	
	return hasMatched;
}

/**
 * 
 * @param {String} viewUID : The UID stored on the view type we defined in our naiveDOM experiment
 * @param {StyleRule} refToStyle : The sWrapper instance we retrieved from the masterStyleRegistry (see CSSSelectorsMatcherRefiner.refineMatches)  
 */
CSSSelectorsMatcherRefiner.prototype.publishToBeComputedStyle = function(viewUID, refToStyle, isUAMatcher) {
	// TODO: should test for the existence of the key, an create/update an array
	var pendingStyles,
		actualStyleRegistry = isUAMatcher ? TypeManager.UApendingStyleRegistry : TypeManager.pendingStyleRegistry;
		
	if ((pendingStyles = actualStyleRegistry.getItem(viewUID)))
		pendingStyles.push(refToStyle);
	else
		actualStyleRegistry.setItem(viewUID, [refToStyle]);
//	console.log('publishToBeComputedStyle key', viewUID, refToStyle);
	return true;
}














module.exports = CSSSelectorsMatcherRefiner;