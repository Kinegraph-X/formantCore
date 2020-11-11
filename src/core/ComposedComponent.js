/**
 * @constructor ComposedComponent
 */

var TypeManager = require('src/core/TypeManager');
var CoreTypes = require('src/core/CoreTypes');
var Components = require('src/core/Component');
var VisibleStateComponent = require('src/UI/Generics/VisibleStateComponent');

var componentTypes = require('src/UI/_build_helpers/_UIpackages')(null, {UIpackage : '%%UIpackage%%'}).packageList;
Object.assign(componentTypes, require(componentTypes.misc));
for (let type in componentTypes) {
	if (typeof componentTypes[type] === 'string' && type !== 'misc')
		componentTypes[type] = require(componentTypes[type]);
}




/**
 * @constructor ComposedComponent
 */
var ComposedComponent = function(definition, parentView) {
//	console.log(definition);
	var shouldExtend = false;
	
	// Hack the def now, for the view to be instanciated with the correct context (knowing how many subSections we have is crucial when connecting children)
	// This prevents us from instanciating a Component with subViews as the "host" of a composedComponent : No matter, that case wouldn't make much sense, though.
	// (It's hard to implement that in the Type factory, as the "composed" definition, with its 2 levels of depth on the "host", is an exception)
	// (That shouldn't be a too big issue, seen that building the hierarchy comes before the intensive processing : 
	// 	the def may be mutated here, given the fact that we pay a strong attention on it not being changed later)
	definition.subSections.forEach(function(section) {
		definition.getHostDef().subSections.push(null);
	});
	
	// Another Hack to integrate the "host" of the def in that "composedComponent" (which is pretty "unfruity" : it has very few methods defining its behavior) :
	// assuming we don't want to instanciate "in da space" (i.e. "in that present ctor") a whole Component, and have to reflect all of its props on "self",
	// we call the "superior" ComponentWithView ctor on the def of sole the host (5 lines below)
	// BUT beforehand, we reflect on "self" the "createDefaultDef" method defined on the prototype of the host, then it shall be called by the AbstractComponent ctor
	// (from which we inherit, though : the "composedComponent" is not so "pretty unfruity").
	// Exception, (shall) obviously (be) : if there is -no- createDefaultDef method on that Component which whant to be "host" on the throne of the "host"...
	if (definition.getGroupHostDef().getType() && definition.getGroupHostDef().getType() !== 'ComposedComponent' && componentTypes[definition.getGroupHostDef().getType()].prototype.createDefaultDef)
		this.createDefaultDef = componentTypes[definition.getGroupHostDef().getType()].prototype.createDefaultDef;
	
	if (!TypeManager.definitionsCacheRegister.getItem(definition.getGroupHostDef().UID)) // this shall be always true after having called the superior ctor (although def is "explicit+default" without "special")
		shouldExtend = true;
	
	Components.ComponentWithView.call(this, definition.getHostDef(), parentView, this);  // feed with host def : "this" shall be assigned the _defUID of the "hostDef"
	this.objectType = 'ComposedComponent';
	
	// extend last, so the event bubbling occurs always after the "local" callbacks
	if (shouldExtend)
		this.extendDefinition(definition);
	
	this.instanciateSubSections(definition);
	this.instanciateMembers(definition);
	
	// But there will be a mess when binding streams from childModules to subViews : hopefully the "stores" would help us...
	
}
ComposedComponent.prototype = Object.create(Components.ComponentWithView.prototype);
ComposedComponent.prototype.objectType = 'ComposedComponent';

ComposedComponent.prototype.extendDefinition = function(definition) {
	// Special case : "update" events may bubble from ComposedComponent to ComposedComponent
	definition.getGroupHostDef().subscribeOnChild.push(
		(new TypeManager.EventSubscriptionModel({
				on : 'update',
				subscribe : function(e) {
					if (e.bubble)
						this.trigger('update', e.data, true);
				}
			})
		)
	);
}

ComposedComponent.prototype.instanciateSubSections = function(definition) {
	var hostDef, component;
	definition.subSections.forEach(function(subSectionDef) {
		hostDef = subSectionDef.getHostDef();
		if (hostDef.type in componentTypes) {
			component = new componentTypes[hostDef.type](subSectionDef, this.view, this, 'isChildOfRoot');
			component._parent = this;
			// usefull for appending memberViews on subViews without having to traverse the components hierarchy
			this.view.subViewsHolder.subViews.push(component.view);
		}
		else if (!hostDef.type)
			this.view.subViewsHolder.subViews.push(new CoreTypes.ComponentView(subSectionDef, this.view, this, 'isChildOfRoot'));
	}, this);
}

ComposedComponent.prototype.instanciateMembers = function(definition) {
	var hostDef, component;
	definition.members.forEach(function(memberDef) {
		hostDef = memberDef.getGroupHostDef() ? memberDef.getGroupHostDef() : memberDef.getHostDef();
		if (hostDef.type in componentTypes) {
			this.pushChild((component = new componentTypes[hostDef.type](memberDef, this.view, this)));
//			this.view.subViewsHolder.memberViews.push(component.view);
		}
		else if (!hostDef.type)
			this.view.subViewsHolder.memberViews.push(new CoreTypes.ComponentView(memberDef, this.view, this), this.view);
	}, this);
};









/**
 * @constructor ComponentList
 */
var ComponentList = function(definition, parentView, parent) {
	Components.HierarchicalObject.call(this);
	this.objectType = 'ComponentList';
	this._parent = parent;
	this.iterateOnModel(definition, parentView);
}
ComponentList.prototype = Object.create(Components.HierarchicalObject.prototype);
ComponentList.prototype.objectType = 'ComponentList';

ComponentList.prototype.iterateOnModel = function(definition, parentView) {
	
	var def = definition.getHostDef().template, composedComponent;

	definition.getHostDef().each.forEach(function(item, key) {

		if (definition.getHostDef().template.getGroupHostDef())
			this._parent.pushChild((composedComponent = new ComposedComponent(def, this._parent.view)), def);
		else
			this._parent.pushChild((composedComponent = new ComposedComponent.prototype.types.GenericComponent(def, this._parent.view)), def);
		
		TypeManager.dataStoreRegister.setItem(composedComponent._UID, key);
	}, this);
	
//	console.log(this);
}
ComposedComponent.prototype.ComponentList = ComponentList;










componentTypes.ComposedComponent = ComposedComponent;
componentTypes.ComponentList = ComponentList;
componentTypes.ComponentWithView = Components.ComponentWithView;
componentTypes.VisibleStateComponent = VisibleStateComponent;


module.exports = ComposedComponent;