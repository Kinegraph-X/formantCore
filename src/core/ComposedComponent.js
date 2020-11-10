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
	Components.ComponentWithView.call(this, definition.getHostDef(), parentView);  // feed with host def : "this" shall be assigned the _defUID of the "hostDef"
	this.objectType = 'ComposedComponent';
	
	this.instanciateSubSections(definition);
	this.instanciateMembers(definition);
	
	// But there will be a mess when binding streams from childModules to subViews : hopefully the "stores" would help us...
	
}
ComposedComponent.prototype = Object.create(Components.ComponentWithView.prototype);
ComposedComponent.prototype.objectType = 'ComposedComponent';

ComposedComponent.prototype.instanciateSubSections = function(definition) {
	definition.subSections.forEach(function(subSectionDef) {
		this.instanciateKnownType(subSectionDef);
	}, this);
}

ComposedComponent.prototype.instanciateMembers = function(definition) {
	var hostDef;
	definition.members.forEach(function(memberDef) {
		hostDef = memberDef.getGroupHostDef() ? memberDef.getGroupHostDef() : memberDef.getHostDef();
		if (hostDef.type in componentTypes)
			this.pushChild(new componentTypes[hostDef.type](memberDef, this.view));
		else if (!hostDef.type)
			CoreTypes.viewsRegister.setItem(CoreTypes.idGenerator.newUID(), new CoreTypes.ComponentView(memberDef, this.view));
	}, this);
};

ComposedComponent.prototype.instanciateKnownType = function(def) {
	var hostDef = def.getGroupHostDef() ? def.getGroupHostDef() : def.getHostDef();
	if (hostDef.type in componentTypes)
		return (new componentTypes[hostDef.type](def, this.view));
	else if (!hostDef.type)
		CoreTypes.viewsRegister.setItem(CoreTypes.idGenerator.newUID(), new CoreTypes.ComponentView(def, this.view));
}

componentTypes.ComposedComponent = ComposedComponent;
componentTypes.ComponentWithView = Components.ComponentWithView;
componentTypes.VisibleStateComponent = VisibleStateComponent;


module.exports = ComposedComponent;