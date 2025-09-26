/**
 * @module CachedNodes
 */


/**
 * Node Type for corresponding registry
 * @param {string} nodeName
 * @param {boolean} isCustomElem
 */
const CachedNode = function(nodeName, isCustomElem) {
	
	this.nodeName = nodeName;
	this.isCustomElem = isCustomElem;
	this.cloneMother = null;
}
CachedNode.prototype.objectType = 'CachedNode';





module.exports = CachedNode;