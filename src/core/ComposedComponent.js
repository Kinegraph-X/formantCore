/**
 * @constructor ComposedComponent
 */


var CoreTypes = require('src/core/CoreTypes');
var Components = require('src/core/Component');
var VisibleStateComponent = require('src/UI/Generics/VisibleStateComponent');

var componentTypes = require('src/UI/_build_helpers/_UIpackages')(null, {UIpackage : '%%UIpackage%%'}).packageList;
for (let type in componentTypes) {
	componentTypes[type] = require(componentTypes[type]);
}


var ComposedComponent = function(definition, parentView) {
//	console.log(definition);
	
	// Hack the def now, for the view to be instanciated with the correct context (knowing how many subSections we have is crucial when connecting children)
	// This prevents us from instanciating a Component with subViews as the "host" of a composedComponent. But that case wouldn't make much sense, though.
	// (It's hard to implement that in the Type factory, as the composed definition, with its 2 levels of depth on the "host", is an exception)
	// (That shouldn't be a too big issue, seen that building the hierarchy comes before the intensive processing : 
	// 	the def may be mutated here, given the fact that we pay a strong attention on it not being changed later)
	definition.subSections.forEach(function(section) {
		definition.getHostDef().subSections.push(null);
	});
	
	Components.ComponentWithView.call(this, definition.getHostDef(), parentView);  // feed with host def : "this" shall be assigned the _defUID of the "hostDef"
	this.objectType = 'ComposedComponent';
	
	this.instanciateSubSections(definition);
	this.instanciateMembers(definition);
	
	// But there will be a mess when binding streams from childModules to subViews : hopefully the "stores" would help us...
	
}
ComposedComponent.prototype = Object.create(Components.ComponentWithView.prototype);
ComposedComponent.prototype.objectType = 'ComposedComponent';

ComposedComponent.prototype.instanciateSubSections = function(definition) {
	var hostDef, component;
	definition.subSections.forEach(function(subSectionDef) {
		hostDef = subSectionDef.getHostDef();
		if (hostDef.type in componentTypes) {
			component = new componentTypes[hostDef.type](subSectionDef, this.view, 'isChildOfRoot');
			component._parent = this;
//			this.view.subViewsHolder.subViews.push(component.view);
		}
		else if (!hostDef.type)
			this.view.subViewsHolder.subViews.push(new CoreTypes.ComponentView(subSectionDef, this.view, 'isChildOfRoot'));
	}, this);
}

ComposedComponent.prototype.instanciateMembers = function(definition) {
	var hostDef, component;
	definition.members.forEach(function(memberDef) {
		hostDef = memberDef.getGroupHostDef() ? memberDef.getGroupHostDef() : memberDef.getHostDef();
		if (hostDef.type in componentTypes) {
			this.pushChild((component = new componentTypes[hostDef.type](memberDef, this.view)));
//			this.view.subViewsHolder.memberViews.push(component.view);
		}
		else if (!hostDef.type)
			this.view.subViewsHolder.memberViews.push(new CoreTypes.ComponentView(memberDef, this.view), this.view);
	}, this);
};


componentTypes.ComposedComponent = ComposedComponent;
componentTypes.ComponentWithView = Components.ComponentWithView;
componentTypes.VisibleStateComponent = VisibleStateComponent;


module.exports = ComposedComponent;