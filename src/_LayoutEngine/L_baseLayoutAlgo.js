/**
 * 
 * constructor BaseLayoutAlgo
 *  
 */


//var TypeManager = require('src/core/TypeManager');




/*
 * 
 */
var BaseLayoutAlgo = function(layoutNode) {
	this.objectType = 'BaseLayoutAlgo';
	this.algoName = '';
	this.layoutNode = layoutNode;
	this.availableSpace = this.layoutNode.availableSpace;
}

BaseLayoutAlgo.prototype = {};
BaseLayoutAlgo.prototype.objectType = 'BaseLayoutAlgo';

BaseLayoutAlgo.prototype.setAvailableSpace = function(dimensions) {}

BaseLayoutAlgo.prototype.decrementInlineAvailableSpace = function(amountToSubstract) {}

BaseLayoutAlgo.prototype.setBlockAvailableSpace = function(amountToSubstract) {}

BaseLayoutAlgo.prototype.setOffsets = function() {}							// virtual

BaseLayoutAlgo.prototype.getDimensions = function() {}						// virtual

BaseLayoutAlgo.prototype.setSelfDimensions = function(dimensions) {}		// virtual

BaseLayoutAlgo.prototype.updateParentAvailableSpace = function(dimensions) {}	// virtual

BaseLayoutAlgo.prototype.setParentDimensions = function(dimensions) {}		// virtual

BaseLayoutAlgo.prototype.updateParentDimensions = function(dimensions) {}	// virtual

BaseLayoutAlgo.prototype.getInlineDimension = function() {}					// virtual

BaseLayoutAlgo.prototype.getBlockDimension = function() {}					// virtual

BaseLayoutAlgo.prototype.getPaddings = function() {}						// virtual

BaseLayoutAlgo.prototype.getSummedInlinePaddings = function() {}			// virtual

BaseLayoutAlgo.prototype.getSummedBlockPaddings = function() {}				// virtual

BaseLayoutAlgo.prototype.getMargins = function() {}							// virtual

BaseLayoutAlgo.prototype.getSummedInlineMargins = function() {}				// virtual

BaseLayoutAlgo.prototype.getSummedBlockMargins = function() {}				// virtual

BaseLayoutAlgo.prototype.getBorders = function() {}							// virtual

BaseLayoutAlgo.prototype.getSummedInlineBorders = function() {}				// virtual

BaseLayoutAlgo.prototype.getSummedBlockBorders = function() {}				// virtual

















module.exports = BaseLayoutAlgo;