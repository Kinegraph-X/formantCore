/**
 * constructor FlatTypeTree
 * 
 * A possibly, or at least partially, immutable data-structure
 */

var TypeManager = require('src/core/TypeManager');

// Not implemented any time: for archive purpose.
// Filter unoccupied positions using branchless filtering
// https://www.yumpu.com/en/document/read/42229757/branchless-vectorized-median-filtering
// Find the next occupied pos by recursively solving the nextIsEmpty equality
// through the implicit following test:
// var shallRecurse = [functionThatRecurses, noOpFunction]
// function implicitTest(boolAsNumber) {return shallRecurse[boolAsNumber];}
// return (implicitTest((0 !== Math.min(++jumpLength, occupancy[++currentPos])).toNumber()).call(null);
// starting at jumpLength = 1




var FlatTypeTree = function(memoryBufferStack) {
	this.objectType = 'FlatTypeTree';
	
	this.addrSpace = memoryBufferStack;
	this.map = {};
}

FlatTypeTree.prototype = {};
FlatTypeTree.prototype.objectType = 'FlatTypeTree';









var FlatTreeNode = function(parentAddr, addr, size) {
	this.objectType = 'FlatTreeNode';
	
	this.up = parentAddr;
	this.ref = new NodeAddress(addr, size);
}

FlatTreeNode.prototype = {};
FlatTreeNode.prototype.objectType = 'FlatTreeNode';








var NodeAddress = function(addr, size) {
	this.objectType = 'FlatTreeNode';
	
	this.addr = 0;
	this.size = 0;
}

FlatTreeNode.prototype = {};
FlatTreeNode.prototype.objectType = 'FlatTreeNode';











module.exports = FlatTypeTree;