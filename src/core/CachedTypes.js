/**
 * @factory CachedTypes
 */








/**
 * Node TYPE for typedCache
 */
var CachedNode = function(nodeName, isCustomElem) {
	
	this.nodeName = nodeName;
	this.isCustomElem = isCustomElem;
	this.cloneMother = null;
}
CachedNode.prototype = {};
Object.defineProperty(CachedNode.prototype, 'objectType', {
	value :  'CachedNode'
});





module.exports = {
	CachedNode : CachedNode
}