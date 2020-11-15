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
	
	// Let's use an elementary and perf efficient hack right here, at the beginning, and abuse the ascendant component with a symbolic def,
	// for the view to be instanciated with the correct context (knowing how many subSections we have is crucial when connecting children)
	// This prevents us from instanciating a Component with subViews as the "host" of a composedComponent : No matter at all, cause that case wouldn't make much sense, though.
	// (It's hard to implement that in the Type factory, as the "composed" definition, with its 2 levels of depth on the "host", is an exception)
	// (That shouldn't be a too big issue, seen that building the hierarchy comes before the intensive processing : 
	// 	the def may be mutated here, given the fact that we pay a strong attention on it not being changed later)
	definition.subSections.forEach(function(section) {
		definition.getHostDef().subSections.push(null);
	});
	
	if (!TypeManager.definitionsCacheRegister.getItem(definition.getGroupHostDef().UID)) // this shall always fail after having called "once for all" the superior ctor (although def is "explicit+default", and "special" is added afterwards: see extendDefinition())
		shouldExtend = true;
	
	// Another elementary Hack to integrate parts of the "host" of the def in that "composedComponent" (which is pretty "unfruity", not having any "applicative" behavior) :
	// assuming we don't want to instanciate "in da space" (i.e. "in that present ctor") a whole Component, and have to reflect all of its props on "self",
	// we call the "superior" ComponentWithView ctor on the def of solely the host (5 lines below)
	// BUT beforehand, we reflect on "self" the "createDefaultDef" method defined on the prototype of the host, then it shall be called by the AbstractComponent ctor
	// (from which we inherit).
	// Exception, (shall) obviously (be) : if there is -no- createDefaultDef method on that Component which whant to be "host" on the throne of the "host"...
	//
	// -> See the SinglePassExtensibleComposedComponent ctor for a wider extension methodology
	if (definition.getGroupHostDef().getType() && componentTypes[definition.getGroupHostDef().getType()].prototype.createDefaultDef) {
		this.createDefaultDef = componentTypes[definition.getGroupHostDef().getType()].prototype.createDefaultDef;
	}

	
	Components.ComponentWithView.call(this, definition.getHostDef(), parentView, this);  // feed with host def : "this" shall be assigned the _defUID of the "hostDef"
	this.objectType = 'ComposedComponent';
	
	// extend last, so the event bubbling occurs always after the "explicitly defined in the host's def" callbacks
	if (shouldExtend)
		this.extendDefinition(definition);
	
	this.instanciateSubSections(definition);
	this.instanciateMembers(definition);
	this.instanciateLists(definition);
	
}
ComposedComponent.prototype = Object.create(Components.ComponentWithView.prototype);
ComposedComponent.prototype.objectType = 'ComposedComponent';

ComposedComponent.prototype.extendDefinition = function(definition) {
	// Special case : events of type "update" shall have the ability to bubble from ComposedComponent to ComposedComponent
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
	var type, component;
	definition.subSections.forEach(function(subSectionDef) {
		type = subSectionDef.getHostDef().getType();
		if (type in componentTypes) {
			component = new componentTypes[type](subSectionDef, this.view, this, 'isChildOfRoot');
			component._parent = this;
			// mandatory, as we need to append memberViews on subViews without accessing the component's scope
			this.view.subViewsHolder.subViews.push(component.view);
		}
		else if (subSectionDef.getHostDef().nodeName)
			this.view.subViewsHolder.subViews.push(new CoreTypes.ComponentView(subSectionDef, this.view, this, 'isChildOfRoot'));
	}, this);
}

ComposedComponent.prototype.instanciateMembers = function(definition) {
	var type;
	definition.members.forEach(function(memberDef) {
		type = memberDef.getHostDef().getType() || (memberDef.getGroupHostDef() && memberDef.getGroupHostDef().getType());
		if (type in componentTypes)
			this.pushChild(new componentTypes[type](memberDef, this.view, this));
		else if (memberDef.getHostDef().nodeName)
			this.view.subViewsHolder.memberViews.push(new CoreTypes.ComponentView(memberDef, this.view, this), this.view);
	}, this);
};

ComposedComponent.prototype.instanciateLists = function(definition) {
	definition.lists.forEach(function(listDef) {
		new ComponentList(listDef, this.view, this);
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

//		if (definition.getHostDef().template.getGroupHostDef())
			this._parent.pushChild((composedComponent = new ComposedComponent(def, this._parent.view)), def);
//		else
//			this._parent.pushChild((composedComponent = new ComposedComponent.prototype.types.GenericComponent(def, this._parent.view)), def);
		
		TypeManager.dataStoreRegister.setItem(composedComponent._UID, key);
	}, this);
	
//	console.log(this);
}
ComposedComponent.prototype.ComponentList = ComponentList;		// used in AppIgnition.List (as a "life-saving" safety, we wan't to avoid declaring the ComponentList as a "known" Component)











/**
 * @constructor SinglePassExtensibleComposedComponent
 */
var SinglePassExtensibleComposedComponent = function(definition, parentView) {
//	console.log(definition, definition.getGroupHostDef().getType(), componentTypes[definition.getGroupHostDef().getType()]);
	
	if (definition.getGroupHostDef().getType() && componentTypes[definition.getGroupHostDef().getType()]) {
		
		// -NOT SO- UGLY HACK to merge the inherited prototype : TODO: maybe find a more elegant call for that mixin ...
		// 		=> mergeOwnProperties() is able to do that : explore and try to limit the depth of the merging pass...
		this.mergeOwnProperties(this.__proto__, componentTypes[definition.getGroupHostDef().getType()].prototype);
	}
	
//	ComposedComponent.call(this, definition, parentView);
	
	// This is for now the only method called by the ComponentWithHooks ctor (the type from which we inherit) :
	// 		=> bypass the cascade of ctors by calling just this one
	// (the cascade already happened in the ComposedComponent ctor)
	this.viewExtend(definition);
	
	// And at last, something can happen in the ctor of the type given in the definition
	componentTypes[definition.getGroupHostDef().getType()].call(this, definition, parentView);
}
//SinglePassExtensibleComposedComponent.prototype = Object.create(ComposedComponent.prototype);
//Object.assign(SinglePassExtensibleComposedComponent.prototype, ComposedComponent.prototype);
//SinglePassExtensibleComposedComponent.prototype.objectType = 'SinglePassExtensibleComposedComponent';
















componentTypes.ComposedComponent = ComposedComponent;
componentTypes.SinglePassExtensibleComposedComponent = SinglePassExtensibleComposedComponent;
componentTypes.ComponentList = ComponentList;
componentTypes.ComponentWithView = Components.ComponentWithView;
componentTypes.ComponentWithHooks = Components.ComponentWithHooks;
componentTypes.VisibleStateComponent = VisibleStateComponent;


ComposedComponent.componentTypes = componentTypes;
module.exports = ComposedComponent;