/**
 * Constructor SpecialDependencyInjector
 * 
 * Decorates the HierarchicalComponent's ctor
 * 	adding it some methods to build a "DOM looking" hierarchy.
 * 	We'll be using those methods to construct the NaiveDOM.
 */


var TypeManager = require('src/core/TypeManager');
var Components = require('src/core/Component');





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
	
	function getNode(component) {
//		console.log(Object.getPrototypeOf(component).objectType.slice(0));
		return {
			styleRefstartIdx : 0,
			styleRefLength : 0,
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
	var masterNode = component.view.getMasterNode();
	return {
		masterView : {
			nodeName : masterNode.nodeName.toLowerCase(),
			nodeId : masterNode.id,
			classNames : masterNode.classList	
		},
		memberViews : component.view.subViewsHolder.memberViews.map(function(view) {
			masterNode = view.getMasterNode();
			return {
				nodeName : masterNode.nodeName.toLowerCase(),
				nodeId : masterNode.id,
				classNames : masterNode.classList	
			};
		}),
		subSections : component.view.subViewsHolder.subViews.map(function(view) {
			masterNode = view.getMasterNode();
			return {
				nodeName : masterNode.nodeName.toLowerCase(),
				nodeId : masterNode.id,
				classNames : masterNode.classList	
			};
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