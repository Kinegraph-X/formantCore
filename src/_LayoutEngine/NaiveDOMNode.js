/**
 * Constructor NaiveDOMNode
 * 
 * 
 */


var TypeManager = require('src/core/TypeManager');
var CoreTypes = require('src/core/CoreTypes');
var Components = require('src/core/Component');
var UIDGenerator = require('src/core/UIDGenerator').UIDGenerator;





var NaiveDOMNode = function(view, hierarchicalDepth, hostNode, hostView, subNodesGroup) {
	this.objectType = 'NaiveDOMNode';
	
	var masterNode = view.getMasterNode();
	
	this._parentNode = this.getParentNode(view, hierarchicalDepth, hostNode, hostView, subNodesGroup);
	this._UID = UIDGenerator.newUID();
	this.nodeName = masterNode.nodeName.toLowerCase();
	this.nodeId = masterNode.id;
	this.classNames = masterNode.classList.values();
	this.attributes = new CoreTypes.ListOfPairs(masterNode.attributes);
	
	this.computedStyle = null;
	
	TypeManager.naiveDOMRegistry.setItem(
		this._UID,
		this
	);
}
NaiveDOMNode.prototype = {};
NaiveDOMNode.prototype.objectType = 'NaiveDOMNode';

NaiveDOMNode.prototype.hasAttributes = function() {
	return this.attributes.length !== 0;
}

NaiveDOMNode.prototype.getParentNode = function(view, hierarchicalDepth, hostNode, hostView, subNodesGroup) {
	switch(hierarchicalDepth) {
		case 0 : 
			return null;
		case 1 :
			return hostNode;
		case 2 :
			return subNodesGroup.length
				? subNodesGroup[hostView.subViewsHolder.subSections.indexOf(view.parentView)]
				: hostNode;
	}
}





















module.exports = NaiveDOMNode;