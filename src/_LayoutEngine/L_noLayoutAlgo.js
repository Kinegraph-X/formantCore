/**
 * 
 * constructor NoLayoutAlgo
 *  
 */


//var TypeManager = require('src/core/TypeManager');
var BaseLayoutAlgo = require('src/_LayoutEngine/L_baseLayoutAlgo');



/*
 * 
 */
var NoLayoutAlgo = function(layoutNode) {
	BaseLayoutAlgo.call(this, layoutNode);
	this.objectType = 'NOLayoutAlgo';
	this.algoName = 'none';
	
}

NoLayoutAlgo.prototype = Object.create(BaseLayoutAlgo.prototype);
NoLayoutAlgo.prototype.objectType = 'NoLayoutAlgo';




















module.exports = NoLayoutAlgo;