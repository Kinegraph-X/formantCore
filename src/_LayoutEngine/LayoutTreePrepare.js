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
 * 
 * TODO :
 * 		- we can't handle the case of a flex-parent which is itself a flex-child : its layout algo shall default to inline-block
 * 			(cf. LayoutNode.prototype.getDisplayProp() and InlineBlockLayoutAlgo which handles all the specificities of a flex-child)
 * 		- update center-aligned child-node (and child-node of child-node ?) only if flex-child or text-align center
 * 		- stacking context
 * 		- so on, z-index
 * 		- CSS has: pseudo-class
 * 		
 * 		- (seems done) CSSMatcherRefiner : match on unequal number of compound selectors (seems we only have to invert the loop on viewClassesAsArray by componentClassesAsArray) 
 * 			(eg. node has 3 classes, and selector only 2)
 * 
 * 
 * 		- "lineFeed" layoutNode to handle justified text
 * 
 */


var TypeManager = require('src/core/TypeManager');
var CoreTypes = require('src/core/CoreTypes');

var LayoutTypes = require('src/_LayoutEngine/LayoutTypes');

var UIDGenerator = require('src/core/UIDGenerator').NodeUIDGenerator;
var nodeUIDGenerator = require('src/core/UIDGenerator').NodeUIDGenerator;
var Style = require('src/editing/Style');

var NaiveDOMNode = require('src/_LayoutEngine/NaiveDOMNode');
var CSSSelectorsMatcher = require('src/_LayoutEngine/CSSSelectorsMatcher');
var CSSPropertyBuffer = require('src/editing/CSSPropertyBuffer');
var CSSPropertySetBuffer = require('src/editing/CSSPropertySetBuffer');
//var CSSPropertyDescriptors = require('src/editing/CSSPropertyDescriptors');

var ComputedStyleSolver = require('src/_LayoutEngine/ComputedStyleSolver');
var UAStylesheet = require('src/_LayoutEngine/UAStylesheet_minimalist.js');
var SyntaxHighlightingStylesheet = require('src/_LayoutEngine/SyntaxHighlightingStylesheet');

//var SplittedAttributes = require('src/editing/SplittedAttributes');
var StylePropertyEnhancer = require('src/editing/StylePropertyEnhancer');
//var stylePropertyConverter = new StylePropertyEnhancer();

var SubTextLayoutNode = require('src/_LayoutEngine/L_subTextLayoutAlgo');

var BaseLayoutAlgo = require('src/_LayoutEngine/L_baseLayoutAlgo');
var InlineLayoutAlgo = require('src/_LayoutEngine/L_inlineLayoutAlgo');
var BlockLayoutAlgo = require('src/_LayoutEngine/L_blockLayoutAlgo');
var InlineBlockLayoutAlgo = require('src/_LayoutEngine/L_inlineBlockLayoutAlgo');
var FlexLayoutAlgo = require('src/_LayoutEngine/L_flexLayoutAlgo');
var TextLayoutAlgo = require('src/_LayoutEngine/L_textLayoutAlgo');
var SubTextLayoutAlgo = require('src/_LayoutEngine/L_subTextLayoutAlgo');
var NoLayoutAlgo = require('src/_LayoutEngine/L_noLayoutAlgo');

var ComputedStyleSimpleGetter = require('src/_LayoutEngine/ComputedStyleFastSimpleGetter');
var LayoutDimensionsSimpleGetSet = require('src/_LayoutEngine/LayoutDimensionsSimpleGetSet');
var LayoutOffsetsSimpleGetSet = require('src/_LayoutEngine/LayoutOffsetsSimpleGetSet');

var LayoutAvailableSpaceGetSet = require('src/_LayoutEngine/LayoutAvailableSpaceGetSet');
var LayoutDimensionsGetSet = require('src/_LayoutEngine/LayoutDimensionsGetSet');
var LayoutOffsetsGetSet = require('src/_LayoutEngine/LayoutOffsetsGetSet');

var CanvasTypes = require('src/_LayoutEngine/WebCanvasCoreTypes');


var LayoutTreePrepare = function(naiveDOM, collectedSWrappers, importedMasterStyleRegistry, viewportDimensions, naiveDOMRegistry) {
	this.objectType = 'LayoutTreePrepare';
	this.masterStyleRegistry = importedMasterStyleRegistry;
	
	var UIDs = Object.keys(naiveDOMRegistry.cache);
	this.lastUIDSeenInPreviousPage = UIDs[UIDs.length - 1];
	
	this.layoutTreeBuilder = this.constructLayoutTree(naiveDOM, collectedSWrappers, viewportDimensions);
	
	this.latelyExecuteLayout();
	
	var firstIndex = Object.keys(TypeManager.layoutNodesRegistry.cache)[0];
	this.finalViewportWidth = TypeManager.layoutNodesRegistry.cache[firstIndex].layoutAlgo.dimensions.getOuterInline();
	this.finalViewportHeight = TypeManager.layoutNodesRegistry.cache[firstIndex].layoutAlgo.dimensions.getOuterBlock();
}
LayoutTreePrepare.prototype = {};
LayoutTreePrepare.prototype.objectType = 'LayoutTreePrepare';

LayoutTreePrepare.prototype.constructLayoutTree = function(naiveDOM, collectedSWrappers, viewportDimensions) {
	var layoutViewport = new LayoutRoot(this.retrieveWindowInitialSize(viewportDimensions));
	
	// FIXME: We retrieve the style of the body tag, but we should retrieve ALL the cascade of styles from "body"
	// to the ACTUAL container ==> SEEMS DONE
	this.retrieveWindowStyle(layoutViewport, naiveDOM, collectedSWrappers);
//	var layoutRoot = new LayoutNode(naiveDOM.views.memberViews[2], layoutViewport);

//	console.log('viewport instanciated', layoutViewport.layoutAlgo.availableSpace.getValues());
	
	var layoutTree = new LayoutTreeBuilder(naiveDOM, layoutViewport);
	
//	console.log('layoutTree instanciated', layoutViewport.layoutAlgo.availableSpace.getInline());
	
	return layoutTree;
}
 	
LayoutTreePrepare.prototype.latelyExecuteLayout = function() {
//	performance.mark('layoutComputeOnly');
	
	var layoutNodes = Object.values(TypeManager.layoutNodesRegistry.cache);
	console.log('nodes count :', layoutNodes.length,
		'buffered memory occupied space :',
		layoutNodes.length
			* LayoutAvailableSpaceGetSet.prototype.valuesList.length
			* LayoutDimensionsGetSet.prototype.valuesList.length
			* LayoutOffsetsGetSet.prototype.valuesList.length
			* 4,
		'Bytes');
	layoutNodes.forEach(function(layoutNode, key) {
//		if ((layoutNode.layoutAlgo instanceof TextLayoutAlgo))
//			console.log('EXECUTE', key, layoutNode.nodeName, layoutNode.textContent);
//		if (!(layoutNode.layoutAlgo instanceof InlineLayoutAlgo)
//			&& !(layoutNode.layoutAlgo instanceof TextLayoutAlgo)
//			&& !(layoutNode.layoutAlgo instanceof SubTextLayoutAlgo))
//		console.log('EXECUTE', layoutNode.nodeName, layoutNode._UID)
		if (!(layoutNode instanceof SubTextLayoutNode))
			layoutNode.layoutAlgo.executeLayout();
	}, this);
	
	
//	var textNodes = Object.values(TypeManager.textNodesRegistry.cache);
//	textNodes.forEach(function(layoutNode) {
//		layoutNode.layoutAlgo.setSelfDimensions();
//	}, this);
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
	TypeManager.pendingStyleRegistry.cache = {};
	
	LayoutTypes.layoutAvailableSpaceBuffer.reset();
	LayoutTypes.layoutDimensionsBuffer.reset();
	LayoutTypes.layoutOffsetsBuffer.reset();
}

LayoutTreePrepare.prototype.retrieveWindowInitialSize = function(viewportDimensions) {
	// FIXME: the width of the body is, for now, the width of the styleSolverDebugView IFrame, not the styleSolverRenderView IFrame
//	var rootBoundingRect = document.body.getBoundingClientRect();
	return [parseInt(viewportDimensions.width), parseInt(viewportDimensions.height)];
}

/**
 * Don't remember exactly why we need the casvade the styles from the body til a specific node
 * Seems we need to retrieve ALL the cascade of styles from "body" til the root-node of our tree
 * to ensure we have the correct inherited styles
 */
LayoutTreePrepare.prototype.retrieveWindowStyle = function(layoutViewPort, naiveDOM, collectedSWrappers) {
	// HACK: the style  solver shall reset the TypeManager.pendingStyleRegistry => cache it;
	var cache = TypeManager.pendingStyleRegistry.cache;
	var styleSolver = new ComputedStyleSolver(naiveDOM, collectedSWrappers);
	styleSolver.CSSSelectorsMatcher.CSSRulesBuffer = styleSolver.CSSRulesBufferManager.CSSRulesBuffer;
	
//	console.log(naiveDOM.views.memberViews[2]);

	// FIXME: we should not have to test the "body" selector against the whole style-rules buffer
	var rulesBufferLength = styleSolver.CSSSelectorsMatcher.CSSRulesBuffer._buffer.byteLength;
	styleSolver.CSSSelectorsMatcher.iterateOnRulesAndMatchSelector(
		3,
		'body',
		naiveDOM.views.memberViews[naiveDOM.views.memberViews.length - 1]._UID,
		0,
		rulesBufferLength
	);
	
	layoutViewPort.setViewportStyle(styleSolver.CSSSelectorsMatcher.matches.results, this.masterStyleRegistry);
	
	TypeManager.pendingStyleRegistry.cache = cache;
}

//LayoutTreePrepare.prototype.newFakeLayoutNode = function() {
//	return (new LayoutRoot([0, 0]));
//}

//LayoutTreePrepare.prototype.customSortingOnUID = function(A_UID, B_UID) {
//	if (parseInt(A_UID) > parseInt(B_UID))
//		return 1;
//	else if (parseInt(A_UID) < parseInt(B_UID))
//		return -1
//	return 0;
//}






var LayoutTreeBuilder = function(sourceDOMNode, layoutRoot) {
	this.objectType = 'LayoutTreeBuilder';
	// let's assume we often won't have more than 3 subSections, and then, prepare a default typed object with 3 empty keys
	this.refToParentNode = {
		'0' : layoutRoot,
		'1' : null,
		'2' : null
	};
	this.depth = 0;
	this.tab = '';
	this.alternateFlatAndRecursiveBuild(sourceDOMNode, layoutRoot, '0');
}
LayoutTreeBuilder.prototype = {};
LayoutTreeBuilder.prototype.objectType = 'LayoutTreeBuilder';

LayoutTreeBuilder.prototype.alternateFlatAndRecursiveBuild = function(sourceDOMNode, layoutParentNode, currentSection) {
	var currentLayoutNode = layoutParentNode,
		childLayoutNode,
		childDOMNodeAsAView, 
		sectionChildLayoutNode,
		subChildLayoutNode,
		textContentKey,
		textNode, fakeNode,
		isLastChild, intermediateViewType;
	var memoizedRefToParentNode;
	
	this.tab += '	';
//	console.log(typeof layoutParentNode === 'undefined');
//	console.log(this.tab, 'DEPTH', this.depth++);
//	console.log(this.tab, 'recurse', sourceDOMNode.views.masterView.nodeName, sourceDOMNode.views.masterView._UID, layoutParentNode.nodeName, layoutParentNode._UID, sourceDOMNode.views, sourceDOMNode.children);
	
	sourceDOMNode.children.forEach(function(childDOMNode, childIndex) {
		var typeIdx = 0,
			hasReturned = false,
			currentViewType = CSSSelectorsMatcher.prototype.viewTypes[typeIdx];
		isLastChild = childIndex === sourceDOMNode.children.length - 1 ? true : false;
		
//		console.log(this.tab, 'child', childIndex, childDOMNode.views.masterView.nodeName, childDOMNode.views.masterView._UID, childDOMNode.views.masterView.hasBeenSeenForLayout, childLayoutNode === currentLayoutNode, (childLayoutNode && childLayoutNode.nodeName + ' ' + childLayoutNode._UID));
		
		// when represented as naiveDOM, leaf-components have no children, they only hold views
		while (currentViewType) {
			subChildLayoutNode = undefined;
			// childDOMNode.views.masterView is ALWAYS flat
			if (typeIdx === 0) {
				childDOMNodeAsAView = childDOMNode.views.masterView;
				
				if (childDOMNodeAsAView.hasBeenSeenForLayout) {
					currentViewType = CSSSelectorsMatcher.prototype.viewTypes[++typeIdx];
					// Test for a fix when looping over "seen" nodes and loosing ref to the current parent
//					childLayoutNode = currentLayoutNode;
					continue;
				}
				else if (childDOMNodeAsAView.section === currentSection || layoutParentNode.nodeName === 'viewport') // on the first iteration, we may have started the tree at a point where the root is -not- section 0
					childDOMNodeAsAView.hasBeenSeenForLayout = true;
				else {
					hasReturned = true;
					// Test for a fix when looping over "seen" nodes and loosing ref to the current parent
//					childLayoutNode = currentLayoutNode;
					break;
				}
					
//				console.log(this.tab, 'masterView', childDOMNodeAsAView.nodeName + ' ' + childDOMNodeAsAView._UID, (this.refToParentNode[childDOMNodeAsAView.section] || layoutParentNode).nodeName, (this.refToParentNode[childDOMNodeAsAView.section] || layoutParentNode)._UID, childDOMNodeAsAView.section);
				
				// TODO: optimization : the presence of a textContent may be identified by a less expensive mean
				if ((textContentKey = childDOMNodeAsAView.attributes.indexOfObjectByValue('name', 'textContent')) !== false
						&& childDOMNodeAsAView.attributes[textContentKey].value.length) {
					textNode = new NaiveDOMNode();
					textNode._UID = +Infinity;	// we must NOT apply any style (UIDgenerator is out of sync, as UID were generated in another IFrame)
					textNode.nodeName = 'textNode';
					
					childLayoutNode = new LinkedLayoutNode(childDOMNodeAsAView, this.refToParentNode[childDOMNodeAsAView.section] || layoutParentNode, childLayoutNode, false);
//					console.log(this.tab, 'CREATE', (childLayoutNode  && childLayoutNode.nodeName + ' ' + childLayoutNode._UID));
					new TextNode(textNode, childLayoutNode, childDOMNodeAsAView.attributes[textContentKey].value);
				}
				else {
					childLayoutNode = new LinkedLayoutNode(childDOMNodeAsAView, this.refToParentNode[childDOMNodeAsAView.section] || layoutParentNode, childLayoutNode, false);
//					console.log(this.tab, 'CREATE', (childLayoutNode  && childLayoutNode.nodeName + ' ' + childLayoutNode._UID));
				};
				
				// This shall be applied to the last child of a node.
				if (layoutParentNode.layoutAlgo.algoName === LayoutNode.prototype.displayPropsAsConstants.flex && isLastChild)
					this.createFlexEndNode(layoutParentNode, childLayoutNode);
				
				// if the current child-node has subsections, we need to pass the masterView as their parent on the next iteration of the while loop
				if (childDOMNode.views[CSSSelectorsMatcher.prototype.viewTypes[1]].length)
					currentLayoutNode = childLayoutNode;
			}
			else if (typeIdx === 1 && childDOMNode.views[currentViewType].length) {
				sectionChildLayoutNode = undefined;
				memoizedRefToParentNode = Object.values(this.refToParentNode);
				intermediateViewType = CSSSelectorsMatcher.prototype.viewTypes[2];
				
//				console.log(this.tab, 'subSection', childDOMNode.views[currentViewType]);
				childDOMNode.views[currentViewType].forEach(function(subSectionDOMNodeAsAView, key) {
					if (subSectionDOMNodeAsAView.hasBeenSeenForLayout) {
						return;
					}
					else
						subSectionDOMNodeAsAView.hasBeenSeenForLayout = true;
//					console.log(this.tab, 'subSection', subSectionDOMNodeAsAView.nodeName, subSectionDOMNodeAsAView._UID, (currentLayoutNode && currentLayoutNode.nodeName + ' ' + currentLayoutNode._UID));//currentLayoutNode);
					
					this.refToParentNode[key.toString()] = sectionChildLayoutNode = new LinkedLayoutNode(subSectionDOMNodeAsAView, currentLayoutNode, sectionChildLayoutNode, false);
					
					
					if (childDOMNode.views[intermediateViewType].length) {
						childDOMNode.views[intermediateViewType].forEach(function(subChildDOMNodeAsAView, childIndex) {
							// this test acts as the "hasBeenSeenForLayout" flag
							if (subChildDOMNodeAsAView.hasBeenSeenForLayout !== key.toString())
								return;
							isLastChild = 
								this.refToParentNode[subChildDOMNodeAsAView.section].layoutAlgo.algoName === LayoutNode.prototype.displayPropsAsConstants.flex
								&& childIndex === childDOMNode.views[intermediateViewType].length - 1
									? true
									: false;
//							console.log(subChildDOMNodeAsAView.nodeName, isLastChild);
							subChildLayoutNode = this.constructLeafNode(subChildDOMNodeAsAView, isLastChild, subChildLayoutNode, key.toString())
						}, this);
					}
					
					// "not efficient at all" recursion between subSections
					if (childDOMNode.children.length) {
//						console.log(typeof sectionChildLayoutNode === 'undefined');
						this.alternateFlatAndRecursiveBuild(childDOMNode, sectionChildLayoutNode, key.toString());
						hasReturned = true;
					}
					
					isLastChild = key === childDOMNode.views[currentViewType].length - 1 ? true : false;
					// This shall be applied to the last subSection of a node.
					if (currentLayoutNode.layoutAlgo.algoName === LayoutNode.prototype.displayPropsAsConstants.flex && isLastChild)
						this.createFlexEndNode(currentLayoutNode, sectionChildLayoutNode);
//					console.log(this.tab, Object.values(this.refToParentNode).reduce(function(acc, val) {if (val) acc.push(val._UID); return acc;}, []));
				}, this);
				Object.assign(this.refToParentNode, memoizedRefToParentNode);
//				console.log(Object.values(this.refToParentNode).reduce(function(acc, val) {if (val) acc.push(val._UID); return acc;}, []));
			}
			// if no subSection (otherwise memberViews have already been seen)
			else if (typeIdx === 2 && !childDOMNode.views[CSSSelectorsMatcher.prototype.viewTypes[1]].length) {
				childDOMNode.views[currentViewType].forEach(function(subChildDOMNodeAsAView, childIndex) {
					// if no subSection is this component, memberViews can't refer to subSections on the parent
					// => take care to explore them only once
					// (we could be in a "not efficient at all" recursion between subSections)
					if (subChildDOMNodeAsAView.hasBeenSeenForLayout)
						return;
					else
						subChildDOMNodeAsAView.hasBeenSeenForLayout = true;
					isLastChild = 
						this.refToParentNode[subChildDOMNodeAsAView.section].layoutAlgo.algoName === LayoutNode.prototype.displayPropsAsConstants.flex
						&& childIndex === childDOMNode.views[currentViewType].length - 1
							? true
							: false;
//					console.log(subChildDOMNodeAsAView.nodeName, isLastChild);
					subChildLayoutNode = this.constructLeafNode(subChildDOMNodeAsAView, isLastChild, subChildLayoutNode)
				}, this);
			}

			currentViewType = CSSSelectorsMatcher.prototype.viewTypes[++typeIdx];
		}
		
		if (!hasReturned && childDOMNode.children.length) {
//			console.log(this.tab, 'AFFECT', (childLayoutNode  && childLayoutNode.nodeName + ' ' + childLayoutNode._UID));
			this.refToParentNode['0'] = currentLayoutNode = childLayoutNode;
			this.alternateFlatAndRecursiveBuild(childDOMNode, childLayoutNode, '0');
		}
		
		
	}, this);
	
//	console.log(this.tab, 'end of', sourceDOMNode.views.masterView.nodeName, 'DEPTH', --this.depth);
	this.tab = this.tab.replace("	", '');
		
	return currentLayoutNode;
}

LayoutTreeBuilder.prototype.constructLeafNode = function(subChildDOMNodeAsAView, isLastChild, previousSibling) {
	var textNode, subChildLayoutNode = previousSibling, textContentKey = '';
	console.log('subView', subChildDOMNodeAsAView.nodeName, this.refToParentNode[subChildDOMNodeAsAView.section].nodeName);
	
	// TODO: optimization : the presence of a textContent may be identified by a less expensive mean
	if ((textContentKey = subChildDOMNodeAsAView.attributes.indexOfObjectByValue('name', 'textContent')) !== false
		&& previousSibling.attributes[textContentKey].value.length) {
		// FIXME: there should be as many textNodes as there are words => Fix that in the layout algo ?
		textNode = new NaiveDOMNode();
		textNode._UID = +Infinity;	// we must NOT apply any style (UIDgenerator is out of sync, as UID were generated in another IFrame)
		textNode.nodeName = 'textNode';
		
		subChildLayoutNode = new LinkedLayoutNode(subChildDOMNodeAsAView, this.refToParentNode[subChildDOMNodeAsAView.section], previousSibling, false);
		// TODO: A textNode cannot have a populated computedStyle
		// => remove the fake implementation of the csGetter in TextNode
		new TextNode(textNode, subChildLayoutNode, subChildDOMNodeAsAView.attributes[textContentKey].value);
	}
	else {
		if (this.refToParentNode[subChildDOMNodeAsAView.section].layoutAlgo.algoName === LayoutNode.prototype.displayPropsAsConstants.flex && isLastChild) {
			fakeNode = new NaiveDOMNode();
			fakeNode.nodeName = 'fakeNode';
			
			subChildLayoutNode = new LinkedLayoutNode(subChildDOMNodeAsAView, this.refToParentNode[subChildDOMNodeAsAView.section], previousSibling, false);
			new FlexEndLayoutNode(fakeNode, childLayoutNode, subChildLayoutNode, isLastChild);
		}
		else
			subChildLayoutNode = new LinkedLayoutNode(subChildDOMNodeAsAView, this.refToParentNode[subChildDOMNodeAsAView.section], previousSibling, false);
	}
	
	// This shall be applied to the last subView of a node.
	if (isLastChild)
		this.createFlexEndNode(this.refToParentNode[subChildDOMNodeAsAView.section], subChildLayoutNode);
	return subChildLayoutNode;
}

LayoutTreeBuilder.prototype.createFlexEndNode = function(layoutParentNode, previousSibbling) {
	new FlexEndLayoutNode(layoutParentNode, previousSibbling);
}








/**
 * @constructor LayoutNode
 * @param {NaiveDomNode} sourceDOMNodeAsView
 * @param {LayoutNode} layoutParentNode
 * @param {String} textContent;
 */
var LayoutNode = function(sourceDOMNodeAsView, layoutParentNode, textContent) {
//	console.error(sourceDOMNodeAsView.nodeName, sourceDOMNodeAsView._UID, layoutParentNode.nodeName, layoutParentNode._UID);
	this._UID = UIDGenerator.newUID();
	
	TypeManager.layoutNodesRegistry.setItem(
		this._UID,
		this
	);
	
	this._parent = layoutParentNode;
	this.depth = this._parent.depth + 1;
	this.nodeName = sourceDOMNodeAsView.nodeName;
	
//	if (sourceDOMNodeAsView.nodeName === 'a')
//		console.log(sourceDOMNodeAsView);
	
	this.inputLength = sourceDOMNodeAsView.attributes.findObjectByValue('name', 'size') || this.defaultInputSize;
	
	this.isTextNode = false;
	(this.href = sourceDOMNodeAsView.attributes.findObjectsByValue('name', 'href'))
		? (this.href = this.href[0].value)
		: (this.href = null);
	
	this.computedStyle = new CSSPropertySetBuffer();
	
	this.matchOnMagicalUAStylesheet(sourceDOMNodeAsView);
	this.populateInheritedStyle();
	this.populateAllComputedStyle(this.queryStyleUpdate(sourceDOMNodeAsView));
	
	this.canvasShape = null;
	
	this.layoutAlgo = this.getLayoutAlgo(this.nodeName);
	this.blockingTween;
	
//	console.log(this.nodeName, this._parent.nodeName, this.layoutAlgo.algoName);
	
//	console.log(this.layoutAlgo.parentLayoutAlgo.availableSpace.getInline());
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
	
	var fillAlpha = this.computedStyle.getPropAsString('backgroundColor') === 'transparent'
		? 0
		: this.computedStyle.getPropAsString('backgroundColor').length > 7
			? parseInt('0x' + this.computedStyle.getPropAsString('backgroundColor').slice(7)) / 255
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
			// .slice(0, -5) + ' ' + this._parent._parent._UID
			this.textContent.replaceAll(' ', String.fromCharCode(160)),	// inconsistant bug in PIXI when content has a leading space
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
	else if (this.nodeName === 'a') {
		var canvasShape = new CanvasTypes.LinkShape(
			new CanvasTypes.Position({x : this.layoutAlgo.offsets.getInline(), y : this.layoutAlgo.offsets.getBlock()}),
			new CanvasTypes.Size({width : this.layoutAlgo.dimensions.getBorderInline(), height : this.layoutAlgo.dimensions.getBorderBlock()}),
			// FIXME: What to do when we want 4 different borders ?
			new CanvasTypes.LineStyle({lineColor : lineColor, lineWidth : borderWidth}),
			new CanvasTypes.FillStyle({fillColor : fillColor, fillAlpha : fillAlpha}),
			null,
			borderWidth,
			this.href//, 'debug'
		);
	}
	else {
//		console.log('AFFECT', this.nodeName, this._UID, this.layoutAlgo.offsets.getBlock(), this.layoutAlgo.dimensions.getBorderBlock())
		var canvasShape = new CanvasTypes.NodeShape(
			new CanvasTypes.Position({x : this.layoutAlgo.offsets.getInline(), y : this.layoutAlgo.offsets.getBlock()}),
			new CanvasTypes.Size({width : this.layoutAlgo.dimensions.getBorderInline(), height : this.layoutAlgo.dimensions.getBorderBlock()}),
			// FIXME: What to do when we want 4 different borders ?
			new CanvasTypes.LineStyle({lineColor : lineColor, lineWidth : borderWidth}),
			new CanvasTypes.FillStyle({fillColor : fillColor, fillAlpha : fillAlpha}),
			this.layoutAlgo.cs.getBorderRadius(),
			borderWidth//, 'debug'
		);
	}
	TypeManager.rasterShapesRegistry.setItem(UIDGenerator.newUID(), canvasShape);
	
	return canvasShape;
}

LayoutNode.prototype.updateCanvasShapeOffsets = function() {
	if (this.nodeName === 'textNode') {
		this.canvasShape.position.x = Math.round(this.layoutAlgo.offsets.getMarginInline());
		this.canvasShape.position.y = Math.round(this.layoutAlgo.offsets.getMarginBlock());
	}
	else if (this.nodeName === 'a') {		// Hack to compensate the bug of PIXI with low depth node hierarchy
											// https://pixijs.download/dev/docs/packages_events_src_EventBoundary.ts.html
		this.canvasShape.position.x = Math.round(this.layoutAlgo.offsets.getMarginInline());
		this.canvasShape.position.y = Math.round(this.layoutAlgo.offsets.getMarginBlock()) + 44;
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
	var matchedStyles = TypeManager.pendingStyleRegistry.getItem(viewUID);
//	console.log(this.nodeName, this._UID, matchedStyles);
	return matchedStyles ? matchedStyles : [];		// new Style(null, 'dummy', {})
}

LayoutNode.prototype.matchOnMagicalUAStylesheet = function(naiveDOMNodeAsView) {
	var fakeUID = '65635',
		UAStylesFakeNaiveDOM = {
			children : [
				{
					styleRefstartIdx : 0,
					styleRefLength : 0,
					_UID : fakeUID,
					_parentNode : null,
					isShadowHost : false,
					name : '',
					textContent : '',
					views : {
						masterView : naiveDOMNodeAsView,
						subSections : [],
						memberViews : []
					},
					children : [],
					styleDataStructure : null
				}
			]
		};
	var UAStylesheetSolver = new ComputedStyleSolver(UAStylesFakeNaiveDOM, [UAStylesheet, SyntaxHighlightingStylesheet]);
	UAStylesheetSolver.CSSSelectorsMatcher.traverseDOMAndMatchSelectors(
		UAStylesFakeNaiveDOM,
		UAStylesheetSolver.CSSRulesBuffer
	);
	
	UAStylesheetSolver.CSSSelectorsMatcherRefiner.refineMatches(
		UAStylesheetSolver.CSSSelectorsMatcher.matches,
		{
			data : {
				[naiveDOMNodeAsView._UID] : naiveDOMNodeAsView
			},
			getItem : function() {
				return this.data[naiveDOMNodeAsView._UID]
			}
		},
		TypeManager.masterStyleRegistry//,
//		'isUAMatcher'
	);
}

LayoutNode.prototype.populateInheritedStyle = function() {
//	console.log('inherited', this.nodeName);
	this.computedStyle.overridePropertyGroupFromGroupBuffer(
		'inheritedAttributes',
		this._parent.computedStyle.getPropertyGroupAsBuffer('inheritedAttributes'),
		'setFromInherited'
	);
}

LayoutNode.prototype.populateAllComputedStyle = function(matchedStyles) {
	var pFound  = false;
//	if (this.nodeName === 'p') {
//		pFound  = true;
//		console.log(this.nodeName);
//	}
	matchedStyles.sort(this.sortBySpecificity);
	var attrIFace;
	matchedStyles.forEach(function(style) {
//		console.log(style);
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
//	console.log(this.nodeName, valueOfDisplayProp);
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
	
//	console.log(this.nodeName, this._parent.layoutAlgo.algoName);
	if (this._parent.layoutAlgo.algoName === this.displayPropsAsConstants.flex)
		return this.displayPropsAsConstants.inlineBlock;
	else if (valueOfDisplayProp === this.displayPropsAsConstants.inline)
	 	// inline is the initialValue: style may not be explicitly defined -> apply here sort of a user-agent stylesheet for now
		return this.defaultToBrowserDefinedDisplayProp(nodeName);
	else
		return valueOfDisplayProp;
}

LayoutNode.prototype.defaultToBrowserDefinedDisplayProp = function(nodeName) {	// we think of browser-defined default display value as defined in https://www.w3schools.com/css/css_display_visibility.asp & https://stackoverflow.com/questions/13548225/what-is-htmls-a-a-tag-default-display-type
	// commented lines are already handled by the minimalist UA-Stylesheet
	switch (nodeName) {
		case 'body' :
		case 'root-node' :
		case 'div' : 
//		case 'h1' : 
//		case 'h2' : 
//		case 'h3' : 
//		case 'h4' : 
//		case 'h5' : 
//		case 'h6' : 
//		case 'p' : 
//		case 'ul' :
		case 'li' : // we don't support display: list-item for now (and probably ever won't)
		case 'ol' : 
		case 'hr' : 
		case 'form' :
		case 'table' :  
		case 'header' : 
		case 'footer' :
//		case 'pre' :
		case 'code' :						// CODE tags as display:'block' is currently a hack to allow custom rendering of pre tags without supporting line-feeds
		case 'section' : return 'block';
		case 'span' :
		case 'a' : 
		case 'label' :
		case 'input' :
		case 'em' :
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

LayoutNode.prototype.resetBlockingTween = function() {
	this.blockingTween = null;
}

/**
 * @method noOp
 * Useful when animating and not wanting to trigger a cb on some nodes
 */
LayoutNode.prototype.noOp = function() {}









var LinkedLayoutNode = function(sourceDOMNodeAsView, layoutParentNode, previousSiblingLayoutNode, isLastChild) {
	this.isLastChild = isLastChild;
	this._parent = layoutParentNode;
	this.previousSibling = previousSiblingLayoutNode;
	LayoutNode.call(this, sourceDOMNodeAsView, layoutParentNode, null);
	
	this.objectType = 'LinkedLayoutNode';
	this._parent.layoutAlgo.availableSpace.incrementChildCount();
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
//		console.log(this.previousSibling);
		children.splice(0, 0, this.previousSibling);
		this.previousSibling.climbChildrenLinkedListAndCallbackLayoutAlgo(children, callbackName);
	}
	else {
//		if (callbackName === 'handleEffectiveAlignItems')
//			console.error(children);
		children.forEach(function(siblingNode) {
//			console.log(siblingNode, callbackName);
			siblingNode.layoutAlgo[callbackName](siblingNode.dimensions);
		}, this);
	}
}













var FlexEndLayoutNode = function(layoutParentNode, previousSiblingLayoutNode) {
	this._UID = UIDGenerator.newUID();
	TypeManager.layoutNodesRegistry.setItem(this._UID, this);
	
	this.isLastChild = true;
	this._parent = layoutParentNode;
	this.previousSibling = previousSiblingLayoutNode;
	
	this.nodeName = 'flex-end';
	
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
	this.depth = this._parent.depth + 1;
	this.nodeName = sourceDOMNodeAsView.nodeName;
	
	this.textContent = textContent || '';
	this.isTextNode = true;
	
	this.computedStyle = new CSSPropertySetBuffer();

	this.populateInheritedStyle();
//	this.populateAllComputedStyle(this.queryStyleUpdate(sourceDOMNodeAsView));
	
	this.canvasShape = null;
	
	this.layoutAlgo = new TextLayoutAlgo(this, this.textContent);
	// HACK: Standard LayoutAlgo inherit from BaseIntermediateLayoutAlgo
	// For some reason, we didn't do the same fo text nodes.
	// So we have to hadle manually the end of the constructor
	this.layoutAlgo.setRefsToParents(this);
	this.layoutAlgo.cs = new ComputedStyleSimpleGetter(this.layoutAlgo);
	this.layoutAlgo.dimensions = new LayoutDimensionsSimpleGetSet(this, this.layoutAlgo);
	this.layoutAlgo.availableSpace = new LayoutAvailableSpaceGetSet(this, this.layoutAlgo);
	this.layoutAlgo.offsets = new LayoutOffsetsSimpleGetSet(this, this.layoutAlgo);
	
	this.blockingTween;
	
//	console.log(this.nodeName, this._parent.nodeName, this.layoutAlgo.algoName, this.dimensions);
//	console.log(this.nodeName, this._parent.nodeName, this.layoutAlgo.algoName, this.offsets);
}
TextNode.prototype = Object.create(LayoutNode.prototype);
TextNode.prototype.objectType = 'TextNode';








var LayoutRoot = function(dimensionsPairAsArray) {
	this._UID = UIDGenerator.newUID();
	this.depth = 0;
	
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
	var style, attrIFace;
	selectorMatches.forEach(function(result, key) {
		style = masterStyleRegistry.getItem(result[1]);
		attrIFace = style.attrIFace;
		this.computedStyle.overridePropertyGroupFromGroupBuffer(
			'inheritedAttributes',
			attrIFace['inheritedAttributes'].CSSPropertySetBuffer.getPropertyGroupAsBuffer('inheritedAttributes')
		);
//		this.populateAllComputedStyle([masterStyleRegistry.getItem(result[1])]);
	}, this);
}

LayoutRoot.prototype.updateCanvasShapeOffsets = function() {}		// noOp() needed

LayoutRoot.prototype.updateCanvasShapeDimensions = function() {}	// noOp() needed












module.exports = LayoutTreePrepare;