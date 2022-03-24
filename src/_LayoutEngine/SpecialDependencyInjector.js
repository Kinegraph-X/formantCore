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
	function getNode(component) {
		return {
				styleRefstartIdx : 0,
				styleRefLength : 0,
				_UID : nodeUID,
				isShadowHost : component.view.currentViewAPI ? component.view.currentViewAPI.isShadowHost : false,
				name : Object.getPrototypeOf(component).objectType.slice(0),
				views : this.getInDepthViewStructure(component),
				children : [],
				styleDataStructure : component.styleHook ? component.styleHook.s : null
			};
//		var meta = this.getViewRelatedNodeDescription(component);
	}
	var ret = getNode.call(this, this);
	this.collectNaiveDOMandStyleInDescendants(this, ret, getNode.bind(this));
	return ret;
}

SpecialDependencyInjector.prototype.collectNaiveDOMandStyleInDescendants = function (component, componentTree, getNode) {
	var node;
	component._children.forEach(function(child) {
		node = getNode(child);
		if (Array.isArray(child._children) && child._children.length) {
			componentTree.children.push(this.collectNaiveDOMandStyleInDescendants(child, node, getNode));
		}
		else {
			componentTree.children.push(node);
		}
	}, this);

	return componentTree;
}

SpecialDependencyInjector.prototype.getInDepthViewStructure = function (component) {
	var hostNode, subNodesGroup;
	return {
		masterView : (hostNode = new NaiveDOMNode(component.view, 0)),
		subSections : (subNodesGroup = component.view.subViewsHolder.subViews.map(function(view) {
			return new NaiveDOMNode(view, 1, hostNode, component.view);
		})),
		memberViews : component.view.subViewsHolder.memberViews.map(function(view) {
//			console.log(component.view);
			return new NaiveDOMNode(view, 2, hostNode, component.view, subNodesGroup);
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