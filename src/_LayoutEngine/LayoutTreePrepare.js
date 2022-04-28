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
var LayoutTypes = require('src/_LayoutEngine/LayoutTypes');
var UIDGenerator = require('src/core/UIDGenerator').UIDGenerator;
var Style = require('src/editing/Style');

var NaiveDOMNode = require('src/_LayoutEngine/NaiveDOMNode');
var CSSSelectorsMatcher = require('src/_LayoutEngine/CSSSelectorsMatcher');
var CSSPropertyBuffer = require('src/editing/CSSPropertyBuffer');
var CSSPropertySetBuffer = require('src/editing/CSSPropertySetBuffer');
//var CSSPropertyDescriptors = require('src/editing/CSSPropertyDescriptors');

var ComputedStyleSolver = require('src/_LayoutEngine/ComputedStyleSolver');

//var SplittedAttributes = require('src/editing/SplittedAttributes');
var StylePropertyEnhancer = require('src/editing/StylePropertyEnhancer');
//var stylePropertyConverter = new StylePropertyEnhancer();

var LayoutDimensionsBuffer = require('src/_LayoutEngine/LayoutDimensionsBuffer');
var layoutDimensionsBuffer = new LayoutDimensionsBuffer();

var BaseLayoutAlgo = require('src/_LayoutEngine/L_baseLayoutAlgo');
var InlineLayoutAlgo = require('src/_LayoutEngine/L_inlineLayoutAlgo');
var BlockLayoutAlgo = require('src/_LayoutEngine/L_blockLayoutAlgo');
var InlineBlockLayoutAlgo = require('src/_LayoutEngine/L_inlineBlockLayoutAlgo');
var FlexLayoutAlgo = require('src/_LayoutEngine/L_flexLayoutAlgo');
var TextLayoutAlgo = require('src/_LayoutEngine/L_textLayoutAlgo');
var NoLayoutAlgo = require('src/_LayoutEngine/L_noLayoutAlgo');

var CanvasTypes = require('src/core/WebCanvasCoreTypes');


var LayoutTreePrepare = function(naiveDOM, collectedSWrappers, importedMasterStyleRegistry) {
	this.objectType = 'LayoutTreePrepare';
	
	this.masterStyleRegistry = importedMasterStyleRegistry;
	TypeManager.layoutNodesRegistry.cache = {};
	TypeManager.rasterShapesRegistry.cache = {};
	TypeManager.layoutCallbackRegistry.cache = {};
//	console.log('TypeManager.rasterShapesRegistry', TypeManager.rasterShapesRegistry);
	
	this.layoutTree = this.constructLayoutTree(naiveDOM, collectedSWrappers);
}
LayoutTreePrepare.prototype = {};
LayoutTreePrepare.prototype.objectType = 'LayoutTreePrepare';

LayoutTreePrepare.prototype.constructLayoutTree = function(naiveDOM, collectedSWrappers) {
	var layoutViewPort = new LayoutRoot(this.retrieveWindowInitialSize());
	// FIXME: We retrieve the style of the body tag, but we should retrieve ALL the cascade of styles from "body" to the ACTUAL container
	this.retrieveWindowStyle(layoutViewPort, naiveDOM, collectedSWrappers);
	var layoutRoot = new LayoutNode(naiveDOM.views.memberViews[2], layoutViewPort);
	return new LayoutTreeBuilder(naiveDOM, layoutRoot);
}

LayoutTreePrepare.prototype.retrieveWindowInitialSize = function() {
	// FIXME: the width of the body is, for now, the width of the styleSolverDebugView IFrame, not the styleSolverRenderView IFrame
	var rootBoundingRect = document.body.getBoundingClientRect();
	return [parseInt(rootBoundingRect.width), parseInt(rootBoundingRect.height)];
}

LayoutTreePrepare.prototype.retrieveWindowStyle = function(layoutViewPort, naiveDOM, collectedSWrappers) {
	// HACK: the style  solver shall reset the TypeManager.pendingStyleRegistry => cache it;
	var cache = TypeManager.pendingStyleRegistry.cache;
	var styleSolver = new ComputedStyleSolver(naiveDOM, collectedSWrappers);
	styleSolver.CSSSelectorsMatcher.CSSRulesBuffer = styleSolver.CSSRulesBufferManager.CSSRulesBuffer;
	
	// FIXME: we should not have to test the "body" selector against the whole style-rules buffer
	var rulesBufferLength = styleSolver.CSSSelectorsMatcher.CSSRulesBuffer._buffer.byteLength;
	styleSolver.CSSSelectorsMatcher.iterateOnRulesAndMatchSelector(3, 'body', naiveDOM.views.memberViews[2]._UID, 0, rulesBufferLength);
	
	layoutViewPort.setViewportStyle(styleSolver.CSSSelectorsMatcher.matches.results, this.masterStyleRegistry);
	
	TypeManager.pendingStyleRegistry.cache = cache;
}

LayoutTreePrepare.prototype.newFakeLayoutNode = function() {
	return (new LayoutRoot([0, 0]));
}






var LayoutTreeBuilder = function(sourceDOMNode, layoutRoot) {
	this.objectType = 'LayoutTreeBuilder';
	this.alternateFlatAndRecursiveBuild(sourceDOMNode, layoutRoot);
}
LayoutTreeBuilder.prototype = {};
LayoutTreeBuilder.prototype.objectType = 'LayoutTreeBuilder';

LayoutTreeBuilder.prototype.alternateFlatAndRecursiveBuild = function(sourceDOMNode, layoutParentNode) {
	var currentLayoutNode = layoutParentNode, childLayoutNode, childDOMNodeAsAView, subChildLayoutNode, textContentKey, textNode, fakeNode, isLastChild;
	
	sourceDOMNode.children.forEach(function(childDOMNode, childIndex) {
		var typeIdx = 0, currentViewType = CSSSelectorsMatcher.prototype.viewTypes[typeIdx];
		isLastChild = childIndex === sourceDOMNode.children.length - 1 ? true : false;
		
		// when represented as naiveDOM, leaf-components have no children, they only hold views
		while (currentViewType) {
			// childDOMNode.views.masterView is ALWAYS flat
			if (typeIdx === 0) {
				childDOMNodeAsAView = childDOMNode.views.masterView;
				
				// TODO: optimization : textContent may be passed as an argument to the layoutNode Ctor
				// TODO: optimization : the presence of a textContent may be identified by a less expensive mean
				if ((textContentKey = childDOMNodeAsAView.attributes.indexOfObjectByValue('name', 'textContent')) !== false) {
					textNode = new NaiveDOMNode();
					textNode._UID = +Infinity;	// we must NOT match any style (UIDgenerator is out of sync, as UID were generated in another IFrame)
					textNode.nodeName = 'textNode';
					textNode.attributes.push(new CoreTypes.Pair(
						'textContent',
						childDOMNodeAsAView.attributes[textContentKey].value
					));
					childDOMNodeAsAView.attributes.splice(textContentKey, 1);
					childLayoutNode = new LinkedLayoutNode(childDOMNodeAsAView, layoutParentNode, childLayoutNode, false);
					new LayoutNode(textNode, childLayoutNode);
				}
				else {
					childLayoutNode = new LinkedLayoutNode(childDOMNodeAsAView, layoutParentNode, childLayoutNode, false);
				};
			}
			else {
				subChildLayoutNode = undefined;
				childDOMNode.views[currentViewType].forEach(function(subChildDOMNodeAsAView, key) {
					isLastChild = key === childDOMNode.views[currentViewType].length - 1 ? true : false;
					// TODO: optimization : the presence of a textContent may be identified by a less expensive mean
					if ((textContentKey = subChildDOMNodeAsAView.attributes.indexOfObjectByValue('name', 'textContent')) !== false) {
						// FIXME: there should be as many textNodes as there are words => Fix that in the layout algo ?
						textNode = new NaiveDOMNode();
						textNode.attributes.push(new CoreTypes.Pair(
							'textContent',
							subChildDOMNodeAsAView.attributes[textContentKey].value
						));
						subChildDOMNodeAsAView.attributes.splice(textContentKey, 1);
						subChildLayoutNode = new LinkedLayoutNode(subChildDOMNodeAsAView, childLayoutNode, subChildLayoutNode, isLastChild);
						new LayoutNode(textNode, subChildLayoutNode);
					}
					else {
						if (childLayoutNode.layoutAlgo.algoName === LayoutNode.prototype.displayPropsAsConstants.flex && isLastChild) {
							fakeNode = new NaiveDOMNode();
							fakeNode.nodeName = 'fakeNode';
							
							subChildLayoutNode = new LinkedLayoutNode(subChildDOMNodeAsAView, childLayoutNode, subChildLayoutNode, false);
							new FlexEndLayoutNode(fakeNode, childLayoutNode, subChildLayoutNode, isLastChild);
						}
						else
							subChildLayoutNode = new LinkedLayoutNode(subChildDOMNodeAsAView, childLayoutNode, subChildLayoutNode, isLastChild);
					}
				}, this);
			}
			typeIdx++;
			currentViewType = CSSSelectorsMatcher.prototype.viewTypes[typeIdx];
		}
		
		
		currentLayoutNode = childLayoutNode;
		
		this.alternateFlatAndRecursiveBuild(childDOMNode, currentLayoutNode);
		
		if (layoutParentNode.layoutAlgo.algoName === LayoutNode.prototype.displayPropsAsConstants.flex && isLastChild) {
			fakeNode = new NaiveDOMNode();
			fakeNode.nodeName = 'fakeNode';
			new FlexEndLayoutNode(fakeNode, layoutParentNode, childLayoutNode, isLastChild);
		}
		
	}, this);
	return currentLayoutNode;
}











var LayoutNode = function(sourceDOMNodeAsView, layoutParentNode) {
	this._UID = UIDGenerator.newUID();
	TypeManager.layoutNodesRegistry.setItem(this._UID, this);
	
	this._parent = layoutParentNode;
	this.nodeName = sourceDOMNodeAsView.nodeName;
	
	// TODO: optimization : textContent may be passed as an argument to the layoutNode Ctor
	this.inputLength = sourceDOMNodeAsView.attributes.findObjectByValue('name', 'size') || this.defaultInputSize;
	var textContent = sourceDOMNodeAsView.attributes.findObjectByValue('name', 'textContent');
	this.textContent = textContent ? textContent.value : '';
	this.isTextNode = this.textContent.length ? true : false;
	
	this.availableSpace = new LayoutTypes.AvailableSpace();
	this.computedStyle = new CSSPropertySetBuffer();

	this.populateInheritedStyle();
	this.populateAllComputedStyle(this.queryStyleUpdate(sourceDOMNodeAsView));
	
	this.dimensions = new LayoutTypes.BoxDimensions();
	this.cachedDimensions = new LayoutTypes.BoxDimensions();
	this.offsets = new LayoutTypes.BoxOffsets();
	
	this.canvasShape = null;
//	this.canvasShape = this.getCanvasShape();
	
	this.layoutAlgo = this.getLayoutAlgo(this.nodeName);

//	console.log(this.nodeName, this._parent.nodeName, this.layoutAlgo.algoName, this.dimensions);
//	console.log(this.nodeName, this._parent.nodeName, this.layoutAlgo.algoName, this.offsets);
}
LayoutNode.prototype = {};
LayoutNode.prototype.objectType = 'LayoutNode';

LayoutNode.prototype.getCanvasShape = function() {
	var fillColor = this.computedStyle.getTokenTypeForPropAsConstant('backgroundColor') === CSSPropertyBuffer.prototype.TokenTypes.HashToken
		// OPTIMIZATION: parseInt('0x' + )... can be replaced by a hash-prefixed hexa string
		? parseInt('0x' + this.computedStyle.getPropAsString('backgroundColor').slice(1, 7))
		// light-blue shall mean 'transparent' when debugging
		: 0xAACCFF;
	var fillAlpha = this.computedStyle.getTokenTypeForPropAsConstant('backgroundColor') === CSSPropertyBuffer.prototype.TokenTypes.IdentToken
		? 0
		: 1;
	var lineColor = this.computedStyle.getTokenTypeForPropAsConstant('borderBlockStartColor') === CSSPropertyBuffer.prototype.TokenTypes.HashToken
		? parseInt('0x' + this.computedStyle.getPropAsString('borderBlockStartColor').slice(1, 7))
		// light-blue shall mean 'transparent' when debugging
		: 0xAACCFF;
	var borderWidth = this.computedStyle.getPropAsNumber('borderBlockStartWidth');
//	console.error(this.computedStyle.getPropAsNumber('borderBlockStartWidth'));
	
	if (this.nodeName === 'textNode') {
		var canvasShape = new CanvasTypes._text(
			this.textContent,
			new CanvasTypes.TextStyle({
				fontFamily : this.computedStyle.getPropAsString('fontFamily'),
				fontColor : this.computedStyle.getPropAsString('color'),
				fontSize : this.computedStyle.getPropAsString('fontSize'),
				fontWeight : this.computedStyle.getPropAsString('fontWeight'),
				lineHeight : this.computedStyle.getPropAsNumber('lineHeight'), // 	/!\ NUMBER /!\
				textAlign : this.computedStyle.getPropAsString('textAlign')
			}),
			new CanvasTypes.Position({x : this.offsets.inline, y : this.offsets.block})
		);
	}
	else if (this.nodeName === 'input') {
		var canvasShape = new CanvasTypes.InputShape(
			new CanvasTypes.Position({x : this.offsets.inline, y : this.offsets.block}),
			new CanvasTypes.Size({width : this.dimensions.inline, height : this.dimensions.block})
		);
	}
	else {
		var canvasShape = new CanvasTypes.NodeShape(
			new CanvasTypes.Position({x : this.offsets.inline, y : this.offsets.block}),
			new CanvasTypes.Size({width : this.dimensions.borderInline, height : this.dimensions.borderBlock}),
			// FIXME: What to do when we want 4 different borders ?
			new CanvasTypes.LineStyle({lineColor : lineColor, lineWidth : borderWidth}),
			new CanvasTypes.FillStyle({fillColor : fillColor, fillAlpha : fillAlpha}),
			null,
			borderWidth
		);
	}
	TypeManager.rasterShapesRegistry.setItem(UIDGenerator.newUID(), canvasShape);
//	console.log('canvasShape', canvasShape);
	return canvasShape;
}

LayoutNode.prototype.updateCanvasShapeOffsets = function() {
	if (this.nodeName === 'textNode') {
		this.canvasShape.position.x = Math.round(this.offsets.marginInline) + 1;
		this.canvasShape.position.y = Math.round(this.offsets.marginBlock) + 1;
	}
	else {
		this.canvasShape.position.x = Math.round(this.offsets.marginInline) + .5;
		this.canvasShape.position.y = Math.round(this.offsets.marginBlock) + .5;
	}
//	console.log(this.nodeName, 'this.offsets', this.offsets);
//	console.log('this.canvasShape.position', this.canvasShape.position);
	this.canvasShape.reDraw();
//	console.log(this.canvasShape, this.canvasShape.shape._geometry.graphicsData[0]);
}

LayoutNode.prototype.updateCanvasShapeDimensions = function() {
//	console.error('updateCanvasShapeDimensions', this.nodeName, this.dimensions);//, this.canvasShape.shape._geometry && this.canvasShape.shape._geometry.graphicsData[0].shape);
	this.canvasShape.size.width = Math.round(this.dimensions.borderInline);
	this.canvasShape.size.height = Math.round(this.dimensions.borderBlock);
	this.canvasShape.reDraw();
//	console.log(this.canvasShape, this.canvasShape.shape._geometry.graphicsData[0]);
}


LayoutNode.prototype.queryStyleUpdate = function(sourceDOMNodeAsView) {
	return this.publishRequestForStyleUpdate(sourceDOMNodeAsView._UID);
}

// TODO: How is the pub/sub mechanism supposed to be designed ?
LayoutNode.prototype.publishRequestForStyleUpdate = function(viewUID) {
//	console.log(TypeManager.pendingStyleRegistry);

	// TODO: matchedStyle should  be an array
	// => populate the TypeManager.pendingStyleRegistry with an array
	// 		in CSSSelectorsMatcherRefiner.publishToBeComputedStyle
	// => get it back here and iterate in LayoutNode.prototype.populateAllComputedStyle
//	console.log(viewUID, TypeManager.pendingStyleRegistry);
	var matchedStyles = TypeManager.pendingStyleRegistry.getItem(viewUID);
	return matchedStyles ? matchedStyles : [new Style(null, 'dummy', {})];
}

LayoutNode.prototype.populateInheritedStyle = function() {
	this.computedStyle.overridePropertyGroupFromGroupBuffer(
		'inheritedAttributes',
		this._parent.computedStyle.getPropertyGroupAsBuffer('inheritedAttributes')
	);
}

LayoutNode.prototype.populateAllComputedStyle = function(matchedStyles) {
	matchedStyles.sort(this.sortBySpecificity);
	var attrIFace;
	matchedStyles.forEach(function(style) {
		attrIFace = style.attrIFace;
		for (var attrGroup in attrIFace) {
//			console.log(this.nodeName, attrGroup, attrIFace[attrGroup].CSSPropertySetBuffer.getDefinedPropertiesFromGroupAsAttributesList(attrGroup));
			this.computedStyle.overridePropertyGroupFromGroupBuffer(
				attrGroup,
				attrIFace[attrGroup].CSSPropertySetBuffer.getPropertyGroupAsBuffer(attrGroup)
				);
		}
	}, this);
}

LayoutNode.prototype.getLayoutAlgo = function(nodeName) {
	var valueOfDisplayProp = this.isTextNode ? '' : this.getDisplayProp(nodeName);
	
	switch (valueOfDisplayProp) {
		case this.displayPropsAsConstants.inline : return new InlineLayoutAlgo(this, layoutDimensionsBuffer);
		case this.displayPropsAsConstants.block : return new BlockLayoutAlgo(this, layoutDimensionsBuffer);
		case this.displayPropsAsConstants.inlineBlock : return new InlineBlockLayoutAlgo(this, layoutDimensionsBuffer);
		case this.displayPropsAsConstants.flex : return new FlexLayoutAlgo(this, layoutDimensionsBuffer);
		case this.displayPropsAsConstants.none : return new NoLayoutAlgo(this, layoutDimensionsBuffer);
		default : return this.isTextNode ? new TextLayoutAlgo(this, this.textContent, layoutDimensionsBuffer) : new InlineLayoutAlgo(this, layoutDimensionsBuffer);
	}
}

LayoutNode.prototype.getDisplayProp = function(nodeName) {
	var valueOfDisplayProp = this.computedStyle.getPropAsString('display');

	if (!valueOfDisplayProp.length)
		console.warn('LayoutNode ' + this.nodeName + ' : valueOfDisplayProp has a zero length. Seems the CSS initialValue hasn\'t been taken in account', this.computedStyle);
	
//	if (this._parent.layoutAlgo.algoName === this.displayPropsAsConstants.flex
//			&& this._parent.layoutAlgo.flexDirection === this.flexDirectionsAsConstants.row)
//		console.log(this.nodeName, this._parent.nodeName, this._parent.layoutAlgo.flexDirection);
	
	if (valueOfDisplayProp === this.displayPropsAsConstants.inline) {
//		|| (valueOfDisplayProp === this.displayPropsAsConstants.flex && this._parent.layoutAlgo.algoName === this.displayPropsAsConstants.flex)) {
//		console.log(this.nodeName, 'valueOfDisplayProp', valueOfDisplayProp, this._parent.nodeName, this._parent.layoutAlgo.algoName);
		if (this._parent.layoutAlgo.algoName === this.displayPropsAsConstants.flex)
//			|| this._parent.layoutAlgo.algoName === this.displayPropsAsConstants.inlineBlock)
			return this.displayPropsAsConstants.inlineBlock;
		else
		 	// inline is the initialValue: style may not be explicitly defined -> apply here sort of a user-agent stylesheet for now
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

LayoutNode.prototype.displayPropsAsConstants = {
	inline : 'inline',
	block : 'block',
	inlineBlock : 'inline-block',
	flex : 'flex',
	none : 'none'
}
LayoutNode.prototype.flexDirectionsAsConstants = {
	row : 'row',
	column : 'column'
}

LayoutNode.prototype.defaultInputSize = 20;

LayoutNode.prototype.sortBySpecificity = function(aValue, bValue) {
	var realAValue, realBValue, aValueSpecificity = 0, bValueSpecificity = 0;
	aValue.selectorsList.forEach(function(selector) {
		if (selector.specificity > aValueSpecificity) {
			aValueSpecificity = selector.specificity;
			realAValue = selector;
		}
	});
	bValue.selectorsList.forEach(function(selector) {
		if (selector.specificity > bValueSpecificity) {
			bValueSpecificity = selector.specificity
			realBValue = selector;
		}
	});
	return realAValue.specificity > realBValue.specificity
		? 1
		: (realAValue.specificity < realBValue.specificity
			? -1
			: 0)
}









var LinkedLayoutNode = function(sourceDOMNodeAsView, layoutParentNode, previousSiblingLayoutNode, isLastChild) {
	this.isLastChild = isLastChild;
	this._parent = layoutParentNode;
	this.previousSibling = previousSiblingLayoutNode;
//	console.log('this._parent.nodeName', this._parent.nodeName, 'this._parent.availableSpace.childCount', this._parent.availableSpace.childCount);
	this._parent.availableSpace.childCount++;
	
	LayoutNode.call(this, sourceDOMNodeAsView, layoutParentNode);
	this.objectType = 'LinkedLayoutNode';
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
	var children = children || [];
	if (this.previousSibling) {
		children.splice(0, 0, this.previousSibling);
		this.previousSibling.climbChildrenLinkedListAndCallbackLayoutAlgo(children, callbackName);
	}
	else {
		children.forEach(function(siblingNode) {
			siblingNode.layoutAlgo[callbackName](siblingNode.dimensions);
		}, this);
	}
}













var FlexEndLayoutNode = function(sourceDOMNodeAsView, layoutParentNode, previousSiblingLayoutNode, isLastChild) {
	this._UID = +Infinity;
	
	this.isLastChild = isLastChild;
	this._parent = layoutParentNode;
	this.previousSibling = previousSiblingLayoutNode;
	
	this.nodeName = sourceDOMNodeAsView.nodeName;
	
	this.availableSpace = new LayoutTypes.AvailableSpace();
	this.computedStyle = new CSSPropertySetBuffer();
	this.dimensions = new LayoutTypes.BoxDimensions();
	this.offsets = new LayoutTypes.BoxOffsets();
	
	this.canvasShape = null;
	this.layoutAlgo = new InlineBlockLayoutAlgo(this, layoutDimensionsBuffer);
}
FlexEndLayoutNode.prototype = Object.create(LinkedLayoutNode.prototype);
FlexEndLayoutNode.prototype.objectType = 'FlexEndLayoutNode';










var LayoutRoot = function(dimensionsPairAsArray) {
	this.objectType = 'LayoutRoot';
	this.nodeName = 'viewport';
//	console.log(dimensionsPairAsArray);
	this.availableSpace = dimensionsPairAsArray
		? new LayoutTypes.AvailableSpace(dimensionsPairAsArray)
		: new LayoutTypes.AvailableSpace();
	this.computedStyle = new CSSPropertySetBuffer();
	this.dimensions = new LayoutTypes.BoxDimensions(dimensionsPairAsArray) || new LayoutTypes.BoxDimensions();
	this.offsets = new LayoutTypes.BoxOffsets();
	this.layoutAlgo = new BaseLayoutAlgo(this, layoutDimensionsBuffer);
	
//	this.canvasShape = this.getCanvasShape();
}
LayoutRoot.prototype = Object.create(LayoutNode.prototype);
LayoutRoot.prototype.objectType = 'LayoutRoot';

LayoutRoot.prototype.setViewportStyle = function(selectorMatches, masterStyleRegistry) {
	selectorMatches.forEach(function(result, key) {
		this.populateAllComputedStyle([masterStyleRegistry.getItem(result[1])]);
	}, this);
}

LayoutRoot.prototype.updateCanvasShapeOffsets = function() {}		// noOp() needed

LayoutRoot.prototype.updateCanvasShapeDimensions = function() {}	// noOp() needed












module.exports = LayoutTreePrepare;