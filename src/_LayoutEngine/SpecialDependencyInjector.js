/**
 * Constructor SpecialDependencyInjector
 * 
 * Decorates the HierarchicalComponent's ctor
 * 	adding it some methods to build a "DOM looking" hierarchy.
 * 	We'll be using those methods to construct the NaiveDOM.
 */


var TypeManager = require('src/core/TypeManager');
var Components = require('src/core/Component');
//var UIDGenerator = require('src/core/UIDGenerator').UIDGenerator;

var NaiveDOMNode = require('src/_LayoutEngine/NaiveDOMNode');


// NOTE: should not be a ctor, but helper functions
// to be conditionnaly required / called in dependencyInjector.js
// (actual implementation is very similar to that, making no use of the following ctor)
var SpecialDependencyInjector = function(rootComponent) {
	
}
SpecialDependencyInjector.prototype = {};

SpecialDependencyInjector.prototype.getNaiveDOM = function() {
	return this.getNaiveDOMTree();
}

SpecialDependencyInjector.prototype.getNaiveDOMTree = function () {
	var nodeUID;
	function getNode(component, parentNode) {
		var node = {
			styleRefstartIdx : 0,
			styleRefLength : 0,
			_UID : component._UID,
			_parentNode : parentNode,
			isShadowHost : component.view.currentViewAPI ? component.view.currentViewAPI.isShadowHost : false,
			name : Object.getPrototypeOf(component).objectType.slice(0),
			textContent : TypeManager.caches.attributes.getItem(component._defUID).getObjectValueByKey('textContent') || '',
			views : {},
			children : [],
			styleDataStructure : component.styleHook ? component.styleHook.s : null
		};
		node.views = this.getInDepthViewStructure(component, node);
		return node;
//		var meta = this.getViewRelatedNodeDescription(component);
	}
	var ret = getNode.call(this, this);
	this.collectNaiveDOMandStyleInDescendants(this, ret, getNode.bind(this));
	return ret;
}

SpecialDependencyInjector.prototype.collectNaiveDOMandStyleInDescendants = function (component, componentTreeParent, getNode) {
	var node;
	component._children.forEach(function(child) {
		node = getNode(child, componentTreeParent);
		if (Array.isArray(child._children) && child._children.length) {
			componentTreeParent.children.push(this.collectNaiveDOMandStyleInDescendants(child, node, getNode));
		}
		else {
			componentTreeParent.children.push(node);
		}
	}, this);

	return componentTreeParent;
}

SpecialDependencyInjector.prototype.getInDepthViewStructure = function (component, viewsWrapper) {
	var hostNode, subNodesGroup;
	return {
		masterView : (hostNode = new NaiveDOMNode(viewsWrapper, component.view, 0)),
		subSections : (subNodesGroup = component.view.subViewsHolder.subViews.map(function(view) {
			return new NaiveDOMNode(viewsWrapper, view, 1, hostNode, component.view);
		})),
		memberViews : component.view.subViewsHolder.memberViews.map(function(view) {
//			console.log(component.view);
			return new NaiveDOMNode(viewsWrapper, view, 2, hostNode, component.view, subNodesGroup);
		})
	};
}

//SpecialDependencyInjector.prototype.getViewRelatedNodeDescription = function (view) {
//	var masterNode = view.getMasterNode();
//	
//	return {
//		nodeName : masterNode.nodeName,
//		nodeId : masterNode.Id,
//		classNames : masterNode.classList
//	};
//}






module.exports = SpecialDependencyInjector;