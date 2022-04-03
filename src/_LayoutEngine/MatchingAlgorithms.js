/*
 * construct. MatchingAlgorithms
 */

var CSSSelectorsList = require('src/editing/CSSSelectorsList');





var MatchingAlgorithms = function() {
	
}
MatchingAlgorithms.prototype = {};
MatchingAlgorithms.prototype.objectType = 'MatchingAlgorithmsBaseClass';
MatchingAlgorithms.prototype.DHLstr = CSSSelectorsList.prototype.DHLstr;
MatchingAlgorithms.prototype.localDebugLog = CSSSelectorsList.prototype.localDebugLog;

MatchingAlgorithms.prototype.matchOnTypeAndValue = function(view, type, value, DHL) {
	var result = false;
//	console.log('matchOnTypeAndValue', view.nodeName, view.classNames, type, value);
	switch(type) {
		case CSSSelectorsList.prototype.typeConstants.universalType :
			result = true;
			this.localDebugLog(this.DHLstr(DHL) + 'MATCH:', view.nodeName, 'MATCHED ON', 'universal');
			break;
		case CSSSelectorsList.prototype.typeConstants.idType :
			result = view.nodeId === value;
			if (result)
				this.localDebugLog(this.DHLstr(DHL) + 'MATCH:', view.nodeID, 'MATCHED ON', value);
			else
				this.localDebugLog(this.DHLstr(DHL) + 'MATCH:', view.nodeID, 'DIDN\'T MATCH ON', value);
			break;
		case CSSSelectorsList.prototype.typeConstants.classType :
			var loggedValue = value
			// TODO: if a component is compound, call this function as much time as it has component parts
			// 		=> before any comparison, branch in an earlier function on the different parts
			if (!view.classNames.length) {
				loggedValue = Array.isArray(value) ? value.join(', ') : value;
				result = false;
			}
			else {
				var resultNbr = 0;
				var viewClassesAsArray = view.classNames.sort();
				// Selector is Compound
				if (Array.isArray(value)) {
					var componentClassesAsArray = value.sort(),
						cIndex = 0;
						loggedValue = componentClassesAsArray.join(', ');
					viewClassesAsArray.forEach(function(viewClass) {
						// if the selected class matches on a component's classPart, test the next part on the next class of the view
						if ((result = viewClass === componentClassesAsArray[cIndex])) {
							resultNbr++;
							cIndex++;
						}
						// else if the selected class doesn't match, try the next class defined for that view before incrementing the counter
						else if (cIndex !== componentClassesAsArray.length - 1)
							return;
					}, this);
					if (resultNbr === value.length)
						result = true;
				}
				// Selector is Single
				else
					result = viewClassesAsArray.indexOf(value) !== -1;
			}
			if (result)
				this.localDebugLog(this.DHLstr(DHL) + 'MATCH:', view.classNames.join(', '), 'MATCHED ON', loggedValue);
			else
				this.localDebugLog(this.DHLstr(DHL) + 'MATCH:', view.classNames.join(', '), 'DIDN\'T MATCH ON', loggedValue);
			break;
		case CSSSelectorsList.prototype.typeConstants.tagType :
			result = view.nodeName === value;
			if (result)
				this.localDebugLog(this.DHLstr(DHL) + 'MATCH:', view.nodeName, 'MATCHED ON', value);
			else
				this.localDebugLog(this.DHLstr(DHL) + 'MATCH:', view.nodeName, 'DIDN\'T MATCH ON', value);
			break;
		case CSSSelectorsList.prototype.typeConstants.hostType :
			// FIXME: this is NOT the right way to identify a host node:
			// 		=> a host in a component may be non-shadowed, and then the :host keyword
			// 			would refer to one of the ascending DOM nodes 
			result = !view._parentNode;
			if (result)
				this.localDebugLog(this.DHLstr(DHL) + 'MATCH:', 'isHost (?)', 'MATCHED ON', value);
			else
				this.localDebugLog(this.DHLstr(DHL) + 'MATCH:', 'isHost (?)', 'DIDN\'T MATCH ON', value);
			break;
		default:
			console.warn(this.DHLstr(DHL) + 'MATCH:', view.nodeName, 'DIDN\'T MATCH : selector couldn\'t be identified');
			return false;
	}
	return result;
}

MatchingAlgorithms.prototype.isMatch = function(view, componentsList, index, DHL) {
	if (componentsList[index].isCompound) {
		var hasMatched = true;
		DHL++;
		if (componentsList[index].compoundValues.tagPart.length && componentsList[index].compoundValues.tagPart === ':host') {
			this.localDebugLog(this.DHLstr(DHL) + 'CASE:', 'selector is compound', '| Value of tag is', ':host');
			hasMatched = hasMatched && this.matchOnTypeAndValue(view, CSSSelectorsList.prototype.typeConstants.hostType, componentsList[index].compoundValues.tagPart, DHL);
		}
		else if (componentsList[index].compoundValues.tagPart.length) {
			this.localDebugLog(this.DHLstr(DHL) + 'CASE:', 'selector is compound', '| Value of tag is', componentsList[index].compoundValues.tagPart.toString());
			hasMatched = hasMatched && this.matchOnTypeAndValue(view, CSSSelectorsList.prototype.typeConstants.tagType, componentsList[index].compoundValues.tagPart, DHL);
		}
		if (componentsList[index].compoundValues.idPart.length) {
			this.localDebugLog(this.DHLstr(DHL) + 'CASE:', 'selector is compound', '| Value of id is', componentsList[index].compoundValues.idPart.toString());
			hasMatched = hasMatched && this.matchOnTypeAndValue(view, CSSSelectorsList.prototype.typeConstants.idType, componentsList[index].compoundValues.idPart, DHL);
		}
		if (componentsList[index].compoundValues.classPart.length) {
			this.localDebugLog(this.DHLstr(DHL) + 'CASE:', 'selector is compound', '| Value of classes are', componentsList[index].compoundValues.classPart.toString());
			hasMatched = hasMatched && this.matchOnTypeAndValue(view, CSSSelectorsList.prototype.typeConstants.classType, componentsList[index].compoundValues.classPart, DHL);
		}
	}
	else
		hasMatched = this.matchOnTypeAndValue(view, componentsList[index].type, componentsList[index].value, DHL)
		
	return hasMatched;
}

MatchingAlgorithms.prototype.branchOnRelation = function(view, componentsList, index, DHL) {
	var matchingAlgo, secondaryMatchingAlgo, result;

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
	
	if (componentsList[index].hasPseudoClassFlag) {
		this.localDebugLog(this.DHLstr(++DHL) + 'CASE: Has a pseudo-class. Pseudo-class is', Object.keys(CSSSelectorsList.prototype.pseudoClassConstants)[componentsList[index].pseudoClassType]);
//		console.log('componentsList[index].hasPseudoClassFlag', componentsList[index]);
		switch (componentsList[index].pseudoClassType) {
			case CSSSelectorsList.prototype.pseudoClassConstants.firstChild:
				secondaryMatchingAlgo = new MatchOnIsFirstChild();
				break;
			case CSSSelectorsList.prototype.pseudoClassConstants.lastChild:
				secondaryMatchingAlgo = new MatchOnIsLastChild();
				break;
			case CSSSelectorsList.prototype.pseudoClassConstants.nthChildOdd:
				secondaryMatchingAlgo = new MatchOnIsNthChildOdd();
				break;
			case CSSSelectorsList.prototype.pseudoClassConstants.nthChildEven:
				secondaryMatchingAlgo = new MatchOnIsNthChildEven();
				break;
			case CSSSelectorsList.prototype.pseudoClassConstants.nthChildANpB:
				secondaryMatchingAlgo = new MatchOnIsNthChildANpB();
				break;
			default:
				console.warn('MatchingAlgorithms: branchOnPseudoClass : No corresponding matcher found.', 'Type is ', Object.keys(CSSSelectorsList.prototype.pseudoClassConstants)[componentsList[index].pseudoClassType])
				return false;
		}
	}
	
	if (matchingAlgo) {
		DHL++;
		this.localDebugLog(this.DHLstr(DHL) + 'FOUND A matching algorithm', matchingAlgo.objectType);
		if ((result = matchingAlgo.matchOnComponent(view, componentsList, index, DHL)) && secondaryMatchingAlgo) {
			this.localDebugLog(this.DHLstr(DHL) + 'FOUND A matching secondary algorithm', secondaryMatchingAlgo.objectType);
			return result && secondaryMatchingAlgo.matchOnComponent(view, componentsList, index, DHL);
		}
		else
			return result
	}
	else
		return this.isMatch(view, componentsList, index, DHL);
}

MatchingAlgorithms.prototype.climbUpNaiveDOMTree = function(view, DHL) {
	this.localDebugLog(this.DHLstr(DHL) + 'CLIMB UP NaiveDOMTree:', view._parentView.nodeName);
	return view._parentView;
}

MatchingAlgorithms.prototype.climbUpViewsWrapperTree = function(view, DHL) {
	if (!view._viewWrapper._parentNode)
		return;
	
	if (view._viewWrapper._parentNode.views.memberViews.length) {
		this.localDebugLog(this.DHLstr(DHL) + 'CLIMB UP ViewsWrapperTree', 'memberViews', view._viewWrapper._parentNode.views.memberViews[view._viewWrapper._parentNode.views.memberViews.length - 1].nodeName);
		return view._viewWrapper._parentNode.views.memberViews[view._viewWrapper._parentNode.views.memberViews.length - 1];
	}
	else if (view._viewWrapper._parentNode.views.subSections.length) {
		this.localDebugLog(this.DHLstr(DHL) + 'CLIMB UP ViewsWrapperTree', 'subSections', view._viewWrapper._parentNode.views.subSections[view._viewWrapper._parentNode.views.subSections.length - 1].nodeName);
		return view._viewWrapper._parentNode.views.subSections[view._viewWrapper._parentNode.views.subSections.length - 1];
	}
	else if (view._viewWrapper._parentNode.views.masterView) {
		this.localDebugLog(this.DHLstr(DHL) + 'CLIMB UP ViewsWrapperTree', 'masterView', view._viewWrapper._parentNode.views.masterView.nodeName);
		return view._viewWrapper._parentNode.views.masterView;
	}
}

MatchingAlgorithms.prototype.getNextAscendingNode = function(view, DHL) {
//	this.localDebugLog(this.DHLstr(DHL) + 'SHALL CLIMB UP', view);
	if (view._parentView)
		return this.climbUpNaiveDOMTree(view, DHL);
	else if (view._viewWrapper)
		return this.climbUpViewsWrapperTree(view, DHL);
}

MatchingAlgorithms.prototype.getNextSibblingNode = function(view, DHL) {
//	if (view._parentNode)
//		return this.climbUpNaiveDOMTree(view, DHL);
//	else if (view._viewWrapper)
//		return this.climbUpViewsWrapperTree(view, DHL);
}

MatchingAlgorithms.prototype.getDescendingNodes = function(view, DHL) {
	var childViews = [];
	// case of a masterView : return the subSections, or the memberViews
	if (!view._parentView) {
		if (view._viewWrapper.views.subSections.length)
			childViews = view._viewWrapper.views.subSections;
		else if (view._viewWrapper.views.memberViews.length)
			childViews = view._viewWrapper.views.memberViews;
		else if (view._viewWrapper.children.length)
			childViews = [view._viewWrapper.children[0].views.masterView];
	}
	// case of a subSection or a member view
	else {
		var isSubSection = false;
		view._viewWrapper.views.subSections.forEach(function(subSection) {
			if (view === subSection)
				isSubSection = true;
		}, this);
		// if isSubSection: populate childViews only with the memberViews referencing that subSection as parent 
		if (isSubSection) {
			view._viewWrapper.views.memberViews.forEach(function(memberView) {
				if (view === memberView._parentView)
					childViews.push(memberView);
			}, this);
		}
		// if isMemberView, it has no childView
	}
	return childViews
}


















var MatchOnDescendant = function() {
		
}
MatchOnDescendant.prototype = Object.create(MatchingAlgorithms.prototype);
MatchOnDescendant.prototype.objectType = 'MatchOnDescendantMatchingAlgo';

MatchOnDescendant.prototype.matchOnComponent = function(view, componentsList, index, DHL) {
	this.localDebugLog(this.DHLstr(DHL) + 'CASE: Match on component:', '| nodeName is', view.nodeName, '| index is :', index, '& selector is :', componentsList[index].value);
	
	var nextView;
	DHL++;
	
	if (this.isMatch(view, componentsList, index, DHL) && componentsList[index - 1] && (nextView = this.getNextAscendingNode(view, DHL)))
		return this.branchOnRelation(nextView, componentsList, --index, DHL);
	else if (index !== componentsList.length - 1 && (nextView = this.getNextAscendingNode(view, DHL))) {
		if (!view._parentNode && componentsList[index].selectorProofingPartType === CSSSelectorsList.prototype.constants.hostIsProof)
			return false;
		else
			return this.matchOnComponent(nextView, componentsList, index, DHL);
	}
}

//MatchOnDescendant.prototype.matchOnNextView = function(view, componentsList, index, DHL) {
//	this.localDebugLog(this.DHLstr(DHL) + 'CASE: Match on ascendant view:', view.nodeName);
//	
//	var nextView = this.getNextAscendingNode(view, DHL);
//	
//	if (this.isMatch(view, componentsList, index, DHL) && nextView && componentsList[index - 1])
//		return this.branchOnRelation(nextView, componentsList, --index, ++DHL);
//	else
//		return this.matchOnNextView(view, componentsList, index, ++DHL);
//}






var MatchOnImmediateDescendant = function() {
		
}
MatchOnImmediateDescendant.prototype = Object.create(MatchingAlgorithms.prototype);
MatchOnImmediateDescendant.prototype.objectType = 'MatchOnImmediateDescendantMatchingAlgo';

MatchOnImmediateDescendant.prototype.matchOnComponent = function(view, componentsList, index, DHL) {
	this.localDebugLog(this.DHLstr(DHL) + 'CASE: Match on component:', '| nodeName is', view.nodeName, '| index is :', index, '& selector is :', componentsList[index].value);
	if (this.isMatch(view, componentsList, index, DHL) && componentsList[index - 1])
		return this.branchOnRelation(this.getNextAscendingNode(view, DHL), componentsList, --index, ++DHL);
	else
		return false;
}





var MatchOnImmediateNextSibbling = function() {
		
}
MatchOnImmediateNextSibbling.prototype = Object.create(MatchingAlgorithms.prototype);
MatchOnImmediateNextSibbling.prototype.objectType = 'MatchOnImmediateNextSibblingMatchingAlgo';

MatchOnImmediateNextSibbling.prototype.matchOnComponent = function(view, componentsList, index, DHL) {
	
}





var MatchOnAnyForwardSibbling = function() {
		
}
MatchOnAnyForwardSibbling.prototype = Object.create(MatchingAlgorithms.prototype);
MatchOnAnyForwardSibbling.prototype.objectType = 'MatchOnAnyForwardSibblingMatchingAlgo';

MatchOnAnyForwardSibbling.prototype.matchOnComponent = function(view, componentsList, index, DHL) {
	
}














var MatchOnIsFirstChild = function() {
		
}
MatchOnIsFirstChild.prototype = Object.create(MatchingAlgorithms.prototype);
MatchOnIsFirstChild.prototype.objectType = 'MatchOnIsFirstChildMatchingAlgo';

MatchOnIsFirstChild.prototype.matchOnComponent = function(view, componentsList, index, DHL) {
	this.localDebugLog(this.DHLstr(DHL) + 'CASE: Match on component:', '| nodeName is', view.nodeName, '| selector is : NthChildOdd');
	
	var isFirst = false,
		children = this.getDescendingNodes(this.getNextAscendingNode(view, ++DHL));
	
	children.forEach(function(childView, key) {
		if (childView === view) {
			isFirst = key === 0
		}
	}, this);

	return isFirst;
}



var MatchOnIsLastChild = function() {
		
}
MatchOnIsLastChild.prototype = Object.create(MatchingAlgorithms.prototype);
MatchOnIsLastChild.prototype.objectType = 'MatchOnIsLastChildMatchingAlgo';

MatchOnIsLastChild.prototype.matchOnComponent = function(view, componentsList, index, DHL) {
	this.localDebugLog(this.DHLstr(DHL) + 'CASE: Match on component:', '| nodeName is', view.nodeName, '| selector is : NthChildOdd');
	
	var isLast = false,
		children = this.getDescendingNodes(this.getNextAscendingNode(view, ++DHL));
	
	children.forEach(function(childView, key) {
		if (childView === view) {
			isLast = key === children.length - 1;
		}
	}, this);

	return isOdd;
}



var MatchOnIsNthChildOdd = function() {
		
}
MatchOnIsNthChildOdd.prototype = Object.create(MatchingAlgorithms.prototype);
MatchOnIsNthChildOdd.prototype.objectType = 'MatchOnIsNthChildOddMatchingAlgo';

MatchOnIsNthChildOdd.prototype.matchOnComponent = function(view, componentsList, index, DHL) {
	this.localDebugLog(this.DHLstr(DHL) + 'CASE: Match on component:', '| nodeName is', view.nodeName, '| selector is : NthChildOdd');
	
	var isOdd = false,
		children = this.getDescendingNodes(this.getNextAscendingNode(view, ++DHL));
	
	children.forEach(function(childView, key) {
		if (childView === view) {
			isOdd = key % 2 === 1
		}
	}, this);

	return isOdd;
}



var MatchOnIsNthChildEven = function() {
		
}
MatchOnIsNthChildEven.prototype = Object.create(MatchingAlgorithms.prototype);
MatchOnIsNthChildEven.prototype.objectType = 'MatchOnIsNthChildEvenMatchingAlgo';

MatchOnIsNthChildEven.prototype.matchOnComponent = function(view, componentsList, index, DHL) {
	this.localDebugLog(this.DHLstr(DHL) + 'CASE: Match on component:', '| nodeName is', view.nodeName, '| selector is : NthChildEven');
	
	var isEven = false,
		children = this.getDescendingNodes(this.getNextAscendingNode(view, ++DHL));
	
	children.forEach(function(childView, key) {
		if (childView === view) {
			isEven = key % 2 === 0
		}
	}, this);

	return isEven;
}



var MatchOnIsNthChildANpB = function() {
		
}
MatchOnIsNthChildANpB.prototype = Object.create(MatchingAlgorithms.prototype);
MatchOnIsNthChildANpB.prototype.objectType = 'MatchOnIsNthChildANpBMatchingAlgo';

MatchOnIsNthChildANpB.prototype.matchOnComponent = function(view, componentsList, index, DHL) {
	
}














module.exports = {
	BaseClass : MatchingAlgorithms,
	MatchOnDescendant : MatchOnDescendant,
	MatchOnImmediateDescendant : MatchOnImmediateDescendant,
	MatchOnImmediateNextSibbling : MatchOnImmediateNextSibbling,
	MatchOnAnyForwardSibbling : MatchOnAnyForwardSibbling
};