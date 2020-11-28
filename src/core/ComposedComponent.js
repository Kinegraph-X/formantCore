/**
 * @constructor ComposedComponent
 * 
 * This ctor is the main effector of the AppIgnition super-class
 * 	=> tight coupling = mandatory static inclusion in core (AppIgnition requires ComposedComponent).
 */

var TypeManager = require('src/core/TypeManager');
var CoreTypes = require('src/core/CoreTypes');
var Components = require('src/core/Component');
var VisibleStateComponent = require('src/UI/Generics/VisibleStateComponent');
//var LazySlottedComponent = require('src/UI/Generics/LazySlottedComponent');

var componentTypes = require('src/UI/_build_helpers/_UIpackages')(null, { UIpackage: '%%UIpackage%%' }).packageList;
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
	this._firstListUIDSeen = null;
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

	if (!TypeManager.hostsDefinitionsCacheRegister.getItem(definition.getGroupHostDef().UID)) // this shall always fail after having called "once for all" the superior ctor (although def is "explicit+default", and "special" is added afterwards: see extendDefinition())
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
		if (memberDef.getGroupHostDef())
			this.pushChild(new ComposedComponent(memberDef, this.view, this));
		else if (type in componentTypes)
			this.pushChild(new componentTypes[type](memberDef, this.view, this));
		else if (memberDef.getHostDef().nodeName)
			this.view.subViewsHolder.memberViews.push(new CoreTypes.ComponentView(memberDef, this.view, this));
	}, this);
};

ComposedComponent.prototype.instanciateLists = function(definition) {
	definition.lists.forEach(function(listDef) {
		new ComponentList(listDef, this.view, this);
	}, this);
};


ComposedComponent.prototype.retrieveListDefinition = function() {
	return TypeManager.listsDefinitionsCacheRegister.getItem(this._firstListUIDSeen);
}









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
	if (definition.getHostDef().each.length) {
		TypeManager.listsDefinitionsCacheRegister.setItem(definition.getHostDef().UID, definition.getHostDef());
		this._parent._firstListUIDSeen = definition.getHostDef().UID;
	}
	else
		return;

	var templateDef = definition.getHostDef().template, composedComponent, type;

	definition.getHostDef().each.forEach(function(item, key) {
		if (templateDef.getGroupHostDef()) {
			this._parent.pushChild((composedComponent = new ComposedComponent(templateDef, this._parent.view)));
			TypeManager.dataStoreRegister.setItem(composedComponent._UID, key);
		}
		else if ((type = templateDef.getHostDef().getType())) {
			this._parent.pushChild((composedComponent = new componentTypes[type](templateDef, this._parent.view)));
			TypeManager.dataStoreRegister.setItem(composedComponent._UID, key);
		}
		else
			this._parent.view.subViewsHolder.memberViews.push(new CoreTypes.ComponentView(templateDef, this._parent.view));
	}, this);

	//	console.log(this);
}
ComposedComponent.prototype.ComponentList = ComponentList;		// used in AppIgnition.List (as a "life-saving" safety, we wan't to avoid declaring the ComponentList as a "known" Component)











/**
 * @constructor LazySlottedComposedComponent
*/
var createLazySlottedComponentDef = require('src/coreDefs/lazySlottedComponentDef');
var createLazySlottedComponenSlotstDef = require('src/coreDefs/lazySlottedComponentSlotsDef');

var LazySlottedComposedComponent = function(definition, parentView, dummyParent, alreadyComposed, slotsCount, slotsDef) {
	var stdDefinition;
	this.typedSlots = [];
	this.slotsCount = this.slotsCount || 2;
	this.slotsDef = this.slotsDef || slotsDef || createLazySlottedComponenSlotstDef();

	// Proceeding that way (i.e. not using the complete mixin mechanism : "addInterface") allows us to choose in which order the ctors are called
	// When the base ctor is called, it calls the extension's ctor, and then, and only then, the superClasse's ctor
	// (which would have been called before the extension's one if we had used the "addInterface" mechanism)
	// Full motivation : as we don't want to define a view twice (the two mixed ctor's both call their superClasse's ctor : ComponentWithView),
	// we bypassed the call to super() in the LazySlottedComposedComponent ctor
	//
	// We could choose not to call the ComposedComponent ctor, but then we wouldn't be able to define subSections or members (ou would have to explicitly call the methods then)
	// Other issue : the ComposedComponent ctor would be called with the arguments received by the mergedConstructor(), and they do not include a definition object
	// Keeping that here makes the code base cleaner

	// Get a definition :
	// Here, the initial def allows an undefined number of tabs
	stdDefinition = createLazySlottedComponentDef();
	stdDefinition.getGroupHostDef().type = 'LazySlottedComposedComponent';
	this.updateDefinitionBasedOnSlotsCount(stdDefinition);
	ComposedComponent.call(this, stdDefinition, parentView);

	this.objectType = 'LazySlottedComposedComponent';

	this.affectSlots();

	// This is an abstract Class
	// For a "straight" TabPanel Class, we would have assumed this.slotsCount is 2
	// And for an imaginary other implementation of the LazySlottedComposedComponent class, we should have handled the slotsCount case : it may be defined anteriorly, or fixed, or...
	for (let i = 0, l = this.slotsCount; i < l; i++) {
		this.typedSlots[i].setSchema(['slotTitle']);
	}
}
LazySlottedComposedComponent.prototype = Object.create(ComposedComponent.prototype);
LazySlottedComposedComponent.prototype.objectType = 'LazySlottedComposedComponent';


LazySlottedComposedComponent.prototype.updateDefinitionBasedOnSlotsCount = function(definition) {
	definition.lists[0].host.each = [];
	for (let i = 0, l = this.slotsCount; i < l; i++) {
		definition.lists[0].host.each.push({ 'slot-id': 'slot' + i });
	}
}

LazySlottedComposedComponent.prototype.affectSlots = function() {
	var i = 0;

	for (let slotDef in this.slotsDef) {
		this.typedSlots.push(new this.rDataset(
			this._children[i],
			this._children[i],
			this.slotsDef[slotDef],
			[])
		);
		i++;
	}

	return true;
}

LazySlottedComposedComponent.prototype.setSchema = function() {
	if (arguments.length !== this.slotsCount) {
		console.warn('globally setting schema failed : not the right number of args')
	}

	for (let i = 0, l = this.slotsCount; i < l; i++) {
		this.typedSlots[i].setSchema([arguments[i]]);
	}
}

LazySlottedComposedComponent.prototype.pushToSlotFromText = function(slotNbr, content) {
	// Here, newItem() depends on the type given in the ctor... or afterwards with setSchema()
	this.typedSlots[slotNbr].push(this.typedSlots[slotNbr].newItem(content));
}

LazySlottedComposedComponent.prototype.pushDefaultToSlot = function(slotNbr) {
	// Here, newItem() depends on the type given in the ctor... or afterwards with setSchema()
	this.typedSlots[slotNbr].push(this.typedSlots[slotNbr].newItem(''));
}

LazySlottedComposedComponent.prototype.pushMultipleDefaultToSlot = function(slotNbrArray) {
	slotNbrArray.forEach(function(slotNbr) {
		this.pushDefaultToSlot(slotNbr);
	}, this);
}

LazySlottedComposedComponent.prototype.addPairedItems = function(slotTextContent) {
	for (let i = 0, l = arguments.length; i < l; i++) {
		this.pushToSlotFromText(0, arguments[i]);
		this.pushToSlotFromText(1, '');
	}
}







var createLAbstractTreeDef = require('src/coreDefs/abstractTreeDef');
var createBranchTemplateDef = require('src/coreDefs/branchTemplateDef');
var createLeafTemplateDef = require('src/coreDefs/leafTemplateDef');

var AbstractTree = function(definition, parentView, parent, jsonData, targetComponent, nodeFilterFunction) {
	var stdDefinition = createLAbstractTreeDef();
	this.branchTemplate = createBranchTemplateDef();
	this.leafTemplate = createLeafTemplateDef();
	this.pseudoModel = [];
	this.listTemplate = TypeManager.createComponentDef({ type: 'ComponentList' });
	this.listTemplate.getHostDef().model = this.pseudoModel;

	ComposedComponent.call(this, stdDefinition, parentView, parent);
	this.objectType = 'AbstractTree';
	
	this.renderJSON(jsonData, targetComponent, nodeFilterFunction);
}
AbstractTree.prototype = Object.create(ComposedComponent.prototype);
AbstractTree.prototype.objectType = 'AbstractTree';

AbstractTree.prototype.getMember = function(memberSpec, parent) {
	var type = memberSpec.type, componentDef, component;
	if (type === 'array' || type === 'object') {
		if (!(componentDef = TypeManager.definitionsCache.isKnownUID('branchTemplate_' + type))) {
			componentDef = TypeManager.createComponentDef(this.branchTemplate, 'branchTemplate_' + type);
			//			componentDef.getGroupHostDef().attributes.push(TypeManager.PropsFactory({textContent : this.getHeaderTitle(type)}));
		}
		parent.pushChild((component = new ComposedComponent(this.branchTemplate, parent.view, parent)));
		TypeManager.dataStoreRegister.setItem(component._UID, this.pseudoModel.length);
		this.pseudoModel.push({ headerTitle: this.getHeaderTitle(memberSpec) });
	}
	else {
		parent.pushChild((component = new componentTypes[this.leafTemplate.getHostDef().type](this.leafTemplate, parent.view, parent)));
		TypeManager.dataStoreRegister.setItem(component._UID, this.pseudoModel.length);
		this.pseudoModel.push(this.getKeyValueDef(memberSpec));
	}
};

AbstractTree.prototype.getHeaderTitle = function(memberSpec) {
	var len = memberSpec.children.length;
	if (memberSpec.type === 'array')
		return "[".concat(len, "]");
	else if (memberSpec.type === 'object')
		return "{".concat(len, "}");
}

AbstractTree.prototype.getKeyValueDef = function(memberSpec) {
	return {
		keyValuePair: [memberSpec.key + ' : ', memberSpec.value],
		displayed_as: memberSpec.type
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

	return _typeof(val);	
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
	var rootNode = createNode({
		value: data,
		key: getDataType(data),
		type: getDataType(data)
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

AbstractTree.prototype.instanciateMembers = function(tree, targetComponent, nodeFilterFunction) {
	var component;
	this.traverseTree(tree, this, function(memberDesc, parentComponent) {
		if (typeof nodeFilterFunction !== 'function') {
			component = this.createMember(memberDesc, parentComponent);
		}
		else {
			memberDesc = nodeFilterFunction(memberDesc);
			component = this.createMember(memberDesc, parentComponent);
			if (!memberDesc.children.length) {
				component.registerClickEvents = function() {
					Object.getPrototypeOf(this).registerClickEvents.call(this);
					this.view.subViewsHolder.memberViews[1].getRoot().addEventListener('click', function() {
						targetComponent.streams.updateChannel.value = node.projectedData;
					});
				}
			}
			else {
				component.addEventListener('clicked_ok', function() {
					this.streams.expanded.value = !this.streams.expanded.value ? 'expanded' : null;
				}.bind(component));
			}
		}
		return component;
	});
}

AbstractTree.prototype.renderJSON = function(jsonData, targetComponent, nodeFilterFunction) {
	var parsedData = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
	var tree = this.createTree(parsedData);
	this.instanciateMembers(tree, targetComponent, nodeFilterFunction);
	this.render(this, this.view, this.listTemplate);
	return tree;
}

AbstractTree.prototype.render = function() { } 	// pure virtual (injected as a dependancy by AppIgnition)




















// Abstract types & abstract implementations re-injection
componentTypes.ComponentList = ComponentList;
componentTypes.AbstractTree = AbstractTree;
componentTypes.LazySlottedComposedComponent = LazySlottedComposedComponent;
componentTypes.ComponentWithView = Components.ComponentWithView;
componentTypes.ComponentWithHooks = Components.ComponentWithHooks;
componentTypes.VisibleStateComponent = VisibleStateComponent;

// Some formal implementations rely on Dependancy Injection
componentTypes.CompositorComponent.prototype.acquireCompositor = function(inheritingType, inheritedType) {	// special helper
	if (inheritedType in componentTypes) {
		var objectType = inheritingType.prototype.objectType;
		inheritingType.prototype.Compositor = componentTypes[inheritedType];
		inheritingType.prototype = Components.ExtensibleObject.prototype.mergeOwnProperties(true, Object.create(componentTypes[inheritedType].prototype), inheritingType.prototype);
		inheritingType.prototype.objectType = objectType;
		if (!inheritingType.prototype._implements.length)
			inheritingType.prototype._implements = [inheritedType];
		else
			inheritingType.prototype._implements.push(inheritedType);
	}
}


//componentTypes.TabPanel.prototype = Components.ExtensibleObject.prototype.mergeOwnProperties(true, Object.create(LazySlottedComposedComponent.prototype), componentTypes.TabPanel.prototype);
//componentTypes.TabPanel.prototype.Compositor = LazySlottedComposedComponent;
//componentTypes.TabPanel.prototype.objectType = 'TabPanel';
//componentTypes.TabPanel.prototype._implements = ['LazySlottedComposedComponent'];
//
//componentTypes.ComponentTabPanel.prototype = Components.ExtensibleObject.prototype.mergeOwnProperties(true, Object.create(componentTypes.TabPanel.prototype), componentTypes.ComponentTabPanel.prototype);
//componentTypes.ComponentTabPanel.prototype.objectType = 'ComponentTabPanel';
//componentTypes.ComponentTabPanel.prototype._implements = ['TabPanel', 'LazySlottedComposedComponent'];

//componentTypes.LazySlottedComponent.prototype.ComposedComponent = ComposedComponent;
//console.log(Object.create(componentTypes.LazySlottedComponent.prototype));
//console.log(componentTypes.TabPanel.prototype);



ComposedComponent.componentTypes = componentTypes;
module.exports = ComposedComponent;