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
var CoreTypes = require('src/core/CoreTypes');
var NaiveDOMNode = require('src/_LayoutEngine/NaiveDOMNode');
var CSSSelectorsMatcher = require('src/_LayoutEngine/CSSSelectorsMatcher');
var CSSPropertySetBuffer = require('src/editing/CSSPropertySetBuffer');

var ComputedStyleSolver = require('src/_LayoutEngine/ComputedStyleSolver');

var SplittedAttributes = require('src/editing/SplittedAttributes');
var StylePropertyEnhancer = require('src/editing/StylePropertyEnhancer');
var stylePropertyConverter = new StylePropertyEnhancer();

var BaseLayoutAlgo = require('src/_LayoutEngine/L_baseLayoutAlgo');
var InlineLayoutAlgo = require('src/_LayoutEngine/L_inlineLayoutAlgo');
var BlockLayoutAlgo = require('src/_LayoutEngine/L_blockLayoutAlgo');
var InlineBlockLayoutAlgo = require('src/_LayoutEngine/L_inlineBlockLayoutAlgo');
var FlexLayoutAlgo = require('src/_LayoutEngine/L_flexLayoutAlgo');
var TextLayoutAlgo = require('src/_LayoutEngine/L_textLayoutAlgo');
var NoLayoutAlgo = require('src/_LayoutEngine/L_noLayoutAlgo');


var LayoutTreePrepare = function(naiveDOM, collectedSWrappers, importedMasterStyleRegistry) {
	this.objectType = 'LayoutTreePrepare';
	
	this.masterStyleRegistry = importedMasterStyleRegistry;
//	this.CSSSelectorMatchingResults = CSSSelectorMatchingResults;
	
	this.layoutTree = this.constructLayoutTree(naiveDOM, collectedSWrappers); //, importedMasterStyleRegistry, CSSSelectorMatchingResults);
}
LayoutTreePrepare.prototype = {};
LayoutTreePrepare.prototype.objectType = 'LayoutTreePrepare';

LayoutTreePrepare.prototype.constructLayoutTree = function(naiveDOM, collectedSWrappers) { //, importedMasterStyleRegistry, CSSSelectorMatchingResults) {
	var layoutViewPort = new LayoutRoot(new CoreTypes.DimensionsPair(this.retrieveWindowInitialSize()));
	// FIXME: We retrieve the style of the body tag, but we should retrieve ALL the cascade of styles from "body" to the ACTUAL container
	this.retrieveWindowStyle(layoutViewPort, naiveDOM, collectedSWrappers);
	var layoutRoot = new LayoutNode(naiveDOM.views.memberViews[2], layoutViewPort);
	
//	console.log(naiveDOM.views);
//	console.log('layoutRoot', layoutRoot);
	return new LayoutTreeBuilder(naiveDOM, layoutRoot); //, importedMasterStyleRegistry, CSSSelectorMatchingResults);
}

LayoutTreePrepare.prototype.retrieveWindowInitialSize = function() {
	// FIXME: the width of the body is, for now, the width of the styleSolverDebugView IFrame, not the styleSolverRenderView IFrame
	var rootBoundingRect = document.body.getBoundingClientRect();
	return [rootBoundingRect.width, rootBoundingRect.height];
}

LayoutTreePrepare.prototype.retrieveWindowStyle = function(layoutViewPort, naiveDOM, collectedSWrappers) {

	var styleSolver = new ComputedStyleSolver(naiveDOM, collectedSWrappers);
	styleSolver.CSSSelectorsMatcher.CSSRulesBuffer = styleSolver.CSSRulesBufferManager.CSSRulesBuffer;
	
	// FIXME: we should not have to test the "body" selector against the whole style-rules buffer
	var rulesBufferLength = styleSolver.CSSSelectorsMatcher.CSSRulesBuffer._buffer.byteLength;
	styleSolver.CSSSelectorsMatcher.iterateOnRulesAndMatchSelector(3, 'body', naiveDOM.views.memberViews[2]._UID, 0, rulesBufferLength);
	
	layoutViewPort.setViewportStyle(styleSolver.CSSSelectorsMatcher.matches.results, this.masterStyleRegistry);
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
	var currentLayoutNode = layoutParentNode, childLayoutNode, childDOMNodeAsAView, subChildLayoutNode, textContentKey, textNode;
	
//	console.log('in', currentLayoutNode.nodeName);
	
	sourceDOMNode.children.forEach(function(childDOMNode) {
//		console.log('loop on children');
		var typeIdx = 0, currentViewType = CSSSelectorsMatcher.prototype.viewTypes[typeIdx];
		// when represented as naiveDOM, leaf-components have no children, they only hold views
		while (currentViewType) {
			// childDOMNode.views.masterView is ALWAYS flat
			if (typeIdx === 0) {
				childDOMNodeAsAView = childDOMNode.views.masterView;
//				childLayoutNode = new LayoutNode(childDOMNodeAsAView, layoutParentNode);
				// TODO: optimization : textContent may be passed as an argument to the layoutNode Ctor
				// TODO: optimization : the presence of a textContent may be identified by a less expensive mean
//				console.log(childDOMNodeAsAView.attributes);
				if ((textContentKey = childDOMNodeAsAView.attributes.indexOfObjectByValue('name', 'textContent')) !== false) {
//					console.log(textContent.value);
					textNode = new NaiveDOMNode();
					textNode.attributes.push(new CoreTypes.Pair(
						'textContent',
						childDOMNodeAsAView.attributes[textContentKey].value
					));
					childDOMNodeAsAView.attributes.splice(textContentKey, 1);
					childLayoutNode = new LayoutNode(childDOMNodeAsAView, layoutParentNode);
					new LayoutNode(textNode, childLayoutNode, true);
				}
				else
					childLayoutNode = new LayoutNode(childDOMNodeAsAView, layoutParentNode, true);
//				console.log('masterView', childDOMNodeAsAView.nodeName, childLayoutNode);
			}
			else {
				subChildLayoutNode = undefined;
				childDOMNode.views[currentViewType].forEach(function(subChildDOMNodeAsAView, key) {
//					console.log(
//						'subOrMemberView',
//						subChildDOMNodeAsAView.nodeName,
//						childLayoutNode.nodeName
//					);
//						subChildLayoutNode = new LayoutNode(subChildDOMNodeAsAView, childLayoutNode);
						// TODO: optimization : the presence of a textContent may be identified by a less expensive mean
						if ((textContentKey = subChildDOMNodeAsAView.attributes.indexOfObjectByValue('name', 'textContent')) !== false) {
//							console.log(textContent.value);
							
							// FIXME: there should be as many textNodes as there are words => Fix that in the layout algo ?
							textNode = new NaiveDOMNode();
							textNode.attributes.push(new CoreTypes.Pair(
								'textContent',
								subChildDOMNodeAsAView.attributes[textContentKey].value
							));
							subChildDOMNodeAsAView.attributes.splice(textContentKey, 1);
							subChildLayoutNode = new LinkedLayoutNode(subChildDOMNodeAsAView, childLayoutNode, subChildLayoutNode, key === childDOMNode.views[currentViewType].length - 1 ? true : false);
							new LayoutNode(textNode, subChildLayoutNode);
						}
						else
							subChildLayoutNode = new LinkedLayoutNode(subChildDOMNodeAsAView, childLayoutNode, subChildLayoutNode, key === childDOMNode.views[currentViewType].length - 1 ? true : false);
				}, this);
			}
			typeIdx++;
			currentViewType = CSSSelectorsMatcher.prototype.viewTypes[typeIdx];
		}
		currentLayoutNode = childLayoutNode;
//		console.log('out', currentLayoutNode.nodeName);
		
		this.alternateFlatAndRecursiveBuild(childDOMNode, currentLayoutNode);
		
	}, this);
	return currentLayoutNode;
}

//LayoutTreeBuilder.prototype.retrieveEffectiveStyleRuleFromSelectorMatching = function(DOMNodeUID) {
//	console.log(TypeManager.pendingStyleRegistry);
//}










var LayoutNode = function(sourceDOMNodeAsView, layoutParentNode, isLastChild) {
	this.objectType = 'LayoutNode';
	this._parent = layoutParentNode;
	this.nodeName = sourceDOMNodeAsView.nodeName;

//	console.log(this.nodeName);
	
	// TODO: optimization : textContent may be passed as an argument to the layoutNode Ctor
	var textContent = sourceDOMNodeAsView.attributes.findObjectByValue('name', 'textContent');
	this.textContent = textContent ? textContent.value : '';
	this.isTextNode = this.textContent.length ? true : false;
//	console.log(this.textContent);
	
	this.availableSpace = new CoreTypes.AvailableSpace();
	this.computedStyle = new CSSPropertySetBuffer();
	this.populateInheritedStyle();
	this.populateAllComputedStyle(this.queryStyleUpdate(sourceDOMNodeAsView));
	
	this.dimensions = new CoreTypes.DimensionsPair();
	this.offsets = new CoreTypes.DimensionsPair();
	
	this.isFlexChild = false;
	this.layoutAlgo = this.getLayoutAlgo(this.nodeName);
	

//	console.log(this.nodeName, this._parent.nodeName, this.layoutAlgo.algoName, this.dimensions);
//	console.log(this.nodeName, this._parent.nodeName, this.layoutAlgo.algoName, this.offsets);
//	console.log(this);
//	console.log(this.nodeName, this.layoutAlgo);
}
LayoutNode.prototype = {};
LayoutNode.prototype.objectType = 'LayoutNode';



LayoutNode.prototype.queryStyleUpdate = function(sourceDOMNodeAsView) {
	return this.publishRequestForStyleUpdate(sourceDOMNodeAsView._UID);
}

// TODO: How is the pub/sub mechanism supposed to be designed ?
LayoutNode.prototype.publishRequestForStyleUpdate = function(viewUID) {
	var matchedStyle = TypeManager.pendingStyleRegistry.getItem(viewUID);

	// should delete the registry-item later
//	TypeManager.pendingStyleRegistry.deleteItem(viewUID);
	return matchedStyle ? matchedStyle.attrIFace : new SplittedAttributes({});
}

LayoutNode.prototype.populateInheritedStyle = function() {
//	console.log('inheritedAttributes', this._parent.computedStyle.getPropertyGroupAsObject('inheritedAttributes'));
//	console.log('inheritedAttributes', this.nodeName, this._parent.nodeName, this._parent.computedStyle.getPropertyGroupAsBuffer('inheritedAttributes'));
	this.computedStyle.overridePropertyGroupFromGroupBuffer(
		'inheritedAttributes',
		this._parent.computedStyle.getPropertyGroupAsBuffer('inheritedAttributes')
	);
}

LayoutNode.prototype.populateAllComputedStyle = function(attrIFace) {
	var attrList, propBuffer;
//	console.log('populateAllComputedStyle', this.nodeName, attrIFace);
	
	// TODO: optimize these two for-in loops
	for (var attrGroup in attrIFace) {
//		attrList = attrIFace[attrGroup];
		
		if (attrGroup === 'stdAttributes')
			continue;
		
		this.computedStyle.setPropertyGroupFromGroupBuffer(
			attrGroup,
			attrIFace[attrGroup].CSSPropertySetBuffer.getPropertyGroupAsBuffer(attrGroup)
			);
//		for (var attr in attrList) {
//			if (attr === 'display')
//				console.log(this.nodeName, attr, attrList[attr]);
			// TODO: find a faster way than using that StylePropertyConverter method :
			// 		it uses a new PropertyBuffer each time and is slow for shorthand properties
//			propBuffer = stylePropertyConverter.toCSSPropertyBuffer(attr, attrList[attr]);
			
//			console.log(HRcomputedStyle[attrGroup]);
//			console.log(HRcomputedStyle[attrGroup].CSSPropertySetBuffer.getProp(attr));
//			propBuffer = HRcomputedStyle[attrGroup].CSSPropertySetBuffer.getProp(attr);
//			console.log(propBuffer.bufferedValueToString(), propBuffer);
//			this.computedStyle.setPropFromBuffer(attr, propBuffer);
//		}
	}
//	console.log(this.computedStyle._buffer);
//	console.log(this.computedStyle.bufferedValueToString('padding', 'repr'));
	
//	console.log(this.computedStyle.bufferedValueToNumber('paddingInlineStart'));
//	console.log(this.computedStyle.bufferedValueToNumber('paddingBlockStart'));
//	console.log(this.computedStyle.bufferedValueToNumber('paddingInlineEnd'));
//	console.log(this.computedStyle.bufferedValueToNumber('paddingBlockEnd'));
}

LayoutNode.prototype.getLayoutAlgo = function(nodeName) {
	var valueOfDisplayProp = this.isTextNode ? '' : this.getDisplayProp(nodeName);
	
	switch (valueOfDisplayProp) {
		case 'inline' : return new InlineLayoutAlgo(this);
		case 'block' : return new BlockLayoutAlgo(this);
		case 'inline-block' : return new InlineBlockLayoutAlgo(this);
		case 'flex' : return new FlexLayoutAlgo(this);
		case 'none' : return new NoLayoutAlgo(this);
		default : return this.isTextNode ? new TextLayoutAlgo(this, this.textContent) : new InlineLayoutAlgo(this);
	}
}

LayoutNode.prototype.getDisplayProp = function(nodeName) {
	var valueOfDisplayProp = this.computedStyle.getPropAsString('display');
//	console.log(valueOfDisplayProp);

	if (!valueOfDisplayProp.length)
		console.warn('LayoutNode ' + this.nodeName + ' : valueOfDisplayProp has a zero length. Seems the CSS initialValue hasn\'t been taken in account');
	
	if (valueOfDisplayProp === 'inline') {
//		console.log(this._parent.layoutAlgo.algoName);
		if (this._parent.layoutAlgo.algoName === 'flex') {
			this.isFlexChild = true;
			return 'inline-block';
		}
		else 		// inline is the initialValue: style may not be explicitly defined -> apply here sort of a user-agent stylesheet for now
			return this.defaultToBrowserDefinedDisplayProp(nodeName);
	}
	else
		return valueOfDisplayProp;
}

LayoutNode.prototype.defaultToBrowserDefinedDisplayProp = function(nodeName) {	// we think of browser-defined default display value as defined in https://www.w3schools.com/css/css_display_visibility.asp & https://stackoverflow.com/questions/13548225/what-is-htmls-a-a-tag-default-display-type
	
	switch (nodeName) {
		case 'body' :
		case 'div' : 
		case 'h1' : 
		case 'h2' : 
		case 'h3' : 
		case 'h4' : 
		case 'h5' : 
		case 'h6' : 
		case 'p' : 
		case 'ul' : 
		case 'ol' : 
		case 'hr' : 
		case 'form' :
		case 'table' :  
		case 'header' : 
		case 'footer' : 
		case 'section' : return 'block';
		case 'span' :
		case 'a' : 
		case 'label' :
		case 'input' :
		case 'img' : return 'inline';
		default : return 'inline';
	}
}









var LinkedLayoutNode = function(sourceDOMNodeAsView, layoutParentNode, previousSiblingLayoutNode, isLastChild) {
//	console.log('previousSiblingLayoutNode', previousSiblingLayoutNode);
	this.isLastChild = isLastChild;
	this.previousSibling = previousSiblingLayoutNode;
	LayoutNode.call(this, sourceDOMNodeAsView, layoutParentNode);
}
LinkedLayoutNode.prototype = Object.create(LayoutNode.prototype);
LinkedLayoutNode.prototype.objectType = 'LinkedLayoutNode';

LinkedLayoutNode.prototype.getRootOfLinkedChildren = function() {
	if (!this.previousSibling)
		return this.previousSibling;
	else
		return this.previousSibling.getRootOfLinkedChildren();
}

LinkedLayoutNode.prototype.climbChildrenLinkedListAndCallbackLayoutAlgo = function(children, callbackName) {
//	console.log('called climbChildrenLinkedListAndCallback', this.previousSibling);
//	console.log(callbackName);
	var children = children || [];
	if (this.previousSibling) {
		children.splice(0, 0, this.previousSibling);
		this.previousSibling.climbChildrenLinkedListAndCallbackLayoutAlgo(children, callbackName);
	}
	else {
		children.forEach(function(siblingNode) {
			siblingNode.layoutAlgo[callbackName](siblingNode.dimensions);
//			console.log('siblingNode computed dimensions', siblingNode.nodeName, siblingNode.dimensions);
//			console.log('siblingNode computed dimensions', siblingNode.nodeName, siblingNode.offsets);
		}, this);
	}
}













var LayoutRoot = function(dimensionsPair) {
	this.objectType = 'LayoutRoot';
	this.nodeName = 'viewport';
	
	this.availableSpace = new CoreTypes.AvailableSpace();
	this.computedStyle = new CSSPropertySetBuffer();
	this.dimensions = dimensionsPair || new CoreTypes.DimensionsPair();
	this.offsets = new CoreTypes.DimensionsPair();
	this.layoutAlgo = new BaseLayoutAlgo(this);
}
LayoutRoot.prototype = Object.create(LayoutNode.prototype);
LayoutRoot.prototype.objectType = 'LayoutRoot';

LayoutRoot.prototype.setViewportStyle = function(selectorMatches, masterStyleRegistry) {
//	console.log('call to populateAllComputedStyle', this.nodeName);
	selectorMatches.forEach(function(result, key) {
//		console.log(masterStyleRegistry.getItem(result[1]).attrIFace.stdAttributesList);
		this.populateAllComputedStyle(masterStyleRegistry.getItem(result[1]).attrIFace);
	}, this);
}












//var DimensionsPair = function(initialValues) {
//	this.objectType = 'DimensionsPair';
//	this.inline = initialValues ? initialValues[0] : 0;
//	this.block = initialValues ? initialValues[1] : 0;
//}
//DimensionsPair.prototype = {};
//DimensionsPair.prototype.objectType = 'DimensionsPair';
//
//DimensionsPair.prototype.set = function(valuesPair) {
//	this.inline = valuesPair[0];
//	this.block = valuesPair[1];
//}
//DimensionsPair.prototype.add = function(valuesPair) {
//	this.inline += valuesPair[0];
//	this.block += valuesPair[1];
//}
//DimensionsPair.prototype.substract = function(valuesPair) {
//	this.inline -= valuesPair[0];
//	this.block -= valuesPair[1];
//}
////dimensionsPair.prototype.getInlineValue = function() {
////	return this.inline;
////}
////dimensionsPair.prototype.getBlockValue = function() {
////	return this.block;
////}
////dimensionsPair.prototype.setInlineValue = function(inline) {
////	this.inline = inline;
////}
////dimensionsPair.prototype.setBlockValue = function(block) {
////	this.block = block;
////}
//
//
//
//var AvailableSpace = function(initialValues) {
//	DimensionsPair.call(this, initialValues);
//	this.objectType = 'AvailableSpace';
//	this.childCount = 0;
//	this.inlineOffset = initialValues ? initialValues[2] : 0;
//	this.blockOffset = initialValues ? initialValues[3] : 0;
//}
//AvailableSpace.prototype = Object.create(DimensionsPair.prototype);
//AvailableSpace.prototype.objectType = 'AvailableSpace';










module.exports = LayoutTreePrepare;