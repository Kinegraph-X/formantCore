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

var SplittedAttributes = require('src/editing/SplittedAttributes');
var StylePropertyEnhancer = require('src/editing/StylePropertyEnhancer');
var stylePropertyConverter = new StylePropertyEnhancer();

var InlineLayoutAlgo = require('src/_LayoutEngine/L_inlineLayoutAlgo');
var BlockLayoutAlgo = require('src/_LayoutEngine/L_blockLayoutAlgo');
var FlexLayoutAlgo = require('src/_LayoutEngine/L_flexLayoutAlgo');


var LayoutTreePrepare = function(naiveDOM, importedMasterStyleRegistry, CSSSelectorMatchingResults) {
	this.objectType = 'LayoutTreePrepare';
	
//	this.importedMasterStyleRegistry = importedMasterStyleRegistry;
//	this.CSSSelectorMatchingResults = CSSSelectorMatchingResults;
	
	this.layoutTree = this.constructLayoutTree(naiveDOM); //, importedMasterStyleRegistry, CSSSelectorMatchingResults);
}
LayoutTreePrepare.prototype = {};
LayoutTreePrepare.prototype.objectType = 'LayoutTreePrepare';

LayoutTreePrepare.prototype.constructLayoutTree = function(naiveDOM) { //, importedMasterStyleRegistry, CSSSelectorMatchingResults) {
	var layoutRoot = new LayoutNode(naiveDOM.views.masterView);
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

//LayoutTreeBuilder.prototype.retrieveEffectiveStyleRuleFromSelectorMatching = function(DOMNodeUID) {
//	console.log(TypeManager.pendingStyleRegistry);
//}










var LayoutNode = function(sourceDOMNodeAsView, layoutParentNode) {
	this.objectType = 'LayoutNode';
	this._parent = layoutParentNode;
	
	this.computedStyle = new CSSPropertySetBuffer();
	this.populateComputedStyle(this.queryStyleUpdate(sourceDOMNodeAsView));
	
	this.dimensions = {
		inline : 0,
		block : 0
	};
	
	this.offsets = {
		inline : 0,
		block : 0
	}
	
	this.layoutAlgo = this.getLayoutAlgo()
	var availableSpace = this.getAvailableSpace();
	
//	console.log(this.layoutAlgo);
}
LayoutNode.prototype = {};
LayoutNode.prototype.objectType = 'LayoutNode';

LayoutNode.prototype.queryStyleUpdate = function(sourceDOMNodeAsView) {
	return this.publishRequestForStyleUpdate(sourceDOMNodeAsView._UID);
}

// TODO: How is the pub/sub mechanism supposed to be designed ?
LayoutNode.prototype.publishRequestForStyleUpdate = function(viewUID) {
	var matchedStyle = TypeManager.pendingStyleRegistry.getItem(viewUID);

	// should delete later
//	TypeManager.pendingStyleRegistry.deleteItem(viewUID);
	return matchedStyle ? matchedStyle.attrIFace : new SplittedAttributes({});
}

LayoutNode.prototype.populateComputedStyle = function(HRcomputedStyle) {
	var propBuffer, attrList = HRcomputedStyle['locallyEffectiveAttributesList'];

	for (var attr in attrList) {
		propBuffer = stylePropertyConverter.toCSSPropertyBuffer(attr, attrList[attr]);
		this.computedStyle.setProp(attr, propBuffer);
	}
}

LayoutNode.prototype.getLayoutAlgo = function() {
	var valueOfDisplayProp = this.computedStyle.bufferedValueToString('display', 'repr');

	switch (valueOfDisplayProp) {
		case 'inline' : return new InlineLayoutAlgo();
		case 'block' : return new BlockLayoutAlgo();
		case 'flex' : return new FlexLayoutAlgo();
		default : return new InlineLayoutAlgo();
	}
}

LayoutNode.prototype.getAvailableSpace = function() {
	
}














module.exports = LayoutTreePrepare;