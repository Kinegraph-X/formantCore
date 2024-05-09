/**
 * @Singletons & @Factories : Core Template Ctor
 */

var UIDGenerator = require('src/core/UIDGenerator');
var exportedObjects = {};



/**
 * @typedef {import("src/core/CoreTypes").Stream} Stream
 * @typedef {import("src/core/CoreTypes").EventEmitter} EventEmitter
 * @typedef {import("src/core/CoreTypes").Command} Command
 * @typedef {import("src/core/Component").HierarchicalObject} HierarchicalObject
 * @typedef {import("src/core/Component").ComponentWithObservables} ComponentWithObservables
 * @typedef {import("src/editing/AbstractStylesheet")} AbstractStylesheet
 * @typedef {import("src/events/JSKeyboardMap")} KeyboardMap
 */


/**
 * @constructor ValueObject
 * @param {ViewTemplate|HierarchicalTemplate} defObj
 * @param {String} isSpecial
 */
var ValueObject = function(defObj, isSpecial) {
	// @ts-ignore : "Expression not callable: {} has no signature" => seems calling a function defined as "described property" isn't supported
	this.set(defObj, isSpecial);
}
ValueObject.prototype.objectType = 'ValueObject';
exportedObjects.ValueObject = ValueObject;
Object.defineProperty(ValueObject.prototype, 'model', {value : null});			// virtual
Object.defineProperty(ValueObject.prototype, 'get',{
	value : function() {}
});
Object.defineProperty(ValueObject.prototype, 'isEmpty', {
	/**
	 * @param {Object} obj
	 */
	value : function(obj) {
		for(var prop in obj) {
			return false;
		};
		return true;
	}
});
Object.defineProperty(ValueObject.prototype, 'set', {
	/**
	 * @param {ViewTemplate|HierarchicalTemplate} def
	 * @param {String} isSpecial
	 */
	value : function(def, isSpecial) {
		const keys = Object.keys(def);
		keys.forEach((/** @type {keyof (ViewTemplate|HierarchicalTemplate)} */p) => {
			if (isSpecial === 'rootOnly' && def[p])
				this[p] = def[p];
			else {
				const n = p + 'Model';
				if (n in exportedObjects) {
					if (Array.isArray(def[p])) {
						// @ts-ignore : "string cannot index {typeof exportedObjects}" : 
						// => but we already tested "n in exportedObjects" 2 lines above
						if (exportedObjects[n] === PropFactory) {
							// @ts-ignore : "property length does not exist on type never" : 
							// => but we already tested "Array.isArray(def[p])" 2 lines above
							for(let i = 0, l = def[p].length; i < l; i++) {
								// @ts-ignore : "property push does not exist on type never" : 
								// => but attributes, props & states are initialized as array in the child-ctor
								this[p].push(PropFactory(def[p][i]));
							}
						}
						else {
							// @ts-ignore : "property length does not exist on type never" : 
							// => but we already tested "Array.isArray(def[p])" a few lines above
							for(let i = 0, l = def[p].length; i < l; i++) {
								// @ts-ignore : "property push does not exist on type never" : 
								// => we can rely here on the fact that the object passed by the user is already type-checked
								// so a prop passed as array DO correspond to an array initialized in the child-ctor
								this[p].push(
									// @ts-ignore : "string cannot index {typeof exportedObjects}" : 
									// => but we already tested "n in exportedObjects" a few lines above
									new exportedObjects[n](def[p][i], isSpecial)
								);
							}
						}
					}
					// @ts-ignore : "property host does not exist on type never" : 
					// => but we're indeed testing if it exists
					else if (def[p] && def[p].host)
						//@ts-ignore : "type HierarchicalComponentDefModel is not assignable to type never" : 
						// Here, we recurse depending on what the user gave us: if the user wants it, we must do it
						this[p] = new HierarchicalComponentDefModel(def[p], isSpecial);
					// @ts-ignore : "property type does not exist on type never" : 
					// => but we're indeed testing if it exists						
					else if (def[p] && def[p].type === 'ComponentList')
						//@ts-ignore : "type ComponentListDefModel is not assignable to type never" : 
						// Here, we recurse depending on what the user gave us: if the user wants it, we must do it
						this[p] = new ComponentListDefModel(def[p], isSpecial);
					else if (def[p] !== null)
						// @ts-ignore : "string cannot index {typeof exportedObjects}" & "type exportedObjects[p] is not assignable to type never" : 
						// => but we already tested "n in exportedObjects" a few lines above
						this[p] = new exportedObjects[n](def[p], isSpecial);
				}
				else
					this[p] = def[p];
			}
		})
	}
});



/**
 * @constructor 
 * @param {Object} obj
 * @param {String} isSpecial
 */
var OptionsModel = function(obj, isSpecial) {
	ValueObject.call(this, obj, isSpecial);
}
OptionsModel.prototype = Object.create(ValueObject.prototype);
Object.defineProperty(OptionsModel.prototype, 'objectType', {value :  'AttributesList'});
exportedObjects.OptionsModel = OptionsModel;


/**
 * @constructor KeyboardHotkeysModel
 * @param {Object} obj					// KeyboardHotkeysTemplate
 * @param {String} isSpecial
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
 * @constructor PropFactory
 * @param {Object} obj
 */
var PropFactory = function(obj) {
	
	var key = typeof obj === 'string' 
		? obj
		// @ts-ignore : "property getName does not exist on type Object" : 
		// we're indeed allowing to pass already typed object or native objects
		: (obj.getName 
			// @ts-ignore : "property getName does not exist on type Object" : idem
			? obj.getName() 
			: AbstractProp.prototype.getName.call(obj));
	
	if (!(key in PropFactory.props)) {
		// @ts-ignore : "Expression of type any can't be used to index type {}" :
		//  => accessing an object defined as a "described property" isn't supported
		PropFactory.props[key] = new Function('obj', 'this["' + key + '"] = obj["' + key + '"];');
		// @ts-ignore : "Expression of type any can't be used to index type {}" : idem
		PropFactory.props[key].prototype = {};
		// @ts-ignore : "Expression of type any can't be used to index type {}" : idem
		Object.defineProperty(PropFactory.props[key].prototype, 'getName', {
			value :  new Function('return "' + key + '";')
		});
		// @ts-ignore : "Expression of type any can't be used to index type {}" : idem
		Object.defineProperty(PropFactory.props[key].prototype, 'getValue', {
			value :  new Function('return this["' + key + '"];')
		});
		// @ts-ignore : "Expression of type any can't be used to index type {}" : idem
		Object.defineProperty(PropFactory.props[key].prototype, 'key', {
			value :  key
		});
		// @ts-ignore : "Expression of type any can't be used to index type {}" : idem
		Object.defineProperty(PropFactory.props[key].prototype, 'objectType', {
			value :  'AbstractProp'
		});
		// @ts-ignore : "Expression of type any can't be used to index type {}" : idem
		return (new PropFactory.props[key](obj));
	}
	else {
		// @ts-ignore : "Expression of type any can't be used to index type {}" : idem
		return (new PropFactory.props[key](obj));
	}
		
}
PropFactory.prototype = Object.create(ValueObject.prototype);
PropFactory.props = {};
exportedObjects.PropFactory = PropFactory;



/**
 * @constructor AbstractProp
 * @param {Object} obj
 */
var AbstractProp = function(obj){
	var key = typeof obj === 'string' 
		? obj
		// @ts-ignore : "property getName does not exist on type Object" : 
		// we're indeed allowing to pass a native object or just a string representing the name of the prop
		: this.getName.call(obj);
	// @ts-ignore : "Expression of type any can't be used to index type AbstractProp" : 
	// naming the propos is indeed at discretion of the user
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
 * @param {Object} obj
 */
var AttributeModel = function(obj) {
	AbstractProp.call(this, obj);
}
AttributeModel.prototype = Object.create(AbstractProp.prototype);
exportedObjects.AttributeModel = AttributeModel;
Object.defineProperty(AttributeModel.prototype, 'objectType', {value :  'Attribute'});


/**
 * @constructor StateModel
 * @param {Object} obj
 */
var StateModel = function(obj) {
	AbstractProp.call(this, obj);
};
StateModel.prototype = Object.create(AbstractProp.prototype);
exportedObjects.StateModel = StateModel;
Object.defineProperty(StateModel.prototype, 'objectType', {value : 'States'});


/**
 * @constructor PropModel
 * @param {Object} obj
 */
var PropModel = function(obj) {
	AbstractProp.call(this, obj);
};
PropModel.prototype = Object.create(AbstractProp.prototype);
exportedObjects.PropModel = PropModel;
Object.defineProperty(PropModel.prototype, 'objectType', {value : 'Props'});


/**
 * @typedef {Object} ReactivityQueryTemplate
 * @prperty {Boolean} cbOnly
 * @prperty {String} from 
 * @prperty {String} to
 * @prperty {HTMLElement|Stream} obj
 * @prperty {Function} filter
 * @prperty {Function} map
 * @prperty {Function} subscribe
 * @prperty {Function} inverseTransform
 */

/**
 * @constructor ReactivityQuery
 * @param {ReactivityQueryTemplate} obj
 * @param {String} isSpecial
 */
var ReactivityQueryModel = function(obj, isSpecial) {
	this.cbOnly = false;						// Boolean
	this.from = null;							// String
	this.to = null;								// String
	this.obj = null,							// Object [HTMLElement; Stream]
	this.filter = null;							// function (Glorified Pure Function)
	this.map = null;							// function (Glorified Pure Function)
	this.subscribe = null;						// function CallBack
	this.inverseTransform = null;				// function CallBack
	
	ValueObject.call(this, obj, isSpecial);
}
ReactivityQueryModel.prototype = Object.create(ValueObject.prototype);
exportedObjects.ReactivityQueryModel = ReactivityQueryModel;
Object.defineProperty(ReactivityQueryModel.prototype, 'objectType', {value : 'ReactivityQuery'});
Object.defineProperty(ReactivityQueryModel.prototype, 'subscribeToStream', {
	/**
	 * @param {Stream} stream
	 * @param {ComponentWithObservables} queriedOrQueryingObj
	 */
	value : function(stream, queriedOrQueryingObj) {
		if (!this.cbOnly
			// @ts-ignore : "expression of type any can't be used to type {}"
			// queriedOrQueryingObj.streams isn't typed cause naming the streams is at the discretion of the user
			// => We're indeed testing if that name exists
			&& !queriedOrQueryingObj.streams[this.to] 
			&& !this.subscribe) {
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
					.filter(this.filter, queriedOrQueryingObj)
					.map(this.map, queriedOrQueryingObj)
					.reverse(this.inverseTransform)
			);
		}
		else {
			queriedOrQueryingObj._subscriptions.push(
				// @ts-ignore : "expression of type any can't be used to type {}"
				// queriedOrQueryingObj.streams isn't typed cause naming the streams is at the discretion of the user
				// => We've indeed already tested if that name exists
				stream.subscribe(queriedOrQueryingObj.streams[this.to], 'value')
					.filter(this.filter, queriedOrQueryingObj)
					.map(this.map, queriedOrQueryingObj)
					.reverse(this.inverseTransform)
			);
		}

		var subscription = queriedOrQueryingObj._subscriptions[queriedOrQueryingObj._subscriptions.length - 1];
		
		if (stream._value)
			stream.subscriptions[stream.subscriptions.length - 1].execute(stream._value);
			
		return subscription;
}});




/**
 * @typedef {Object} EventSubscriptionTemplate
 * @prperty {String} on 
 * @prperty {Function} subscribe
 */

/**
 * @constructor EventSubscription
 * @param {EventSubscriptionTemplate} obj
 * @param {String} isSpecial
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
	/**
	 * @param {EventEmitter} targetComponent
	 * @param {EventEmitter} requestingComponent
	 */
	value : function(targetComponent, requestingComponent) {
		targetComponent.addEventListener(this.on, this.subscribe.bind(requestingComponent));
}});



/**
 * @typedef {Object} TaskDefinitionTemplate
 * @prperty {String} type
 * @prperty {Function} task 
 * @prperty {Number} index
 */

/**
 * @constructor TaskDefinition
 * @param {TaskDefinitionTemplate} obj
 * @param {String} isSpecial
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
	/**
	 * @param {HierarchicalObject} thisArg
	 * @param {HierarchicalComponentDefModel} definition
	 */
	value : function(thisArg, definition) {
		this.task.call(thisArg, definition);
}});



/**
 * @typedef {Object} PublisherDefinitionTemplate
 * @prperty {String} _name
 * @property {Array<>} exportedTypes
 * @prperty {Stream} stream 
 * @prperty {String} _publisherUID
 */

/**
 * @constructor PublisherDefinitionModel (GlobalyReacheableStream)
 * @param {PublisherDefinitionTemplate} obj
 * @param {String} isSpecial
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

/*
 * I don't know what was the purpose of this
 * It seems completely fake
 */
//Object.defineProperty(PublisherDefinitionModel.prototype, 'tryReceiveConnection', {
//	value : function(subscriber) {
//			this.exportedTypes.forEach(function(type, sub) {
//				if (sub.acceptedTypes.indexOf(type) !== -1) {
//					this.stream.subscribe(sub.streams.updateChannel, 'value');
//				}
//			}.bind(this, subscriber));
//}});
//// Should not be used in the context of "single-provider" subscribers (the same DefinitionModel may be used in various types of registers)
//Object.defineProperty(PublisherDefinitionModel.prototype, 'tryLateReceiveConnection', {
//	value : function(publisherList) {
//		var publisher;
//		for(let publisherName in publisherList) {
//			publisher = publisherList[publisherName];
//			this.exportedTypes.forEach(function(type, pub) {
//				if (pub.exportedTypes.indexOf(type) !== -1) {
//					pub.stream.subscriptions.forEach(function(sub) {
//						this.stream.subscribe(sub.subscriber.obj, sub.subscriber.prop);
//					}, this);
//				}
//			}.bind(this, publisher));
//		}
//}});
// TODO (we must evaluate this use case in real world, first): 
// => should also be able to lateDisconnect:
// when queried, answers true if it already holds a subscription
// for the currently handled type and for the currently handled subscriber
// (the register is responsible of passing those as args).
// 	=> case of a subscriber which should only have -one- provider for a given type (color, font, padding, etc.) 








/**
 * @typedef {Object} ViewTemplate
 * @property {String|null} [UID]
 * @property {String|null} [type]
 * @property {Boolean} [isCompound]
 * @property {String|null} [nodeName]
 * @property {String|null} [n]
 * @property {Boolean|null} [isCustomElem]
 * @property {String} [templateNodeName]
 * @property {Array<AttributeModel>} [attributes]
 * @property {Number} [section]
 * @property {Array<PropModel>} [props]
 * @property {Array<StateModel>} [states]
 * @property {Array<PropModel|StateModel>} [streams]
 * @property {Number|null} [targetSlotIndex]
 * @property {AbstractStylesheet|null} [sWrapper]
 * @property {AbstractStylesheet|null} [sOverride]
 * @property {Command|null} [command]
 * @property {Array<ReactivityQueryModel>} [reactOnParent]
 * @property {Array<ReactivityQueryModel>} [reactOnSelf]
 * @property {Array<EventSubscriptionModel>} [subscribeOnParent]
 * @property {Array<EventSubscriptionModel>} [subscribeOnChild]
 * @property {Array<EventSubscriptionModel>} [subscribeOnSelf]
 * @property {Array<KeyboardMap>} [keyboardSettings] 	<-- this is wrong, but not used until now
 * @property {Array<KeyboardHotkeysModel>} [keyboardEvents]
 * @property {Boolean} [isDummy]
 */


/**
 * @constructor SingleLevelComponentDefModel
 * @param {ViewTemplate | SingleLevelComponentDefModel | 'bare'} obj
 * @param {String} isSpecial
 * @param {ViewTemplate|null} givenDef
 */
var SingleLevelComponentDefModel = function(obj, isSpecial = '', givenDef = null) {
	if (givenDef)
		Object.assign(this, givenDef);
	else {
		this.UID = null								// String (overridden at function end)
		this.type = null,							// String
		this.isCompound = false;					// Boolean
		this.nodeName = null;						// String
		this.n = null;								// String
		this.isCustomElem = null;					// Boolean
		this.templateNodeName = null;				// String
		this.attributes = Array();					// Array [AttributeDesc]
		this.section = null;						// Number
		this.props = Array();						// Array [Prop]
		this.states = Array();						// Array [State]
		this.streams = Array();						// Array [Prop, States]
		this.targetSlotIndex = null;				// Number
		this.sWrapper = null;						// Object StylesheetWrapper
		this.sOverride = null;						// Object StylesheetWrapper
		this.command = null;						// Object Command
		this.reactOnParent = Array();				// Array [ReactivityQuery]
		this.reactOnSelf = Array();					// Array [ReactivityQuery]
		this.subscribeOnParent = Array();			// Array [EventSubscription]
		this.subscribeOnChild = Array();			// Array [EventSubscription]
		this.subscribeOnSelf = Array();				// Array [EventSubscription]
		this.keyboardSettings = Array();			// Array [KeyboardHotkeys]
		this.keyboardEvents = Array();				// Array [KeyboardListeners]
		this.isDummy = false;						// Boolean
	}

	if (obj !== 'bare')
		ValueObject.call(this, obj, isSpecial);
	
	this.UID = UIDGenerator.DefUIDGenerator.newUID().toString();
	
	// Fast-access props
	this.streams = this.props.concat(this.states);
	this.isCustomElem = this.nodeName !== null
		// @ts-ignore: "object is possibly null" : we just tested it isn't null
		? this.nodeName.indexOf('-') !== -1
		: null;
};
SingleLevelComponentDefModel.prototype = Object.create(ValueObject.prototype);
exportedObjects.SingleLevelComponentDefModel = SingleLevelComponentDefModel;
SingleLevelComponentDefModel.prototype.objectType = 'SComponentDef';
SingleLevelComponentDefModel.prototype.getType = function() {return this.type;}



/**
 * @typedef {Object} HierarchicalTemplate
 * @property {ViewTemplate|SingleLevelComponentDefModel|HierarchicalTemplate|HierarchicalComponentDefModel|ComponentListDefModel} host
 * @property {ViewTemplate[]|HierarchicalTemplate[]} [subSections]
 * @property {ViewTemplate[]|HierarchicalTemplate[]} [members]
 * @property {ListTemplate[]} [lists]
 * @property {OptionsModel} [options]
 */


/**
 * @constructor HierarchicalComponentDefModel
 * @param {HierarchicalTemplate|HierarchicalComponentDefModel|SingleLevelComponentDefModel} obj
 * @param {String} isSpecial
 */
var HierarchicalComponentDefModel = function(obj, isSpecial) {

	this.host = null;								// Object SingleLevelComponentDef
	this.subSections = Array();						// Array [SingleLevelComponentDef]
	this.members = Array();							// Array [SingleLevelComponentDef]
	this.lists = Array();							// Array [ComponentListDef]
	this.options = null;							// Object : plain

	ValueObject.call(this, obj, isSpecial);
}
HierarchicalComponentDefModel.prototype = Object.create(ValueObject.prototype);
exportedObjects.HierarchicalComponentDefModel = HierarchicalComponentDefModel;
Object.defineProperty(HierarchicalComponentDefModel.prototype, 'objectType', {value : 'MComponentDef'});

HierarchicalComponentDefModel.prototype.getGroupHostDef = function() {
	return (this.host && this.host.host);
}
HierarchicalComponentDefModel.prototype.getHostDef = function() {
	return this.host;
}
HierarchicalComponentDefModel.prototype.getSection = function() {
	// @ts-ignore : "Expression not callable: {} has no signature" => seems calling a function defined as "described property" isn't supported
	return this.getHostDef().section !== null
		// @ts-ignore : "Expression not callable: {} has no signature" => seems calling a function defined as "described property" isn't supported
		? this.getHostDef().section
		: (
			// @ts-ignore : "Expression not callable: {} has no signature" => seems calling a function defined as "described property" isn't supported
			(this.getGroupHostDef() && this.getGroupHostDef().section)
			|| -1
		);
}



/**
 * @typedef {Object} ListTemplate
 * @property {String} UID
 * @property {String} type
 * @property {Boolean} reflectOnModel
 * @property {Boolean} augmentModel
 * @property {Array<any>} each
 * @prperty {Object} item
 * @prperty {HierarchicalComponentDefModel} template
 * @prperty {Number} section
 * @prperty {Boolean} isInternal
 */

/**
 * @constructor ComponentListDef
 * @param {ListTemplate} obj
 * @param {String} isSpecial
 */
var ComponentListDefModel = function(obj, isSpecial = '') {

	this.UID = typeof obj.UID === 'string' ? obj.UID : UIDGenerator.DefUIDGenerator.newUID().toString();
	this.type = 'ComponentList';				// String
	this.reflectOnModel = true;					// Boolean
	this.augmentModel = false;					// Boolean
	this.each = Array();								// Array [unknown_type] (model to iterate on)
	this.item = null;							// Object (an item of the model)
	this.template = null;						// Object HierarchicalComponentDef
	this.section = null;						// Number
	this.isInternal = false;					// Boolean

	ValueObject.call(this, obj, isSpecial);
}
ComponentListDefModel.prototype = Object.create(ValueObject.prototype);
exportedObjects.ComponentListDefModel = ComponentListDefModel;
Object.defineProperty(ComponentListDefModel.prototype, 'objectType', {value : 'ComponentListDef'});











/**
 * @factory MockedDefModel
 * @param {ViewTemplate} obj
 */
var mockDef = function(obj) {
	var dummyObj = {UID : 'dummy'};
	return new HierarchicalComponentDefModel(
		{
			host : new SingleLevelComponentDefModel(
				(obj && Object.prototype.toString.call(obj) === '[object Object]')
					? Object.assign(dummyObj, obj)
					: dummyObj)
		},
		'rootOnly');
}
exportedObjects.mockDef = mockDef;

/**
 * @factory MockedGroupDefModel
 */
var mockGroupDef = function() {
	/** @type {ViewTemplate} */
	const dummyTemplate =  {};
	return new HierarchicalComponentDefModel(
		{
			host : new HierarchicalComponentDefModel({
				host : new SingleLevelComponentDefModel(dummyTemplate)
			}, 'rootOnly')
	}, 'rootOnly');
}
exportedObjects.mockGroupDef = mockGroupDef;










/**
 * @helper setAcceptsProp
 * @param {HierarchicalComponentDefModel} definition
 * @param {String} accepts
 * @param {String} title
 * @param {Number} onMember
 */
var setAcceptsProp = function(definition, accepts, title, onMember) {
	var acceptsObj = {accepts : accepts};
	var titleObj = {title : title};
	if (definition.getGroupHostDef()) {
		if (title) {
			if (typeof onMember === 'number') {
				definition.members[onMember].getHostDef().attributes.push(
					new PropFactory(titleObj)
				)
			}
			else
				definition.getGroupHostDef().props.push(
					new PropFactory(titleObj)
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
					new PropFactory(titleObj)
				)
			else
				definition.getHostDef().props.push(
					new PropFactory(titleObj)
			)
		}
		
		definition.getHostDef().props.push(
			new PropFactory(acceptsObj)
		)
	}
}







/**
 * @factory HierarchicalComponentDefModel
 * @param {ViewTemplate & SingleLevelComponentDefModel & HierarchicalTemplate & HierarchicalComponentDefModel & ComponentListDefModel} defObj
 */
var createDef = function(defObj) {
	// MASTER VIEW OF A COMPOUND COMPONENT
	if ((defObj.type && defObj.type === 'CompoundComponent') || defObj.isCompound) {
		return (new HierarchicalComponentDefModel({host : new SingleLevelComponentDefModel(defObj, 'hostOnly')}, 'rootOnly'));
	}
	// COMPONENT LIST
	else if (!defObj.host && defObj.type === 'ComponentList')
		return (new HierarchicalComponentDefModel({host : new ComponentListDefModel(defObj)}, 'rootOnly'));
	// VIEW DEF || HOST or VIEW OF A SIMPLE COMPONENT
	else if (!defObj.host) {
		// nodeName may be aliased as "n""
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
 * @helper creates a hierarchical def even without a "host" prop
 * @param {ViewTemplate & SingleLevelComponentDefModel & HierarchicalTemplate & HierarchicalComponentDefModel & ComponentListDefModel} defObj
 */
var createHostDef = function(defObj) {
	return (new HierarchicalComponentDefModel({host : new SingleLevelComponentDefModel(defObj, 'hostOnly')}, 'rootOnly'));
}
exportedObjects.createHostDef = createHostDef;





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
	optionsModel : OptionsModel,									// Object OptionsModel
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
	
	propsAreArray : propsAreArray,									// Array
	reactivityQueries : reactivityQueries,							// Array
	eventQueries : eventQueries,									// Array
	propsArePrimitives : propsArePrimitives							// Array
});








module.exports = exportedObjects