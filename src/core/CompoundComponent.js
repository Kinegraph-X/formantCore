/**
 * @constructor CompoundComponent
 * 
 * This ctor is the main effector of the AppIgnition super-class
 * 	=> tight coupling = mandatory static inclusion in core (AppIgnition requires CompoundComponent).
 */


const TypeManager = require('src/core/TypeManager');
const TemplateFactory = require('src/core/TemplateFactory');
const Registries = require('src/core/Registries');
const CoreTypes = require('src/core/CoreTypes');
const Components = require('src/core/Component');

//const componentTypes = require('src/_buildTools/_UIpackages')(null, { UIpackage: '%%UIpackage%%' }).packageList;

const componentTypes = {};
const coreComponents = {};

Components.RootViewComponent = require('src/coreComponents/RootViewComponent/RootViewComponent');
Components.AppOverlayComponent = require('src/coreComponents/AppOverlayComponent/AppOverlayComponent');
Components.AppBoundaryComponent = require('src/coreComponents/AppBoundaryComponent/AppBoundaryComponent');
Components.IFrameComponent = require('src/coreComponents/IFrameComponent/IFrameComponent');
Components.HToolbarComponent = require('src/coreComponents/HToolbarComponent/HToolbarComponent');
Components.FlexColumnComponent = require('src/coreComponents/FlexColumnComponent/FlexColumnComponent');
Components.FlexRowComponent = require('src/coreComponents/FlexRowComponent/FlexRowComponent');
Components.FlexGridComponent = require('src/coreComponents/FlexGridComponent/FlexGridComponent');
Components.ComponentPickingInput = require('src/coreComponents/ComponentPickingInput/ComponentPickingInput');
Components.RPCStackComponent = require('src/coreComponents/RPCStackComponent/RPCStackComponent');
//var ChildBoxComponent = require('src/coreComponents/ChildBoxComponent/ChildBoxComponent');

Components.SWrapperInViewManipulator = require('src/_DesignSystemManager/SWrapperInViewManipulator')

//Components.VisibleStateComponent = require('src/UI/categories/basics/VisibleStateComponent/VisibleStateComponent');
//Components.TypedListComponent = require('src/UI/categories/basics/TypedListComponent/TypedListComponent');
//Components.KeyValuePairComponent = require('src/UI/categories/basics/KeyValuePairComponent/KeyValuePairComponent');
//Components.ExtensibleTable = require('src/UI/categories/basics/ExtensibleTable/ExtensibleTable');
//Components.SpecializedTypedListComponent = require('src/UI/categories/basics/SpecializedTypedListComponent/SpecializedTypedListComponent');
//Components.MultisetAccordionComponent = require('src/UI/categories/basics/MultisetAccordionComponent/MultisetAccordionComponent');
//Components.GenericTitledPanelComponent = require('src/UI/categories/basics/GenericTitledPanelComponent/GenericTitledPanelComponent');
//var ColorSamplerSetComponent = require('src/UI/packages/setsForPanels/ColorSamplerSetComponent/ColorSamplerSetComponent');

//Components.VaritextButtonComponent = require('src/UI/categories/forms/NamedButton/NamedButton');
//Components.VisualSetComponent = require('src/UI/Generics/VisualSetComponent/VisualSetComponent');
//Components.VariablyStatefullComponent = require('src/UI/Generics/VariablyStatefullComponent/VariablyStatefullComponent');
//Components.VisualSetHostComponent = require('src/UI/Generics/VisualSetHostComponent/VisualSetHostComponent');

// Abstract types & abstract implementations re-injection

//Components.RootViewComponent = RootViewComponent;
//Components.AppOverlayComponent = AppOverlayComponent;
//Components.AppBoundaryComponent = AppBoundaryComponent;
//Components.HToolbarComponent = HToolbarComponent;
//Components.FlexColumnComponent = FlexColumnComponent;
//Components.FlexRowComponent = FlexRowComponent;
//Components.FlexGridComponent = FlexGridComponent;
//Components.ComponentPickingInput = ComponentPickingInput;
//Components.ChildBoxComponent = ChildBoxComponent;

//Components.SWrapperInViewManipulator = SWrapperInViewManipulator;

//Components.VisibleStateComponent = VisibleStateComponent;
//Components.TypedListComponent = TypedListComponent;
//Components.KeyValuePairComponent = KeyValuePairComponent;
//Components.ExtensibleTable = ExtensibleTable;
//Components.SpecializedTypedListComponent = SpecializedTypedListComponent;
//Components.GenericTitledPanelComponent = GenericTitledPanelComponent;
//Components.ColorSamplerSetComponent = ColorSamplerSetComponent;

//Components.VisualSetComponent = VisualSetComponent;
//Components.VariablyStatefullComponent = VariablyStatefullComponent;
//Components.VaritextButtonComponent = VaritextButtonComponent;
//Components.VisualSetHostComponent = VisualSetHostComponent;

//Object.assign(Components, require(componentTypes.misc));
//delete componentTypes.misc;

//for (let type in componentTypes) {
//	
//	if (typeof componentTypes[type] === 'string')
//		Components[type] = require(componentTypes[type]);
//}

















/**
 * @constructor CompoundComponent
 */
const CompoundComponent = function(definition, parentView, parent, isChildOfRoot) {
//	console.log(definition);
	this._firstListUIDSeen = null;
	var shouldExtend = false;
	
	if (!definition.getGroupHostDef())
		console.error('Definition given to CompoundComponent isn\'t a nested HierachicalDefinition.', definition, 'Type is:', definition.getHostDef().type, this);
		
	if (definition.getGroupHostDef().type)
		console.warn('A type was given to a template instanciated by the CompoundComponent ctor: it\'ll be ignored. If the component isn\'t part of a list, it may not be what you meant. Type is', definition.getGroupHostDef().type)
	
	// Any custom element must be befined when calling the Def Factory, unless there's no shadow DOM
//	if (!definition.getGroupHostDef().nodeName) {
//		definition.getGroupHostDef().nodeName = 'compound-view';
//		console.log(definition.getGroupHostDef());
//	}

	// Let's use an elementary and perf efficient hack right here, at the beginning, and abuse the ascendant component with a symbolic def,
	// for the view to be instanciated with the correct context (knowing how many subSections we have is crucial when connecting children)
	// This prevents us from instanciating a Component with subViews as the "host" of a composedComponent : No matter at all, cause that case wouldn't make much sense, though.
	// (It's hard to implement that in the Type factory, as the "composed" definition, with its 2 levels of depth on the "host", is an exception)
	// (That shouldn't be a too big issue, seen that building the hierarchy comes before the intensive processing : 
	// 	the def may be mutated here, given the fact that we pay a strong attention on it not being changed later)
	definition.subSections.forEach(function(section) {
		definition.getHostDef().subSections.push(null);
	});

//	if (definition.getGroupHostDef().type === 'FileSelector')
//		console.error(def);

	if (!TypeManager.hostsDefinitionsCacheRegistry.getItem(definition.getGroupHostDef().UID)) // this shall always fail after having called "once for all" the superior ctor (although def is "explicit+default", and "special" is added afterwards: see extendDefinition())
		shouldExtend = true;

	// Another elementary Hack to integrate parts of the "host" of the def in that "composedComponent" (which is pretty "unfruity", not having any "applicative" behavior) :
	// assuming we don't want to instanciate "in da space" (i.e. "in that present ctor") a whole Component, and have to reflect all of its props on "self",
	// we call the "superior" ComponentWithView ctor on the def of solely the host (5 lines below)
	// BUT beforehand, we reflect on "self" the "createDefaultDef" method defined on the prototype of the host, then it shall be called by the AbstractComponent ctor
	// (from which we inherit).
	// Exception, obviously : if there is -no- createDefaultDef method on that Component which whant to be "host" on the throne of the "host"...
	//
	var type = definition.getGroupHostDef().getType();
	if (type && type !== 'CompoundComponent' && Components[type].prototype.createDefaultDef) {
//		console.error('Definition overridden', type,  Components[type]);
		this.createDefaultDef = Components[type].prototype.createDefaultDef;
	}
//	console.error(parent);
//	console.log(definition);
//	console.log(this.createEvents);
	Components.ComponentWithView.call(this, definition.getHostDef(), parentView, parent, isChildOfRoot);  // feed with host def
	this.objectType = 'CompoundComponent';

	// extend last, so the event bubbling occurs always after the "explicitly defined in the host's def" callbacks
	if (shouldExtend)
		this.extendDefinition(definition);
	
	var defaultDef = this.createDefaultDef();
	
	// When instanciating a CompoundComponent directly from its ctor,  there is no defaultDef : don't try to merge
	if (defaultDef) {
		if (defaultDef.subSections.length)
			Array.prototype.push.apply(definition.subSections, defaultDef.subSections);
		if (defaultDef.members.length)
			Array.prototype.push.apply(definition.members, defaultDef.members);
	}
			
	this.instanciateSubSections(definition);
	this.instanciateMembers(definition);
	this.instanciateLists(definition);

}
CompoundComponent.prototype = Object.create(Components.ComponentWithView.prototype);
CompoundComponent.prototype.objectType = 'CompoundComponent';
coreComponents.CompoundComponent = CompoundComponent;

//CompoundComponent.prototype.createDefaultDef = function() {
//	return TypeManager.mockDef();
//}

CompoundComponent.prototype.extendDefinition = function(definition) {
	// Special case : events of type "update" shall have the ability to bubble from CompoundComponent to CompoundComponent
	definition.getGroupHostDef().subscribeOnChild.push(
		(new TypeManager.EventSubscriptionModel({
			on: 'update',
			subscribe: function(e) {
				if (e.bubble)
					this.trigger('update', e.data, true);
			}
		})
		)
	);
	//	TypeManager.caches['subscribeOnChild'].setItem(this._defUID, definition.getGroupHostDef().subscribeOnChild);
}

CompoundComponent.prototype.instanciateSubSections = function(definition) {
	var type, component;
	definition.subSections.forEach(function(subSectionDef) {
		if (!subSectionDef.getHostDef() && (subSectionDef.nodeName || subSectionDef.type)) {
			console.warn('subSection "' + (subSectionDef.type || subSectionDef.nodeName) + '" of a CompoundComponent : Definition given is the definition of a view. It should be wrapped in a HierarchicalComponentDef');
			return;
		}
		type = subSectionDef.getHostDef().getType() || (subSectionDef.getGroupHostDef() && subSectionDef.getGroupHostDef().getType());
		//		console.log(type, type in Components);
		if (type in Components && type !== 'CompoundComponent' && type !== 'FlexColumnComponent' && type !== 'FlexRowComponent' && type !== 'FlexGridComponent' && type !== 'HToolbarComponent') {
			component = new Components[type](subSectionDef, this.view, null, 'isChildOfRoot');
			// mandatory, as we need to append memberViews on subViews without accessing the component's scope
			this.view.subViewsHolder.subViews.push(component.view);
		}
		else if (subSectionDef.getGroupHostDef()) {
			component = new CompoundComponent(subSectionDef, this.view, null, 'isChildOfRoot');
			this.view.subViewsHolder.subViews.push(component.view);
		}
		else if (subSectionDef.getHostDef().nodeName)
			this.view.subViewsHolder.subViews.push(new CoreTypes.ComponentView(subSectionDef, this.view, this, 'isChildOfRoot'));
	}, this);
}

CompoundComponent.prototype.instanciateMembers = function(definition) {
//	console.log(definition.members);
	var type;
	definition.members.forEach(function(memberDef) {
		if (!memberDef.getHostDef && (memberDef.nodeName || memberDef.type)) {
			console.warn('Member "' + (memberDef.type || memberDef.nodeName) + '" of a CompoundComponent : Definition given is the definition of a view. It should be wrapped in a HierarchicalComponentDef');
			return;
		}
		type = memberDef.getHostDef().getType() || (memberDef.getGroupHostDef() && memberDef.getGroupHostDef().getType());
		//		if (type === 'ColorSamplerSetComponentAsClient')
		//			console.log(type, type in Components, Components);
//		console.log(type);
		if (type in Components && type !== 'CompoundComponent') {
//			console.log(definition);
			new Components[type](memberDef, this.view, this);
		}
		else if (memberDef.getGroupHostDef()) {
			if (Components[type])
				new Components[type](memberDef, this.view, this);
			else
				new CompoundComponent(memberDef, this.view, this);
		}
		else if (memberDef.getHostDef().nodeName)
			this.view.subViewsHolder.memberViews.push(new CoreTypes.ComponentView(memberDef, this.view, this));
	}, this);
};

CompoundComponent.prototype.instanciateLists = function(definition) {
	definition.lists.forEach(function(listDef) {
		new ComponentList(listDef, this.view, this);
	}, this);
};

/**
 * retrieveListDefinition
 * Not used in Core: probably meant to help build very complex apps
 */
CompoundComponent.prototype.retrieveListDefinition = function() {
	return this._firstListUIDSeen ? TypeManager.listsDefinitionsCacheRegistry.getItem(this._firstListUIDSeen) : false;
}









/**
 * @constructor ComponentList
 */
const ComponentList = function(definition, parentView, parent) {
	Components.HierarchicalObject.call(this);	// don't register the list as a child ... ', definition, parentView, parent);
	this.objectType = 'ComponentList';
	this._parent = parent;

	this.iterateOnModel(definition, parentView, parent);
}
ComponentList.prototype = Object.create(Components.HierarchicalObject.prototype);
ComponentList.prototype.objectType = 'ComponentList';
coreComponents.ComponentList = ComponentList;		// used in AppIgnition.List (as a "life-saving" tool : pretty abstract, but very useful)

ComponentList.prototype.iterateOnModel = function(definition, parentView) {
	if (definition.getHostDef().each.length) {
		// Debug notice: preventing a frequent case of error,
		// when a def hosting a list is instanciated once and re-used many times.
		// In most cases, the "each" property isn't resetted, so we get empty nodes from past iterations
		if (!definition.getHostDef().isInternal && TypeManager.listsDefinitionsCacheRegistry.getItem(definition.getHostDef().UID)) { //  && this._parent._firstListUIDSeen !== null && this._parent._firstListUIDSeen === definition.getHostDef().UID
			console.warn('ComponentList :', 'Constructing a list from a not-empty definition we\'ve already seen : There is a possibility that this is unintentional ans may cause unwanted empty nodes to be appended in the DOM.', 'The nodeName is', definition.getHostDef().template.getHostDef().nodeName, 'The "each" property is', definition.getHostDef().each);
		}
		// Not used in Core elsewhere than here: probably meant to help build very complex apps
		// (but here, useful to catch the above "notice" log)
		TypeManager.listsDefinitionsCacheRegistry.setItem(definition.getHostDef().UID, definition.getHostDef());
		this._parent._firstListUIDSeen = definition.getHostDef().UID;
	}
	else
		return;

	var templateDef = definition.getHostDef().template,
		composedComponent,
		type;

	//	console.log(templateDef);
	definition.getHostDef().each.forEach(function(item, key) {

		if ((type = templateDef.getHostDef().type)) {
			composedComponent = new Components[type](templateDef, this._parent.view, this._parent);
			Registries.dataStoreRegistry.setItem(composedComponent._UID, key);
		}
		else if (templateDef.getGroupHostDef()) {
			if ((type = templateDef.getGroupHostDef().getType()) && Components[type]) {
				composedComponent = new Components[type](templateDef, this._parent.view, this._parent);
			}
			else
				composedComponent = new CompoundComponent(templateDef, this._parent.view, this._parent);
			Registries.dataStoreRegistry.setItem(composedComponent._UID, key);
		}
		else
			this._parent.view.subViewsHolder.memberViews.push(new CoreTypes.ComponentView(templateDef, this._parent.view, this._parent));
	}, this);
}












/**
 * @constructor CompoundComponentWithHooks
 */
const CompoundComponentWithHooks = function(definition, parentView, parent, isChildOfRoot) {
	CompoundComponent.call(this, definition, parentView, parent, isChildOfRoot);
	this.objectType = 'CompoundComponentWithHooks';
	this.viewExtend(definition);
}
const CompoundComponentWithHooksProto_proto = Object.create(Components.ComponentWithHooks.prototype);
Object.assign(CompoundComponentWithHooksProto_proto, CompoundComponent.prototype);
CompoundComponentWithHooks.prototype = Object.create(CompoundComponentWithHooksProto_proto);
CompoundComponentWithHooks.prototype.objectType = 'CompoundComponentWithHooks';
coreComponents.CompoundComponentWithHooks = CompoundComponentWithHooks;


/**
 * @constructor CompoundComponentWithReactiveText
 */
const CompoundComponentWithReactiveText = function(definition, parentView, parent, isChildOfRoot) {
	CompoundComponent.call(this, definition, parentView, parent, isChildOfRoot);
	this.objectType = 'CompoundComponentWithReactiveText';
	this.viewExtend(definition);
}
const CompoundComponentWithReactiveTextProto_proto = Object.create(Components.ComponentWithReactiveText.prototype);
Object.assign(CompoundComponentWithReactiveTextProto_proto, CompoundComponent.prototype);
CompoundComponentWithReactiveText.prototype = Object.create(CompoundComponentWithReactiveTextProto_proto);
CompoundComponentWithReactiveText.prototype.objectType = 'CompoundComponentWithReactiveText';
coreComponents.CompoundComponentWithReactiveText = CompoundComponentWithReactiveText;










const createIteratingComponentHostDef = require('src/coreDefs/IteratingComponentHostDef');
const createIteratingComponentSlotsDef = require('src/coreDefs/IteratingComponentSlotsDef');

const IteratingComponent = function(definition, parentView, parent, slotDef) {
	this.slotDef = slotDef || createIteratingComponentSlotsDef().slotDef;
	// Let's allow neither passing a parentView nor a parent.
	// This is a common pattern we've used in the documentation
	// (although the standard signature for Components has 3 parameters,
	// and is useful in more complex cases)
	if (parentView instanceof TemplateFactory.HierarchicalComponentDefModel)
		this.slotDef = parentView;
	else if (parent instanceof TemplateFactory.HierarchicalComponentDefModel)
		this.slotDef = parent;
	// Not passing a parentView of type "ComponentView"
	// should fail smoothly in the abstract components
	// but it's not heavily tested
	Components.ComponentWithView.apply(this, arguments);
	this.objectType = 'IteratingComponent';
	
	this.typedSlot = new this.rDataset(
		null,										// wrapping component
		this,										// host component
		this.slotDef,									// list-item template
		['text']									// schema of data for reactivity
	);
}
IteratingComponent.prototype = Object.create(Components.ComponentWithView.prototype);
IteratingComponent.prototype.objectType = 'IteratingComponent';
coreComponents.IteratingComponent = IteratingComponent;

IteratingComponent.prototype.createDefaultDef = function() {
	return createIteratingComponentHostDef();
}

IteratingComponent.prototype.acquireData = function(listContentAsArray) {
	const conformedList = listContentAsArray.map(
		(item) => this.typedSlot.newItem(item)
	);
	this.typedSlot.pushApply(conformedList);
}

module.exports = IteratingComponent;















/**
 * @constructor LazySlottedCompoundComponent
*/
const createLazySlottedComponentDef = require('src/coreDefs/lazySlottedComponentDef');
const createLazySlottedComponentSlotstDef = require('src/coreDefs/lazySlottedComponentSlotsDef');
const LazySlottedCompoundComponent = function(definition, parentView, parent, slotsCount, slotsDef) {
	var stdDefinition = definition || createLazySlottedComponentDef();
	this.typedSlots = [];
	this.slotsCount = slotsCount || this.slotsCount || 2;
	//	console.log(this.slotsDef);
	this.slotsDef = slotsDef || this.slotsDef || createLazySlottedComponentSlotstDef();

	// Proceeding that way (i.e. not using the complete mixin mechanism : "addInterface") allows us to choose in which order the ctors are called
	// When the base ctor is called, it calls the extension's ctor, and then, and only then, the superClasse's ctor
	// (which would have been called before the extension's one if we had used the "addInterface" mechanism)
	// Full motivation : as we don't want to define a view twice (the two mixed ctor's both call their superClasse's ctor : ComponentWithView),
	// we bypassed the call to super() in the LazySlottedCompoundComponent ctor
	//
	// We could choose not to call the CompoundComponent ctor, but then we wouldn't be able to define subSections or members (ou would have to explicitly call the methods then)
	// Other issue : the CompoundComponent ctor would be called with the arguments received by the mergedConstructor(), and they do not include a definition object
	// Keeping that here makes the code base cleaner

	// Get a definition :
	// Here, the initial def allows an undefined number of tabs
	this.updateDefinitionBasedOnSlotsCount(stdDefinition);

	CompoundComponentWithHooks.call(this, stdDefinition, parentView, parent);

	//	console.log('LazySlottedCompoundComponent - Ctor Rendering \n\n\n');
	//	this.render(null, stdDefinition.lists[0].host);

	this.objectType = 'LazySlottedCompoundComponent';

	this.affectSlots();

	// This is an abstract Class
	// For a "straight" TabPanel Class, we would have assumed this.slotsCount is 2
	// And for an imaginary other implementation of the LazySlottedCompoundComponent class, we should have handled the slotsCount case : it may be defined anteriorly, or fixed, or...
	for (let i = 0, l = this.slotsCount; i < l; i++) {
		this.typedSlots[i].setSchema(['slotTitle']);
	}

	this.createEvent('header_clicked');

	this.slotsCache = new TypeManager.PropertyCache('LazySlottedCompoundComponentSlotsCache' + this._UID);
	
	// Exception : we want to call an async task, but the prototype of an abstract type CAN'T have a _asyncInitTasks property
	// ONLY a concrete type may declare it on its prototype, cause if the property already exists,
	// the prototype of the abstract type will be overridden with an asyncTasks-array coming from a concrete type.
	// So : => We need to define the _asyncInitTasks in the constructor of the abstract type
	// in a manner so it won't override the property defined on the prototype of the concrete type,
	// and the prototype of the concrete type won't override a prop that doen't exist yet on the abstract type
	// when defining the prototype.
	if (!Array.isArray(this._asyncInitTasks))
		this._asyncInitTasks = [];
	this._asyncInitTasks.push(new TypeManager.TaskDefinition({
		type : 'viewExtend',
		task : function(definition) {
			this.hackDOMAttributes();
		}
	}));
}
LazySlottedCompoundComponent.prototype = Object.create(CompoundComponentWithHooks.prototype);
LazySlottedCompoundComponent.prototype.objectType = 'LazySlottedCompoundComponent';
coreComponents.LazySlottedCompoundComponent = LazySlottedCompoundComponent;


// TMP Hack: assign DOM attributes on pseudo-slots (though we should do that through reactivity, see "ColorSamplerSetComponent")
LazySlottedCompoundComponent.prototype.hackDOMAttributes = function() {
	console.log('hackDOMAttributes');
	this._children.forEach(function(child, key) {
		child.view.getMasterNode().streams = child.streams;
		child.view.getMasterNode().setAttribute('slot-id', 'slot' + key.toString());
	}, this);
}

/**
 * updateDefinitionBasedOnSlotsCount
 * This method initializes the current definition with as much pseudo-slots as in slotCount
 */
LazySlottedCompoundComponent.prototype.updateDefinitionBasedOnSlotsCount = function(definition) {
//	if (definition.lists[0] && definition.lists[0].host.each.length)
//		console.warn(this.objectType, ': Initializing a ReactiveDataset with an inital value. Please ensure this is intentional. (it may result from using the same instance of a definition multiple times)');
	
	for (let i = 0, l = this.slotsCount; i < l; i++) {
		definition.lists[0].host.each.push({ 'slot-id': 'slot' + i });
	}
}

LazySlottedCompoundComponent.prototype.affectSlots = function() {
	let slotsDefs  = Object.values(this.slotsDef);
	for (let i = 0, l = this.slotsCount; i < l; i++) {
		this.typedSlots.push(new this.rDataset(
			null,
			this._children[i],
			slotsDefs[i],
			[])
		);
	}
	// This method used to return "true". As it was obviously a dirty hack, we've deteted that instruction.
}

LazySlottedCompoundComponent.prototype.setSchema = function() {
	if (arguments.length !== this.slotsCount) {
		console.warn('globally setting schema failed : not the right number of args')
	}

	for (let i = 0, l = this.slotsCount; i < l; i++) {
		this.typedSlots[i].setSchema([arguments[i]]);
	}
}

LazySlottedCompoundComponent.prototype.getSlot = function(Idx) {
	return this._children[Idx];
}

LazySlottedCompoundComponent.prototype.getFirstSlot = function() {
	return this._children[0];
}

LazySlottedCompoundComponent.prototype.getFirstSlotChildren = function() {
	return this._children[0]._children;
}

LazySlottedCompoundComponent.prototype.pushToSlotFromText = function(slotNbr, content) {
	// Here, newItem() depends on the type given in the ctor... or afterwards with setSchema()
	this.typedSlots[slotNbr].push(this.typedSlots[slotNbr].newItem(content));
}

LazySlottedCompoundComponent.prototype.pushApplyToSlot = function(slotNbr, contentAsArray) {
	// Here, newItem() depends on the type given in the ctor... or afterwards with setSchema()
	var cAsArray = contentAsArray.map(function(value, key) {
		if (typeof value !== 'object' || !(value instanceof this.typedSlots[slotNbr].Item))
			return this.typedSlots[slotNbr].newItem(value);
		else
			return value;
	}, this);
	//	console.log(cAsArray.slice(0));
	this.typedSlots[slotNbr].pushApply(cAsArray);
	//	return contentAsArray;
}

LazySlottedCompoundComponent.prototype.pushDefaultToSlot = function(slotNbr) {
	// Here, newItem() depends on the type given in the ctor... or afterwards with setSchema()
	this.typedSlots[slotNbr].push(this.typedSlots[slotNbr].newItem(''));
}

LazySlottedCompoundComponent.prototype.pushMultipleDefaultToSlot = function(slotNbrArray) {
	slotNbrArray.forEach(function(slotNbr) {
		this.pushDefaultToSlot(slotNbr);
	}, this);
}

LazySlottedCompoundComponent.prototype.addPairedItems = function(slotTextContent) {
	for (let i = 0, l = arguments.length; i < l; i++) {
		this.pushToSlotFromText(0, arguments[i]);
		this.pushToSlotFromText(1, '');
	}
}

LazySlottedCompoundComponent.prototype.emptySlots = function() {
	for (let i = 0, l = this.slotsCount; i < l; i++) {
		this.typedSlots[i].resetLength();
	}
}

LazySlottedCompoundComponent.prototype.cacheSlots = function(userlandUID) {
	for (let i = 0, l = this.slotsCount; i < l; i++) {
		if (!this.slotsCache.getItem(userlandUID + i.toString())) {
			var savedSlot = {
				content: this.typedSlots[i].slice(0),
				children: this.typedSlots[i].rootComponent._children.slice(0)
			}
			this.slotsCache.setItem(userlandUID + i.toString(), savedSlot);
		}
		//		this.typedSlots[i].resetLength();
	}
}

LazySlottedCompoundComponent.prototype.retrieveSlots = function(userlandUID) {
	var slot;
	for (let i = 0, l = this.slotsCount; i < l; i++) {
		slot = this.slotsCache.getItem(userlandUID + i.toString());
		if (slot) {
			Array.prototype.splice.call(this.typedSlots[i], 0, slot.content.length, ...slot.content);
			slot.children.forEach(function(child, key) {
				this.typedSlots[i].rootComponent.pushChild(child);
				if (child.view) // this.slotsCache.getItem(userlandUID1) is a pseudo component (an object with an init() method)
					this.typedSlots[i].rootComponent.view.addChildAt(child.view, slot.children.length); //  (- 1  & slot.children.length) cause 0 would cause an append (see view.addChildAt())
			}, this);
		}
	}
}














const createAbstractTreeDef = require('src/coreDefs/abstractTreeDef');
const createBranchTemplateDef = require('src/coreDefs/branchTemplateDef');
const createLeafTemplateDef = require('src/coreDefs/leafTemplateDef');

const AbstractTree = function(definition, parentView, parent, jsonData, nodeFilterFunction) {
	//	console.log(definition, parentView, parent, jsonData);
	var stdDefinition = createAbstractTreeDef();
	// HACK: no solution for now to override the default def : there is no createDefaultDef method on a compound component
	if  (definition.getGroupHostDef().sOverride)
		stdDefinition.getGroupHostDef().sOverride = definition.getGroupHostDef().sOverride;
	
	/**
	 * Standard Implementation :
	 * (this requirements may be overridden through extension. see affectClickEvents())
	 */
	// Banch Component MUST implement the 'clicked_ok' event (and though inherit from ComponentWithHooks)
	this.branchTemplate = this.branchTemplate || createBranchTemplateDef();
	// Leaf Component MUST at least inherit from ComponentWithHooks
	this.leafTemplate = this.leafTemplate || createLeafTemplateDef();
	this.pseudoModel = [];
	this.listTemplate = TypeManager.createComponentDef({ type: 'ComponentList' });
	this.listTemplate.getHostDef().each = this.pseudoModel;

	this.expanded = this.expanded || 'expanded';

	CompoundComponent.call(this, stdDefinition, parentView, parent);
	this.objectType = 'AbstractTree';

	this.addEventListener('update', function(e) {
		//		console.log('abstractTree receives update and sets "selected"', e.data);
		this.streams.selected.value = e.data.self_UID;
	}.bind(this));
	this.createEvent('exportdata');
	
	if (jsonData && Object.prototype.toString.call(jsonData) === '[object Object]')
		this.renderJSON(jsonData, nodeFilterFunction);
}
AbstractTree.prototype = Object.create(CompoundComponentWithHooks.prototype);
AbstractTree.prototype.objectType = 'AbstractTree';
coreComponents.AbstractTree = AbstractTree;

AbstractTree.prototype.createMember = function(memberSpec, parent) {
	var type = memberSpec.type, componentDef, component;
//	console.log(memberSpec);
	//	console.log(memberSpec);
	if (memberSpec.children.length) {
		// When a def isn't already cached, isKnownUID() returns a string : the definitionsCache creates an emty entry and returns the newly added cacheID
		if (typeof (componentDef = TypeManager.definitionsCache.isKnownUID('branchTemplate_' + type)) === 'string') {
			componentDef = TypeManager.createComponentDef(this.branchTemplate);
			//			componentDef.getGroupHostDef().attributes.push(TypeManager.PropsFactory({textContent : this.getHeaderTitle(type)}));
		}

		component = new CompoundComponent(componentDef, parent.view, parent);
		Registries.dataStoreRegistry.setItem(component._UID, this.pseudoModel.length);
		this.pseudoModel.push(this.getHeaderTitle(memberSpec));
	}
	else {
		component = new Components[this.leafTemplate.getHostDef().type](this.leafTemplate, parent.view, parent);
		Registries.dataStoreRegistry.setItem(component._UID, this.pseudoModel.length);
		this.pseudoModel.push(this.getKeyValueObj(memberSpec));
	}
	return component;
};

AbstractTree.prototype.getHeaderTitle = function(memberSpec) {
	var len = memberSpec.children.length;
	if (memberSpec.type === 'array')
		return {
			headerTitle: "[".concat(len, "]"),
			displayedas: memberSpec.type,
			expanded: this.expanded
		};
	else if (memberSpec.type === 'object')
		return {
			headerTitle: "{".concat(len, "}"),
			displayedas: memberSpec.type,
			expanded: this.expanded
		};
}

AbstractTree.prototype.getKeyValueObj = function(memberSpec) {
	return {
		keyValuePair: ['', memberSpec.key + (memberSpec.children.length ? '&nbsp;:&nbsp;' : ''), (memberSpec.type === 'string' ? ' "' + memberSpec.value.toString() + '"' : memberSpec.value.toString())],
		displayedas: memberSpec.type
	};
}

AbstractTree.prototype._typeof = function(obj) {
	var _typeof;
	if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
		_typeof = function(obj) {
			return typeof obj;
		};
	} else {
		_typeof = function(obj) {
			return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
		};
	}

	return _typeof(obj);
}

AbstractTree.prototype.getDataType = function(obj) {

	var type = this._typeof(obj);

	if (Array.isArray(obj))
		type = 'array';
	if (obj === null)
		type = 'null';

	return type;
}

AbstractTree.prototype.createNode = function() {
	var opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	return {
		key: opt.key || null,
		parent: opt.parent || null,
		value: opt.hasOwnProperty('value') ? opt.value : null,
		isExpanded: opt.isExpanded || false,
		type: opt.type || null,
		children: opt.children || [],
		el: opt.el || null,
		depth: opt.depth || 0
	};
}

AbstractTree.prototype.createSubnodes = function(data, node) {
	if (this._typeof(data) === 'object') {
		for (var key in data) {
			var child = this.createNode({
				value: data[key],
				key: key,
				depth: node.depth + 1,
				type: this.getDataType(data[key]),
				parent: node
			});
			node.children.push(child);
			this.createSubnodes(data[key], child);
		}
	}
}

AbstractTree.prototype.createTree = function(jsonData) {
	var data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
	var rootNode = this.createNode({
		value: data,
		key: 'root',
		type: this.getDataType(data)
	});
	this.createSubnodes(data, rootNode);
	return rootNode;
}

AbstractTree.prototype.traverseTree = function(memberDesc, parentComponent, callback) {
	//console.log(node);
	var component = callback(memberDesc, parentComponent);
	//console.log(node);

	if (memberDesc.children.length > 0) {
		memberDesc.children.forEach(function(child) {
			this.traverseTree(child, component, callback);
		}, this);
	}
}

AbstractTree.prototype.instanciateTreeMembers = function(tree, nodeFilterFunction) {
	var self = this;
	this.traverseTree(tree, this, function(memberDesc, parentComponent) {
		var component;
		if (typeof nodeFilterFunction !== 'function') {
			component = self.createMember(memberDesc, parentComponent);
		}
		else {
			memberDesc = nodeFilterFunction(memberDesc);
			component = self.createMember(memberDesc, parentComponent);
		}
		self.affectClickEvents(memberDesc, component);
		return component;
	});
}

AbstractTree.prototype.renderJSON = function(jsonData, nodeFilterFunction) {
	//	console.log(jsonData);
	var parsedData = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
	var tree = this.createTree(parsedData);
	//	console.log(parsedData, tree);
	this.instanciateTreeMembers(tree, nodeFilterFunction);

	var DOMNodeId;
	this.render(DOMNodeId);
	return tree;
}

AbstractTree.prototype.reset = function() {
	this.removeAllChildren();
	this.clearEventListeners('exportdata');
}

AbstractTree.prototype.render = function() { } 									// pure virtual (injected as a dependancy by AppIgnition)
AbstractTree.prototype.affectClickEvents = function(memberDesc, component) { 	// virtual with default (implemented through override on extension)
	this.affectClickEvents_Base(memberDesc, component);
}

AbstractTree.prototype.affectClickEvents_Base = function(memberDesc, component) {
	var self = this;

	if (memberDesc.children.length) {
		// Say we have a header node, containing 2 pictos (arrows), and an appended span, key: value
		component._children[0].addEventListener('clicked_ok', function(e) {
			// When artificially clicked from outside of the component, there is no e.data.target
			if ((!e.data || !e.data.target) || e.data.target === this.view.getWrappingNode().children[2])
				self.trigger('exportdata', memberDesc.projectedData); // the component shall trigger update and receive the "selected" attribute: not needed here
			else
				component.streams.expanded.value = !component.streams.expanded.value ? 'expanded' : null;
		}.bind(component._children[0]));
	}
	else {
		// Leaf Component MUST inherit from ComponentWithHooks
		component.registerClickEvents = function() {
			if (!component._eventHandlers.clicked_ok)
				component.createEvent('clicked_ok');
			
			Object.getPrototypeOf(this).registerClickEvents.call(this);

			// Say we have 2 divs with key : value
			this.view.subViewsHolder.memberViews[1].getWrappingNode().addEventListener('click', function(e) {
				this.trigger('clicked_ok', e);
			}.bind(component));
			component.addEventListener('clicked_ok', function(e) {
				this.streams.selected.value = 'selected';
				this.trigger('update', { self_UID: component._UID }, true);
				self.trigger('exportdata', memberDesc.projectedData);
			}.bind(component));
		}
	}
}

















const createAbstractTableDef = require('src/coreDefs/abstractTableDef');
const createAbstractTableSlotsDef = require('src/coreDefs/abstractTableSlotsDef');


const AbstractTable = function(def, parentView, parent) {
	this.slotsCount = 2;

	var stdDef = def || createAbstractTableDef();
	this.slotsDef = this.slotsDef || createAbstractTableSlotsDef();
	this.columnsCount = this.columnsCount || 2;
	this.rowsCount = 0;

	LazySlottedCompoundComponent.call(this, stdDef, parentView, parent);
	this.typedSlots[0].setSchema(['headerTitle']);
	// The schema for rows depends 
	this.typedSlots[1].setSchema(['rowContentAsArray']);

	// This concern is left to the implementation discretion
	//	this.setcolumnsCount(this.columnsCount);
}

/**
 * @chained_inheritance AbstractTable <= LazySlottedCompoundComponent <= ComponentWithReactiveText
 */
const AbstractTableProto_proto = Object.create(LazySlottedCompoundComponent.prototype);
Object.assign(AbstractTableProto_proto, Components.ComponentWithReactiveText.prototype);
AbstractTable.prototype = Object.create(AbstractTableProto_proto);
AbstractTable.prototype.objectType = 'AbstractTable';
coreComponents.AbstractTable = AbstractTable;


AbstractTable.prototype.setColumnsCount = function(columnsCount, headerTitles) {
	this.columnsCount = columnsCount;
	this.typedSlots[0].resetLength();
	//	console.log(this.typedSlots[0]);
//	if (!Array.isArray(headerTitles)) {
//		headerTitles = ['idx'];
//		for (let i = 1; i < columnsCount; i++) {
//			headerTitles.push('Column ' + i.toString());
//		}
//	}
//	else if (headerTitles[0] !== 'idx')
//		headerTitles.unshift('idx');
		
	const {rowDef, tdDef} = this.slotsDef;
	let uniqueTdDef;
	for (let i = 0; i < columnsCount; i++) {
		uniqueTdDef = TemplateFactory.createDef(tdDef);
		rowDef.members.push(uniqueTdDef)
	};
	return this.pushApplyToSlot(0, headerTitles);
}


AbstractTable.prototype.pushToSlotFromText = function(slotNbr, content) {
	// Here, newItem() depends on the type given in the ctor... or afterwards with setSchema()
	this.typedSlots[slotNbr].push(this.typedSlots[slotNbr].newItem(content));

	if (slotNbr === 0) {
		var lastChild = this._children[0].getLastChild();
		lastChild.view.getMasterNode().addEventListener('mousedown', function(e) {
			this.trigger('header_clicked', { self_key: lastChild._key });
			this._children[0].childButtonsSortedLoop(lastChild._key);
		}.bind(this));
	}
}

AbstractTable.prototype.pushApplyToSlot = function(slotNbr, contentAsArray) {
	var lastChildIndex = this._children[0]._children.length;
	// Here, newItem() depends on the type given in the ctor... or afterwards with setSchema()
	var cAsArray = contentAsArray.map(function(value, key) {
		if (typeof value !== 'object' || !(value instanceof this.typedSlots[slotNbr].Item))
			return this.typedSlots[slotNbr].newItem(value);
		else
			return value;
	}, this);
	
//	console.log(cAsArray);
	this.typedSlots[slotNbr].pushApply(cAsArray);

	if (slotNbr === 0) {
		for (let i = lastChildIndex; i < this._children[0]._children.length; i++) {
			this._children[0]._children[i].view.getMasterNode().addEventListener('mousedown', function(e) {
				this.trigger('header_clicked', { self_key: this._children[0]._children[i]._key });
				this._children[0].childButtonsSortedLoop(this._children[0]._children[i]._key);
			}.bind(this));
		}
	}
}

AbstractTable.prototype.getRows = function() {
	return this._children[1];
}

AbstractTable.prototype.getRow = function(idx) {
	return this._children[1]._children[idx];
}













/**
 * @constructor AbstractAccordion
 * 
 * @similarTo TypedListComponent : a restricted form of LazySlottedCompoundComponent
 * 				where slots are appended to self.
*/
const createAbstractAccordionDef = require('src/coreDefs/AbstractAccordionDef');
const createAbstractAccordionSlotDef = require('src/coreDefs/AbstractAccordionSlotsDef');

const AbstractAccordion = function(definition, parentView, parent, hostedTypes) {
	if (!definition.getGroupHostDef().nodeName)
		definition = createAbstractAccordionDef();

	this.slotsCount = 0;

	this.typedSlots = [];
	this.slotsAssociation = {};
	this.slotsDefFactory = this.slotsDefFactory || createAbstractAccordionSlotDef;

	if (Array.isArray(hostedTypes) && hostedTypes.length) {
		this.slotsCount = hostedTypes.length;
		this.updateDefinitionBasedOnSlotsCouunt(definition, hostedTypes);
	}
	else {
		console.warn('AbstractAccordion', 'a "hostedTypes" arg should be provided, unless the component shall have no child');
	}

	CompoundComponent.call(this, definition || createAbstractAccordionDef(), parentView, parent);

	this.objectType = 'AbstractAccordion';
	this.affectSlots(hostedTypes);

}
AbstractAccordion.prototype = Object.create(CompoundComponent.prototype);
AbstractAccordion.prototype.objectType = 'AbstractAccordion';
coreComponents.AbstractAccordion = AbstractAccordion;

AbstractAccordion.prototype.updateDefinitionBasedOnSlotsCouunt = function(definition, hostedTypes) {
	hostedTypes.forEach(function(hostSpec, key) {
		definition.lists[0].getHostDef().each.push(
			{ "accordion-set": 'set_1' }
		);
		this.slotsAssociation[hostSpec.endPointName] = key;
	}, this);
}

/**
 * @same_as TypedListComponent
 */
AbstractAccordion.prototype.affectSlots = function(hostedTypes) {
	//	console.log(this._children.length);
	for (var i = 0; i < this.slotsCount; i++) {
		this.typedSlots.push(new this.rDataset(
			this._children[i],
			this._children[i],
			this.slotsDefFactory(),
			['updateChannel'])
		);
		this.typedSlots[i].defaultListDef.getHostDef().template.getGroupHostDef().type = hostedTypes[i].componentType;
		//		console.log(this.typedSlots[i].defaultListDef.getHostDef());
	}

	return true;
}

AbstractAccordion.prototype.stylePanelToFront = function(Idx) {

}























//componentTypes.ComponentWithView = Components.ComponentWithView;
//componentTypes.ComponentWithHooks = Components.ComponentWithHooks;
// Extension continues in ReactiveDataset, ComponentSet
//componentTypes.LazySlottedCompoundComponent = LazySlottedCompoundComponent;
//componentTypes.AbstractTable = AbstractTable;
//componentTypes.AbstractTree = AbstractTree;

Components.CompoundComponent = CompoundComponent;	// CompoundComponent may be called as a type







// Some formal implementations rely on Dependancy Injection
Components.CompositorComponent.prototype.acquireCompositor = function(inheritingType, inheritedType) {	// special helper
	if (inheritedType in Components || inheritedType in coreComponents) {
		var objectType = inheritingType.prototype.objectType;
		inheritingType.prototype.Compositor = coreComponents[inheritedType];
		//		console.log(Object.create(coreComponents[inheritedType].prototype));
		//		console.log(Components.ExtensibleObject.prototype.mergeOwnProperties(true, Object.create(coreComponents[inheritedType].prototype), inheritingType.prototype));
		inheritingType.prototype = Components.ExtensibleObject.prototype.mergeOwnProperties(true, Object.create(coreComponents[inheritedType].prototype), inheritingType.prototype);
		inheritingType.prototype.objectType = objectType;
		if (!inheritingType.prototype._implements || !inheritingType.prototype._implements.length)
			inheritingType.prototype._implements = [inheritedType];
		else
			inheritingType.prototype._implements.push(inheritedType);
	}
}

Components.CompositorComponent.createAppLevelExtendedComponent = function() {
	var extension2ndPass = {};
	for (var componentType in Components) {
//		console.log(Components[componentType].prototype.hasOwnProperty('extendsCore'), componentType, Components[componentType]);

		// An automatically included component may not really be a component : we have a "special" category that we also include
		if (typeof Components[componentType].prototype === 'undefined')
			continue;		 
		if (Components[componentType].prototype.hasOwnProperty('extendsCore')) {
//			console.log(Components[componentType]);
			Components.CompositorComponent.prototype.acquireCompositor(Components[componentType], Components[componentType].prototype.extendsCore);
		}
		else if (Components[componentType].prototype.hasOwnProperty('extends'))
			extension2ndPass[componentType] = Components[componentType];
	}
	for (var componentType in extension2ndPass) {
		Components.CompositorComponent.prototype.extendFromCompositor(Components[componentType], Components[Components[componentType].prototype.extends]);
	}
}


CompoundComponent.componentTypes = Components;
CompoundComponent.coreComponents = coreComponents;
module.exports = CompoundComponent;