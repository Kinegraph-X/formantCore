/**
 * @Singletons : Core Object store
 */
var appConstants = require('src/appLauncher/appLauncher');
var exportedObjects = {};

/**
 * @constructor ValueObject
 */
var ValueObject = function(defObj, isSpecial) {
	this.set.apply(this, arguments);
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
});
Object.defineProperty(ValueObject.prototype, 'set', {
	value : function(def, isSpecial) {
//		var objectType = Object.getPrototypeOf(this).objectType;
//		console.trace(def, isSpecial);
		for (let p in def) {
//			console.log(p, this[p], def[p]);
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
//			console.log(p, this[p], def[p]);
		}
	}
});


//Object.defineProperty(ValueObject.prototype, 'renewArray', {
//	value : function(arr, prop) {
//		var objType = prop + 'Model';
//		if (!(objType in exportedObjects))
//			return [];
//		var ret = [];
//		for(let i = 0, l = arr.length; i < l; i++) {
//			ret.push(new exportedObjects[objType](arr[i]));
//		}
//		return ret;
//	}
//});

/**
 * @constructor OptionsListModel
 * @extends ValueObject
 */
var OptionsListModel = function() {
//	Object.assign(this, {});
	ValueObject.apply(this, arguments);
}
OptionsListModel.prototype = Object.create(ValueObject.prototype);
exportedObjects.OptionsListModel = OptionsListModel
Object.defineProperty(OptionsListModel.prototype, 'objectType', {value :  'AttributesList'});


/**
 * @constructor KeyboardHotkeysModel
 * @extends ValueObject
 */
var KeyboardHotkeysModel = function() {
//	Object.assign(this, {
		this.ctrlKey = false;						// Boolean
		this.shiftKey = false;						// Boolean
		this.altKey = false;						// Boolean
		this.keyCode = 0;							// Number
//	});
	ValueObject.apply(this, arguments);
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
		
		return (new PropFactory.props[key](obj));
	}
	else
		return (new PropFactory.props[key](obj));
}
PropFactory.props = {};
exportedObjects.PropFactory = PropFactory;



/**
 * @constructor AbstractProp
 * @extends ValueObject
 */
var AbstractProp = function(obj){
	var key = typeof obj === 'string' ? obj : this.getName.call(obj);
//	if (model = dictionary.solveFromDictionary('attributes', key))
//		Object.assign(this, model);
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
var ReactivityQueryModel = function() {
//	Object.assign(this, {
		this.cbOnly = false;						// Boolean
		this.from = null;							// String
		this.to = null;								// String
		this.obj = null,							// Object [HTMLElement; Stream]
		this.filter = null;							// function (GlorifiedPureFunction ;)
		this.map = null;							// function (GlorifiedPureFunction ;)
		this.subscribe = null;						// function CallBack
		this.inverseTransform = null;				// function CallBack
//	});
	ValueObject.apply(this, arguments);
}
ReactivityQueryModel.prototype = Object.create(ValueObject.prototype);
exportedObjects.ReactivityQueryModel = ReactivityQueryModel;
Object.defineProperty(ReactivityQueryModel.prototype, 'objectType', {value : 'ReactivityQuery'});
Object.defineProperty(ReactivityQueryModel.prototype, 'subscribeToStream', {
	value : function(stream, queriedOrQueryingObj) {
		if (!this.cbOnly && !queriedOrQueryingObj.streams[this.to] && !this.subscribe) {
			console.trace('missing stream or subscription callback on child subscribing to ' + stream.name + ' from ' + this.from);
			return;
		}
		else if (typeof stream === 'undefined') {
			console.log(queriedOrQueryingObj, this.from, this.to);
			return;
		}
		if (this.cbOnly)
			stream.subscribe(this.subscribe.bind(queriedOrQueryingObj));
		else {
			stream.subscribe(queriedOrQueryingObj.streams[this.to], 'value')
			.filter(this.filter)
			.map(this.map)
			.reverse(this.inverseTransform);
		}
		stream.subscriptions[stream.subscriptions.length - 1].execute(stream._value);
}});



/**
 * @constructor EventSubscription
 * @extends ValueObject
 */
var EventSubscriptionModel = function() {
//	Object.assign(this, {
		this.on = null;								// String
		this.subscribe = null;						// function CallBack
//	});
	ValueObject.apply(this, arguments);
}
EventSubscriptionModel.prototype = Object.create(ValueObject.prototype);
exportedObjects.EventSubscriptionModel = EventSubscriptionModel;
Object.defineProperty(EventSubscriptionModel.prototype, 'objectType', {value : 'EventSubscription'});
Object.defineProperty(EventSubscriptionModel.prototype, 'subscribeToEvent', {
	value : function(targetComponent, requestingComponent) {
		targetComponent.addEventListener(this.on, this.subscribe.bind(requestingComponent));
}});









/**
 * @constructor SingleLevelComponentDefModel
 * @extends ValueObject
 */
var SingleLevelComponentDefModel = function(initObj, isSpecial, givenDef) {
	if (givenDef)
		Object.assign(this, givenDef);
	else {
		this.type = null,							// String
		this.nodeName = null;						// String
		this.templateNodeName = null;				// String
		this.attributes = [];						// Array [AttributeDesc]
		this.section = null;						// Number
		this.props = [];							// Array [Prop]
		this.states = [];							// Array [State]
//		this.targetSlotIndex = null;				// Number
		this.sWrapper = null;						// Object StylesheetWrapper
		this.command = null;						// Object Command
		this.reactOnParent = [];					// Array [ReactivityQuery]
		this.reactOnSelf = [];						// Array [ReactivityQuery]
		this.subscribeOnParent = [];				// Array [EventSubscription]
		this.subscribeOnChild = [];					// Array [EventSubscription]
		this.subscribeOnSelf = [];					// Array [EventSubscription]
		this.keyboardSettings = [];					// Array [KeyboardHotkeys]
		this.keyboardEvents = [];					// Array [KeyboardListeners]
	}
	
	// shorthand to create defs with just a "type", maybe an attributesList, but only the first props in the model
	if (initObj !== 'bare')
		ValueObject.apply(this, arguments);
};
SingleLevelComponentDefModel.prototype = Object.create(ValueObject.prototype);
exportedObjects.SingleLevelComponentDefModel = SingleLevelComponentDefModel;
Object.defineProperty(SingleLevelComponentDefModel.prototype, 'objectType', {value : 'SComponentDef'});



/**
 * @constructor HierarchicalComponentDefModel
 * @extends ValueObject
 */
var HierarchicalComponentDefModel = function() {

		this.type = null;
		this.host = null;							// Object SingleLevelComponentDef
		this.subSections = [];						// Array [SingleLevelComponentDef]
		this.members = [];							// Array [SingleLevelComponentDef]
		this.lists = [];							// Array [ComponentListDef]
		this.options = null;						// Object : plain

	ValueObject.apply(this, arguments);
}
HierarchicalComponentDefModel.prototype = Object.create(ValueObject.prototype);
exportedObjects.HierarchicalComponentDefModel = HierarchicalComponentDefModel;
Object.defineProperty(HierarchicalComponentDefModel.prototype, 'objectType', {value : 'MComponentDef'});



/**
 * @constructor ComponentListDef
 * @extends ValueObject
 */
var ComponentListDefModel = function() {

		this.type = 'ComponentList';				// String
		this.reflectOnModel = true;					// Boolean
		this.augmentModel = false;					// Boolean
		this.each = null;							// Array [unknown_type] (model to iterate on)
		this.item = null;							// Object (an item of the model)
		this.template = null;						// Object HierarchicalComponentDef
		this.section = null;						// Number
		this.templateCtor = null;					// Object (some Component Type)

	ValueObject.apply(this, arguments);
}
ComponentListDefModel.prototype = Object.create(ValueObject.prototype);
exportedObjects.ComponentListDefModel = ComponentListDefModel;
Object.defineProperty(ComponentListDefModel.prototype, 'objectType', {value : 'ComponentListDef'});





/**
 * @constructor ComponentDefCache
 * 
 */
var ComponentDefCache = function() {
	this.knownIDs = {};
	this.randomUID = 0;
}
ComponentDefCache.prototype = {};
ComponentDefCache.prototype.getUID = function(uniqueID) {
	if (uniqueID in this.knownIDs)
		return this.knownIDs[uniqueID];
	else if (!(uniqueID in this.knownIDs) || !uniqueID || !uniqueID.length) {
		uniqueID = uniqueID ? uniqueID : (this.randomUID++).toString();
		this.knownIDs[uniqueID] = uniqueID;
		return this.knownIDs[uniqueID];
	}
}

ComponentDefCache.prototype.isKnownUID = function(uniqueID) {
	return this.getUID(uniqueID);
}

ComponentDefCache.prototype.setUID = function(uniqueID, globalObj) {
	return (this.knownIDs[uniqueID] = globalObj);
}






/**
 * @constructor ComponentDefModel
 * @extends ValueObject
 */
var createComponentDef = function(defObj, useCache, isSpecial) {
	var def, UID;
//	console.log(useCache);
	if (useCache) {
		UID = exportedObjects.definitionsCache.isKnownUID(useCache);
	}
	
	if (!UID || typeof UID === 'string') {
		// shorthand to create defs with just a "type", maybe an attributesList, but only the first props in the model...
		if (typeof defObj === 'string') {
			var c = new SingleLevelComponentDefModel('bare');
			ValueObject.prototype.fromArray.call(c, arguments);
			def = new HierarchicalComponentDefModel({host : c}, 'rootOnly');
		}
		if (typeof defObj === 'object' && defObj.host) {
//			console.log('HierarchicalComponentDefModel', defObj, isSpecial);
			def = new HierarchicalComponentDefModel(defObj, isSpecial);
//			console.log(def);
		}
		else if (typeof defObj === 'object' && defObj.type === 'ComponentList')
			def = new HierarchicalComponentDefModel({host : new ComponentListDefModel(defObj, isSpecial)}, 'rootOnly');
		else if (typeof defObj === 'object' && defObj.nodeName || defObj.type || (defObj.attributes || defObj.states || defObj.props)) {
			if (isSpecial !== 'hostOnly')
				def = new HierarchicalComponentDefModel({host : new SingleLevelComponentDefModel(defObj, isSpecial)}, 'rootOnly');
			else
				def = new SingleLevelComponentDefModel(defObj);
		}
	}
//	console.log(def);
	if (typeof UID === 'string')
		return exportedObjects.definitionsCache.setUID(UID, def);
	else if (typeof UID !== 'undefined')
		return UID;
	else
		return def;
};
exportedObjects.createComponentDef = createComponentDef;





/**
 * @dictionary
 */
var Dictionary = function() {
		this.attributes = {};
		this.states = {};
		this.props = {};
}
Dictionary.prototype.solveFromDictionary = function(type, key) {
		
	if (!(this[type] && this[type][key])) {
		if (!this[type]) {
			this[type] = {};
			if (!this[type][key]) {
				this[type][key] = {};
				this[type][key][key] = type === 'states' ? undefined : null;
			}
		}
	}
	
	return this[type][key];
}
var dictionary = new Dictionary();

/**
 * @finder function
 */
exportedObjects.findProp = function(name, item) {
	for(let prop in item)
		return prop === name;
}


/**
 * @aliases
 */
Object.assign(exportedObjects, {
	definitionsCache : new ComponentDefCache(),
	attributesModel : PropFactory,									// Object AbstractProp
	statesModel : PropFactory,										// Object AbstractProp
	propsModel : PropFactory,										// Object AbstractProp
	optionsModel : OptionsListModel,								// Object OptionsList
	// "host" key catch the special condition and should always be flat ("artificial" deepening of flat defs is handled in the factory function)
	hostModel : SingleLevelComponentDefModel,						// Object SingleLevelComponentDef
	// "numericaly indexed" keys (in an array) catch the HierarchicalComponentDefModel
	subSectionsModel : HierarchicalComponentDefModel,				// Array [HierarchicalComponentDefModel]
	membersModel : HierarchicalComponentDefModel,					// Array [HierarchicalComponentDefModel]
	reactOnParentModel : ReactivityQueryModel,						// Object ReactivityQueryList
	reactOnSelfModel : ReactivityQueryModel,						// Object ReactivityQueryList
	subscribeOnParentModel : EventSubscriptionModel,				// Object EventSubscriptionsList
	subscribeOnChildModel : EventSubscriptionModel,					// Object EventSubscriptionsList
	subscribeOnSelfModel : EventSubscriptionModel,					// Object EventSubscriptionsList
	createSimpleComponentDef : HierarchicalComponentDefModel		// Object HierarchicalComponentDef
});

//console.log(exportedObjects.definitionsCache);

module.exports = exportedObjects;