/**
 * @constructor CSSSelectorsMatcherRefiner
 */

var TypeManager = require('src/core/TypeManager');
var CSSSelectorsList = require('src/editing/CSSSelectorsList');


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
				match,											// match[0] is a node UID
//				TypeManager.masterStyleRegistry.getItem(match[1]),	// match[1] is a selectorBuffer's UID
				importedMasterStyleRegistry.getItem(match[1]),		// importedMasterStyleRegistry is needed when we get the sWrappers from an outer IFrame
				importedNaiveDOMRegistry							// importedNaiveDOMRegistry is needed when we get the naiveDOM from an outer IFrame
			)
				// NOTA : this is obsolete
//				&& this.fillDefaultStyles(
//					match[0],											// match[0] is a node UID
////					TypeManager.masterStyleRegistry.getItem(match[1]),	// match[1] is a selectorBuffer's UID
//					importedMasterStyleRegistry.getItem(match[1]),		// importedMasterStyleRegistry is needed when we get the sWrappers from an outer IFrame
//					importedNaiveDOMRegistry							// importedNaiveDOMRegistry is needed when we get the naiveDOM from an outer IFrame
//				)
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

CSSSelectorsMatcherRefiner.prototype.validateMatch = function(match, refToStyle, importedNaiveDOMRegistry) {
	var viewUID = match[0];
	var view = importedNaiveDOMRegistry.getItem(viewUID);
	
	// Debug Hierarchical Level
	var DHL = 0;
	console.log(DHLstr(DHL) + 'INITIAL CALL');
	
//	var matchOnPseudoClass = this.validateMatchOnPseudoClass(view, refToStyle, importedNaiveDOMRegistry);
//	console.log(matchOnPseudoClass);
	
	if (refToStyle.selectorsList.length === 1 && refToStyle.selectorsList[0].components.length === 1) {
		console.log(DHLstr(++DHL) + 'OPTIMIZATION', view.nodeName, refToStyle.selectorsList[0].components[0].value);
		return true;
	}
	else {
		return this.isActualMatch(refToStyle.selectorsList, view, ++DHL);
	}
}

CSSSelectorsMatcherRefiner.prototype.validateMatchOnPseudoClass = function(view, refToStyle, importedNaiveDOMRegistry) {
	// TODO: rewrite that to support pseudo-classes on any component of the selector
	// 		=> this.isActualMatch() climbs up the componentsList, and should call the actual function each time
//	console.log(view);
	refToStyle.selectorsList.forEach(function(selector) {
		if (selector.rightMostHasPseudoClassFlag) {
			console.log(Object.keys(CSSSelectorsList.prototype.pseudoClassConstants)[selector.rightMostPseudoClassType]);
		}
	}, this);
}

CSSSelectorsMatcherRefiner.prototype.isActualMatch = function(selectorsList, view, DHL) {
	var hasMatched = false;
	selectorsList.forEach(function(selector, key) {
		console.log(DHLstr(DHL) + 'CASE: Various Selectors or Various Components');
		this.getNextAscendingNode(view, ++DHL);
		hasMatched = this.testMatchOnComponents(view, selector.components, selector.components.length - 1, ++DHL);
	}, this);
	return hasMatched;
}

CSSSelectorsMatcherRefiner.prototype.testMatchOnComponents = function(view, componentsList, index) {
	var testType, matchedOnTypeAndValue = false, classesAsArray = [];
//	console.log('testMatchOnComponents', view.nodeName, componentsList[index].value);
	switch(componentsList[index].relation) {
		case CSSSelectorsList.prototype.relationConstants.descendant :
//			matchedOnTypeAndValue = this.matchOnTypeAndValue(view, componentsList, index);
//			console.log('matchedOnTypeAndValue', view.nodeName, matchedOnTypeAndValue);
			// !matchedOnTypeAndValue || 
			if ((view._parentNode && index >= 0 && !this.testMatchOnComponents(componentsList, --index, view._parentNode)))
				return false;
//			break;
//		case CSSSelectorsList.prototype.relationConstants.none :
//			matchedOnTypeAndValue = this.matchOnTypeAndValue(view, componentsList, index);
//			console.log('matchedOnTypeAndValue', view.nodeName, matchedOnTypeAndValue);
//			if (!matchedOnTypeAndValue || (view._parentNode && index >= 0 && !this.testMatchOnComponents(componentsList, --index, view._parentNode)))
//				return false;
//			break;
		// TODO: Is it a good idea to return true on the default case ?
		default:
			return true;
	}
	return true;
}

CSSSelectorsMatcherRefiner.prototype.matchOnTypeAndValue = function(view, componentsList, index) {
	var testType = componentsList[index].type, matchedOnTypeAndValue;
	switch(testType) {
		case CSSSelectorsList.prototype.typeConstants.universalType :
			matchedOnTypeAndValue = true;
			break;
		case CSSSelectorsList.prototype.typeConstants.idType :
			matchedOnTypeAndValue = view.nodeId === componentsList[index].value;
			break;
		case CSSSelectorsList.prototype.typeConstants.classType :
			classesAsArray = view.classNames.match(/\b/g);
			matchedOnTypeAndValue = classesAsArray && classesAsArray.indexOf(componentsList[index].value) !== -1;
			break;
		case CSSSelectorsList.prototype.typeConstants.tagType :
			matchedOnTypeAndValue = view.nodeName === componentsList[index].value;
			break;
		case CSSSelectorsList.prototype.typeConstants.hostType :
			// FIXME: this is NOT the right way to identify a host node:
			// 		=> a host in a component may be non-shadowed, and then the :host keyword
			// 			would refer to one of the ascending DOM nodes 
			matchedOnTypeAndValue = !view._parentNode;
			break;
	}
	return matchedOnTypeAndValue;
}

CSSSelectorsMatcherRefiner.prototype.climbUpNaiveDOMTree = function(view, DHL) {
	console.log(DHLstr(DHL) + 'climbUpNaiveDOMTree', view.nodeName);
	
//	this.matchOnComponent(view, componentsList, index);
	
	if (view._parentNode)
		return view.parentNode;
}

CSSSelectorsMatcherRefiner.prototype.climbUpViewsWrapperTree = function(view, DHL) {
	
	if (!view._viewWrapper._parentNode)
		return;
		
	if (view._viewWrapper._parentNode.views.memberViews.length) {
		console.log(DHLstr(DHL) + 'climbUpViewsWrapperTree', 'memberViews');
		return view._viewWrapper._parentNode.views.memberViews[viewWrapper._parentNode.views.memberViews.length - 1];
	}
	else if (view._viewWrapper._parentNode.views.subSections.length) {
		console.log(DHLstr(DHL) + 'climbUpViewsWrapperTree', 'subSections');
		return view._viewWrapper._parentNode.views.subSections[viewWrapper._parentNode.views.subSections.length - 1];
	}
	else if (view._viewWrapper._parentNode.views.masterView) {
		console.log(DHLstr(DHL) + 'climbUpViewsWrapperTree', 'masterView');
		return view._viewWrapper._parentNode.views.masterView;
	}
}

CSSSelectorsMatcherRefiner.prototype.getNextAscendingNode = function(view, DHL) {
	if (view._parentNode)
		return this.climbUpNaiveDOMTree(view, DHL);
	else if (view._viewWrapper)
		return this.climbUpViewsWrapperTree(view, DHL);
}



CSSSelectorsMatcherRefiner.prototype.matchOnComponent = function(view, componentsList, index) {
//	console.log(view, componentsList, index);
	console.log('matchOnComponent', view.nodeName, this.testMatchOnComponents(view, componentsList, index))
}

/**
 * 
 * @param String viewUID : The UID stored on the view type we defined in our naiveDOM experiment
 * @param sWrapper refToStyle : The sWrapper instance we retrieved from the masterStyleRegistry (see CSSSelectorsMatcherRefiner.refineMatches)  
 */
CSSSelectorsMatcherRefiner.prototype.publishToBeComputedStyle = function(viewUID, refToStyle) {
	TypeManager.pendingStyleRegistry.setItem(viewUID, refToStyle);

	return true;
}


var DHLstr = function(DHL) {
	var ret = '';
//	console.log(DHL);
	if (DHL === 0)
		return ret;
	for (var i = 0, l = DHL; i < l; i++) {
		ret += '	';
	}
//	console.log(ret);
	return ret;
}





















/**
 * 
 * @param String viewUID : The UID stored on the view type we defined in our naiveDOM experiment
 * @param sWrapper refToStyle : The sWrapper instance we retrieved from the masterStyleRegistry (see CSSSelectorsMatcherRefiner.refineMatches)  
 */
CSSSelectorsMatcherRefiner.prototype.appendStyleToComputedStyle = function(viewUID, refToStyle, importedNaiveDOMRegistry) {
	var view = importedNaiveDOMRegistry.getItem(viewUID);
	
	// T_ODO: (this method is no more in use, so "done" and obsolete) improve the case where we don't have yet a computedStyle object (defaulted to null in the ctor)
	view.computedStyle = view.computedStyle
		? refToStyle.copyAndMergeWithStyle(view.computedStyle)
		: refToStyle.copyAndMergeWithStyle(refToStyle);
	
//	console.log(view.computedStyle);
	return true;
}



module.exports = CSSSelectorsMatcherRefiner;