/**
 * Constructor NaiveDOMNode
 * 
 * 
 */


var TypeManager = require('src/core/TypeManager');
var CoreTypes = require('src/core/CoreTypes');
var Components = require('src/core/Component');
var UIDGenerator = require('src/core/UIDGenerator').UIDGenerator;




/*
 * constructor NaiveDOMNode
 * 
 * All is conditionned on the presence of the view Object as the layoutTreePrepare is using this constructor
 * to build a "viewport" layoutNode
 */
var NaiveDOMNode = function(viewWrapper, view, hierarchicalDepth, hostNode, hostView, subNodesGroup) {
	this.objectType = 'NaiveDOMNode';
	
	var masterNode = view ? view.getMasterNode() : null;
//	console.log(masterNode);
	this._viewWrapper = viewWrapper;
	this._parentView = view ? this.getParentView(view, hierarchicalDepth, hostNode, hostView, subNodesGroup) : null;
	this._UID = UIDGenerator.newUID();
	
	this.nodeName = view ? masterNode.nodeName.toLowerCase() : null;
	this.nodeId = view ? masterNode.id : null;
	this.classNames = view ? Object.values(masterNode.classList) : null;
	if (view) {
		this.attributes = new CoreTypes.ListOfPairs(masterNode.attributes);
//		console.log(masterNode.textContent);
		if (masterNode.textContent.length)
			this.attributes.push(new CoreTypes.Pair(
				'textContent',
				masterNode.textContent
			));
	}
	else
		this.attributes = new CoreTypes.ListOfPairs({});
	
//	this.computedStyle = null;
	
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

NaiveDOMNode.prototype.getParentView = function(view, hierarchicalDepth, hostNode, hostView, subNodesGroup) {
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