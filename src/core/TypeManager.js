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
		var objectType = Object.getPrototypeOf(this).objectType;

		for (let p in def) {
//			console.log(p, this[p], def[p]);
			if (isSpecial === 'rootOnly' && def[p])
				this[p] = def[p];
			else {
				const n = p + 'Model';
				if (n in exportedObjects) {
					if (Array.isArray(def[p])) {
//						this[p] = [];
						for(let i = 0, l = def[p].length; i < l; i++) {
							this[p].push(new exportedObjects[n](def[p][i], isSpecial));
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
 * @constructor AttributeModel
 * @extends ValueObject
 */
var AttributeModel = function(obj) {
//	var model;
	var key = typeof obj === 'string' ? obj : this.getName.call(obj);
//	if (model = dictionary.solveFromDictionary('attributes', key))
//		Object.assign(this, model);
	this[key] = obj[key];
}
AttributeModel.prototype = Object.create(ValueObject.prototype);
exportedObjects.AttributeModel = AttributeModel
Object.defineProperty(AttributeModel.prototype, 'objectType', {value :  'Attribute'});
Object.defineProperty(AttributeModel.prototype, 'getName', {
	value :  function() {
		for(let name in this)
			return name; 
}});
Object.defineProperty(AttributeModel.prototype, 'getValue', {
	value :  function() {
		for(let name in this)
			 return this[name]; 
}});


/**
 * @constructor StateModel
 * @extends ValueObject
 */
var StateModel = function(obj) {
//	var model;
	var key = typeof obj === 'string' ? obj : this.getName.call(obj);
//	if (model = dictionary.solveFromDictionary('states', key))
//		Object.assign(this, model);
	this[key] = obj[key];
};
StateModel.prototype = Object.create(ValueObject.prototype);
exportedObjects.StateModel = StateModel;
Object.defineProperty(StateModel.prototype, 'objectType', {value : 'States'});
Object.defineProperty(StateModel.prototype, 'getName', Object.getOwnPropertyDescriptor(AttributeModel.prototype, 'getName'));
Object.defineProperty(StateModel.prototype, 'getValue', Object.getOwnPropertyDescriptor(AttributeModel.prototype, 'getValue'));


/**
 * @constructor PropModel
 * @extends ValueObject
 */
var PropModel = function(obj) {
//	var model;
	var key = typeof obj === 'string' ? obj : this.getName.call(obj);
//	if (model = dictionary.solveFromDictionary('props', key))
//		Object.assign(this, model);
	this[key] = obj[key];
};
PropModel.prototype = Object.create(ValueObject.prototype);
exportedObjects.PropModel = PropModel;
Object.defineProperty(PropModel.prototype, 'objectType', {value : 'Props'});
Object.defineProperty(PropModel.prototype, 'getName', Object.getOwnPropertyDescriptor(AttributeModel.prototype, 'getName'));
Object.defineProperty(PropModel.prototype, 'getValue', Object.getOwnPropertyDescriptor(AttributeModel.prototype, 'getValue'));




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
		if (!stream)
			return;
		stream.subscribe(this.cbOnly ? this.subscribe.bind(queriedOrQueryingObj) : (queriedOrQueryingObj.streams[this.to] || this.subscribe.bind(queriedOrQueryingObj)), 'value')
			.filter(this.filter)
			.map(this.map)
			.reverse(this.inverseTransform);
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
		this.attributes = [];						// Array [AttributeDesc]
		this.props = [];							// Array [Prop]
		this.states = [];							// Array [State]
		this.parentNodeIndex = null;				// Number
		this.targetSlotIndex = null;				// Number
		this.sWrapper = null;						// Object StylesheetWrapper
		this.command = null;						// Object Command
		this.reactOnParent = [];					// Array [ReactivityQuery]
		this.reactOnSelf = [];						// Array [ReactivityQuery]
		this.subscribeOnParent = [];				// Array [ReactivityQuery]
		this.subscribeOnChild = [];					// Array [ReactivityQuery]
		this.keyboardSettings = [];					// Array [KeyboardHotkeys]
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
//	Object.assign(this, {
		this.host = null;							// Object SingleLevelComponentDef
		this.subSections = [];						// Array [SingleLevelComponentDef]
		this.members = [];							// Array [SingleLevelComponentDef]
		this.lists = [];							// Array [ComponentListDef]
		this.options = null;						// Object : plain
//	});
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
//	Object.assign(this, {
		this.type = 'ComponentList';					// String
		this.reflectOnModel = null;					// Boolean
		this.each = null;							// Array [unknown_type] (model to iterate on)
		this.template = null;						// Object HierarchicalComponentDef
		this.section = null;							// Number
//	});
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
		if (typeof defObj === 'object' && defObj.host)
			def = new HierarchicalComponentDefModel(defObj, isSpecial);
		if (typeof defObj === 'object' && defObj.type === 'ComponentList')
			def = new HierarchicalComponentDefModel({host : new ComponentListDefModel(defObj, isSpecial)}, 'rootOnly');
		else if (typeof defObj === 'object' && defObj.nodeName || defObj.type || (defObj.attributes || defObj.states || defObj.props))
			def = new HierarchicalComponentDefModel({host : new SingleLevelComponentDefModel(defObj, isSpecial)}, 'rootOnly');
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
	attributesModel : AttributeModel,								// Object AttributeModel
	statesModel : StateModel,										// Object StateModel
	propsModel : PropModel,											// Object PropModel
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
	createSimpleComponentDef : HierarchicalComponentDefModel		// Object HierarchicalComponentDef
});

//console.log(exportedObjects.definitionsCache);

module.exports = exportedObjects;