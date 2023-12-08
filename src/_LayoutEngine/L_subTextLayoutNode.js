/**
 * @constructor L_subTextNode
 */

var TypeManager = require('src/core/TypeManager');
var CSSPropertySetBuffer = require('src/editing/CSSPropertySetBuffer');
var UIDGenerator = require('src/core/UIDGenerator').NodeUIDGenerator;
var SubTextLayoutAlgo = require('src/_LayoutEngine/L_subTextLayoutAlgo');

var ComputedStyleSimpleGetter = require('src/_LayoutEngine/ComputedStyleFastSimpleGetter');
var LayoutDimensionsSimpleGetSet = require('src/_LayoutEngine/LayoutDimensionsSimpleGetSet');
var LayoutOffsetsSimpleGetSet = require('src/_LayoutEngine/LayoutOffsetsSimpleGetSet');

var LayoutAvailableSpaceGetSet = require('src/_LayoutEngine/LayoutAvailableSpaceGetSet');
var LayoutDimensionsGetSet = require('src/_LayoutEngine/LayoutDimensionsGetSet');
var LayoutOffsetsGetSet = require('src/_LayoutEngine/LayoutOffsetsGetSet');

var CanvasTypes = require('src/_LayoutEngine/WebCanvasCoreTypes');

/**
 * @constructor SubTextNode
 * @param {LayoutNode} layoutParentNode
 * @param {String} textContent;
 */
var SubTextNode = function(layoutParentNode, textContent, parentAvailableSpace) {
	this._UID = UIDGenerator.newUID();
	TypeManager.layoutNodesRegistry.setItem(this._UID, this);
	this.depth = layoutParentNode.depth + 1;
	
	this._parent = layoutParentNode;
	//FIXME: check usage and delete (eventually removing usage)
	this.nodeName = 'subTextNode';
	this.objectType = 'SubTextNode';
	this.textContent = textContent || '';
	
	this.computedStyle = new CSSPropertySetBuffer();
	this.populateInheritedStyle();
	
	this.canvasShape = null;
	
//	console.log('parentAvailableSpace', parentAvailableSpace);
	this.layoutAlgo = new SubTextLayoutAlgo(this, this.textContent, parentAvailableSpace);
	
	// HACK: Standard LayoutAlgo inherit from BaseIntermediateLayoutAlgo
	// For some reason, we didn't do the same fo text nodes.
	// So we have to hadle manually the end of the constructor
	this.layoutAlgo.setRefsToParents(this);
	this.layoutAlgo.cs = new ComputedStyleSimpleGetter(this.layoutAlgo);
	this.layoutAlgo.dimensions = new LayoutDimensionsSimpleGetSet(this, this.layoutAlgo);
	this.layoutAlgo.availableSpace = new LayoutAvailableSpaceGetSet(this, this.layoutAlgo);
	this.layoutAlgo.offsets = new LayoutOffsetsSimpleGetSet(this, this.layoutAlgo);
	
	this.blockingTween;
	
	// Following of the HACK: As SubTextNodes are instantiatied during the rendering
	// we have to trigger manually the rendering, and ALSO have to do it
	// outside of the LayoutAlgo, as the constructor
	// of SubTextLayoutAlgo doesn't do the whole job
	return {
		bounds : this.layoutAlgo.executeLayout()
	};
	
//	console.log(this.nodeName, this._parent.nodeName, this.layoutAlgo.algoName, this.dimensions);
//	console.log(this.nodeName, this._parent.nodeName, this.layoutAlgo.algoName, this.offsets);
}
//SubTextNode.prototype = {};
SubTextNode.prototype.objectType = 'SubTextNode';

SubTextNode.prototype.populateInheritedStyle = function() {
//	console.log('inherited', this.nodeName);
	this.computedStyle.overridePropertyGroupFromGroupBuffer(
		'inheritedAttributes',
		this._parent.computedStyle.getPropertyGroupAsBuffer('inheritedAttributes')
	);
}

SubTextNode.prototype.getCanvasShape = function() {
//	var fillColor = this.computedStyle.getTokenTypeForPropAsConstant('backgroundColor') === CSSPropertyBuffer.prototype.TokenTypes.HashToken
//		// OPTIMIZATION: parseInt('0x' + )... can be replaced by a hash-prefixed hexa string
//		? parseInt('0x' + this.computedStyle.getPropAsString('backgroundColor').slice(1, 7))
//		// light-blue shall mean 'transparent' when debugging
//		: 0xAACCFF;
//	var fillAlpha = this.computedStyle.getTokenTypeForPropAsConstant('backgroundColor') === CSSPropertyBuffer.prototype.TokenTypes.IdentToken
//		? 0
//		: 1;
//	
//	// FIXME: allow having a different border-style for each side of the box
//	var lineColor = this.computedStyle.getTokenTypeForPropAsConstant('borderBlockStartColor') === CSSPropertyBuffer.prototype.TokenTypes.HashToken
//		? parseInt('0x' + this.computedStyle.getPropAsString('borderBlockStartColor').slice(1, 7))
//		// light-blue shall mean 'transparent' when debugging
//		: 0xAACCFF;
//		
//	// FIXME: allow having a different border-style for each side of the box
//	var borderWidth = this.computedStyle.getPropAsNumber('borderBlockStartWidth');
	
	var canvasShape = new CanvasTypes._text(
		this.textContent.replace(' ', String.fromCharCode(160)),	// inconsistant bug in PIXI when content has a leading space
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

	TypeManager.rasterShapesRegistry.setItem(UIDGenerator.newUID(), canvasShape);
	
	return canvasShape;
}
SubTextNode.prototype.updateCanvasShapeOffsets = function() {
	this.canvasShape.position.x = Math.round(this.layoutAlgo.offsets.getMarginInline());
	this.canvasShape.position.y = Math.round(this.layoutAlgo.offsets.getMarginBlock());
	this.canvasShape.reDraw();
}

SubTextNode.prototype.updateCanvasShapeDimensions = function() {
	this.canvasShape.size.width = Math.round(this.layoutAlgo.dimensions.getBorderInline());
	this.canvasShape.size.height = Math.round(this.layoutAlgo.dimensions.getBorderBlock());
	this.canvasShape.reDraw();
}

SubTextNode.prototype.resetBlockingTween = function() {
	this.blockingTween = null;
}





module.exports = SubTextNode;