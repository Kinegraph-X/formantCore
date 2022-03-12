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



var LayoutTreePrepare = function(naiveDOM, importedMasterStyleRegistry) {
	this.objectType = 'LayoutTreePrepare';
	
	this.importedMasterStyleRegistry = importedMasterStyleRegistry;
	this.layoutTree = this.constructLayoutTree(naiveDOM);
}
LayoutTreePrepare.prototype = {};
LayoutTreePrepare.prototype.objectType = 'LayoutTreePrepare';

LayoutTreePrepare.prototype.constructLayoutTree = function(naiveDOM) {
	var layoutRoot = new LayoutNode(naiveDOM, null);
	this.recursiveBuildLayoutTree(layoutRoot, naiveDOM);
	return layoutRoot;
}

LayoutTreePrepare.prototype.recursiveBuildLayoutTree = function(currentLayoutNode, node) {
	var layoutNode;
	node.children.forEach(function(childNode) {
		layoutNode = new LayoutNode(childNode, currentLayoutNode);
		this.recursiveBuildLayoutTree(layoutNode, childNode);
	}, this);
}

LayoutTreePrepare.prototype.newLayoutNode = function(node) {
	return new LayoutNode(node);
}










var LayoutNode = function(sourceDOMNode, layoutParentNode) {
	this.objectType = 'LayoutNode';
	this._parent = layoutParentNode;
	
	this.computedStyle = new CSSPropertySetBuffer();
	this.computedStyle.merge(this.queryStyleUpdate(sourceDOMNode));
	
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
			
	var view, typeIdx = 0, currentViewType = CSSSelectorsMatcher.prototype.viewTypes[typeIdx], styleUpdate;
	while (currentViewType) {
		// node.views.masterNode is ALWAYS flat
		if (typeIdx === 0) {
			view = node.views[currentViewType];
			styleUpdate = this.publishRequestForStyleUpdate(view._UID);
		}
		else {
			node.views[currentViewType].forEach(function(view) {
				new LayoutNode(view, this);	
			}, this);
		}
		
		typeIdx++;
		currentViewType = CSSSelectorsMatcher.prototype.viewTypes[typeIdx];
	}
	
	return styleUpdate; 
}

LayoutNode.prototype.publishRequestForStyleUpdate = function(viewUID) {
	var matchedStyle = TypeManager.pendingStyleRegistry.getItem(viewUID);
//	TypeManager.pendingStyleRegistry.deleteItem(viewUID);
	
//	console.log(matchedStyle);
	
	return matchedStyle;
}














module.exports = LayoutTreePrepare;