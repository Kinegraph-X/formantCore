/**
 * @factory CachedTypes
 */








/**
 * Node TYPE for typedCache
 */
var CachedNode = function(nodeName) {
	
	this.nodeName = nodeName;
	this.cloneMother = null;
}
CachedNode.prototype = {};
Object.defineProperty(CachedNode.prototype, 'objectType', {
	value :  'CachedNode'
});





module.exports = {
	CachedNode : CachedNode
}