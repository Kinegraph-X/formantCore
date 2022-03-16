/**
 * @constructor LayoutTreePrepare
 * 
 * In an initial design, we'll approach the creation of the LayoutTree
 * in a dedicated class. We're guessing that the constraints implied  
 * at global level for this phase are:
 * 1) We can't identify earlier any "non-drawable" layout nodes we shall need
 * 2) We're seeing the layout node being strongly encapsulated as a requirement,
 * 		i.e. not being referenced on any object created at an earlier stage
 * 		(this is runtime-optimization related)   
 */

var TypeManager = require('src/core/TypeManager');
var CSSSelectorsMatcher = require('src/_LayoutEngine/CSSSelectorsMatcher');
var CSSPropertySetBuffer = require('src/editing/CSSPropertySetBuffer');



var LayoutTreePrepare = function(naiveDOM, importedMasterStyleRegistry, CSSSelectorMatchingResults) {
	this.objectType = 'LayoutTreePrepare';
	
//	this.importedMasterStyleRegistry = importedMasterStyleRegistry;
//	this.CSSSelectorMatchingResults = CSSSelectorMatchingResults;
	
	this.layoutTree = this.constructLayoutTree(naiveDOM); //, importedMasterStyleRegistry, CSSSelectorMatchingResults);
}
LayoutTreePrepare.prototype = {};
LayoutTreePrepare.prototype.objectType = 'LayoutTreePrepare';

LayoutTreePrepare.prototype.constructLayoutTree = function(naiveDOM) { //, importedMasterStyleRegistry, CSSSelectorMatchingResults) {
	var layoutRoot = new LayoutNode(naiveDOM.views[2]);
//	console.log('layoutRoot', layoutRoot);
	return new LayoutTreeBuilder(naiveDOM, layoutRoot); //, importedMasterStyleRegistry, CSSSelectorMatchingResults);
}







var LayoutTreeBuilder = function(sourceDOMNode, layoutRoot) { //, importedMasterStyleRegistry, CSSSelectorMatchingResults) {
	this.objectType = 'LayoutTreeBuilder';
	
//	this.importedMasterStyleRegistry = importedMasterStyleRegistry;
//	this.CSSSelectorMatchingResults = CSSSelectorMatchingResults;

	this.alternateFlatAndRecursiveBuild(sourceDOMNode, layoutRoot);
}
LayoutTreeBuilder.prototype = {};
LayoutTreeBuilder.prototype.objectType = 'LayoutTreeBuilder';

LayoutTreeBuilder.prototype.alternateFlatAndRecursiveBuild = function(sourceDOMNode, layoutParentNode) {
	var currentLayoutNode = layoutParentNode, childLayoutNode, childDOMNodeAsAView;
	sourceDOMNode.children.forEach(function(childDOMNode) {
		var typeIdx = 0, currentViewType = CSSSelectorsMatcher.prototype.viewTypes[typeIdx];
		// when represented as naiveDOM, leaf-components have no children, they only hold views
		while (currentViewType) {
			// childDOMNode.views.masterView is ALWAYS flat
			if (typeIdx === 0) {
				childDOMNodeAsAView = childDOMNode.views.masterView;
				this.retrieveEffectiveStyleRuleFromSelectorMatching(childDOMNodeAsAView._UID);
				childLayoutNode = new LayoutNode(childDOMNodeAsAView, currentLayoutNode);
//				console.log('masterView', childDOMNodeAsAView.nodeName, childLayoutNode);
			}
			else {
				childDOMNode.views[currentViewType].forEach(function(subChildDOMNodeAsAView) {
//					console.log(
//						'subOrMemberView',
//						subChildDOMNodeAsAView.nodeName, 
						new LayoutNode(subChildDOMNodeAsAView, childLayoutNode)
//					);
				}, this);
			}
			typeIdx++;
			currentViewType = CSSSelectorsMatcher.prototype.viewTypes[typeIdx];
		}
		currentLayoutNode = childLayoutNode;
		
		this.alternateFlatAndRecursiveBuild(childDOMNode, currentLayoutNode);
		
	}, this);
	return currentLayoutNode;
}

LayoutTreeBuilder.prototype.retrieveEffectiveStyleRuleFromSelectorMatching = function(DOMNodeUID) {
	console.log(TypeManager.pendingStyleRegistry);
}










var LayoutNode = function(sourceDOMNodeAsView, layoutParentNode) {
	this.objectType = 'LayoutNode';
	this._parent = layoutParentNode;
	
//	console.log(sourceDOMNodeAsView);
//	return;
	
	this.computedStyle = new CSSPropertySetBuffer();
//	console.log(this.computedStyle);
//	this.computedStyle.merge(this.queryStyleUpdate(sourceDOMNodeAsView));
	
	this.dimensions = {
		inline : 0,
		block : 0
	};
	
	this.offsets = {
		inline : 0,
		block : 0
	}
	
//	var availableSpace = this.getAvailableSpace();
	
}
LayoutNode.prototype = {};
LayoutNode.prototype.objectType = 'LayoutNode';

LayoutNode.prototype.queryStyleUpdate = function(node) {
	if  (node.objectType === 'ComponentView')
		return this.publishRequestForStyleUpdate(node);
	
	
	
	return styleUpdate; 
}

// TODO: How is the pub/sub mechanism supposed to be designed ?
LayoutNode.prototype.publishRequestForStyleUpdate = function(viewUID) {
	var matchedStyle = TypeManager.pendingStyleRegistry.getItem(viewUID);
//	TypeManager.pendingStyleRegistry.deleteItem(viewUID);
	
//	console.log(matchedStyle);
	
	return matchedStyle;
}

LayoutNode.prototype.getAvailableSpace = function() {
	
}














module.exports = LayoutTreePrepare;