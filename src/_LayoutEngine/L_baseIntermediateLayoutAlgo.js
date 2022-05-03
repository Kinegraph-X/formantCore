/**
 * 
 * constructor BaseIntermediateLayoutAlgo
 *  
 */


var TypeManager = require('src/core/TypeManager');
var BaseLayoutAlgo = require('src/_LayoutEngine/L_baseLayoutAlgo');
var LayoutTypes = require('src/_LayoutEngine/LayoutTypes');
var UIDGenerator = require('src/core/UIDGenerator').NodeUIDGenerator;

var ComputedStyleGetter = require('src/_LayoutEngine/ComputedStyleGetter');
var LayoutAvailableSpaceGetSet = require('src/_LayoutEngine/LayoutAvailableSpaceGetSet');
var LayoutDimensionsGetSet = require('src/_LayoutEngine/LayoutDimensionsGetSet');
var LayoutOffsetsGetSet = require('src/_LayoutEngine/LayoutOffsetsGetSet');

/*
 * 
 */
var BaseIntermediateLayoutAlgo = function(layoutNode) {
	BaseLayoutAlgo.call(this, layoutNode);
	this.objectType = 'BaseIntermediateLayoutAlgo';
	
	this.setRefsToParents(layoutNode);
	
	this.cs = new ComputedStyleGetter(this);
	this.dimensions = new LayoutDimensionsGetSet(layoutNode, this);
	this.availableSpace = new LayoutAvailableSpaceGetSet(layoutNode, this);
	this.offsets = new LayoutOffsetsGetSet(layoutNode, this);
	
	// EXPLICIT DIMENSIONS
	this.hasExplicitWidth = this.getHasExplicitWidth();
	this.hasExplicitHeight = this.getHasExplicitHeight();
	// IS FLEX CHILD
	this.isFlexChild = false;
	this.isIndirectFlexChild = false;
	this.shouldGrow = this.getShouldGrow();
	this.shouldShrink = this.getShouldShrink();
	// PSEUDO-VIRTUAL FUNCTIONS
	this.setFlexDimensions = function() {};
	this.setParentDimensions = function() {};
	this.updateParentDimensions = function() {};
}

BaseIntermediateLayoutAlgo.prototype = Object.create(BaseLayoutAlgo.prototype);
BaseIntermediateLayoutAlgo.prototype.objectType = 'BaseIntermediateLayoutAlgo';
















module.exports = BaseIntermediateLayoutAlgo;