/*
 * construct. MatchingAlgorithms
 */

var CSSSelectorsList = require('src/editing/CSSSelectorsList');





var MatchingAlgorithms = function() {
	
}
MatchingAlgorithms.prototype = {};
MatchingAlgorithms.prototype.objectType = 'MatchingAlgorithmsBaseClass';

MatchingAlgorithms.prototype.matchOnTypeAndValue = function(view, componentsList, index, DHL) {
	
	switch(componentsList[index].type) {
		case CSSSelectorsList.prototype.typeConstants.universalType :
			localDebugLog(DHLstr(DHL) + 'MATCH:', view.nodeName, 'MATCHED ON', 'universal');
			return true;
		case CSSSelectorsList.prototype.typeConstants.idType :
			localDebug(LogDHLstr(DHL) + 'MATCH:', view.nodeID, 'MATCHED ON', componentsList[index].value);
			return view.nodeId === componentsList[index].value;
			break;
		case CSSSelectorsList.prototype.typeConstants.classType :
			localDebugLog(DHLstr(DHL) + 'MATCH:', view.classNames, 'MATCHED ON', componentsList[index].value);
			classesAsArray = view.classNames.match(/\b/g);
			return classesAsArray && classesAsArray.indexOf(componentsList[index].value) !== -1;
		case CSSSelectorsList.prototype.typeConstants.tagType :
			localDebugLog(DHLstr(DHL) + 'MATCH:', view.nodeName, 'MATCHED ON', componentsList[index].value);
			return view.nodeName === componentsList[index].value;
		case CSSSelectorsList.prototype.typeConstants.hostType :
			localDebugLog(DHLstr(DHL) + 'MATCH:', 'isHost (?)', 'MATCHED ON', componentsList[index].value);
			// FIXME: this is NOT the right way to identify a host node:
			// 		=> a host in a component may be non-shadowed, and then the :host keyword
			// 			would refer to one of the ascending DOM nodes 
			return !view._parentNode;
		default:
			return false;
	}
}

MatchingAlgorithms.prototype.branchOnRelation = function(match, view, componentsList, index, DHL) {
	var matchingAlgo;
	
	switch (componentsList[index].relation) {
		case CSSSelectorsList.prototype.relationConstants.none:
			break;
		case CSSSelectorsList.prototype.relationConstants.descendant:
			matchingAlgo = new MatchOnDescendant();
			break;
		case CSSSelectorsList.prototype.relationConstants.immediateDescendant:
			matchingAlgo = new MatchOnImmediateDescendant();
			break;
		case CSSSelectorsList.prototype.relationConstants.anyForwardSibbling:
			matchingAlgo = new MatchOnAnyForwardSibbling();
			break;
		case CSSSelectorsList.prototype.relationConstants.immediateNextSibbling:
			matchingAlgo = new MatchOnImmediateNextSibbling();
			break;
		default:
			console.warn('MatchingAlgorithms: branchOnRelation : No corresponding matcher found.')
			return false;
	}
	if (matchingAlgo)
		return matchingAlgo.matchOnComponent(match, view, componentsList, index, ++DHL);
	else
		return this.matchOnTypeAndValue(view, componentsList, index, DHL);
}

MatchingAlgorithms.prototype.climbUpNaiveDOMTree = function(view, DHL) {
	localDebugLog(DHLstr(DHL) + 'CLIMB UP NaiveDOMTree:', view.nodeName);
	if (view._parentNode)
		return view.parentNode;
}

MatchingAlgorithms.prototype.climbUpViewsWrapperTree = function(view, DHL) {
	if (!view._viewWrapper._parentNode)
		return;
	
	if (view._viewWrapper._parentNode.views.memberViews.length) {
		localDebugLog(DHLstr(DHL) + 'CLIMB UP ViewsWrapperTree', 'memberViews');
		return view._viewWrapper._parentNode.views.memberViews[viewWrapper._parentNode.views.memberViews.length - 1];
	}
	else if (view._viewWrapper._parentNode.views.subSections.length) {
		localDebugLog(DHLstr(DHL) + 'CLIMB UP ViewsWrapperTree', 'subSections');
		return view._viewWrapper._parentNode.views.subSections[viewWrapper._parentNode.views.subSections.length - 1];
	}
	else if (view._viewWrapper._parentNode.views.masterView) {
		localDebugLog(DHLstr(DHL) + 'CLIMB UP ViewsWrapperTree', 'masterView');
		return view._viewWrapper._parentNode.views.masterView;
	}
}

MatchingAlgorithms.prototype.getNextAscendingNode = function(view, DHL) {
	if (view._parentNode)
		return this.climbUpNaiveDOMTree(view, DHL);
	else if (view._viewWrapper)
		return this.climbUpViewsWrapperTree(view, DHL);
}



















var MatchOnDescendant = function() {
		
}
MatchOnDescendant.prototype = Object.create(MatchingAlgorithms.prototype);
MatchOnDescendant.prototype.objectType = 'MatchOnDescendantMatchingAlgo';

MatchOnDescendant.prototype.matchOnComponent = function(match, view, componentsList, index, DHL) {
	localDebugLog(DHLstr(DHL) + 'CASE: Match on descendant component:', view.nodeName);
	if (this.matchOnTypeAndValue(view, componentsList, index, DHL))
		return this.branchOnRelation(match, this.getNextAscendingNode(view, DHL), componentsList, --index, ++DHL);
	else
		return this.matchOnNextView(match, view, componentsList, index, ++DHL);
}

MatchOnDescendant.prototype.matchOnNextView = function(match, view, componentsList, index, DHL) {
	localDebugLog(DHLstr(DHL) + 'CASE: Match on ascendant view:', view.nodeName);
	var nextView = this.getNextAscendingNode(view, DHL);
	if (this.matchOnTypeAndValue(nextView, componentsList, index, DHL))
		return this.branchOnRelation(match, this.getNextAscendingNode(nextView, DHL), componentsList, --index, ++DHL);
	else
		return this.matchOnNextView(match, view, componentsList, index, ++DHL);
}


















var MatchOnImmediateDescendant = function() {
		
}
MatchOnImmediateDescendant.prototype = Object.create(MatchingAlgorithms.prototype);
MatchOnImmediateDescendant.prototype.objectType = 'MatchOnImmediateDescendantMatchingAlgo';

MatchOnImmediateDescendant.prototype.matchOnComponent = function(match, view, componentsList) {
	
}


















var MatchOnImmediateNextSibbling = function() {
		
}
MatchOnImmediateNextSibbling.prototype = Object.create(MatchingAlgorithms.prototype);
MatchOnImmediateNextSibbling.prototype.objectType = 'MatchOnImmediateNextSibblingMatchingAlgo';

MatchOnImmediateNextSibbling.prototype.matchOnComponent = function(match, view, componentsList) {
	
}





















var MatchOnAnyForwardSibbling = function() {
		
}
MatchOnAnyForwardSibbling.prototype = Object.create(MatchingAlgorithms.prototype);
MatchOnAnyForwardSibbling.prototype.objectType = 'MatchOnAnyForwardSibblingMatchingAlgo';

MatchOnAnyForwardSibbling.prototype.matchOnComponent = function(match, view, componentsList) {
	
}




















var DHLstr = function(DHL) {
	var ret = '';
	for (var i = 0, l = DHL; i < l; i++) {
		ret += '	';
	}
	return ret;
}

var localDebugLog = function(str) {
//	console.log(str);
}








module.exports = {
	BaseClass : MatchingAlgorithms,
	MatchOnDescendant : MatchOnDescendant,
	MatchOnImmediateDescendant : MatchOnImmediateDescendant,
	MatchOnImmediateNextSibbling : MatchOnImmediateNextSibbling,
	MatchOnAnyForwardSibbling : MatchOnAnyForwardSibbling
};