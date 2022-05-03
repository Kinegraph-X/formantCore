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

var UIDGenerator = require('src/core/UIDGenerator').NodeUIDGenerator;
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

var BaseLayoutAlgo = require('src/_LayoutEngine/L_baseLayoutAlgo');
var InlineLayoutAlgo = require('src/_LayoutEngine/L_inlineLayoutAlgo');
var BlockLayoutAlgo = require('src/_LayoutEngine/L_blockLayoutAlgo');
var InlineBlockLayoutAlgo = require('src/_LayoutEngine/L_inlineBlockLayoutAlgo');
var FlexLayoutAlgo = require('src/_LayoutEngine/L_flexLayoutAlgo');
var TextLayoutAlgo = require('src/_LayoutEngine/L_textLayoutAlgo');
var NoLayoutAlgo = require('src/_LayoutEngine/L_noLayoutAlgo');

var ComputedStyleSimpleGetter = require('src/_LayoutEngine/ComputedStyleFastSimpleGetter');
var LayoutDimensionsSimpleGetSet = require('src/_LayoutEngine/LayoutDimensionsSimpleGetSet');
var LayoutOffsetsSimpleGetSet = require('src/_LayoutEngine/LayoutOffsetsSimpleGetSet');

var LayoutAvailableSpaceGetSet = require('src/_LayoutEngine/LayoutAvailableSpaceGetSet');
var LayoutDimensionsGetSet = require('src/_LayoutEngine/LayoutDimensionsGetSet');
var LayoutOffsetsGetSet = require('src/_LayoutEngine/LayoutOffsetsGetSet');

var CanvasTypes = require('src/core/WebCanvasCoreTypes');


var LayoutTreePrepare = function(naiveDOM, collectedSWrappers, importedMasterStyleRegistry, viewportDimensions) {
	this.objectType = 'LayoutTreePrepare';
	this.masterStyleRegistry = importedMasterStyleRegistry;
	
	this.layoutTree = this.constructLayoutTree(naiveDOM, collectedSWrappers, viewportDimensions);
	
	this.latelyExecuteLayout();
}
LayoutTreePrepare.prototype = {};
LayoutTreePrepare.prototype.objectType = 'LayoutTreePrepare';

LayoutTreePrepare.prototype.constructLayoutTree = function(naiveDOM, collectedSWrappers, viewportDimensions) {
	var layoutViewport = new LayoutRoot(this.retrieveWindowInitialSize(viewportDimensions));
	// FIXME: We retrieve the style of the body tag, but we should retrieve ALL the cascade of styles from "body" to the ACTUAL container
	this.retrieveWindowStyle(layoutViewport, naiveDOM, collectedSWrappers);
	var layoutRoot = new LayoutNode(naiveDOM.views.memberViews[2], layoutViewport);
	return new LayoutTreeBuilder(naiveDOM, layoutRoot);
}

LayoutTreePrepare.prototype.latelyExecuteLayout = function() {
//	performance.mark('layoutComputeOnly');
	
	var textNodes = Object.values(TypeManager.textNodesRegistry.cache);
	textNodes.forEach(function(layoutNode) {
		layoutNode.layoutAlgo.setSelfDimensions();
	}, this);
	
	var layoutNodes = Object.values(TypeManager.layoutNodesRegistry.cache);
	layoutNodes.forEach(function(layoutNode) {
		layoutNode.layoutAlgo.executeLayout();
	}, this);
//	performance.measure('layout_compute_only', 'layoutComputeOnly');
//	console.log('benchmark for layout_compute_only',  performance.getEntriesByName('layout_compute_only')[performance.getEntriesByName('layout_compute_only').length - 1].duration, 'ms');
}

LayoutTreePrepare.prototype.finallyCleanLayoutTree = function() {
	// FIXME: this may be more efficiently done at the end of the layout process
	UIDGenerator.resetCursor();
	TypeManager.textNodesRegistry.cache = {};
	TypeManager.layoutNodesRegistry.cache = {};
	TypeManager.rasterShapesRegistry.cache = {};
	TypeManager.layoutCallbacksRegistry.cache = {};
	
	LayoutTypes.layoutAvailableSpaceBuffer.reset();
	LayoutTypes.layoutDimensionsBuffer.reset();
	LayoutTypes.layoutOffsetsBuffer.reset();
}

LayoutTreePrepare.prototype.retrieveWindowInitialSize = function(viewportDimensions) {
	// FIXME: the width of the body is, for now, the width of the styleSolverDebugView IFrame, not the styleSolverRenderView IFrame
//	var rootBoundingRect = document.body.getBoundingClientRect();
	return [parseInt(viewportDimensions.width), parseInt(viewportDimensions.height)];
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
				// TODO: optimization : the presence of a textContent may be identified by a less expensive mean
				if ((textContentKey = childDOMNodeAsAView.attributes.indexOfObjectByValue('name', 'textContent')) !== false) {
					textNode = new NaiveDOMNode();
					textNode._UID = +Infinity;	// we must NOT match any style (UIDgenerator is out of sync, as UID were generated in another IFrame)
					textNode.nodeName = 'textNode';
					
					childLayoutNode = new LinkedLayoutNode(childDOMNodeAsAView, layoutParentNode, childLayoutNode, false);
					// TODO: A textNode cannot have a populated computedStyle
					// => Bypass csGetter
					new TextNode(textNode, childLayoutNode, childDOMNodeAsAView.attributes[textContentKey].value);
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
						textNode._UID = +Infinity;	// we must NOT match any style (UIDgenerator is out of sync, as UID were generated in another IFrame)
						textNode.nodeName = 'textNode';
						
						subChildLayoutNode = new LinkedLayoutNode(subChildDOMNodeAsAView, childLayoutNode, subChildLayoutNode, isLastChild);
						// TODO: A textNode cannot have a populated computedStyle
						// => Bypass csGetter
						new TextNode(textNode, subChildLayoutNode, subChildDOMNodeAsAView.attributes[textContentKey].value);
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











var LayoutNode = function(sourceDOMNodeAsView, layoutParentNode, textContent) {
	this._UID = UIDGenerator.newUID();
	TypeManager.layoutNodesRegistry.setItem(this._UID, this);
	
	this._parent = layoutParentNode;
	this.nodeName = sourceDOMNodeAsView.nodeName;
	
	this.inputLength = sourceDOMNodeAsView.attributes.findObjectByValue('name', 'size') || this.defaultInputSize;
//	this.textContent = textContent || '';
	this.isTextNode = false;
	
	this.computedStyle = new CSSPropertySetBuffer();

	this.populateInheritedStyle();
	this.populateAllComputedStyle(this.queryStyleUpdate(sourceDOMNodeAsView));
	
	this.canvasShape = null;
	
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
	
	// FIXME: allow having a different border-style for each side of the box
	var lineColor = this.computedStyle.getTokenTypeForPropAsConstant('borderBlockStartColor') === CSSPropertyBuffer.prototype.TokenTypes.HashToken
		? parseInt('0x' + this.computedStyle.getPropAsString('borderBlockStartColor').slice(1, 7))
		// light-blue shall mean 'transparent' when debugging
		: 0xAACCFF;
		
	// FIXME: allow having a different border-style for each side of the box
	var borderWidth = this.computedStyle.getPropAsNumber('borderBlockStartWidth');
	
	if (this.nodeName === 'textNode') {
		var canvasShape = new CanvasTypes._text(
			this.textContent,
			new CanvasTypes.TextStyle({
				fontFamily : this.computedStyle.getPropAsString('fontFamily'),
				fontColor : this.computedStyle.getPropAsString('color'),
				fontSize : this.computedStyle.getPropAsString('fontSize'),
				fontWeight : this.computedStyle.getPropAsString('fontWeight'),
				lineHeight : this.computedStyle.getPropAsNumber('lineHeight'), // 	/!\ getPropAsNumber /!\
				textAlign : this.computedStyle.getPropAsString('textAlign')
			}),
			new CanvasTypes.Position({x : this.layoutAlgo.offsets.getInline(), y : this.layoutAlgo.offsets.getBlock()})
		);
	}
	else if (this.nodeName === 'input') {
		var canvasShape = new CanvasTypes.InputShape(
			new CanvasTypes.Position({x : this.layoutAlgo.offsets.getInline(), y : this.layoutAlgo.offsets.getBlock()}),
			new CanvasTypes.Size({width : this.layoutAlgo.dimensions.getBorderInline(), height : this.layoutAlgo.dimensions.getBorderBlock()})
		);
	}
	else if (this.nodeName === 'button') {
		var canvasShape = new CanvasTypes.ButtonShape(
			new CanvasTypes.Position({x : this.layoutAlgo.offsets.getInline(), y : this.layoutAlgo.offsets.getBlock()}),
			new CanvasTypes.Size({width : this.layoutAlgo.dimensions.getBorderInline(), height : this.layoutAlgo.dimensions.getBorderBlock()})
		);
	}
	else {
		var canvasShape = new CanvasTypes.NodeShape(
			new CanvasTypes.Position({x : this.layoutAlgo.offsets.getInline(), y : this.layoutAlgo.offsets.getBlock()}),
			new CanvasTypes.Size({width : this.layoutAlgo.dimensions.getBorderInline(), height : this.layoutAlgo.dimensions.getBorderBlock()}),
			// FIXME: What to do when we want 4 different borders ?
			new CanvasTypes.LineStyle({lineColor : lineColor, lineWidth : borderWidth}),
			new CanvasTypes.FillStyle({fillColor : fillColor, fillAlpha : fillAlpha}),
			null,
			borderWidth
		);
	}
	TypeManager.rasterShapesRegistry.setItem(UIDGenerator.newUID(), canvasShape);
	
	return canvasShape;
}

LayoutNode.prototype.updateCanvasShapeOffsets = function() {
	if (this.nodeName === 'textNode') {
		this.canvasShape.position.x = Math.round(this.layoutAlgo.offsets.getMarginInline()) + 1;
		this.canvasShape.position.y = Math.round(this.layoutAlgo.offsets.getMarginBlock()) + 1;
	}
	else {
		this.canvasShape.position.x = Math.round(this.layoutAlgo.offsets.getMarginInline()) + .5;
		this.canvasShape.position.y = Math.round(this.layoutAlgo.offsets.getMarginBlock()) + .5;
	}
	this.canvasShape.reDraw();
}

LayoutNode.prototype.updateCanvasShapeDimensions = function() {
	this.canvasShape.size.width = Math.round(this.layoutAlgo.dimensions.getBorderInline());
	this.canvasShape.size.height = Math.round(this.layoutAlgo.dimensions.getBorderBlock());
	this.canvasShape.reDraw();
}


LayoutNode.prototype.queryStyleUpdate = function(sourceDOMNodeAsView) {
	return this.publishRequestForStyleUpdate(sourceDOMNodeAsView._UID);
}

// TODO: How is the pub/sub mechanism supposed to be designed ?
LayoutNode.prototype.publishRequestForStyleUpdate = function(viewUID) {
	// TODO: matchedStyle should  be an array
	// => populate the TypeManager.pendingStyleRegistry with an array
	// 		in CSSSelectorsMatcherRefiner.publishToBeComputedStyle
	// => get it back here and iterate in LayoutNode.prototype.populateAllComputedStyle
//	console.log(viewUID, TypeManager.pendingStyleRegistry);
	var matchedStyles = TypeManager.pendingStyleRegistry.getItem(viewUID);
	return matchedStyles ? matchedStyles : [];		// new Style(null, 'dummy', {})
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
		case this.displayPropsAsConstants.inline : return new InlineLayoutAlgo(this);
		case this.displayPropsAsConstants.block : return new BlockLayoutAlgo(this);
		case this.displayPropsAsConstants.inlineBlock : return new InlineBlockLayoutAlgo(this);
		case this.displayPropsAsConstants.flex : return new FlexLayoutAlgo(this);
		case this.displayPropsAsConstants.none : return new NoLayoutAlgo(this);
		default : return new InlineLayoutAlgo(this);
	}
}

LayoutNode.prototype.getDisplayProp = function(nodeName) {
	var valueOfDisplayProp = this.computedStyle.getPropAsString('display');

	if (!valueOfDisplayProp.length)
		console.warn('LayoutNode ' + this.nodeName + ' : valueOfDisplayProp has a zero length. Seems the CSS initialValue hasn\'t been taken in account', this.computedStyle);
	
	if (valueOfDisplayProp === this.displayPropsAsConstants.inline) {
		if (this._parent.layoutAlgo.algoName === this.displayPropsAsConstants.flex)
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
	LayoutNode.call(this, sourceDOMNodeAsView, layoutParentNode, null);
	
	this._parent.layoutAlgo.availableSpace.incrementChildCount();
	
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
	this._UID = UIDGenerator.newUID();
	TypeManager.layoutNodesRegistry.setItem(this._UID, this);
	
	this.isLastChild = isLastChild;
	this._parent = layoutParentNode;
	this.previousSibling = previousSiblingLayoutNode;
	
	this.nodeName = sourceDOMNodeAsView.nodeName;
	
	this.computedStyle = new CSSPropertySetBuffer();
	
	this.canvasShape = null;
	this.layoutAlgo = new InlineBlockLayoutAlgo(this);
}
FlexEndLayoutNode.prototype = Object.create(LinkedLayoutNode.prototype);
FlexEndLayoutNode.prototype.objectType = 'FlexEndLayoutNode';










var TextNode = function(sourceDOMNodeAsView, layoutParentNode, textContent) {
	this._UID = UIDGenerator.newUID();
	TypeManager.layoutNodesRegistry.setItem(this._UID, this);
	TypeManager.textNodesRegistry.setItem(this._UID, this);
	
	this._parent = layoutParentNode;
	this.nodeName = sourceDOMNodeAsView.nodeName;
	
	this.textContent = textContent || '';
	this.isTextNode = true;
	
	this.computedStyle = new CSSPropertySetBuffer();

	this.populateInheritedStyle();
	this.populateAllComputedStyle(this.queryStyleUpdate(sourceDOMNodeAsView));
	
	this.canvasShape = null;
	
	this.layoutAlgo = new TextLayoutAlgo(this, this.textContent);
	this.layoutAlgo.setRefsToParents(this);
	this.layoutAlgo.cs = new ComputedStyleSimpleGetter(this.layoutAlgo);
	this.layoutAlgo.dimensions = new LayoutDimensionsSimpleGetSet(this, this.layoutAlgo);
	this.layoutAlgo.availableSpace = new LayoutAvailableSpaceGetSet(this, this.layoutAlgo);
	this.layoutAlgo.offsets = new LayoutOffsetsSimpleGetSet(this, this.layoutAlgo);
	
//	console.log(this.nodeName, this._parent.nodeName, this.layoutAlgo.algoName, this.dimensions);
//	console.log(this.nodeName, this._parent.nodeName, this.layoutAlgo.algoName, this.offsets);
}
TextNode.prototype = Object.create(LayoutNode.prototype);
TextNode.prototype.objectType = 'LayoutNode';








var LayoutRoot = function(dimensionsPairAsArray) {
	this._UID = UIDGenerator.newUID();
	
	this.objectType = 'LayoutRoot';
	this.nodeName = 'viewport';

	this.computedStyle = new CSSPropertySetBuffer();
	this.layoutAlgo = new BaseLayoutAlgo(this);
	
	this.layoutAlgo.cs = {
		getBorderBlockStartWidth : function() {return 0;},
		getBorderInlineEndWidth : function() {return 0;},
		getBorderBlockEndWidth : function() {return 0;},
		getBorderInlineStartWidth : function() {return 0;},
		getPaddingBlockStart : function() {return 0;},
		getPaddingInlineEnd : function() {return 0;},
		getPaddingBlockEnd : function() {return 0;},
		getPaddingInlineStart : function() {return 0;},
		getMarginBlockStart : function() {return 0;},
		getMarginInlineEnd : function() {return 0;},
		getMarginBlockEnd : function() {return 0;},
		getMarginInlineStart : function() {return 0;},
		getSummedInlinePaddings : function() {return 0;},
		getSummedBlockPaddings : function() {return 0;},
		getSummedInlineBorders : function() {return 0;},
		getSummedBlockBorders : function() {return 0;},
		getSummedInlineMargins : function() {return 0;},
		getSummedBlockMargins : function() {return 0;}
	}
	
	this.layoutAlgo.availableSpace = new LayoutAvailableSpaceGetSet(this, this.layoutAlgo);
	this.layoutAlgo.dimensions = new LayoutDimensionsGetSet(this, this.layoutAlgo);
	this.layoutAlgo.offsets = new LayoutOffsetsGetSet(this, this.layoutAlgo);
	
	this.layoutAlgo.availableSpace.setInline(dimensionsPairAsArray[0]);
	this.layoutAlgo.availableSpace.setBlock(dimensionsPairAsArray[1]);
	
	this.layoutAlgo.dimensions.setFromInline(dimensionsPairAsArray[0]);
	this.layoutAlgo.dimensions.setFromBlock(dimensionsPairAsArray[1]);
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