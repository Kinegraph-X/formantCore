/**
 * @Singleton & @Factories : Core Definitions Ctor
 */

var UIDGenerator = require('src/core/UIDGenerator');
var exportedObjects = {};






/**
 * @constructor ValueObject
 */
var ValueObject = function(defObj, isSpecial) {
	this.set(defObj, isSpecial);
}
ValueObject.prototype.objectType = 'ValueObject';
exportedObjects.ValueObject = ValueObject;
Object.defineProperty(ValueObject.prototype, 'model', {value : null});			// virtual
Object.defineProperty(ValueObject.prototype, 'get',{
	value : function() {}
});
Object.defineProperty(ValueObject.prototype, 'getGroupHostDef',{
	value : function() {return (this.host && this.host.host);}
});
Object.defineProperty(ValueObject.prototype, 'getHostDef',{
	value : function() {return this.host;}
});
Object.defineProperty(ValueObject.prototype, 'getType',{
	value : function() {return this.type;}
});
Object.defineProperty(ValueObject.prototype, 'getSection',{
	value : function() {
		return this.getHostDef().section !== null
				? this.getHostDef().section
						: (
								(this.getGroupHostDef() && this.getGroupHostDef().section)
								|| -1
							);
	}
});
Object.defineProperty(ValueObject.prototype, 'fromArray',{
	value : function(arr) {
		var i = 0;
		for (let p in this.model) {
			this[p] = arr[i++];
		}
	}
});
Object.defineProperty(ValueObject.prototype, 'isEmpty', {
	value : function(obj) {
		for(var prop in obj) {
			return false;
		};
		return true;
	}
});Z
Object.defineProperty(ValueObject.prototype, 'set', {
	value : function(def, isSpecial) {
		for (let p in def) {
			if (isSpecial === 'rootOnly' && def[p])
				this[p] = def[p];
			else {
				const n = p + 'Model';
				if (n in exportedObjects) {
					if (Array.isArray(def[p])) {
						if (exportedObjects[n] === PropFactory) {
							for(let i = 0, l = def[p].length; i < l; i++) {
								this[p].push(PropFactory(def[p][i]));
							}
						}
						else {
							for(let i = 0, l = def[p].length; i < l; i++) {
								this[p].push(new exportedObjects[n](def[p][i], isSpecial));
							}
						}
					}
					else if (def[p] && def[p].host)
						this[p] = new HierarchicalComponentDefModel(def[p], isSpecial);
					else if (def[p] && def[p].type === 'ComponentList')
						this[p] = new ComponentListDefModel(def[p], isSpecial);
					else if (def[p] !== null)
						this[p] = new exportedObjects[n](def[p], isSpecial);
				}
				else
					this[p] = def[p];
			}
		}
	}
});



/**
 * @constructor OptionsListModel
 * @extends ValueObject
 */
var OptionsListModel = function(obj, isSpecial) {
	ValueObject.call(this, obj, isSpecial);
}
OptionsListModel.prototype = Object.create(ValueObject.prototype);
Object.defineProperty(OptionsListModel.prototype, 'objectType', {value :  'AttributesList'});
exportedObjects.OptionsListModel = OptionsListModel;


/**
 * @constructor KeyboardHotkeysModel
 * @extends ValueObject
 */
var KeyboardHotkeysModel = function(obj, isSpecial) {
	this.ctrlKey = false;						// Boolean
	this.shiftKey = false;						// Boolean
	this.altKey = false;						// Boolean
	this.keyCode = 0;							// Number
	ValueObject.call(this, obj, isSpecial);
};
KeyboardHotkeysModel.prototype = Object.create(ValueObject.prototype);
exportedObjects.KeyboardHotkeysModel = KeyboardHotkeysModel;
Object.defineProperty(KeyboardHotkeysModel.prototype, 'objectType', {value : 'KeyboardHotkeys'});



















/**
 * @factory PropFactory
 * 
 */
var PropFactory = function(obj) {
	
	var key = typeof obj === 'string' ? obj : (obj.getName ? obj.getName() : AbstractProp.prototype.getName.call(obj));
	
	if (!(key in PropFactory.props)) {
		PropFactory.props[key] = new Function('obj', 'this["' + key + '"] = obj["' + key + '"];');
		PropFactory.props[key].prototype = {};
		Object.defineProperty(PropFactory.props[key].prototype, 'getName', {
			value :  new Function('return "' + key + '";')
		});
		Object.defineProperty(PropFactory.props[key].prototype, 'getValue', {
			value :  new Function('return this["' + key + '"];')
		});
		Object.defineProperty(PropFactory.props[key].prototype, 'key', {
			value :  key
		});
		Object.defineProperty(PropFactory.props[key].prototype, 'objectType', {
			value :  'AbstractProp'
		});
		return (new PropFactory.props[key](obj));
	}
	else {
		return (new PropFactory.props[key](obj));
	}
		
}
PropFactory.props = {};
exportedObjects.PropFactory = PropFactory;



/**
 * @constructor AbstractProp
 * @extends ValueObject
 */
var AbstractProp = function(obj){
	var key = typeof obj === 'string' ? obj : this.getName.call(obj);
	this[key] = obj[key];
}
AbstractProp.prototype = Object.create(ValueObject.prototype);
Object.defineProperty(AbstractProp.prototype, 'getName', {
	value :  function() {
		for(let name in this)
			return name; 
}});
Object.defineProperty(AbstractProp.prototype, 'getValue', {
	value :  function() {
		for(let name in this)
			 return this[name]; 
}});


/**
 * @constructor AttributeModel
 * @extends AbstractProp
 */
var AttributeModel = function(obj) {
	AbstractProp.call(this, obj);
}
AttributeModel.prototype = Object.create(AbstractProp.prototype);
exportedObjects.AttributeModel = AttributeModel;
Object.defineProperty(AttributeModel.prototype, 'objectType', {value :  'Attribute'});


/**
 * @constructor StateModel
 * @extends AbstractProp
 */
var StateModel = function(obj) {
	AbstractProp.call(this, obj);
};
StateModel.prototype = Object.create(AbstractProp.prototype);
exportedObjects.StateModel = StateModel;
Object.defineProperty(StateModel.prototype, 'objectType', {value : 'States'});


/**
 * @constructor PropModel
 * @extends AbstractProp
 */
var PropModel = function(obj) {
	AbstractProp.call(this, obj);
};
PropModel.prototype = Object.create(AbstractProp.prototype);
exportedObjects.PropModel = PropModel;
Object.defineProperty(PropModel.prototype, 'objectType', {value : 'Props'});




/**
 * @constructor ReactivityQuery
 * @extends ValueObject
 */
var ReactivityQueryModel = function(obj, isSpecial) {
	this.cbOnly = false;						// Boolean
	this.from = null;							// String
	this.to = null;								// String
	this.obj = null,							// Object [HTMLElement; Stream]
	this.filter = null;							// function (GlorifiedPureFunction ;)
	this.map = null;							// function (GlorifiedPureFunction ;)
	this.subscribe = null;						// function CallBack
	this.inverseTransform = null;				// function CallBack
	
	ValueObject.call(this, obj, isSpecial);
}
ReactivityQueryModel.prototype = Object.create(ValueObject.prototype);
exportedObjects.ReactivityQueryModel = ReactivityQueryModel;
Object.defineProperty(ReactivityQueryModel.prototype, 'objectType', {value : 'ReactivityQuery'});
Object.defineProperty(ReactivityQueryModel.prototype, 'subscribeToStream', {
	value : function(stream, queriedOrQueryingObj) {
		if (!this.cbOnly && !queriedOrQueryingObj.streams[this.to] && !this.subscribe) {
			console.warn('missing stream or subscription callback on child subscribing from ' + stream.name + ' to ' + this.to);
			return;
		}
		else if (typeof stream === 'undefined') {
			console.error('no stream object passed for subscription', queriedOrQueryingObj, this.from, this.to);
			return;
		}
		if (this.cbOnly) {
			queriedOrQueryingObj._subscriptions.push(
				stream.subscribe(this.subscribe.bind(queriedOrQueryingObj))
					.filter(this.filter)
					.map(this.map)
					.reverse(this.inverseTransform)
			);
		}
		else {
			queriedOrQueryingObj._subscriptions.push(
				stream.subscribe(queriedOrQueryingObj.streams[this.to], 'value')
					.filter(this.filter)
					.map(this.map)
					.reverse(this.inverseTransform)
			);
		}

		var subscription = queriedOrQueryingObj._subscriptions[queriedOrQueryingObj._subscriptions.length - 1];
		
		if (stream._value)
			stream.subscriptions[stream.subscriptions.length - 1].execute(stream._value);
			
		return subscription;
}});



/**
 * @constructor EventSubscription
 * @extends ValueObject
 */
var EventSubscriptionModel = function(obj, isSpecial) {

	this.on = null;								// String
	this.subscribe = null;						// function CallBack
	ValueObject.call(this, obj, isSpecial);
}
EventSubscriptionModel.prototype = Object.create(ValueObject.prototype);
exportedObjects.EventSubscriptionModel = EventSubscriptionModel;
Object.defineProperty(EventSubscriptionModel.prototype, 'objectType', {value : 'EventSubscription'});
Object.defineProperty(EventSubscriptionModel.prototype, 'subscribeToEvent', {
	value : function(targetComponent, requestingComponent) {
		targetComponent.addEventListener(this.on, this.subscribe.bind(requestingComponent));
}});

/**
 * @constructor TaskDefinition
 * @extends ValueObject
 */
var TaskDefinitionModel = function(obj, isSpecial) {

	this.type = null;						// String
	this.task = null;						// function CallBack
	this.index = null;						// number
	ValueObject.call(this, obj, isSpecial);
}
TaskDefinitionModel.prototype = Object.create(ValueObject.prototype);
exportedObjects.TaskDefinitionModel = TaskDefinitionModel;
Object.defineProperty(TaskDefinitionModel.prototype, 'objectType', {value : 'asyncTaskSubscription'});
Object.defineProperty(TaskDefinitionModel.prototype, 'execute', {
	value : function(thisArg, definition) {
		this.task.call(thisArg, definition);
}});





/**
 * @constructor PublisherDefinition
 * @extends ValueObject
 */
var PublisherDefinitionModel = function(obj, isSpecial) {
	
	this._name = null;						// String
	this.exportedTypes = null;				// Array
	this.stream = null;						// Stream
	this._publisherUID = null;				// String
	ValueObject.call(this, obj, isSpecial);
}
PublisherDefinitionModel.prototype = Object.create(ValueObject.prototype);
exportedObjects.PublisherDefinitionModel = PublisherDefinitionModel;
Object.defineProperty(PublisherDefinitionModel.prototype, 'objectType', {value : 'GlobalyReacheableStream'});
Object.defineProperty(PublisherDefinitionModel.prototype, 'tryReceiveConnection', {
	value : function(subscriber) {
			this.exportedTypes.forEach(function(type, sub) {
				if (sub.acceptedTypes.indexOf(type) !== -1) {
					this.stream.subscribe(sub.streams.updateChannel, 'value');
				}
			}.bind(this, subscriber));
}});
// Should not be used in the context of "single-provider" subscribers (the same DefinitionModel may be used in various types of registers)
Object.defineProperty(PublisherDefinitionModel.prototype, 'tryLateReceiveConnection', {
	value : function(publisherList) {
		var publisher;
		for(let publisherName in publisherList) {
			publisher = publisherList[publisherName];
			this.exportedTypes.forEach(function(type, pub) {
				if (pub.exportedTypes.indexOf(type) !== -1) {
					pub.stream.subscriptions.forEach(function(sub) {
						this.stream.subscribe(sub.subscriber.obj, sub.subscriber.prop);
					}, this);
				}
			}.bind(this, publisher));
		}
}});
// TODO (we must evaluate this use case in real world, first): 
// => should also be able to lateDisconnect:
// when queried, answers true if it already holds a subscription
// for the currently handled type and for the currently handled subscriber
// (the register is responsible of passing those as args).
// 	=> case of a subscriber which should only have -one- provider for a given type (color, font, padding, etc.) 











/**
 * @constructor SingleLevelComponentDefModel
 * @extends ValueObject
 */
var SingleLevelComponentDefModel = function(obj, isSpecial, givenDef) {
	if (givenDef)
		Object.assign(this, givenDef);
	else {
		this.UID = null								// overridden at function end
		this.type = null,							// String
		this.isCompound = false;					// Boolean
		this.nodeName = null;						// String
		this.isCustomElem = null;					// Boolean
		this.templateNodeName = null;				// String
		this.attributes = [];						// Array [AttributeDesc]
		this.section = null;						// Number
		this.props = [];							// Array [Prop]
		this.states = [];							// Array [State]
		this.streams = [];							// Array [Prop, States]
		this.targetSlotIndex = null;				// Number
		this.sWrapper = null;						// Object StylesheetWrapper
		this.sOverride = null;						// Object StylesheetWrapper
		this.command = null;						// Object Command
		this.reactOnParent = [];					// Array [ReactivityQuery]
		this.reactOnSelf = [];						// Array [ReactivityQuery]
		this.subscribeOnParent = [];				// Array [EventSubscription]
		this.subscribeOnChild = [];					// Array [EventSubscription]
		this.subscribeOnSelf = [];					// Array [EventSubscription]
		this.keyboardSettings = [];					// Array [KeyboardHotkeys]
		this.keyboardEvents = [];					// Array [KeyboardListeners]
		this.isDummy = false;
	}

	if (obj !== 'bare')
		ValueObject.call(this, obj, isSpecial);
	
	this.UID = UIDGenerator.DefUIDGenerator.newUID().toString();
	
	// Fast-access props
	this.streams = this.props.concat(this.states);
	this.isCustomElem = this.nodeName !== null ? this.nodeName.indexOf('-') !== -1 : null;
};
SingleLevelComponentDefModel.prototype = Object.create(ValueObject.prototype);
exportedObjects.SingleLevelComponentDefModel = SingleLevelComponentDefModel;
Object.defineProperty(SingleLevelComponentDefModel.prototype, 'objectType', {value : 'SComponentDef'});



/**
 * @constructor HierarchicalComponentDefModel
 * @extends ValueObject
 */
var HierarchicalComponentDefModel = function(obj, isSpecial) {

	this.host = null;							// Object SingleLevelComponentDef
	this.subSections = [];						// Array [SingleLevelComponentDef]
	this.members = [];							// Array [SingleLevelComponentDef]
	this.lists = [];							// Array [ComponentListDef]
	this.options = null;						// Object : plain

	ValueObject.call(this, obj, isSpecial);
}
HierarchicalComponentDefModel.prototype = Object.create(ValueObject.prototype);
exportedObjects.HierarchicalComponentDefModel = HierarchicalComponentDefModel;
Object.defineProperty(HierarchicalComponentDefModel.prototype, 'objectType', {value : 'MComponentDef'});



/**
 * @constructor ComponentListDef
 * @extends ValueObject
 */
var ComponentListDefModel = function(obj, isSpecial) {

	this.UID = typeof obj.UID === 'string' ? obj.UID : UIDGenerator.DefUIDGenerator.newUID().toString();
	this.type = 'ComponentList';				// String
	this.reflectOnModel = true;					// Boolean
	this.augmentModel = false;					// Boolean
	this.each = [];								// Array [unknown_type] (model to iterate on)
	this.item = null;							// Object (an item of the model)
	this.template = null;						// Object HierarchicalComponentDef
	this.section = null;						// Number

	ValueObject.call(this, obj, isSpecial);
}
ComponentListDefModel.prototype = Object.create(ValueObject.prototype);
exportedObjects.ComponentListDefModel = ComponentListDefModel;
Object.defineProperty(ComponentListDefModel.prototype, 'objectType', {value : 'ComponentListDef'});











/**
 * @constructor MockedDefModel
 * @factory
 */
var mockDef = function(obj) {
	var dummyObj = {UID : 'dummy'};
	return new HierarchicalComponentDefModel({host : new SingleLevelComponentDefModel(
		(obj && Object.prototype.toString(obj) === '[object Object]') ? Object.assign(dummyObj, obj) : dummyObj
	)}, 'rootOnly');
}
exportedObjects.mockDef = mockDef;

/**
 * @constructor MockedGroupDefModel
 * @factory
 */
var mockGroupDef = function() {
	return new HierarchicalComponentDefModel({host : new HierarchicalComponentDefModel({
		host : new SingleLevelComponentDefModel()
	}, 'rootOnly'
	)}, 'rootOnly');
}
exportedObjects.mockGroupDef = mockGroupDef;











var setAcceptsProp = function(definition, accepts, title, onMember) {
	var acceptsObj = {accepts : accepts};
	var titleObj = {title : title};
	if (definition.getGroupHostDef()) {
		if (title) {
			if (typeof onMember === 'number')
				definition.members[onMember].getHostDef().attributes.push(
					new PropFactory(
						titleObj
					)
				)
			else
				definition.getGroupHostDef().props.push(
					new PropFactory(
						titleObj
					)
				)
		}
		definition.getGroupHostDef().props.push(
			new PropFactory(
				acceptsObj
			)
		)
	}
	else if (definition.getHostDef()) {
		if (title) {
			if (typeof onMember === 'number')
				definition.members[onMember].getHostDef().attributes.push(
					new PropFactory(
						titleObj
					)
				)
			else
				definition.getHostDef().props.push(
				new PropFactory(
					titleObj
				)
			)
		}
		
		definition.getHostDef().props.push(
			new PropFactory(
				acceptsObj
			)
		)
	}
}








var createDef = function(defObj) {
	// MASTER VIEW OF A COMPOUND COMPONENT
	if ((defObj.type && defObj.type === 'CompoundComponent') || defObj.isCompound) {
		return (new HierarchicalComponentDefModel({host : new SingleLevelComponentDefModel(defObj, 'hostOnly')}, 'rootOnly'));
	}
	// VIEW DEF || HOST or VIEW OF A SIMPLE COMPONENT
	else if (!defObj.host) {
		if (defObj.n && !defObj.type) {
			defObj.nodeName = defObj.n;
			delete defObj.n;
			return (new SingleLevelComponentDefModel(defObj));
		}
		else if ((defObj.nodeName && !defObj.type) || !defObj.isCompound) {
			return (new SingleLevelComponentDefModel(defObj));
		}
	}
	// COMPLETE COMPONENT
	else if (defObj.host) {
		return (new HierarchicalComponentDefModel(defObj, 'rootOnly'));
	}
}

exportedObjects.createDef = createDef;





/**
 * PRECIOUS HELPERS : for performance concerns, allows looping only on props that are arrays
 */
var propsAreArray = [
	'attributes',
	'states',
	'props',
	'streams',
	'reactOnParent',
	'reactOnSelf',
	'subscribeOnParent',
	'subscribeOnChild',
	'subscribeOnSelf'//,
//	'keyboardSettings',			// TODO: FIX that bypass : implement keyboard handling in the context of the v0.2
//	'keyboardEvents'
];
var reactivityQueries = [
	'reactOnParent',
	'reactOnSelf'
];
var eventQueries = [
	'subscribeOnParent',
	'subscribeOnChild',
	'subscribeOnSelf'
];
var propsArePrimitives = [
	'type',
	'nodeName',
	'isCustomElem',
	'templateNodeName',
	'targetSlotIndex',
	'section'
];











/**
 * @aliases
 */
Object.assign(exportedObjects, {
	attributesModel : PropFactory,									// Object AbstractProp
	statesModel : PropFactory,										// Object AbstractProp
	propsModel : PropFactory,										// Object AbstractProp
	streamsModel : PropFactory,										// Object AbstractProp
	TaskDefinition : TaskDefinitionModel,							// Object TaskDefinition
	PublisherDefinition : PublisherDefinitionModel,					// Object PublisherDefinition
	optionsModel : OptionsListModel,								// Object OptionsList
	// "host" key catch the special condition and should always be flat ("artificial" deepening of flat defs is handled in the ValueObject factory function)
	hostModel : SingleLevelComponentDefModel,						// Object SingleLevelComponentDef
	// "numericaly indexed" keys (in an array) catch the HierarchicalComponentDefModel
	subSectionsModel : HierarchicalComponentDefModel,				// Array [HierarchicalComponentDefModel]
	membersModel : HierarchicalComponentDefModel,					// Array [HierarchicalComponentDefModel]
	list : ComponentListDefModel,
	reactOnParentModel : ReactivityQueryModel,						// Object ReactivityQueryList
	reactOnSelfModel : ReactivityQueryModel,						// Object ReactivityQueryList
	subscribeOnParentModel : EventSubscriptionModel,				// Object EventSubscriptionsList
	subscribeOnChildModel : EventSubscriptionModel,					// Object EventSubscriptionsList
	subscribeOnSelfModel : EventSubscriptionModel,					// Object EventSubscriptionsList
	createSimpleComponentDef : HierarchicalComponentDefModel,		// Object HierarchicalComponentDef
	setAcceptsProp : setAcceptsProp,								// function : Helper
	
	UIDGenerator : UIDGenerator.UIDGenerator,
	StyleUIDGenerator : UIDGenerator.StyleUIDGenerator,
	DefUIDGenerator : UIDGenerator.DefUIDGenerator,
});








module.exports = exportedObjects