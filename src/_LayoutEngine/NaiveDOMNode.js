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
var NaiveDOMNode = function(viewWrapper, view, hierarchicalDepth, _defUID, hostNode, hostView, subNodesGroup) {
	this.objectType = 'NaiveDOMNode';
	this.hasBeenSeenForLayout = false;
//	console.log(view.currentViewAPI, view);
	var masterNode = view ? view.getMasterNode() : null;
	
	this._viewWrapper = viewWrapper;
	this._parentView = view ? this.getParentView(view, hierarchicalDepth, hostNode, hostView, subNodesGroup) : null;
	this._UID = UIDGenerator.newUID();
	
	this.nodeName = view ? masterNode.nodeName.toLowerCase() : null;
	this.nodeId = view ? masterNode.id : null;
	this.section = view 
					? view.section === null ? '0' : view.section.toString()
					: '0';
	this.classNames = view ? Object.values(masterNode.classList) : null;
	if (view) {
		var textContent,
			href;
		this.attributes = new CoreTypes.ListOfPairs();//masterNode.attributes);
//		console.log(masterNode.textContent);
		if (viewWrapper.textContent.length)
			this.attributes.push(new CoreTypes.Pair(
				'textContent',
				viewWrapper.textContent
			));
		else if ((textContent = TypeManager.caches.attributes.getItem(view._defUID).getObjectValueByKey('textContent'))) {
			this.attributes.push(new CoreTypes.Pair(
				'textContent',
				textContent
			));
		}
		else if ((textContent = view.getTextContent()) !== '') {
			this.attributes.push(new CoreTypes.Pair(
				'textContent',
				textContent
			));
		}
		
		if (hierarchicalDepth === 0) {
//			console.log(_defUID, TypeManager.caches['attributes'].getItem(_defUID).getObjectValueByKey('href'));
			if ((href = TypeManager.caches['attributes'].getItem(_defUID).getObjectValueByKey('href')))
				this.attributes.push(new CoreTypes.Pair(
					'href',
					href
				));
		}
//		console.log(this.attributes);
	}
	else
		this.attributes = new CoreTypes.ListOfPairs();
	
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